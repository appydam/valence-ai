import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

function optionsHandler() {
  return httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders() });
  });
}

// POST /api/heartbeat
http.route({
  path: "/api/heartbeat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const result = await ctx.runMutation(api.heartbeat.beat, {
      agentName: body.agentName,
      status: body.status,
      currentTaskId: body.currentTaskId,
    });

    // Return assigned tasks for the agent
    const tasks = await ctx.runQuery(api.tasks.list, {
      assignee: body.agentName,
    });
    return new Response(
      JSON.stringify({ ok: true, ...result, assignedTasks: tasks }),
      { status: 200, headers: corsHeaders() }
    );
  }),
});

// GET /api/tasks
http.route({
  path: "/api/tasks",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || undefined;
    const assignee = url.searchParams.get("assignee") || undefined;
    const tasks = await ctx.runQuery(api.tasks.list, { status, assignee });
    return new Response(JSON.stringify(tasks), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/tasks
http.route({
  path: "/api/tasks",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const id = await ctx.runMutation(api.tasks.create, {
      title: body.title,
      description: body.description || "",
      priority: body.priority || "medium",
      assignee: body.assignee,
      creator: body.creator || "Agent",
      tags: body.tags || [],
    });
    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/tasks/update
http.route({
  path: "/api/tasks/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.id) {
      return new Response(JSON.stringify({ error: "id is required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const updateArgs: Record<string, any> = {
      id: body.id as Id<"tasks">,
    };
    if (body.title !== undefined) updateArgs.title = body.title;
    if (body.description !== undefined)
      updateArgs.description = body.description;
    if (body.status !== undefined) updateArgs.status = body.status;
    if (body.priority !== undefined) updateArgs.priority = body.priority;
    if (body.assignee !== undefined) updateArgs.assignee = body.assignee;
    if (body.tags !== undefined) updateArgs.tags = body.tags;
    if (body.deliverables !== undefined)
      updateArgs.deliverables = body.deliverables;

    await ctx.runMutation(api.tasks.update, updateArgs as any);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/tasks/claim
http.route({
  path: "/api/tasks/claim",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    await ctx.runMutation(api.tasks.claim, {
      id: body.id as Id<"tasks">,
      agentName: body.agentName,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/tasks/deliverable
http.route({
  path: "/api/tasks/deliverable",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    await ctx.runMutation(api.tasks.addDeliverable, {
      id: body.taskId as Id<"tasks">,
      name: body.name,
      type: body.type,
      content: body.content,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/comments
http.route({
  path: "/api/comments",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const id = await ctx.runMutation(api.comments.create, {
      taskId: body.taskId as Id<"tasks">,
      author: body.author,
      content: body.content,
      mentions: body.mentions || [],
    });
    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: corsHeaders(),
    });
  }),
});

// GET /api/activity
http.route({
  path: "/api/activity",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const agentName = url.searchParams.get("agentName") || undefined;
    const limitStr = url.searchParams.get("limit");
    const activity = await ctx.runQuery(api.activityFns.list, {
      agentName: agentName as any,
      limit: limitStr ? parseInt(limitStr) : undefined,
    });
    return new Response(JSON.stringify(activity), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/activity
http.route({
  path: "/api/activity",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const id = await ctx.runMutation(api.activityFns.log, {
      agentName: body.agentName,
      action: body.action,
      details: body.details,
      taskId: body.taskId,
    });
    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: corsHeaders(),
    });
  }),
});

// GET /api/notifications
http.route({
  path: "/api/notifications",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const agentName = url.searchParams.get("agentName");
    if (!agentName) {
      return new Response(JSON.stringify({ error: "agentName is required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";
    const notifications = await ctx.runQuery(api.notifications.listForAgent, {
      agentName: agentName as any,
      unreadOnly,
    });
    return new Response(JSON.stringify(notifications), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/notifications/read
http.route({
  path: "/api/notifications/read",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.id) {
      return new Response(JSON.stringify({ error: "id is required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    await ctx.runMutation(api.notifications.markRead, {
      id: body.id as Id<"notifications">,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/notifications/read-all
http.route({
  path: "/api/notifications/read-all",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.agentName) {
      return new Response(JSON.stringify({ error: "agentName is required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    await ctx.runMutation(api.notifications.markAllRead, {
      agentName: body.agentName as any,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// GET /api/documents
http.route({
  path: "/api/documents",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const author = url.searchParams.get("author") || undefined;
    const type = url.searchParams.get("type") || undefined;
    const documents = await ctx.runQuery(api.documents.list, { author, type });
    return new Response(JSON.stringify(documents), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/documents
http.route({
  path: "/api/documents",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const id = await ctx.runMutation(api.documents.create, {
      title: body.title,
      content: body.content,
      type: body.type || "other",
      author: body.author,
      tags: body.tags || [],
      taskId: body.taskId ? (body.taskId as Id<"tasks">) : undefined,
    });
    return new Response(JSON.stringify({ id }), {
      status: 201,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/documents/update
http.route({
  path: "/api/documents/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.id) {
      return new Response(JSON.stringify({ error: "id is required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    const updateArgs: Record<string, any> = {
      id: body.id as Id<"documents">,
    };
    if (body.title !== undefined) updateArgs.title = body.title;
    if (body.content !== undefined) updateArgs.content = body.content;
    if (body.type !== undefined) updateArgs.type = body.type;
    if (body.tags !== undefined) updateArgs.tags = body.tags;
    await ctx.runMutation(api.documents.update, updateArgs as any);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/usage
http.route({
  path: "/api/usage",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.agentName || body.totalCost === undefined) {
      return new Response(JSON.stringify({ error: "agentName and totalCost are required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    const id = await ctx.runMutation(api.usage.report, {
      agentName: body.agentName,
      totalCost: body.totalCost,
      totalInputTokens: body.totalInputTokens,
      totalOutputTokens: body.totalOutputTokens,
      modelBreakdowns: body.modelBreakdowns || [],
    });
    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// GET /api/usage
http.route({
  path: "/api/usage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const agentName = url.searchParams.get("agentName");
    if (agentName) {
      const usage = await ctx.runQuery(api.usage.getByAgent, {
        agentName: agentName as any,
      });
      return new Response(JSON.stringify(usage), {
        status: 200,
        headers: corsHeaders(),
      });
    }
    const all = await ctx.runQuery(api.usage.listAll, {});
    return new Response(JSON.stringify(all), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// CORS preflight handlers
http.route({ path: "/api/heartbeat", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/tasks", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/tasks/update", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/tasks/claim", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/tasks/deliverable", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/comments", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/activity", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/notifications", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/notifications/read", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/notifications/read-all", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/documents", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/documents/update", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/usage", method: "OPTIONS", handler: optionsHandler() });

export default http;
