import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

/** Recent comments across all tasks (for Live Ops Feed) */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Comments don't have a by_created index, so we query all and sort
    const all = await ctx.db.query("comments").order("desc").take(args.limit ?? 50);
    return all;
  },
});

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    author: v.string(),
    content: v.string(),
    mentions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      taskId: args.taskId,
      author: args.author,
      content: args.content,
      mentions: args.mentions,
      createdAt: Date.now(),
    });

    if (args.mentions.length > 0) {
      await ctx.scheduler.runAfter(0, internal.notifications.createForMentions, {
        mentions: args.mentions,
        commentId,
        taskId: args.taskId,
        fromAuthor: args.author,
        contentPreview: args.content,
      });
    }

    await ctx.scheduler.runAfter(0, internal.notifications.createForThreadSubscribers, {
      commentId,
      taskId: args.taskId,
      fromAuthor: args.author,
      contentPreview: args.content,
      explicitMentions: args.mentions,
    });

    return commentId;
  },
});
