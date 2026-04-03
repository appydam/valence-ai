// @ts-nocheck
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
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("missions")
        .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userId!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("missions").order("desc").collect();
  },
});

export const getActive = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      const missions = await ctx.db
        .query("missions")
        .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userId!))
        .collect();
      return missions.find((m) => m.status === "active") ?? null;
    }
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

export const patchCreatedBy = mutation({
  args: { missionId: v.id("missions"), createdBy: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.missionId, { createdBy: args.createdBy });
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

/**
 * Get a comprehensive mission report — all data needed for the Mission Report page
 * in a single reactive query.
 */
export const getReport = query({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    // 1. Fetch mission
    const mission = await ctx.db.get(args.missionId);
    if (!mission) return null;

    // 2. Fetch all tasks for this mission via index
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
      .collect();

    const taskIds = new Set(tasks.map((t) => t._id.toString()));

    // 3. Fetch agents for enrichment (only 5, very cheap)
    const agents = await ctx.db.query("agents").collect();
    const agentMap = Object.fromEntries(agents.map((a) => [a.name, a]));

    // 4. Fetch activity entries for this mission's tasks (cap at 200)
    const allActivity = await ctx.db
      .query("activity")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();
    const missionActivity = allActivity
      .filter((a) => a.taskId && taskIds.has(a.taskId.toString()))
      .slice(0, 200);

    // 4b. Fetch integration activity (tools used during mission window)
    const missionStart = mission.createdAt;
    const missionEnd = mission.completedAt || Date.now();
    const allIntegrationActivity = await ctx.db
      .query("integrationActivity")
      .collect();
    const missionIntegrationActivity = allIntegrationActivity.filter(
      (a) => a.timestamp >= missionStart && a.timestamp <= missionEnd
    );
    // Group by integration type for summary
    const integrationUsage: Record<string, { total: number; success: number; failure: number; tools: Set<string> }> = {};
    for (const entry of missionIntegrationActivity) {
      if (!integrationUsage[entry.integrationType]) {
        integrationUsage[entry.integrationType] = { total: 0, success: 0, failure: 0, tools: new Set() };
      }
      integrationUsage[entry.integrationType].total++;
      if (entry.status === "success") integrationUsage[entry.integrationType].success++;
      else integrationUsage[entry.integrationType].failure++;
      if (entry.toolName) integrationUsage[entry.integrationType].tools.add(entry.toolName);
    }
    // Convert Set to Array for serialization
    const integrationSummary = Object.entries(integrationUsage).map(([name, stats]) => ({
      name,
      total: stats.total,
      success: stats.success,
      failure: stats.failure,
      tools: Array.from(stats.tools),
    }));

    // 5. Compute per-agent contributions
    const agentContributionMap: Record<string, {
      name: string;
      emoji: string;
      role: string;
      taskCount: number;
      completedCount: number;
      deliverableCount: number;
      tasks: typeof tasks;
    }> = {};

    for (const task of tasks) {
      const agentName = task.assignee || "Unassigned";
      if (!agentContributionMap[agentName]) {
        const agent = agentMap[agentName];
        agentContributionMap[agentName] = {
          name: agentName,
          emoji: agent?.emoji || "?",
          role: agent?.role || "Unknown",
          taskCount: 0,
          completedCount: 0,
          deliverableCount: 0,
          tasks: [],
        };
      }
      agentContributionMap[agentName].taskCount++;
      if (task.status === "done") agentContributionMap[agentName].completedCount++;
      agentContributionMap[agentName].deliverableCount += (task.deliverables || []).length;
      agentContributionMap[agentName].tasks.push(task);
    }

    // 6. Aggregate all deliverables across tasks
    const deliverables = tasks.flatMap((task) =>
      (task.deliverables || []).map((d) => ({
        name: d.name,
        type: d.type,
        content: d.content,
        taskId: task._id.toString(),
        taskTitle: task.title,
        agentName: task.assignee || "Unassigned",
      }))
    );

    // 7. Task summary stats
    const tasksByStatus: Record<string, number> = {};
    const tasksByPriority: Record<string, number> = {};
    for (const task of tasks) {
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;
      tasksByPriority[task.priority] = (tasksByPriority[task.priority] || 0) + 1;
    }

    const completedTasks = tasks.filter((t) => t.status === "done");
    const cancelledTasks = tasks.filter((t) => t.status === "cancelled");

    // 8. Quality metrics
    const rejectedTasks = tasks.filter((t) => (t.iterationCount || 0) > 0);
    const totalIterations = tasks.reduce((sum, t) => sum + (t.iterationCount || 0), 0);
    const firstPassCompleted = completedTasks.filter((t) => (t.iterationCount || 0) === 0).length;
    const firstPassRate =
      tasks.length > 0
        ? Math.round((firstPassCompleted / Math.max(completedTasks.length, 1)) * 100)
        : 0;

    // 9. Timing metrics
    const durations = completedTasks
      .map((t) => t.completedAt && t.createdAt ? t.completedAt - t.createdAt : 0)
      .filter((d) => d > 0);
    const avgTaskDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    const missionDuration = mission.completedAt
      ? mission.completedAt - mission.createdAt
      : Date.now() - mission.createdAt;

    return {
      mission,
      tasks,
      agentContributions: Object.values(agentContributionMap),
      deliverables,
      activity: missionActivity,
      integrations: integrationSummary,
      summary: {
        tasksByStatus,
        tasksByPriority,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        cancelledTasks: cancelledTasks.length,
        totalDeliverables: deliverables.length,
      },
      quality: {
        rejectedTaskCount: rejectedTasks.length,
        totalIterations,
        cancelledCount: cancelledTasks.length,
        firstPassRate,
      },
      timing: {
        missionDuration,
        avgTaskDuration,
        startedAt: mission.createdAt,
        completedAt: mission.completedAt,
      },
    };
  },
});
