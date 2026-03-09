"use node";

import crypto from "crypto";

/**
 * Shared AWS Bedrock helper — call Claude models via Bedrock with SigV4 auth.
 * Uses AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BEDROCK_REGION env vars.
 */

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

export type BedrockModel =
  | "us.anthropic.claude-haiku-4-5-20251001-v1:0"
  | "us.anthropic.claude-sonnet-4-6-v1"
  | "us.anthropic.claude-opus-4-6-v1";

export async function callBedrock(
  prompt: string,
  model: BedrockModel = "us.anthropic.claude-sonnet-4-6-v1",
  maxTokens: number = 4096
): Promise<string> {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_BEDROCK_REGION || "us-east-1";

  if (!accessKey || !secretKey) {
    throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set");
  }

  const host = `bedrock-runtime.${region}.amazonaws.com`;
  const path = `/model/${encodeURIComponent(model)}/invoke`;
  const url = `https://${host}${path}`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

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
    "POST", path, "", canonicalHeaders, signedHeaders, payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest),
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
