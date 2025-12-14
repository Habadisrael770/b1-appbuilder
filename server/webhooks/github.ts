/**
 * GitHub Actions Webhook Handler - NEW FILE
 * 
 * This endpoint receives notifications from GitHub Actions workflows
 * when builds complete or fail.
 * 
 * Setup Instructions:
 * 1. Add this to your Express app in server/index.ts
 * 2. Set BACK_API in .env
 * 3. Set BACK_API in GitHub Secrets
 * 4. GitHub Actions will call this endpoint after each build
 */

import { Router } from "express";
import { completeBuild, failBuild } from "../buildWorker_v3";
import { getDb } from "../db";
import { apps, builds } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const githubWebhookRouter = Router();

/**
 * Middleware: Verify API key from GitHub Actions
 */
function verifyApiKey(req: any, res: any, next: any): void {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: "Missing API key",
      message: "X-API-Key header is required" 
    });
  }
  
  if (apiKey !== process.env.BACK_API) {
    return res.status(401).json({ 
      error: "Invalid API key",
      message: "The provided API key is not valid" 
    });
  }
  
  next();
}

/**
 * POST /api/builds/complete
 * Called by GitHub Actions when a build completes successfully
 * 
 * Request body:
 * {
 *   "buildId": "build_123_abc",
 *   "platform": "ANDROID" | "IOS",
 *   "downloadUrl": "https://github.com/.../artifacts/123",
 *   "githubRunId": "1234567890"
 * }
 */
githubWebhookRouter.post('/api/builds/complete', verifyApiKey, async (req, res) => {
  try {
    const { buildId, platform, downloadUrl, githubRunId } = req.body;

    // Validate required fields
    if (!buildId || !platform || !downloadUrl) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "buildId, platform, and downloadUrl are required"
      });
    }

    // Validate platform
    if (platform !== "ANDROID" && platform !== "IOS") {
      return res.status(400).json({
        error: "Invalid platform",
        message: "platform must be ANDROID or IOS"
      });
    }

    console.log(`[WEBHOOK] Build completion received: ${buildId} (${platform})`);

    // Mark build as completed
    const success = await completeBuild({
      buildId,
      platform,
      downloadUrl,
      githubRunId
    });

    if (!success) {
      return res.status(404).json({
        error: "Build not found",
        message: `Build ${buildId} not found in database`
      });
    }

    // Update app status to COMPLETED
    const db = await getDb();
    if (db) {
      const buildRows = await db
        .select()
        .from(builds)
        .where(eq(builds.id, buildId))
        .limit(1);
      
      const build = buildRows[0];

      if (build) {
        await db
          .update(apps)
          .set({ 
            status: "COMPLETED",
            updatedAt: new Date()
          })
          .where(eq(apps.id, build.appId));
      }
    }

    console.log(`[WEBHOOK] Build ${buildId} marked as completed`);

    res.json({
      success: true,
      message: "Build completion recorded successfully",
      buildId,
      platform
    });

  } catch (error) {
    console.error("[WEBHOOK] Error processing build completion:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process build completion"
    });
  }
});

/**
 * POST /api/builds/fail
 * Called by GitHub Actions when a build fails
 * 
 * Request body:
 * {
 *   "buildId": "build_123_abc",
 *   "platform": "ANDROID" | "IOS",
 *   "error": "Error message from GitHub Actions"
 * }
 */
githubWebhookRouter.post('/api/builds/fail', verifyApiKey, async (req, res) => {
  try {
    const { buildId, platform, error } = req.body;

    // Validate required fields
    if (!buildId || !error) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "buildId and error are required"
      });
    }

    console.log(`[WEBHOOK] Build failure received: ${buildId} - ${error}`);

    // Mark build as failed
    const success = await failBuild(buildId, error);

    if (!success) {
      return res.status(404).json({
        error: "Build not found",
        message: `Build ${buildId} not found in database`
      });
    }

    // Update app status to FAILED
    const db = await getDb();
    if (db) {
      const buildRows = await db
        .select()
        .from(builds)
        .where(eq(builds.id, buildId))
        .limit(1);
      
      const build = buildRows[0];

      if (build) {
        await db
          .update(apps)
          .set({ 
            status: "FAILED",
            updatedAt: new Date()
          })
          .where(eq(apps.id, build.appId));
      }
    }

    console.log(`[WEBHOOK] Build ${buildId} marked as failed`);

    res.json({
      success: true,
      message: "Build failure recorded successfully",
      buildId,
      error
    });

  } catch (error) {
    console.error("[WEBHOOK] Error processing build failure:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process build failure"
    });
  }
});

/**
 * GET /api/builds/health
 * Health check endpoint (no auth required)
 */
githubWebhookRouter.get('/api/builds/health', (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "B1 AppBuilder Build Webhook"
  });
});

export default githubWebhookRouter;
