import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Push a new design command into the queue (called by agents via HTTP)
 */
export const push = mutation({
  args: {
    createdBy: v.string(),
    fileKey: v.string(),
    label: v.string(),
    spec: v.string(), // JSON string
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("figmaPluginCommands", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    return { id };
  },
});

/**
 * Poll for the oldest pending command for a given file (called by Figma plugin)
 */
export const poll = query({
  args: { fileKey: v.string() },
  handler: async (ctx, args) => {
    const cmd = await ctx.db
      .query("figmaPluginCommands")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.eq(q.field("fileKey"), args.fileKey))
      .order("asc")
      .first();
    return cmd ?? null;
  },
});

/**
 * Plugin calls this when it starts executing a command
 */
export const ack = mutation({
  args: { id: v.id("figmaPluginCommands") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "executing" });
    return { ok: true };
  },
});

/**
 * Plugin calls this when it finishes (success or failure)
 */
export const complete = mutation({
  args: {
    id: v.id("figmaPluginCommands"),
    success: v.boolean(),
    resultNodeIds: v.optional(v.array(v.string())),
    resultError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.success ? "done" : "failed",
      resultNodeIds: args.resultNodeIds,
      resultError: args.resultError,
      executedAt: Date.now(),
    });
    return { ok: true };
  },
});

/**
 * Reset a command back to pending (for retrying failed/stuck commands)
 */
export const reset = mutation({
  args: { id: v.id("figmaPluginCommands") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "pending",
      resultNodeIds: undefined,
      resultError: undefined,
      executedAt: undefined,
    });
    return { ok: true };
  },
});

/**
 * Get status of a specific command (agents poll this to know when design is done)
 */
export const get = query({
  args: { id: v.id("figmaPluginCommands") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * List recent commands for a file
 */
export const listByFile = query({
  args: { fileKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("figmaPluginCommands")
      .withIndex("by_file", (q) => q.eq("fileKey", args.fileKey))
      .order("desc")
      .take(20);
  },
});
