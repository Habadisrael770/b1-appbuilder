/**
 * HTTP Endpoints for Builds API
 * 
 * Provides REST endpoints for:
 * - Starting builds
 * - Checking build status
 * - Downloading completed builds
 * 
 * These endpoints are used for:
 * - Direct API calls (curl, Postman, etc.)
 * - Frontend integration
 * - QA/testing
 */

import express from "express";
import { z } from "zod";
import { startBuildJob, getBuildStatus } from "../buildWorker_v3";

export function registerBuildHttpEndpoints(app: express.Express) {
  /**
   * POST /api/builds/start
   * ----------------------
   * Start a new build job
   * 
   * Body: { appId, userId, platform }
   * Response: { buildId, status, estimatedTime, message }
   */
  app.post("/api/builds/start", async (req, res) => {
    try {
      const schema = z.object({
        appId: z.number().int().positive(),
        userId: z.number().int().positive(),
        platform: z.enum(["ANDROID", "IOS", "BOTH"]).default("ANDROID"),
      });

      const input = schema.parse(req.body);
      const buildId = await startBuildJob(input);

      res.json({
        buildId,
        status: "PENDING",
        estimatedTime: 300, // 5 minutes
        message: "Build started. This usually takes 5-10 minutes."
      });
    } catch (err: any) {
      console.error("POST /api/builds/start error:", err);
      res.status(400).json({
        error: err.message || "Failed to start build"
      });
    }
  });

  /**
   * GET /api/builds/status?buildId=xxx
   * -----------------------------------
   * Get build status and progress
   * 
   * Query: buildId (required)
   * Response: { status, progress, androidUrl, iosUrl, error, createdAt, updatedAt, completedAt }
   */
  app.get("/api/builds/status", async (req, res) => {
    try {
      const buildId = String(req.query.buildId || "").trim();
      if (!buildId) {
        return res.status(400).json({ error: "buildId query parameter required" });
      }

      const build = await getBuildStatus(buildId);
      if (!build) {
        return res.status(404).json({ error: "Build not found" });
      }

      res.json({
        id: build.id,
        status: build.status,
        progress: build.progress || 0,
        platform: build.platform,
        androidUrl: build.androidUrl || null,
        iosUrl: build.iosUrl || null,
        error: build.error || null,
        createdAt: build.createdAt,
        updatedAt: build.updatedAt,
        completedAt: build.completedAt || null
      });
    } catch (err: any) {
      console.error("GET /api/builds/status error:", err);
      res.status(500).json({ error: err.message || "Failed to get build status" });
    }
  });

  /**
   * GET /api/builds/download?buildId=xxx&platform=ANDROID
   * -------------------------------------------------------
   * Download completed build
   * 
   * Query: buildId (required), platform (optional, default: ANDROID)
   * Response: Redirects to GitHub Actions artifact URL
   */
  app.get("/api/builds/download", async (req, res) => {
    try {
      const buildId = String(req.query.buildId || "").trim();
      const platform = String(req.query.platform || "ANDROID").toUpperCase();

      if (!buildId) {
        return res.status(400).json({ error: "buildId query parameter required" });
      }

      const build = await getBuildStatus(buildId);
      if (!build) {
        return res.status(404).json({ error: "Build not found" });
      }

      // Check if build is completed
      if (build.status !== "COMPLETED") {
        return res.status(400).json({
          error: `Build is not ready yet. Current status: ${build.status}`,
          progress: build.progress || 0
        });
      }

      // Get the appropriate URL
      let downloadUrl: string | null = null;
      if (platform === "ANDROID") {
        downloadUrl = build.androidUrl || null;
      } else if (platform === "IOS") {
        downloadUrl = build.iosUrl || null;
      } else {
        return res.status(400).json({ error: "Invalid platform. Must be ANDROID or IOS" });
      }

      if (!downloadUrl) {
        return res.status(404).json({
          error: `${platform} build not available`
        });
      }

      // Production: redirect to GitHub Actions artifact URL
      res.redirect(downloadUrl);
    } catch (err: any) {
      console.error("GET /api/builds/download error:", err);
      res.status(500).json({ error: err.message || "Failed to download build" });
    }
  });

  /**
   * GET /api/builds/health
   * ----------------------
   * Health check endpoint
   */
  app.get("/api/builds/health", (req, res) => {
    res.json({ status: "ok", message: "Builds API is running" });
  });
}
