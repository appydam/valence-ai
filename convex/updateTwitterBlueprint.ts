"use node";

/**
 * Update Twitter/X blueprint authConfig with current env var values.
 * Run this after setting TWITTER_CLIENT_ID and OAUTH_SECRET_TWITTER_X.
 *
 * Usage:
 * npx convex run updateTwitterBlueprint:default --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_TWITTER_X;

    if (!clientId || clientId === "YOUR_TWITTER_CLIENT_ID") {
      throw new Error("TWITTER_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret || clientSecret === "YOUR_TWITTER_CLIENT_SECRET") {
      throw new Error("OAUTH_SECRET_TWITTER_X env var is not set or still placeholder");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, {
      slug: "twitter-x",
    });

    if (!blueprint) {
      throw new Error("Twitter/X blueprint not found. Run seedTwitterBlueprint first.");
    }

    // Store client secret as env var reference (never store raw secrets in DB)
    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_TWITTER_X",
      authorizeUrl: "https://x.com/i/oauth2/authorize",
      tokenUrl: "https://api.x.com/2/oauth2/token",
      scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      scopeSeparator: "space",
      usePKCE: true,
      tokenEndpointAuth: "header",
    });

    await ctx.runMutation(api.blueprints.update, {
      id: blueprint._id,
      authConfig: newAuthConfig,
    });

    return {
      success: true,
      message: "✅ Twitter/X blueprint authConfig updated with real credentials",
      clientId,
      note: "clientSecret stored as env var reference 'OAUTH_SECRET_TWITTER_X'",
    };
  },
});
