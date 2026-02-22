/**
 * Fix Slack blueprint:
 * 1. Move clientSecret from plaintext → env var reference "OAUTH_SECRET_SLACK"
 * 2. Add channels:manage scope for creating channels
 * 3. Add create_channel tool
 *
 * Usage: npx convex run fixSlackBlueprint
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    // Find Slack blueprint
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "slack"))
      .first();

    if (!blueprint) {
      return { error: "Slack blueprint not found" };
    }

    // Fix authConfig: use env var reference, add channels:manage scope
    const newAuthConfig = {
      clientId: "10517769264595.10520757990037",
      clientSecret: "OAUTH_SECRET_SLACK",
      authorizeUrl: "https://slack.com/oauth/v2/authorize",
      tokenUrl: "https://slack.com/api/oauth.v2.access",
      scopes: ["chat:write", "channels:read", "channels:manage", "users:read", "im:write"],
    };

    await ctx.db.patch(blueprint._id, {
      authConfig: JSON.stringify(newAuthConfig),
      updatedAt: Date.now(),
    });

    // Check if create_channel tool already exists
    const existingTool = await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint", (q) => q.eq("blueprintId", blueprint._id))
      .filter((q) => q.eq(q.field("name"), "create_channel"))
      .first();

    let toolResult: string;
    if (existingTool) {
      toolResult = "create_channel tool already exists";
    } else {
      const now = Date.now();
      await ctx.db.insert("blueprintTools", {
        blueprintId: blueprint._id,
        name: "create_channel",
        displayName: "Create Channel",
        description: "Create a new Slack channel (public or private). Requires channels:manage scope.",
        method: "POST",
        path: "/conversations.create",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Channel name (lowercase, no spaces, use hyphens)" },
            is_private: { type: "boolean", description: "Create as private channel (default: false)" },
          },
        }),
        aiUsageHint: "Create a new Slack channel. Channel names must be lowercase, no spaces, use hyphens. Max 80 chars.",
        exampleArgs: JSON.stringify({
          name: "project-updates",
          is_private: false,
        }),
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      toolResult = "create_channel tool created";
    }

    return {
      message: "✅ Slack blueprint fixed",
      blueprintId: blueprint._id,
      changes: [
        "clientSecret → OAUTH_SECRET_SLACK (env var reference)",
        "Added channels:manage scope",
        toolResult,
      ],
    };
  },
});
