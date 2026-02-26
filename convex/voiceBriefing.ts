"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/** Gather all data needed for a daily voice briefing */
export const gatherBriefingData = action({
  args: { userId: v.string() },
  handler: async (ctx, _args) => {
    const [agents, recentActivity, tasks] = await Promise.all([
      ctx.runQuery(api.agents.list, {}),
      ctx.runQuery(api.activityFns.list, { limit: 20 }),
      ctx.runQuery(api.tasks.list, {}),
    ]);

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const completedToday = (tasks as any[]).filter(
      (t) => t.status === "done" && t.completedAt && t.completedAt > oneDayAgo
    );
    const activeTasks = (tasks as any[]).filter(
      (t) => t.status === "in_progress" || t.status === "assigned"
    );
    const pendingReview = (tasks as any[]).filter(
      (t) => t.status === "in_review"
    );

    return {
      agents: (agents as any[]).map((a) => ({
        name: a.name,
        status: a.status,
        tasksCompleted: a.tasksCompleted,
      })),
      completedToday: completedToday.map((t) => ({
        title: t.title,
        assignee: t.assignee,
      })),
      activeTasks: activeTasks.map((t) => ({
        title: t.title,
        assignee: t.assignee,
        priority: t.priority,
      })),
      pendingReview: pendingReview.map((t) => ({
        title: t.title,
        assignee: t.assignee,
      })),
      recentActivity: (recentActivity as any[]).slice(0, 10).map((a) => ({
        agent: a.agentName,
        action: a.action,
        details: a.details,
      })),
      timestamp: now,
    };
  },
});
