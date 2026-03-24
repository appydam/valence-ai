/**
 * Fix Google Analytics tools that use the Admin API (different base URL).
 * list_properties and get_property are on analyticsadmin.googleapis.com,
 * not analyticsdata.googleapis.com (the blueprint base URL).
 *
 * Usage:
 * npx convex run fixGoogleAnalyticsTools --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-analytics"))
      .first();

    if (!blueprint) throw new Error("Google Analytics blueprint not found");

    const now = Date.now();
    const updated = [];

    // Fix list_properties — uses Admin API, needs full URL override via path
    const listProps = await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint_name", (q) =>
        q.eq("blueprintId", blueprint._id).eq("name", "list_properties")
      )
      .first();

    if (listProps) {
      await ctx.db.patch(listProps._id, {
        // Use full URL as path — execution engine will use this as absolute URL
        path: "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
        aiUsageHint: "List all GA4 accounts and properties. Use this to discover property IDs before running reports. Returns accounts with their GA4 property IDs.",
        updatedAt: now,
      });
      updated.push("list_properties");
    }

    // Fix get_property — uses Admin API
    const getProp = await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint_name", (q) =>
        q.eq("blueprintId", blueprint._id).eq("name", "get_property")
      )
      .first();

    if (getProp) {
      await ctx.db.patch(getProp._id, {
        path: "https://analyticsadmin.googleapis.com/v1beta/properties/{property_id}",
        updatedAt: now,
      });
      updated.push("get_property");
    }

    // Fix get_audience_list — uses Admin API
    const getAudience = await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint_name", (q) =>
        q.eq("blueprintId", blueprint._id).eq("name", "get_audience_list")
      )
      .first();

    if (getAudience) {
      await ctx.db.patch(getAudience._id, {
        path: "https://analyticsadmin.googleapis.com/v1beta/properties/{property_id}/audienceLists",
        updatedAt: now,
      });
      updated.push("get_audience_list");
    }

    return {
      message: `Fixed ${updated.length} tools to use correct Admin API URLs`,
      updated,
    };
  },
});
