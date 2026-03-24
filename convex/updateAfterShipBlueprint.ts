"use node";

/**
 * Update AfterShip blueprint authConfig with real env var credentials.
 * Run after setting AFTERSHIP_CLIENT_ID and OAUTH_SECRET_AFTERSHIP.
 *
 * Usage:
 * npx convex run updateAfterShipBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.AFTERSHIP_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_AFTERSHIP;

    if (!clientId || clientId === "YOUR_AFTERSHIP_CLIENT_ID") {
      throw new Error("AFTERSHIP_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_AFTERSHIP env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "aftership" });
    if (!blueprint) throw new Error("AfterShip blueprint not found. Run seedAfterShipBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_AFTERSHIP",
      authorizeUrl: "https://accounts.aftership.com/oauth/authorize",
      tokenUrl: "https://accounts.aftership.com/oauth/token",
      scopes: ["tracking"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ AfterShip blueprint updated", clientId };
  },
});
