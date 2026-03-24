"use node";

/**
 * Update Keka blueprint authConfig with real env var credentials.
 * Run after setting KEKA_CLIENT_ID and OAUTH_SECRET_KEKA.
 *
 * Usage:
 * npx convex run updateKekaBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.KEKA_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_KEKA;

    if (!clientId || clientId === "YOUR_KEKA_CLIENT_ID") {
      throw new Error("KEKA_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_KEKA env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "keka" });
    if (!blueprint) throw new Error("Keka blueprint not found. Run seedKekaBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_KEKA",
      authorizeUrl: "https://login.keka.com/connect/authorize",
      tokenUrl: "https://login.keka.com/connect/token",
      scopes: ["kekaapi", "offline_access"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ Keka blueprint updated", clientId };
  },
});
