import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Check if a task's dependencies are all completed
 */
// @ts-ignore TS2589 - Convex type depth with v.string() agentName
export const areDependenciesMet = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId) as any;
    if (!task) return { ready: false, reason: "Task not found" };

    if (!task.dependsOn || task.dependsOn.length === 0) {
      return { ready: true, reason: "No dependencies" };
    }

    const depStatuses = await Promise.all(
      task.dependsOn.map(async (depId: any) => {
        const dep = await ctx.db.get(depId) as any;
        return { id: depId, status: dep?.status, title: dep?.title };
      })
    );

    const incomplete = depStatuses.filter(
      (d: any) => d.status !== "done" && d.status !== "cancelled"
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
// @ts-ignore TS2589 - Convex type depth with v.string() agentName
export const getBlockedTasks = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId) as any;
    if (!task || !task.blocks) return [];

    const blockedTasks = await Promise.all(
      task.blocks.map((id: any) => ctx.db.get(id))
    );

    return blockedTasks.filter((t) => t !== null);
  },
});

/**
 * Get tasks that are ready to be claimed (all dependencies met)
 */
// @ts-ignore TS2589 - Convex type depth with v.string() agentName
export const getReadyTasks = query({
  args: {
    assignee: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tasks = await ctx.db.query("tasks").collect() as any[];

    if (args.assignee) {
      tasks = tasks.filter((t: any) => t.assignee === args.assignee);
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
        task.dependsOn.map((id: any) => ctx.db.get(id))
      );

      const allComplete = (deps as any[]).every(
        (d: any) => d && (d.status === "done" || d.status === "cancelled")
      );

      if (allComplete) {
        ready.push(task);
      }
    }

    return ready;
  },
});
