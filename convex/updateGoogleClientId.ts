import { internalMutation } from "./_generated/server";

/**
 * Update all Google blueprints with the actual GOOGLE_CLIENT_ID from env vars
 * This replaces the placeholder "YOUR_GOOGLE_CLIENT_ID" with the real value
 */
export default internalMutation({
  handler: async (ctx) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
      throw new Error(
        "GOOGLE_CLIENT_ID not set in Convex environment variables. " +
        "Please add it in the Convex dashboard Settings > Environment Variables"
      );
    }

    const results = [];

    // Update Google Sheets
    const sheets = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-sheets"))
      .first();

    if (sheets) {
      const authConfig = JSON.parse(sheets.authConfig);
      authConfig.clientId = clientId;

      await ctx.db.patch(sheets._id, {
        authConfig: JSON.stringify(authConfig),
        updatedAt: Date.now(),
      });

      results.push({ service: "Google Sheets", updated: true, blueprintId: sheets._id });
    } else {
      results.push({ service: "Google Sheets", updated: false, error: "Blueprint not found" });
    }

    // Update Google Calendar
    const calendar = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-calendar"))
      .first();

    if (calendar) {
      const authConfig = JSON.parse(calendar.authConfig);
      authConfig.clientId = clientId;

      await ctx.db.patch(calendar._id, {
        authConfig: JSON.stringify(authConfig),
        updatedAt: Date.now(),
      });

      results.push({ service: "Google Calendar", updated: true, blueprintId: calendar._id });
    } else {
      results.push({ service: "Google Calendar", updated: false, error: "Blueprint not found" });
    }

    // Update Gmail
    const gmail = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "gmail"))
      .first();

    if (gmail) {
      const authConfig = JSON.parse(gmail.authConfig);
      authConfig.clientId = clientId;

      await ctx.db.patch(gmail._id, {
        authConfig: JSON.stringify(authConfig),
        updatedAt: Date.now(),
      });

      results.push({ service: "Gmail", updated: true, blueprintId: gmail._id });
    } else {
      results.push({ service: "Gmail", updated: false, error: "Blueprint not found" });
    }

    return {
      message: "✅ All Google blueprints updated with client ID",
      clientId: clientId.substring(0, 20) + "...", // Show partial for verification
      results,
      totalUpdated: results.filter(r => r.updated).length,
    };
  },
});
