/**
 * Seed Keka integration blueprint
 *
 * Keka OAuth2 — authorization code flow via App Portal.
 * Scopes: kekaapi, offline_access.
 * Base URL is tenant-specific: {company}.keka.com/api/v1
 * After token exchange, must call "Mark App Status" within 5 min.
 *
 * Usage:
 * npx convex run seedKekaBlueprint --url https://beloved-squirrel-599.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "keka"))
      .first();

    if (existing) {
      return { message: "Keka blueprint already exists", blueprintId: existing._id };
    }

    const authConfig = {
      clientId: process.env.KEKA_CLIENT_ID || "YOUR_KEKA_CLIENT_ID",
      clientSecret: "OAUTH_SECRET_KEKA",
      authorizeUrl: "https://login.keka.com/connect/authorize",
      tokenUrl: "https://login.keka.com/connect/token",
      scopes: ["kekaapi", "offline_access"],
      scopeSeparator: "space",
      tokenEndpointAuth: "body",
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "keka",
      name: "Keka",
      description: "HR and payroll — manage employees, leave requests, attendance, and payroll data.",
      category: "hr",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.keka.com/api/v1",
      defaultHeaders: JSON.stringify({
        "Accept": "application/json",
        "Content-Type": "application/json",
      }),
      sourceType: "manual",
      sourceUrl: "https://developers.keka.com/reference",
      iconUrl: "https://logo.clearbit.com/keka.com",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_employees",
        displayName: "List Employees",
        description: "Get a list of all employees in the organization",
        method: "GET" as const,
        path: "/hris/employees",
        queryParams: JSON.stringify([
          { name: "pageNumber", type: "number", default: 1, description: "Page number (1-based)" },
          { name: "pageSize", type: "number", default: 100, description: "Items per page (max 200)" },
          { name: "employeeStatus", type: "string", description: "Filter: Active, Inactive, All", default: "Active" },
        ]),
        aiUsageHint: "List employees. Returns displayName, email, employeeNumber, department, designation, joiningDate.",
        exampleArgs: JSON.stringify({ pageSize: 50, employeeStatus: "Active" }),
      },
      {
        name: "get_employee",
        displayName: "Get Employee",
        description: "Get detailed info for a specific employee",
        method: "GET" as const,
        path: "/hris/employees/{employee_id}",
        pathParams: JSON.stringify([
          { name: "employee_id", type: "string", required: true, description: "Employee UUID" },
        ]),
        aiUsageHint: "Get full employee profile — personal info, department, designation, reporting manager, joining date.",
        exampleArgs: JSON.stringify({ employee_id: "abc-123-def" }),
      },
      {
        name: "list_departments",
        displayName: "List Departments",
        description: "Get all departments in the organization",
        method: "GET" as const,
        path: "/hris/departments",
        queryParams: JSON.stringify([
          { name: "pageNumber", type: "number", default: 1 },
          { name: "pageSize", type: "number", default: 100 },
        ]),
        aiUsageHint: "List all departments. Returns department name, head, employee count.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_leave_requests",
        displayName: "List Leave Requests",
        description: "Get leave requests with optional filters",
        method: "GET" as const,
        path: "/time/leaverequests",
        queryParams: JSON.stringify([
          { name: "fromDate", type: "string", description: "Start date (YYYY-MM-DD)" },
          { name: "toDate", type: "string", description: "End date (YYYY-MM-DD)" },
          { name: "status", type: "string", description: "Pending, Approved, Rejected, Cancelled" },
          { name: "pageNumber", type: "number", default: 1 },
          { name: "pageSize", type: "number", default: 100 },
        ]),
        aiUsageHint: "List leave requests. Filter by date range and status. Returns employee, leave type, dates, status.",
        exampleArgs: JSON.stringify({ fromDate: "2026-03-01", toDate: "2026-03-31", status: "Pending" }),
      },
      {
        name: "list_attendance",
        displayName: "List Attendance",
        description: "Get attendance records for employees",
        method: "GET" as const,
        path: "/time/attendance",
        queryParams: JSON.stringify([
          { name: "fromDate", type: "string", required: true, description: "Start date (YYYY-MM-DD)" },
          { name: "toDate", type: "string", required: true, description: "End date (YYYY-MM-DD)" },
          { name: "pageNumber", type: "number", default: 1 },
          { name: "pageSize", type: "number", default: 100 },
        ]),
        aiUsageHint: "Get attendance records. Returns check-in/check-out times, total hours, status per employee per day.",
        exampleArgs: JSON.stringify({ fromDate: "2026-03-01", toDate: "2026-03-07" }),
      },
      {
        name: "list_designations",
        displayName: "List Designations",
        description: "Get all job designations/titles",
        method: "GET" as const,
        path: "/hris/designations",
        queryParams: JSON.stringify([
          { name: "pageNumber", type: "number", default: 1 },
          { name: "pageSize", type: "number", default: 100 },
        ]),
        aiUsageHint: "List all job designations (titles) in the organization.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_locations",
        displayName: "List Locations",
        description: "Get all office locations",
        method: "GET" as const,
        path: "/hris/locations",
        queryParams: JSON.stringify([
          { name: "pageNumber", type: "number", default: 1 },
          { name: "pageSize", type: "number", default: 100 },
        ]),
        aiUsageHint: "List all office locations. Returns location name, address, timezone.",
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
      message: "Keka blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
    };
  },
});
