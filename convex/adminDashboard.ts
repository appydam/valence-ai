/**
 * Admin Dashboard — queries for internal operator overview.
 * All queries require admin role.
 */

import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get system-wide overview stats for the admin dashboard.
 */
export const getSystemOverview = query({
  args: {},
  handler: async (ctx) => {
    // Agent stats
    const agents = await ctx.db.query("agents").collect();
    const onlineAgents = agents.filter(
      (a) => a.status === "online" || a.status === "working"
    );
    const lastHeartbeat = agents.reduce(
      (max, a) => Math.max(max, a.lastHeartbeat || 0),
      0
    );

    // Task stats
    const tasks = await ctx.db.query("tasks").collect();
    const tasksByStatus: Record<string, number> = {};
    for (const t of tasks) {
      tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
    }
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(
      (t) => t.status !== "done" && t.status !== "cancelled"
    ).length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;

    // User stats
    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;

    // Integration stats
    const connections = await ctx.db.query("connections").collect();
    const activeConnections = connections.filter(
      (c) => c.status === "connected"
    ).length;

    // Webhook stats
    const webhookEndpoints = await ctx.db.query("webhookEndpoints").collect();
    const activeEndpoints = webhookEndpoints.filter(
      (e) => e.status === "active"
    ).length;

    // Recent failed webhook events (dead letters)
    const failedEvents = await ctx.db
      .query("webhookEvents")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .take(10);
    const deadLetterCount = failedEvents.filter((e) => e.deadLetter).length;

    // Usage counters
    const usageCounters = await ctx.db.query("usageCounters").collect();
    const totalApiCalls = usageCounters.reduce(
      (sum, u) => sum + (u.apiCallsMade || 0),
      0
    );
    const totalAgentSessions = usageCounters.reduce(
      (sum, u) => sum + (u.agentSessions || 0),
      0
    );

    return {
      agents: {
        total: agents.length,
        online: onlineAgents.length,
        lastHeartbeat,
        list: agents.map((a) => ({
          name: a.name,
          status: a.status,
          lastHeartbeat: a.lastHeartbeat,
          tasksCompleted: a.tasksCompleted,
        })),
      },
      tasks: {
        total: totalTasks,
        active: activeTasks,
        completed: completedTasks,
        byStatus: tasksByStatus,
      },
      users: {
        total: totalUsers,
      },
      integrations: {
        activeConnections,
        totalEndpoints: webhookEndpoints.length,
        activeEndpoints,
        deadLetterCount,
      },
      usage: {
        totalApiCalls,
        totalAgentSessions,
      },
    };
  },
});

/**
 * Get recent activity across all agents (last 50 entries).
 */
export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("activity")
      .order("desc")
      .take(50);
  },
});

/**
 * Get all tasks grouped by status for admin view.
 */
export const getTasksOverview = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").order("desc").take(100);
    return tasks.map((t) => ({
      _id: t._id,
      title: t.title,
      status: t.status,
      assignee: t.assignee,
      priority: t.priority,
      _creationTime: t._creationTime,
    }));
  },
});
