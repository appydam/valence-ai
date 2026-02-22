/**
 * Seed ServiceNow integration blueprint
 * Run this once to create the ServiceNow blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedServiceNowBlueprint -> Run
 *
 * Prerequisites:
 * 1. Register an OAuth application in ServiceNow → System OAuth → Application Registry
 *    - Create an "External Client" application
 *    - Add redirect URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 * 2. Set in Convex env vars:
 *    - SERVICENOW_CLIENT_ID = Client ID from the OAuth application
 *    - OAUTH_SECRET_SERVICENOW = Client Secret from the OAuth application
 *
 * IMPORTANT: ServiceNow API URLs are instance-scoped (e.g. https://yourcompany.service-now.com).
 * The {instanceUrl} path param is resolved at runtime from the user's connection.
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "servicenow"))
      .first();

    if (existing) {
      return {
        message: "ServiceNow blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "servicenow",
      name: "ServiceNow",
      description:
        "IT service management platform. Manage incidents, change requests, service catalog items, and knowledge articles. Automate ITSM workflows with AI agents.",
      category: "Support",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId:
          process.env.SERVICENOW_CLIENT_ID || "YOUR_SERVICENOW_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_SERVICENOW",
        authorizeUrl:
          "https://{instance}.service-now.com/oauth_auth.do",
        tokenUrl:
          "https://{instance}.service-now.com/oauth_token.do",
        scopes: ["useraccount"],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://{instance}.service-now.com/api/now",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl:
        "https://developer.servicenow.com/dev.do#!/reference/api/tokyo/rest",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/servicenow.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_incidents",
        displayName: "List Incidents",
        description:
          "List IT incidents from ServiceNow. Filter using sysparm_query with encoded query syntax for status, priority, assignment group, or date ranges.",
        method: "GET" as const,
        path: "{instanceUrl}/api/now/table/incident",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description:
              "ServiceNow instance URL (e.g. https://yourcompany.service-now.com)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "sysparm_query",
            type: "string",
            description:
              "Encoded query string. Examples: 'active=true^priority=1', 'state=1^assignment_group.name=Network', 'sys_created_on>=2026-01-01'",
          },
          {
            name: "sysparm_limit",
            type: "number",
            default: 50,
            description: "Max records to return",
          },
          {
            name: "sysparm_offset",
            type: "number",
            default: 0,
            description: "Offset for pagination",
          },
          {
            name: "sysparm_fields",
            type: "string",
            description:
              "Comma-separated fields. Example: number,short_description,state,priority,assigned_to,sys_created_on",
          },
          {
            name: "sysparm_display_value",
            type: "string",
            description: "true = display values, false = sys_id values, all = both",
            default: "true",
          },
        ]),
        aiUsageHint:
          "List incidents. Use sysparm_query for filtering (^ is AND, ^OR is OR). Common states: 1=New, 2=In Progress, 3=On Hold, 6=Resolved, 7=Closed. Priorities: 1=Critical, 2=High, 3=Moderate, 4=Low.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.service-now.com",
          sysparm_query: "active=true^priority<=2",
          sysparm_limit: 25,
          sysparm_fields:
            "number,short_description,state,priority,assigned_to,assignment_group,sys_created_on",
          sysparm_display_value: "true",
        }),
      },
      {
        name: "get_incident",
        displayName: "Get Incident",
        description:
          "Get full details of a specific incident by sys_id. Returns all fields including work notes, resolution, and SLA data.",
        method: "GET" as const,
        path: "{instanceUrl}/api/now/table/incident/{sys_id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "ServiceNow instance URL",
          },
          {
            name: "sys_id",
            type: "string",
            required: true,
            description: "ServiceNow incident sys_id (32-char GUID)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "sysparm_display_value",
            type: "string",
            default: "true",
            description: "true for display values, false for sys_ids",
          },
        ]),
        aiUsageHint:
          "Get incident details by sys_id. Use sysparm_display_value=true for human-readable values.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.service-now.com",
          sys_id: "a1b2c3d4e5f6g7h8i9j0",
          sysparm_display_value: "true",
        }),
      },
      {
        name: "create_incident",
        displayName: "Create Incident",
        description:
          "Create a new incident in ServiceNow. Set short description, description, urgency, impact, category, and assignment group.",
        method: "POST" as const,
        path: "{instanceUrl}/api/now/table/incident",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "ServiceNow instance URL",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["short_description"],
          properties: {
            short_description: {
              type: "string",
              description: "Brief incident title",
            },
            description: {
              type: "string",
              description: "Detailed incident description",
            },
            urgency: {
              type: "string",
              description: "1=High, 2=Medium, 3=Low",
            },
            impact: {
              type: "string",
              description: "1=High, 2=Medium, 3=Low",
            },
            category: {
              type: "string",
              description:
                "Incident category: inquiry, software, hardware, network, database",
            },
            subcategory: {
              type: "string",
              description: "Subcategory within the selected category",
            },
            assignment_group: {
              type: "string",
              description:
                "Assignment group name or sys_id",
            },
            assigned_to: {
              type: "string",
              description: "User name or sys_id to assign to",
            },
            caller_id: {
              type: "string",
              description: "User who reported the incident (name or sys_id)",
            },
          },
        }),
        aiUsageHint:
          "Create an incident. Always include short_description. Priority is auto-calculated from urgency × impact. Use display values for assignment_group and caller_id when sysparm_input_display_value=true.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.service-now.com",
          short_description: "Email service unavailable",
          description:
            "Multiple users reporting inability to send or receive emails since 08:30 UTC. Exchange Online health dashboard shows degraded service.",
          urgency: "1",
          impact: "1",
          category: "software",
          assignment_group: "Email Support",
        }),
      },
      {
        name: "update_incident",
        displayName: "Update Incident",
        description:
          "Update an existing incident — change state, add work notes, reassign, or update fields.",
        method: "PATCH" as const,
        path: "{instanceUrl}/api/now/table/incident/{sys_id}",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "ServiceNow instance URL",
          },
          {
            name: "sys_id",
            type: "string",
            required: true,
            description: "Incident sys_id",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            state: {
              type: "string",
              description: "1=New, 2=In Progress, 3=On Hold, 6=Resolved, 7=Closed",
            },
            work_notes: {
              type: "string",
              description: "Internal work notes (not visible to caller)",
            },
            comments: {
              type: "string",
              description: "Customer-visible comments",
            },
            assigned_to: {
              type: "string",
              description: "Reassign to user",
            },
            assignment_group: {
              type: "string",
              description: "Reassign to group",
            },
            close_code: {
              type: "string",
              description:
                "Required when resolving: Solved (Work Around), Solved (Permanently), Not Solved, Closed/Resolved by Caller",
            },
            close_notes: {
              type: "string",
              description: "Resolution notes (required when resolving)",
            },
          },
        }),
        aiUsageHint:
          "Update incident fields. Add work_notes for internal notes, comments for customer-visible notes. When resolving (state=6), include close_code and close_notes.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.service-now.com",
          sys_id: "a1b2c3d4e5f6g7h8i9j0",
          state: "2",
          work_notes:
            "Investigating root cause. Initial analysis shows DNS resolution failure.",
        }),
      },
      {
        name: "list_change_requests",
        displayName: "List Change Requests",
        description:
          "List change requests from ServiceNow. Filter by state, type, risk, or assignment group.",
        method: "GET" as const,
        path: "{instanceUrl}/api/now/table/change_request",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "ServiceNow instance URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "sysparm_query",
            type: "string",
            description:
              "Encoded query. Example: 'state=-5^type=normal' (-5=New, -4=Assess, -3=Authorize, -2=Scheduled, -1=Implement, 0=Review, 3=Closed)",
          },
          {
            name: "sysparm_limit",
            type: "number",
            default: 50,
            description: "Max records",
          },
          {
            name: "sysparm_fields",
            type: "string",
            description:
              "Fields to return. Example: number,short_description,state,type,risk,start_date,end_date",
          },
          {
            name: "sysparm_display_value",
            type: "string",
            default: "true",
          },
        ]),
        aiUsageHint:
          "List change requests. Types: normal, standard, emergency. Risk: high, moderate, low. Use sysparm_query for filtering.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.service-now.com",
          sysparm_query: "active=true^type=normal",
          sysparm_limit: 25,
          sysparm_fields:
            "number,short_description,state,type,risk,assignment_group,start_date,end_date",
          sysparm_display_value: "true",
        }),
      },
      {
        name: "create_change_request",
        displayName: "Create Change Request",
        description:
          "Create a new change request for planned infrastructure or application changes.",
        method: "POST" as const,
        path: "{instanceUrl}/api/now/table/change_request",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "ServiceNow instance URL",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["short_description", "type"],
          properties: {
            short_description: {
              type: "string",
              description: "Brief change description",
            },
            description: {
              type: "string",
              description: "Detailed change plan",
            },
            type: {
              type: "string",
              description: "normal, standard, or emergency",
            },
            risk: {
              type: "string",
              description: "high, moderate, low",
            },
            impact: {
              type: "string",
              description: "1=High, 2=Medium, 3=Low",
            },
            start_date: {
              type: "string",
              description: "Planned start date (YYYY-MM-DD HH:MM:SS)",
            },
            end_date: {
              type: "string",
              description: "Planned end date",
            },
            assignment_group: {
              type: "string",
              description: "Implementing team",
            },
            justification: {
              type: "string",
              description: "Business justification for the change",
            },
            implementation_plan: {
              type: "string",
              description: "Step-by-step implementation plan",
            },
            backout_plan: {
              type: "string",
              description: "Rollback plan if change fails",
            },
          },
        }),
        aiUsageHint:
          "Create a change request. Include type, description, start/end dates. For normal changes, include justification, implementation_plan, and backout_plan.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.service-now.com",
          short_description: "Upgrade PostgreSQL from 14 to 16",
          description:
            "Upgrade production PostgreSQL cluster from version 14.9 to 16.2 for performance improvements and security patches.",
          type: "normal",
          risk: "moderate",
          impact: "2",
          start_date: "2026-03-01 02:00:00",
          end_date: "2026-03-01 06:00:00",
          assignment_group: "Database Team",
          justification:
            "PG 14 reaching EOL. PG 16 provides 30% query performance improvement.",
          backout_plan: "Restore from pre-upgrade snapshot within 30 minutes.",
        }),
      },
      {
        name: "list_catalog_items",
        displayName: "List Service Catalog Items",
        description:
          "List available items from the ServiceNow service catalog that users can request.",
        method: "GET" as const,
        path: "{instanceUrl}/api/sn_sc/servicecatalog/items",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "ServiceNow instance URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "sysparm_limit",
            type: "number",
            default: 50,
            description: "Max results",
          },
          {
            name: "sysparm_category",
            type: "string",
            description: "Filter by category sys_id",
          },
          {
            name: "sysparm_text",
            type: "string",
            description: "Text search filter",
          },
        ]),
        aiUsageHint:
          "List service catalog items available for ordering. Use sysparm_text for keyword search.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.service-now.com",
          sysparm_limit: 25,
          sysparm_text: "laptop",
        }),
      },
      {
        name: "search_knowledge",
        displayName: "Search Knowledge Base",
        description:
          "Search ServiceNow knowledge base articles. Find solutions and documentation for common issues.",
        method: "GET" as const,
        path: "{instanceUrl}/api/now/table/kb_knowledge",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "ServiceNow instance URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "sysparm_query",
            type: "string",
            description:
              "Encoded query. Example: 'short_descriptionLIKEvpn^ORtextLIKEvpn^workflow_state=published'",
          },
          {
            name: "sysparm_limit",
            type: "number",
            default: 20,
            description: "Max results",
          },
          {
            name: "sysparm_fields",
            type: "string",
            description:
              "Fields to return. Example: number,short_description,text,sys_view_count,kb_knowledge_base",
          },
          {
            name: "sysparm_display_value",
            type: "string",
            default: "true",
          },
        ]),
        aiUsageHint:
          "Search knowledge articles. Use LIKE operator for text search in sysparm_query. Add workflow_state=published to only get published articles.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://mycompany.service-now.com",
          sysparm_query:
            "short_descriptionLIKEpassword reset^workflow_state=published",
          sysparm_limit: 10,
          sysparm_fields:
            "number,short_description,text,sys_view_count",
          sysparm_display_value: "true",
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
      message: "✅ ServiceNow blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. In ServiceNow → System OAuth → Application Registry → New → External Client",
        "2. Set redirect URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. Set SERVICENOW_CLIENT_ID in Convex env vars (Client ID)",
        "4. Set OAUTH_SECRET_SERVICENOW in Convex env vars (Client Secret)",
        "5. Ensure the OAuth application has scopes for Table API access",
        "6. Note: Users will need to provide their ServiceNow instance name during connection",
      ],
    };
  },
});
