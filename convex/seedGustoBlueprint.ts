/**
 * Seed Gusto integration blueprint
 * Run this once to create the Gusto blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedGustoBlueprint -> Run
 *
 * Prerequisites:
 * 1. Register a developer application at https://dev.gusto.com/
 *    - Add redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 * 2. Set in Convex env vars:
 *    - GUSTO_CLIENT_ID = Application ID
 *    - OAUTH_SECRET_GUSTO = Application Secret
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "gusto"))
      .first();

    if (existing) {
      return {
        message: "Gusto blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "gusto",
      name: "Gusto",
      description:
        "HR, payroll, and benefits platform. Access employee records, view payroll history, manage time-off requests, and track benefits enrollment.",
      category: "HR",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: process.env.GUSTO_CLIENT_ID || "YOUR_GUSTO_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_GUSTO",
        authorizeUrl: "https://api.gusto.com/oauth/authorize",
        tokenUrl: "https://api.gusto.com/oauth/token",
        scopes: [
          "company_admin:read",
          "company_admin:write",
          "employees:read",
          "employees:write",
          "payrolls:read",
        ],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.gusto.com/v1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://docs.gusto.com/app-integrations/docs/introduction",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/gusto-2.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "get_company",
        displayName: "Get Company",
        description:
          "Get company information including name, EIN, addresses, and filing status. Use this to get the company_id needed for other API calls.",
        method: "GET" as const,
        path: "/companies/{company_id}",
        pathParams: JSON.stringify([
          {
            name: "company_id",
            type: "string",
            required: true,
            description: "Gusto company UUID",
          },
        ]),
        aiUsageHint:
          "Get company details. The company_id is returned during OAuth. Use this to verify the connected company and get metadata.",
        exampleArgs: JSON.stringify({
          company_id: "7757616923542645",
        }),
      },
      {
        name: "list_employees",
        displayName: "List Employees",
        description:
          "List all employees for a company. Returns names, emails, departments, job titles, start dates, and compensation details.",
        method: "GET" as const,
        path: "/companies/{company_id}/employees",
        pathParams: JSON.stringify([
          {
            name: "company_id",
            type: "string",
            required: true,
            description: "Gusto company UUID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "terminated",
            type: "boolean",
            description:
              "Include terminated employees. Default false (active only).",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
          {
            name: "per",
            type: "number",
            default: 100,
            description: "Results per page",
          },
        ]),
        aiUsageHint:
          "List company employees. Defaults to active employees only. Set terminated=true to include former employees.",
        exampleArgs: JSON.stringify({
          company_id: "7757616923542645",
          per: 50,
        }),
      },
      {
        name: "get_employee",
        displayName: "Get Employee",
        description:
          "Get detailed employee record including personal info, job title, department, compensation, and emergency contacts.",
        method: "GET" as const,
        path: "/employees/{employee_id}",
        pathParams: JSON.stringify([
          {
            name: "employee_id",
            type: "string",
            required: true,
            description: "Gusto employee UUID",
          },
        ]),
        aiUsageHint:
          "Get a specific employee's full profile by their Gusto employee ID.",
        exampleArgs: JSON.stringify({
          employee_id: "7757727716657803",
        }),
      },
      {
        name: "list_payrolls",
        displayName: "List Payrolls",
        description:
          "List payrolls for a company. Filter by processed/unprocessed status. Returns payroll periods, totals, and processing status.",
        method: "GET" as const,
        path: "/companies/{company_id}/payrolls",
        pathParams: JSON.stringify([
          {
            name: "company_id",
            type: "string",
            required: true,
            description: "Gusto company UUID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "processed",
            type: "boolean",
            description:
              "true for processed payrolls, false for unprocessed/upcoming",
          },
          {
            name: "start_date",
            type: "string",
            description: "Filter payrolls starting on or after this date (YYYY-MM-DD)",
          },
          {
            name: "end_date",
            type: "string",
            description: "Filter payrolls ending on or before this date (YYYY-MM-DD)",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
          {
            name: "per",
            type: "number",
            default: 25,
            description: "Results per page",
          },
        ]),
        aiUsageHint:
          "List payrolls. Use processed=true for completed payrolls, false for upcoming. Use date filters for specific periods.",
        exampleArgs: JSON.stringify({
          company_id: "7757616923542645",
          processed: true,
          start_date: "2026-01-01",
          end_date: "2026-02-28",
        }),
      },
      {
        name: "get_payroll",
        displayName: "Get Payroll",
        description:
          "Get detailed payroll information including per-employee earnings, taxes, deductions, and net pay.",
        method: "GET" as const,
        path: "/companies/{company_id}/payrolls/{payroll_id}",
        pathParams: JSON.stringify([
          {
            name: "company_id",
            type: "string",
            required: true,
            description: "Gusto company UUID",
          },
          {
            name: "payroll_id",
            type: "string",
            required: true,
            description: "Gusto payroll UUID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "show_calculation",
            type: "string",
            description:
              "Set to 'true' to include detailed tax and deduction calculations",
          },
        ]),
        aiUsageHint:
          "Get detailed payroll data with per-employee breakdowns. Use show_calculation=true for full tax details.",
        exampleArgs: JSON.stringify({
          company_id: "7757616923542645",
          payroll_id: "7757909450038582",
          show_calculation: "true",
        }),
      },
      {
        name: "list_time_off_requests",
        displayName: "List Time Off Requests",
        description:
          "List time-off/PTO requests for a company. Filter by status (pending, approved, denied) or employee.",
        method: "GET" as const,
        path: "/companies/{company_id}/time_off_requests",
        pathParams: JSON.stringify([
          {
            name: "company_id",
            type: "string",
            required: true,
            description: "Gusto company UUID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "status",
            type: "string",
            description: "Filter by status: pending, approved, denied",
          },
          {
            name: "employee_id",
            type: "string",
            description: "Filter by specific employee UUID",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
          {
            name: "per",
            type: "number",
            default: 25,
            description: "Results per page",
          },
        ]),
        aiUsageHint:
          "List PTO requests. Use status=pending to see requests awaiting approval. Filter by employee_id for a specific person.",
        exampleArgs: JSON.stringify({
          company_id: "7757616923542645",
          status: "pending",
        }),
      },
      {
        name: "list_benefits",
        displayName: "List Company Benefits",
        description:
          "List benefit plans (health, dental, 401k, etc.) offered by the company. Returns plan names, types, and enrollment details.",
        method: "GET" as const,
        path: "/companies/{company_id}/company_benefits",
        pathParams: JSON.stringify([
          {
            name: "company_id",
            type: "string",
            required: true,
            description: "Gusto company UUID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
          {
            name: "per",
            type: "number",
            default: 25,
            description: "Results per page",
          },
        ]),
        aiUsageHint:
          "List company benefit plans. Returns plan types (health, dental, vision, 401k, etc.) and enrollment counts.",
        exampleArgs: JSON.stringify({
          company_id: "7757616923542645",
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
      message: "✅ Gusto blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Register a developer app at https://dev.gusto.com/",
        "2. Add redirect URI: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. Set GUSTO_CLIENT_ID in Convex env vars (Application ID)",
        "4. Set OAUTH_SECRET_GUSTO in Convex env vars (Application Secret)",
        "5. For production, submit app for Gusto review",
      ],
    };
  },
});
