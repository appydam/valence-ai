import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Fallback sweep for stuck tasks.
 *
 * Runs every 10 minutes via cron. Catches tasks stuck in "assigned" status
 * for >5 minutes — meaning the immediate wakeup webhook failed.
 *
 * Smart behavior:
 *   - Skips agents that heartbeated recently (already active)
 *   - Only wakes ONE agent per sweep (most urgent task) to avoid thundering herd
 *   - Skips tasks stuck in "assigned" for >1 hour (likely needs manual intervention)
 *   - For "in_progress" tasks, only wakes if agent hasn't heartbeated in 15+ min
 */
export const sweep = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
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

    // Only tasks stuck 5min - 1hr. Beyond 1hr = likely needs manual action, don't waste sessions.
    const stuckAssigned = assignedTasks.filter((t) => {
      if (!t.assignee) return false;
      const taskTime = t.updatedAt || t._creationTime;
      return taskTime < fiveMinutesAgo && taskTime > oneHourAgo;
    });

    // Wake at most 1 agent for assigned tasks (oldest first = most urgent)
    if (stuckAssigned.length > 0) {
      const oldest = stuckAssigned.sort(
        (a, b) => (a.updatedAt || a._creationTime) - (b.updatedAt || b._creationTime)
      )[0];

      const agent = await ctx.db
        .query("agents")
        .withIndex("by_name", (q) => q.eq("name", oldest.assignee!))
        .unique();

      if (agent && agent.status === "working" && agent.lastHeartbeat > twoMinutesAgo) {
        console.log(`[WakeupSweep] ${oldest.assignee} already active, skipping task ${oldest._id}`);
        skippedCount++;
      } else {
        console.log(`[WakeupSweep] Task ${oldest._id} stuck in assigned for ${oldest.assignee}, triggering wakeup`);
        await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
          agentName: oldest.assignee!,
          taskId: oldest._id as string,
          reason: "sweep_fallback",
        });
        wakeupCount++;
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

    // Wake at most 1 agent for stale in_progress tasks
    if (stuckInProgress.length > 0) {
      const oldest = stuckInProgress.sort(
        (a, b) => (a.updatedAt || a._creationTime) - (b.updatedAt || b._creationTime)
      )[0];

      const agent = await ctx.db
        .query("agents")
        .withIndex("by_name", (q) => q.eq("name", oldest.assignee!))
        .unique();

      if (agent && agent.status === "working" && agent.lastHeartbeat > twoMinutesAgo) {
        console.log(`[WakeupSweep] ${oldest.assignee} already active, skipping stale task ${oldest._id}`);
        skippedCount++;
      } else {
        console.log(`[WakeupSweep] Task ${oldest._id} stuck in in_progress for ${oldest.assignee} (>15min), re-waking`);
        // Post a crash recovery comment so the agent knows it's resuming
        await ctx.db.insert("comments", {
          taskId: oldest._id,
          author: "System",
          content: `⚠️ **Session recovery**: Previous agent session timed out or crashed. Resuming task from last known state. Check your session handoff notes (\`workingContext.recentHandoff\`) to see what was completed. Continue where you left off.`,
          mentions: oldest.assignee ? [oldest.assignee] : [],
          createdAt: now,
        });
        await ctx.scheduler.runAfter(0, internal.agentWakeup.triggerWakeup, {
          agentName: oldest.assignee!,
          taskId: oldest._id as string,
          reason: "sweep_stale_progress",
        });
        wakeupCount++;
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
