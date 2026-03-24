import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Scheduled jobs for Mission Control
 */

const crons = cronJobs();

/**
 * Refresh expiring OAuth tokens
 * Runs every hour at :00, refreshes tokens expiring within the next hour
 */
crons.hourly(
  "refresh-expiring-tokens",
  { minuteUTC: 0 }, // Every hour at :00
  internal.tokenRefresh.refreshExpiringTokens
);

/**
 * Review sweep: check for tasks stuck in "in_review" and wake Kaze
 * Runs every 2 hours to ensure nothing sits unreviewed for too long
 */
crons.interval(
  "kaze-review-sweep",
  { hours: 2 },
  internal.tasks.reviewSweep
);

/**
 * Wakeup sweep: catch tasks stuck in "assigned" (>3 min) or "in_progress" (>15 min)
 * Safety net — if immediate webhook or auto-pickup failed, this picks it up.
 * Runs every 2 minutes. Wakes ALL stuck agents (not just one).
 */
crons.interval(
  "assigned-task-sweep",
  { minutes: 2 },
  internal.agentWakeupSweep.sweep
);

/**
 * Integration learning: analyze API call patterns to auto-detect quirks and failures.
 * Writes squad-wide api_quirk memories from integrationActivity data. No LLM call.
 * Runs daily at 5:00 UTC.
 */
crons.daily(
  "integration-learning",
  { hourUTC: 5, minuteUTC: 0 },
  internal.integrationLearning.analyzePatterns
);

/**
 * Memory archive: expire TTL memories and archive 30-day-old unused low-score ones.
 * Runs nightly at 3:00 UTC.
 */
crons.daily(
  "memory-archive-stale",
  { hourUTC: 3, minuteUTC: 0 },
  internal.agentMemory.archiveStale
);

/**
 * Soul distillation: Claude reads high-value memories and evolves each agent's SOUL file.
 * Runs every Sunday at 2:00 UTC. Human review required before changes are applied.
 */
crons.weekly(
  "soul-distillation-weekly",
  { dayOfWeek: "sunday", hourUTC: 2, minuteUTC: 0 },
  internal.soulDistillation.distillAllAgents
);

/**
 * Sentinel review sweep: wake Sentinel for tasks stuck in "in_review" > 1 min.
 * Catches missed wakeups, concurrent task race conditions, or crashed sessions.
 * Runs every 2 minutes for fast recovery — sentinel only wakes if not already active.
 */
crons.interval(
  "sentinel-review-sweep",
  { minutes: 2 },
  internal.tasks.sentinelReviewSweep
);

/**
 * Inbox auto-delegation: wake Kaze if tasks have been sitting in inbox for >30 min.
 * Prevents inbox from growing indefinitely without human intervention.
 * Runs every 30 minutes.
 */
crons.interval(
  "inbox-triage-sweep",
  { minutes: 30 },
  internal.tasks.inboxTriageSweep
);

/**
 * Webhook retry: reprocess failed webhook events with exponential backoff.
 * Max 3 retries per event (30s, 2min, 8min delays).
 * Events that exhaust retries are moved to dead letter queue.
 * Runs every 5 minutes.
 */
crons.interval(
  "webhook-retry-failed",
  { minutes: 5 },
  internal.webhookReceiver.retryFailed
);

/**
 * Stale agent auto-reset: marks agents offline if heartbeat >10 min stale.
 * Prevents agents from staying stuck in "working" status after a crash,
 * ensuring sweeps correctly re-wake them and the health dashboard shows truth.
 * Runs every 5 minutes.
 */
crons.interval(
  "stale-agent-reset",
  { minutes: 5 },
  internal.agents.resetStaleAgents
);

/**
 * Server health check: monitor CPU/RAM/disk and log alerts.
 * Runs every 10 minutes. Alerts are logged to the activity table
 * when thresholds are exceeded (CPU >85%, memory >90%, disk >90%).
 */
crons.interval(
  "server-health-check",
  { minutes: 10 },
  internal.serverHealth.checkAndLogAlerts
);

/**
 * Reasoning stream cleanup: delete reasoning steps older than 30 days.
 * Prevents unbounded DB growth. Processes up to 500 per run.
 * Runs daily at 4:00 UTC.
 */
crons.daily(
  "reasoning-cleanup",
  { hourUTC: 4, minuteUTC: 0 },
  internal.reasoning.cleanupOld
);

/**
 * Morning Brief: aggregate last 24h of tasks/agents/activity into a CEO digest.
 * Runs daily at 2:30 UTC (~8:00 AM IST).
 */
crons.daily(
  "morning-brief",
  { hourUTC: 2, minuteUTC: 30 },
  internal.morningBrief.generate
);

export default crons;
