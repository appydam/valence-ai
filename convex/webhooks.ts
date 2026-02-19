import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Process incoming webhook from Slack
 * Handles: message events, app_mention, reactions
 */
export const handleSlack = mutation({
  args: {
    type: v.string(),
    event: v.any(),
    teamId: v.optional(v.string()),
    apiAppId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Handle URL verification challenge
    if (args.type === "url_verification") {
      return { challenge: (args as any).challenge };
    }

    // Handle actual events
    if (args.type === "event_callback" && args.event) {
      const event = args.event;

      // Handle app mentions (someone @ mentions the bot)
      if (event.type === "app_mention") {
        const now = Date.now();

        // Create a task for the mentioned message
        const taskId = await ctx.db.insert("tasks", {
          title: `Slack mention from ${event.user}`,
          description: `**Channel:** <#${event.channel}>\n**Message:** ${event.text}\n**Thread:** ${event.thread_ts || event.ts}`,
          status: "inbox",
          priority: "medium",
          creator: "Slack Webhook",
          createdAt: now,
          updatedAt: now,
          tags: ["slack", "mention", "webhook"],
          deliverables: [],
          metadata: JSON.stringify({
            source: "slack_webhook",
            channel: event.channel,
            user: event.user,
            ts: event.ts,
            thread_ts: event.thread_ts,
          }),
        });

        // Log activity
        await ctx.db.insert("activity", {
          timestamp: now,
          agentName: "Kaze", // Default to Kaze for coordination
          action: "webhook_received",
          details: `Created task from Slack mention: ${event.text.substring(0, 100)}`,
          taskId: taskId,
        });

        return { ok: true, taskId };
      }

      // Handle direct messages
      if (event.type === "message" && event.channel_type === "im") {
        const now = Date.now();

        const taskId = await ctx.db.insert("tasks", {
          title: `Slack DM from ${event.user}`,
          description: `**Message:** ${event.text}`,
          status: "inbox",
          priority: "high", // DMs are usually more urgent
          creator: "Slack Webhook",
          createdAt: now,
          updatedAt: now,
          tags: ["slack", "dm", "webhook"],
          deliverables: [],
          metadata: JSON.stringify({
            source: "slack_webhook",
            channel: event.channel,
            user: event.user,
            ts: event.ts,
          }),
        });

        await ctx.db.insert("activity", {
          timestamp: now,
          agentName: "Kaze",
          action: "webhook_received",
          details: `Created task from Slack DM: ${event.text.substring(0, 100)}`,
          taskId: taskId,
        });

        return { ok: true, taskId };
      }
    }

    return { ok: true };
  },
});

/**
 * Process incoming webhook from GitHub
 * Handles: PR opened, issue created, review requested
 */
export const handleGitHub = mutation({
  args: {
    event: v.string(), // X-GitHub-Event header
    action: v.optional(v.string()),
    repository: v.any(),
    sender: v.any(),
    pullRequest: v.optional(v.any()),
    issue: v.optional(v.any()),
    reviewRequest: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Handle pull request events
    if (args.event === "pull_request" && args.pullRequest) {
      const pr = args.pullRequest;
      const action = args.action;

      if (action === "opened" || action === "review_requested") {
        const taskId = await ctx.db.insert("tasks", {
          title: `GitHub PR #${pr.number}: ${pr.title}`,
          description: `**Action:** ${action}\n**Author:** ${pr.user.login}\n**URL:** ${pr.html_url}\n\n${pr.body || "No description"}`,
          status: "inbox",
          priority: action === "review_requested" ? "high" : "medium",
          creator: "GitHub Webhook",
          assignee: action === "review_requested" ? "Forge" : undefined,
          createdAt: now,
          updatedAt: now,
          tags: ["github", "pr", "webhook"],
          deliverables: [],
          metadata: JSON.stringify({
            source: "github_webhook",
            event: args.event,
            action,
            pr_number: pr.number,
            pr_url: pr.html_url,
            repository: args.repository.full_name,
          }),
        });

        await ctx.db.insert("activity", {
          timestamp: now,
          agentName: "Forge",
          action: "webhook_received",
          details: `GitHub PR ${action}: ${pr.title}`,
          taskId: taskId,
        });

        return { ok: true, taskId };
      }
    }

    // Handle issue events
    if (args.event === "issues" && args.issue) {
      const issue = args.issue;
      const action = args.action;

      if (action === "opened") {
        const taskId = await ctx.db.insert("tasks", {
          title: `GitHub Issue #${issue.number}: ${issue.title}`,
          description: `**Author:** ${issue.user.login}\n**URL:** ${issue.html_url}\n\n${issue.body || "No description"}`,
          status: "inbox",
          priority: issue.labels.some((l: any) => l.name === "bug") ? "high" : "medium",
          creator: "GitHub Webhook",
          createdAt: now,
          updatedAt: now,
          tags: ["github", "issue", "webhook", ...issue.labels.map((l: any) => l.name)],
          deliverables: [],
          metadata: JSON.stringify({
            source: "github_webhook",
            event: args.event,
            action,
            issue_number: issue.number,
            issue_url: issue.html_url,
            repository: args.repository.full_name,
          }),
        });

        await ctx.db.insert("activity", {
          timestamp: now,
          agentName: "Forge",
          action: "webhook_received",
          details: `GitHub issue opened: ${issue.title}`,
          taskId: taskId,
        });

        return { ok: true, taskId };
      }
    }

    return { ok: true };
  },
});

/**
 * Process incoming webhook from Linear
 * Handles: issue created, issue updated, comment added
 */
export const handleLinear = mutation({
  args: {
    action: v.string(),
    type: v.string(),
    data: v.any(),
    webhookId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    if (args.type === "Issue" && args.action === "create") {
      const issue = args.data;

      const taskId = await ctx.db.insert("tasks", {
        title: `Linear: ${issue.title}`,
        description: `**ID:** ${issue.identifier}\n**Priority:** ${issue.priority || "None"}\n**Assignee:** ${issue.assignee?.name || "Unassigned"}\n\n${issue.description || "No description"}`,
        status: "inbox",
        priority: issue.priority >= 1 ? "high" : "medium",
        creator: "Linear Webhook",
        createdAt: now,
        updatedAt: now,
        tags: ["linear", "issue", "webhook"],
        deliverables: [],
        metadata: JSON.stringify({
          source: "linear_webhook",
          linear_id: issue.id,
          identifier: issue.identifier,
          url: issue.url,
        }),
      });

      await ctx.db.insert("activity", {
        timestamp: now,
        agentName: "Kaze",
        action: "webhook_received",
        details: `Linear issue created: ${issue.title}`,
        taskId: taskId,
      });

      return { ok: true, taskId };
    }

    return { ok: true };
  },
});

/**
 * List recent webhook events for debugging
 */
export const listWebhookTasks = query({
  args: {
    source: v.optional(v.string()), // "slack_webhook", "github_webhook", "linear_webhook"
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tasks = await ctx.db.query("tasks")
      .filter((q) => q.neq(q.field("metadata"), undefined))
      .order("desc")
      .take(args.limit || 50);

    if (args.source) {
      tasks = tasks.filter(t => {
        if (!t.metadata) return false;
        try {
          const metadata = JSON.parse(t.metadata);
          return metadata.source === args.source;
        } catch {
          return false;
        }
      });
    }

    return tasks;
  },
});
