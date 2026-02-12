import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Check if a task's dependencies are all completed
 */
export const areDependenciesMet = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return { ready: false, reason: "Task not found" };
    
    if (!task.dependsOn || task.dependsOn.length === 0) {
      return { ready: true, reason: "No dependencies" };
    }

    const depStatuses = await Promise.all(
      task.dependsOn.map(async (depId) => {
        const dep = await ctx.db.get(depId);
        return { id: depId, status: dep?.status, title: dep?.title };
      })
    );

    const incomplete = depStatuses.filter(
      (d) => d.status !== "done" && d.status !== "cancelled"
    );

    if (incomplete.length > 0) {
      return {
        ready: false,
        reason: `Blocked by ${incomplete.length} incomplete task(s)`,
        blockedBy: incomplete,
      };
    }

    return { ready: true, reason: "All dependencies complete" };
  },
});

/**
 * Get all tasks that depend on (are blocked by) a given task
 */
export const getBlockedTasks = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task || !task.blocks) return [];

    const blockedTasks = await Promise.all(
      task.blocks.map((id) => ctx.db.get(id))
    );

    return blockedTasks.filter((t) => t !== null);
  },
});

/**
 * Get tasks that are ready to be claimed (all dependencies met)
 */
export const getReadyTasks = query({
  args: {
    assignee: v.optional(
      v.union(
        v.literal("Kaze"),
        v.literal("Scout"),
        v.literal("Forge"),
        v.literal("Ghost")
      )
    ),
  },
  handler: async (ctx, args) => {
    let tasks = await ctx.db.query("tasks").collect();

    if (args.assignee) {
      tasks = tasks.filter((t) => t.assignee === args.assignee);
    }

    // Filter to tasks in inbox or assigned status
    tasks = tasks.filter((t) => t.status === "inbox" || t.status === "assigned");

    // Check each task's dependencies
    const ready = [];
    for (const task of tasks) {
      if (!task.dependsOn || task.dependsOn.length === 0) {
        ready.push(task);
        continue;
      }

      const deps = await Promise.all(
        task.dependsOn.map((id) => ctx.db.get(id))
      );

      const allComplete = deps.every(
        (d) => d && (d.status === "done" || d.status === "cancelled")
      );

      if (allComplete) {
        ready.push(task);
      }
    }

    return ready;
  },
});
