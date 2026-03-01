"use node";

/**
 * Update Google Analytics blueprint authConfig with real env var credentials.
 * Run after setting GOOGLE_ANALYTICS_CLIENT_ID and OAUTH_SECRET_GOOGLE_ANALYTICS.
 *
 * Usage:
 * npx convex run updateGoogleAnalyticsBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.GOOGLE_ANALYTICS_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_GOOGLE_ANALYTICS;

    if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
      throw new Error("GOOGLE_ANALYTICS_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_GOOGLE_ANALYTICS env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "google-analytics" });
    if (!blueprint) throw new Error("Google Analytics blueprint not found. Run seedGoogleAnalyticsBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_GOOGLE_ANALYTICS",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
      extraAuthParams: {
        access_type: "offline",
        prompt: "consent",
      },
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ Google Analytics blueprint updated", clientId };
  },
});
