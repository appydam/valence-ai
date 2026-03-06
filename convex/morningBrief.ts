import { v } from "convex/values";
import { query, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { AgentName } from "./schema";

const AGENT_NAMES: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"];

/**
 * Morning Brief — CEO Daily Digest
 *
 * Cron runs daily, aggregates last 24h of tasks/activity/agent health,
 * generates a structured brief, and stores it for the dashboard.
 */

// ── Queries ──────────────────────────────────────────────────

/**
 * Get today's brief (or the most recent one).
 */
export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const brief = await ctx.db
      .query("morningBriefs")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (brief) return brief;

    // Fall back to most recent brief
    return await ctx.db
      .query("morningBriefs")
      .order("desc")
      .first();
  },
});

/**
 * Get brief history (last N briefs).
 */
export const getHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 14;
    return await ctx.db
      .query("morningBriefs")
      .order("desc")
      .take(limit);
  },
});

/**
 * Get a specific brief by date.
 */
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("morningBriefs")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
  },
});

// ── Brief Generation (Cron Handler) ─────────────────────────

/**
 * Generate morning brief — called by cron daily.
 * This is an internalAction because it may call external APIs (Claude for narrative).
 * For now, we generate the brief from data alone (no Claude call).
 */
export const generate = internalAction({
  args: {},
  handler: async (ctx) => {
    // Aggregate data via internal mutation (DB access)
    const briefData = await ctx.runMutation(internal.morningBrief.aggregateAndStore, {});
    console.log(`[Morning Brief] Generated for ${briefData.date} — ${briefData.tasksCompleted} completed, ${briefData.tasksStuck} stuck`);
  },
});

/**
 * Aggregate 24h of data and store the brief.
 */
export const aggregateAndStore = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().split("T")[0];

    // Check if brief already exists for today
    const existing = await ctx.db
      .query("morningBriefs")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
    if (existing && existing.status === "ready") {
      return existing;
    }

    // ── Gather data ──

    // All tasks
    const allTasks = await ctx.db.query("tasks").collect();

    // Tasks completed in last 24h
    const completedRecently = allTasks.filter(
      (t) => t.status === "done" && t.completedAt && t.completedAt > twentyFourHoursAgo
    );

    // Tasks created in last 24h
    const createdRecently = allTasks.filter(
      (t) => t.createdAt > twentyFourHoursAgo
    );

    // Stuck tasks: in_progress for >2 hours or assigned for >1 hour
    const stuckTasks = allTasks.filter((t) => {
      if (t.status === "in_progress" && t.updatedAt < now - 2 * 60 * 60 * 1000) return true;
      if (t.status === "assigned" && t.updatedAt < now - 1 * 60 * 60 * 1000) return true;
      return false;
    });

    const inProgressTasks = allTasks.filter((t) => t.status === "in_progress");
    const inReviewTasks = allTasks.filter((t) => t.status === "in_review");
    const upcomingTasks = allTasks.filter(
      (t) => t.status === "inbox" || t.status === "assigned"
    );

    // ── Agent performance ──
    const agents = await ctx.db.query("agents").collect();
    const agentPerformance = AGENT_NAMES.map((name) => {
      const agent = agents.find((a) => a.name === name);
      const handled = allTasks.filter(
        (t) => t.assignee === name && t.updatedAt > twentyFourHoursAgo
      ).length;
      const completed = completedRecently.filter((t) => t.assignee === name).length;

      return {
        agent: name,
        tasksHandled: handled,
        tasksCompleted: completed,
        status: agent?.status ?? "offline",
      };
    });

    // ── Highlights (completed tasks with deliverables) ──
    const highlights = completedRecently
      .filter((t) => t.deliverables && t.deliverables.length > 0)
      .slice(0, 5)
      .map((t) => ({
        title: t.title,
        description: t.deliverables[0]?.name ?? "Task completed",
        agent: t.assignee ?? "Unknown",
        taskId: t._id,
      }));

    // ── Blockers ──
    const blockers = stuckTasks.slice(0, 5).map((t) => {
      const stuckHours = Math.round((now - t.updatedAt) / (60 * 60 * 1000));
      return {
        title: t.title,
        description: `Stuck in ${t.status.replace("_", " ")} for ${stuckHours}h`,
        suggestedAction: t.status === "assigned"
          ? "Check if agent is online. Consider reassigning."
          : "Check agent logs. May need to restart session.",
        taskId: t._id,
      };
    });

    // ── Generate narrative ──
    const narrative = generateNarrative({
      tasksCompleted: completedRecently.length,
      tasksCreated: createdRecently.length,
      stuckCount: stuckTasks.length,
      highlights,
      blockers,
      agentPerformance,
    });

    // ── Store ──
    const briefData = {
      date: today,
      status: "ready" as const,
      tasksCompleted: completedRecently.length,
      tasksCreated: createdRecently.length,
      tasksStuck: stuckTasks.length,
      tasksInProgress: inProgressTasks.length,
      tasksInReview: inReviewTasks.length,
      highlights,
      blockers,
      agentPerformance,
      upcomingTasks: upcomingTasks.length,
      narrative,
      generatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, briefData);
    } else {
      await ctx.db.insert("morningBriefs", briefData);
    }

    return briefData;
  },
});

/**
 * Manually trigger brief generation (for testing or on-demand).
 */
export const generateNow = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Just schedule the action
    await ctx.scheduler.runAfter(0, internal.morningBrief.generate, {});
    return { scheduled: true };
  },
});

// ── Helpers ─────────────────────────────────────────────────

function generateNarrative(data: {
  tasksCompleted: number;
  tasksCreated: number;
  stuckCount: number;
  highlights: { title: string; agent: string }[];
  blockers: { title: string }[];
  agentPerformance: { agent: string; tasksCompleted: number; status: string }[];
}): string {
  const parts: string[] = [];

  // Opening
  if (data.tasksCompleted === 0 && data.tasksCreated === 0) {
    parts.push("Quiet day — no tasks were completed or created in the last 24 hours.");
  } else {
    parts.push(
      `Your AI team completed ${data.tasksCompleted} task${data.tasksCompleted !== 1 ? "s" : ""} and ${data.tasksCreated} new task${data.tasksCreated !== 1 ? "s were" : " was"} created.`
    );
  }

  // Blockers
  if (data.stuckCount > 0) {
    parts.push(
      `${data.stuckCount} task${data.stuckCount !== 1 ? "s need" : " needs"} attention — check the blockers section below.`
    );
  } else {
    parts.push("No blockers — everything is flowing smoothly.");
  }

  // Top performer
  const topAgent = [...data.agentPerformance].sort(
    (a, b) => b.tasksCompleted - a.tasksCompleted
  )[0];
  if (topAgent && topAgent.tasksCompleted > 0) {
    parts.push(
      `Top performer: ${topAgent.agent} with ${topAgent.tasksCompleted} completed task${topAgent.tasksCompleted !== 1 ? "s" : ""}.`
    );
  }

  // Offline agents
  const offlineAgents = data.agentPerformance.filter((a) => a.status === "offline");
  if (offlineAgents.length > 0) {
    parts.push(
      `${offlineAgents.length} agent${offlineAgents.length !== 1 ? "s" : ""} offline: ${offlineAgents.map((a) => a.agent).join(", ")}.`
    );
  }

  return parts.join(" ");
}
