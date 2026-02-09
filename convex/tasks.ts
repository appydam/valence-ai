import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.string()),
    assignee: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let results;
    if (args.status) {
      results = await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    } else if (args.assignee) {
      results = await ctx.db
        .query("tasks")
        .withIndex("by_assignee", (q) => q.eq("assignee", args.assignee as any))
        .collect();
    } else {
      results = await ctx.db.query("tasks").collect();
    }
    if (args.status && args.assignee) {
      results = results.filter((t) => t.assignee === args.assignee);
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assignee: v.optional(
      v.union(
        v.literal("Kaze"),
        v.literal("Scout"),
        v.literal("Forge"),
        v.literal("Ghost")
      )
    ),
    creator: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.assignee ? "assigned" : "inbox",
      priority: args.priority,
      assignee: args.assignee,
      creator: args.creator,
      createdAt: now,
      updatedAt: now,
      tags: args.tags,
      deliverables: [],
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("in_review"),
        v.literal("done"),
        v.literal("cancelled")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assignee: v.optional(
      v.union(
        v.literal("Kaze"),
        v.literal("Scout"),
        v.literal("Forge"),
        v.literal("Ghost")
      )
    ),
    tags: v.optional(v.array(v.string())),
    deliverables: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Task not found");

    const updates: Record<string, any> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (updates.status === "done" && existing.status !== "done") {
      updates.completedAt = Date.now();
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const claim = mutation({
  args: {
    id: v.id("tasks"),
    agentName: v.union(
      v.literal("Kaze"),
      v.literal("Scout"),
      v.literal("Forge"),
      v.literal("Ghost")
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    await ctx.db.patch(args.id, {
      assignee: args.agentName,
      status: "in_progress",
      updatedAt: Date.now(),
    });
  },
});

export const addDeliverable = mutation({
  args: {
    id: v.id("tasks"),
    name: v.string(),
    type: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    await ctx.db.patch(args.id, {
      deliverables: [
        ...task.deliverables,
        { name: args.name, type: args.type, content: args.content },
      ],
      updatedAt: Date.now(),
    });
  },
});
