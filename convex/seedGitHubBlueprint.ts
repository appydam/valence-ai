/**
 * Seed GitHub integration blueprint
 * Run this once to create the GitHub blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedGitHubBlueprint -> Run
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    // Check if GitHub blueprint already exists
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "github"))
      .first();

    if (existing) {
      return {
        message: "GitHub blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    // Create GitHub OAuth blueprint
    const authConfig = {
      clientId: process.env.GITHUB_CLIENT_ID || "YOUR_GITHUB_CLIENT_ID",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "YOUR_GITHUB_CLIENT_SECRET",
      authorizeUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      scopes: ["repo", "user", "read:org"],
      extraAuthParams: {
        // GitHub expects JSON responses with Accept header
      },
    };

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "github",
      name: "GitHub",
      description: "GitHub repository management, issues, pull requests, and workflows. Create issues, review PRs, manage projects.",
      category: "developer_tools",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify(authConfig),
      baseUrl: "https://api.github.com",
      defaultHeaders: JSON.stringify({
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      }),
      sourceType: "manual",
      sourceUrl: "https://docs.github.com/en/rest",
      iconUrl: "https://github.githubassets.com/favicons/favicon.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    // Create some common GitHub tools
    const tools = [
      {
        name: "create_issue",
        displayName: "Create Issue",
        description: "Create a new issue in a repository. Requires repo scope.",
        method: "POST" as const,
        path: "/repos/{owner}/{repo}/issues",
        pathParams: JSON.stringify([
          { name: "owner", type: "string", required: true, description: "Repository owner (username or org)" },
          { name: "repo", type: "string", required: true, description: "Repository name" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", description: "Issue title" },
            body: { type: "string", description: "Issue description (supports markdown)" },
            labels: { type: "array", items: { type: "string" }, description: "Labels to add" },
            assignees: { type: "array", items: { type: "string" }, description: "Usernames to assign" },
          },
        }),
        aiUsageHint: "Use this to create GitHub issues. Always include a clear title and detailed body. Example: owner=facebook, repo=react",
        exampleArgs: JSON.stringify({
          owner: "facebook",
          repo: "react",
          title: "Bug: Component not rendering",
          body: "## Description\n\nDetailed bug description here...",
          labels: ["bug"],
        }),
      },
      {
        name: "list_pull_requests",
        displayName: "List Pull Requests",
        description: "List pull requests in a repository",
        method: "GET" as const,
        path: "/repos/{owner}/{repo}/pulls",
        pathParams: JSON.stringify([
          { name: "owner", type: "string", required: true },
          { name: "repo", type: "string", required: true },
        ]),
        queryParams: JSON.stringify([
          { name: "state", type: "string", description: "open, closed, or all", default: "open" },
          { name: "per_page", type: "number", description: "Results per page (max 100)", default: 30 },
        ]),
        aiUsageHint: "Use this to list PRs. Filter by state (open/closed/all).",
        exampleArgs: JSON.stringify({ owner: "facebook", repo: "react", state: "open" }),
      },
      {
        name: "create_pull_request",
        displayName: "Create Pull Request",
        description: "Create a new pull request",
        method: "POST" as const,
        path: "/repos/{owner}/{repo}/pulls",
        pathParams: JSON.stringify([
          { name: "owner", type: "string", required: true },
          { name: "repo", type: "string", required: true },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["title", "head", "base"],
          properties: {
            title: { type: "string", description: "PR title" },
            body: { type: "string", description: "PR description" },
            head: { type: "string", description: "Branch name to merge from" },
            base: { type: "string", description: "Branch name to merge into" },
            draft: { type: "boolean", description: "Create as draft PR" },
          },
        }),
        aiUsageHint: "Create a pull request from one branch to another. head=feature-branch, base=main",
        exampleArgs: JSON.stringify({
          owner: "facebook",
          repo: "react",
          title: "Add new feature",
          body: "## Changes\n\n- Added X\n- Fixed Y",
          head: "feature-branch",
          base: "main",
        }),
      },
      {
        name: "list_repos",
        displayName: "List Repositories",
        description: "List repositories for the authenticated user",
        method: "GET" as const,
        path: "/user/repos",
        queryParams: JSON.stringify([
          { name: "visibility", type: "string", description: "all, public, or private", default: "all" },
          { name: "sort", type: "string", description: "created, updated, pushed, full_name", default: "updated" },
          { name: "per_page", type: "number", default: 30 },
        ]),
        aiUsageHint: "List repos for the authenticated user. Sorted by most recently updated by default.",
        exampleArgs: JSON.stringify({ sort: "updated", per_page: 50 }),
      },
      {
        name: "get_repo",
        displayName: "Get Repository",
        description: "Get details about a specific repository",
        method: "GET" as const,
        path: "/repos/{owner}/{repo}",
        pathParams: JSON.stringify([
          { name: "owner", type: "string", required: true },
          { name: "repo", type: "string", required: true },
        ]),
        aiUsageHint: "Get repository information including stars, forks, description, etc.",
        exampleArgs: JSON.stringify({ owner: "facebook", repo: "react" }),
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
      message: "✅ GitHub blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Set GITHUB_CLIENT_ID in Convex environment variables",
        "2. Set GITHUB_CLIENT_SECRET in Convex environment variables",
        "3. Set INTEGRATION_MASTER_KEY for token encryption",
        "4. Register OAuth app at: https://github.com/settings/developers",
        "5. Set callback URL to: https://beloved-squirrel-599.convex.site/api/integrations/oauth/callback",
      ],
    };
  },
});
