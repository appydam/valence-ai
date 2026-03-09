/**
 * Seed Klaviyo integration blueprint
 * Run this once to create the Klaviyo blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedKlaviyoBlueprint -> Run
 *
 * Prerequisites:
 * - Create an OAuth app at https://www.klaviyo.com/oauth/client
 * - Set OAUTH_SECRET_KLAVIYO env var in Convex dashboard
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "klaviyo"))
      .first();

    if (existing) {
      return {
        message: "Klaviyo blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "klaviyo",
      name: "Klaviyo",
      description:
        "Email and SMS marketing platform. Manage profiles, lists, campaigns, flows, and events to power e-commerce marketing automation.",
      category: "marketing",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_KLAVIYO",
        authorizeUrl: "https://www.klaviyo.com/oauth/authorize",
        tokenUrl: "https://a.klaviyo.com/oauth/token",
        scopes: [
          "accounts:read",
          "campaigns:read",
          "campaigns:write",
          "events:read",
          "events:write",
          "flows:read",
          "lists:read",
          "lists:write",
          "metrics:read",
          "profiles:read",
          "profiles:write",
          "segments:read",
          "tags:read",
          "tags:write",
        ],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://a.klaviyo.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
        revision: "2024-10-15",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.klaviyo.com/en/reference/api_overview",
      iconUrl: "https://cdn.simpleicons.org/klaviyo/ffffff",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_profiles",
        displayName: "List Profiles",
        description: "List all profiles (contacts) in the Klaviyo account. Supports filtering and sorting.",
        method: "GET" as const,
        path: "/api/profiles",
        queryParams: JSON.stringify([
          { name: "filter", type: "string", description: "Filter expression, e.g. equals(email,\"test@example.com\")" },
          { name: "page[size]", type: "number", description: "Number of results per page (max 100)", default: 20 },
          { name: "page[cursor]", type: "string", description: "Cursor for pagination" },
          { name: "sort", type: "string", description: "Sort field, e.g. -created (descending)" },
        ]),
        aiUsageHint: "List Klaviyo profiles/contacts. Use filter to search by email: equals(email,\"user@example.com\"). Paginate with page[cursor].",
        exampleArgs: JSON.stringify({ filter: "equals(email,\"customer@example.com\")" }),
      },
      {
        name: "get_profile",
        displayName: "Get Profile",
        description: "Get a single Klaviyo profile by its ID.",
        method: "GET" as const,
        path: "/api/profiles/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Klaviyo profile ID" },
        ]),
        aiUsageHint: "Fetch a specific Klaviyo profile by ID. Use list_profiles first to find the ID.",
        exampleArgs: JSON.stringify({ id: "01GDDKASAP8TKDDA2GRZDSVP4H" }),
      },
      {
        name: "create_profile",
        displayName: "Create Profile",
        description: "Create a new profile (contact) in Klaviyo.",
        method: "POST" as const,
        path: "/api/profiles",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["type", "attributes"],
              properties: {
                type: { type: "string", enum: ["profile"] },
                attributes: {
                  type: "object",
                  properties: {
                    email: { type: "string", description: "Email address" },
                    phone_number: { type: "string", description: "Phone number in E.164 format" },
                    first_name: { type: "string" },
                    last_name: { type: "string" },
                    organization: { type: "string" },
                    properties: { type: "object", description: "Custom properties" },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Create a new Klaviyo profile. At least one of email or phone_number is required.",
        exampleArgs: JSON.stringify({
          data: {
            type: "profile",
            attributes: { email: "newuser@example.com", first_name: "Jane", last_name: "Doe" },
          },
        }),
      },
      {
        name: "update_profile",
        displayName: "Update Profile",
        description: "Update an existing Klaviyo profile's attributes or custom properties.",
        method: "PATCH" as const,
        path: "/api/profiles/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Klaviyo profile ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["type", "id", "attributes"],
              properties: {
                type: { type: "string", enum: ["profile"] },
                id: { type: "string" },
                attributes: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    first_name: { type: "string" },
                    last_name: { type: "string" },
                    properties: { type: "object", description: "Custom properties to merge" },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Update a Klaviyo profile. Only provided fields are changed.",
        exampleArgs: JSON.stringify({
          id: "01GDDKASAP8TKDDA2GRZDSVP4H",
          data: { type: "profile", id: "01GDDKASAP8TKDDA2GRZDSVP4H", attributes: { first_name: "Jane Updated" } },
        }),
      },
      {
        name: "list_lists",
        displayName: "List Lists",
        description: "List all subscriber lists in the Klaviyo account.",
        method: "GET" as const,
        path: "/api/lists",
        queryParams: JSON.stringify([
          { name: "page[size]", type: "number", default: 20 },
          { name: "page[cursor]", type: "string" },
        ]),
        aiUsageHint: "List all Klaviyo mailing lists. Use to find list IDs needed for adding profiles.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "add_profiles_to_list",
        displayName: "Add Profiles to List",
        description: "Subscribe one or more profiles to a Klaviyo list.",
        method: "POST" as const,
        path: "/api/lists/{id}/relationships/profiles",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "List ID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["profile"] },
                  id: { type: "string", description: "Profile ID" },
                },
              },
            },
          },
        }),
        aiUsageHint: "Add profiles to a Klaviyo list. Provide list ID and array of profile IDs.",
        exampleArgs: JSON.stringify({
          id: "LIST_ID",
          data: [{ type: "profile", id: "PROFILE_ID" }],
        }),
      },
      {
        name: "create_event",
        displayName: "Create Event",
        description: "Track a custom event for a profile in Klaviyo (e.g. Placed Order, Viewed Product).",
        method: "POST" as const,
        path: "/api/events",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["type", "attributes"],
              properties: {
                type: { type: "string", enum: ["event"] },
                attributes: {
                  type: "object",
                  required: ["metric", "profile"],
                  properties: {
                    metric: {
                      type: "object",
                      properties: { data: { type: "object", properties: { type: { type: "string", enum: ["metric"] }, attributes: { type: "object", properties: { name: { type: "string" } } } } } },
                    },
                    profile: {
                      type: "object",
                      properties: { data: { type: "object", properties: { type: { type: "string", enum: ["profile"] }, attributes: { type: "object", properties: { email: { type: "string" } } } } } },
                    },
                    properties: { type: "object", description: "Custom event properties" },
                    value: { type: "number", description: "Monetary value of the event" },
                    time: { type: "string", description: "ISO 8601 timestamp" },
                  },
                },
              },
            },
          },
        }),
        aiUsageHint: "Track a custom Klaviyo event for a user. Use for 'Placed Order', 'Signed Up', etc. Include profile email and event properties.",
        exampleArgs: JSON.stringify({
          data: {
            type: "event",
            attributes: {
              metric: { data: { type: "metric", attributes: { name: "Placed Order" } } },
              profile: { data: { type: "profile", attributes: { email: "customer@example.com" } } },
              properties: { order_id: "ORD-123", total: 99.99 },
              value: 99.99,
            },
          },
        }),
      },
      {
        name: "get_campaigns",
        displayName: "List Campaigns",
        description: "List email or SMS campaigns in the Klaviyo account.",
        method: "GET" as const,
        path: "/api/campaigns",
        queryParams: JSON.stringify([
          { name: "filter", type: "string", description: "Filter, e.g. equals(messages.channel,'email')" },
          { name: "page[size]", type: "number", default: 20 },
          { name: "page[cursor]", type: "string" },
          { name: "sort", type: "string", description: "Sort field, e.g. -created_at" },
        ]),
        aiUsageHint: "List Klaviyo campaigns. Filter by channel: equals(messages.channel,'email') for email campaigns.",
        exampleArgs: JSON.stringify({ filter: "equals(messages.channel,'email')" }),
      },
      {
        name: "get_metrics",
        displayName: "List Metrics",
        description: "List all metrics (event types) tracked in the Klaviyo account.",
        method: "GET" as const,
        path: "/api/metrics",
        queryParams: JSON.stringify([
          { name: "page[size]", type: "number", default: 20 },
        ]),
        aiUsageHint: "List all Klaviyo metrics/event types. Use to find metric names and IDs for analytics queries.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "get_flows",
        displayName: "List Flows",
        description: "List all automated flows (drip campaigns) in the Klaviyo account.",
        method: "GET" as const,
        path: "/api/flows",
        queryParams: JSON.stringify([
          { name: "filter", type: "string", description: "Filter expression" },
          { name: "page[size]", type: "number", default: 20 },
          { name: "sort", type: "string" },
        ]),
        aiUsageHint: "List all Klaviyo automation flows. Use to view active drip campaigns and their trigger conditions.",
        exampleArgs: JSON.stringify({}),
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
      message: "✅ Klaviyo blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth app at https://www.klaviyo.com/oauth/client",
        "2. Set OAUTH_SECRET_KLAVIYO in Convex environment variables",
        "3. Update the clientId in authConfig using updateKlaviyoBlueprint if needed",
      ],
    };
  },
});
