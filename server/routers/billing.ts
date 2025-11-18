import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserSubscription, getUserPayments, createSubscription } from "../db";
import { TRPCError } from "@trpc/server";

export const billingRouter = router({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getUserSubscription(ctx.user.id);
    if (!subscription) {
      return {
        plan: "FREE",
        status: "INACTIVE",
        currentPeriodStart: null,
        currentPeriodEnd: null,
      };
    }
    return subscription;
  }),

  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    return await getUserPayments(ctx.user.id);
  }),

  upgradePlan: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["BASIC", "PRO", "ENTERPRISE"]),
        billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: Integrate with Stripe to create checkout session
      // For now, just return the plan details
      return {
        success: true,
        plan: input.plan,
        billingCycle: input.billingCycle,
        checkoutUrl: `/api/checkout?plan=${input.plan}&cycle=${input.billingCycle}`,
      };
    }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await getUserSubscription(ctx.user.id);
    if (!subscription) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active subscription found",
      });
    }

    // TODO: Integrate with Stripe to cancel subscription
    return { success: true };
  }),
});
