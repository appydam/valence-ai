import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const missionId = await ctx.db.insert("missions", {
      title: args.title,
      description: args.description,
      status: "active",
      createdBy: args.createdBy,
      createdAt: Date.now(),
      taskCount: 0,
      completedTaskCount: 0,
    });
    return missionId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("missions").order("desc").collect();
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("missions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();
  },
});

export const getById = query({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.missionId);
  },
});

export const complete = mutation({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.missionId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const archive = mutation({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.missionId, {
      status: "archived",
    });
  },
});

export const incrementTaskCount = mutation({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    const mission = await ctx.db.get(args.missionId);
    if (mission) {
      await ctx.db.patch(args.missionId, {
        taskCount: mission.taskCount + 1,
      });
    }
  },
});

export const incrementCompletedCount = mutation({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    const mission = await ctx.db.get(args.missionId);
    if (mission) {
      await ctx.db.patch(args.missionId, {
        completedTaskCount: mission.completedTaskCount + 1,
      });
    }
  },
});
