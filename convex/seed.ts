import { mutation } from "./_generated/server";

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Note: sshConfig is intentionally excluded so SSH credentials survive reseeds
    const tables = ["agents", "tasks", "missions", "comments", "activity", "messages", "notifications", "documents", "usage", "agentConfigs", "soulFiles"] as const;
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
    return "Cleared all data";
  },
});

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingAgents = await ctx.db.query("agents").collect();
    if (existingAgents.length > 0) return "Already seeded";

    const now = Date.now();
    const mins = (n: number) => now - n * 60 * 1000;
    const hours = (n: number) => now - n * 60 * 60 * 1000;

    // Seed agents
    await ctx.db.insert("agents", {
      name: "Kaze",
      emoji: "🌀",
      role: "Chief of Staff",
      description: "Coordinates the squad, delegates tasks",
      status: "online",
      lastHeartbeat: mins(2),
      tasksCompleted: 47,
      color: "kaze",
    });
    await ctx.db.insert("agents", {
      name: "Scout",
      emoji: "🔭",
      role: "Market Intelligence",
      description: "Researches trends, finds opportunities",
      status: "working",
      lastHeartbeat: mins(1),
      tasksCompleted: 32,
      color: "scout",
    });
    await ctx.db.insert("agents", {
      name: "Forge",
      emoji: "🔨",
      role: "Engineer",
      description: "Writes code, prototypes, builds automations",
      status: "working",
      lastHeartbeat: mins(3),
      tasksCompleted: 28,
      color: "forge",
    });
    await ctx.db.insert("agents", {
      name: "Ghost",
      emoji: "👻",
      role: "Content & Distribution",
      description: "Drafts tweets, LinkedIn posts, blog content",
      status: "idle",
      lastHeartbeat: mins(15),
      tasksCompleted: 41,
      color: "ghost",
    });

    // Seed tasks
    const t1 = await ctx.db.insert("tasks", {
      title: "Research top 10 agentic AI startups funded in Jan 2026",
      description:
        "Deep dive into the latest AI agent startups that received funding in January 2026. Include funding amounts, key founders, and product descriptions.",
      status: "in_progress",
      priority: "high",
      assignee: "Scout",
      creator: "Kaze",
      createdAt: hours(6),
      updatedAt: mins(30),
      tags: ["research", "ai"],
      deliverables: [],
    });

    const t2 = await ctx.db.insert("tasks", {
      title: "Build Python scraper for ProductHunt daily launches",
      description:
        "Create an automated scraper that pulls daily ProductHunt launches, extracts key metadata, and stores in a structured format.",
      status: "assigned",
      priority: "medium",
      assignee: "Forge",
      creator: "Kaze",
      createdAt: hours(4),
      updatedAt: hours(2),
      tags: ["code", "automation"],
      deliverables: [],
    });

    const t3 = await ctx.db.insert("tasks", {
      title: "Draft Twitter thread about building with OpenClaw",
      description:
        "Write an engaging Twitter thread (8-12 tweets) about the experience of building an AI agent squad using OpenClaw framework.",
      status: "inbox",
      priority: "medium",
      assignee: "Ghost",
      creator: "Human",
      createdAt: hours(3),
      updatedAt: hours(3),
      tags: ["content", "twitter"],
      deliverables: [],
    });

    const t4 = await ctx.db.insert("tasks", {
      title: "Review and prioritize this week's tasks",
      description:
        "Go through all pending tasks, assess priority levels, and create a clear execution plan for the week.",
      status: "done",
      priority: "high",
      assignee: "Kaze",
      creator: "Human",
      createdAt: hours(8),
      updatedAt: hours(1),
      completedAt: hours(1),
      tags: ["ops"],
      deliverables: [
        {
          name: "Weekly Plan",
          type: "document",
          content: "Prioritized task list for the week...",
        },
      ],
    });

    const t5 = await ctx.db.insert("tasks", {
      title: "Analyze competitor pricing strategies",
      description:
        "Research and document pricing models of top 5 competitors in the AI agent space.",
      status: "in_review",
      priority: "high",
      assignee: "Scout",
      creator: "Kaze",
      createdAt: hours(12),
      updatedAt: hours(2),
      tags: ["research", "strategy"],
      deliverables: [
        {
          name: "Pricing Report",
          type: "document",
          content: "Competitive pricing analysis...",
        },
      ],
    });

    const t6 = await ctx.db.insert("tasks", {
      title: "Set up CI/CD pipeline for agent deployment",
      description:
        "Configure automated deployment pipeline for all agent services.",
      status: "in_progress",
      priority: "urgent",
      assignee: "Forge",
      creator: "Human",
      createdAt: hours(5),
      updatedAt: mins(45),
      tags: ["devops", "code"],
      deliverables: [],
    });

    // Seed comments
    await ctx.db.insert("comments", {
      taskId: t1,
      author: "Kaze",
      content:
        "This is a high priority. @Scout, please focus on Series A+ rounds specifically.",
      mentions: ["Scout"],
      createdAt: hours(5),
    });
    await ctx.db.insert("comments", {
      taskId: t1,
      author: "Scout",
      content:
        "On it. Found 3 promising ones already. Will have a full report by EOD.",
      mentions: [],
      createdAt: hours(4),
    });
    await ctx.db.insert("comments", {
      taskId: t2,
      author: "Forge",
      content:
        "PH API has rate limits. I'll implement a queue-based approach with retries.",
      mentions: [],
      createdAt: hours(3),
    });
    await ctx.db.insert("comments", {
      taskId: t4,
      author: "Human",
      content:
        "Great work @Kaze. Let's make sure @Scout and @Forge are aligned on priorities.",
      mentions: ["Kaze", "Scout", "Forge"],
      createdAt: hours(1),
    });

    // Seed activity
    await ctx.db.insert("activity", {
      timestamp: mins(2),
      agentName: "Kaze",
      action: "checked in",
      details: "Status: online, monitoring squad activity",
    });
    await ctx.db.insert("activity", {
      timestamp: mins(5),
      agentName: "Scout",
      action: "updated task",
      details: "Added preliminary findings to research report",
      taskId: t1 as unknown as string,
    });
    await ctx.db.insert("activity", {
      timestamp: mins(12),
      agentName: "Forge",
      action: "claimed task",
      details: "Started working on CI/CD pipeline setup",
      taskId: t6 as unknown as string,
    });
    await ctx.db.insert("activity", {
      timestamp: mins(25),
      agentName: "Scout",
      action: "posted comment",
      details: "Found 3 promising AI startups for the report",
      taskId: t1 as unknown as string,
    });
    await ctx.db.insert("activity", {
      timestamp: mins(45),
      agentName: "Forge",
      action: "updated task",
      details: "Pushed initial pipeline configuration",
      taskId: t6 as unknown as string,
    });
    await ctx.db.insert("activity", {
      timestamp: hours(1),
      agentName: "Kaze",
      action: "completed task",
      details: "Finished weekly task review and prioritization",
      taskId: t4 as unknown as string,
    });
    await ctx.db.insert("activity", {
      timestamp: hours(1.5),
      agentName: "Ghost",
      action: "checked in",
      details: "Status: idle, waiting for content assignments",
    });
    await ctx.db.insert("activity", {
      timestamp: hours(2),
      agentName: "Scout",
      action: "submitted for review",
      details: "Competitor pricing analysis ready for review",
      taskId: t5 as unknown as string,
    });
    await ctx.db.insert("activity", {
      timestamp: hours(3),
      agentName: "Forge",
      action: "posted comment",
      details:
        "Noted PH API rate limits, implementing queue-based approach",
      taskId: t2 as unknown as string,
    });
    await ctx.db.insert("activity", {
      timestamp: hours(4),
      agentName: "Kaze",
      action: "assigned task",
      details: "Assigned ProductHunt scraper to Forge",
      taskId: t2 as unknown as string,
    });

    // Seed documents
    await ctx.db.insert("documents", {
      title: "AI Agent Startup Landscape — January 2026",
      content: "# AI Agent Startup Landscape\n\n## Overview\nThe AI agent space saw significant funding activity in January 2026, with over $2.3B deployed across 47 deals.\n\n## Top Funded Startups\n1. **AgentStack** ($180M Series B) — Enterprise agent orchestration\n2. **Nexus AI** ($120M Series A) — Multi-agent collaboration platform\n3. **CogniFlow** ($95M Series A) — Autonomous coding agents\n\n## Key Trends\n- Shift from single-agent to multi-agent architectures\n- Enterprise adoption accelerating\n- Developer tooling maturing rapidly",
      type: "report",
      author: "Scout",
      tags: ["research", "ai", "startups"],
      taskId: t1,
      createdAt: hours(3),
      updatedAt: hours(3),
    });
    await ctx.db.insert("documents", {
      title: "ProductHunt Scraper — Architecture Notes",
      content: "# ProductHunt Scraper Architecture\n\n## Approach\nQueue-based scraper with rate limit handling.\n\n## Stack\n- Python 3.12 + asyncio\n- aiohttp for requests\n- Redis for job queue\n- PostgreSQL for storage\n\n## Rate Limits\n- PH API: 900 requests/15min\n- Implemented exponential backoff with jitter\n- Queue processes jobs in batches of 10",
      type: "code",
      author: "Forge",
      tags: ["code", "architecture", "automation"],
      taskId: t2,
      createdAt: hours(2),
      updatedAt: hours(2),
    });
    await ctx.db.insert("documents", {
      title: "Competitive Pricing Analysis Q1 2026",
      content: "# Competitive Pricing Analysis\n\n## Competitors Analyzed\n1. CrewAI — $49/mo starter, $199/mo pro\n2. AutoGen — Open source, enterprise pricing on request\n3. LangGraph — $29/mo dev, $149/mo team\n4. AgentOps — $39/mo, usage-based scaling\n5. Fixie.ai — Free tier + $99/mo pro\n\n## Key Findings\n- Most competitors use usage-based pricing for scale\n- Free tiers are standard for developer acquisition\n- Enterprise deals range $5K-50K/mo",
      type: "analysis",
      author: "Scout",
      tags: ["research", "pricing", "strategy"],
      taskId: t5,
      createdAt: hours(4),
      updatedAt: hours(2),
    });

    // Seed agent configs (matching actual server openclaw.json)
    const serverSkills = ["gemini", "github", "mcporter", "mission-control", "model-usage", "soulcraft", "sr1"];
    for (const agent of ["Kaze", "Scout", "Forge", "Ghost"] as const) {
      await ctx.db.insert("agentConfigs", {
        agentName: agent,
        model: "anthropic/claude-sonnet-4-5",
        skills: serverSkills,
        sessionMaxTurns: 25,
        sessionTimeout: 300,
        updatedAt: now,
        updatedBy: "System",
      });
    }

    return "Seeded successfully";
  },
});
