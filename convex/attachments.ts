"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

// ── Bedrock helper (Sonnet 4.6 for summarization) ────────────

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

async function callSonnet(prompt: string): Promise<string> {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_BEDROCK_REGION || "us-east-1";

  if (!accessKey || !secretKey) throw new Error("AWS credentials not set");

  const modelId = "us.anthropic.claude-sonnet-4-6";
  const host = `bedrock-runtime.${region}.amazonaws.com`;
  const path = `/model/${encodeURIComponent(modelId)}/invoke`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dateStamp = amzDate.substring(0, 8);
  const credentialScope = `${dateStamp}/${region}/bedrock/aws4_request`;
  const payloadHash = sha256(body);

  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";

  const canonicalRequest = ["POST", path, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest)].join("\n");

  const signingKey = getSignatureKey(secretKey, dateStamp, region, "bedrock");
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${host}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Amz-Date": amzDate, Authorization: authHeader },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Bedrock Sonnet error ${response.status}: ${err}`);
  }

  const result = await response.json();
  return result.content?.[0]?.text ?? "";
}

// ── Extract text + summarize ──────────────────────────────────

/** Fetch file from Convex storage, extract text, summarize with Sonnet 4.6 */
export const extractAndSummarize = action({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get the file URL from Convex storage
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) throw new Error("File not found in storage");

    // 2. Fetch raw bytes
    const fetchResp = await fetch(fileUrl);
    if (!fetchResp.ok) throw new Error(`Failed to fetch file: ${fetchResp.status}`);

    const buffer = Buffer.from(await fetchResp.arrayBuffer());
    const lowerName = args.fileName.toLowerCase();
    let rawText = "";

    // 3. Extract text by file type
    if (args.fileType === "application/pdf" || lowerName.endsWith(".pdf")) {
      // Require the inner lib directly to skip pdf-parse's broken index.js
      // (index.js has a !module.parent check that tries to read a test PDF)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      const data = await pdfParse(buffer);
      rawText = data.text || "";
    } else if (
      args.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerName.endsWith(".docx")
    ) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || "";
    } else {
      rawText = buffer.toString("utf-8");
    }

    // 4. Trim to 8000 chars
    const truncated = rawText.length > 8000 ? rawText.slice(0, 8000) + "\n...[truncated]" : rawText;
    if (!truncated.trim()) throw new Error("Could not extract any text from the file");

    // 5. Summarize with Claude Sonnet 4.6
    const summary = await callSonnet(
      `You are a context extractor for an AI agent orchestration platform. A user has uploaded a document to provide context for their AI agents.

Extract and summarize the key information from this document that would be most useful for AI agents executing tasks. Focus on:
- Goals, objectives, or requirements
- Key facts, data points, or constraints
- Specific instructions or preferences
- Relevant context (names, companies, products, etc.)

Be concise but complete. Output only the summary, no preamble.

Document filename: ${args.fileName}

Document content:
${truncated}`
    );

    // 6. Delete from storage — it's transient context, no need to keep it
    await ctx.storage.delete(args.storageId);

    return { summary: summary.trim(), fileName: args.fileName, charCount: rawText.length };
  },
});
