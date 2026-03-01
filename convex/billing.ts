import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current subscription.
 * Since each deployment is per-customer, there's only one subscription.
 */
export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscriptions").first();
  },
});

/**
 * Get plan limits for a specific plan.
 */
export const getPlanLimits = query({
  args: { plan: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.plan) {
      return await ctx.db
        .query("planLimits")
        .withIndex("by_plan", (q) => q.eq("plan", args.plan!))
        .first();
    }
    // If no plan specified, get the active subscription's plan limits
    const sub = await ctx.db.query("subscriptions").first();
    const plan = sub?.plan ?? "starter";
    return await ctx.db
      .query("planLimits")
      .withIndex("by_plan", (q) => q.eq("plan", plan))
      .first();
  },
});

/**
 * Get all plan tiers for comparison display.
 */
export const getAllPlanLimits = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("planLimits").collect();
  },
});

/**
 * Get current usage counters for the active period.
 */
export const getCurrentUsage = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("usageCounters")
      .withIndex("by_period")
      .order("desc")
      .first();
  },
});

/**
 * Increment a usage counter.
 */
export const incrementUsage = mutation({
  args: {
    field: v.union(
      v.literal("tasksCreated"),
      v.literal("apiCallsMade"),
      v.literal("integrationExecutions"),
      v.literal("agentSessions"),
    ),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db
      .query("usageCounters")
      .withIndex("by_period")
      .order("desc")
      .first();

    if (current) {
      const update: Record<string, number> = { updatedAt: Date.now() };
      update[args.field] = (current as any)[args.field] + 1;
      await ctx.db.patch(current._id, update);
    } else {
      // Create a new counter for this month
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const initial: Record<string, number> = {
        periodStart,
        periodEnd,
        tasksCreated: 0,
        apiCallsMade: 0,
        integrationExecutions: 0,
        agentSessions: 0,
        updatedAt: Date.now(),
      };
      initial[args.field] = 1;
      await ctx.db.insert("usageCounters", initial as any);
    }
  },
});

/**
 * Update subscription from Stripe webhook.
 */
export const upsertSubscription = mutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    plan: v.union(v.literal("starter"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("cancelled"),
      v.literal("trialing"),
      v.literal("paused"),
    ),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription", (q) => q.eq("stripeSubscriptionId", args.stripeSubscriptionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Seed default plan limits.
 */
export const seedPlanLimits = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("planLimits").first();
    if (existing) return;

    const plans = [
      {
        plan: "starter",
        maxUsers: 3,
        maxAgents: 3,
        maxIntegrations: 10,
        maxTasksPerMonth: 500,
        maxApiCallsPerMonth: 5000,
        features: ["board", "tasks", "integrations_basic"],
      },
      {
        plan: "pro",
        maxUsers: 10,
        maxAgents: 5,
        maxIntegrations: 50,
        maxTasksPerMonth: 5000,
        maxApiCallsPerMonth: 50000,
        features: ["board", "tasks", "integrations_full", "webhooks", "memory", "autopilot", "analytics", "branding", "audit_log"],
      },
      {
        plan: "enterprise",
        maxUsers: 999,
        maxAgents: 10,
        maxIntegrations: 999,
        maxTasksPerMonth: 999999,
        maxApiCallsPerMonth: 999999,
        features: ["board", "tasks", "integrations_full", "webhooks", "memory", "autopilot", "analytics", "branding", "audit_log", "voice", "custom_agents", "sla"],
      },
    ];

    for (const plan of plans) {
      await ctx.db.insert("planLimits", plan);
    }
  },
});

/**
 * Monthly usage counter rotation.
 * Creates a new usage counter for the current month if one doesn't exist.
 * Called by cron on the 1st of each month.
 */
export const rotateUsageCounters = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

    // Check if this month's counter already exists
    const existing = await ctx.db
      .query("usageCounters")
      .withIndex("by_period")
      .order("desc")
      .first();

    if (existing && existing.periodStart === periodStart) {
      return; // Already has this month's counter
    }

    // Create new counter for this month
    await ctx.db.insert("usageCounters", {
      periodStart,
      periodEnd,
      tasksCreated: 0,
      apiCallsMade: 0,
      integrationExecutions: 0,
      agentSessions: 0,
      updatedAt: Date.now(),
    });
  },
});
