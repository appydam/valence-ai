/**
 * Fix Zendesk tools — remove {instanceUrl} path param from all tools,
 * since baseUrl is already set to https://noname-27618.zendesk.com/api/v2
 *
 * Run: npx convex run fixZendeskTools
 */

import { mutation } from "./_generated/server";

const BLUEPRINT_ID = "m57e1rg1mp6edw0bmamqhyyt4181frt7";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint", (q) => q.eq("blueprintId", BLUEPRINT_ID as any))
      .collect();

    const now = Date.now();
    const updated = [];

    for (const tool of tools) {
      // Remove {instanceUrl}/ prefix from path
      const fixedPath = tool.path.replace(/^\{instanceUrl\}\/api\/v2/, "");

      // Remove instanceUrl from pathParams
      let fixedPathParams = tool.pathParams;
      if (fixedPathParams) {
        try {
          const params = JSON.parse(fixedPathParams);
          const filtered = params.filter((p: any) => p.name !== "instanceUrl");
          fixedPathParams = filtered.length > 0 ? JSON.stringify(filtered) : undefined;
        } catch {}
      }

      await ctx.db.patch(tool._id, {
        path: fixedPath,
        pathParams: fixedPathParams,
        updatedAt: now,
      });

      updated.push({ name: tool.name, oldPath: tool.path, newPath: fixedPath });
    }

    return { message: "✅ Zendesk tools fixed", updated };
  },
});
