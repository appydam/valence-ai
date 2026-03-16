import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const STAGGER_INTERVAL_MS = 30_000; // 30 seconds between agent wakeups
const RECOVERY_COMMENT_COOLDOWN_MS = 30 * 60 * 1000; // Only post 1 recovery comment per task per 30 min

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
    const twoMinutesAgo = now - 2 * 60 * 1000;
    // No upper bound — tasks stuck for hours should still be recovered, not abandoned

    let wakeupCount = 0;
    let skippedCount = 0;
    let wakeupIndex = 0;

    // --- Stuck "assigned" tasks ---
    const assignedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "assigned"))
      .collect();

    // Any assigned task stuck >3min — no upper bound. Previously capped at 1hr which
    // caused tasks to become permanently invisible if nobody touched them.
    const stuckAssigned = assignedTasks.filter((t) => {
      if (!t.assignee) return false;
      const taskTime = t.updatedAt || t._creationTime;
      return taskTime < threeMinutesAgo;
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
          console.log(`[WakeupSweep] Task ${task._id} stuck in assigned for ${assignee}, triggering wakeup (stagger ${wakeupIndex * STAGGER_INTERVAL_MS}ms)`);
          await ctx.scheduler.runAfter(wakeupIndex * STAGGER_INTERVAL_MS, internal.agentWakeup.triggerWakeup, {
            agentName: assignee,
            taskId: task._id as string,
            reason: "sweep_fallback",
          });
          wakeupIndex++;
          wakeupCount++;
        }
      }
    }

    // --- Stuck "in_progress" tasks (agent session crashed) ---
    const inProgressTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .collect();

    // Any in_progress task with no heartbeat for >15min — no upper bound.
    const stuckInProgress = inProgressTasks.filter((t) => {
      if (!t.assignee) return false;
      const lastUpdate = t.updatedAt || t._creationTime;
      return lastUpdate < fifteenMinutesAgo;
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
          console.log(`[WakeupSweep] Task ${task._id} stuck in in_progress for ${assignee} (>15min, agent silent), re-waking (stagger ${wakeupIndex * STAGGER_INTERVAL_MS}ms)`);

          // Deduplicate recovery comments — only post if last one was >30 min ago
          const recentComments = await ctx.db
            .query("comments")
            .withIndex("by_task", (q) => q.eq("taskId", task._id))
            .order("desc")
            .take(5);
          const lastRecoveryComment = recentComments.find(
            (c) => c.author === "System" && c.content.includes("Session recovery")
          );
          const shouldPostComment = !lastRecoveryComment || (now - lastRecoveryComment.createdAt) > RECOVERY_COMMENT_COOLDOWN_MS;

          if (shouldPostComment) {
            await ctx.db.insert("comments", {
              taskId: task._id,
              author: "System",
              content: `⚠️ **Session recovery**: Previous agent session timed out or crashed. Resuming task from last known state. Check your session handoff notes (\`workingContext.recentHandoff\`) to see what was completed. Continue where you left off.`,
              mentions: [assignee],
              createdAt: now,
            });
          }

          // Escalate if task has been stuck too long — check how long it's been in_progress without heartbeat
          const stuckMinutes = Math.round((now - (task.updatedAt || task._creationTime)) / 60000);
          if (stuckMinutes >= 30 && shouldPostComment) {
            // Log escalation to activity feed (visible on dashboard) — once per 30 min via comment cooldown
            await ctx.db.insert("activity", {
              timestamp: now,
              agentName: assignee as any,
              action: "escalation",
              details: `Task "${task.title}" stuck in_progress for ${stuckMinutes}min — agent ${assignee} not responding. Wakeup server may be down or agent session is corrupt.`,
              taskId: task._id,
            });
          }

          await ctx.scheduler.runAfter(wakeupIndex * STAGGER_INTERVAL_MS, internal.agentWakeup.triggerWakeup, {
            agentName: assignee,
            taskId: task._id as string,
            reason: "sweep_stale_progress",
          });
          wakeupIndex++;
          wakeupCount++;
        }
      }
    }

    // --- Orphaned "assigned" tasks with no assignee ---
    const orphanedAssigned = assignedTasks.filter((t) => !t.assignee);
    for (const task of orphanedAssigned) {
      // Move back to inbox so Kaze can delegate properly
      await ctx.db.patch(task._id, { status: "inbox", updatedAt: now });
      await ctx.db.insert("comments", {
        taskId: task._id,
        author: "System",
        content: `⚠️ Task was in "assigned" with no assignee — moved back to inbox for delegation.`,
        mentions: [],
        createdAt: now,
      });
      console.log(`[WakeupSweep] Orphaned task ${task._id} (no assignee) moved to inbox`);
    }

    // --- Blocked tasks whose dependencies are all met but never got woken ---
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const allAssignedAndInProgress = [
      ...assignedTasks,
      ...inProgressTasks,
    ].filter((t) => {
      if (!t.assignee || !t.dependsOn || t.dependsOn.length === 0) return false;
      const taskTime = t.updatedAt || t._creationTime;
      return taskTime < fiveMinutesAgo; // Only check tasks idle >5 min
    });

    for (const task of allAssignedAndInProgress) {
      const deps = await Promise.all(
        task.dependsOn!.map((depId: any) => ctx.db.get(depId))
      );
      const allMet = deps.every((d: any) => d && (d.status === "done" || d.status === "cancelled"));
      if (allMet) {
        // Dependencies resolved but task never progressed — re-wake the agent
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_name", (q) => q.eq("name", task.assignee!))
          .unique();
        const agentActive = agent && agent.status === "working" && agent.lastHeartbeat > twoMinutesAgo;
        if (!agentActive) {
          console.log(`[WakeupSweep] Task ${task._id} has all deps met but idle >5min, re-waking ${task.assignee}`);
          await ctx.scheduler.runAfter(wakeupIndex * STAGGER_INTERVAL_MS, internal.agentWakeup.triggerWakeup, {
            agentName: task.assignee!,
            taskId: task._id as string,
            reason: "dependency_resolved_sweep",
          });
          wakeupIndex++;
          wakeupCount++;
        }
      }
    }

    if (wakeupCount > 0 || skippedCount > 0 || stuckAssigned.length > 0 || stuckInProgress.length > 0 || orphanedAssigned.length > 0) {
      console.log(
        `[WakeupSweep] Found ${stuckAssigned.length} stuck assigned, ${stuckInProgress.length} stale in_progress, ${orphanedAssigned.length} orphaned. ` +
        `Triggered ${wakeupCount} wakeup(s), skipped ${skippedCount}.`
      );
    }

    return { stuckAssigned: stuckAssigned.length, stuckInProgress: stuckInProgress.length, orphaned: orphanedAssigned.length, wakeupCount, skippedCount };
  },
});
