/**
 * Build Worker v3 - GitHub Actions Integration (FIXED VERSION)
 * 
 * KEY CHANGES FROM v2:
 * - Removed local Gradle/Xcode execution
 * - Added GitHub Actions API integration via Octokit
 * - Moved from in-memory queue to database
 * - Added proper error handling for async workflows
 * - Fixed artifact URL generation
 * 
 * This worker now acts as a DISPATCHER, not an EXECUTOR.
 * Actual builds happen in GitHub Actions runners.
 */

import { Octokit } from "@octokit/rest";
import { getDb } from "./db";
import { builds, apps } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// Constants
const POLL_INTERVAL = 10000; // 10 seconds
const MAX_RETRIES = 1;
const BUILD_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Initialize GitHub API client
const octokit = new Octokit({
  auth: process.env.MANUS_TOKEN
});

const MANUS_OWNER = process.env.MANUS_OWNER || "your-github-username";
const MANUS_REPO = process.env.MANUS_REPO || "b1-appbuilder";

// Logger
function log(buildId: string, message: string, level: "INFO" | "WARN" | "ERROR" = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [BUILD:${buildId}] [${level}] ${message}`);
}

/**
 * Start the build worker - continuously polls for pending jobs from database
 */
export async function startBuildWorker() {
  log("WORKER", "Build worker v3 started (GitHub Actions mode)");

  // Poll for pending jobs every 10 seconds
  setInterval(async () => {
    try {
      await processPendingJobs();
    } catch (error) {
      log("WORKER", `Error in job processing loop: ${error}`, "ERROR");
    }
  }, POLL_INTERVAL);
}

/**
 * Process all pending jobs from database
 */
async function processPendingJobs() {
  try {
    const db = await getDb();
    if (!db) {
      log("WORKER", "Database not available, skipping poll", "WARN");
      return;
    }

    // Get first pending build (ordered by creation date)
    const pendingBuilds = await db
      .select()
      .from(builds)
      .where(eq(builds.status, "PENDING"))
      .orderBy(builds.createdAt)
      .limit(1);

    if (pendingBuilds.length === 0) {
      return; // No pending jobs
    }

    const build = pendingBuilds[0];
    await processBuildJob(build);
  } catch (error) {
    log("WORKER", `Error processing pending jobs: ${error}`, "ERROR");
  }
}

/**
 * Process a single build job by triggering GitHub Actions
 */
async function processBuildJob(build: any) {
  const buildId = build.id;
  log(buildId, `Starting build job for app ${build.appId}`);

  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Update status to RUNNING
    await db
      .update(builds)
      .set({ 
        status: "RUNNING",
        progress: 10,
        updatedAt: new Date()
      })
      .where(eq(builds.id, buildId));

    // Get app details
    const appResults = await db
      .select()
      .from(apps)
      .where(eq(apps.id, build.appId))
      .limit(1);

    const app = appResults[0];
    if (!app) {
      throw new Error(`App ${build.appId} not found`);
    }

    log(buildId, `App found: ${app.appName}`);

    // Trigger GitHub Actions workflow(s)
    if (build.platform === "ANDROID" || build.platform === "BOTH") {
      log(buildId, "Triggering Android build workflow...");
      
      const androidWorkflow = await triggerAndroidBuild(buildId, app);
      
      // Store GitHub run ID for tracking
      await db
        .update(builds)
        .set({ 
          githubRunId: androidWorkflow.data.id.toString(),
          progress: 30,
          updatedAt: new Date()
        })
        .where(eq(builds.id, buildId));
      
      log(buildId, `Android workflow triggered: run ${androidWorkflow.data.id}`);
    }

    if (build.platform === "IOS" || build.platform === "BOTH") {
      log(buildId, "Triggering iOS build workflow...");
      
      const iosWorkflow = await triggerIosBuild(buildId, app);
      
      // Store GitHub run ID
      await db
        .update(builds)
        .set({ 
          githubRunIdIos: iosWorkflow.data.id.toString(),
          progress: 50,
          updatedAt: new Date()
        })
        .where(eq(builds.id, buildId));
      
      log(buildId, `iOS workflow triggered: run ${iosWorkflow.data.id}`);
    }

    // Update to BUILDING status
    // The actual completion will be handled by GitHub Actions webhook
    await db
      .update(builds)
      .set({ 
        status: "BUILDING",
        progress: 60,
        updatedAt: new Date()
      })
      .where(eq(builds.id, buildId));

    log(buildId, "Build workflows triggered successfully. Waiting for GitHub Actions...");

  } catch (error) {
    log(buildId, `Build failed: ${error}`, "ERROR");
    
    const db = await getDb();
    if (!db) return;

    // Check retry logic
    if (build.retries < MAX_RETRIES) {
      log(buildId, `Retrying build (attempt ${build.retries + 1}/${MAX_RETRIES})...`);
      
      await db
        .update(builds)
        .set({ 
          status: "PENDING",
          retries: build.retries + 1,
          progress: 0,
          updatedAt: new Date()
        })
        .where(eq(builds.id, buildId));
    } else {
      // Mark as failed
      await db
        .update(builds)
        .set({ 
          status: "FAILED",
          error: String(error),
          updatedAt: new Date()
        })
        .where(eq(builds.id, buildId));
    }
  }
}

/**
 * Trigger Android build workflow in GitHub Actions
 */
async function triggerAndroidBuild(buildId: string, app: any) {
  try {
    const packageName = `com.b1appbuilder.${app.appName.replace(/\s+/g, "").toLowerCase()}`;
    
    const workflow = await octokit.rest.actions.createWorkflowDispatch({
      owner: MANUS_OWNER,
      repo: MANUS_REPO,
      workflow_id: "build-android.yml",
      ref: "main",
      inputs: {
        buildId: buildId,
        appId: app.id.toString(),
        appName: app.appName,
        websiteUrl: app.websiteUrl,
        primaryColor: app.primaryColor || "#00A86B",
        secondaryColor: app.secondaryColor || "#008556",
        iconUrl: app.iconUrl || "",
        splashScreenUrl: app.splashScreenUrl || ""
      }
    });

    log(buildId, `Android workflow dispatch successful`);
    return workflow;
  } catch (error) {
    log(buildId, `Failed to trigger Android workflow: ${error}`, "ERROR");
    throw new Error(`Android workflow trigger failed: ${error}`);
  }
}

/**
 * Trigger iOS build workflow in GitHub Actions
 */
async function triggerIosBuild(buildId: string, app: any) {
  try {
    const bundleId = `com.b1appbuilder.${app.appName.replace(/\s+/g, "").toLowerCase()}`;
    
    const workflow = await octokit.rest.actions.createWorkflowDispatch({
      owner: MANUS_OWNER,
      repo: MANUS_REPO,
      workflow_id: "build-ios.yml",
      ref: "main",
      inputs: {
        buildId: buildId,
        appId: app.id.toString(),
        appName: app.appName,
        websiteUrl: app.websiteUrl,
        primaryColor: app.primaryColor || "#00A86B",
        secondaryColor: app.secondaryColor || "#008556",
        iconUrl: app.iconUrl || "",
        splashScreenUrl: app.splashScreenUrl || ""
      }
    });

    log(buildId, `iOS workflow dispatch successful`);
    return workflow;
  } catch (error) {
    log(buildId, `Failed to trigger iOS workflow: ${error}`, "ERROR");
    throw new Error(`iOS workflow trigger failed: ${error}`);
  }
}

/**
 * Get build status from database
 */
export async function getBuildStatus(buildId: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(builds)
    .where(eq(builds.id, buildId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get build history for an app
 */
export async function getBuildHistory(appId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const history = await db
    .select()
    .from(builds)
    .where(eq(builds.appId, appId))
    .orderBy(desc(builds.createdAt))
    .limit(limit);

  return history;
}

/**
 * Start a new build job (called by tRPC)
 */
export async function startBuildJob(params: {
  appId: number;
  userId: number;
  platform: "ANDROID" | "IOS" | "BOTH";
}): Promise<string> {
  const buildId = `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(builds).values({
    id: buildId,
    appId: params.appId,
    userId: params.userId,
    platform: params.platform,
    status: "PENDING",
    progress: 0,
    retries: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  log(buildId, `Build job created for app ${params.appId}`);
  return buildId;
}

/**
 * Cancel a build job
 */
export async function cancelBuildJob(buildId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const result = await db
    .update(builds)
    .set({ 
      status: "FAILED",
      error: "Cancelled by user",
      updatedAt: new Date()
    })
    .where(eq(builds.id, buildId));

  log(buildId, "Build job cancelled");
  return true;
}

/**
 * Mark build as completed (called by GitHub Actions webhook)
 */
export async function completeBuild(params: {
  buildId: string;
  platform: "ANDROID" | "IOS";
  downloadUrl: string;
  githubRunId?: string;
}): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { buildId, platform, downloadUrl, githubRunId } = params;

  // Get current build
  const currentBuild = await getBuildStatus(buildId);
  if (!currentBuild) {
    log(buildId, `Build not found for completion`, "ERROR");
    return false;
  }

  // Update with download URL
  const updateData: any = {
    updatedAt: new Date()
  };

  if (platform === "ANDROID") {
    updateData.androidUrl = downloadUrl;
    updateData.progress = 100;
    
    // If this was Android-only build, mark as completed
    if (currentBuild.platform === "ANDROID") {
      updateData.status = "COMPLETED";
    }
  }

  if (platform === "IOS") {
    updateData.iosUrl = downloadUrl;
    updateData.progress = 100;
    
    // If this was iOS-only build, mark as completed
    if (currentBuild.platform === "IOS") {
      updateData.status = "COMPLETED";
    }
  }

  // For BOTH platform, mark as completed only when both are done
  if (currentBuild.platform === "BOTH") {
    if (platform === "ANDROID" && currentBuild.iosUrl) {
      updateData.status = "COMPLETED";
    } else if (platform === "IOS" && currentBuild.androidUrl) {
      updateData.status = "COMPLETED";
    }
  }

  await db
    .update(builds)
    .set(updateData)
    .where(eq(builds.id, buildId));

  log(buildId, `Build completed for ${platform}: ${downloadUrl}`);
  return true;
}

/**
 * Mark build as failed (called by GitHub Actions webhook)
 */
export async function failBuild(buildId: string, error: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  await db
    .update(builds)
    .set({ 
      status: "FAILED",
      error: error,
      updatedAt: new Date()
    })
    .where(eq(builds.id, buildId));

  log(buildId, `Build marked as failed: ${error}`, "ERROR");
  return true;
}
