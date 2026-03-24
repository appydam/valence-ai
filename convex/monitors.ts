// @ts-nocheck
/**
 * Continuous Monitors — CRUD functions
 * Manages monitor configurations for 24/7 external service monitoring
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

const monitorTypeValidator = v.union(v.literal("poll"), v.literal("webhook"));
const monitorStatusValidator = v.union(
  v.literal("active"),
  v.literal("paused"),
  v.literal("error")
);
const actionTypeValidator = v.union(
  v.literal("create_task"),
  v.literal("send_notification"),
  v.literal("trigger_agent"),
  v.literal("log_alert")
);

/**
 * List monitors for a user
 */
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const monitors = await ctx.db
      .query("monitors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Enrich with blueprint info
    const enriched = await Promise.all(
      monitors.map(async (monitor) => {
        // Find blueprint by slug
        const blueprint = await ctx.db
          .query("blueprints")
          .withIndex("by_slug", (q) => q.eq("slug", monitor.blueprintSlug))
          .first();

        return {
          ...monitor,
          blueprintName: blueprint?.name,
          blueprintCategory: blueprint?.category,
          blueprintIconUrl: blueprint?.iconUrl,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get single monitor by ID
 */
export const get = query({
  args: { id: v.id("monitors") },
  handler: async (ctx, args) => {
    const monitor = await ctx.db.get(args.id);
    if (!monitor) return null;

    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", monitor.blueprintSlug))
      .first();

    return {
      ...monitor,
      blueprintName: blueprint?.name,
      blueprintCategory: blueprint?.category,
      blueprintIconUrl: blueprint?.iconUrl,
    };
  },
});

/**
 * Create a new monitor
 */
export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    blueprintSlug: v.string(),
    toolName: v.string(),
    toolArgs: v.optional(v.string()),
    intervalMinutes: v.number(),
    monitorType: monitorTypeValidator,
    webhookEndpointId: v.optional(v.id("webhookEndpoints")),
    conditions: v.string(),
    actionType: actionTypeValidator,
    actionConfig: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const monitorId = await ctx.db.insert("monitors", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      blueprintSlug: args.blueprintSlug,
      toolName: args.toolName,
      toolArgs: args.toolArgs,
      intervalMinutes: args.intervalMinutes,
      nextCheckAt: now + args.intervalMinutes * 60 * 1000,
      monitorType: args.monitorType,
      webhookEndpointId: args.webhookEndpointId,
      conditions: args.conditions,
      actionType: args.actionType,
      actionConfig: args.actionConfig,
      status: "active",
      consecutiveFailures: 0,
      totalChecks: 0,
      totalTriggers: 0,
      createdAt: now,
      updatedAt: now,
    });

    return monitorId;
  },
});

/**
 * Update monitor configuration
 */
export const update = mutation({
  args: {
    id: v.id("monitors"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    toolName: v.optional(v.string()),
    toolArgs: v.optional(v.string()),
    intervalMinutes: v.optional(v.number()),
    conditions: v.optional(v.string()),
    actionType: v.optional(actionTypeValidator),
    actionConfig: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered: Record<string, any> = {};
    for (const [k, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[k] = val;
    }
    filtered.updatedAt = Date.now();

    await ctx.db.patch(id, filtered);
    return id;
  },
});

/**
 * Pause a monitor
 */
export const pause = mutation({
  args: { id: v.id("monitors") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "paused",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Resume a paused/errored monitor
 */
export const resume = mutation({
  args: { id: v.id("monitors") },
  handler: async (ctx, args) => {
    const monitor = await ctx.db.get(args.id);
    if (!monitor) throw new Error("Monitor not found");

    await ctx.db.patch(args.id, {
      status: "active",
      consecutiveFailures: 0,
      lastError: undefined,
      nextCheckAt: Date.now() + monitor.intervalMinutes * 60 * 1000,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Force a monitor to run on the next cron cycle (set nextCheckAt = now)
 */
export const forceCheck = mutation({
  args: { id: v.id("monitors") },
  handler: async (ctx, args) => {
    const monitor = await ctx.db.get(args.id);
    if (!monitor) throw new Error("Monitor not found");
    await ctx.db.patch(args.id, {
      nextCheckAt: Date.now(),
      status: "active",
      updatedAt: Date.now(),
    });
  },
});

/**
 * Delete a monitor and its events
 */
export const remove = mutation({
  args: { id: v.id("monitors") },
  handler: async (ctx, args) => {
    // Delete all events for this monitor
    const events = await ctx.db
      .query("monitorEvents")
      .withIndex("by_monitor", (q) => q.eq("monitorId", args.id))
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Get paginated events for a monitor
 */
export const getEvents = query({
  args: {
    monitorId: v.id("monitors"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const events = await ctx.db
      .query("monitorEvents")
      .withIndex("by_monitor", (q) => q.eq("monitorId", args.monitorId))
      .order("desc")
      .take(limit);

    return events;
  },
});

/**
 * Get recent events across all monitors for a user
 */
export const getRecentEvents = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;

    const events = await ctx.db
      .query("monitorEvents")
      .withIndex("by_user_time", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Enrich with monitor name
    const enriched = await Promise.all(
      events.map(async (event) => {
        const monitor = await ctx.db.get(event.monitorId);
        return {
          ...event,
          monitorName: monitor?.name ?? "Deleted Monitor",
          blueprintSlug: monitor?.blueprintSlug,
        };
      })
    );

    return enriched;
  },
});

/**
 * Internal: Get due monitors for polling engine
 */
export const getDueMonitors = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get active poll-based monitors that are due
    const allActive = await ctx.db
      .query("monitors")
      .withIndex("by_status_next", (q) =>
        q.eq("status", "active").lte("nextCheckAt", now)
      )
      .take(10);

    // Only return poll-based monitors (webhook monitors are triggered externally)
    return allActive.filter((m) => m.monitorType === "poll");
  },
});

/**
 * Internal: Update monitor after a check
 */
export const updateAfterCheck = internalMutation({
  args: {
    monitorId: v.id("monitors"),
    success: v.boolean(),
    triggered: v.boolean(),
    error: v.optional(v.string()),
    snapshot: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) return;

    const now = Date.now();
    const nextCheckAt = now + monitor.intervalMinutes * 60 * 1000;

    if (args.success) {
      await ctx.db.patch(args.monitorId, {
        lastCheckedAt: now,
        nextCheckAt,
        consecutiveFailures: 0,
        lastError: undefined,
        totalChecks: monitor.totalChecks + 1,
        totalTriggers: monitor.totalTriggers + (args.triggered ? 1 : 0),
        lastSnapshot: args.snapshot,
        updatedAt: now,
      });
    } else {
      const newFailures = monitor.consecutiveFailures + 1;
      const autoPause = newFailures >= 5;

      await ctx.db.patch(args.monitorId, {
        lastCheckedAt: now,
        nextCheckAt: autoPause ? now : nextCheckAt, // Don't schedule next if auto-paused
        consecutiveFailures: newFailures,
        lastError: args.error,
        status: autoPause ? "error" : monitor.status,
        totalChecks: monitor.totalChecks + 1,
        updatedAt: now,
      });
    }
  },
});

/**
 * Internal: Store a monitor event
 */
export const storeEvent = internalMutation({
  args: {
    monitorId: v.id("monitors"),
    userId: v.string(),
    eventType: v.union(
      v.literal("check_ok"),
      v.literal("triggered"),
      v.literal("error"),
      v.literal("action_failed")
    ),
    responseSnapshot: v.optional(v.string()),
    conditionResults: v.optional(v.string()),
    actionResult: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("monitorEvents", {
      monitorId: args.monitorId,
      userId: args.userId,
      eventType: args.eventType,
      responseSnapshot: args.responseSnapshot,
      conditionResults: args.conditionResults,
      actionResult: args.actionResult,
      errorMessage: args.errorMessage,
      timestamp: Date.now(),
    });
  },
});

/**
 * Get monitors linked to a specific webhook endpoint
 */
export const getByWebhookEndpoint = query({
  args: { webhookEndpointId: v.id("webhookEndpoints") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("monitors")
      .withIndex("by_webhook_endpoint", (q) =>
        q.eq("webhookEndpointId", args.webhookEndpointId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});
