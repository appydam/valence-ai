import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ── Types ─────────────────────────────────────────────────────

interface DecomposedTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee: "Kaze" | "Scout" | "Forge" | "Ghost";
  tags: string[];
  dependsOnIndex: number[];
  requiredIntegrations: string[];
  estimatedMinutes: number;
}

interface DecomposedPlan {
  missionTitle: string;
  missionDescription: string;
  estimatedDuration: string;
  tasks: DecomposedTask[];
}

// ── Queries ───────────────────────────────────────────────────

/** List recent autopilot sessions for a user */
export const listSessions = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("autopilotSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 10);
  },
});

/** Get a single autopilot session */
export const getSession = query({
  args: { sessionId: v.id("autopilotSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});

// ── Mutations ─────────────────────────────────────────────────

/** Save a decomposed plan to an autopilot session */
export const savePlan = mutation({
  args: {
    sessionId: v.id("autopilotSessions"),
    plan: v.string(), // JSON-stringified DecomposedPlan
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      plan: args.plan,
      status: "reviewing",
    });
  },
});

/** Launch a mission from an approved autopilot plan */
export const launchMission = mutation({
  args: {
    sessionId: v.id("autopilotSessions"),
    plan: v.string(), // JSON-stringified DecomposedPlan (may be edited by user)
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Autopilot session not found");
    if (session.status === "launched") throw new Error("Mission already launched");

    const plan: DecomposedPlan = JSON.parse(args.plan);
    const now = Date.now();

    // 1. Create mission
    const missionId = await ctx.db.insert("missions", {
      title: plan.missionTitle,
      description: plan.missionDescription,
      status: "active",
      createdBy: session.userId,
      createdAt: now,
      taskCount: plan.tasks.length + 1, // +1 for parent task
      completedTaskCount: 0,
    });

    // 2. Create parent task (assigned to Kaze as coordinator)
    const parentTaskId = await ctx.db.insert("tasks", {
      title: plan.missionTitle,
      description: `Autopilot mission: ${plan.missionDescription}\n\nOriginal goal: ${session.goal}`,
      status: "in_progress",
      priority: "high",
      assignee: "Kaze",
      creator: session.userId,
      createdAt: now,
      updatedAt: now,
      tags: ["autopilot"],
      deliverables: [],
      missionId,
    });

    // 3. Create subtasks via the existing delegateTask pattern
    const createdIds: Id<"tasks">[] = [];

    // First pass: create all subtasks
    for (const subtask of plan.tasks) {
      const taskId = await ctx.db.insert("tasks", {
        title: subtask.title,
        description: subtask.description,
        status: "assigned",
        priority: subtask.priority,
        assignee: subtask.assignee,
        creator: session.userId,
        createdAt: now,
        updatedAt: now,
        tags: subtask.tags,
        deliverables: [],
        missionId,
        ...(subtask.requiredIntegrations.length > 0
          ? { requiredIntegrations: subtask.requiredIntegrations }
          : {}),
        ...(session.userId ? { requiredUserId: session.userId } : {}),
      });
      createdIds.push(taskId);
    }

    // Second pass: wire up dependencies
    for (let i = 0; i < plan.tasks.length; i++) {
      const subtask = plan.tasks[i];
      if (subtask.dependsOnIndex && subtask.dependsOnIndex.length > 0) {
        const depIds = subtask.dependsOnIndex.map((idx) => {
          if (idx < 0 || idx >= createdIds.length)
            throw new Error(`Invalid dependsOnIndex: ${idx}`);
          return createdIds[idx];
        });

        await ctx.db.patch(createdIds[i], { dependsOn: depIds });

        for (const depId of depIds) {
          const depTask = await ctx.db.get(depId);
          if (depTask) {
            const existingBlocks = (depTask as any).blocks || [];
            await ctx.db.patch(depId, {
              blocks: [...existingBlocks, createdIds[i]],
            });
          }
        }
      }
    }

    // 4. Wake up agents whose tasks have no dependencies
    const agentsToWake = new Set<string>();
    for (let i = 0; i < plan.tasks.length; i++) {
      const subtask = plan.tasks[i];
      if (!subtask.dependsOnIndex || subtask.dependsOnIndex.length === 0) {
        agentsToWake.add(subtask.assignee);
      }
    }
    let wakeupIndex = 0;
    for (const agentName of agentsToWake) {
      const idx = plan.tasks.findIndex((s) => s.assignee === agentName);
      if (idx >= 0) {
        await ctx.scheduler.runAfter(wakeupIndex * 30_000, internal.agentWakeup.triggerWakeup, {
          agentName,
          taskId: createdIds[idx] as string,
          reason: "task_delegated",
        });
        wakeupIndex++;
      }
    }

    // 5. Post delegation summary comment on parent task
    const summary = plan.tasks
      .map(
        (s, i) =>
          `• ${s.assignee}: "${s.title}"${
            s.dependsOnIndex?.length
              ? ` (depends on subtask ${s.dependsOnIndex
                  .map((idx) => idx + 1)
                  .join(", ")})`
              : ""
          }`
      )
      .join("\n");

    await ctx.db.insert("comments", {
      taskId: parentTaskId,
      author: "Autopilot",
      content: `🚀 Mission launched via Autopilot!\n\nGoal: ${session.goal}\n\nDelegation plan:\n${summary}`,
      mentions: [...agentsToWake],
      createdAt: now,
    });

    // 6. Log activity
    await ctx.db.insert("activity", {
      timestamp: now,
      agentName: "Kaze",
      action: "autopilot_launched",
      details: `Autopilot launched mission "${plan.missionTitle}" with ${plan.tasks.length} tasks`,
      taskId: parentTaskId as string,
    });

    // 7. Update session
    await ctx.db.patch(args.sessionId, {
      status: "launched",
      missionId,
      launchedAt: now,
      plan: args.plan,
    });

    return { missionId, parentTaskId, subtaskIds: createdIds };
  },
});

// ── Internal mutations ────────────────────────────────────────

/** Create a new autopilot session (internal, called by decomposeMission action) */
export const createSession = internalMutation({
  args: {
    userId: v.string(),
    goal: v.string(),
    context: v.optional(v.string()),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("autopilotSessions", {
      userId: args.userId,
      goal: args.goal,
      context: args.context,
      plan: args.plan,
      status: "reviewing",
      createdAt: Date.now(),
    });
  },
});
