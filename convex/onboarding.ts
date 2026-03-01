import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get onboarding state for the current user.
 */
export const getForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Get onboarding state using auth context.
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

/**
 * Initialize onboarding for a new user.
 */
export const initialize = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("onboardingState", {
      userId: args.userId,
      currentStep: 1,
      completed: false,
      integrationsConnected: [],
      agentsConfigured: false,
      teamInvitesSent: 0,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update onboarding step.
 */
export const updateStep = mutation({
  args: {
    userId: v.string(),
    currentStep: v.number(),
    companyName: v.optional(v.string()),
    integrationsConnected: v.optional(v.array(v.string())),
    agentsConfigured: v.optional(v.boolean()),
    teamInvitesSent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!state) throw new Error("Onboarding not initialized");

    const { userId, ...updates } = args;
    await ctx.db.patch(state._id, updates);
  },
});

/**
 * Complete onboarding.
 */
export const complete = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("onboardingState")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!state) throw new Error("Onboarding not initialized");

    await ctx.db.patch(state._id, {
      completed: true,
      completedAt: Date.now(),
    });
  },
});
