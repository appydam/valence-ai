/**
 * Seed Workday integration blueprint
 * Run this once to create the Workday blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedWorkdayBlueprint -> Run
 *
 * Prerequisites:
 * 1. Register an API client in Workday → Register API Client (Integrations)
 *    - Add redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 *    - Grant scope: r:workers, r:organizations
 * 2. Set in Convex env vars:
 *    - WORKDAY_CLIENT_ID = API Client ID
 *    - OAUTH_SECRET_WORKDAY = API Client Secret
 *
 * IMPORTANT: Workday REST API URLs are tenant-scoped
 * (e.g. https://wd5-impl-services1.workday.com/ccx/api/v1/mycompany).
 * The {instanceUrl} resolves to the tenant's API base URL at runtime.
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "workday"))
      .first();

    if (existing) {
      return {
        message: "Workday blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "workday",
      name: "Workday",
      description:
        "Human capital management (HCM) and finance platform. Access worker profiles, organizations, time-off plans, and organizational structure via the Workday REST API.",
      category: "HR",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId:
          process.env.WORKDAY_CLIENT_ID || "YOUR_WORKDAY_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_WORKDAY",
        authorizeUrl:
          "https://{tenant}.myworkday.com/authorize",
        tokenUrl:
          "https://{tenant}.myworkday.com/ccx/oauth2/{tenant}/token",
        scopes: ["r:workers", "r:organizations"],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://{tenant}.myworkday.com/ccx/api/v1/{tenant}",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl:
        "https://community.workday.com/sites/default/files/file-hosting/restapi/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/workday-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_workers",
        displayName: "List Workers",
        description:
          "List worker records from Workday. Returns employee profiles with names, job details, and organizational data. Supports search and pagination.",
        method: "GET" as const,
        path: "{instanceUrl}/workers",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description:
              "Workday tenant API URL (e.g. https://wd5-impl-services1.workday.com/ccx/api/v1/mycompany)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "limit",
            type: "number",
            default: 20,
            description: "Max records to return (max 100)",
          },
          {
            name: "offset",
            type: "number",
            default: 0,
            description: "Records to skip for pagination",
          },
          {
            name: "search",
            type: "string",
            description:
              "Free-text search across worker names and IDs",
          },
        ]),
        aiUsageHint:
          "List workers (employees). Use search for name/ID lookup. Default limit is 20, max is 100. Paginate with offset.",
        exampleArgs: JSON.stringify({
          instanceUrl:
            "https://wd5-impl-services1.workday.com/ccx/api/v1/mycompany",
          limit: 25,
        }),
      },
      {
        name: "get_worker",
        displayName: "Get Worker",
        description:
          "Get a specific worker's full profile by their Workday ID. Returns personal data, job info, manager, location, and contact details.",
        method: "GET" as const,
        path: "{instanceUrl}/workers/{id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Workday tenant API URL",
          },
          {
            name: "id",
            type: "string",
            required: true,
            description: "Workday worker ID (WID)",
          },
        ]),
        aiUsageHint:
          "Get a worker's full profile by Workday ID. Returns all available fields for that worker.",
        exampleArgs: JSON.stringify({
          instanceUrl:
            "https://wd5-impl-services1.workday.com/ccx/api/v1/mycompany",
          id: "3aa5550b7fe348b98d7b5741afc65534",
        }),
      },
      {
        name: "list_organizations",
        displayName: "List Organizations",
        description:
          "List organizations (departments, cost centers, supervisory orgs) from Workday. Returns the organizational hierarchy structure.",
        method: "GET" as const,
        path: "{instanceUrl}/organizations",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Workday tenant API URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "limit",
            type: "number",
            default: 20,
            description: "Max records",
          },
          {
            name: "offset",
            type: "number",
            default: 0,
            description: "Pagination offset",
          },
          {
            name: "search",
            type: "string",
            description: "Search by organization name",
          },
        ]),
        aiUsageHint:
          "List organizations (depts, teams, cost centers). Use search to find specific orgs by name.",
        exampleArgs: JSON.stringify({
          instanceUrl:
            "https://wd5-impl-services1.workday.com/ccx/api/v1/mycompany",
          limit: 50,
        }),
      },
      {
        name: "get_organization",
        displayName: "Get Organization",
        description:
          "Get details of a specific organization including members, head, and sub-organizations.",
        method: "GET" as const,
        path: "{instanceUrl}/organizations/{id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Workday tenant API URL",
          },
          {
            name: "id",
            type: "string",
            required: true,
            description: "Workday organization ID (WID)",
          },
        ]),
        aiUsageHint:
          "Get organization details including org head and member count.",
        exampleArgs: JSON.stringify({
          instanceUrl:
            "https://wd5-impl-services1.workday.com/ccx/api/v1/mycompany",
          id: "d3e5c8f2a1b04d7f8e9c1234abcd5678",
        }),
      },
      {
        name: "list_time_off_plans",
        displayName: "List Worker Time Off Plans",
        description:
          "Get time-off plan details for a specific worker including PTO balance, accrued hours, and plan type.",
        method: "GET" as const,
        path: "{instanceUrl}/workers/{id}/timeOffPlans",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Workday tenant API URL",
          },
          {
            name: "id",
            type: "string",
            required: true,
            description: "Workday worker ID (WID)",
          },
        ]),
        aiUsageHint:
          "Get a worker's time-off plans and balances. Shows accrued, used, and remaining PTO for each plan.",
        exampleArgs: JSON.stringify({
          instanceUrl:
            "https://wd5-impl-services1.workday.com/ccx/api/v1/mycompany",
          id: "3aa5550b7fe348b98d7b5741afc65534",
        }),
      },
      {
        name: "search_workers",
        displayName: "Search Workers",
        description:
          "Search for workers by name, email, or employee ID using free-text search.",
        method: "GET" as const,
        path: "{instanceUrl}/workers",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "Workday tenant API URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "search",
            type: "string",
            required: true,
            description:
              "Free-text search query. Searches across worker names and IDs.",
          },
          {
            name: "limit",
            type: "number",
            default: 20,
            description: "Max results",
          },
        ]),
        aiUsageHint:
          "Search workers by name or ID. The search param does free-text matching across worker fields.",
        exampleArgs: JSON.stringify({
          instanceUrl:
            "https://wd5-impl-services1.workday.com/ccx/api/v1/mycompany",
          search: "John Smith",
          limit: 10,
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
      message: "✅ Workday blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. In Workday → Register API Client (Integration)",
        "2. Set redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. Grant scopes: r:workers, r:organizations",
        "4. Set WORKDAY_CLIENT_ID in Convex env vars (Client ID)",
        "5. Set OAUTH_SECRET_WORKDAY in Convex env vars (Client Secret)",
        "6. Note: Users will need to provide their Workday tenant name during connection",
        "7. REST API URL format: https://{hostname}/ccx/api/v1/{tenant}",
      ],
    };
  },
});
