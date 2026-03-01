/**
 * Seed Vercel integration blueprint
 *
 * Vercel requires PKCE (S256) for OAuth.
 * Uses OpenID Connect scopes for authorization.
 *
 * Usage:
 * npx convex run seedVercelBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "vercel"))
      .first();

    if (existing) {
      return { message: "Vercel blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.VERCEL_CLIENT_ID || "YOUR_VERCEL_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_VERCEL",
      authorizeUrl: "https://vercel.com/oauth/authorize",
      tokenUrl: "https://api.vercel.com/login/oauth/token",
      scopes: ["openid", "email", "profile", "offline_access"],
      scopeSeparator: "space",
      usePKCE: true,
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "vercel",
      name: "Vercel",
      description: "Deployment platform — manage projects, deployments, environment variables, and domains. Monitor build status and deployment logs.",
      category: "developer_tools",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.vercel.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://vercel.com/docs/rest-api",
      iconUrl: "https://cdn.simpleicons.org/vercel/000000",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_projects",
        displayName: "List Projects",
        description: "List all projects in your Vercel account or team",
        method: "GET" as const,
        path: "/v9/projects",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", description: "Results per page (max 100)", default: 20 },
          { name: "search", type: "string", description: "Search projects by name" },
        ]),
        aiUsageHint: "List all Vercel projects. Use search param to filter by name.",
        exampleArgs: JSON.stringify({ limit: 20 }),
      },
      {
        name: "get_project",
        displayName: "Get Project",
        description: "Get details about a specific Vercel project",
        method: "GET" as const,
        path: "/v9/projects/{idOrName}",
        pathParams: JSON.stringify([
          { name: "idOrName", type: "string", required: true, description: "Project ID or name" },
        ]),
        aiUsageHint: "Get project details including framework, git repo, domains, and settings.",
        exampleArgs: JSON.stringify({ idOrName: "my-app" }),
      },
      {
        name: "list_deployments",
        displayName: "List Deployments",
        description: "List recent deployments across all projects or for a specific project",
        method: "GET" as const,
        path: "/v6/deployments",
        queryParams: JSON.stringify([
          { name: "projectId", type: "string", description: "Filter by project ID" },
          { name: "state", type: "string", description: "BUILDING, ERROR, INITIALIZING, QUEUED, READY, CANCELED" },
          { name: "limit", type: "number", default: 20 },
        ]),
        aiUsageHint: "List deployments. Filter by projectId and state (READY, ERROR, BUILDING).",
        exampleArgs: JSON.stringify({ limit: 10, state: "READY" }),
      },
      {
        name: "list_env_vars",
        displayName: "List Environment Variables",
        description: "List environment variables for a project",
        method: "GET" as const,
        path: "/v6/projects/{idOrName}/env",
        pathParams: JSON.stringify([
          { name: "idOrName", type: "string", required: true, description: "Project ID or name" },
        ]),
        aiUsageHint: "List env vars for a project. Values are encrypted — only keys and targets are shown.",
        exampleArgs: JSON.stringify({ idOrName: "my-app" }),
      },
      {
        name: "list_domains",
        displayName: "List Domains",
        description: "List all domains configured for a project",
        method: "GET" as const,
        path: "/v9/projects/{idOrName}/domains",
        pathParams: JSON.stringify([
          { name: "idOrName", type: "string", required: true, description: "Project ID or name" },
        ]),
        aiUsageHint: "List all custom domains attached to a project.",
        exampleArgs: JSON.stringify({ idOrName: "my-app" }),
      },
    ];

    const toolIds = [];
    for (const tool of tools) {
      const toolId = await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      toolIds.push(toolId);
    }

    return {
      message: "Vercel blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth app at https://vercel.com/account/oauth-apps (or via Integrations Console)",
        "2. Set redirect URL to: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. npx convex env set VERCEL_CLIENT_ID '<client_id>' --url https://beloved-squirrel-599.convex.cloud",
        "4. npx convex env set OAUTH_SECRET_VERCEL '<client_secret>' --url https://beloved-squirrel-599.convex.cloud",
      ],
    };
  },
});
