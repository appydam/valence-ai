import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { filterToolsByAgentRole } from "./lib/agentToolRecommendations";

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

    // Return only active tasks (assigned/in_progress/in_review) — not done/cancelled
    const tasks = await ctx.runQuery(api.tasks.listActive, {
      assignee: body.agentName,
    });

    // Enrich tasks with dependency context — capped to prevent N+1 explosion
    let enrichedCount = 0;
    const tasksWithContext = await Promise.all(
      tasks.map(async (task: any) => {
        if (enrichedCount >= 2) return task; // Max 2 tasks get dependency enrichment
        if (task.dependsOn && task.dependsOn.length > 0) {
          enrichedCount++;
          // Cap at 3 dependencies per task
          const depsToEnrich = task.dependsOn.slice(0, 3);
          const depContext = await Promise.all(
            depsToEnrich.map(async (depId: any) => {
              const dep = await ctx.runQuery(api.tasks.getById, { id: depId });
              if (!dep) return null;
              // Truncate deliverable content in dependency context
              const truncatedDeliverables = dep.deliverables?.slice(0, 2).map((d: any) => ({
                name: d.name,
                type: d.type,
                content: d.content?.length > 500 ? d.content.slice(0, 500) + "..." : d.content,
              }));
              return { title: dep.title, status: dep.status, deliverables: truncatedDeliverables };
            })
          );
          return { ...task, dependencyContext: depContext.filter(Boolean) };
        }
        return task;
      })
    );

    // ── Mission Context: inject lightweight view of ALL tasks in each mission ──
    // Gives agents situational awareness of what the whole squad is working on,
    // not just their own queue. Excludes done/cancelled to keep it actionable.
    let missionContext: {
      missionId: string;
      missionTitle: string;
      taskCount: number;
      tasks: {
        id: string;
        title: string;
        status: string;
        assignee: string | null;
        priority: string;
        tags: string[];
      }[];
    }[] = [];
    try {
      // Collect unique missionIds from this agent's active tasks
      const missionIds = [
        ...new Set(
          tasks
            .map((t: any) => t.missionId)
            .filter(Boolean)
        ),
      ] as string[];

      if (missionIds.length > 0) {
        const missionResults = await Promise.all(
          missionIds.map(async (missionId) => {
            const [mission, allMissionTasks] = await Promise.all([
              ctx.runQuery(api.missions.getById, { missionId: missionId as any }),
              ctx.runQuery(api.tasks.listByMission, { missionId: missionId as any }),
            ]);
            if (!mission) return null;

            // Exclude done/cancelled — keep only actionable tasks
            const activeTasks = (allMissionTasks ?? [])
              .filter((t: any) => t.status !== "done" && t.status !== "cancelled")
              // Sort: in_progress first, then in_review, assigned, inbox
              .sort((a: any, b: any) => {
                const order: Record<string, number> = { in_progress: 0, in_review: 1, assigned: 2, inbox: 3 };
                return (order[a.status] ?? 9) - (order[b.status] ?? 9);
              })
              .slice(0, 50) // cap at 50 tasks per mission
              .map((t: any) => ({
                id: t._id,
                title: t.title,
                status: t.status,
                assignee: t.assignee ?? null,
                priority: t.priority,
                tags: t.tags ?? [],
              }));

            return {
              missionId,
              missionTitle: mission.title,
              taskCount: allMissionTasks.length,
              tasks: activeTasks,
            };
          })
        );
        missionContext = missionResults.filter(Boolean) as typeof missionContext;
      }
    } catch (missionErr: any) {
      console.error("[Heartbeat] Mission context fetch failed:", missionErr.message);
      // Non-fatal — heartbeat still succeeds without mission context
    }

    const agentConfig = await ctx.runQuery(api.agentConfigs.getByAgent, {
      agentName: body.agentName,
    });

    // Only discover integration tools if explicitly requested (lazy loading)
    let availableTools = undefined;
    if (body.userId && body.includeTools) {
      try {
        const toolsResult = await ctx.runAction(internal.executionEngine.listAvailableTools, {
          userId: body.userId,
        });

        // Cap heavy integrations (Stripe, Salesforce, SAP, etc.) to top 20 most useful tools
        const HEAVY_BLUEPRINT_CAP = 20;
        const HEAVY_BLUEPRINT_WHITELIST: Record<string, string[]> = {
          "stripe-api": [
            "GetBalance", "GetCustomers", "GetCustomersCustomer", "PostCustomers", "PostCustomersCustomer",
            "GetCharges", "GetChargesCharge", "PostCharges",
            "GetPaymentIntents", "GetPaymentIntentsIntent", "PostPaymentIntents", "PostPaymentIntentsIntentConfirm",
            "GetInvoices", "GetInvoicesInvoice", "PostInvoices", "PostInvoicesInvoiceSend",
            "GetRefunds", "PostRefunds",
            "GetSubscriptions", "GetSubscriptionsSubscriptionExposedId", "PostSubscriptions",
            "GetProducts", "GetProductsId", "PostProducts",
            "GetPrices", "GetPricesPrice", "PostPrices",
            "PostCheckoutSessions", "GetCheckoutSessionsSession",
            "GetPayouts", "GetPayoutsPayout",
          ],
        };
        const filteredTools = toolsResult.tools.filter((tool: any) => {
          const slug = tool.blueprintSlug;
          if (HEAVY_BLUEPRINT_WHITELIST[slug]) {
            return HEAVY_BLUEPRINT_WHITELIST[slug].includes(tool.toolName);
          }
          return true;
        });

        const { recommended, other } = filterToolsByAgentRole(filteredTools, body.agentName);

        availableTools = {
          userId: body.userId,
          count: filteredTools.length,
          tools: filteredTools,
          recommended: recommended,
          other: other,
        };
      } catch (error: any) {
        console.error("[Heartbeat] Tool discovery failed:", error.message);
        availableTools = {
          userId: body.userId,
          count: 0,
          tools: [],
          recommended: [],
          other: [],
          error: error.message,
        };
      }
    }

    // ── Memory System: inject working context + episodic memories ──
    let workingContext: {
      recentHandoff: {
        summary: string;
        openQuestions?: string;
        nextSessionHint?: string;
        completedTaskTitles: string[];
        memoriesCreated: number;
        sessionEnd: number;
      } | null;
      recentActivity: { action: string; details: string; timestamp: number }[];
      recentTaskSummary: { title: string; completedAt: number; deliverableCount: number }[];
    } = { recentHandoff: null, recentActivity: [], recentTaskSummary: [] };
    let memories: {
      id: string;
      memoryType: string;
      title: string;
      body: string;
      importance: number;
      humanEndorsed: boolean;
      tags: string[];
      createdAt: number;
    }[] = [];

    try {
      // Fetch last handoff, recent activity, and top memories in parallel
      const [handoffs, recentActivityRaw, completedTasks, agentMemories] = await Promise.all([
        ctx.runQuery(api.sessionHandoffs.listForAgent, {
          agentName: body.agentName,
          limit: 1,
        }),
        ctx.runQuery(api.activityFns.list, { limit: 10 }),
        ctx.runQuery(api.tasks.list, { assignee: body.agentName, status: "done" }),
        ctx.runQuery(api.agentMemory.listForAgent, {
          agentName: body.agentName,
          includeSquadWide: true,
          limit: 10,
        }),
      ]);

      // Build recentHandoff
      if (handoffs.length > 0) {
        const h = handoffs[0];
        workingContext.recentHandoff = {
          summary: h.sessionSummary,
          openQuestions: h.openQuestions,
          nextSessionHint: h.nextSessionHint,
          completedTaskTitles: h.taskTitles,
          memoriesCreated: h.newMemoriesCreated.length,
          sessionEnd: h.sessionEnd,
        };
      }

      // Build recentActivity (last 10 entries formatted)
      workingContext.recentActivity = (recentActivityRaw ?? []).slice(0, 10).map((a: any) => ({
        action: a.action,
        details: a.details || "",
        timestamp: a._creationTime,
      }));

      // Build recentTaskSummary (last 5 completed tasks for this agent)
      const myCompletedTasks = (completedTasks ?? [])
        .filter((t: any) => t.assignee === body.agentName)
        .sort((a: any, b: any) => b._creationTime - a._creationTime)
        .slice(0, 5);
      workingContext.recentTaskSummary = myCompletedTasks.map((t: any) => ({
        title: t.title,
        completedAt: t._creationTime,
        deliverableCount: t.deliverables?.length ?? 0,
      }));

      // Shape memories for the heartbeat response
      memories = agentMemories.map((m: any) => ({
        id: m._id,
        memoryType: m.memoryType,
        title: m.title,
        body: m.body,
        importance: m.importanceScore,
        humanEndorsed: m.humanEndorsed,
        tags: m.tags,
        createdAt: m.createdAt,
      }));

      // Async: increment use counts for memories we're surfacing (fire-and-forget)
      if (agentMemories.length > 0) {
        ctx.scheduler.runAfter(0, internal.agentMemory.incrementUseCount, {
          ids: agentMemories.map((m: any) => m._id),
        });
      }
    } catch (memErr: any) {
      console.error("[Heartbeat] Memory injection failed:", memErr.message);
      // Non-fatal — heartbeat still succeeds without memories
    }

    // ── Notifications: inject unread mention count so agents don't have to poll ──
    let unreadNotifications: { count: number; latestMention: { content: string; author: string; taskId: string; taskTitle: string } | null } = {
      count: 0,
      latestMention: null,
    };
    try {
      const notifs = await ctx.runQuery(api.notifications.listForAgent, {
        agentName: body.agentName,
        unreadOnly: true,
        limit: 5,
      });
      unreadNotifications.count = notifs.length;
      if (notifs.length > 0) {
        const latest = notifs[0];
        unreadNotifications.latestMention = {
          content: latest.contentPreview,
          author: latest.fromAuthor,
          taskId: latest.taskId as string,
          taskTitle: latest.taskTitle,
        };
      }
    } catch (notifErr: any) {
      // Non-fatal — heartbeat still succeeds without notification data
    }

    // ── Session Budget: tell agents how many turns they have left ──
    const sessionBudget = {
      maxTurns: agentConfig?.sessionMaxTurns ?? 25,
      recommendedWrapUpAt: (agentConfig?.sessionMaxTurns ?? 25) - 3,
      note: "Reserve last 3 turns for POST /api/tasks/complete and POST /api/agents/handoff",
    };

    return new Response(
      JSON.stringify({
        ok: true,
        ...result,
        assignedTasks: tasksWithContext,
        missionContext,
        config: agentConfig,
        availableTools,
        workingContext,
        memories,
        unreadNotifications,
        sessionBudget,
      }),
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
      ...(body.missionId ? { missionId: body.missionId as Id<"missions"> } : {}),
      ...(body.dependsOn ? { dependsOn: body.dependsOn } : {}),
      ...(body.requiredIntegrations ? { requiredIntegrations: body.requiredIntegrations } : {}),
      ...(body.requiredUserId ? { requiredUserId: body.requiredUserId } : {}),
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
    if (body.missionId !== undefined)
      updateArgs.missionId = body.missionId as Id<"missions">;

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

// POST /api/tasks/delegate
http.route({
  path: "/api/tasks/delegate",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.parentTaskId || !body.subtasks || !body.delegatedBy) {
      return new Response(
        JSON.stringify({ error: "parentTaskId, subtasks, and delegatedBy are required" }),
        { status: 400, headers: corsHeaders() }
      );
    }
    try {
      const result = await ctx.runMutation(api.tasks.delegateTask, {
        parentTaskId: body.parentTaskId as Id<"tasks">,
        subtasks: body.subtasks,
        delegatedBy: body.delegatedBy,
        userId: body.userId,
      });
      return new Response(JSON.stringify(result), {
        status: 201,
        headers: corsHeaders(),
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error.message || "Delegation failed" }),
        { status: 400, headers: corsHeaders() }
      );
    }
  }),
});

// POST /api/tasks/complete — Batch complete a task in one call
http.route({
  path: "/api/tasks/complete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.taskId || !body.agentName) {
      return new Response(
        JSON.stringify({ error: "taskId and agentName are required" }),
        { status: 400, headers: corsHeaders() }
      );
    }
    try {
      const result = await ctx.runMutation(api.tasks.completeTask, {
        taskId: body.taskId as Id<"tasks">,
        agentName: body.agentName,
        deliverables: body.deliverables,
        comment: body.comment,
        mentions: body.mentions,
        activityDetails: body.activityDetails,
        status: body.status,
      });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: corsHeaders(),
      });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error.message || "Task completion failed" }),
        { status: 400, headers: corsHeaders() }
      );
    }
  }),
});

// POST /api/tasks/reject — Send a task back to in_progress with specific feedback
http.route({
  path: "/api/tasks/reject",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.taskId || !body.reviewerName || !body.reason) {
      return new Response(
        JSON.stringify({ error: "taskId, reviewerName, and reason are required" }),
        { status: 400, headers: corsHeaders() }
      );
    }
    try {
      const result = await ctx.runMutation(api.tasks.rejectTask, {
        taskId: body.taskId as Id<"tasks">,
        reviewerName: body.reviewerName,
        reason: body.reason,
      });
      return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error.message || "Task rejection failed" }),
        { status: 400, headers: corsHeaders() }
      );
    }
  }),
});

http.route({
  path: "/api/tasks/reject",
  method: "OPTIONS",
  handler: optionsHandler(),
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

// ── Memory System ─────────────────────────────────────────────

// POST /api/agents/memory — agents write a new memory
http.route({
  path: "/api/agents/memory",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const required = ["agentName", "memoryType", "title", "body", "tags", "importanceScore"];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return new Response(JSON.stringify({ error: `${field} is required` }), {
          status: 400,
          headers: corsHeaders(),
        });
      }
    }
    const id = await ctx.runMutation(api.agentMemory.write, {
      agentName: body.agentName,
      memoryType: body.memoryType,
      title: body.title,
      body: body.body,
      evidence: body.evidence,
      tags: body.tags,
      taskId: body.taskId,
      importanceScore: body.importanceScore,
      isSquadWide: body.isSquadWide,
      expiresAt: body.expiresAt,
    });
    return new Response(JSON.stringify({ ok: true, id }), {
      status: 201,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/agents/memory/confirm — agent confirms a memory is still true
http.route({
  path: "/api/agents/memory/confirm",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { id, agentName } = await request.json();
    if (!id || !agentName) {
      return new Response(JSON.stringify({ error: "id and agentName required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    await ctx.runMutation(api.agentMemory.confirm, { id, agentName });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/agents/memory/contradict — agent contradicts a memory, optionally with correction
http.route({
  path: "/api/agents/memory/contradict",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.id || !body.agentName) {
      return new Response(JSON.stringify({ error: "id and agentName required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    const result = await ctx.runMutation(api.agentMemory.contradict, {
      id: body.id,
      agentName: body.agentName,
      newBody: body.newBody,
    });
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/agents/handoff — agent writes end-of-session handoff note
http.route({
  path: "/api/agents/handoff",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.agentName || !body.sessionSummary) {
      return new Response(JSON.stringify({ error: "agentName and sessionSummary required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    const id = await ctx.runMutation(api.sessionHandoffs.write, {
      agentName: body.agentName,
      sessionSummary: body.sessionSummary,
      tasksCompleted: body.tasksCompleted || [],
      taskTitles: body.taskTitles || [],
      newMemoriesCreated: body.newMemoriesCreated || [],
      openQuestions: body.openQuestions,
      nextSessionHint: body.nextSessionHint,
      sessionStart: body.sessionStart || Date.now(),
      sessionEnd: body.sessionEnd || Date.now(),
    });
    return new Response(JSON.stringify({ ok: true, id }), {
      status: 201,
      headers: corsHeaders(),
    });
  }),
});

// ── SOUL Distillation ─────────────────────────────────────────

// POST /api/soul/distill — manually trigger distillation for an agent
http.route({
  path: "/api/soul/distill",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.agentName) {
      return new Response(JSON.stringify({ error: "agentName is required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
    const result = await ctx.runAction(internal.soulDistillation.distillAgent, {
      agentName: body.agentName,
      triggeredBy: body.triggeredBy || "manual",
    });
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 500,
      headers: corsHeaders(),
    });
  }),
});

http.route({ path: "/api/soul/distill", method: "OPTIONS", handler: optionsHandler() });

// POST /api/soul/review — human approve/reject a soul version
http.route({
  path: "/api/soul/review",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body.id || !body.decision || !body.reviewedBy) {
      return new Response(
        JSON.stringify({ error: "id, decision, and reviewedBy are required" }),
        { status: 400, headers: corsHeaders() }
      );
    }
    const result = await ctx.runMutation(api.soulDistillation.reviewVersion, {
      id: body.id,
      decision: body.decision,
      reviewedBy: body.reviewedBy,
      reviewNote: body.reviewNote,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

http.route({ path: "/api/soul/review", method: "OPTIONS", handler: optionsHandler() });

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

// ============================================================
// UNIVERSAL INTEGRATION ENGINE ENDPOINTS
// ============================================================

// POST /api/integrations/tools - List available tools for user
http.route({
  path: "/api/integrations/tools",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { userId } = await request.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const result = await ctx.runAction(api.executionEngine.listAvailableTools, { userId });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/integrations/execute - Execute a tool (real API call)
http.route({
  path: "/api/integrations/execute",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { userId, agentName, blueprintSlug, toolName, toolArgs } = await request.json();
    if (!userId || !blueprintSlug || !toolName) {
      return new Response(JSON.stringify({ error: "userId, blueprintSlug, and toolName required" }), {
        status: 400, headers: corsHeaders(),
      });
    }

    try {
      const result = await ctx.runAction(api.executionEngine.executeTool, {
        userId, agentName, blueprintSlug, toolName, toolArgs,
      });
      return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
    } catch (error: any) {
      console.error("[HTTP /api/integrations/execute] Error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message || "Tool execution failed",
        details: error.stack?.split('\n')[0] || ""
      }), { status: 200, headers: corsHeaders() });
    }
  }),
});

// GET /api/integrations/activity - Get execution activity log
http.route({
  path: "/api/integrations/activity",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const limit = url.searchParams.get("limit");
    const result = await ctx.runQuery(api.integrationActivity.list, {
      userId: userId || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/integrations/oauth/start - Start OAuth flow
http.route({
  path: "/api/integrations/oauth/start",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { blueprintSlug, userId } = await request.json();
    if (!blueprintSlug || !userId) {
      return new Response(JSON.stringify({ error: "blueprintSlug and userId required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const result = await ctx.runAction(api.connectionActions.startOAuth, { blueprintSlug, userId });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// GET /api/integrations/oauth/callback - OAuth redirect handler
http.route({
  path: "/api/integrations/oauth/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    console.log("[OAuth Callback] Received callback with params:", { code: code?.substring(0, 10), state: state?.substring(0, 10), error });

    if (error || !code || !state) {
      console.log("[OAuth Callback] Missing params or error, sending error message");
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Error</title></head>
        <body>
          <h3>OAuth Error</h3>
          <p>Error: ${error || 'Missing required parameters (code or state)'}</p>
          <script>
            var errMsg = "${error || 'missing_params'}";
            try { localStorage.setItem("oauth_result", JSON.stringify({ type: "oauth_error", error: errMsg, ts: Date.now() })); } catch(e) {}
            if (window.opener) {
              try { window.opener.postMessage({ type: "oauth_error", error: errMsg }, "*"); } catch(e) {}
            }
            setTimeout(function() { window.close(); }, 1000);
          </script>
        </body>
        </html>
      `, {
        status: 400,
        headers: { "Content-Type": "text/html" }
      });
    }

    try {
      console.log("[OAuth Callback] Calling handleOAuthCallback action...");
      await ctx.runAction(api.connectionActions.handleOAuthCallback, { code, state });
      console.log("[OAuth Callback] Success! Sending success message");

      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Success</title></head>
        <body>
          <h3>✅ Authorization Successful!</h3>
          <p>This window will close automatically...</p>
          <script>
            // Write to localStorage as a fallback for when window.opener is null
            // (happens when OAuth provider redirects through its own pages, breaking opener ref)
            try { localStorage.setItem("oauth_result", JSON.stringify({ type: "oauth_success", ts: Date.now() })); } catch(e) {}
            if (window.opener) {
              try { window.opener.postMessage({ type: "oauth_success" }, "*"); } catch(e) {}
            }
            setTimeout(function() { window.close(); }, 500);
          </script>
        </body>
        </html>
      `, {
        status: 200,
        headers: { "Content-Type": "text/html" }
      });
    } catch (e: any) {
      console.error("[OAuth Callback] Error:", e.message);
      const safeError = encodeURIComponent(e.message || "Unknown error");

      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Failed</title></head>
        <body>
          <h3>OAuth Failed</h3>
          <p id="err"></p>
          <script>
            var errorMsg = decodeURIComponent("${safeError}");
            document.getElementById("err").textContent = errorMsg;
            try { localStorage.setItem("oauth_result", JSON.stringify({ type: "oauth_error", error: errorMsg, ts: Date.now() })); } catch(e) {}
            if (window.opener) {
              try { window.opener.postMessage({ type: "oauth_error", error: errorMsg }, "*"); } catch(e) {}
            }
            setTimeout(function() { window.close(); }, 2000);
          </script>
        </body>
        </html>
      `, {
        status: 500,
        headers: { "Content-Type": "text/html" }
      });
    }
  }),
});

// POST /api/integrations/connect-key - Connect via API key
http.route({
  path: "/api/integrations/connect-key",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { blueprintSlug, userId, apiKey } = await request.json();
    if (!blueprintSlug || !userId || !apiKey) {
      return new Response(JSON.stringify({ error: "blueprintSlug, userId, and apiKey required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    try {
      const result = await ctx.runAction(api.connectionActions.connectApiKey, { blueprintSlug, userId, apiKey });
      return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
    } catch (e: any) {
      return new Response(
        JSON.stringify({ success: false, error: e.message || "Connection failed" }),
        { status: 200, headers: corsHeaders() }
      );
    }
  }),
});

// GET /api/integrations/connections - List user's connections
http.route({
  path: "/api/integrations/connections",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const result = await ctx.runQuery(api.connections.listByUser, { userId });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/integrations/disconnect - Disconnect a connection
http.route({
  path: "/api/integrations/disconnect",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { blueprintId, userId } = await request.json();
    if (!blueprintId || !userId) {
      return new Response(JSON.stringify({ error: "blueprintId and userId required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const result = await ctx.runMutation(api.connections.disconnect, { blueprintId, userId });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// GET /api/integrations/blueprints - List blueprints
http.route({
  path: "/api/integrations/blueprints",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const result = await ctx.runQuery(api.blueprints.list, {
      category: category || undefined,
      status: status || undefined,
    });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/integrations/blueprints - Create blueprint
http.route({
  path: "/api/integrations/blueprints",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const result = await ctx.runMutation(api.blueprints.create, body);
    return new Response(JSON.stringify({ id: result }), { status: 201, headers: corsHeaders() });
  }),
});

// POST /api/integrations/blueprints/update - Update blueprint
http.route({
  path: "/api/integrations/blueprints/update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const result = await ctx.runMutation(api.blueprints.update, body);
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/integrations/blueprints/archive - Archive blueprint
http.route({
  path: "/api/integrations/blueprints/archive",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { id } = await request.json();
    const result = await ctx.runMutation(api.blueprints.archive, { id });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/integrations/scrape - Start doc scrape job
http.route({
  path: "/api/integrations/scrape",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { url, createdBy, suggestedName, suggestedCategory } = await request.json();
    if (!url || !createdBy) {
      return new Response(JSON.stringify({ error: "url and createdBy required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    try {
      const result = await ctx.runAction(api.docScraper.startScrape, {
        url, createdBy, suggestedName, suggestedCategory,
      });
      return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
    } catch (e: any) {
      const errorMsg = (e.message || "Scraping failed")
        .replace(/^Uncaught Error:\s*/, "")
        .split("\n")[0];
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: 200, headers: corsHeaders() }
      );
    }
  }),
});

// GET /api/integrations/scrape/status - Poll scrape job status
http.route({
  path: "/api/integrations/scrape/status",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");
    if (!jobId) {
      return new Response(JSON.stringify({ error: "jobId required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const result = await ctx.runQuery(api.docScraper.getJob, { id: jobId as Id<"scraperJobs"> });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/integrations/tools/create - Create a blueprint tool
http.route({
  path: "/api/integrations/tools/create",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const result = await ctx.runMutation(api.blueprintTools.create, body);
    return new Response(JSON.stringify({ id: result }), { status: 201, headers: corsHeaders() });
  }),
});

// POST /api/integrations/tools/bulk - Bulk create blueprint tools
http.route({
  path: "/api/integrations/tools/bulk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const result = await ctx.runMutation(api.blueprintTools.bulkCreate, body);
    return new Response(JSON.stringify(result), { status: 201, headers: corsHeaders() });
  }),
});

// GET /api/integrations/blueprint-tools - List tools for a blueprint
http.route({
  path: "/api/integrations/blueprint-tools",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const blueprintId = url.searchParams.get("blueprintId");
    if (!blueprintId) {
      return new Response(JSON.stringify({ error: "blueprintId required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const result = await ctx.runQuery(api.blueprintTools.listByBlueprint, {
      blueprintId: blueprintId as Id<"blueprints">
    });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// ============================================================
// FIGMA PLUGIN COMMAND QUEUE
// ============================================================

// POST /api/figma-plugin/push — Agent pushes a design spec
http.route({
  path: "/api/figma-plugin/push",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { createdBy, fileKey, label, spec } = body;
    if (!createdBy || !fileKey || !label || !spec) {
      return new Response(
        JSON.stringify({ error: "createdBy, fileKey, label, spec required" }),
        { status: 400, headers: corsHeaders() }
      );
    }
    const result = await ctx.runMutation(api.figmaPlugin.push, { createdBy, fileKey, label, spec });
    return new Response(JSON.stringify(result), { status: 201, headers: corsHeaders() });
  }),
});

http.route({ path: "/api/figma-plugin/push", method: "OPTIONS", handler: optionsHandler() });

// POST /api/figma-plugin/replace — Agent pushes a refined design spec to replace an existing frame
http.route({
  path: "/api/figma-plugin/replace",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { createdBy, fileKey, label, spec, replaceFrameName } = body;
    if (!createdBy || !fileKey || !label || !spec || !replaceFrameName) {
      return new Response(JSON.stringify({ error: "createdBy, fileKey, label, spec, and replaceFrameName are required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const result = await ctx.runMutation(api.figmaPlugin.pushReplace, { createdBy, fileKey, label, spec, replaceFrameName });
    return new Response(JSON.stringify(result), { status: 201, headers: corsHeaders() });
  }),
});

http.route({ path: "/api/figma-plugin/replace", method: "OPTIONS", handler: optionsHandler() });

// GET /api/figma-plugin/poll?fileKey=xxx — Plugin polls for next pending command
http.route({
  path: "/api/figma-plugin/poll",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const fileKey = url.searchParams.get("fileKey");
    if (!fileKey) {
      return new Response(JSON.stringify({ error: "fileKey required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const cmd = await ctx.runQuery(api.figmaPlugin.poll, { fileKey });
    return new Response(JSON.stringify({ command: cmd }), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/figma-plugin/ack — Plugin acknowledges it started executing
http.route({
  path: "/api/figma-plugin/ack",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { id } = await request.json();
    if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: corsHeaders() });
    const result = await ctx.runMutation(api.figmaPlugin.ack, { id });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

http.route({ path: "/api/figma-plugin/ack", method: "OPTIONS", handler: optionsHandler() });

// POST /api/figma-plugin/complete — Plugin reports result
http.route({
  path: "/api/figma-plugin/complete",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { id, success, resultNodeIds, resultError } = await request.json();
      if (!id || success === undefined) {
        return new Response(JSON.stringify({ error: "id and success required" }), { status: 400, headers: corsHeaders() });
      }
      const result = await ctx.runMutation(api.figmaPlugin.complete, { id, success, resultNodeIds: resultNodeIds || [], resultError: resultError || undefined });
      return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 200, headers: corsHeaders() });
    }
  }),
});

http.route({ path: "/api/figma-plugin/complete", method: "OPTIONS", handler: optionsHandler() });

// GET /api/figma-plugin/status?id=xxx — Agent checks if design is done
http.route({
  path: "/api/figma-plugin/status",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: corsHeaders() });
    const cmd = await ctx.runQuery(api.figmaPlugin.get, { id: id as any });
    return new Response(JSON.stringify(cmd), { status: 200, headers: corsHeaders() });
  }),
});

// ============================================================
// WEBHOOK RECEIVERS
// ============================================================

// POST /api/webhooks/slack - Receive Slack events
http.route({
  path: "/api/webhooks/slack",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const result = await ctx.runMutation(api.webhooks.handleSlack, body);

    // Return challenge for URL verification
    if (body.challenge) {
      return new Response(JSON.stringify({ challenge: body.challenge }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/webhooks/github - Receive GitHub events
http.route({
  path: "/api/webhooks/github",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const event = request.headers.get("X-GitHub-Event") || "unknown";

    const result = await ctx.runMutation(api.webhooks.handleGitHub, {
      event,
      action: body.action,
      repository: body.repository,
      sender: body.sender,
      pullRequest: body.pull_request,
      issue: body.issue,
      reviewRequest: body.requested_reviewer,
    });

    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/webhooks/linear - Receive Linear events
http.route({
  path: "/api/webhooks/linear",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    const result = await ctx.runMutation(api.webhooks.handleLinear, {
      action: body.action,
      type: body.type,
      data: body.data,
      webhookId: body.webhookId,
    });

    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// GET /api/webhooks/tasks - List tasks created by webhooks
http.route({
  path: "/api/webhooks/tasks",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const source = url.searchParams.get("source") || undefined;
    const limit = url.searchParams.get("limit");

    const result = await ctx.runQuery(api.webhooks.listWebhookTasks, {
      source,
      limit: limit ? parseInt(limit) : undefined,
    });

    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// ============================================================
// EMAIL FINDER ENDPOINTS (Free Email Discovery)
// ============================================================

// POST /api/email-finder/single - Find email for one person
http.route({
  path: "/api/email-finder/single",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { firstName, lastName, companyDomain, knownPattern } = await request.json();
    if (!firstName || !lastName || !companyDomain) {
      return new Response(JSON.stringify({ error: "firstName, lastName, and companyDomain required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const result = await ctx.runAction(api.emailFinder.findSingleEmail, {
      firstName, lastName, companyDomain, knownPattern,
    });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// POST /api/email-finder/batch - Find emails for multiple people at same company
http.route({
  path: "/api/email-finder/batch",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { people, companyDomain } = await request.json();
    if (!people || !Array.isArray(people) || !companyDomain) {
      return new Response(JSON.stringify({ error: "people (array) and companyDomain required" }), {
        status: 400, headers: corsHeaders(),
      });
    }
    const result = await ctx.runAction(api.emailFinder.findBatchEmails, {
      people, companyDomain,
    });
    return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders() });
  }),
});

// ============================================================
// WEBHOOK SYSTEM ENDPOINTS
// ============================================================

// Generic webhook receiver: POST /webhooks/{blueprintSlug}/{userId}/{endpointName}
http.route({
  pathPrefix: "/webhooks/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);

    // Expected: webhooks/{blueprintSlug}/{userId}/{endpointName}
    if (pathParts.length < 4) {
      return new Response(JSON.stringify({ error: "Invalid webhook URL format" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const [_, blueprintSlug, userId, endpointName] = pathParts;
    const urlPath = `/webhooks/${blueprintSlug}/${userId}/${endpointName}`;

    // Get request headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Get raw body for signature verification
    const rawBody = await request.text();
    let eventData;

    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    // Determine event type (varies by provider)
    const eventType =
      headers["x-github-event"] || // GitHub
      headers["x-event-key"] || // Bitbucket
      headers["x-gitlab-event"] || // GitLab
      eventData.type || // Generic
      eventData.event || // Generic
      eventData.action || // Generic
      "webhook.received";

    // Process webhook
    const result = await ctx.runAction(api.webhookReceiverActions.receive, {
      urlPath,
      eventType,
      eventData: JSON.stringify(eventData),
      headers: JSON.stringify(headers),
      rawBody,
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.statusCode || 400,
        headers: corsHeaders(),
      });
    }

    return new Response(JSON.stringify({
      success: true,
      eventId: result.eventId,
      taskId: result.taskId,
      processed: result.processed,
    }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/webhooks/endpoints - Create webhook endpoint
http.route({
  path: "/api/webhooks/endpoints",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const endpointId = await ctx.runMutation(api.webhookEndpoints.create, body);
    return new Response(JSON.stringify({ id: endpointId }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// GET /api/webhooks/endpoints - List webhook endpoints
http.route({
  path: "/api/webhooks/endpoints",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const blueprintId = url.searchParams.get("blueprintId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const endpoints = await ctx.runQuery(api.webhookEndpoints.list, {
      userId,
      blueprintId: blueprintId as any,
    });

    return new Response(JSON.stringify(endpoints), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/webhooks/rules - Create automation rule
http.route({
  path: "/api/webhooks/rules",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const ruleId = await ctx.runMutation(api.automationRules.create, body);
    return new Response(JSON.stringify({ id: ruleId }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// GET /api/webhooks/events - List webhook events
http.route({
  path: "/api/webhooks/events",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const endpointId = url.searchParams.get("endpointId");
    const status = url.searchParams.get("status");
    const limit = url.searchParams.get("limit");

    const events = await ctx.runQuery(api.webhookReceiver.listEvents, {
      userId: userId || undefined,
      endpointId: endpointId as any,
      status: status as any,
      limit: limit ? parseInt(limit) : undefined,
    });

    return new Response(JSON.stringify(events), {
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
http.route({ path: "/api/tasks/delegate", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/tasks/complete", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/comments", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/activity", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/notifications", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/notifications/read", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/notifications/read-all", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/usage", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/agents/config", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/ssh/config", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/ssh/test", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/ssh/restart-openclaw", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/soul/save", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/soul", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/soul/sync", method: "OPTIONS", handler: optionsHandler() });
// Integration Engine CORS handlers
http.route({ path: "/api/integrations/tools", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/execute", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/activity", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/oauth/start", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/connect-key", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/connections", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/disconnect", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/blueprints", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/blueprints/update", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/blueprints/archive", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/scrape", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/scrape/status", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/tools/create", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/tools/bulk", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/integrations/blueprint-tools", method: "OPTIONS", handler: optionsHandler() });
// Webhook CORS handlers
http.route({ path: "/api/webhooks/slack", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/webhooks/github", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/webhooks/linear", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/webhooks/tasks", method: "OPTIONS", handler: optionsHandler() });
// Email Finder CORS handlers
http.route({ path: "/api/email-finder/single", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/email-finder/batch", method: "OPTIONS", handler: optionsHandler() });
// Memory System CORS handlers
http.route({ path: "/api/agents/memory", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/agents/memory/confirm", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/agents/memory/contradict", method: "OPTIONS", handler: optionsHandler() });
http.route({ path: "/api/agents/handoff", method: "OPTIONS", handler: optionsHandler() });

// POST /api/agents/wake - Wake up agents with pending tasks
http.route({
  path: "/api/agents/wake",
  method: "POST",
  handler: httpAction(async (ctx) => {
    const AGENT_WAKEUP_URL = process.env.AGENT_WAKEUP_SERVER_URL;

    if (!AGENT_WAKEUP_URL) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "AGENT_WAKEUP_SERVER_URL not configured in Convex environment variables",
          hint: "Add the Railway URL for your agent-wakeup-server (e.g., https://your-service.up.railway.app)",
        }),
        { status: 500, headers: corsHeaders() }
      );
    }

    // Get all agents
    const agents = await ctx.runQuery(api.agents.list, {});

    // Check which agents have tasks
    const agentsWithTasks = [];
    for (const agent of agents) {
      const tasks = await ctx.runQuery(api.tasks.list, { assignee: agent.name });
      const pendingTasks = tasks.filter((t: any) => t.status === "assigned" || t.status === "in_progress");

      if (pendingTasks.length > 0) {
        agentsWithTasks.push({
          name: agent.name,
          status: agent.status,
          taskCount: pendingTasks.length,
          currentTaskId: agent.currentTaskId,
        });
      }
    }

    // If no agents have tasks, return early
    if (agentsWithTasks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          agents: [],
          message: "No agents with pending tasks",
        }),
        { status: 200, headers: corsHeaders() }
      );
    }

    // Call internal action to wake agents (needs crypto for HMAC)
    const wakeResults = await ctx.runAction(internal.wakeAgents.wakeAgentsInternal, {
      agentsWithTasks: agentsWithTasks.map(a => ({
        name: a.name,
        currentTaskId: a.currentTaskId || "",
      })),
      wakeupUrl: AGENT_WAKEUP_URL,
    });

    const successCount = wakeResults.filter((r: any) => r.success).length;

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        agents: agentsWithTasks,
        wakeResults,
        message: `Woke ${successCount} out of ${agentsWithTasks.length} agent(s)`,
      }),
      { status: 200, headers: corsHeaders() }
    );
  }),
});

http.route({ path: "/api/agents/wake", method: "OPTIONS", handler: optionsHandler() });


// POST /api/missions
http.route({
  path: "/api/missions",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const missionId = await ctx.runMutation(api.missions.create, {
      title: body.title,
      description: body.description || "",
      createdBy: body.creator || "Human",
    });
    const mission = await ctx.runQuery(api.missions.getById, { missionId });
    return new Response(JSON.stringify({ missionId, mission }), {
      status: 201,
      headers: corsHeaders(),
    });
  }),
});

http.route({ path: "/api/missions", method: "OPTIONS", handler: optionsHandler() });

// GET /api/messages?agentName=Kaze&unreadOnly=true
// Agents poll this to get messages directed at them from the human
http.route({
  path: "/api/messages",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const agentName = url.searchParams.get("agentName");
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";

    if (!agentName) {
      return new Response(JSON.stringify({ error: "agentName required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const messages = await ctx.runQuery(api.messages.listByConversation, { agentName });

    // If unreadOnly, return only messages from human (agent hasn't replied yet would be a separate tracking concern)
    // For now return all messages — agent can track which it's seen via timestamp
    const filtered = unreadOnly
      ? messages.filter((m: any) => m.from === "human")
      : messages;

    return new Response(JSON.stringify({ messages: filtered }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

// POST /api/messages — Agent sends a reply back to human
http.route({
  path: "/api/messages",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { from, to, content } = body;

    if (!from || !to || !content) {
      return new Response(JSON.stringify({ error: "from, to, and content are required" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const id = await ctx.runMutation(api.messages.send, { from, to, content });
    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200,
      headers: corsHeaders(),
    });
  }),
});

http.route({ path: "/api/messages", method: "OPTIONS", handler: optionsHandler() });

export default http;
