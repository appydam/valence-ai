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

export default crons;
