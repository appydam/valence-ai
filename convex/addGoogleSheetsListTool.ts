import { internalMutation } from "./_generated/server";

/**
 * Add a "list_spreadsheets" tool to Google Sheets for testing connections
 * Uses Google Drive API to list spreadsheets (shares same OAuth token)
 */
export default internalMutation({
  handler: async (ctx) => {
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-sheets"))
      .first();

    if (!blueprint) {
      throw new Error("Google Sheets blueprint not found");
    }

    // Check if tool already exists
    const existing = await ctx.db
      .query("blueprintTools")
      .filter((q) =>
        q.and(
          q.eq(q.field("blueprintId"), blueprint._id),
          q.eq(q.field("name"), "list_spreadsheets")
        )
      )
      .first();

    if (existing) {
      console.log("list_spreadsheets tool already exists");
      return { toolId: existing._id, created: false };
    }

    const now = Date.now();

    const toolId = await ctx.db.insert("blueprintTools", {
      name: "list_spreadsheets",
      displayName: "List Spreadsheets",
      description: "List all Google Sheets spreadsheets in your Google Drive",
      method: "GET",
      path: "https://www.googleapis.com/drive/v3/files",
      queryParams: JSON.stringify([
        { name: "q", type: "string", default: "mimeType='application/vnd.google-apps.spreadsheet'", description: "Query to filter spreadsheets" },
        { name: "pageSize", type: "number", default: 10, description: "Number of results to return" },
        { name: "fields", type: "string", default: "files(id,name,createdTime,modifiedTime)", description: "Fields to include in response" },
      ]),
      aiUsageHint: "List all spreadsheets in Google Drive to see what's available",
      exampleArgs: JSON.stringify({ pageSize: 10 }),
      blueprintId: blueprint._id,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    console.log(`✅ Added list_spreadsheets tool to Google Sheets blueprint`);
    return { toolId, created: true };
  },
});
