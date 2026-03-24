/**
 * Add create/write tools to the existing Vercel blueprint.
 * Run after seedVercelBlueprint.
 *
 * Usage:
 * npx convex run addVercelTools --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "vercel"))
      .first();

    if (!blueprint) {
      throw new Error("Vercel blueprint not found. Run seedVercelBlueprint first.");
    }

    const now = Date.now();

    const newTools = [
      {
        name: "create_deployment",
        displayName: "Create Deployment",
        description: "Trigger a new deployment from a GitHub repo or file set",
        method: "POST" as const,
        path: "/v13/deployments",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Project name to deploy" },
            gitSource: {
              type: "object",
              description: "GitHub/GitLab/Bitbucket source",
              properties: {
                type: { type: "string", description: "github, gitlab, or bitbucket" },
                repo: { type: "string", description: "Owner/repo format e.g. acme/my-app" },
                ref: { type: "string", description: "Branch, tag, or commit SHA" },
              },
            },
            project: { type: "string", description: "Vercel project ID or name to link this deployment to" },
            target: { type: "string", description: "production or preview (default: preview)" },
            env: {
              type: "object",
              description: "Environment variables to inject for this deployment",
            },
          },
        }),
        aiUsageHint: "Trigger a deployment. For GitHub repos, pass gitSource.type=github, gitSource.repo=owner/repo, gitSource.ref=main. Set target=production for production deploys.",
        exampleArgs: JSON.stringify({
          name: "my-app",
          gitSource: { type: "github", repo: "acme/my-app", ref: "main" },
          target: "production",
        }),
      },
      {
        name: "cancel_deployment",
        displayName: "Cancel Deployment",
        description: "Cancel a deployment that is currently building or queued",
        method: "PATCH" as const,
        path: "/v12/deployments/{id}/cancel",
        pathParams: JSON.stringify([
          { name: "id", type: "string", required: true, description: "Deployment ID (dpl_xxxxx)" },
        ]),
        aiUsageHint: "Cancel a BUILDING or QUEUED deployment. Cannot cancel READY or ERROR deployments.",
        exampleArgs: JSON.stringify({ id: "dpl_abc123" }),
      },
      {
        name: "create_project",
        displayName: "Create Project",
        description: "Create a new Vercel project optionally linked to a GitHub repo",
        method: "POST" as const,
        path: "/v10/projects",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Project name (must be unique in your account)" },
            framework: { type: "string", description: "Framework preset: nextjs, vite, react, vue, svelte, nuxt, etc." },
            gitRepository: {
              type: "object",
              description: "Link to a git repository",
              properties: {
                type: { type: "string", description: "github, gitlab, or bitbucket" },
                repo: { type: "string", description: "Owner/repo format e.g. acme/my-app" },
              },
            },
            buildCommand: { type: "string", description: "Override build command" },
            outputDirectory: { type: "string", description: "Override output directory" },
            installCommand: { type: "string", description: "Override install command" },
            rootDirectory: { type: "string", description: "Root directory of the project within the repo" },
          },
        }),
        aiUsageHint: "Create a new project. Link to GitHub by passing gitRepository.type=github and gitRepository.repo=owner/repo.",
        exampleArgs: JSON.stringify({
          name: "my-new-app",
          framework: "nextjs",
          gitRepository: { type: "github", repo: "acme/my-new-app" },
        }),
      },
      {
        name: "add_env_var",
        displayName: "Add Environment Variable",
        description: "Add an environment variable to a project",
        method: "POST" as const,
        path: "/v10/projects/{idOrName}/env",
        pathParams: JSON.stringify([
          { name: "idOrName", type: "string", required: true, description: "Project ID or name" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["key", "value", "type", "target"],
          properties: {
            key: { type: "string", description: "Variable name e.g. DATABASE_URL" },
            value: { type: "string", description: "Variable value" },
            type: { type: "string", description: "plain, secret, or encrypted" },
            target: {
              type: "array",
              items: { type: "string" },
              description: "Environments: production, preview, development",
            },
          },
        }),
        aiUsageHint: "Add an env var to a project. Set type=encrypted for secrets. target=['production','preview'] for all environments.",
        exampleArgs: JSON.stringify({
          idOrName: "my-app",
          key: "DATABASE_URL",
          value: "postgresql://...",
          type: "encrypted",
          target: ["production", "preview"],
        }),
      },
      {
        name: "add_domain",
        displayName: "Add Domain",
        description: "Add a custom domain to a project",
        method: "POST" as const,
        path: "/v10/projects/{idOrName}/domains",
        pathParams: JSON.stringify([
          { name: "idOrName", type: "string", required: true, description: "Project ID or name" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Domain name e.g. example.com or sub.example.com" },
            gitBranch: { type: "string", description: "Map this domain to a specific git branch (for preview branches)" },
          },
        }),
        aiUsageHint: "Add a custom domain to a project. After adding, configure DNS with the returned records.",
        exampleArgs: JSON.stringify({ idOrName: "my-app", name: "www.example.com" }),
      },
      {
        name: "get_deployment",
        displayName: "Get Deployment",
        description: "Get full details of a specific deployment including build logs URL and status",
        method: "GET" as const,
        path: "/v13/deployments/{idOrUrl}",
        pathParams: JSON.stringify([
          { name: "idOrUrl", type: "string", required: true, description: "Deployment ID (dpl_xxx) or URL" },
        ]),
        aiUsageHint: "Get deployment details. Check .readyState for status: BUILDING, READY, ERROR, CANCELED.",
        exampleArgs: JSON.stringify({ idOrUrl: "dpl_abc123" }),
      },
      {
        name: "delete_project",
        displayName: "Delete Project",
        description: "Permanently delete a project and all its deployments",
        method: "DELETE" as const,
        path: "/v9/projects/{idOrName}",
        pathParams: JSON.stringify([
          { name: "idOrName", type: "string", required: true, description: "Project ID or name to delete" },
        ]),
        aiUsageHint: "Permanently delete a project. This cannot be undone. All deployments and domains will be removed.",
        exampleArgs: JSON.stringify({ idOrName: "my-old-app" }),
      },
    ];

    const toolIds = [];
    for (const tool of newTools) {
      // Check if tool already exists
      const existingTool = await ctx.db
        .query("blueprintTools")
        .withIndex("by_blueprint_name", (q) =>
          q.eq("blueprintId", blueprint._id).eq("name", tool.name)
        )
        .first();

      if (!existingTool) {
        const toolId = await ctx.db.insert("blueprintTools", {
          ...tool,
          blueprintId: blueprint._id,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
        toolIds.push(toolId);
      }
    }

    return {
      message: `Added ${toolIds.length} new tools to Vercel blueprint`,
      toolsAdded: toolIds.length,
    };
  },
});
