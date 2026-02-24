/**
 * Seed Bitbucket integration blueprint
 * Run this once to create the Bitbucket blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedBitbucketBlueprint -> Run
 *
 * Prerequisites:
 * - Bitbucket uses its OWN OAuth system (separate from Jira/Confluence).
 * - Create an OAuth consumer in your Bitbucket workspace:
 *   https://bitbucket.org/{your-workspace}/workspace/settings/api
 *   - Name: Mission Control
 *   - Callback URL: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback
 *   - Permissions: Account:Read, Repositories:Read, Pull requests:Read+Write, Issues:Read+Write
 * - Then set in Convex env vars:
 *   - BITBUCKET_CLIENT_ID = OAuth consumer Key
 *   - OAUTH_SECRET_BITBUCKET = OAuth consumer Secret
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "bitbucket"))
      .first();

    if (existing) {
      return {
        message: "Bitbucket blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "bitbucket",
      name: "Bitbucket",
      description:
        "Atlassian Bitbucket for Git repository hosting. Browse repositories, manage pull requests, and track issues.",
      category: "developer_tools",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: process.env.BITBUCKET_CLIENT_ID || "YOUR_BITBUCKET_CLIENT_ID",
        clientSecret: "OAUTH_SECRET_BITBUCKET",
        authorizeUrl: "https://bitbucket.org/site/oauth2/authorize",
        tokenUrl: "https://bitbucket.org/site/oauth2/access_token",
        scopes: [
          "account",
          "repository",
          "pullrequest",
          "issue",
          "issue:write",
          "pullrequest:write",
        ],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://api.bitbucket.org",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developer.atlassian.com/cloud/bitbucket/rest/intro/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/bitbucket-icon.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_repositories",
        displayName: "List Repositories",
        description:
          "List all repositories in a Bitbucket workspace that the user has access to.",
        method: "GET" as const,
        path: "/2.0/repositories/{workspace}",
        pathParams: JSON.stringify([
          {
            name: "workspace",
            type: "string",
            required: true,
            description:
              "Bitbucket workspace slug (found in your Bitbucket URL, e.g. mycompany)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "pagelen",
            type: "number",
            default: 25,
            description: "Number of results per page (max 100)",
          },
          {
            name: "q",
            type: "string",
            description: "Filter query (e.g. name~\"api\" for repos containing 'api')",
          },
          {
            name: "sort",
            type: "string",
            description: "Sort field: name, -updated_on, -created_on",
            default: "-updated_on",
          },
        ]),
        aiUsageHint:
          "List repositories in a Bitbucket workspace. The workspace slug is found in your Bitbucket URL (bitbucket.org/{workspace}/...).",
        exampleArgs: JSON.stringify({
          workspace: "mycompany",
          pagelen: 25,
          sort: "-updated_on",
        }),
      },
      {
        name: "get_repository",
        displayName: "Get Repository",
        description:
          "Get details about a specific Bitbucket repository including description, language, and size.",
        method: "GET" as const,
        path: "/2.0/repositories/{workspace}/{repo_slug}",
        pathParams: JSON.stringify([
          {
            name: "workspace",
            type: "string",
            required: true,
            description: "Bitbucket workspace slug",
          },
          {
            name: "repo_slug",
            type: "string",
            required: true,
            description: "Repository slug (URL-friendly name)",
          },
        ]),
        aiUsageHint:
          "Get details about a specific Bitbucket repository.",
        exampleArgs: JSON.stringify({
          workspace: "mycompany",
          repo_slug: "backend-api",
        }),
      },
      {
        name: "list_pull_requests",
        displayName: "List Pull Requests",
        description:
          "List pull requests in a Bitbucket repository. Filter by state (OPEN, MERGED, DECLINED).",
        method: "GET" as const,
        path: "/2.0/repositories/{workspace}/{repo_slug}/pullrequests",
        pathParams: JSON.stringify([
          {
            name: "workspace",
            type: "string",
            required: true,
            description: "Bitbucket workspace slug",
          },
          {
            name: "repo_slug",
            type: "string",
            required: true,
            description: "Repository slug",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "state",
            type: "string",
            description: "Filter by state: OPEN, MERGED, DECLINED, SUPERSEDED",
            default: "OPEN",
          },
          {
            name: "pagelen",
            type: "number",
            default: 25,
            description: "Number of results per page",
          },
          {
            name: "q",
            type: "string",
            description: "Filter expression (e.g. title~\"fix\")",
          },
        ]),
        aiUsageHint:
          "List pull requests in a repository. Filter by state=OPEN (default), MERGED, or DECLINED.",
        exampleArgs: JSON.stringify({
          workspace: "mycompany",
          repo_slug: "backend-api",
          state: "OPEN",
          pagelen: 25,
        }),
      },
      {
        name: "create_pull_request",
        displayName: "Create Pull Request",
        description:
          "Create a new pull request in a Bitbucket repository from one branch to another.",
        method: "POST" as const,
        path: "/2.0/repositories/{workspace}/{repo_slug}/pullrequests",
        pathParams: JSON.stringify([
          {
            name: "workspace",
            type: "string",
            required: true,
            description: "Bitbucket workspace slug",
          },
          {
            name: "repo_slug",
            type: "string",
            required: true,
            description: "Repository slug",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["title", "source"],
          properties: {
            title: { type: "string", description: "Pull request title" },
            description: {
              type: "string",
              description: "Pull request description (supports markdown)",
            },
            source: {
              type: "object",
              required: ["branch"],
              properties: {
                branch: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: {
                      type: "string",
                      description: "Source branch name to merge from",
                    },
                  },
                },
              },
            },
            destination: {
              type: "object",
              properties: {
                branch: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Target branch to merge into (defaults to main)",
                    },
                  },
                },
              },
            },
            reviewers: {
              type: "array",
              items: {
                type: "object",
                properties: { uuid: { type: "string" } },
              },
              description: "List of reviewer account UUIDs",
            },
            close_source_branch: {
              type: "boolean",
              description: "Delete source branch after merge",
            },
          },
        }),
        aiUsageHint:
          "Create a pull request. Specify source.branch.name (branch to merge from) and optionally destination.branch.name (defaults to main/master).",
        exampleArgs: JSON.stringify({
          workspace: "mycompany",
          repo_slug: "backend-api",
          title: "Add rate limiting middleware",
          description: "## Summary\n\nAdds per-user rate limiting to all API endpoints.",
          source: { branch: { name: "feature/rate-limiting" } },
          destination: { branch: { name: "main" } },
          close_source_branch: true,
        }),
      },
      {
        name: "list_issues",
        displayName: "List Issues",
        description:
          "List issues in a Bitbucket repository. Filter by status, priority, or assignee.",
        method: "GET" as const,
        path: "/2.0/repositories/{workspace}/{repo_slug}/issues",
        pathParams: JSON.stringify([
          {
            name: "workspace",
            type: "string",
            required: true,
            description: "Bitbucket workspace slug",
          },
          {
            name: "repo_slug",
            type: "string",
            required: true,
            description: "Repository slug",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "pagelen",
            type: "number",
            default: 25,
            description: "Number of results per page",
          },
          {
            name: "q",
            type: "string",
            description:
              "Filter query. Examples: status=\"open\", priority=\"major\", assignee.uuid=\"{uuid}\"",
          },
          {
            name: "sort",
            type: "string",
            description: "Sort field: -updated_on, priority, status",
            default: "-updated_on",
          },
        ]),
        aiUsageHint:
          "List issues in a Bitbucket repository. Use q parameter to filter: status=\"open\", priority=\"major\", etc.",
        exampleArgs: JSON.stringify({
          workspace: "mycompany",
          repo_slug: "backend-api",
          q: "status=\"open\" AND priority=\"major\"",
          pagelen: 25,
        }),
      },
      {
        name: "create_issue",
        displayName: "Create Issue",
        description:
          "Create a new issue in a Bitbucket repository. Supports bug, enhancement, proposal, and task types.",
        method: "POST" as const,
        path: "/2.0/repositories/{workspace}/{repo_slug}/issues",
        pathParams: JSON.stringify([
          {
            name: "workspace",
            type: "string",
            required: true,
            description: "Bitbucket workspace slug",
          },
          {
            name: "repo_slug",
            type: "string",
            required: true,
            description: "Repository slug",
          },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", description: "Issue title" },
            content: {
              type: "object",
              properties: {
                raw: {
                  type: "string",
                  description: "Issue description in markdown",
                },
              },
            },
            kind: {
              type: "string",
              description: "Issue type: bug, enhancement, proposal, task",
              default: "bug",
            },
            priority: {
              type: "string",
              description: "Priority: trivial, minor, major, critical, blocker",
              default: "major",
            },
            assignee: {
              type: "object",
              properties: {
                uuid: {
                  type: "string",
                  description: "Assignee account UUID",
                },
              },
            },
          },
        }),
        aiUsageHint:
          "Create a Bitbucket issue. kind can be: bug, enhancement, proposal, task. priority: trivial, minor, major, critical, blocker.",
        exampleArgs: JSON.stringify({
          workspace: "mycompany",
          repo_slug: "backend-api",
          title: "Fix memory leak in connection pool",
          content: {
            raw: "## Description\n\nMemory usage grows unboundedly after 24h uptime.\n\n## Steps to Reproduce\n\n1. Deploy service\n2. Wait 24 hours\n3. Observe memory usage",
          },
          kind: "bug",
          priority: "critical",
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
      message: "✅ Bitbucket blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Go to https://bitbucket.org/{your-workspace}/workspace/settings/api",
        "2. Click 'Add consumer', set callback URL to https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
        "3. Enable permissions: Account:Read, Repositories:Read, Pull requests:Read+Write, Issues:Read+Write",
        "4. Copy the Key and Secret",
        "5. Run: npx convex env set BITBUCKET_CLIENT_ID <Key>",
        "6. Run: npx convex env set OAUTH_SECRET_BITBUCKET <Secret>",
        "7. Re-run this seed mutation (or delete the existing blueprint and re-run)",
        "8. Test by clicking Connect on the Bitbucket card in the Integrations page",
      ],
    };
  },
});
