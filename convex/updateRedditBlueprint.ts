"use node";

/**
 * Update Reddit blueprint authConfig with real env var credentials.
 * Run after setting REDDIT_CLIENT_ID and OAUTH_SECRET_REDDIT.
 *
 * Usage:
 * npx convex run updateRedditBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_REDDIT;

    if (!clientId || clientId === "YOUR_REDDIT_CLIENT_ID") {
      throw new Error("REDDIT_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_REDDIT env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "reddit" });
    if (!blueprint) throw new Error("Reddit blueprint not found. Run seedRedditBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_REDDIT",
      authorizeUrl: "https://www.reddit.com/api/v1/authorize",
      tokenUrl: "https://www.reddit.com/api/v1/access_token",
      scopes: ["identity", "read", "submit", "privatemessages", "history", "vote", "save"],
      scopeSeparator: "space",
      tokenEndpointAuth: "header",
      extraAuthParams: {
        duration: "permanent",
      },
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ Reddit blueprint updated with real credentials", clientId };
  },
});
