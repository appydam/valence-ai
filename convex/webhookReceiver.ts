// @ts-nocheck
/**
 * Webhook Event Receiver & Processor
 * Queries and mutations (non-Node runtime)
 * The `receive` action is in webhookReceiverActions.ts (Node runtime for crypto)
 */

import { v } from "convex/values";
import { internalMutation, query, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

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

const MAX_RETRIES = 3;

/**
 * Exponential backoff delay: 30s, 120s, 480s (30 * 4^attempt)
 */
function getRetryDelay(retryCount: number): number {
  return 30_000 * Math.pow(4, retryCount);
}

/**
 * Internal: Update event with processing results.
 * If status is "failed" and retries remain, schedules a retry with exponential backoff.
 * If retries exhausted, marks as dead letter.
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
    const event = await ctx.db.get(args.eventId);
    const retryCount = event?.retryCount ?? 0;

    const patch: Record<string, unknown> = {
      status: args.status,
      taskId: args.taskId || undefined,
      ruleId: args.ruleId || undefined,
      errorMessage: args.errorMessage,
      processedAt: args.processedAt,
    };

    // Schedule retry if failed and retries remain
    if (args.status === "failed" && retryCount < MAX_RETRIES) {
      patch.nextRetryAt = Date.now() + getRetryDelay(retryCount);
    } else if (args.status === "failed" && retryCount >= MAX_RETRIES) {
      // Exhausted retries — move to dead letter queue
      patch.deadLetter = true;
      patch.nextRetryAt = undefined;
    }

    await ctx.db.patch(args.eventId, patch);
  },
});

/**
 * Internal: Retry failed webhook events.
 * Called by cron every 5 minutes. Picks up events with nextRetryAt <= now,
 * increments retryCount, and re-dispatches to the receive action.
 */
export const retryFailed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get failed events that are due for retry
    const failedEvents = await ctx.db
      .query("webhookEvents")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .take(50);

    const retryable = failedEvents.filter(
      (e) => e.nextRetryAt && e.nextRetryAt <= now && !e.deadLetter
    );

    for (const event of retryable) {
      const newRetryCount = (event.retryCount ?? 0) + 1;

      // Reset to "received" so it gets reprocessed
      await ctx.db.patch(event._id, {
        status: "received",
        retryCount: newRetryCount,
        nextRetryAt: undefined,
        errorMessage: undefined,
        processedAt: undefined,
        processingStartedAt: undefined,
      });

      // Schedule the reprocess via the receive action
      await ctx.scheduler.runAfter(0, internal.webhookReceiverActions.receive, {
        urlPath: "", // Will be resolved from endpointId
        eventType: event.eventType,
        eventData: event.eventData,
        headers: event.headers,
        rawBody: event.eventData, // Use event data as raw body for retry
      });
    }

    return { retried: retryable.length };
  },
});

/**
 * List dead letter events (failed after all retries exhausted).
 */
export const listDeadLetters = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const events = await ctx.db
      .query("webhookEvents")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .order("desc")
      .take(limit * 2);

    const deadLetters = events.filter((e) => e.deadLetter).slice(0, limit);

    return Promise.all(
      deadLetters.map(async (event) => {
        const endpoint = await ctx.db.get(event.endpointId);
        const blueprint = await ctx.db.get(event.blueprintId);
        return {
          ...event,
          endpointName: endpoint?.name,
          blueprintName: blueprint?.name,
        };
      })
    );
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
