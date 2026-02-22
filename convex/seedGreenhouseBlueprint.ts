/**
 * Seed Greenhouse integration blueprint
 * Run this once to create the Greenhouse blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedGreenhouseBlueprint -> Run
 *
 * Prerequisites:
 * 1. Get a Harvest API key from Greenhouse → Configure → Dev Center → API Credential Management
 *    - Create credential with type "Harvest"
 *    - Grant permissions for candidates, applications, jobs, scheduled interviews
 * 2. Connect via the Integrations page using basic auth (API key as username, empty password)
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "greenhouse"))
      .first();

    if (existing) {
      return {
        message: "Greenhouse blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "greenhouse",
      name: "Greenhouse",
      description:
        "Recruiting and applicant tracking system. Access candidates, applications, jobs, and interviews. Track hiring pipeline, advance candidates through stages, and manage recruiting workflows.",
      category: "HR",
      version: 1,
      status: "active",
      authType: "basic_auth",
      authConfig: JSON.stringify({
        usernameLabel: "Harvest API Key",
        passwordLabel: "Leave empty",
        note: "Greenhouse uses the API key as the username with an empty password for Basic auth.",
      }),
      baseUrl: "https://harvest.greenhouse.io/v1",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.greenhouse.io/harvest.html",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/greenhouse-2.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_candidates",
        displayName: "List Candidates",
        description:
          "List candidates in the Greenhouse ATS. Filter by creation date, update date, or job. Returns candidate profiles with their applications and current stage.",
        method: "GET" as const,
        path: "/candidates",
        queryParams: JSON.stringify([
          {
            name: "per_page",
            type: "number",
            default: 100,
            description: "Results per page (max 500)",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
          {
            name: "created_after",
            type: "string",
            description: "Filter candidates created after this date (ISO 8601)",
          },
          {
            name: "updated_after",
            type: "string",
            description:
              "Filter candidates updated after this date (ISO 8601)",
          },
          {
            name: "job_id",
            type: "number",
            description: "Filter by job ID",
          },
        ]),
        aiUsageHint:
          "List candidates in the ATS. Use created_after or updated_after for recent candidates. Use job_id to scope to a specific role.",
        exampleArgs: JSON.stringify({
          per_page: 50,
          updated_after: "2026-01-01T00:00:00Z",
        }),
      },
      {
        name: "get_candidate",
        displayName: "Get Candidate",
        description:
          "Get detailed candidate profile including all applications, current stage, source, recruiter, and coordinator.",
        method: "GET" as const,
        path: "/candidates/{id}",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "number",
            required: true,
            description: "Greenhouse candidate ID",
          },
        ]),
        aiUsageHint:
          "Get a candidate's full profile by ID. Returns all applications, current stages, and recruiter info.",
        exampleArgs: JSON.stringify({ id: 12345678 }),
      },
      {
        name: "list_applications",
        displayName: "List Applications",
        description:
          "List job applications. Filter by status (active, rejected, hired) or by job and creation date.",
        method: "GET" as const,
        path: "/applications",
        queryParams: JSON.stringify([
          {
            name: "per_page",
            type: "number",
            default: 100,
            description: "Results per page (max 500)",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
          {
            name: "status",
            type: "string",
            description: "Filter by status: active, rejected, hired",
          },
          {
            name: "job_id",
            type: "number",
            description: "Filter by job ID",
          },
          {
            name: "created_after",
            type: "string",
            description: "Filter by creation date (ISO 8601)",
          },
        ]),
        aiUsageHint:
          "List applications. Use status=active for in-pipeline candidates. Combine with job_id to see applicants for a specific role.",
        exampleArgs: JSON.stringify({
          status: "active",
          per_page: 50,
        }),
      },
      {
        name: "get_application",
        displayName: "Get Application",
        description:
          "Get detailed application including current stage, rejection reason, source, and all interview scorecards.",
        method: "GET" as const,
        path: "/applications/{id}",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "number",
            required: true,
            description: "Greenhouse application ID",
          },
        ]),
        aiUsageHint:
          "Get full application details by ID including interview scorecards and stage history.",
        exampleArgs: JSON.stringify({ id: 98765432 }),
      },
      {
        name: "list_jobs",
        displayName: "List Jobs",
        description:
          "List open positions/jobs in Greenhouse. Filter by status (open, closed, draft) or department.",
        method: "GET" as const,
        path: "/jobs",
        queryParams: JSON.stringify([
          {
            name: "per_page",
            type: "number",
            default: 100,
            description: "Results per page (max 500)",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
          {
            name: "status",
            type: "string",
            description: "Filter by status: open, closed, draft",
          },
          {
            name: "department_id",
            type: "number",
            description: "Filter by department ID",
          },
        ]),
        aiUsageHint:
          "List jobs/roles. Use status=open to see active openings. Use department_id to filter by team.",
        exampleArgs: JSON.stringify({ status: "open", per_page: 50 }),
      },
      {
        name: "get_job",
        displayName: "Get Job",
        description:
          "Get detailed job posting including hiring team, opening count, departments, offices, and pipeline stages.",
        method: "GET" as const,
        path: "/jobs/{id}",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "number",
            required: true,
            description: "Greenhouse job ID",
          },
        ]),
        aiUsageHint:
          "Get full job details including hiring team, office locations, and pipeline stages.",
        exampleArgs: JSON.stringify({ id: 4567890 }),
      },
      {
        name: "list_scheduled_interviews",
        displayName: "List Scheduled Interviews",
        description:
          "List scheduled interviews. Filter by date range or application to see upcoming interviews across the team.",
        method: "GET" as const,
        path: "/scheduled_interviews",
        queryParams: JSON.stringify([
          {
            name: "per_page",
            type: "number",
            default: 100,
            description: "Results per page (max 500)",
          },
          {
            name: "page",
            type: "number",
            default: 1,
            description: "Page number",
          },
          {
            name: "starts_after",
            type: "string",
            description: "Filter interviews starting after this date (ISO 8601)",
          },
          {
            name: "ends_before",
            type: "string",
            description:
              "Filter interviews ending before this date (ISO 8601)",
          },
          {
            name: "application_id",
            type: "number",
            description: "Filter by application ID",
          },
        ]),
        aiUsageHint:
          "List upcoming interviews. Use starts_after with today's date to see future interviews. Use application_id to see a specific candidate's interview schedule.",
        exampleArgs: JSON.stringify({
          starts_after: "2026-02-20T00:00:00Z",
          per_page: 25,
        }),
      },
      {
        name: "advance_application",
        displayName: "Advance Application",
        description:
          "Move an application to the next stage in the hiring pipeline. The application advances to whatever the next configured stage is.",
        method: "POST" as const,
        path: "/applications/{id}/advance",
        pathParams: JSON.stringify([
          {
            name: "id",
            type: "number",
            required: true,
            description: "Greenhouse application ID to advance",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            from_stage_id: {
              type: "number",
              description:
                "Current stage ID (optional, validates the application is at this stage)",
            },
          },
        }),
        aiUsageHint:
          "Advance a candidate to the next pipeline stage. Optionally provide from_stage_id to validate they're at the expected stage first.",
        exampleArgs: JSON.stringify({
          id: 98765432,
          from_stage_id: 1234,
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
      message: "✅ Greenhouse blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to Greenhouse → Configure → Dev Center → API Credential Management",
        "2. Create a new API credential with type 'Harvest'",
        "3. Grant permissions: Candidates, Applications, Jobs, Scheduled Interviews",
        "4. Connect via the Integrations page using basic auth",
        "5. Enter the Harvest API key as the username, leave password empty",
      ],
    };
  },
});
