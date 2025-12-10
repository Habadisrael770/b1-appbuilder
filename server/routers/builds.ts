/**
 * Build Router - tRPC procedures for app building
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { startBuildJob, getBuildJobStatus } from "../buildWorker";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";
import { apps } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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

      const appId = parseInt(input.appId);
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

      const jobId = `build-${input.appId}-${Date.now()}`;

      await db
        .update(apps)
        .set({ status: "PROCESSING" })
        .where(eq(apps.id, appId));

      const result = await startBuildJob({
        jobId,
        appId: input.appId,
        appName: app.appName,
        websiteUrl: app.websiteUrl,
        platform: input.platform,
        primaryColor: app.primaryColor,
        secondaryColor: app.secondaryColor || "#008556",
        iconUrl: app.iconUrl || undefined,
        splashScreenUrl: app.splashScreenUrl || undefined
      });

      return {
        jobId: result.jobId,
        status: "STARTED",
        estimatedTime: 300
      };
    }),

  /**
   * Get build job status
   */
  getBuildStatus: protectedProcedure
    .input(
      z.object({
        jobId: z.string()
      })
    )
    .query(({ input }) => {
      const status = getBuildJobStatus(input.jobId);

      return {
        status: status.status,
        progress: status.progress,
        androidUrl: status.result?.androidUrl,
        iosUrl: status.result?.iosUrl,
        error: status.error
      };
    }),

  /**
   * Get app build history
   */
  getBuildHistory: protectedProcedure
    .input(
      z.object({
        appId: z.string()
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

      const appId = parseInt(input.appId);
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

      return {
        builds: [
          {
            id: `build-${input.appId}-1`,
            status: "COMPLETED",
            platform: "BOTH",
            createdAt: new Date(Date.now() - 3600000),
            androidUrl: app.androidPackageUrl,
            iosUrl: app.iosPackageUrl
          }
        ]
      };
    }),

  /**
   * Download build
   */
  downloadBuild: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        platform: z.enum(["IOS", "ANDROID"])
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

      const appId = parseInt(input.appId);
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

      if (input.platform === "ANDROID" && app.androidPackageUrl) {
        return {
          url: app.androidPackageUrl,
          filename: `${app.appName}-android.apk`
        };
      }

      if (input.platform === "IOS" && app.iosPackageUrl) {
        return {
          url: app.iosPackageUrl,
          filename: `${app.appName}-ios.ipa`
        };
      }

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Build not available for this platform"
      });
    })
});
