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

export default crons;
