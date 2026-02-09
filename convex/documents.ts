import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const documentTypeValidator = v.union(
  v.literal("report"),
  v.literal("code"),
  v.literal("analysis"),
  v.literal("draft"),
  v.literal("other")
);

export const list = query({
  args: {
    author: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.author) {
      const results = await ctx.db
        .query("documents")
        .withIndex("by_author", (q) => q.eq("author", args.author!))
        .order("desc")
        .collect();
      if (args.type) {
        return results.filter((d) => d.type === args.type);
      }
      return results;
    }
    if (args.type) {
      return await ctx.db
        .query("documents")
        .withIndex("by_type", (q) => q.eq("type", args.type as any))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("documents")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: documentTypeValidator,
    author: v.string(),
    tags: v.array(v.string()),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      type: args.type,
      author: args.author,
      tags: args.tags,
      taskId: args.taskId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.optional(documentTypeValidator),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, any> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
