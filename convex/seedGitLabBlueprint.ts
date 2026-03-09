/**
 * Seed GitLab integration blueprint
 * Run this once to create the GitLab blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedGitLabBlueprint -> Run
 *
 * Prerequisites:
 * - Create an OAuth app at https://gitlab.com/-/profile/applications
 * - Set OAUTH_SECRET_GITLAB env var in Convex dashboard
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "gitlab"))
      .first();

    if (existing) {
      return {
        message: "GitLab blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "gitlab",
      name: "GitLab",
      description:
        "DevOps platform. Manage projects, issues, merge requests, pipelines, and files. Full Git repository access with CI/CD integration.",
      category: "developer_tools",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_GITLAB",
        authorizeUrl: "https://gitlab.com/oauth/authorize",
        tokenUrl: "https://gitlab.com/oauth/token",
        scopes: ["api", "read_user", "read_repository", "write_repository"],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://gitlab.com/api/v4",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://docs.gitlab.com/ee/api/rest/",
      iconUrl: "https://cdn.simpleicons.org/gitlab/FC6D26",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_projects",
        displayName: "List Projects",
        description: "List GitLab projects accessible to the authenticated user.",
        method: "GET" as const,
        path: "/projects",
        queryParams: JSON.stringify([
          { name: "owned", type: "boolean", description: "Only return projects owned by current user" },
          { name: "membership", type: "boolean", description: "Only return projects user is a member of" },
          { name: "search", type: "string", description: "Search by project name" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 20 },
          { name: "order_by", type: "string", description: "Order by id, name, created_at, updated_at, last_activity_at" },
        ]),
        aiUsageHint: "List GitLab projects. Use membership=true for projects you belong to. Search by name with the search param.",
        exampleArgs: JSON.stringify({ membership: true, per_page: 20 }),
      },
      {
        name: "get_project",
        displayName: "Get Project",
        description: "Get details of a specific GitLab project by ID or namespace/path.",
        method: "GET" as const,
        path: "/projects/{id}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Project ID or URL-encoded namespace/path (e.g. 'group%2Fproject')" },
        ]),
        aiUsageHint: "Get a GitLab project by ID or path. Use URL-encoded path like 'namespace%2Frepo' to reference by name.",
        exampleArgs: JSON.stringify({ id: "12345" }),
      },
      {
        name: "list_issues",
        displayName: "List Issues",
        description: "List issues in a GitLab project. Filter by state, labels, assignee, and more.",
        method: "GET" as const,
        path: "/projects/{id}/issues",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Project ID or path" },
        ]),
        queryParams: JSON.stringify([
          { name: "state", type: "string", description: "opened, closed, or all", default: "opened" },
          { name: "labels", type: "string", description: "Comma-separated label names" },
          { name: "assignee_username", type: "string", description: "Filter by assignee username" },
          { name: "search", type: "string", description: "Search in title and description" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 20 },
          { name: "order_by", type: "string", description: "created_at, updated_at, priority" },
        ]),
        aiUsageHint: "List GitLab issues for a project. Filter by state='opened' for open issues. Search by keyword.",
        exampleArgs: JSON.stringify({ id: "12345", state: "opened", per_page: 20 }),
      },
      {
        name: "create_issue",
        displayName: "Create Issue",
        description: "Create a new issue in a GitLab project.",
        method: "POST" as const,
        path: "/projects/{id}/issues",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Project ID or path" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", description: "Issue title" },
            description: { type: "string", description: "Issue description (Markdown supported)" },
            labels: { type: "string", description: "Comma-separated label names" },
            assignee_ids: { type: "array", items: { type: "number" }, description: "User IDs to assign" },
            milestone_id: { type: "number", description: "Milestone ID" },
            due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
          },
        }),
        aiUsageHint: "Create a GitLab issue. Provide title and optionally description, labels, and assignees.",
        exampleArgs: JSON.stringify({
          id: "12345",
          title: "Fix login bug on mobile",
          description: "Users report cannot login on iOS 17+",
          labels: "bug,mobile",
        }),
      },
      {
        name: "update_issue",
        displayName: "Update Issue",
        description: "Update an existing GitLab issue — change title, state, labels, assignee, etc.",
        method: "PUT" as const,
        path: "/projects/{id}/issues/{issue_iid}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Project ID or path" },
          { name: "issue_iid", type: "number", required: true, description: "Issue internal ID (not global ID)" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            state_event: { type: "string", enum: ["close", "reopen"], description: "close or reopen the issue" },
            labels: { type: "string", description: "Comma-separated label names (replaces all labels)" },
            assignee_ids: { type: "array", items: { type: "number" } },
          },
        }),
        aiUsageHint: "Update a GitLab issue. Use state_event='close' to close it. Provide issue_iid (the #123 number shown in UI).",
        exampleArgs: JSON.stringify({ id: "12345", issue_iid: 42, state_event: "close" }),
      },
      {
        name: "list_merge_requests",
        displayName: "List Merge Requests",
        description: "List merge requests in a GitLab project.",
        method: "GET" as const,
        path: "/projects/{id}/merge_requests",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Project ID or path" },
        ]),
        queryParams: JSON.stringify([
          { name: "state", type: "string", description: "opened, closed, locked, merged, or all", default: "opened" },
          { name: "source_branch", type: "string", description: "Filter by source branch" },
          { name: "target_branch", type: "string", description: "Filter by target branch" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 20 },
        ]),
        aiUsageHint: "List GitLab merge requests. Filter by state='opened' for open MRs, state='merged' for merged ones.",
        exampleArgs: JSON.stringify({ id: "12345", state: "opened" }),
      },
      {
        name: "create_merge_request",
        displayName: "Create Merge Request",
        description: "Create a new merge request in a GitLab project.",
        method: "POST" as const,
        path: "/projects/{id}/merge_requests",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Project ID or path" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["source_branch", "target_branch", "title"],
          properties: {
            source_branch: { type: "string", description: "Branch to merge from" },
            target_branch: { type: "string", description: "Branch to merge into (usually 'main' or 'master')" },
            title: { type: "string", description: "MR title" },
            description: { type: "string", description: "MR description" },
            assignee_id: { type: "number", description: "User ID to assign" },
            remove_source_branch: { type: "boolean", description: "Delete source branch after merge", default: true },
          },
        }),
        aiUsageHint: "Create a GitLab merge request. Specify source_branch (your feature branch) and target_branch (main/master).",
        exampleArgs: JSON.stringify({ id: "12345", source_branch: "feature/login-fix", target_branch: "main", title: "Fix mobile login bug" }),
      },
      {
        name: "list_pipelines",
        displayName: "List Pipelines",
        description: "List CI/CD pipelines for a GitLab project.",
        method: "GET" as const,
        path: "/projects/{id}/pipelines",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Project ID or path" },
        ]),
        queryParams: JSON.stringify([
          { name: "status", type: "string", description: "created, waiting_for_resource, preparing, pending, running, success, failed, canceled, skipped, manual, scheduled" },
          { name: "ref", type: "string", description: "Branch or tag name" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 20 },
        ]),
        aiUsageHint: "List GitLab CI/CD pipelines. Filter by status='failed' to see failing pipelines or status='running' for in-progress.",
        exampleArgs: JSON.stringify({ id: "12345", status: "running" }),
      },
      {
        name: "get_file",
        displayName: "Get File Content",
        description: "Get the contents of a file from a GitLab repository.",
        method: "GET" as const,
        path: "/projects/{id}/repository/files/{file_path}",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Project ID or path" },
          { name: "file_path", type: "string", required: true, description: "URL-encoded file path (e.g. src%2Fmain.ts)" },
        ]),
        queryParams: JSON.stringify([
          { name: "ref", type: "string", description: "Branch, tag, or commit SHA", default: "main" },
        ]),
        aiUsageHint: "Get file contents from a GitLab repo. URL-encode the file path (replace / with %2F). Returns base64-encoded content.",
        exampleArgs: JSON.stringify({ id: "12345", file_path: "src%2Fmain.ts", ref: "main" }),
      },
      {
        name: "list_commits",
        displayName: "List Commits",
        description: "List commits in a GitLab project's repository.",
        method: "GET" as const,
        path: "/projects/{id}/repository/commits",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Project ID or path" },
        ]),
        queryParams: JSON.stringify([
          { name: "ref_name", type: "string", description: "Branch, tag, or commit SHA", default: "main" },
          { name: "since", type: "string", description: "ISO 8601 date — only commits after this date" },
          { name: "until", type: "string", description: "ISO 8601 date — only commits before this date" },
          { name: "path", type: "string", description: "Filter commits touching this file path" },
          { name: "page", type: "number", default: 1 },
          { name: "per_page", type: "number", default: 20 },
        ]),
        aiUsageHint: "List commits in a GitLab repo. Filter by branch with ref_name, or by date range with since/until.",
        exampleArgs: JSON.stringify({ id: "12345", ref_name: "main", per_page: 10 }),
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
      message: "✅ GitLab blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth app at https://gitlab.com/-/profile/applications",
        "2. Set redirect URI to your Convex OAuth callback URL",
        "3. Set OAUTH_SECRET_GITLAB in Convex environment variables",
      ],
    };
  },
});
