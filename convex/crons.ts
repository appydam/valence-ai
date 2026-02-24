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
 * Wakeup sweep: catch tasks stuck in "assigned" (>5 min) or "in_progress" (>15 min)
 * Safety net — if immediate webhook failed, this picks it up.
 * Runs every 10 minutes. Skips agents that are already active.
 */
crons.interval(
  "assigned-task-sweep",
  { minutes: 10 },
  internal.agentWakeupSweep.sweep
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
 * Inbox auto-delegation: wake Kaze if tasks have been sitting in inbox for >30 min.
 * Prevents inbox from growing indefinitely without human intervention.
 * Runs every 30 minutes.
 */
crons.interval(
  "inbox-triage-sweep",
  { minutes: 30 },
  internal.tasks.inboxTriageSweep
);

export default crons;
