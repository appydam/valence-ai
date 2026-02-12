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

    // Return assigned tasks and config for the agent
    const tasks = await ctx.runQuery(api.tasks.list, {
      assignee: body.agentName,
    });
    const agentConfig = await ctx.runQuery(api.agentConfigs.getByAgent, {
      agentName: body.agentName,
    });
    return new Response(
      JSON.stringify({ ok: true, ...result, assignedTasks: tasks, config: agentConfig }),
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
    const result = await ctx.runMutation(api.tasks.create, {
      title: body.title,
      description: body.description || "",
      priority: body.priority || "medium",
      assignee: body.assignee,
      creator: body.creator || "Agent",
      tags: body.tags || [],
    });
    return new Response(JSON.stringify({ id: result.taskId, missionId: result.missionId }), {
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

// GET /api/agents/config
http.route({
  path: "/api/agents/config",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const agentName = url.searchParams.get("agentName");
    if (agentName) {
      const config = await ctx.runQuery(api.agentConfigs.getByAgent, {
        agentName: agentName as any,
      });
      return new Response(JSON.stringify(config), {
        status: 200,
        headers: corsHeaders(),
      });
    }
    const all = await ctx.runQuery(api.agentConfigs.list, {});
    return new Response(JSON.stringify(all), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/agents/config
http.route({
  path: "/api/agents/config",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    await ctx.runMutation(api.agentConfigs.update, body);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// GET /api/ssh/config
http.route({
  path: "/api/ssh/config",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const config = await ctx.runQuery(api.sshConfig.get, {});
    return new Response(JSON.stringify(config), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/ssh/config
http.route({
  path: "/api/ssh/config",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    await ctx.runMutation(api.sshConfig.save, body);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// GET /api/ssh/config-full (returns config WITH private key for SSH operations)
http.route({
  path: "/api/ssh/config-full",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const config = await ctx.runQuery(api.sshConfig.getForSSH, {});
    return new Response(JSON.stringify(config), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/ssh/test
http.route({
  path: "/api/ssh/test",
  method: "POST",
  handler: httpAction(async (ctx) => {
    try {
      const config = await ctx.runQuery(api.sshConfig.getForSSH, {});
      if (!config) {
        return new Response(
          JSON.stringify({ ok: false, message: "No SSH config found. Please save your credentials first." }),
          { status: 400, headers: corsHeaders() }
        );
      }

      // Validate config fields
      if (!config.host || !config.username || !config.privateKey) {
        return new Response(
          JSON.stringify({ ok: false, message: "Incomplete SSH configuration. Please fill all fields." }),
          { status: 400, headers: corsHeaders() }
        );
      }

      // For now, just validate that config exists
      // TODO: Implement actual SSH connection test via external service
      return new Response(
        JSON.stringify({
          ok: true,
          message: `SSH config saved for ${config.username}@${config.host}:${config.port}. Connection test coming soon - the one-click restart will validate it.`
        }),
        { status: 200, headers: corsHeaders() }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ ok: false, message: error.message }),
        { status: 500, headers: corsHeaders() }
      );
    }
  }),
});

// POST /api/ssh/restart-openclaw
http.route({
  path: "/api/ssh/restart-openclaw",
  method: "POST",
  handler: httpAction(async (ctx) => {
    try {
      const config = await ctx.runQuery(api.sshConfig.getForSSH, {});
      if (!config) {
        return new Response(
          JSON.stringify({ ok: false, error: "No SSH config found. Configure SSH in Settings first." }),
          { status: 400, headers: corsHeaders() }
        );
      }

      // Generate SSH command for user to run
      const sshCommand = `ssh -i ~/.ssh/key.pem ${config.username}@${config.host} "openclaw gateway restart"`;

      return new Response(
        JSON.stringify({
          ok: false,
          error: `SSH automation requires a separate service. For now, please run this command in your terminal:\n\n${sshCommand}`,
          command: sshCommand
        }),
        { status: 200, headers: corsHeaders() }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: corsHeaders() }
      );
    }
  }),
});

// POST /api/soul/save
http.route({
  path: "/api/soul/save",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    await ctx.runMutation(api.soulFiles.save, {
      agentName: body.agentName,
      content: body.content,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// GET /api/soul
http.route({
  path: "/api/soul",
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
    const soul = await ctx.runQuery(api.soulFiles.get, {
      agentName: agentName as any,
    });
    return new Response(JSON.stringify(soul), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/soul/sync
http.route({
  path: "/api/soul/sync",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    try {
      const config = await ctx.runQuery(api.sshConfig.getForSSH, {});
      if (!config) {
        return new Response(
          JSON.stringify({ ok: false, error: "No SSH config found. Configure SSH in Settings first." }),
          { status: 400, headers: corsHeaders() }
        );
      }

      const soul = await ctx.runQuery(api.soulFiles.get, {
        agentName: body.agentName as any,
      });

      if (!soul) {
        return new Response(
          JSON.stringify({ ok: false, error: "No SOUL file found for this agent" }),
          { status: 404, headers: corsHeaders() }
        );
      }

      // Generate commands for user to run
      const agentId = body.agentName.toLowerCase();
      const soulPath = agentId === "kaze"
        ? "~/.openclaw/workspace/SOUL.md"
        : `~/.openclaw/workspace/agents/${agentId}/SOUL.md`;

      const commands = agentId === "kaze"
        ? `cat > ${soulPath} << 'EOFMARKER'\n${soul.content}\nEOFMARKER`
        : `mkdir -p ~/.openclaw/workspace/agents/${agentId} && cat > ${soulPath} << 'EOFMARKER'\n${soul.content}\nEOFMARKER`;

      const sshCommand = `ssh -i ~/.ssh/key.pem ${config.username}@${config.host} "${commands}"`;

      return new Response(
        JSON.stringify({
          ok: false,
          error: `SSH automation requires a separate service. For now, please run this command in your terminal:\n\n${sshCommand}\n\nOr use the Download button and manually upload the file.`,
          command: sshCommand,
          path: soulPath
        }),
        { status: 200, headers: corsHeaders() }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: corsHeaders() }
      );
    }
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
http.route({ path: "/api/agents/config", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/ssh/config", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/ssh/test", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/ssh/restart-openclaw", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/soul/save", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/soul", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/soul/sync", method: "OPTIONS", handler: optionsHandler() });

export default http;
