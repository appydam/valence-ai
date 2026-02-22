import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

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

/**
 * List only active tasks (assigned/in_progress) for an agent.
 * Used by heartbeat to avoid returning done/cancelled/inbox tasks.
 * Truncates deliverable content to save context for agents.
 */
export const listActive = query({
  args: {
    assignee: v.string(),
  },
  handler: async (ctx, args) => {
    const assigned = await ctx.db
      .query("tasks")
      .withIndex("by_assignee_status", (q) =>
        q.eq("assignee", args.assignee as any).eq("status", "assigned")
      )
      .take(10);

    const inProgress = await ctx.db
      .query("tasks")
      .withIndex("by_assignee_status", (q) =>
        q.eq("assignee", args.assignee as any).eq("status", "in_progress")
      )
      .take(10);

    const inReview = await ctx.db
      .query("tasks")
      .withIndex("by_assignee_status", (q) =>
        q.eq("assignee", args.assignee as any).eq("status", "in_review")
      )
      .take(10);

    const tasks = [...assigned, ...inProgress, ...inReview];

    // Truncate deliverable content to save agent context
    return tasks.map((t) => ({
      ...t,
      deliverables: t.deliverables.map((d) => ({
        ...d,
        content: d.content.length > 200 ? d.content.slice(0, 200) + "..." : d.content,
      })),
    }));
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
    dependsOn: v.optional(v.array(v.id("tasks"))), // Task dependencies
    requiredIntegrations: v.optional(v.array(v.string())), // NEW: Required blueprint slugs
    requiredUserId: v.optional(v.string()), // NEW: User ID for integration credentials
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
      ...(args.requiredIntegrations ? { requiredIntegrations: args.requiredIntegrations } : {}),
      ...(args.requiredUserId ? { requiredUserId: args.requiredUserId } : {}),
    });

    // Auto-update assigned agent's status and trigger wakeup
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

      // Wake up the agent on the server (non-blocking)
      await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
        agentName: args.assignee,
        taskId: taskId as string,
        reason: "task_created",
      });
    } else {
      // No assignee — task goes to inbox. Wake Kaze to triage/delegate it.
      await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
        agentName: "Kaze",
        taskId: taskId as string,
        reason: "inbox_triage",
      });
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
    // Chain trigger: when a task completes, wake up agents whose blocked tasks are now ready
    if (updates.status === "done" && existing.blocks && existing.blocks.length > 0) {
      for (const blockedTaskId of existing.blocks) {
        const blockedTask = await ctx.db.get(blockedTaskId as Id<"tasks">);
        if (!blockedTask || blockedTask.status === "done" || blockedTask.status === "cancelled") continue;

        if (blockedTask.dependsOn && blockedTask.dependsOn.length > 0) {
          const allDeps = await Promise.all(
            blockedTask.dependsOn.map((depId) => ctx.db.get(depId))
          );
          const allMet = allDeps.every(
            (d) => d && (d.status === "done" || d.status === "cancelled")
          );

          if (allMet && blockedTask.assignee) {
            await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
              agentName: blockedTask.assignee,
              taskId: blockedTaskId as string,
              reason: "dependency_resolved",
            });

            await ctx.db.insert("comments", {
              taskId: blockedTaskId,
              author: "System",
              content: `All dependencies resolved. Task "${existing.title}" is complete — check its deliverables for context. You can now start this task.`,
              mentions: [blockedTask.assignee],
              createdAt: Date.now(),
            });
          }
        }
      }
    }

    // Auto-wake Kaze when any agent submits work for review
    if (updates.status === "in_review" && existing.assignee !== "Kaze") {
      await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
        agentName: "Kaze",
        taskId: id as string,
        reason: "task_ready_for_review",
      });
    }

    await ctx.db.patch(id, updates);

    // If assignee changed, wake up the new agent
    if (updates.assignee && updates.assignee !== existing.assignee) {
      await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
        agentName: updates.assignee,
        taskId: id as string,
        reason: "task_reassigned",
      });
    }
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

    // Auto-update agent status to "working" and wake up agent
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

    // Wake up the agent on the server
    await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
      agentName: args.agentName,
      taskId: args.id as string,
      reason: "task_claimed",
    });
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

    // Auto-process blueprint.json deliverables from doc scraping
    if (args.name === "blueprint.json" && args.type === "json") {
      // Find scraper job ID from task tags (format: "job_k1xyz...")
      const jobTag = task.tags?.find(tag => tag.startsWith("job_"));

      if (jobTag) {
        const jobId = jobTag.replace("job_", "") as Id<"scraperJobs">;

        try {
          // Automatically complete the doc scraping analysis
          await ctx.scheduler.runAfter(0, api.docScraper.completeAnalysis, {
            jobId,
            blueprintJson: args.content,
            createdBy: task.creator || "system",
          });
        } catch (error) {
          console.error("Failed to auto-complete doc scraping:", error);
          // Don't throw - deliverable was still added successfully
        }
      }
    }
  },
});

/**
 * Check if an agent can execute a task based on required integrations
 * Returns whether the user has all required integration connections
 */
export const canAgentExecuteTask = query({
  args: {
    taskId: v.id("tasks"),
    agentName: v.union(
      v.literal("Kaze"),
      v.literal("Scout"),
      v.literal("Forge"),
      v.literal("Ghost")
    ),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      return { canExecute: false, reason: "Task not found" };
    }

    // Check if task requires integrations
    if (!task.requiredIntegrations || task.requiredIntegrations.length === 0) {
      return { canExecute: true };
    }

    // Check if user has required connections
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get blueprint slugs for all active connections
    const connectedBlueprints = new Set(
      await Promise.all(
        connections.map(async (conn) => {
          const bp = await ctx.db.get(conn.blueprintId);
          return bp?.slug;
        })
      )
    );

    // Check which required integrations are missing
    const missingIntegrations = task.requiredIntegrations.filter(
      (slug) => !connectedBlueprints.has(slug)
    );

    if (missingIntegrations.length > 0) {
      return {
        canExecute: false,
        reason: `Missing required integrations: ${missingIntegrations.join(", ")}`,
        missingIntegrations,
      };
    }

    return { canExecute: true };
  },
});

/**
 * Batch delegation: create multiple subtasks from a parent task in one call.
 * Subtasks can reference each other via dependsOnIndex (indices into the subtasks array).
 * Automatically sets up dependency chains, wakes agents, and posts a summary comment.
 */
export const delegateTask = mutation({
  args: {
    parentTaskId: v.id("tasks"),
    subtasks: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        priority: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high"),
          v.literal("urgent")
        ),
        assignee: v.union(
          v.literal("Kaze"),
          v.literal("Scout"),
          v.literal("Forge"),
          v.literal("Ghost")
        ),
        tags: v.array(v.string()),
        dependsOnIndex: v.optional(v.array(v.number())),
        requiredIntegrations: v.optional(v.array(v.string())),
      })
    ),
    delegatedBy: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const parent = await ctx.db.get(args.parentTaskId);
    if (!parent) throw new Error("Parent task not found");

    const now = Date.now();
    const createdIds: Id<"tasks">[] = [];

    // First pass: create all subtasks (without dependsOn — we need IDs first)
    for (const subtask of args.subtasks) {
      const taskId = await ctx.db.insert("tasks", {
        title: subtask.title,
        description: subtask.description,
        status: "assigned",
        priority: subtask.priority,
        assignee: subtask.assignee,
        creator: args.delegatedBy,
        createdAt: now,
        updatedAt: now,
        tags: subtask.tags,
        deliverables: [],
        ...(parent.missionId ? { missionId: parent.missionId } : {}),
        ...(subtask.requiredIntegrations ? { requiredIntegrations: subtask.requiredIntegrations } : {}),
        ...(args.userId ? { requiredUserId: args.userId } : {}),
      });
      createdIds.push(taskId);
    }

    // Second pass: wire up dependsOn and blocks relationships
    for (let i = 0; i < args.subtasks.length; i++) {
      const subtask = args.subtasks[i];
      if (subtask.dependsOnIndex && subtask.dependsOnIndex.length > 0) {
        const depIds = subtask.dependsOnIndex.map((idx) => {
          if (idx < 0 || idx >= createdIds.length) throw new Error(`Invalid dependsOnIndex: ${idx}`);
          return createdIds[idx];
        });

        // Set dependsOn on this task
        await ctx.db.patch(createdIds[i], { dependsOn: depIds });

        // Set blocks on each dependency
        for (const depId of depIds) {
          const depTask = await ctx.db.get(depId);
          if (depTask) {
            const existingBlocks = depTask.blocks || [];
            await ctx.db.patch(depId, {
              blocks: [...existingBlocks, createdIds[i]],
            });
          }
        }
      }
    }

    // Bump mission task count
    if (parent.missionId) {
      const mission = await ctx.db.get(parent.missionId);
      if (mission) {
        await ctx.db.patch(parent.missionId, {
          taskCount: mission.taskCount + args.subtasks.length,
        });
      }
    }

    // Wake up assigned agents (deduplicate)
    const agentsToWake = new Set<string>();
    for (let i = 0; i < args.subtasks.length; i++) {
      const subtask = args.subtasks[i];
      // Only wake agents whose tasks have no dependencies (they can start immediately)
      if (!subtask.dependsOnIndex || subtask.dependsOnIndex.length === 0) {
        agentsToWake.add(subtask.assignee);
      }
    }
    for (const agentName of agentsToWake) {
      const agentTask = createdIds[args.subtasks.findIndex((s) => s.assignee === agentName)];
      await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
        agentName,
        taskId: agentTask as string,
        reason: "task_delegated",
      });
    }

    // Post delegation summary comment on parent task
    const summary = args.subtasks
      .map((s, i) => `• ${s.assignee}: "${s.title}"${s.dependsOnIndex?.length ? ` (depends on subtask ${s.dependsOnIndex.map((idx) => idx + 1).join(", ")})` : ""}`)
      .join("\n");
    const mentionedAgents = [...new Set(args.subtasks.map((s) => s.assignee))];

    await ctx.db.insert("comments", {
      taskId: args.parentTaskId,
      author: args.delegatedBy,
      content: `Delegated into ${args.subtasks.length} subtasks:\n${summary}`,
      mentions: mentionedAgents,
      createdAt: now,
    });

    // Mark parent as in_progress (Kaze owns coordination)
    await ctx.db.patch(args.parentTaskId, {
      status: "in_progress",
      updatedAt: now,
    });

    return {
      parentTaskId: args.parentTaskId,
      subtaskIds: createdIds,
      agentsWoken: [...agentsToWake],
    };
  },
});

/**
 * Batch complete: finish a task in ONE call.
 * Adds deliverables, posts comment, logs activity, updates status, sets agent idle.
 * Replicates chain-reaction logic from the update mutation.
 */
export const completeTask = mutation({
  args: {
    taskId: v.id("tasks"),
    agentName: v.union(
      v.literal("Kaze"),
      v.literal("Scout"),
      v.literal("Forge"),
      v.literal("Ghost")
    ),
    deliverables: v.optional(
      v.array(
        v.object({
          name: v.string(),
          type: v.string(),
          content: v.string(),
        })
      )
    ),
    comment: v.optional(v.string()),
    mentions: v.optional(v.array(v.string())),
    activityDetails: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("in_review"), v.literal("done"))
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const now = Date.now();
    const targetStatus = args.status || "in_review";

    // 1. Add deliverables
    if (args.deliverables && args.deliverables.length > 0) {
      await ctx.db.patch(args.taskId, {
        deliverables: [...task.deliverables, ...args.deliverables],
      });
    }

    // 2. Post comment
    if (args.comment) {
      await ctx.db.insert("comments", {
        taskId: args.taskId,
        author: args.agentName,
        content: args.comment,
        mentions: args.mentions || [],
        createdAt: now,
      });
    }

    // 3. Log activity
    if (args.activityDetails) {
      await ctx.db.insert("activity", {
        timestamp: now,
        agentName: args.agentName,
        action: "task_completed",
        details: args.activityDetails,
        taskId: args.taskId as unknown as string,
      });
    }

    // 4. Update task status
    const statusUpdates: Record<string, any> = {
      status: targetStatus,
      updatedAt: now,
    };
    if (targetStatus === "done") {
      statusUpdates.completedAt = now;
    }
    await ctx.db.patch(args.taskId, statusUpdates);

    // 5. Update agent: increment tasksCompleted, check if still has active tasks
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.agentName))
      .unique();
    if (agent) {
      const otherActiveTasks = await ctx.db
        .query("tasks")
        .withIndex("by_assignee_status", (q) =>
          q.eq("assignee", args.agentName).eq("status", "in_progress")
        )
        .take(5);
      const otherAssigned = await ctx.db
        .query("tasks")
        .withIndex("by_assignee_status", (q) =>
          q.eq("assignee", args.agentName).eq("status", "assigned")
        )
        .take(5);
      const stillWorking = [...otherActiveTasks, ...otherAssigned].some(
        (t) => t._id !== args.taskId
      );
      await ctx.db.patch(agent._id, {
        tasksCompleted: agent.tasksCompleted + 1,
        ...(stillWorking ? {} : { status: "idle", currentTaskId: undefined }),
      });
    }

    // 6. Chain reactions (same as update mutation)

    // 6a. If done, increment mission completedTaskCount
    if (targetStatus === "done" && task.missionId) {
      const mission = await ctx.db.get(task.missionId);
      if (mission) {
        await ctx.db.patch(task.missionId, {
          completedTaskCount: mission.completedTaskCount + 1,
        });
      }
    }

    // 6b. If done, wake agents whose blocked tasks are now ready
    if (targetStatus === "done" && task.blocks && task.blocks.length > 0) {
      for (const blockedTaskId of task.blocks) {
        const blockedTask = await ctx.db.get(blockedTaskId as Id<"tasks">);
        if (!blockedTask || blockedTask.status === "done" || blockedTask.status === "cancelled") continue;

        if (blockedTask.dependsOn && blockedTask.dependsOn.length > 0) {
          const allDeps = await Promise.all(
            blockedTask.dependsOn.map((depId) => ctx.db.get(depId))
          );
          const allMet = allDeps.every(
            (d) => d && (d.status === "done" || d.status === "cancelled")
          );

          if (allMet && blockedTask.assignee) {
            await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
              agentName: blockedTask.assignee,
              taskId: blockedTaskId as string,
              reason: "dependency_resolved",
            });

            await ctx.db.insert("comments", {
              taskId: blockedTaskId,
              author: "System",
              content: `All dependencies resolved. Task "${task.title}" is complete — check its deliverables for context. You can now start this task.`,
              mentions: [blockedTask.assignee],
              createdAt: now,
            });
          }
        }
      }
    }

    // 6c. Auto-wake Kaze when any agent submits work for review
    if (targetStatus === "in_review" && args.agentName !== "Kaze") {
      await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
        agentName: "Kaze",
        taskId: args.taskId as string,
        reason: "task_ready_for_review",
      });
    }

    return { ok: true, taskId: args.taskId, status: targetStatus };
  },
});

/**
 * Review sweep: find tasks stuck in "in_review" for over 1 hour and wake Kaze.
 * Called by cron every 2 hours.
 */
export const reviewSweep = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    const inReviewTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "in_review"))
      .collect();

    const staleTasks = inReviewTasks.filter(
      (t) => t.updatedAt && t.updatedAt < oneHourAgo
    );

    if (staleTasks.length > 0) {
      // Wake Kaze with the oldest stale task
      const oldest = staleTasks.sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0))[0];
      await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
        agentName: "Kaze",
        taskId: oldest._id as string,
        reason: "stale_review",
      });
    }

    return { staleCount: staleTasks.length };
  },
});
