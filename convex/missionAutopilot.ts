"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import crypto from "crypto";

// ── Types ─────────────────────────────────────────────────────

interface DecomposedTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee: "Kaze" | "Scout" | "Forge" | "Ghost";
  tags: string[];
  dependsOnIndex: number[];
  requiredIntegrations: string[];
  estimatedMinutes: number;
}

interface DecomposedPlan {
  missionTitle: string;
  missionDescription: string;
  estimatedDuration: string;
  tasks: DecomposedTask[];
}

// ── AWS Bedrock helpers ───────────────────────────────────────

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function getSignatureKey(key: string, dateStamp: string, region: string, service: string): Buffer {
  const kDate = hmac("AWS4" + key, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

async function callBedrock(prompt: string): Promise<string> {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_BEDROCK_REGION || "us-east-1";

  if (!accessKey || !secretKey) {
    throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in Convex env vars");
  }

  const modelId = "us.anthropic.claude-opus-4-6-v1";
  const host = `bedrock-runtime.${region}.amazonaws.com`;
  const path = `/model/${encodeURIComponent(modelId)}/invoke`;
  const url = `https://${host}${path}`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  // AWS Signature V4
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dateStamp = amzDate.substring(0, 8);
  const service = "bedrock";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  const payloadHash = sha256(body);

  const canonicalHeaders =
    `content-type:application/json\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";

  const canonicalRequest = [
    "POST",
    path,
    "", // query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Amz-Date": amzDate,
      Authorization: authHeader,
    },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Bedrock API error ${response.status}: ${err}`);
  }

  const result = await response.json();
  return result.content?.[0]?.text ?? "";
}

// ── Actions (Claude via Bedrock) ──────────────────────────────

/** Decompose a natural language goal into a structured task plan */
export const decomposeMission = action({
  args: {
    goal: v.string(),
    context: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user's connected integrations for context
    let connectedIntegrations: string[] = [];
    try {
      const connections: any[] = await ctx.runQuery(
        api.connections.listByUser,
        { userId: args.userId }
      );
      if (connections && connections.length > 0) {
        for (const conn of connections) {
          if (conn.status === "active") {
            const blueprint: any = await ctx.runQuery(api.blueprints.get, {
              id: conn.blueprintId,
            });
            if (blueprint) {
              connectedIntegrations.push(blueprint.name);
            }
          }
        }
      }
    } catch {
      // If queries fail, continue without integration context
    }

    const integrationContext =
      connectedIntegrations.length > 0
        ? `\nUSER'S CONNECTED INTEGRATIONS (available for agents to use): ${connectedIntegrations.join(", ")}`
        : "\nNo integrations connected yet.";

    const prompt = `You are the Mission Autopilot for an AI agent orchestration platform called Mission Control. Given a user's goal, decompose it into a structured task plan for execution by a squad of 4 AI agents.

AGENT ROSTER:
- Kaze (🌀 Chief of Staff): Coordinates, delegates, reviews, approves work. Assign coordination and approval tasks.
- Scout (🔭 Market Intelligence): Research, analysis, competitive intelligence, data gathering. Assign research and analysis tasks.
- Forge (🔨 Engineer): Code, prototypes, automation, technical implementation, infrastructure. Assign building and technical tasks.
- Ghost (👻 Content & Distribution): Writing, social media, outreach, documentation, content creation. Assign content and communication tasks.

NOTE: Do NOT assign tasks to Sentinel (QA reviewer). Sentinel auto-triggers on task review.
${integrationContext}

CONSTRAINTS:
- Create 3-8 tasks (prefer 4-6 for most goals)
- Each task assigned to exactly one agent: Kaze, Scout, Forge, or Ghost
- Use dependsOnIndex (0-based array indices) to express task ordering
- Tasks with no dependencies run in parallel
- Set priority: urgent/high/medium/low based on goal urgency
- Include requiredIntegrations only for tasks needing specific APIs
- estimatedMinutes should be realistic (15-120 min per task)
- Kaze usually gets a final coordination/review task that depends on all others

USER'S GOAL: ${args.goal}${args.context ? `\n\nADDITIONAL CONTEXT: ${args.context}` : ""}

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "missionTitle": "Short mission title",
  "missionDescription": "1-2 sentence description of the mission",
  "estimatedDuration": "e.g. 2-3 hours",
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description of what the agent should do",
      "priority": "medium",
      "assignee": "Scout",
      "tags": ["research"],
      "dependsOnIndex": [],
      "requiredIntegrations": [],
      "estimatedMinutes": 30
    }
  ]
}`;

    const rawText = await callBedrock(prompt);

    // Parse JSON from response (handle possible markdown wrapping)
    let planJson: string = rawText.trim();
    if (planJson.startsWith("```")) {
      planJson = planJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let plan: DecomposedPlan;
    try {
      plan = JSON.parse(planJson);
    } catch {
      throw new Error(`Failed to parse plan JSON: ${planJson.substring(0, 200)}`);
    }

    // Validate plan
    const validAgents = ["Kaze", "Scout", "Forge", "Ghost"];
    const validPriorities = ["low", "medium", "high", "urgent"];

    if (!plan.missionTitle || !plan.tasks || plan.tasks.length === 0) {
      throw new Error("Invalid plan: missing title or tasks");
    }
    if (plan.tasks.length > 10) {
      throw new Error("Plan has too many tasks (max 10)");
    }

    for (let i = 0; i < plan.tasks.length; i++) {
      const task = plan.tasks[i];
      if (!validAgents.includes(task.assignee)) {
        throw new Error(`Task ${i}: invalid assignee "${task.assignee}"`);
      }
      if (!validPriorities.includes(task.priority)) {
        task.priority = "medium";
      }
      if (!task.dependsOnIndex) task.dependsOnIndex = [];
      if (!task.requiredIntegrations) task.requiredIntegrations = [];
      if (!task.tags) task.tags = [];
      if (!task.estimatedMinutes) task.estimatedMinutes = 30;

      // Auto-fix invalid dependency references instead of crashing
      task.dependsOnIndex = task.dependsOnIndex.filter(
        (idx) => idx >= 0 && idx < plan.tasks.length && idx !== i
      );
    }

    // Check for circular dependencies
    const visited = new Set<number>();
    const inStack = new Set<number>();
    function hasCycle(node: number): boolean {
      if (inStack.has(node)) return true;
      if (visited.has(node)) return false;
      visited.add(node);
      inStack.add(node);
      for (const dep of plan.tasks[node].dependsOnIndex) {
        if (hasCycle(dep)) return true;
      }
      inStack.delete(node);
      return false;
    }
    for (let i = 0; i < plan.tasks.length; i++) {
      if (hasCycle(i)) {
        throw new Error("Plan has circular dependencies");
      }
    }

    // Save session
    const sessionId = await ctx.runMutation(
      internal.missionAutopilotQueries.createSession,
      {
        userId: args.userId,
        goal: args.goal,
        context: args.context,
        plan: JSON.stringify(plan),
      }
    );

    return { sessionId, plan };
  },
});

/** Refine an existing plan based on user feedback */
export const refinePlan = action({
  args: {
    sessionId: v.id("autopilotSessions"),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const session: any = await ctx.runQuery(
      api.missionAutopilotQueries.getSession,
      { sessionId: args.sessionId }
    );
    if (!session) throw new Error("Session not found");
    if (!session.plan) throw new Error("No plan to refine");

    const currentPlan = JSON.parse(session.plan);

    const prompt = `You are refining a mission plan based on user feedback. Here is the current plan:

${JSON.stringify(currentPlan, null, 2)}

USER FEEDBACK: ${args.feedback}

AGENTS AVAILABLE:
- Kaze (🌀 Chief of Staff): Coordination, delegation, reviews
- Scout (🔭 Market Intelligence): Research, analysis
- Forge (🔨 Engineer): Code, technical tasks
- Ghost (👻 Content): Writing, social media, outreach

Apply the user's feedback to update the plan. You can add, remove, modify, or reorder tasks. Keep dependsOnIndex references valid after any changes.

Return ONLY the updated plan as valid JSON (same schema as before, no markdown):
{
  "missionTitle": "...",
  "missionDescription": "...",
  "estimatedDuration": "...",
  "tasks": [...]
}`;

    const rawText = await callBedrock(prompt);

    let planJson = rawText.trim();
    if (planJson.startsWith("```")) {
      planJson = planJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const updatedPlan: DecomposedPlan = JSON.parse(planJson);

    // Save updated plan
    await ctx.runMutation(api.missionAutopilotQueries.savePlan, {
      sessionId: args.sessionId,
      plan: JSON.stringify(updatedPlan),
    });

    return { plan: updatedPlan };
  },
});
