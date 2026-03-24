"use node";

/**
 * Update Pipedrive blueprint authConfig with real env var credentials.
 * Run after setting PIPEDRIVE_CLIENT_ID and OAUTH_SECRET_PIPEDRIVE.
 *
 * Usage:
 * npx convex run updatePipedriveBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.PIPEDRIVE_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_PIPEDRIVE;

    if (!clientId || clientId === "YOUR_PIPEDRIVE_CLIENT_ID") {
      throw new Error("PIPEDRIVE_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_PIPEDRIVE env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "pipedrive" });
    if (!blueprint) throw new Error("Pipedrive blueprint not found. Run seedPipedriveBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_PIPEDRIVE",
      authorizeUrl: "https://oauth.pipedrive.com/oauth/authorize",
      tokenUrl: "https://oauth.pipedrive.com/oauth/token",
      scopes: ["deals:full", "contacts:full", "leads:full", "activities:full"],
      scopeSeparator: "space",
      tokenEndpointAuth: "header",
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ Pipedrive blueprint updated", clientId };
  },
});
