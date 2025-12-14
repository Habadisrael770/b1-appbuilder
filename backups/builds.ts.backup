import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { startBuildJob, getBuildJobStatus, cancelBuildJob, getBuildHistory as getWorkerBuildHistory, updateJobState } from "../buildWorker_v2";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";
import { apps } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const buildsRouter = router({
  startBuild: protectedProcedure.input(z.object({ appId: z.string(), platform: z.enum(["IOS", "ANDROID", "BOTH"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB failed" });
      const appId = parseInt(input.appId);
      const app = await db.query.apps.findFirst({ where: eq(apps.id, appId) });
      if (!app || app.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "App not found" });

      const jobId = await startBuildJob(input.appId, ctx.user.id.toString(), input.platform);
      await db.update(apps).set({ status: "PROCESSING" }).where(eq(apps.id, appId));
      return { jobId, status: "STARTED", estimatedTime: 300, message: "Build started" };
    }),
  getBuildStatus: protectedProcedure.input(z.object({ jobId: z.string() })).query(async ({ input }) => {
      return await getBuildJobStatus(input.jobId);
    }),
  getBuildHistory: protectedProcedure.input(z.object({ appId: z.string() })).query(async ({ ctx, input }) => {
      const history = await getWorkerBuildHistory(input.appId);
      return { builds: history };
    }),
  cancelBuild: protectedProcedure.input(z.object({ jobId: z.string(), appId: z.string() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const success = await cancelBuildJob(input.jobId);
      if (success && db) {
        await db.update(apps).set({ status: "FAILED" }).where(eq(apps.id, parseInt(input.appId)));
      } else { throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" }); }
      return { success: true };
    }),
  completeBuild: publicProcedure.input(z.object({
        buildId: z.string(), status: z.enum(["COMPLETED", "FAILED"]),
        androidUrl: z.string().url().optional(), iosUrl: z.string().url().optional(),
        platform: z.enum(["ANDROID", "IOS"])
      })).mutation(async ({ ctx, input }) => {
      if (ctx.req?.headers?.authorization !== `Bearer ${process.env.BACKEND_API_KEY}`) throw new TRPCError({ code: "UNAUTHORIZED" });
      const updates: any = { status: "COMPLETED", progress: 100 };
      if (input.platform === "ANDROID") updates.androidUrl = input.androidUrl;
      if (input.platform === "IOS") updates.iosUrl = input.iosUrl;
      await updateJobState(input.buildId, updates);
      return { success: true };
    }),
  failBuild: publicProcedure.input(z.object({ buildId: z.string(), error: z.string() })).mutation(async ({ ctx, input }) => {
      if (ctx.req?.headers?.authorization !== `Bearer ${process.env.BACKEND_API_KEY}`) throw new TRPCError({ code: "UNAUTHORIZED" });
      await updateJobState(input.buildId, { status: "FAILED", error: input.error });
      return { success: true };
    })
});