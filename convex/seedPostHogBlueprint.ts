/**
 * Seed PostHog integration blueprint
 *
 * PostHog OAuth2 — supports PKCE (S256).
 * Scopes follow resource:action pattern (e.g. feature_flag:read).
 *
 * Usage:
 * npx convex run seedPostHogBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "posthog"))
      .first();

    if (existing) {
      return { message: "PostHog blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.POSTHOG_CLIENT_ID || "YOUR_POSTHOG_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_POSTHOG",
      authorizeUrl: "https://us.posthog.com/oauth/authorize",
      tokenUrl: "https://us.posthog.com/oauth/token",
      scopes: [
        "project:read",
        "action:read",
        "feature_flag:read",
        "feature_flag:write",
        "experiment:read",
        "session_recording:read",
        "insight:read",
      ],
      scopeSeparator: "space",
      usePKCE: true,
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "posthog",
      name: "PostHog",
      description: "Product analytics and session recording — query events, manage feature flags, view experiments, and access session recordings.",
      category: "analytics",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://us.posthog.com/api",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://posthog.com/docs/api",
      iconUrl: "https://cdn.simpleicons.org/posthog/000000",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_projects",
        displayName: "List Projects",
        description: "List all projects (teams) in the organization",
        method: "GET" as const,
        path: "/projects",
        aiUsageHint: "List all PostHog projects. Returns id, name, and other metadata for each project.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "query_events",
        displayName: "Query Events",
        description: "Query recent events for a project",
        method: "GET" as const,
        path: "/projects/{project_id}/events",
        pathParams: JSON.stringify([
          { name: "project_id", type: "string", required: true, description: "Project ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "event", type: "string", description: "Filter by event name (e.g. $pageview)" },
          { name: "limit", type: "number", default: 100, description: "Max events to return" },
          { name: "after", type: "string", description: "ISO 8601 timestamp — events after this time" },
          { name: "before", type: "string", description: "ISO 8601 timestamp — events before this time" },
          { name: "person_id", type: "string", description: "Filter by person UUID" },
        ]),
        aiUsageHint: "Query events. Use event=$pageview for page views, $autocapture for clicks. Returns timestamp, properties, person.",
        exampleArgs: JSON.stringify({ project_id: "1", event: "$pageview", limit: 50 }),
      },
      {
        name: "list_feature_flags",
        displayName: "List Feature Flags",
        description: "List all feature flags for a project",
        method: "GET" as const,
        path: "/projects/{project_id}/feature_flags",
        pathParams: JSON.stringify([
          { name: "project_id", type: "string", required: true, description: "Project ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 100 },
          { name: "search", type: "string", description: "Search by flag key or name" },
        ]),
        aiUsageHint: "List all feature flags. Returns key, name, active status, rollout_percentage, filters.",
        exampleArgs: JSON.stringify({ project_id: "1" }),
      },
      {
        name: "get_feature_flag",
        displayName: "Get Feature Flag",
        description: "Get details of a specific feature flag",
        method: "GET" as const,
        path: "/projects/{project_id}/feature_flags/{flag_id}",
        pathParams: JSON.stringify([
          { name: "project_id", type: "string", required: true, description: "Project ID" },
          { name: "flag_id", type: "string", required: true, description: "Feature flag ID" },
        ]),
        aiUsageHint: "Get a single feature flag by ID. Returns full flag config including filters, rollout percentage, variants.",
        exampleArgs: JSON.stringify({ project_id: "1", flag_id: "123" }),
      },
      {
        name: "update_feature_flag",
        displayName: "Update Feature Flag",
        description: "Update a feature flag (toggle, change rollout, etc.)",
        method: "PATCH" as const,
        path: "/projects/{project_id}/feature_flags/{flag_id}",
        pathParams: JSON.stringify([
          { name: "project_id", type: "string", required: true, description: "Project ID" },
          { name: "flag_id", type: "string", required: true, description: "Feature flag ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            active: { type: "boolean", description: "Enable or disable the flag" },
            name: { type: "string", description: "Display name" },
            rollout_percentage: { type: "number", description: "Rollout percentage (0-100)" },
          },
        }),
        aiUsageHint: "Update a flag. Set active=true/false to toggle, rollout_percentage to change rollout.",
        exampleArgs: JSON.stringify({ project_id: "1", flag_id: "123", active: true }),
      },
      {
        name: "list_experiments",
        displayName: "List Experiments",
        description: "List all experiments (A/B tests) for a project",
        method: "GET" as const,
        path: "/projects/{project_id}/experiments",
        pathParams: JSON.stringify([
          { name: "project_id", type: "string", required: true, description: "Project ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 100 },
        ]),
        aiUsageHint: "List experiments. Returns name, feature_flag_key, start/end dates, results summary.",
        exampleArgs: JSON.stringify({ project_id: "1" }),
      },
      {
        name: "list_insights",
        displayName: "List Insights",
        description: "List saved insights (trends, funnels, retention, etc.)",
        method: "GET" as const,
        path: "/projects/{project_id}/insights",
        pathParams: JSON.stringify([
          { name: "project_id", type: "string", required: true, description: "Project ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 100 },
          { name: "search", type: "string", description: "Search by insight name" },
        ]),
        aiUsageHint: "List saved insights. Returns name, filters, last_refresh, and insight type (TRENDS, FUNNELS, etc.).",
        exampleArgs: JSON.stringify({ project_id: "1", limit: 20 }),
      },
      {
        name: "list_persons",
        displayName: "List Persons",
        description: "List identified persons/users in a project",
        method: "GET" as const,
        path: "/projects/{project_id}/persons",
        pathParams: JSON.stringify([
          { name: "project_id", type: "string", required: true, description: "Project ID" },
        ]),
        queryParams: JSON.stringify([
          { name: "search", type: "string", description: "Search by email, name, or distinct ID" },
          { name: "limit", type: "number", default: 100 },
        ]),
        aiUsageHint: "List persons (users). Returns distinct_ids, properties (email, name, etc.), created_at.",
        exampleArgs: JSON.stringify({ project_id: "1", search: "john@example.com" }),
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
      message: "PostHog blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
    };
  },
});
