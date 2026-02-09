import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost")
);

const VALID_AGENTS = ["Kaze", "Scout", "Forge", "Ghost"];

export const createForMentions = internalMutation({
  args: {
    mentions: v.array(v.string()),
    commentId: v.id("comments"),
    taskId: v.id("tasks"),
    fromAuthor: v.string(),
    contentPreview: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    const taskTitle = task?.title ?? "Unknown task";

    for (const mention of args.mentions) {
      if (VALID_AGENTS.includes(mention) && mention !== args.fromAuthor) {
        await ctx.db.insert("notifications", {
          recipientAgent: mention as any,
          type: "mention",
          sourceCommentId: args.commentId,
          taskId: args.taskId,
          taskTitle,
          fromAuthor: args.fromAuthor,
          contentPreview: args.contentPreview.slice(0, 200),
          read: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});

export const createForThreadSubscribers = internalMutation({
  args: {
    commentId: v.id("comments"),
    taskId: v.id("tasks"),
    fromAuthor: v.string(),
    contentPreview: v.string(),
    explicitMentions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return;

    const participants = new Set<string>();

    if (task.creator && VALID_AGENTS.includes(task.creator)) {
      participants.add(task.creator);
    }
    if (task.assignee) {
      participants.add(task.assignee);
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    for (const comment of comments) {
      if (VALID_AGENTS.includes(comment.author)) {
        participants.add(comment.author);
      }
    }

    participants.delete(args.fromAuthor);
    for (const mentioned of args.explicitMentions) {
      participants.delete(mentioned);
    }

    for (const participant of participants) {
      await ctx.db.insert("notifications", {
        recipientAgent: participant as any,
        type: "thread",
        sourceCommentId: args.commentId,
        taskId: args.taskId,
        taskTitle: task.title,
        fromAuthor: args.fromAuthor,
        contentPreview: args.contentPreview.slice(0, 200),
        read: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const listForAgent = query({
  args: {
    agentName: agentNameValidator,
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.unreadOnly) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_recipient", (q) =>
          q.eq("recipientAgent", args.agentName).eq("read", false)
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient_time", (q) =>
        q.eq("recipientAgent", args.agentName)
      )
      .order("desc")
      .take(50);
  },
});

export const countUnread = query({
  args: { agentName: agentNameValidator },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientAgent", args.agentName).eq("read", false)
      )
      .collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true });
  },
});

export const markAllRead = mutation({
  args: { agentName: agentNameValidator },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientAgent", args.agentName).eq("read", false)
      )
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
  },
});
