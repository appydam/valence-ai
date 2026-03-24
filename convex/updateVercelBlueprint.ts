"use node";

/**
 * Update Vercel blueprint authConfig with real env var credentials.
 * Run after setting VERCEL_CLIENT_ID and OAUTH_SECRET_VERCEL.
 *
 * Usage:
 * npx convex run updateVercelBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.VERCEL_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_VERCEL;

    if (!clientId || clientId === "YOUR_VERCEL_CLIENT_ID") {
      throw new Error("VERCEL_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_VERCEL env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "vercel" });
    if (!blueprint) throw new Error("Vercel blueprint not found. Run seedVercelBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_VERCEL",
      authorizeUrl: "https://vercel.com/oauth/authorize",
      tokenUrl: "https://api.vercel.com/login/oauth/token",
      scopes: ["openid", "email", "profile", "offline_access"],
      scopeSeparator: "space",
      usePKCE: true,
      tokenEndpointAuth: "body",
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ Vercel blueprint updated", clientId };
  },
});
