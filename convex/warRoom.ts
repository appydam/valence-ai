import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Cross-Agent War Room
 *
 * Mission-scoped collaboration view. Agents post coordination messages
 * (handoffs, blockers, milestones) and the frontend aggregates them
 * with task status, reasoning streams, and activity into a single
 * real-time view.
 */

// ── Queries ──────────────────────────────────────────────────

/**
 * Get all war room messages for a mission (real-time).
 */
export const getMessages = query({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("warRoomMessages")
      .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
      .order("asc")
      .collect();
  },
});

/**
 * Get the full War Room state for a mission — mission, tasks, agents, messages.
 * Single query so the frontend subscribes to one reactive stream.
 */
export const getState = query({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    const mission = await ctx.db.get(args.missionId);
    if (!mission) return null;

    // All tasks for this mission
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
      .collect();

    // Agent statuses
    const agents = await ctx.db.query("agents").collect();

    // War room messages (last 100)
    const messages = await ctx.db
      .query("warRoomMessages")
      .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
      .order("desc")
      .take(100);
    messages.reverse(); // oldest first for display

    // Recent activity for this mission's tasks
    const taskIds = new Set(tasks.map((t) => t._id));
    const recentActivity = await ctx.db
      .query("activity")
      .withIndex("by_timestamp")
      .order("desc")
      .take(200);
    const missionActivity = recentActivity
      .filter((a) => a.taskId && taskIds.has(a.taskId as any))
      .slice(0, 50);

    // Latest reasoning step per active task
    const activeTasks = tasks.filter(
      (t) => t.status === "in_progress" || t.status === "in_review"
    );
    const latestReasoning: Record<string, any> = {};
    for (const task of activeTasks) {
      const steps = await ctx.db
        .query("agentReasoningSteps")
        .withIndex("by_task", (q) => q.eq("taskId", task._id))
        .order("desc")
        .take(1);
      if (steps.length > 0) {
        latestReasoning[task._id] = steps[0];
      }
    }

    // Group tasks by agent
    const agentLanes: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      const agent = task.assignee ?? "Unassigned";
      if (!agentLanes[agent]) agentLanes[agent] = [];
      agentLanes[agent].push(task);
    }

    // Compute mission progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
    const inReviewTasks = tasks.filter((t) => t.status === "in_review").length;
    const blockedTasks = tasks.filter((t) => t.status === "assigned").length;

    return {
      mission,
      tasks,
      agents: agents.map((a) => ({
        name: a.name,
        emoji: a.emoji,
        role: a.role,
        status: a.status,
        currentTaskId: a.currentTaskId,
        lastHeartbeat: a.lastHeartbeat,
      })),
      messages,
      activity: missionActivity,
      latestReasoning,
      agentLanes,
      progress: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        inReview: inReviewTasks,
        blocked: blockedTasks,
        percent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    };
  },
});

// ── Mutations ────────────────────────────────────────────────

/**
 * Post a message to the War Room.
 * Called by agents via HTTP endpoint.
 */
export const postMessage = mutation({
  args: {
    missionId: v.id("missions"),
    agentName: v.string(),
    messageType: v.union(
      v.literal("update"),
      v.literal("handoff"),
      v.literal("request"),
      v.literal("blocker"),
      v.literal("resolved"),
      v.literal("milestone")
    ),
    content: v.string(),
    targetAgent: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    // Cap content to 5KB
    const content = args.content.slice(0, 5000);

    return await ctx.db.insert("warRoomMessages", {
      missionId: args.missionId,
      agentName: args.agentName,
      messageType: args.messageType,
      content,
      targetAgent: args.targetAgent,
      taskId: args.taskId,
      timestamp: Date.now(),
    });
  },
});
