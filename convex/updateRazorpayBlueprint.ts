"use node";

/**
 * Update Razorpay blueprint authConfig with real env var credentials.
 * Run after setting RAZORPAY_CLIENT_ID and OAUTH_SECRET_RAZORPAY.
 *
 * Usage:
 * npx convex run updateRazorpayBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.RAZORPAY_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_RAZORPAY;

    if (!clientId || clientId === "YOUR_RAZORPAY_CLIENT_ID") {
      throw new Error("RAZORPAY_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_RAZORPAY env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "razorpay" });
    if (!blueprint) throw new Error("Razorpay blueprint not found. Run seedRazorpayBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_RAZORPAY",
      authorizeUrl: "https://auth.razorpay.com/authorize",
      tokenUrl: "https://auth.razorpay.com/token",
      scopes: ["read_write"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ Razorpay blueprint updated", clientId };
  },
});
