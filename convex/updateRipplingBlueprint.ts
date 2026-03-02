"use node";

/**
 * Update Rippling blueprint authConfig with real env var credentials.
 * Run after setting RIPPLING_CLIENT_ID and OAUTH_SECRET_RIPPLING.
 *
 * Usage:
 * npx convex run updateRipplingBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.RIPPLING_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_RIPPLING;

    if (!clientId || clientId === "YOUR_RIPPLING_CLIENT_ID") {
      throw new Error("RIPPLING_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_RIPPLING env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "rippling" });
    if (!blueprint) throw new Error("Rippling blueprint not found. Run seedRipplingBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_RIPPLING",
      authorizeUrl: "https://app.rippling.com/apps/PLATFORM/ValenceAI",
      tokenUrl: "https://app.rippling.com/api/o/token/",
      scopes: ["employees:read", "departments:read", "teams:read"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ Rippling blueprint updated", clientId };
  },
});
