/**
 * Seed Jira Cloud integration blueprint
 * Run this once to create the Jira blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedJiraBlueprint -> Run
 *
 * Prerequisites:
 * 1. Create an OAuth 2.0 app at https://developer.atlassian.com/console/myapps/
 * 2. Add callback URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 * 3. Set in Convex env vars:
 *    - JIRA_CLIENT_ID = your OAuth app client ID
 *    - OAUTH_SECRET_JIRA = your OAuth app client secret
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "jira"))
      .first();

    if (existing) {
      return {
        message: "Jira blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "jira",
      name: "Jira",
      description:
        "Issue tracking and project management for software teams. Create issues, manage sprints, transition statuses, and track work across projects.",
      category: "project_management",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: process.env.JIRA_CLIENT_ID || "YOUR_JIRA_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_JIRA",
        authorizeUrl: "https://auth.atlassian.com/authorize",
        tokenUrl: "https://auth.atlassian.com/oauth/token",
        scopes: [
          "read:jira-work",
          "write:jira-work",
          "read:jira-user",
          "offline_access",
        ],
        scopeSeparator: "space",
        extraAuthParams: {
          audience: "api.atlassian.com",
          prompt: "consent",
        },
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.atlassian.com",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl:
        "https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    // NOTE: All Jira Cloud API calls require {cloudId} in the path.
    // Agents should first call get_accessible_resources to retrieve the cloudId
    // for the user's workspace, then use it in all subsequent calls.
    const tools = [
      {
        name: "get_accessible_resources",
        displayName: "Get Accessible Resources",
        description:
          "Get the list of Jira Cloud sites the user has access to. Returns cloudId, name, and URL for each site. ALWAYS call this first to get the cloudId needed for all other Jira API calls.",
        method: "GET" as const,
        path: "/oauth/token/accessible-resources",
        aiUsageHint:
          "Call this first to get the cloudId for the user's Jira workspace. The cloudId is required in the path of every other Jira API call.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_projects",
        displayName: "List Projects",
        description: "List all Jira projects accessible to the user.",
        method: "GET" as const,
        path: "/ex/jira/{cloudId}/rest/api/3/project/search",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Jira Cloud site ID from get_accessible_resources",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "maxResults",
            type: "number",
            default: 50,
            description: "Max results to return",
          },
          {
            name: "startAt",
            type: "number",
            default: 0,
            description: "Index of first result",
          },
          {
            name: "query",
            type: "string",
            description: "Filter projects by name",
          },
        ]),
        aiUsageHint:
          "List available Jira projects to find project keys for creating issues.",
        exampleArgs: JSON.stringify({ cloudId: "abc123", maxResults: 50 }),
      },
      {
        name: "create_issue",
        displayName: "Create Issue",
        description:
          "Create a new issue in a Jira project. Supports bugs, stories, tasks, epics, and sub-tasks.",
        method: "POST" as const,
        path: "/ex/jira/{cloudId}/rest/api/3/issue",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Jira Cloud site ID",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["fields"],
          properties: {
            fields: {
              type: "object",
              required: ["project", "summary", "issuetype"],
              properties: {
                project: {
                  type: "object",
                  properties: { key: { type: "string" } },
                  description: "Project key (e.g. ENG, SCRUM)",
                },
                summary: { type: "string", description: "Issue title" },
                description: {
                  type: "object",
                  description:
                    "ADF document for the issue body. Use {type:'doc',version:1,content:[{type:'paragraph',content:[{type:'text',text:'...'}]}]}",
                },
                issuetype: {
                  type: "object",
                  properties: { name: { type: "string" } },
                  description: "Issue type: Bug, Story, Task, Epic, Sub-task",
                },
                priority: {
                  type: "object",
                  properties: { name: { type: "string" } },
                  description: "Priority: Highest, High, Medium, Low, Lowest",
                },
                assignee: {
                  type: "object",
                  properties: { accountId: { type: "string" } },
                  description: "Assignee account ID",
                },
                labels: {
                  type: "array",
                  items: { type: "string" },
                  description: "Labels to add",
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a Jira issue. Get the project key from list_projects first. For description use ADF format.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          fields: {
            project: { key: "ENG" },
            summary: "Fix login page crash on Safari",
            issuetype: { name: "Bug" },
            priority: { name: "High" },
            description: {
              type: "doc",
              version: 1,
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Login page crashes on Safari 17. Steps to reproduce: 1. Open Safari 2. Navigate to /login 3. Click Sign In",
                    },
                  ],
                },
              ],
            },
          },
        }),
      },
      {
        name: "get_issue",
        displayName: "Get Issue",
        description:
          "Get full details of a Jira issue including status, assignee, description, and comments.",
        method: "GET" as const,
        path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Jira Cloud site ID",
          },
          {
            name: "issueIdOrKey",
            type: "string",
            required: true,
            description: "Issue ID or key (e.g. ENG-123)",
          },
        ]),
        aiUsageHint:
          "Fetch a specific Jira issue by key (e.g. ENG-123) to read its details, status, and fields.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          issueIdOrKey: "ENG-123",
        }),
      },
      {
        name: "update_issue",
        displayName: "Update Issue",
        description:
          "Update fields of an existing Jira issue (summary, description, priority, assignee, labels, etc.).",
        method: "PUT" as const,
        path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Jira Cloud site ID",
          },
          {
            name: "issueIdOrKey",
            type: "string",
            required: true,
            description: "Issue ID or key",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            fields: {
              type: "object",
              description: "Fields to update (only include fields to change)",
              properties: {
                summary: { type: "string" },
                priority: {
                  type: "object",
                  properties: { name: { type: "string" } },
                },
                assignee: {
                  type: "object",
                  properties: { accountId: { type: "string" } },
                },
                labels: { type: "array", items: { type: "string" } },
              },
            },
          },
        }),
        aiUsageHint:
          "Update specific fields on a Jira issue. Only include the fields you want to change.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          issueIdOrKey: "ENG-123",
          fields: { priority: { name: "Highest" }, labels: ["critical"] },
        }),
      },
      {
        name: "list_issues",
        displayName: "Search Issues (JQL)",
        description:
          "Search Jira issues using JQL (Jira Query Language). Filter by project, status, assignee, sprint, and more.",
        method: "GET" as const,
        path: "/ex/jira/{cloudId}/rest/api/3/search",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Jira Cloud site ID",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "jql",
            type: "string",
            required: true,
            description:
              "JQL query string. Examples: project=ENG AND status=Open, assignee=currentUser() AND sprint in openSprints()",
          },
          {
            name: "maxResults",
            type: "number",
            default: 50,
            description: "Max results",
          },
          {
            name: "startAt",
            type: "number",
            default: 0,
            description: "Pagination offset",
          },
          {
            name: "fields",
            type: "string",
            description:
              "Comma-separated field names to return (default: all)",
          },
        ]),
        aiUsageHint:
          "Use JQL to search issues. Common queries: 'project=ENG AND status=Open', 'assignee=currentUser() AND sprint in openSprints()', 'priority=High AND created>=-7d'",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          jql: "project = ENG AND status = 'In Progress' ORDER BY updated DESC",
          maxResults: 20,
        }),
      },
      {
        name: "get_transitions",
        displayName: "Get Issue Transitions",
        description:
          "Get available status transitions for a Jira issue (e.g. To Do → In Progress → Done). Use this before transition_issue to get valid transition IDs.",
        method: "GET" as const,
        path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}/transitions",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Jira Cloud site ID",
          },
          {
            name: "issueIdOrKey",
            type: "string",
            required: true,
            description: "Issue ID or key",
          },
        ]),
        aiUsageHint:
          "Always call this before transition_issue to get the list of valid transition IDs for the issue.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          issueIdOrKey: "ENG-123",
        }),
      },
      {
        name: "transition_issue",
        displayName: "Transition Issue Status",
        description:
          "Move a Jira issue to a new status (e.g. To Do → In Progress → Done). Get valid transition IDs from get_transitions first.",
        method: "POST" as const,
        path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}/transitions",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Jira Cloud site ID",
          },
          {
            name: "issueIdOrKey",
            type: "string",
            required: true,
            description: "Issue ID or key",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["transition"],
          properties: {
            transition: {
              type: "object",
              required: ["id"],
              properties: {
                id: {
                  type: "string",
                  description:
                    "Transition ID from get_transitions (e.g. '31' for Done)",
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Move an issue to a new status. First call get_transitions to find the right transition ID.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          issueIdOrKey: "ENG-123",
          transition: { id: "31" },
        }),
      },
      {
        name: "add_comment",
        displayName: "Add Comment",
        description: "Add a comment to a Jira issue.",
        method: "POST" as const,
        path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}/comment",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Jira Cloud site ID",
          },
          {
            name: "issueIdOrKey",
            type: "string",
            required: true,
            description: "Issue ID or key",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["body"],
          properties: {
            body: {
              type: "object",
              description:
                "ADF document. Use {type:'doc',version:1,content:[{type:'paragraph',content:[{type:'text',text:'your comment'}]}]}",
            },
          },
        }),
        aiUsageHint:
          "Add a comment to a Jira issue using ADF format for the body.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          issueIdOrKey: "ENG-123",
          body: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Investigated the issue. Root cause is a null pointer in auth middleware. Fix in PR #456.",
                  },
                ],
              },
            ],
          },
        }),
      },
      {
        name: "assign_issue",
        displayName: "Assign Issue",
        description: "Assign a Jira issue to a user by their account ID.",
        method: "PUT" as const,
        path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}/assignee",
        pathParams: JSON.stringify([
          {
            name: "cloudId",
            type: "string",
            required: true,
            description: "Jira Cloud site ID",
          },
          {
            name: "issueIdOrKey",
            type: "string",
            required: true,
            description: "Issue ID or key",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description:
                "User account ID to assign. Pass null to unassign. Use -1 for automatic assignment.",
            },
          },
        }),
        aiUsageHint:
          "Assign or unassign a Jira issue. Use accountId=null to unassign.",
        exampleArgs: JSON.stringify({
          cloudId: "abc123",
          issueIdOrKey: "ENG-123",
          accountId: "5b10a2844c20165700ede21g",
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
      message: "✅ Jira blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Create OAuth 2.0 app at https://developer.atlassian.com/console/myapps/",
        "2. Add callback URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. Set JIRA_CLIENT_ID in Convex environment variables",
        "4. Set OAUTH_SECRET_JIRA in Convex environment variables",
        "5. Run this seed mutation from the Convex dashboard",
        "6. Test by clicking Connect on the Jira card in the Integrations page",
      ],
    };
  },
});
