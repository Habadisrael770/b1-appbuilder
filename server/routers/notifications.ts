import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUserNotificationSettings,
  createNotificationSettings,
  updateNotificationSettings,
} from "../db";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  // Get user notifications
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ ctx, input }) => {
      return await getUserNotifications(ctx.user.id, input?.limit);
    }),

  // Get unread count
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await getUnreadNotificationCount(ctx.user.id);
  }),

  // Mark single notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await markNotificationAsRead(input.notificationId, ctx.user.id);
      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteNotification(input.notificationId, ctx.user.id);
      return { success: true };
    }),

  // Get notification settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserNotificationSettings(ctx.user.id);
    if (!settings) {
      // Create default settings if not exists
      await createNotificationSettings({
        userId: ctx.user.id,
        emailNotifications: 1,
        pushNotifications: 1,
        desktopNotifications: 1,
        appUpdates: 1,
        paymentAlerts: 1,
        promotions: 0,
      });
      return {
        userId: ctx.user.id,
        emailNotifications: 1,
        pushNotifications: 1,
        desktopNotifications: 1,
        appUpdates: 1,
        paymentAlerts: 1,
        promotions: 0,
      };
    }
    return settings;
  }),

  // Update notification settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.number().optional(),
        pushNotifications: z.number().optional(),
        desktopNotifications: z.number().optional(),
        appUpdates: z.number().optional(),
        paymentAlerts: z.number().optional(),
        promotions: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateNotificationSettings(ctx.user.id, input);
      return { success: true };
    }),
});
