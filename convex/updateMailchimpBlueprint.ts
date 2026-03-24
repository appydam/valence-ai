"use node";

/**
 * Update Mailchimp blueprint authConfig with real env var credentials.
 * Run after setting MAILCHIMP_CLIENT_ID and OAUTH_SECRET_MAILCHIMP.
 *
 * Usage:
 * npx convex run updateMailchimpBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export default action({
  args: {},
  handler: async (ctx) => {
    const clientId = process.env.MAILCHIMP_CLIENT_ID;
    const clientSecret = process.env.OAUTH_SECRET_MAILCHIMP;

    if (!clientId || clientId === "YOUR_MAILCHIMP_CLIENT_ID") {
      throw new Error("MAILCHIMP_CLIENT_ID env var is not set or still placeholder");
    }
    if (!clientSecret) {
      throw new Error("OAUTH_SECRET_MAILCHIMP env var is not set");
    }

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "mailchimp" });
    if (!blueprint) throw new Error("Mailchimp blueprint not found. Run seedMailchimpBlueprint first.");

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_MAILCHIMP",
      authorizeUrl: "https://login.mailchimp.com/oauth2/authorize",
      tokenUrl: "https://login.mailchimp.com/oauth2/token",
      scopes: [],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    });

    await ctx.runMutation(api.blueprints.update, { id: blueprint._id, authConfig: newAuthConfig });

    return { success: true, message: "✅ Mailchimp blueprint updated", clientId };
  },
});
