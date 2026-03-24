import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const beat = mutation({
  args: {
    agentName: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("working"),
      v.literal("idle"),
      v.literal("offline")
    ),
    currentTaskId: v.optional(v.string()),
    serverMetrics: v.optional(v.object({
      cpuPercent: v.number(),
      memoryUsedMb: v.number(),
      memoryTotalMb: v.number(),
      diskUsedGb: v.number(),
      diskTotalGb: v.number(),
      uptimeSeconds: v.number(),
      loadAvg1m: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.agentName))
      .unique();

    if (existing) {
      const patch: Record<string, any> = {
        status: args.status,
        lastHeartbeat: Date.now(),
      };
      if (args.currentTaskId !== undefined) {
        patch.currentTaskId = args.currentTaskId || undefined;
      }
      if (args.serverMetrics) {
        patch.serverMetrics = args.serverMetrics;
      }
      await ctx.db.patch(existing._id, patch);

      // Touch lastAgentActivity on the current task so stuck detection knows the agent is alive
      if (args.currentTaskId && (args.status === "working" || args.status === "online")) {
        const task = await ctx.db.get(args.currentTaskId as any);
        if (task && (task.status === "assigned" || task.status === "in_progress")) {
          await ctx.db.patch(task._id, { lastAgentActivity: Date.now() });
        }
      }

      return { action: "updated", agentId: existing._id };
    } else {
      // Auto-create agent record on first heartbeat (for dynamically added agents)
      const slug = args.agentName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const id = await ctx.db.insert("agents", {
        name: args.agentName,
        emoji: "🤖",
        role: "Agent",
        description: `${args.agentName} agent`,
        status: args.status,
        lastHeartbeat: Date.now(),
        tasksCompleted: 0,
        color: "#6366F1",
        slug,
        isOrchestrator: false,
        isReviewer: false,
        canBeThrottled: true,
      });
      return { action: "created", agentId: id };
    }
  },
});
