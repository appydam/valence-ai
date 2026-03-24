"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

// ── AWS Bedrock helpers (reused from missionAutopilot.ts) ────

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

async function callNovaLite(
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string
): Promise<string> {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_BEDROCK_REGION || "us-east-1";

  if (!accessKey || !secretKey) {
    throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set");
  }

  const modelId = "us.amazon.nova-2-lite-v1:0";
  const host = `bedrock-runtime.${region}.amazonaws.com`;
  const path = `/model/${encodeURIComponent(modelId)}/converse`;
  const url = `https://${host}${path}`;

  const body = JSON.stringify({
    messages: messages.map((m) => ({
      role: m.role,
      content: [{ text: m.content }],
    })),
    ...(systemPrompt ? { system: [{ text: systemPrompt }] } : {}),
    inferenceConfig: { maxTokens: 1024, temperature: 0.3 },
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
    throw new Error(`Nova Lite API error ${response.status}: ${err}`);
  }

  const result = await response.json();
  // Bedrock Converse API response format
  return result.output?.message?.content?.[0]?.text ?? "";
}

// ── Actions ──────────────────────────────────────────────────

/** Classify intent of a user message (10x cheaper than Claude) */
export const classifyIntent = action({
  args: {
    message: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const systemPrompt = `You are an intent classifier for Valence AI, an AI agent orchestration platform with 5 agents: Kaze (coordinator), Scout (research), Forge (engineering), Ghost (content), Sentinel (QA).

Classify the user's message into exactly one intent category. Return ONLY valid JSON.

Categories:
- "question": Asking about status, progress, or information
- "task_creation": Requesting work to be done (build, write, research, etc.)
- "delegation": Assigning work to a specific agent
- "feedback": Giving praise, criticism, or corrections
- "briefing": Asking for a summary or status update
- "command": Direct system commands (wake agents, restart, etc.)
- "casual": Greetings, small talk, off-topic

Also extract:
- "suggestedAgent": Which agent should handle this (Kaze|Scout|Forge|Ghost|null)
- "suggestedPriority": low|medium|high|urgent
- "suggestedTags": Array of 1-3 relevant tags
- "suggestedTitle": If task_creation, a concise title (max 60 chars), else null

Return ONLY this JSON:
{"intent":"...","confidence":0.95,"suggestedAgent":"...","suggestedPriority":"...","suggestedTags":[...],"suggestedTitle":null}`;

    const userMessage = args.context
      ? `Recent context:\n${args.context}\n\nCurrent message: ${args.message}`
      : args.message;

    const result = await callNovaLite(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    try {
      let json = result.trim();
      if (json.startsWith("```")) {
        json = json.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      return JSON.parse(json);
    } catch {
      return {
        intent: "casual",
        confidence: 0.5,
        suggestedAgent: null,
        suggestedPriority: "medium",
        suggestedTags: [],
        suggestedTitle: null,
      };
    }
  },
});

/** Generate a concise task title from a description */
export const generateTitle = action({
  args: { description: v.string() },
  handler: async (_ctx, args) => {
    const result = await callNovaLite([
      {
        role: "user",
        content: `Generate a concise task title (max 60 chars) for this description. Return ONLY the title text, nothing else.\n\nDescription: ${args.description}`,
      },
    ]);
    return result.trim().replace(/^["']|["']$/g, "");
  },
});

/** Summarize content concisely */
export const summarize = action({
  args: {
    content: v.string(),
    maxLength: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const result = await callNovaLite([
      {
        role: "user",
        content: `Summarize this in ${args.maxLength ?? 100} words or fewer. Be specific and actionable.\n\n${args.content}`,
      },
    ]);
    return result.trim();
  },
});
