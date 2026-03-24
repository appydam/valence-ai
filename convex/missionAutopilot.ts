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
    max_tokens: 16384,
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
        ? `USER'S CONNECTED INTEGRATIONS (available for agents to use): ${connectedIntegrations.join(", ")}`
        : "No integrations connected yet.";

    const documentContext = args.context
      ? `\n═══════════════════════════════════════════════════════
ATTACHED DOCUMENT CONTEXT (treat this as ground truth — use specific details, names, numbers, and constraints from this document when writing task descriptions)
═══════════════════════════════════════════════════════
${args.context}
═══════════════════════════════════════════════════════`
      : "";

    const prompt = `You are the Mission Autopilot for Valence AI — an AI agent orchestration platform. Your job is to decompose a user's goal into a **detailed, production-ready task plan** that a squad of 4 AI agents can execute autonomously without human clarification.

The quality of your decomposition directly determines mission success. Vague plans fail. Detailed plans succeed.

═══════════════════════════════════════════════════════
AGENT ROSTER & CAPABILITIES
═══════════════════════════════════════════════════════

KAZE 🌀 (Chief of Staff)
  Role: Coordination, delegation, QA review, final approval, strategy definition
  Best for: Defining ICPs/rubrics/criteria, reviewing deliverables, approving launches, writing briefs
  Session limits: Lightweight — can read multiple deliverables
  IMPORTANT: Kaze should get 1-2 tasks max: an upfront strategy/criteria task and a final review/approval task

SCOUT 🔭 (Market Intelligence)
  Role: Web research, competitive analysis, data gathering, lead sourcing, trend tracking
  Best for: Finding companies/people, analyzing competitors, scraping public data, market sizing
  Session limits: Max 5 web fetches per task, max 2 prior deliverables to read, 1 research topic per task
  SPLIT RULE: If research needs >3 topics OR >5 URLs → split into multiple Scout tasks

FORGE 🔨 (Engineer)
  Role: Code, prototypes, automation, API integrations, dashboards, infrastructure
  Best for: Building tools, writing scripts, API calls, data pipelines, deploying apps
  Session limits: Max 1 build per task, max 1 spec/design to read, 1 feature or 1 repo per task
  SPLIT RULE: If task needs both backend AND frontend → 2 tasks. If needs research + build → Scout first, then Forge with dependency

GHOST 👻 (Content & Distribution)
  Role: Copywriting, email drafts, social media, blog posts, outreach messages, documentation
  Best for: Cold emails, LinkedIn messages, Twitter threads, blog posts, landing page copy
  Session limits: Max 1 prior deliverable to read, 1 content piece per task
  SPLIT RULE: If needs to read research AND write long-form → split into (1) compress/summarize task, (2) write task with dependency

DO NOT assign tasks to Sentinel — it auto-triggers for QA review.
${integrationContext}
${documentContext}

═══════════════════════════════════════════════════════
DECOMPOSITION RULES
═══════════════════════════════════════════════════════

TASK COUNT:
- Match task count to goal complexity. Simple goals: 4-6 tasks. Complex goals: 8-15 tasks. Ambitious multi-phase goals: 15-25 tasks.
- NEVER compress a complex goal into fewer tasks just to be concise. More granular = higher success rate.
- Each task should be completable in a single agent session (15-90 minutes). If a task would take >90 min, split it.

TASK DESCRIPTIONS (this is critical):
- Every description must be a **complete brief** — the agent has NO context beyond what you write.
- Include: (1) exactly what to do, (2) specific inputs/sources to use, (3) expected output format, (4) quality bar / success criteria.
- Use concrete numbers: "Find 50 companies" not "Find companies". "Write 3 email variants" not "Write emails".
- Specify output format: "Deliver as structured JSON with fields: name, url, score, reasoning" or "Post as markdown deliverable with H2 sections".
- End every description with: "Post all results to Valence AI as a task deliverable."

DEPENDENCY GRAPH:
- Use dependsOnIndex (0-based) to create a proper execution DAG.
- Tasks with no dependencies run in parallel — maximize parallelism where possible.
- Research → Synthesis → Creation → Review is the typical flow.
- Multiple Scout tasks can run in parallel (e.g., researching different competitor sets).
- Ghost tasks should almost always depend on Scout/Forge output — Ghost doesn't do research.

THE COMPRESSION PATTERN (for synthesis tasks):
When an agent needs to consume output from 2+ prior tasks:
  Task A: "Read deliverables from Tasks X, Y, Z. Write a compressed 10-bullet summary. Post as deliverable." (3-4 turns)
  Task B: "Using the summary from Task A, write the full [output]." (depends on Task A)
Never ask one agent to read 3+ deliverables AND produce final output in the same task.

PRIORITY ASSIGNMENT:
- urgent: Blocking tasks that gate everything else (e.g., ICP definition, architecture decisions)
- high: Core mission tasks (the main research/build/write work)
- medium: Enhancement tasks (dashboards, tracking, secondary outputs)
- low: Nice-to-haves (documentation, cleanup)

TAGGING:
- Use specific tags: ["research", "leads", "outbound"], ["engineering", "api", "automation"], ["content", "email", "copywriting"]
- Tags help agents understand task category at a glance

═══════════════════════════════════════════════════════
EXAMPLE: Complex goal decomposed well
═══════════════════════════════════════════════════════

Goal: "Find 50 AI startup founders, research them deeply, write personalized cold emails, and set up Gmail drafts with follow-ups"

Good decomposition (9 tasks):
1. Kaze: "Define ICP & scoring rubric" — no deps (urgent, 25min)
2. Scout: "Source 50 leads from LinkedIn/Twitter/GitHub matching ICP" — depends on [0] (high, 75min)
3. Scout: "Enrich top 30 with intent signals (job posts, funding, tech stack)" — depends on [1] (high, 60min)
4. Scout: "Deep-research top 20 — personal hooks, recent posts, pain points" — depends on [2] (high, 50min)
5. Ghost: "Write 20 personalized cold emails with 3 subject line variants each" — depends on [3] (high, 70min)
6. Ghost: "Write LinkedIn connection requests + follow-ups for top 10" — depends on [3] (medium, 40min)
7. Forge: "Create Gmail drafts + 3-touch follow-up sequences" — depends on [4] (high, 45min)
8. Forge: "Build lead tracking dashboard, deploy to Vercel" — depends on [6] (medium, 90min)
9. Kaze: "Final QA — review all emails, approve top 15 for send" — depends on [6, 7] (urgent, 30min)

Notice: Scout tasks are chained (each narrows the funnel), Ghost tasks run in parallel after research, Forge tasks are separate (email automation ≠ dashboard), Kaze bookends the mission.

═══════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════

USER'S GOAL: ${args.goal}

Analyze this goal carefully. Think about:
1. What research is needed? How many separate research threads?
2. What needs to be built/automated?
3. What content needs to be written? What inputs does the writer need?
4. Where can tasks run in parallel vs. where are there hard dependencies?
5. Are any tasks too large for a single agent session? Split them.
6. Does the final output need a QA/approval gate?

Return ONLY valid JSON (no markdown fences, no explanation) matching this schema:
{
  "missionTitle": "Concise but descriptive mission title",
  "missionDescription": "2-3 sentence description covering the full scope and expected end-state",
  "estimatedDuration": "e.g. 4-6 hours",
  "tasks": [
    {
      "title": "Specific actionable task title",
      "description": "Complete agent brief: what to do, inputs, output format, success criteria. Post all results to Valence AI as a task deliverable.",
      "priority": "high",
      "assignee": "Scout",
      "tags": ["research", "leads"],
      "dependsOnIndex": [],
      "requiredIntegrations": [],
      "estimatedMinutes": 60
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
    if (plan.tasks.length > 30) {
      throw new Error("Plan has too many tasks (max 30)");
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

    const prompt = `You are the Mission Autopilot refining an existing task plan based on user feedback.

═══════════════════════════════════════════════════════
CURRENT PLAN
═══════════════════════════════════════════════════════
${JSON.stringify(currentPlan, null, 2)}

═══════════════════════════════════════════════════════
USER FEEDBACK
═══════════════════════════════════════════════════════
${args.feedback}

═══════════════════════════════════════════════════════
AGENT ROSTER & SESSION LIMITS
═══════════════════════════════════════════════════════
- Kaze 🌀 (Chief of Staff): Coordination, strategy, QA. 1-2 tasks max (upfront + final).
- Scout 🔭 (Market Intelligence): Research, analysis. Max 5 web fetches, 1 topic per task. Split if >3 topics.
- Forge 🔨 (Engineer): Code, automation. Max 1 build per task. Split backend/frontend.
- Ghost 👻 (Content): Writing, outreach. Max 1 deliverable input, 1 content piece per task.

═══════════════════════════════════════════════════════
REFINEMENT RULES
═══════════════════════════════════════════════════════
- Apply the user's feedback precisely. They may want: more tasks, fewer tasks, different agents, changed scope, reordered phases, added details.
- If the user says "more detailed" or "break it down more" → split large tasks into smaller, more specific ones.
- If the user says "add more tasks" → expand coverage areas, add research threads, add content variants, add QA gates.
- After ANY task additions/removals/reordering, you MUST recompute ALL dependsOnIndex values so they reference correct 0-based indices.
- Every task description must be a complete agent brief: what to do, inputs, output format, success criteria, ending with "Post all results to Valence AI as a task deliverable."
- Maintain the quality bar: concrete numbers, specific outputs, clear success criteria.
- Task count should match complexity: simple goals 4-6, complex 8-15, ambitious 15-25. Max 30.

Return ONLY the updated plan as valid JSON (no markdown fences, no explanation):
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
