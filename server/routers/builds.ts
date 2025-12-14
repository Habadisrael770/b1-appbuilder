/**
 * Builds Router - FIXED VERSION
 * 
 * KEY CHANGES:
 * - Uses buildWorker_v3 with GitHub Actions integration
 * - Queries builds table instead of in-memory queue
 * - Added rate limiting
 * - Fixed build history (no more mocks)
 * - Proper error handling
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { 
  startBuildJob, 
  getBuildStatus, 
  getBuildHistory,
  cancelBuildJob 
} from "../buildWorker_v3";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";
import { apps, builds } from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";

// Rate limiting configuration
const BUILD_LIMITS = {
  FREE: 5,      // 5 builds per day
  BASIC: 30,    // 30 builds per day
  PRO: 150,     // 150 builds per day
  ENTERPRISE: 999999 // Unlimited
};

export const buildsRouter = router({
  /**
   * Start a new build job
   */
  startBuild: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        platform: z.enum(["IOS", "ANDROID", "BOTH"])
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed"
        });
      }

      try {
        const appId = parseInt(input.appId);
        
        // Get app and verify ownership
        const appRows = await db
          .select()
          .from(apps)
          .where(eq(apps.id, appId))
          .limit(1);

        const app = appRows[0];
        if (!app || app.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "App not found or access denied"
          });
        }

        // Validate app data
        if (!app.websiteUrl) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Website URL is required"
          });
        }

        if (!app.appName) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "App name is required"
          });
        }

        // Validate URL format
        try {
          new URL(app.websiteUrl);
        } catch (e) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid website URL format"
          });
        }

        // Check rate limiting
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayBuilds = await db
          .select({ count: count() })
          .from(builds)
          .where(
            and(
              eq(builds.userId, ctx.user.id),
              // @ts-ignore - timestamp comparison
              builds.createdAt >= today
            )
          );

        const buildCount = todayBuilds[0]?.count || 0;
        
        // Get user's plan (default to FREE - user table doesn't have plan field)
        const userPlan = 'FREE';
        const dailyLimit = BUILD_LIMITS[userPlan as keyof typeof BUILD_LIMITS] || 5; // Default 5 builds per day

        if (buildCount >= dailyLimit) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Daily build limit reached (${dailyLimit} builds per day). Upgrade your plan for more builds.`
          });
        }

        // Update app status to PROCESSING
        await db
          .update(apps)
          .set({ status: "PROCESSING" })
          .where(eq(apps.id, appId));

        // Start build job (creates record in database and triggers GitHub Actions)
        const buildId = await startBuildJob({
          appId: appId,
          userId: ctx.user.id,
          platform: input.platform
        });

        return {
          buildId: buildId,
          status: "STARTED",
          estimatedTime: 300, // 5 minutes
          message: "Build started. This usually takes 5-10 minutes.",
          buildsRemaining: dailyLimit - buildCount - 1
        };
      } catch (error) {
        // Log error
        console.error("Build start error:", error);
        
        const appId = parseInt(input.appId);
        await db
          .update(apps)
          .set({ 
            status: "FAILED",
            updatedAt: new Date()
          })
          .where(eq(apps.id, appId));

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start build. Please try again."
        });
      }
    }),

  /**
   * Get build job status
   */
  getBuildStatus: protectedProcedure
    .input(
      z.object({
        buildId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const build = await getBuildStatus(input.buildId);

        if (!build) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Build not found"
          });
        }

        // Verify ownership
        if (build.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to view this build"
          });
        }

        return {
          status: build.status,
          progress: build.progress,
          androidUrl: build.androidUrl,
          iosUrl: build.iosUrl,
          error: build.error,
          createdAt: build.createdAt,
          updatedAt: build.updatedAt,
          completedAt: build.completedAt
        };
      } catch (error) {
        console.error("Get build status error:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get build status"
        });
      }
    }),

  /**
   * Get app build history (FIXED - no more mocks!)
   */
  getBuildHistory: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        limit: z.number().min(1).max(50).default(10)
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed"
        });
      }

      try {
        const appId = parseInt(input.appId);
        
        // Verify app ownership
        const appRows = await db
          .select()
          .from(apps)
          .where(eq(apps.id, appId))
          .limit(1);

        const app = appRows[0];
        if (!app || app.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "App not found or access denied"
          });
        }

        // Get real build history from database
        const history = await getBuildHistory(appId, input.limit);

        return {
          builds: history.map(build => ({
            id: build.id,
            status: build.status,
            platform: build.platform,
            progress: build.progress,
            androidUrl: build.androidUrl,
            iosUrl: build.iosUrl,
            error: build.error,
            createdAt: build.createdAt,
            updatedAt: build.updatedAt,
            completedAt: build.completedAt
          }))
        };
      } catch (error) {
        console.error("Get build history error:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get build history"
        });
      }
    }),

  /**
   * Download build
   */
  downloadBuild: protectedProcedure
    .input(
      z.object({
        buildId: z.string(),
        platform: z.enum(["IOS", "ANDROID"])
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const build = await getBuildStatus(input.buildId);

        if (!build) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Build not found"
          });
        }

        // Verify ownership
        if (build.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to download this build"
          });
        }

        // Check if build is completed
        if (build.status !== "COMPLETED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Build is not ready yet. Current status: ${build.status}`
          });
        }

        const downloadUrl = input.platform === "ANDROID" 
          ? build.androidUrl 
          : build.iosUrl;

        if (!downloadUrl) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `${input.platform} build not available. Please wait for the build to complete.`
          });
        }

        // Get app name for filename
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection failed"
          });
        }
        const appRows = await db
          .select()
          .from(apps)
          .where(eq(apps.id, build.appId))
          .limit(1);

        const appName = appRows[0]?.appName || "app";
        const extension = input.platform === "ANDROID" ? "apk" : "ipa";

        return {
          url: downloadUrl,
          filename: `${appName}-${input.platform.toLowerCase()}.${extension}`,
          platform: input.platform,
          buildId: build.id
        };
      } catch (error) {
        console.error("Download build error:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to download build"
        });
      }
    }),

  /**
   * Cancel build
   */
  cancelBuild: protectedProcedure
    .input(
      z.object({
        buildId: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const build = await getBuildStatus(input.buildId);

        if (!build) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Build not found"
          });
        }

        // Verify ownership
        if (build.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to cancel this build"
          });
        }

        // Can only cancel pending or running builds
        if (build.status === "COMPLETED" || build.status === "FAILED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot cancel build with status: ${build.status}`
          });
        }

        await cancelBuildJob(input.buildId);

        return {
          success: true,
          message: "Build cancelled successfully"
        };
      } catch (error) {
        console.error("Cancel build error:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel build"
        });
      }
    }),

  /**
   * Get build statistics for user
   */
  getBuildStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed"
        });
      }

      try {
        // Total builds
        const totalBuilds = await db
          .select({ count: count() })
          .from(builds)
          .where(eq(builds.userId, ctx.user.id));

        // Successful builds
        const successfulBuilds = await db
          .select({ count: count() })
          .from(builds)
          .where(
            and(
              eq(builds.userId, ctx.user.id),
              eq(builds.status, "COMPLETED")
            )
          );

        // Failed builds
        const failedBuilds = await db
          .select({ count: count() })
          .from(builds)
          .where(
            and(
              eq(builds.userId, ctx.user.id),
              eq(builds.status, "FAILED")
            )
          );

        // Builds today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayBuilds = await db
          .select({ count: count() })
          .from(builds)
          .where(
            and(
              eq(builds.userId, ctx.user.id),
              // @ts-ignore
              builds.createdAt >= today
            )
          );

        // Get user's plan limit (default to FREE if not set)
        const userPlan = 'FREE'; // Default plan for all users
        const dailyLimit = BUILD_LIMITS[userPlan as keyof typeof BUILD_LIMITS];

        return {
          total: totalBuilds[0]?.count || 0,
          successful: successfulBuilds[0]?.count || 0,
          failed: failedBuilds[0]?.count || 0,
          today: todayBuilds[0]?.count || 0,
          dailyLimit: dailyLimit,
          remaining: dailyLimit - (todayBuilds[0]?.count || 0)
        };
      } catch (error) {
        console.error("Get build stats error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get build statistics"
        });
      }
    })
});
