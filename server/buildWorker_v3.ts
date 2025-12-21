/**
 * Build Worker v3 - GitHub Actions Integration (PRODUCTION HARDENED)
 *
 * Production fixes included (no-MVP):
 * 1) Atomic job claiming (prevents double-dispatch / race conditions)
 * 2) Timeout enforcement (no "stuck BUILDING forever")
 * 3) Recovery for "RUNNING" limbo state
 * 4) Interval overlap guards (prevents concurrent loops piling up)
 * 5) Safer status transitions + consistent error recording
 *
 * NOTE:
 * - This code assumes `builds` table has at least:
 *   id, appId, userId, platform, status, progress, retries, createdAt, updatedAt,
 *   githubRunId, completedAt, error, androidUrl, iosUrl
 */

import { getDb } from "./db";
import { builds, apps } from "../drizzle/schema";
import { eq, and, desc, inArray, lt } from "drizzle-orm";
import {
  triggerAndroidBuild,
  getWorkflowRunStatus,
  getBuildArtifactUrl,
} from "./_core/github";

// ---- Constants (Production) ----
const PENDING_POLL_INTERVAL_MS = 15_000; // poll DB for pending jobs
const BUILDING_POLL_INTERVAL_MS = 20_000; // poll DB for building jobs
const BUILD_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_RETRIES = 1;

// Progress (coarse but consistent)
const PROGRESS = {
  CLAIMED: 5,
  DISPATCHED: 25,
  BUILDING_QUEUED: 35,
  BUILDING_IN_PROGRESS: 65,
  COMPLETED: 100,
};

// ---- Logger ----
function log(buildId: string, message: string, level: "INFO" | "WARN" | "ERROR" = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [BUILD:${buildId}] [${level}] ${message}`);
}

// ---- Interval overlap guards (Production) ----
let pendingLoopRunning = false;
let buildingLoopRunning = false;

/**
 * Start the build worker (dispatcher + poller)
 */
export async function startBuildWorker() {
  log("WORKER", "Build worker v3 started (Production hardened)");

  setInterval(async () => {
    if (pendingLoopRunning) return;
    pendingLoopRunning = true;
    try {
      await processPendingJobs();
    } catch (error) {
      log("WORKER", `Error in pending jobs loop: ${String(error)}`, "ERROR");
    } finally {
      pendingLoopRunning = false;
    }
  }, PENDING_POLL_INTERVAL_MS);

  setInterval(async () => {
    if (buildingLoopRunning) return;
    buildingLoopRunning = true;
    try {
      await checkBuildingJobs();
      await recoverStuckRunningJobs();
      await timeoutOldBuildingJobs();
    } catch (error) {
      log("WORKER", `Error in building jobs loop: ${String(error)}`, "ERROR");
    } finally {
      buildingLoopRunning = false;
    }
  }, BUILDING_POLL_INTERVAL_MS);
}

/**
 * Process pending jobs from database
 * Production: atomic claim prevents double dispatch.
 */
async function processPendingJobs() {
  const db = await getDb();
  if (!db) {
    log("WORKER", "Database not available, skipping pending jobs poll", "WARN");
    return;
  }

  // Pick one candidate PENDING build id
  const candidates = await db
    .select({ id: builds.id })
    .from(builds)
    .where(eq(builds.status, "PENDING"))
    .orderBy(builds.createdAt)
    .limit(1);

  if (candidates.length === 0) return;

  const buildId = candidates[0].id;

  // Atomic claim: transition PENDING -> RUNNING only if still PENDING
  const claimResult = await db
    .update(builds)
    .set({
      status: "RUNNING",
      progress: PROGRESS.CLAIMED,
      updatedAt: new Date(),
    })
    .where(and(eq(builds.id, buildId), eq(builds.status, "PENDING")));

  // Drizzle update result shape can vary by driver; treat falsy/0 as not-claimed
  const claimed =
    // @ts-expect-error driver dependent
    typeof claimResult?.rowsAffected === "number" ? claimResult.rowsAffected === 1 :
    // @ts-expect-error driver dependent
    typeof claimResult?.count === "number" ? claimResult.count === 1 :
    // Fallback: assume success if no error (least preferred)
    true;

  if (!claimed) {
    log(buildId, "Pending job was claimed by another worker, skipping", "WARN");
    return;
  }

  // Load the build row we just claimed
  const rows = await db.select().from(builds).where(eq(builds.id, buildId)).limit(1);
  const build = rows[0];
  if (!build) return;

  await processBuildJob(build);
}

/**
 * Check status of building jobs (BUILDING + RUNNING with runId)
 */
async function checkBuildingJobs() {
  const db = await getDb();
  if (!db) return;

  // Consider BUILDING and RUNNING (RUNNING might happen if worker crashed after dispatch)
  const jobs = await db
    .select()
    .from(builds)
    .where(
      inArray(builds.status, ["BUILDING", "RUNNING"] as any)
    )
    .limit(20);

  for (const build of jobs) {
    // Only poll if we have a GitHub run id
    if (build.githubRunId) {
      await checkBuildStatus(build);
    }
  }
}

/**
 * Timeout enforcement: any BUILDING/RUNNING job older than BUILD_TIMEOUT_MS fails.
 * Uses createdAt as baseline (safe). If you have a startedAt column, use that instead.
 */
async function timeoutOldBuildingJobs() {
  const db = await getDb();
  if (!db) return;

  const cutoff = new Date(Date.now() - BUILD_TIMEOUT_MS);

  // If createdAt < cutoff AND status in BUILDING/RUNNING => FAIL
  const timedOut = await db
    .select({ id: builds.id, githubRunId: builds.githubRunId })
    .from(builds)
    .where(
      and(
        inArray(builds.status, ["BUILDING", "RUNNING"] as any),
        lt(builds.createdAt as any, cutoff as any)
      )
    )
    .limit(50);

  for (const row of timedOut) {
    log(row.id, `Build timed out after ${BUILD_TIMEOUT_MS / 60000}m. Marking FAILED.`, "ERROR");
    await db
      .update(builds)
      .set({
        status: "FAILED",
        error: `Build timeout after ${BUILD_TIMEOUT_MS / 60000} minutes (runId=${row.githubRunId ?? "none"})`,
        updatedAt: new Date(),
      })
      .where(eq(builds.id, row.id));
  }
}

/**
 * Recovery for RUNNING limbo: if RUNNING with no githubRunId for too long, revert or fail.
 * This prevents jobs stuck in RUNNING due to mid-flight crashes.
 */
async function recoverStuckRunningJobs() {
  const db = await getDb();
  if (!db) return;

  const cutoff = new Date(Date.now() - 2 * PENDING_POLL_INTERVAL_MS); // ~30s by default

  const stuck = await db
    .select()
    .from(builds)
    .where(
      and(
        eq(builds.status, "RUNNING" as any),
        // No githubRunId means dispatch didn't complete
        eq(builds.githubRunId, null as any),
        lt(builds.updatedAt as any, cutoff as any)
      )
    )
    .limit(20);

  for (const b of stuck) {
    const retries = typeof b.retries === "number" ? b.retries : 0;
    if (retries < MAX_RETRIES) {
      log(b.id, "RUNNING without runId detected. Re-queueing to PENDING for retry.", "WARN");
      await db
        .update(builds)
        .set({
          status: "PENDING",
          retries: retries + 1,
          progress: 0,
          error: "Recovered from RUNNING without githubRunId (worker restart/interrupt)",
          updatedAt: new Date(),
        })
        .where(eq(builds.id, b.id));
    } else {
      log(b.id, "RUNNING without runId detected. Retries exhausted; failing.", "ERROR");
      await db
        .update(builds)
        .set({
          status: "FAILED",
          error: "Build dispatch did not complete (no githubRunId) and retries exhausted",
          updatedAt: new Date(),
        })
        .where(eq(builds.id, b.id));
    }
  }
}

/**
 * Poll a single job via GitHub Actions runId
 */
async function checkBuildStatus(build: any) {
  const buildId = build.id;

  const db = await getDb();
  if (!db) {
    log(buildId, "Database connection failed while checking status", "ERROR");
    return;
  }

  const runId = Number(build.githubRunId);
  if (!Number.isFinite(runId)) {
    log(buildId, `Invalid githubRunId: ${String(build.githubRunId)}`, "ERROR");
    await db
      .update(builds)
      .set({
        status: "FAILED",
        error: `Invalid githubRunId: ${String(build.githubRunId)}`,
        updatedAt: new Date(),
      })
      .where(eq(builds.id, buildId));
    return;
  }

  try {
    log(buildId, `Polling GitHub run ${runId}...`);
    const workflowRun = await getWorkflowRunStatus(runId);

    if (!workflowRun) {
      log(buildId, `GitHub run ${runId} not found / not readable yet`, "WARN");
      return;
    }

    const ghStatus = workflowRun.status; // queued | in_progress | completed
    const conclusion = workflowRun.conclusion; // success | failure | cancelled | ...

    log(buildId, `GitHub status=${ghStatus}, conclusion=${conclusion ?? "n/a"}`);

    if (ghStatus !== "completed") {
      const progress = ghStatus === "queued" ? PROGRESS.BUILDING_QUEUED : PROGRESS.BUILDING_IN_PROGRESS;
      await db
        .update(builds)
        .set({ status: "BUILDING", progress, updatedAt: new Date() })
        .where(eq(builds.id, buildId));
      return;
    }

    // completed:
    if (conclusion === "success") {
      const artifactUrl = await getBuildArtifactUrl(runId);

      if (!artifactUrl) {
        // Production: success without artifact is a failure (otherwise UI will hang)
        log(buildId, "GitHub run succeeded but artifact URL was not found. Marking FAILED.", "ERROR");
        await db
          .update(builds)
          .set({
            status: "FAILED",
            error: `GitHub run ${runId} succeeded but artifact URL missing`,
            updatedAt: new Date(),
          })
          .where(eq(builds.id, buildId));
        return;
      }

      await db
        .update(builds)
        .set({
          status: "COMPLETED",
          androidUrl: artifactUrl,
          progress: PROGRESS.COMPLETED,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(builds.id, buildId));

      log(buildId, `COMPLETED. Artifact URL saved.`);
      return;
    }

    // failure / cancelled / other conclusions
    const err =
      conclusion === "cancelled"
        ? `GitHub Actions cancelled (runId=${runId})`
        : `GitHub Actions failed (conclusion=${conclusion ?? "unknown"}, runId=${runId})`;

    log(buildId, err, "ERROR");

    await db
      .update(builds)
      .set({
        status: "FAILED",
        error: err,
        updatedAt: new Date(),
      })
      .where(eq(builds.id, buildId));
  } catch (error) {
    log(buildId, `Error polling GitHub run: ${String(error)}`, "ERROR");
    // Do not fail immediately on transient GH API errors; next poll may succeed.
  }
}

/**
 * Dispatch a build job by triggering GitHub Actions.
 * Production: RUNNING was set atomically before calling this.
 */
async function processBuildJob(build: any) {
  const buildId = build.id;
  log(buildId, `Dispatching build for appId=${build.appId}, platform=${build.platform}`);

  const db = await getDb();
  if (!db) {
    log(buildId, "Database connection failed during dispatch", "ERROR");
    return;
  }

  try {
    // Load app details
    const appResults = await db.select().from(apps).where(eq(apps.id, build.appId)).limit(1);
    const app = appResults[0];
    if (!app) throw new Error(`App ${build.appId} not found`);

    // Only Android for now
    if (build.platform !== "ANDROID" && build.platform !== "BOTH") {
      throw new Error(`Unsupported platform for this worker: ${build.platform}`);
    }

    // Dispatch
    await db
      .update(builds)
      .set({ progress: PROGRESS.DISPATCHED, updatedAt: new Date() })
      .where(eq(builds.id, buildId));

    const result = await triggerAndroidBuild({
      buildId: buildId,
      appId: String(app.id),
      appName: app.appName,
      websiteUrl: app.websiteUrl,
      primaryColor: app.primaryColor || "#00A86B",
      secondaryColor: app.secondaryColor || "#008556",
      iconUrl: app.iconUrl || "",
      splashScreenUrl: app.splashScreenUrl || "",
    });

    if (!result?.success || !result.runId) {
      throw new Error(result?.error || "Failed to trigger Android build");
    }

    // Persist runId + transition to BUILDING
    await db
      .update(builds)
      .set({
        githubRunId: String(result.runId),
        status: "BUILDING",
        progress: PROGRESS.BUILDING_QUEUED,
        updatedAt: new Date(),
      })
      .where(eq(builds.id, buildId));

    log(buildId, `Dispatched GitHub runId=${result.runId}. Now BUILDING.`);
  } catch (error) {
    const retries = typeof build.retries === "number" ? build.retries : 0;
    const msg = String(error);

    log(buildId, `Dispatch failed: ${msg}`, "ERROR");

    if (retries < MAX_RETRIES) {
      await db
        .update(builds)
        .set({
          status: "PENDING",
          retries: retries + 1,
          progress: 0,
          error: `Dispatch retry scheduled: ${msg}`,
          updatedAt: new Date(),
        })
        .where(eq(builds.id, buildId));
      log(buildId, `Re-queued to PENDING (retry ${retries + 1}/${MAX_RETRIES}).`, "WARN");
    } else {
      await db
        .update(builds)
        .set({
          status: "FAILED",
          error: `Dispatch failed and retries exhausted: ${msg}`,
          updatedAt: new Date(),
        })
        .where(eq(builds.id, buildId));
      log(buildId, "FAILED (retries exhausted).", "ERROR");
    }
  }
}

/**
 * Public helpers (used by router)
 */
export async function getBuildStatus(buildId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(builds).where(eq(builds.id, buildId)).limit(1);
  return result[0] || null;
}

export async function getBuildHistory(appId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(builds)
    .where(eq(builds.appId, appId))
    .orderBy(desc(builds.createdAt))
    .limit(limit);
}

export async function startBuildJob(params: {
  appId: number;
  userId: number;
  platform: "ANDROID" | "IOS" | "BOTH";
}): Promise<string> {
  const buildId = `build_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(builds).values({
    id: buildId,
    appId: params.appId,
    userId: params.userId,
    platform: params.platform,
    status: "PENDING",
    progress: 0,
    retries: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  log(buildId, `Created build job for appId=${params.appId}, platform=${params.platform}`);
  return buildId;
}

export async function cancelBuildJob(buildId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(builds)
    .set({
      status: "FAILED",
      error: "Cancelled by user",
      updatedAt: new Date(),
    })
    .where(eq(builds.id, buildId));

  log(buildId, "Cancelled by user");
  return true;
}

/**
 * Legacy compatibility (kept, but not used by GitHub polling path)
 */
export async function completeBuild(params: {
  buildId: string;
  platform: "ANDROID" | "IOS";
  downloadUrl: string;
  githubRunId?: string;
}): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { buildId, platform, downloadUrl } = params;
  const current = await getBuildStatus(buildId);
  if (!current) return false;

  const updateData: any = { updatedAt: new Date(), progress: PROGRESS.COMPLETED };

  if (platform === "ANDROID") {
    updateData.androidUrl = downloadUrl;
    if (current.platform === "ANDROID") updateData.status = "COMPLETED";
  }

  if (platform === "IOS") {
    updateData.iosUrl = downloadUrl;
    if (current.platform === "IOS") updateData.status = "COMPLETED";
  }

  if (current.platform === "BOTH") {
    if (platform === "ANDROID" && current.iosUrl) updateData.status = "COMPLETED";
    if (platform === "IOS" && current.androidUrl) updateData.status = "COMPLETED";
  }

  await db.update(builds).set(updateData).where(eq(builds.id, buildId));
  return true;
}

export async function failBuild(buildId: string, error: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(builds)
    .set({
      status: "FAILED",
      error,
      updatedAt: new Date(),
    })
    .where(eq(builds.id, buildId));

  return true;
}