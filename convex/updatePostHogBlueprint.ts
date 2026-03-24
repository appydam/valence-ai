"use node";

/**
 * Update PostHog blueprint authConfig with real env var credentials.
 * Run after setting POSTHOG_CLIENT_ID and OAUTH_SECRET_POSTHOG.
 *
 * Usage:
 * npx convex run updatePostHogBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.POSTHOG_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_POSTHOG;

    if (!clientId || clientId === "YOUR_POSTHOG_CLIENT_ID") {
      throw new Error("POSTHOG_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_POSTHOG env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "posthog" });
    if (!blueprint) throw new Error("PostHog blueprint not found. Run seedPostHogBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_POSTHOG",
      authorizeUrl: "https://us.posthog.com/oauth/authorize",
      tokenUrl: "https://us.posthog.com/oauth/token",
      scopes: [
        "project:read",
        "action:read",
        "feature_flag:read",
        "feature_flag:write",
        "experiment:read",
        "session_recording:read",
        "insight:read",
      ],
      scopeSeparator: "space",
      usePKCE: true,
      tokenEndpointAuth: "body",
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ PostHog blueprint updated", clientId };
  },
});
