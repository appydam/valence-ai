// @ts-nocheck
/**
 * Webhook Event Receiver & Processor
 * Queries and mutations (non-Node runtime)
 * The `receive` action is in webhookReceiverActions.ts (Node runtime for crypto)
 */

import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

/**
 * Internal: Store webhook event
 */
export const storeEvent = internalMutation({
  args: {
    endpointId: v.id("webhookEndpoints"),
    userId: v.string(),
    blueprintId: v.id("blueprints"),
    eventType: v.string(),
    eventData: v.string(),
    headers: v.string(),
    signature: v.union(v.string(), v.null()),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("webhookEvents", {
      endpointId: args.endpointId,
      userId: args.userId,
      blueprintId: args.blueprintId,
      eventType: args.eventType,
      eventData: args.eventData,
      headers: args.headers,
      signature: args.signature || undefined,
      verified: args.verified,
      status: "received",
      receivedAt: Date.now(),
    });

    return eventId;
  },
});

/**
 * Internal: Update event status
 */
export const updateEventStatus = internalMutation({
  args: {
    eventId: v.id("webhookEvents"),
    status: v.union(
      v.literal("received"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed"),
      v.literal("ignored")
    ),
    processingStartedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: args.status,
      processingStartedAt: args.processingStartedAt,
    });
  },
});

/**
 * Internal: Update event with processing results
 */
export const updateEventResult = internalMutation({
  args: {
    eventId: v.id("webhookEvents"),
    status: v.union(v.literal("processed"), v.literal("failed")),
    taskId: v.union(v.id("tasks"), v.null()),
    ruleId: v.union(v.id("automationRules"), v.null()),
    errorMessage: v.optional(v.string()),
    processedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: args.status,
      taskId: args.taskId || undefined,
      ruleId: args.ruleId || undefined,
      errorMessage: args.errorMessage,
      processedAt: args.processedAt,
    });
  },
});

/**
 * List recent webhook events
 */
export const listEvents = query({
  args: {
    userId: v.optional(v.string()),
    endpointId: v.optional(v.id("webhookEndpoints")),
    status: v.optional(
      v.union(
        v.literal("received"),
        v.literal("processing"),
        v.literal("processed"),
        v.literal("failed"),
        v.literal("ignored")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let events;

    if (args.endpointId) {
      events = await ctx.db
        .query("webhookEvents")
        .withIndex("by_endpoint", (q) => q.eq("endpointId", args.endpointId))
        .order("desc")
        .take(limit);
    } else if (args.status) {
      events = await ctx.db
        .query("webhookEvents")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .take(limit);
    } else if (args.userId) {
      const allEvents = await ctx.db
        .query("webhookEvents")
        .withIndex("by_received", (q) => q)
        .order("desc")
        .take(limit * 2);

      events = allEvents.filter((e) => e.userId === args.userId).slice(0, limit);
    } else {
      events = await ctx.db
        .query("webhookEvents")
        .withIndex("by_received", (q) => q)
        .order("desc")
        .take(limit);
    }

    // Enrich with endpoint/blueprint info
    const enriched = await Promise.all(
      events.map(async (event) => {
        const endpoint = await ctx.db.get(event.endpointId);
        const blueprint = await ctx.db.get(event.blueprintId);
        const task = event.taskId ? await ctx.db.get(event.taskId) : null;

        return {
          ...event,
          endpointName: endpoint?.name,
          blueprintName: blueprint?.name,
          blueprintSlug: blueprint?.slug,
          taskTitle: task?.title,
        };
      })
    );

    return enriched;
  },
});
