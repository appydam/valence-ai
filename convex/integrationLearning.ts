import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Integration Knowledge Base — Automatic API Pattern Learning
 *
 * Daily cron analyzes the integrationActivity table to detect:
 * - High error rates per integration/tool
 * - Recurring error patterns (rate limits, auth failures, timeouts)
 * - New failure modes not yet captured in agent memories
 *
 * Writes api_quirk memories that are squad-wide so ALL agents benefit.
 * No LLM call needed — pure pattern detection on structured data.
 */

interface ActivityEntry {
  integrationType: string;
  toolName: string;
  status: string;
  errorMessage?: string;
  timestamp: number;
}

interface PatternGroup {
  integration: string;
  tool: string;
  totalCalls: number;
  errorCalls: number;
  errorRate: number;
  errorMessages: Map<string, number>;
}

/** Fetch last 24h of integration activity. */
export const getRecentActivity = internalQuery({
  args: {},
  handler: async (ctx) => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    const activity = await ctx.db
      .query("integrationActivity")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), twentyFourHoursAgo))
      .collect();

    return activity;
  },
});

/** Fetch existing api_quirk memories to avoid duplicates. */
export const getExistingApiQuirks = internalQuery({
  args: {},
  handler: async (ctx) => {
    const quirks = await ctx.db
      .query("agentMemory")
      .filter((q) =>
        q.and(
          q.eq(q.field("memoryType"), "api_quirk"),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    return quirks;
  },
});

/** Main analysis action — called by daily cron. */
export const analyzePatterns = internalAction({
  args: {},
  handler: async (ctx) => {
    const [activity, existingQuirks] = await Promise.all([
      ctx.runQuery(internal.integrationLearning.getRecentActivity),
      ctx.runQuery(internal.integrationLearning.getExistingApiQuirks),
    ]);

    if (activity.length === 0) {
      console.log("[IntegrationLearning] No integration activity in last 24h, skipping");
      return;
    }

    // Group by integration + tool
    const groups = new Map<string, PatternGroup>();

    for (const entry of activity) {
      const key = `${entry.integrationType}::${entry.toolName}`;
      if (!groups.has(key)) {
        groups.set(key, {
          integration: entry.integrationType,
          tool: entry.toolName,
          totalCalls: 0,
          errorCalls: 0,
          errorRate: 0,
          errorMessages: new Map(),
        });
      }

      const group = groups.get(key)!;
      group.totalCalls++;

      if (entry.status === "error") {
        group.errorCalls++;
        const msg = entry.errorMessage || "Unknown error";
        // Normalize error messages (strip variable parts like timestamps, IDs)
        const normalizedMsg = msg
          .replace(/\b[0-9a-f]{8,}\b/gi, "<id>")
          .replace(/\d{10,}/g, "<timestamp>")
          .replace(/\d+\.\d+\.\d+\.\d+/g, "<ip>")
          .slice(0, 200);
        group.errorMessages.set(normalizedMsg, (group.errorMessages.get(normalizedMsg) || 0) + 1);
      }
    }

    // Calculate error rates
    for (const group of groups.values()) {
      group.errorRate = group.errorCalls / group.totalCalls;
    }

    // Build set of existing quirk signatures for dedup
    const existingSignatures = new Set(
      existingQuirks.map((q: any) => {
        const integrationTag = q.tags.find((t: string) => !["auto-learned", "auto-extracted"].includes(t));
        return integrationTag || q.title;
      })
    );

    let memoriesWritten = 0;
    let memoriesConfirmed = 0;

    for (const group of groups.values()) {
      // Only act on groups with meaningful data
      if (group.totalCalls < 3) continue;

      // Check for high error rate
      if (group.errorRate > 0.3) {
        const topError = [...group.errorMessages.entries()]
          .sort((a, b) => b[1] - a[1])[0];

        const signature = `${group.integration}/${group.tool}`;

        // Check if we already have a memory for this integration/tool
        const existingQuirk = existingQuirks.find(
          (q: any) =>
            q.tags.includes(group.integration) &&
            q.tags.includes(group.tool) &&
            q.status === "active"
        );

        if (existingQuirk) {
          // Confirm existing memory (it's still happening)
          try {
            await ctx.runMutation(api.agentMemory.confirm, {
              id: existingQuirk._id,
              agentName: "Kaze",
            });
            memoriesConfirmed++;
          } catch (err: any) {
            console.error(`[IntegrationLearning] Failed to confirm memory: ${err.message}`);
          }
        } else {
          // Create new api_quirk memory
          const errorRatePercent = Math.round(group.errorRate * 100);
          const title = `${group.integration} ${group.tool} — ${errorRatePercent}% error rate`;
          const body = `In the last 24 hours, ${group.errorCalls}/${group.totalCalls} calls to ${group.integration}/${group.tool} failed (${errorRatePercent}% error rate). Most common error: "${topError?.[0] || "Unknown"}" (${topError?.[1] || 0} occurrences). Consider adding retry logic or rate limiting for this endpoint.`;

          try {
            await ctx.runMutation(api.agentMemory.write, {
              agentName: "Kaze",
              memoryType: "api_quirk",
              title: title.slice(0, 200),
              body,
              evidence: `Auto-detected from ${group.totalCalls} API calls in 24h window`,
              tags: [group.integration, group.tool, "auto-learned"],
              importanceScore: Math.min(0.9, 0.5 + group.errorRate * 0.5),
              isSquadWide: true,
            });
            memoriesWritten++;
          } catch (err: any) {
            console.error(`[IntegrationLearning] Failed to write memory: ${err.message}`);
          }
        }
      }

      // Check for specific error patterns (rate limits)
      const rateLimitErrors = [...group.errorMessages.entries()]
        .filter(([msg]) =>
          msg.toLowerCase().includes("rate limit") ||
          msg.toLowerCase().includes("429") ||
          msg.toLowerCase().includes("too many requests")
        );

      if (rateLimitErrors.length > 0 && !existingSignatures.has(`${group.integration}/${group.tool}/ratelimit`)) {
        const totalRateLimits = rateLimitErrors.reduce((sum, [, count]) => sum + count, 0);

        // Only write if this is a new pattern (not already covered by error rate memory above)
        const alreadyCovered = existingQuirks.find(
          (q: any) =>
            q.tags.includes(group.integration) &&
            (q.title.toLowerCase().includes("rate limit") || q.body.toLowerCase().includes("rate limit"))
        );

        if (!alreadyCovered && totalRateLimits >= 2) {
          try {
            await ctx.runMutation(api.agentMemory.write, {
              agentName: "Kaze",
              memoryType: "api_quirk",
              title: `${group.integration} ${group.tool} — rate limited`,
              body: `${group.integration}/${group.tool} hit rate limits ${totalRateLimits} times in the last 24 hours. Add delays between calls or batch requests where possible.`,
              evidence: `Auto-detected from ${totalRateLimits} rate limit errors in 24h`,
              tags: [group.integration, group.tool, "rate-limit", "auto-learned"],
              importanceScore: 0.7,
              isSquadWide: true,
            });
            memoriesWritten++;
          } catch (err: any) {
            console.error(`[IntegrationLearning] Failed to write rate limit memory: ${err.message}`);
          }
        }
      }
    }

    console.log(
      `[IntegrationLearning] Analyzed ${activity.length} calls across ${groups.size} integration/tool pairs. ` +
        `Wrote ${memoriesWritten} new memories, confirmed ${memoriesConfirmed} existing.`
    );

    // Also run rejection pattern analysis
    await ctx.runAction(internal.integrationLearning.analyzeRejectionPatterns);
  },
});

// ── Rejection Pattern Learning ──────────────────────────────

/**
 * Analyzes recent task rejections to detect recurring quality issues per agent.
 * If an agent keeps getting rejected for similar reasons (e.g., Ghost always
 * misses CTAs, Forge always forgets error handling), this creates a targeted
 * memory so they see the feedback every time they start a similar task.
 *
 * No LLM call — pure pattern detection on rejection reasons.
 */

/** Fetch recently rejected tasks (last 7 days). */
export const getRecentRejections = internalQuery({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Get tasks that have been rejected at least once (iterationCount > 0)
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) =>
        q.and(
          q.gt(q.field("iterationCount"), 0),
          q.gte(q.field("updatedAt"), sevenDaysAgo)
        )
      )
      .collect();

    return tasks.map((t) => ({
      id: t._id,
      title: t.title,
      assignee: t.assignee,
      rejectionReason: t.rejectionReason,
      iterationCount: t.iterationCount,
      tags: t.tags,
      status: t.status,
    }));
  },
});

/** Fetch existing failure memories to avoid duplicates. */
export const getExistingFailureMemories = internalQuery({
  args: {},
  handler: async (ctx) => {
    const memories = await ctx.db
      .query("agentMemory")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.or(
            q.eq(q.field("memoryType"), "failure"),
            q.eq(q.field("memoryType"), "user_preference")
          )
        )
      )
      .collect();

    return memories.map((m) => ({
      id: m._id,
      agentName: m.agentName,
      title: m.title,
      body: m.body,
      tags: m.tags,
    }));
  },
});

export const analyzeRejectionPatterns = internalAction({
  args: {},
  handler: async (ctx) => {
    const [rejections, existingMemories] = await Promise.all([
      ctx.runQuery(internal.integrationLearning.getRecentRejections),
      ctx.runQuery(internal.integrationLearning.getExistingFailureMemories),
    ]);

    if (rejections.length === 0) {
      console.log("[RejectionLearning] No rejections in last 7 days");
      return;
    }

    // Group rejections by agent
    const byAgent = new Map<string, typeof rejections>();
    for (const r of rejections) {
      if (!r.assignee || !r.rejectionReason) continue;
      const list = byAgent.get(r.assignee) || [];
      list.push(r);
      byAgent.set(r.assignee, list);
    }

    let memoriesWritten = 0;

    for (const [agentName, agentRejections] of byAgent.entries()) {
      // Need at least 2 rejections to detect a pattern
      if (agentRejections.length < 2) continue;

      // Extract common words from rejection reasons (poor man's topic clustering)
      const allReasons = agentRejections
        .map((r) => r.rejectionReason!)
        .join(" ")
        .toLowerCase();

      // Find repeated phrases/keywords (words appearing in 2+ rejection reasons)
      const wordCounts = new Map<string, number>();
      for (const r of agentRejections) {
        const words = new Set(
          r.rejectionReason!.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
        );
        for (const word of words) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      }

      // Words appearing in 50%+ of rejections are patterns
      const threshold = Math.max(2, Math.ceil(agentRejections.length * 0.5));
      const patternWords = [...wordCounts.entries()]
        .filter(([, count]) => count >= threshold)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);

      if (patternWords.length === 0) continue;

      // Check if we already have a memory for this agent + pattern
      const patternKey = patternWords.slice(0, 3).join("-");
      const alreadyExists = existingMemories.some(
        (m) =>
          m.agentName === agentName &&
          patternWords.some((pw) => m.title.toLowerCase().includes(pw) || m.body.toLowerCase().includes(pw))
      );

      if (alreadyExists) continue;

      // Create a targeted failure memory
      const sampleReasons = agentRejections
        .slice(0, 3)
        .map((r) => `"${r.rejectionReason!.slice(0, 100)}"`)
        .join("; ");

      const title = `${agentName} recurring rejection: ${patternWords.slice(0, 3).join(", ")}`;
      const body = `${agentName} has been rejected ${agentRejections.length} times in the last 7 days with similar feedback. Common themes: ${patternWords.join(", ")}. Sample reasons: ${sampleReasons}. Address these issues proactively before submitting work.`;

      try {
        await ctx.runMutation(api.agentMemory.write, {
          agentName: agentName as any,
          memoryType: "failure",
          title: title.slice(0, 200),
          body,
          evidence: `Auto-detected from ${agentRejections.length} rejections in 7 days`,
          tags: [...patternWords.slice(0, 3), "rejection-pattern", "auto-learned"],
          importanceScore: 0.8, // High — this directly impacts quality
        });
        memoriesWritten++;
      } catch (err: any) {
        console.error(`[RejectionLearning] Failed to write memory: ${err.message}`);
      }
    }

    console.log(
      `[RejectionLearning] Analyzed ${rejections.length} rejections across ${byAgent.size} agents. Wrote ${memoriesWritten} pattern memories.`
    );
  },
});
