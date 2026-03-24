"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { encryptCredentials } from "./lib/crypto";

/**
 * One-off action to store a Shopify Admin API access token directly.
 * Shopify custom/dev apps provide a static access token (shpat_...) instead of OAuth flow.
 *
 * Usage:
 * npx convex run connectShopifyDirect --url https://<YOUR_DEPLOYMENT>.convex.cloud \
 *   '{"userId": "...", "accessToken": "shpat_..."}'
 */
export default action({
  args: {
    userId: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const encKey = process.env.INTEGRATION_ENCRYPTION_KEY!;

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, {
      slug: "shopify",
    });

    if (!blueprint) {
      throw new Error("Shopify blueprint not found");
    }

    // Store as oauth2-style credentials so the execution engine picks it up
    const credentials = {
      accessToken: args.accessToken,
      tokenType: "shopify_custom_app",
      scope: "all",
    };

    const credentialsEncrypted = encryptCredentials(credentials, encKey);

    await ctx.runMutation(api.connections.upsert, {
      blueprintId: blueprint._id,
      userId: args.userId,
      credentialsEncrypted,
    });

    return { success: true, blueprintId: blueprint._id };
  },
});
