import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserApps, createApp, getAppById, updateApp, deleteApp } from "../db";
import { TRPCError } from "@trpc/server";

export const appsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getUserApps(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        appName: z.string().min(1, "App name is required"),
        websiteUrl: z.string().url("Invalid website URL"),
        platform: z.enum(["IOS", "ANDROID", "BOTH"]).default("BOTH"),
        primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default("#00A86B"),
        secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await createApp({
          userId: ctx.user.id,
          appName: input.appName,
          websiteUrl: input.websiteUrl,
          platform: input.platform,
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor,
          status: "PROCESSING",
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create app",
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ appId: z.number() }))
    .query(async ({ ctx, input }) => {
      const app = await getAppById(input.appId, ctx.user.id);
      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found",
        });
      }
      return app;
    }),

  update: protectedProcedure
    .input(
      z.object({
        appId: z.number(),
        appName: z.string().optional(),
        primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        status: z.enum(["PROCESSING", "COMPLETED", "FAILED"]).optional(),
        iosPackageUrl: z.string().url().optional(),
        androidPackageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const app = await getAppById(input.appId, ctx.user.id);
      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found",
        });
      }

      const { appId, ...updates } = input;
      await updateApp(appId, ctx.user.id, updates);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ appId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const app = await getAppById(input.appId, ctx.user.id);
      if (!app) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App not found",
        });
      }

      await deleteApp(input.appId, ctx.user.id);
      return { success: true };
    }),
});
