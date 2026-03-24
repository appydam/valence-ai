/**
 * Seed Rippling integration blueprint
 *
 * Rippling OAuth2 — required for all integrations.
 * Auth code valid for 300 seconds only.
 * One access token = one Rippling company.
 * Token expires after 30 days of inactivity.
 * Requires partner account + app review.
 *
 * Usage:
 * npx convex run seedRipplingBlueprint --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "rippling"))
      .first();

    if (existing) {
      return { message: "Rippling blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.RIPPLING_CLIENT_ID || "YOUR_RIPPLING_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_RIPPLING",
      authorizeUrl: "https://app.rippling.com/apps/PLATFORM/ValenceAI",
      tokenUrl: "https://app.rippling.com/api/o/token/",
      scopes: ["employees:read", "departments:read", "teams:read"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "rippling",
      name: "Rippling",
      description: "Unified HR, IT, and Finance — manage employees, departments, teams, payroll, and company data.",
      category: "hr",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.rippling.com/platform/api",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://developer.rippling.com/documentation/rest-api",
      iconUrl: "https://logo.clearbit.com/rippling.com",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_employees",
        displayName: "List Employees",
        description: "Get a list of all employees in the company",
        method: "GET" as const,
        path: "/employees",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50, description: "Max results per page" },
          { name: "offset", type: "number", default: 0, description: "Offset for pagination" },
        ]),
        aiUsageHint: "List all employees. Returns name, workEmail, department, title, startDate, status.",
        exampleArgs: JSON.stringify({ limit: 50 }),
      },
      {
        name: "get_employee",
        displayName: "Get Employee",
        description: "Get detailed info for a specific employee by ID",
        method: "GET" as const,
        path: "/employees/{employee_id}",
        pathParams: JSON.stringify([
          { name: "employee_id", type: "string", required: true, description: "Employee ID" },
        ]),
        aiUsageHint: "Get a single employee's full profile — name, email, department, title, manager, start date, compensation.",
        exampleArgs: JSON.stringify({ employee_id: "abc123" }),
      },
      {
        name: "list_departments",
        displayName: "List Departments",
        description: "Get all departments in the company",
        method: "GET" as const,
        path: "/departments",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50 },
          { name: "offset", type: "number", default: 0 },
        ]),
        aiUsageHint: "List all departments. Returns department name, parent department, head count.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_teams",
        displayName: "List Teams",
        description: "Get all teams in the company",
        method: "GET" as const,
        path: "/teams",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50 },
          { name: "offset", type: "number", default: 0 },
        ]),
        aiUsageHint: "List all teams. Returns team name, members, team lead.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "get_company",
        displayName: "Get Company Info",
        description: "Get information about the current company",
        method: "GET" as const,
        path: "/company",
        aiUsageHint: "Get company information — name, address, EIN, industry, employee count.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_work_locations",
        displayName: "List Work Locations",
        description: "Get all work locations/offices",
        method: "GET" as const,
        path: "/work-locations",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50 },
          { name: "offset", type: "number", default: 0 },
        ]),
        aiUsageHint: "List all work locations. Returns address, city, state, country for each office.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_groups",
        displayName: "List Groups",
        description: "Get all employee groups",
        method: "GET" as const,
        path: "/groups",
        queryParams: JSON.stringify([
          { name: "limit", type: "number", default: 50 },
          { name: "offset", type: "number", default: 0 },
        ]),
        aiUsageHint: "List all employee groups. Returns group name, type, member count.",
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
      message: "Rippling blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
    };
  },
});
