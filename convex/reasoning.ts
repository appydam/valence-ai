import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

/**
 * Live Agent Reasoning Stream
 *
 * Agents POST reasoning steps as they work. Frontend subscribes to
 * getByTask() for real-time streaming via Convex reactive queries.
 *
 * This is purely observational — reasoning steps never affect task
 * state, agent wakeup, or any other system behavior.
 */

const stepTypeValidator = v.union(
  v.literal("thinking"),
  v.literal("tool_call"),
  v.literal("tool_result"),
  v.literal("decision"),
  v.literal("handoff"),
  v.literal("error"),
  v.literal("checkpoint")
);

/**
 * Record a reasoning step (called via HTTP endpoint by agents).
 */
export const record = mutation({
  args: {
    taskId: v.id("tasks"),
    agentName: v.string(),
    stepType: stepTypeValidator,
    content: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Cap content to 10KB
    const content = args.content.length > 10_240
      ? args.content.slice(0, 10_240) + "..."
      : args.content;

    return await ctx.db.insert("agentReasoningSteps", {
      taskId: args.taskId,
      agentName: args.agentName,
      stepType: args.stepType,
      content,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

/**
 * Get reasoning steps for a task — real-time subscription.
 * Returns most recent 50 steps, ordered oldest-first for timeline display.
 */
export const getByTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const steps = await ctx.db
      .query("agentReasoningSteps")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(50);

    // Reverse to oldest-first for timeline display
    return steps.reverse();
  },
});

/**
 * Get latest reasoning steps across all agents (for War Room / Live Ops).
 * Returns the most recent 20 steps across all agents.
 */
export const getLatest = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("agentReasoningSteps")
      .order("desc")
      .take(limit);
  },
});

/**
 * Get reasoning steps for a specific agent (for agent detail views).
 */
export const getByAgent = query({
  args: {
    agentName: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;
    const steps = await ctx.db
      .query("agentReasoningSteps")
      .withIndex("by_agent", (q) => q.eq("agentName", args.agentName))
      .order("desc")
      .take(limit);

    return steps.reverse();
  },
});

/**
 * Cleanup old reasoning steps (called by cron).
 * Deletes steps older than 30 days to prevent unbounded growth.
 */
export const cleanupOld = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const oldSteps = await ctx.db
      .query("agentReasoningSteps")
      .order("asc")
      .filter((q) => q.lt(q.field("timestamp"), thirtyDaysAgo))
      .take(500); // Process in batches to avoid timeout

    for (const step of oldSteps) {
      await ctx.db.delete(step._id);
    }

    if (oldSteps.length > 0) {
      console.log(`[Reasoning cleanup] Deleted ${oldSteps.length} steps older than 30 days`);
    }

    return { deleted: oldSteps.length };
  },
});
