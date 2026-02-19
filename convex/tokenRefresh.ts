"use node";

import { internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

/**
 * Token refresh scheduler
 * Called by cron job to refresh expiring OAuth tokens
 */

export const refreshExpiringTokens = internalAction({
  args: {},
  handler: async (ctx): Promise<{
    totalConnections: number;
    refreshedCount: number;
    skippedCount: number;
    failedCount: number;
    timestamp: number;
  }> => {
    const now = Date.now();
    const oneHourFromNow = now + (60 * 60 * 1000); // 1 hour in milliseconds

    console.log(`[Token Refresh] Starting scheduled refresh at ${new Date(now).toISOString()}`);

    // Get all connections
    const connections = await ctx.runQuery(api.connections.listAll, {});

    let refreshedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const conn of connections) {
      try {
        // Skip if no expiry time or not OAuth (API keys don't expire)
        if (!conn.expiresAt) {
          skippedCount++;
          continue;
        }

        // Skip if not expiring soon
        if (conn.expiresAt > oneHourFromNow) {
          skippedCount++;
          continue;
        }

        // Skip if already in error state (manual intervention needed)
        if (conn.status === "error" || conn.status === "disconnected") {
          skippedCount++;
          continue;
        }

        console.log(`[Token Refresh] Refreshing connection ${conn._id} (expires at ${new Date(conn.expiresAt).toISOString()})`);

        // Refresh the token
        await ctx.runAction(api.connectionActions.refreshToken, {
          connectionId: conn._id,
        });

        refreshedCount++;
        console.log(`[Token Refresh] ✅ Successfully refreshed connection ${conn._id}`);

      } catch (error) {
        failedCount++;
        console.error(`[Token Refresh] ❌ Failed to refresh connection ${conn._id}:`, error);

        // Mark the error in the connection (already done by refreshToken action)
        // The error will be visible to users in the connections UI
      }
    }

    console.log(`[Token Refresh] Completed: ${refreshedCount} refreshed, ${skippedCount} skipped, ${failedCount} failed (total: ${connections.length})`);

    return {
      totalConnections: connections.length,
      refreshedCount,
      skippedCount,
      failedCount,
      timestamp: now,
    };
  },
});
