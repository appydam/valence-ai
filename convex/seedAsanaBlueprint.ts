/**
 * Seed Asana integration blueprint
 * Run this once to create the Asana blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedAsanaBlueprint -> Run
 *
 * Prerequisites:
 * - Create an OAuth app at https://app.asana.com/0/my-apps
 * - Set OAUTH_SECRET_ASANA env var in Convex dashboard
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "asana"))
      .first();

    if (existing) {
      return {
        message: "Asana blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "asana",
      name: "Asana",
      description:
        "Project management platform. Manage workspaces, projects, tasks, sections, and team members. Create tasks, update status, assign work, and track project progress.",
      category: "project_management",
      version: 1,
      status: "active",
      authType: "oauth2",
      authConfig: JSON.stringify({
        clientId: "",
        clientSecret: "OAUTH_SECRET_ASANA",
        authorizeUrl: "https://app.asana.com/-/oauth_authorize",
        tokenUrl: "https://app.asana.com/-/oauth_token",
        scopes: ["default"],
        scopeSeparator: "space",
        tokenEndpointAuth: "body",
      }),
      baseUrl: "https://app.asana.com/api/1.0",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl: "https://developers.asana.com/docs/overview",
      iconUrl: "https://cdn.simpleicons.org/asana/F06A6A",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_workspaces",
        displayName: "List Workspaces",
        description: "List all Asana workspaces the authenticated user belongs to.",
        method: "GET" as const,
        path: "/workspaces",
        queryParams: JSON.stringify([
          { name: "opt_fields", type: "string", description: "Comma-separated fields to include", default: "gid,name,is_organization" },
          { name: "limit", type: "number", default: 50 },
        ]),
        aiUsageHint: "List Asana workspaces. Call this first to get workspace GIDs needed for other operations.",
        exampleArgs: JSON.stringify({}),
      },
      {
        name: "list_projects",
        displayName: "List Projects",
        description: "List projects in an Asana workspace or team.",
        method: "GET" as const,
        path: "/projects",
        queryParams: JSON.stringify([
          { name: "workspace", type: "string", description: "Workspace GID" },
          { name: "team", type: "string", description: "Team GID (optional)" },
          { name: "archived", type: "boolean", description: "Include archived projects", default: false },
          { name: "opt_fields", type: "string", default: "gid,name,status,created_at,due_date,owner" },
          { name: "limit", type: "number", default: 25 },
          { name: "offset", type: "string", description: "Pagination token" },
        ]),
        aiUsageHint: "List Asana projects in a workspace. Provide workspace GID. Filter archived=false to get active projects only.",
        exampleArgs: JSON.stringify({ workspace: "WORKSPACE_GID", archived: false }),
      },
      {
        name: "get_project",
        displayName: "Get Project",
        description: "Get details of a specific Asana project.",
        method: "GET" as const,
        path: "/projects/{project_gid}",
        pathParams: JSON.stringify([
          { name: "project_gid", type: "string", required: true, description: "Project GID" },
        ]),
        queryParams: JSON.stringify([
          { name: "opt_fields", type: "string", default: "gid,name,status,notes,due_date,owner,members,created_at" },
        ]),
        aiUsageHint: "Get details of an Asana project including status, owner, and metadata.",
        exampleArgs: JSON.stringify({ project_gid: "PROJECT_GID" }),
      },
      {
        name: "create_project",
        displayName: "Create Project",
        description: "Create a new project in Asana.",
        method: "POST" as const,
        path: "/projects",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["name", "workspace"],
              properties: {
                name: { type: "string", description: "Project name" },
                workspace: { type: "string", description: "Workspace GID" },
                notes: { type: "string", description: "Project description" },
                color: { type: "string", description: "Project color: light-pink, dark-pink, red, etc." },
                due_date: { type: "string", description: "Due date in YYYY-MM-DD format" },
                privacy_setting: { type: "string", enum: ["public_to_workspace", "private"], default: "public_to_workspace" },
              },
            },
          },
        }),
        aiUsageHint: "Create an Asana project. Provide name and workspace GID. Optionally set color and due date.",
        exampleArgs: JSON.stringify({ data: { name: "Q2 Marketing Campaign", workspace: "WORKSPACE_GID", color: "light-blue" } }),
      },
      {
        name: "list_tasks",
        displayName: "List Tasks",
        description: "List tasks in an Asana project or assigned to a user.",
        method: "GET" as const,
        path: "/tasks",
        queryParams: JSON.stringify([
          { name: "project", type: "string", description: "Project GID to list tasks from" },
          { name: "assignee", type: "string", description: "Assignee GID or 'me'" },
          { name: "workspace", type: "string", description: "Workspace GID (required if using assignee)" },
          { name: "completed_since", type: "string", description: "Only include tasks completed after this ISO date" },
          { name: "opt_fields", type: "string", default: "gid,name,assignee,due_date,completed,notes,tags" },
          { name: "limit", type: "number", default: 25 },
          { name: "offset", type: "string" },
        ]),
        aiUsageHint: "List Asana tasks. Use project GID to list project tasks. Use assignee='me' with workspace GID to list your tasks.",
        exampleArgs: JSON.stringify({ project: "PROJECT_GID", limit: 25 }),
      },
      {
        name: "get_task",
        displayName: "Get Task",
        description: "Get details of a specific Asana task.",
        method: "GET" as const,
        path: "/tasks/{task_gid}",
        pathParams: JSON.stringify([
          { name: "task_gid", type: "string", required: true, description: "Task GID" },
        ]),
        queryParams: JSON.stringify([
          { name: "opt_fields", type: "string", default: "gid,name,assignee,due_date,completed,notes,projects,tags,subtasks" },
        ]),
        aiUsageHint: "Get details of an Asana task including description, assignee, due date, and completion status.",
        exampleArgs: JSON.stringify({ task_gid: "TASK_GID" }),
      },
      {
        name: "create_task",
        displayName: "Create Task",
        description: "Create a new task in Asana.",
        method: "POST" as const,
        path: "/tasks",
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", description: "Task name" },
                notes: { type: "string", description: "Task description" },
                projects: { type: "array", items: { type: "string" }, description: "Project GIDs to add task to" },
                assignee: { type: "string", description: "Assignee GID or 'me'" },
                due_on: { type: "string", description: "Due date YYYY-MM-DD" },
                workspace: { type: "string", description: "Workspace GID (required if no project)" },
              },
            },
          },
        }),
        aiUsageHint: "Create an Asana task. Provide name and either projects array or workspace GID. Optionally assign and set due date.",
        exampleArgs: JSON.stringify({ data: { name: "Write Q2 blog post", projects: ["PROJECT_GID"], assignee: "me", due_on: "2026-04-15" } }),
      },
      {
        name: "update_task",
        displayName: "Update Task",
        description: "Update an Asana task — change name, notes, assignee, due date, or mark complete.",
        method: "PUT" as const,
        path: "/tasks/{task_gid}",
        pathParams: JSON.stringify([
          { name: "task_gid", type: "string", required: true, description: "Task GID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              properties: {
                name: { type: "string" },
                notes: { type: "string" },
                assignee: { type: "string", description: "GID or null to unassign" },
                due_on: { type: "string", description: "YYYY-MM-DD or null to clear" },
                completed: { type: "boolean", description: "true to mark complete" },
              },
            },
          },
        }),
        aiUsageHint: "Update an Asana task. Use completed=true to mark it done. Change assignee or due_on as needed.",
        exampleArgs: JSON.stringify({ task_gid: "TASK_GID", data: { completed: true } }),
      },
      {
        name: "list_sections",
        displayName: "List Sections",
        description: "List sections (columns) within an Asana project.",
        method: "GET" as const,
        path: "/projects/{project_gid}/sections",
        pathParams: JSON.stringify([
          { name: "project_gid", type: "string", required: true, description: "Project GID" },
        ]),
        aiUsageHint: "List Asana project sections (like Kanban columns). Use section GIDs to move tasks between columns.",
        exampleArgs: JSON.stringify({ project_gid: "PROJECT_GID" }),
      },
      {
        name: "add_task_to_section",
        displayName: "Move Task to Section",
        description: "Move a task to a specific section within an Asana project (useful for Kanban-style boards).",
        method: "POST" as const,
        path: "/sections/{section_gid}/addTask",
        pathParams: JSON.stringify([
          { name: "section_gid", type: "string", required: true, description: "Section GID" },
        ]),
        bodySchema: JSON.stringify({
          type: "object",
          required: ["data"],
          properties: {
            data: {
              type: "object",
              required: ["task"],
              properties: {
                task: { type: "string", description: "Task GID to move" },
              },
            },
          },
        }),
        aiUsageHint: "Move a task to a different section/column in an Asana board. Use list_sections first to get section GIDs.",
        exampleArgs: JSON.stringify({ section_gid: "SECTION_GID", data: { task: "TASK_GID" } }),
      },
      {
        name: "list_users",
        displayName: "List Workspace Users",
        description: "List all users in an Asana workspace.",
        method: "GET" as const,
        path: "/workspaces/{workspace_gid}/users",
        pathParams: JSON.stringify([
          { name: "workspace_gid", type: "string", required: true, description: "Workspace GID" },
        ]),
        queryParams: JSON.stringify([
          { name: "opt_fields", type: "string", default: "gid,name,email" },
        ]),
        aiUsageHint: "List users in an Asana workspace. Use to find user GIDs for task assignment.",
        exampleArgs: JSON.stringify({ workspace_gid: "WORKSPACE_GID" }),
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
      message: "✅ Asana blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      nextSteps: [
        "1. Create OAuth app at https://app.asana.com/0/my-apps",
        "2. Set redirect URI to your Convex OAuth callback URL",
        "3. Set OAUTH_SECRET_ASANA in Convex environment variables",
      ],
    };
  },
});
