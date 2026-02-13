import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
    missionId: v.optional(v.id("missions")),
    dependsOn: v.optional(v.array(v.id("tasks"))), // NEW: task dependencies
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let missionId: Id<"missions"> | undefined = args.missionId || undefined;

    if (missionId) {
      // Link to existing mission — bump its task count
      const mission = await ctx.db
        .query("missions")
        .filter((q) => q.eq(q.field("_id"), missionId))
        .unique();
      if (mission) {
        await ctx.db.patch(mission._id, {
          taskCount: mission.taskCount + 1,
        });
      }
    } else if (args.creator === "Human") {
      // Auto-create a new mission board for Human-created tasks
      missionId = await ctx.db.insert("missions", {
        title: args.title,
        description: args.description,
        status: "active",
        createdBy: args.creator,
        createdAt: now,
        taskCount: 1,
        completedTaskCount: 0,
      });
    } else {
      // Agent-created task without explicit missionId — auto-link to the most recent active mission
      const activeMissions = await ctx.db
        .query("missions")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .collect();
      if (activeMissions.length > 0) {
        // Pick the most recently created active mission
        const latest = activeMissions.sort((a, b) => b.createdAt - a.createdAt)[0];
        missionId = latest._id;
        await ctx.db.patch(missionId, {
          taskCount: latest.taskCount + 1,
        });
      }
    }

    const taskId = await ctx.db.insert("tasks", {
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
      ...(missionId ? { missionId } : {}),
      ...(args.dependsOn ? { dependsOn: args.dependsOn } : {}),
    });

    // Auto-update assigned agent's status to "working"
    if (args.assignee) {
      const agent = await ctx.db
        .query("agents")
        .withIndex("by_name", (q) => q.eq("name", args.assignee!))
        .unique();
      if (agent && (agent.status === "offline" || agent.status === "idle")) {
        await ctx.db.patch(agent._id, {
          status: "working",
          currentTaskId: taskId as any,
          lastHeartbeat: now,
        });
      }
    }

    // Update blocking relationship for dependencies
    if (args.dependsOn) {
      for (const depId of args.dependsOn) {
        const depTask = await ctx.db.get(depId);
        if (depTask) {
          const existingBlocks = depTask.blocks || [];
          await ctx.db.patch(depId, {
            blocks: [...existingBlocks, taskId],
          });
        }
      }
    }

    return { taskId, missionId };
  },
});

export const listByMission = query({
  args: { missionId: v.optional(v.id("missions")) },
  handler: async (ctx, args) => {
    if (args.missionId) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_mission", (q) => q.eq("missionId", args.missionId))
        .collect();
    }
    // Return all tasks if no missionId
    return await ctx.db.query("tasks").collect();
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
    missionId: v.optional(v.id("missions")),
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

    // If linking to a new mission, bump its task count
    if (updates.missionId && updates.missionId !== existing.missionId) {
      const mission = await ctx.db
        .query("missions")
        .filter((q) => q.eq(q.field("_id"), updates.missionId))
        .unique();
      if (mission) {
        await ctx.db.patch(mission._id, {
          taskCount: mission.taskCount + 1,
        });
      }
    }
    if (updates.status === "done" && existing.status !== "done") {
      updates.completedAt = Date.now();

      // Update agent: increment tasksCompleted, clear currentTask, set idle
      if (existing.assignee) {
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_name", (q) => q.eq("name", existing.assignee!))
          .unique();
        if (agent) {
          // Check if agent has other active tasks
          const otherActiveTasks = await ctx.db
            .query("tasks")
            .withIndex("by_assignee", (q) => q.eq("assignee", existing.assignee!))
            .collect();
          const stillWorking = otherActiveTasks.some(
            (t) => t._id !== id && (t.status === "in_progress" || t.status === "assigned")
          );
          await ctx.db.patch(agent._id, {
            tasksCompleted: agent.tasksCompleted + 1,
            ...(stillWorking ? {} : { status: "idle", currentTaskId: undefined }),
          });
        }
      }

      // Increment mission completedTaskCount
      if (existing.missionId) {
        const mission = await ctx.db.get(existing.missionId);
        if (mission) {
          await ctx.db.patch(existing.missionId, {
            completedTaskCount: mission.completedTaskCount + 1,
          });
        }
      }
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
    const now = Date.now();
    await ctx.db.patch(args.id, {
      assignee: args.agentName,
      status: "in_progress",
      updatedAt: now,
    });

    // Auto-update agent status to "working"
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.agentName))
      .unique();
    if (agent) {
      await ctx.db.patch(agent._id, {
        status: "working",
        currentTaskId: args.id as any,
        lastHeartbeat: now,
      });
    }
  },
});

// Cleanup: move tasks that don't belong to a mission into their own mission
export const fixOrphanedTasks = mutation({
  args: {},
  handler: async (ctx) => {
    // Find all tasks and missions
    const allTasks = await ctx.db.query("tasks").collect();
    const allMissions = await ctx.db
      .query("missions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    if (allMissions.length <= 1) return { fixed: 0 };

    // For each mission, check if any tasks were created BEFORE the mission
    // and likely don't belong there (they were force-linked by the old fix)
    // Better approach: tasks created by agents that were never explicitly
    // assigned to a mission should go to their own "Agent Delegated Tasks" mission

    // Find tasks that were created by agents (not Human) and linked to a mission
    // whose title doesn't match what they're about
    const solidusMission = allMissions.find((m) => m.title.includes("Solidus"));
    if (!solidusMission) return { fixed: 0 };

    // Get tasks in the Solidus mission that aren't about Solidus
    const solidusTasks = allTasks.filter((t) =>
      t.missionId?.toString() === solidusMission._id.toString()
    );

    const wronglyLinked = solidusTasks.filter((t) => {
      const title = t.title.toLowerCase();
      return !title.includes("solidus") && !title.includes("sales intelligence");
    });

    if (wronglyLinked.length === 0) return { fixed: 0 };

    // Create a new mission for these agent tasks
    const now = Date.now();
    const newMissionId = await ctx.db.insert("missions", {
      title: "Agent Delegated Tasks",
      description: "Tasks created and delegated by Kaze to the agent squad",
      status: "active",
      createdBy: "Kaze",
      createdAt: now,
      taskCount: wronglyLinked.length,
      completedTaskCount: wronglyLinked.filter((t) => t.status === "done").length,
    });

    // Move the wrongly-linked tasks
    for (const task of wronglyLinked) {
      await ctx.db.patch(task._id, { missionId: newMissionId });
    }

    // Fix the Solidus mission task count
    const correctCount = solidusTasks.length - wronglyLinked.length;
    const correctCompleted = solidusTasks
      .filter((t) => !wronglyLinked.includes(t) && t.status === "done")
      .length;
    await ctx.db.patch(solidusMission._id, {
      taskCount: correctCount,
      completedTaskCount: correctCompleted,
    });

    return { fixed: wronglyLinked.length, newMissionId };
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
