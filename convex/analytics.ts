// @ts-nocheck
/**
 * Analytics & Performance Metrics
 * Backend queries and metrics collection for dashboard
 */

import { v } from "convex/values";
import { mutation, query, internalMutation, action } from "./_generated/server";
import { internal } from "./_generated/api";

const agentNameValidator = v.union(
  v.literal("Kaze"),
  v.literal("Scout"),
  v.literal("Forge"),
  v.literal("Ghost"),
  v.literal("Sentinel")
);

const periodTypeValidator = v.union(
  v.literal("hourly"),
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly")
);

/**
 * Get dashboard overview (real-time stats)
 */
export const getDashboardOverview = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last7d = now - 7 * 24 * 60 * 60 * 1000;
    const last30d = now - 30 * 24 * 60 * 60 * 1000;

    // Get all tasks
    const allTasks = await ctx.db.query("tasks").collect();

    // Get all agents
    const agents = await ctx.db.query("agents").collect();

    // Tasks by status
    const tasksByStatus = {
      inbox: allTasks.filter((t) => t.status === "inbox").length,
      assigned: allTasks.filter((t) => t.status === "assigned").length,
      in_progress: allTasks.filter((t) => t.status === "in_progress").length,
      in_review: allTasks.filter((t) => t.status === "in_review").length,
      done: allTasks.filter((t) => t.status === "done").length,
      cancelled: allTasks.filter((t) => t.status === "cancelled").length,
    };

    // Tasks completed in last 24h, 7d, 30d
    const tasksCompletedLast24h = allTasks.filter(
      (t) => t.status === "done" && t.completedAt && t.completedAt >= last24h
    ).length;

    const tasksCompletedLast7d = allTasks.filter(
      (t) => t.status === "done" && t.completedAt && t.completedAt >= last7d
    ).length;

    const tasksCompletedLast30d = allTasks.filter(
      (t) => t.status === "done" && t.completedAt && t.completedAt >= last30d
    ).length;

    // Agent stats
    const agentStats = agents.map((agent) => {
      const agentTasks = allTasks.filter((t) => t.assignee === agent.name);
      const completedTasks = agentTasks.filter((t) => t.status === "done");
      const activeTasks = agentTasks.filter(
        (t) => t.status === "in_progress" || t.status === "assigned"
      );

      return {
        name: agent.name,
        status: agent.status,
        tasksCompleted: completedTasks.length,
        tasksActive: activeTasks.length,
        lastHeartbeat: agent.lastHeartbeat,
      };
    });

    // Webhook stats (if any)
    const webhookEvents = await ctx.db.query("webhookEvents").collect();
    const webhookEventsLast24h = webhookEvents.filter(
      (e) => e.receivedAt >= last24h
    ).length;

    return {
      overview: {
        totalTasks: allTasks.length,
        totalCompleted: tasksByStatus.done,
        totalActive: tasksByStatus.in_progress + tasksByStatus.assigned,
        tasksCompletedLast24h,
        tasksCompletedLast7d,
        tasksCompletedLast30d,
      },
      tasksByStatus,
      agents: agentStats,
      webhooks: {
        receivedLast24h: webhookEventsLast24h,
        totalReceived: webhookEvents.length,
      },
    };
  },
});

/**
 * Get agent performance metrics
 */
export const getAgentPerformance = query({
  args: {
    agentName: v.optional(agentNameValidator),
    periodType: v.optional(periodTypeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const periodType = args.periodType || "daily";
    const limit = args.limit || 30;

    let metricsQuery = ctx.db.query("agentMetrics");

    if (args.agentName) {
      const metrics = await metricsQuery
        .withIndex("by_agent_period", (q) =>
          q
            .eq("agentName", args.agentName!)
            .eq("periodType", periodType)
        )
        .order("desc")
        .take(limit);

      return metrics;
    } else {
      // Get metrics for all agents
      const metrics = await metricsQuery
        .withIndex("by_period", (q) => q.eq("periodType", periodType))
        .order("desc")
        .take(limit * 4); // 4 agents

      return metrics;
    }
  },
});

/**
 * Get system-wide metrics
 */
export const getSystemMetrics = query({
  args: {
    periodType: v.optional(periodTypeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const periodType = args.periodType || "daily";
    const limit = args.limit || 30;

    const metrics = await ctx.db
      .query("systemMetrics")
      .withIndex("by_period", (q) => q.eq("periodType", periodType))
      .order("desc")
      .take(limit);

    return metrics;
  },
});

/**
 * Get task completion trends
 */
export const getTaskTrends = query({
  args: {
    days: v.optional(v.number()),
    agentName: v.optional(agentNameValidator),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    // Get all completed tasks in time range
    let allTasks = await ctx.db.query("tasks").collect();

    if (args.agentName) {
      allTasks = allTasks.filter((t) => t.assignee === args.agentName);
    }

    const completedTasks = allTasks.filter(
      (t) =>
        t.status === "done" &&
        t.completedAt &&
        t.completedAt >= startTime
    );

    // Group by day
    const dailyCounts: Record<string, number> = {};

    for (const task of completedTasks) {
      const date = new Date(task.completedAt!);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    }

    // Fill in missing days with 0
    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];

      trends.push({
        date: dateKey,
        count: dailyCounts[dateKey] || 0,
      });
    }

    return trends.reverse(); // Oldest first
  },
});

/**
 * Get average task completion times
 */
export const getCompletionTimes = query({
  args: {
    agentName: v.optional(agentNameValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    // Get task metrics
    let metricsQuery = ctx.db.query("taskMetrics");

    let metrics;
    if (args.agentName) {
      metrics = await metricsQuery
        .withIndex("by_agent", (q) => q.eq("agentName", args.agentName!))
        .filter((q) => q.eq(q.field("completed"), true))
        .order("desc")
        .take(limit);
    } else {
      metrics = await metricsQuery
        .withIndex("by_completed_time", (q) => q)
        .filter((q) => q.eq(q.field("completed"), true))
        .order("desc")
        .take(limit);
    }

    // Calculate averages
    const completedMetrics = metrics.filter((m) => m.totalDuration);

    if (completedMetrics.length === 0) {
      return {
        avgTotalDuration: 0,
        avgTimeToStart: 0,
        avgTimeToComplete: 0,
        count: 0,
      };
    }

    const avgTotalDuration =
      completedMetrics.reduce((sum, m) => sum + (m.totalDuration || 0), 0) /
      completedMetrics.length;

    const avgTimeToStart =
      completedMetrics
        .filter((m) => m.timeToStart)
        .reduce((sum, m) => sum + (m.timeToStart || 0), 0) /
      completedMetrics.filter((m) => m.timeToStart).length || 0;

    const avgTimeToComplete =
      completedMetrics
        .filter((m) => m.timeToComplete)
        .reduce((sum, m) => sum + (m.timeToComplete || 0), 0) /
      completedMetrics.filter((m) => m.timeToComplete).length || 0;

    return {
      avgTotalDuration,
      avgTimeToStart,
      avgTimeToComplete,
      count: completedMetrics.length,
    };
  },
});

/**
 * Get integration usage stats
 */
export const getIntegrationUsage = query({
  args: {
    userId: v.optional(v.string()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startTime = Date.now() - days * 24 * 60 * 60 * 1000;

    let activity;

    if (args.userId) {
      activity = await ctx.db
        .query("integrationActivity")
        .withIndex("by_user", (q) => q.eq("userId", args.userId!))
        .collect();
    } else {
      activity = await ctx.db.query("integrationActivity").collect();
    }

    // Filter by time
    activity = activity.filter((a) => a.timestamp >= startTime);

    // Group by integration type
    const byIntegration: Record<
      string,
      { total: number; success: number; failure: number }
    > = {};

    for (const entry of activity) {
      if (!byIntegration[entry.integrationType]) {
        byIntegration[entry.integrationType] = {
          total: 0,
          success: 0,
          failure: 0,
        };
      }

      byIntegration[entry.integrationType].total++;
      if (entry.status === "success") {
        byIntegration[entry.integrationType].success++;
      } else {
        byIntegration[entry.integrationType].failure++;
      }
    }

    return {
      totalCalls: activity.length,
      byIntegration,
    };
  },
});

/**
 * Collect task metrics (run when task status changes)
 */
export const collectTaskMetrics = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return;

    // Check if metrics already exist
    const existing = await ctx.db
      .query("taskMetrics")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .unique();

    const now = Date.now();

    // Calculate durations
    const timeToAssign = task.updatedAt - task.createdAt; // Approximate
    const timeToStart = task.status === "in_progress" && task.updatedAt
      ? task.updatedAt - task.createdAt
      : undefined;
    const totalDuration = task.completedAt
      ? task.completedAt - task.createdAt
      : undefined;

    const metricsData = {
      taskId: args.taskId,
      agentName: task.assignee,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      timeToAssign,
      timeToStart,
      totalDuration,
      completed: task.status === "done",
      cancelled: task.status === "cancelled",
      hasDeliverables: task.deliverables.length > 0,
      deliverableCount: task.deliverables.length,
      commentCount: 0, // TODO: Query comments
      source: task.metadata ? "webhook" : "manual",
      missionId: task.missionId,
    };

    if (existing) {
      await ctx.db.patch(existing._id, metricsData as any);
    } else {
      await ctx.db.insert("taskMetrics", metricsData as any);
    }
  },
});

/**
 * Compute agent metrics for a period (scheduled job)
 */
export const computeAgentMetrics = action({
  args: {
    periodType: periodTypeValidator,
    periodStart: v.number(),
    periodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all agents
    const agents = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"] as const;

    for (const agentName of agents) {
      // Get task metrics for this period
      const taskMetrics = await ctx.runQuery(
        internal.analytics.getTaskMetricsForPeriod,
        {
          agentName,
          periodStart: args.periodStart,
          periodEnd: args.periodEnd,
        }
      );

      // Calculate metrics
      const tasksCompleted = taskMetrics.filter((t) => t.completed).length;
      const tasksCancelled = taskMetrics.filter((t) => t.cancelled).length;
      const tasksInProgress = taskMetrics.filter(
        (t) => t.status === "in_progress"
      ).length;

      const completedTimes = taskMetrics
        .filter((t) => t.totalDuration)
        .map((t) => t.totalDuration!);

      const avgTimeToComplete =
        completedTimes.length > 0
          ? completedTimes.reduce((a, b) => a + b, 0) / completedTimes.length
          : 0;

      const completionRate =
        taskMetrics.length > 0
          ? (tasksCompleted / taskMetrics.length) * 100
          : 0;

      // Store metrics
      await ctx.runMutation(internal.analytics.storeAgentMetrics, {
        agentName,
        periodStart: args.periodStart,
        periodEnd: args.periodEnd,
        periodType: args.periodType,
        tasksAssigned: taskMetrics.length,
        tasksCompleted,
        tasksCancelled,
        tasksInProgress,
        avgTimeToComplete,
        completionRate,
      });
    }
  },
});

/**
 * Internal: Get task metrics for a period
 */
export const getTaskMetricsForPeriod = query({
  args: {
    agentName: agentNameValidator,
    periodStart: v.number(),
    periodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const metrics = await ctx.db.query("taskMetrics").collect();

    return metrics.filter(
      (m) =>
        m.agentName === args.agentName &&
        m.createdAt >= args.periodStart &&
        m.createdAt < args.periodEnd
    );
  },
});

/**
 * Get detailed task breakdown by priority and agent
 */
export const getTaskBreakdown = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    const allTasks = await ctx.db.query("tasks").collect();

    // Priority breakdown
    const byPriority = {
      urgent: allTasks.filter((t) => t.priority === "urgent").length,
      high: allTasks.filter((t) => t.priority === "high").length,
      medium: allTasks.filter((t) => t.priority === "medium").length,
      low: allTasks.filter((t) => t.priority === "low").length,
    };

    // Per-agent breakdown with priority
    const agents = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"] as const;
    const agentBreakdown = agents.map((name) => {
      const agentTasks = allTasks.filter((t) => t.assignee === name);
      const completed = agentTasks.filter((t) => t.status === "done");
      const completedInPeriod = completed.filter(
        (t) => t.completedAt && t.completedAt >= startTime
      );

      // Average completion time for this agent
      const durations = completedInPeriod
        .filter((t) => t.completedAt && t.createdAt)
        .map((t) => t.completedAt! - t.createdAt);
      const avgCompletionTime =
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0;

      return {
        name,
        total: agentTasks.length,
        completed: completed.length,
        completedInPeriod: completedInPeriod.length,
        active: agentTasks.filter(
          (t) => t.status === "in_progress" || t.status === "assigned"
        ).length,
        inReview: agentTasks.filter((t) => t.status === "in_review").length,
        cancelled: agentTasks.filter((t) => t.status === "cancelled").length,
        avgCompletionTime,
        byPriority: {
          urgent: agentTasks.filter((t) => t.priority === "urgent").length,
          high: agentTasks.filter((t) => t.priority === "high").length,
          medium: agentTasks.filter((t) => t.priority === "medium").length,
          low: agentTasks.filter((t) => t.priority === "low").length,
        },
      };
    });

    // Task velocity: tasks created vs completed per day over period
    const velocity = [];
    for (let i = 0; i < Math.min(days, 30); i++) {
      const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
      const dayEnd = now - i * 24 * 60 * 60 * 1000;
      const date = new Date(dayEnd).toISOString().split("T")[0];

      const created = allTasks.filter(
        (t) => t.createdAt >= dayStart && t.createdAt < dayEnd
      ).length;
      const completed = allTasks.filter(
        (t) =>
          t.status === "done" &&
          t.completedAt &&
          t.completedAt >= dayStart &&
          t.completedAt < dayEnd
      ).length;

      velocity.push({ date, created, completed });
    }

    // Recently completed tasks
    const recentCompleted = allTasks
      .filter((t) => t.status === "done" && t.completedAt)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
      .slice(0, 10)
      .map((t) => ({
        _id: t._id,
        title: t.title,
        assignee: t.assignee,
        priority: t.priority,
        completedAt: t.completedAt,
        duration: t.completedAt ? t.completedAt - t.createdAt : 0,
      }));

    // Tasks currently in progress
    const inProgress = allTasks
      .filter((t) => t.status === "in_progress")
      .map((t) => ({
        _id: t._id,
        title: t.title,
        assignee: t.assignee,
        priority: t.priority,
        createdAt: t.createdAt,
        elapsed: now - t.createdAt,
      }));

    // Unassigned tasks
    const unassigned = allTasks.filter(
      (t) => t.status === "inbox" && !t.assignee
    ).length;

    return {
      byPriority,
      agentBreakdown,
      velocity: velocity.reverse(),
      recentCompleted,
      inProgress,
      unassigned,
    };
  },
});

/**
 * Internal: Store agent metrics
 */
export const storeAgentMetrics = internalMutation({
  args: {
    agentName: agentNameValidator,
    periodStart: v.number(),
    periodEnd: v.number(),
    periodType: periodTypeValidator,
    tasksAssigned: v.number(),
    tasksCompleted: v.number(),
    tasksCancelled: v.number(),
    tasksInProgress: v.number(),
    avgTimeToComplete: v.number(),
    completionRate: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("agentMetrics", {
      agentName: args.agentName,
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      periodType: args.periodType,
      tasksAssigned: args.tasksAssigned,
      tasksCompleted: args.tasksCompleted,
      tasksCancelled: args.tasksCancelled,
      tasksInProgress: args.tasksInProgress,
      avgTimeToComplete: args.avgTimeToComplete,
      avgTimeToStart: 0,
      completionRate: args.completionRate,
      totalActiveTime: 0,
      heartbeatCount: 0,
      integrationCallCount: 0,
      integrationSuccessCount: 0,
      integrationFailureCount: 0,
      computedAt: Date.now(),
    });
  },
});
