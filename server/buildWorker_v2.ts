import { getDb } from "./db";
import { apps } from "../drizzle/schema";
import { eq } from "drizzle-orm";
const POLL_INTERVAL = 5000;

export interface BuildJob {
  id: string; appId: string; userId: string; platform: "ANDROID" | "IOS" | "BOTH";
  status: "PENDING" | "BUILDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  progress: number; retries: number; createdAt: Date; updatedAt: Date;
  error?: string; androidUrl?: string; iosUrl?: string;
}
const buildQueue: Map<string, BuildJob> = new Map();

export async function startBuildWorker() {
  console.log("WORKER: Orchestrator Started");
  setInterval(() => processPendingJobs().catch(console.error), POLL_INTERVAL);
}
async function processPendingJobs() {
  let pendingJob: BuildJob | null = null;
  for (const [, job] of Array.from(buildQueue.entries())) { if (job.status === "PENDING") { pendingJob = job; break; } }
  if (pendingJob) processBuildJob(pendingJob).catch(err => console.error(pendingJob!.id, err));
}
async function processBuildJob(job: BuildJob) {
  try {
    await updateJobState(job.id, { status: "BUILDING", progress: 10 });
    // In production: await triggerGitHubWorkflow(job);
    console.log(job.id, "Triggered CI/CD, waiting for callback...");
  } catch (error: any) {
    await updateJobState(job.id, { status: "FAILED", error: String(error) });
  }
}
export async function updateJobState(id: string, updates: Partial<BuildJob>) {
  const job = buildQueue.get(id);
  if (!job || (job.status === "CANCELLED" && updates.status !== "CANCELLED")) return;
  Object.assign(job, { ...updates, updatedAt: new Date() });
  buildQueue.set(id, job);
  try {
    const db = await getDb();
    if (db) {
      const dbUpdates: any = { updatedAt: new Date() };
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.androidUrl) dbUpdates.androidPackageUrl = updates.androidUrl;
      if (updates.iosUrl) dbUpdates.iosPackageUrl = updates.iosUrl;
      if (updates.status === "CANCELLED") dbUpdates.status = "FAILED";
      await db.update(apps).set(dbUpdates).where(eq(apps.id, parseInt(job.appId)));
    }
  } catch (e) { console.error("DB Sync failed", e); }
}
export async function startBuildJob(appId: string, userId: string, platform: "ANDROID" | "IOS" | "BOTH"): Promise<string> {
  const buildId = `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  buildQueue.set(buildId, { id: buildId, appId, userId, platform, status: "PENDING", progress: 0, retries: 0, createdAt: new Date(), updatedAt: new Date() });
  return buildId;
}
export async function getBuildJobStatus(buildId: string) {
  const job = buildQueue.get(buildId);
  if (!job) return { status: "NOT_FOUND", progress: 0, error: "Job not found" };
  return { status: job.status, progress: job.progress, error: job.error, result: { androidUrl: job.androidUrl, iosUrl: job.iosUrl } };
}
export async function cancelBuildJob(buildId: string): Promise<boolean> {
  await updateJobState(buildId, { status: "CANCELLED", error: "Cancelled by user" });
  return true;
}
export async function getBuildHistory(appId: string) {
  return Array.from(buildQueue.values()).filter(j => j.appId === appId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}