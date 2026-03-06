import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Fallback sweep for stuck tasks.
 *
 * Runs every 2 minutes via cron. Catches tasks stuck in "assigned" status
 * for >3 minutes — meaning the immediate wakeup webhook or auto-pickup failed.
 *
 * Smart behavior:
 *   - Skips agents that heartbeated recently (already active)
 *   - Wakes ALL stuck agents (one wakeup per agent, oldest task first)
 *   - Skips tasks stuck in "assigned" for >1 hour (likely needs manual intervention)
 *   - For "in_progress" tasks, only wakes if agent hasn't heartbeated in 15+ min
 */
export const sweep = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const threeMinutesAgo = now - 3 * 60 * 1000;
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    const twoMinutesAgo = now - 2 * 60 * 1000;

    let wakeupCount = 0;
    let skippedCount = 0;

    // --- Stuck "assigned" tasks ---
    const assignedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "assigned"))
      .collect();

    // Only tasks stuck 3min - 1hr. Beyond 1hr = likely needs manual action.
    const stuckAssigned = assignedTasks.filter((t) => {
      if (!t.assignee) return false;
      const taskTime = t.updatedAt || t._creationTime;
      return taskTime < threeMinutesAgo && taskTime > oneHourAgo;
    });

    // Wake ALL stuck agents (group by assignee — one wakeup per agent, oldest task)
    if (stuckAssigned.length > 0) {
      const agentTasks = new Map<string, (typeof stuckAssigned)[0]>();
      for (const task of stuckAssigned) {
        const existing = agentTasks.get(task.assignee!);
        if (!existing || (task.updatedAt || task._creationTime) < (existing.updatedAt || existing._creationTime)) {
          agentTasks.set(task.assignee!, task);
        }
      }

      for (const [assignee, task] of agentTasks) {
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_name", (q) => q.eq("name", assignee))
          .unique();

        const agentActiveOnThisTask =
          agent &&
          agent.status === "working" &&
          agent.lastHeartbeat > twoMinutesAgo &&
          agent.currentTaskId === task._id;

        if (agentActiveOnThisTask) {
          console.log(`[WakeupSweep] ${assignee} already active on task ${task._id}, skipping`);
          skippedCount++;
        } else {
          console.log(`[WakeupSweep] Task ${task._id} stuck in assigned for ${assignee}, triggering wakeup`);
          await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
            agentName: assignee,
            taskId: task._id as string,
            reason: "sweep_fallback",
          });
          wakeupCount++;
        }
      }
    }

    // --- Stuck "in_progress" tasks (agent session crashed) ---
    const inProgressTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .collect();

    const stuckInProgress = inProgressTasks.filter((t) => {
      if (!t.assignee) return false;
      const lastUpdate = t.updatedAt || t._creationTime;
      return lastUpdate < fifteenMinutesAgo && lastUpdate > oneHourAgo;
    });

    // Wake ALL stuck in_progress agents (group by assignee)
    if (stuckInProgress.length > 0) {
      const agentTasks = new Map<string, (typeof stuckInProgress)[0]>();
      for (const task of stuckInProgress) {
        const existing = agentTasks.get(task.assignee!);
        if (!existing || (task.updatedAt || task._creationTime) < (existing.updatedAt || existing._creationTime)) {
          agentTasks.set(task.assignee!, task);
        }
      }

      for (const [assignee, task] of agentTasks) {
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_name", (q) => q.eq("name", assignee))
          .unique();

        const taskLastTouched = task.updatedAt || task._creationTime;
        const agentGenuinelyActive =
          agent &&
          agent.status === "working" &&
          agent.lastHeartbeat > twoMinutesAgo &&
          agent.lastHeartbeat > taskLastTouched;

        if (agentGenuinelyActive) {
          console.log(`[WakeupSweep] ${assignee} actively heartbeating after task update, skipping ${task._id}`);
          skippedCount++;
        } else {
          console.log(`[WakeupSweep] Task ${task._id} stuck in in_progress for ${assignee} (>15min, agent silent), re-waking`);
          await ctx.db.insert("comments", {
            taskId: task._id,
            author: "System",
            content: `⚠️ **Session recovery**: Previous agent session timed out or crashed. Resuming task from last known state. Check your session handoff notes (\`workingContext.recentHandoff\`) to see what was completed. Continue where you left off.`,
            mentions: [assignee],
            createdAt: now,
          });
          await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
            agentName: assignee,
            taskId: task._id as string,
            reason: "sweep_stale_progress",
          });
          wakeupCount++;
        }
      }
    }

    if (wakeupCount > 0 || skippedCount > 0 || stuckAssigned.length > 0 || stuckInProgress.length > 0) {
      console.log(
        `[WakeupSweep] Found ${stuckAssigned.length} stuck assigned, ${stuckInProgress.length} stale in_progress. ` +
        `Triggered ${wakeupCount} wakeup(s), skipped ${skippedCount}.`
      );
    }

    return { stuckAssigned: stuckAssigned.length, stuckInProgress: stuckInProgress.length, wakeupCount, skippedCount };
  },
});
