/**
 * Seed MindTickle integration blueprint
 * Run this once to create the MindTickle blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedMindTickleBlueprint -> Run
 *
 * Prerequisites:
 * 1. Get an API token from MindTickle Admin → Integrations → API
 * 2. Connect via the Integrations page using the bearer token auth flow
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "mindtickle"))
      .first();

    if (existing) {
      return {
        message: "MindTickle blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "mindtickle",
      name: "MindTickle",
      description:
        "Sales readiness and enablement platform. Track rep training completion, readiness scores, coaching sessions, and quiz results to ensure your sales team is always prepared.",
      category: "Sales",
      version: 1,
      status: "active",
      authType: "bearer_token",
      authConfig: JSON.stringify({
        headerName: "Authorization",
        headerPrefix: "Bearer",
      }),
      baseUrl: "https://api.mindtickle.com/v2",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.mindtickle.com/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/mindtickle.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_users",
        displayName: "List Users",
        description:
          "List users in MindTickle. Filter by email, status, or team. Returns user profiles with their assigned series and completion status.",
        method: "GET" as const,
        path: "/users",
        queryParams: JSON.stringify([
          {
            name: "email",
            type: "string",
            description: "Filter by user email address",
          },
          {
            name: "status",
            type: "string",
            description: "Filter by status: active, inactive",
          },
          {
            name: "limit",
            type: "number",
            default: 50,
            description: "Number of results per page (max 100)",
          },
          {
            name: "offset",
            type: "number",
            default: 0,
            description: "Offset for pagination",
          },
        ]),
        aiUsageHint:
          "List MindTickle users. Use email filter to find a specific rep. Use status=active to get current team members only.",
        exampleArgs: JSON.stringify({ status: "active", limit: 50 }),
      },
      {
        name: "get_user",
        displayName: "Get User",
        description:
          "Get detailed profile for a specific MindTickle user including their readiness scores, assigned modules, and completion stats.",
        method: "GET" as const,
        path: "/users/{user_id}",
        pathParams: JSON.stringify([
          {
            name: "user_id",
            type: "string",
            required: true,
            description: "MindTickle user ID",
          },
        ]),
        aiUsageHint:
          "Get a specific user's full profile and readiness data by their MindTickle user ID.",
        exampleArgs: JSON.stringify({ user_id: "usr_12345" }),
      },
      {
        name: "list_series",
        displayName: "List Series (Training Modules)",
        description:
          "List all training series (modules/courses) in MindTickle. Each series contains lessons, quizzes, and missions that reps must complete.",
        method: "GET" as const,
        path: "/series",
        queryParams: JSON.stringify([
          {
            name: "status",
            type: "string",
            description: "Filter by series status: published, draft, archived",
          },
          {
            name: "limit",
            type: "number",
            default: 50,
            description: "Number of results per page",
          },
          {
            name: "offset",
            type: "number",
            default: 0,
            description: "Offset for pagination",
          },
        ]),
        aiUsageHint:
          "List training modules/courses. Use status=published to see active training content.",
        exampleArgs: JSON.stringify({ status: "published", limit: 25 }),
      },
      {
        name: "get_series_progress",
        displayName: "Get Series Progress",
        description:
          "Get completion progress for all users assigned to a specific training series. Returns per-user completion percentage, score, and time spent.",
        method: "GET" as const,
        path: "/series/{series_id}/users",
        pathParams: JSON.stringify([
          {
            name: "series_id",
            type: "string",
            required: true,
            description: "MindTickle series ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "completion_status",
            type: "string",
            description:
              "Filter by: completed, in_progress, not_started, overdue",
          },
          {
            name: "limit",
            type: "number",
            default: 50,
            description: "Number of results per page",
          },
        ]),
        aiUsageHint:
          "Get progress for all reps on a specific training module. Use completion_status=overdue to find reps falling behind.",
        exampleArgs: JSON.stringify({
          series_id: "ser_67890",
          completion_status: "overdue",
        }),
      },
      {
        name: "get_user_scores",
        displayName: "Get User Readiness Scores",
        description:
          "Get readiness scores, quiz results, and performance metrics for a specific user. Includes Ideal Rep Profile (IRP) scores and skill ratings.",
        method: "GET" as const,
        path: "/users/{user_id}/scores",
        pathParams: JSON.stringify([
          {
            name: "user_id",
            type: "string",
            required: true,
            description: "MindTickle user ID",
          },
        ]),
        aiUsageHint:
          "Get a rep's readiness scores and quiz performance. Use this to identify knowledge gaps or top performers.",
        exampleArgs: JSON.stringify({ user_id: "usr_12345" }),
      },
      {
        name: "list_coaching_sessions",
        displayName: "List Coaching Sessions",
        description:
          "List coaching sessions including call reviews, role-plays, and manager feedback. Filter by user, date range, or coaching type.",
        method: "GET" as const,
        path: "/coaching",
        queryParams: JSON.stringify([
          {
            name: "user_id",
            type: "string",
            description: "Filter by specific user ID",
          },
          {
            name: "type",
            type: "string",
            description: "Filter by type: call_review, role_play, assessment",
          },
          {
            name: "from_date",
            type: "string",
            description: "Start date filter (YYYY-MM-DD)",
          },
          {
            name: "to_date",
            type: "string",
            description: "End date filter (YYYY-MM-DD)",
          },
          {
            name: "limit",
            type: "number",
            default: 50,
            description: "Number of results per page",
          },
        ]),
        aiUsageHint:
          "List coaching sessions. Filter by user_id to see a specific rep's coaching history. Use date filters for recent activity.",
        exampleArgs: JSON.stringify({
          user_id: "usr_12345",
          from_date: "2026-01-01",
          to_date: "2026-02-20",
          limit: 20,
        }),
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
      message: "✅ MindTickle blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Get API token from MindTickle Admin → Integrations → API",
        "2. Connect via the Integrations page using the bearer token auth flow",
        "3. Enter the API token when prompted",
      ],
    };
  },
});
