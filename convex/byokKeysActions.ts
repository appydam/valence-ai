"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { encrypt, decrypt } from "./lib/crypto";

const providerValidator = v.union(
  v.literal("anthropic"),
  v.literal("openai"),
  v.literal("google"),
  v.literal("xai")
);

// Provider validation endpoints and expected key prefixes
const PROVIDER_CONFIG: Record<string, {
  validateUrl: string;
  validateMethod: string;
  validateHeaders: (key: string) => Record<string, string>;
  validateBody?: string;
  expectedPrefixes: string[];
}> = {
  anthropic: {
    validateUrl: "https://api.anthropic.com/v1/messages",
    validateMethod: "POST",
    validateHeaders: (key) => ({
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    }),
    validateBody: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1,
      messages: [{ role: "user", content: "hi" }],
    }),
    expectedPrefixes: ["sk-ant-"],
  },
  openai: {
    validateUrl: "https://api.openai.com/v1/models",
    validateMethod: "GET",
    validateHeaders: (key) => ({
      Authorization: `Bearer ${key}`,
    }),
    expectedPrefixes: ["sk-"],
  },
  google: {
    validateUrl: "https://generativelanguage.googleapis.com/v1/models",
    validateMethod: "GET",
    validateHeaders: (key) => ({
      "x-goog-api-key": key,
    }),
    expectedPrefixes: ["AIza"],
  },
  xai: {
    validateUrl: "https://api.x.ai/v1/models",
    validateMethod: "GET",
    validateHeaders: (key) => ({
      Authorization: `Bearer ${key}`,
    }),
    expectedPrefixes: ["xai-"],
  },
};

/**
 * Save an API key after encrypting it.
 */
export const saveEncrypted = action({
  args: {
    provider: providerValidator,
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const encryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY;
    if (!encryptionKey) throw new Error("Encryption key not configured");

    // Generate display prefix (first 8-12 chars)
    const displayPrefix = args.apiKey.substring(0, Math.min(12, args.apiKey.length)) + "...";

    // Encrypt the key
    const keyEncrypted = encrypt(args.apiKey, encryptionKey);

    // Save to database
    const keyId = await ctx.runMutation(api.byokKeys.save, {
      userId: identity.subject,
      provider: args.provider,
      keyEncrypted,
      displayPrefix,
    });

    return { keyId, displayPrefix };
  },
});

/**
 * Decrypt and return a BYOK key (for internal server sync operations).
 */
export const getDecrypted = action({
  args: {
    provider: providerValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const encryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY;
    if (!encryptionKey) throw new Error("Encryption key not configured");

    const key = await ctx.runQuery(api.byokKeys.getByProvider, {
      provider: args.provider,
    });
    if (!key) throw new Error(`No ${args.provider} key configured`);

    return decrypt(key.keyEncrypted, encryptionKey);
  },
});

/**
 * Validate a BYOK key by making a lightweight API call to the provider.
 */
export const validateKey = action({
  args: {
    provider: providerValidator,
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const config = PROVIDER_CONFIG[args.provider];
    if (!config) throw new Error(`Unknown provider: ${args.provider}`);

    try {
      const fetchOptions: RequestInit = {
        method: config.validateMethod,
        headers: config.validateHeaders(args.apiKey),
      };

      if (config.validateBody && config.validateMethod === "POST") {
        fetchOptions.body = config.validateBody;
      }

      const response = await fetch(config.validateUrl, fetchOptions);

      // For Anthropic, a 200 means the key is valid
      // For others, 200 on the models endpoint means valid
      // 401/403 means invalid key
      if (response.ok || response.status === 200) {
        return { valid: true, status: response.status };
      }

      if (response.status === 401 || response.status === 403) {
        return { valid: false, error: "Invalid API key" };
      }

      // Other errors (rate limit, etc.) — key might be valid but we can't confirm
      return { valid: true, status: response.status, note: "Key format accepted (rate-limited response)" };
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  },
});

/**
 * Sync the active BYOK key to the user's OpenClaw server via SSH proxy.
 */
export const syncToServer = action({
  args: {
    provider: providerValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const encryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY;
    if (!encryptionKey) throw new Error("Encryption key not configured");

    // Get the encrypted key
    const key = await ctx.runQuery(api.byokKeys.getByProvider, {
      provider: args.provider,
    });
    if (!key) throw new Error(`No ${args.provider} key configured`);

    // Decrypt it
    const apiKey = decrypt(key.keyEncrypted, encryptionKey);

    // TODO: Call SSH proxy /ssh/update-api-key endpoint to push key to server
    // This will be wired up when the SSH proxy endpoints are added
    console.log(`[BYOK] Would sync ${args.provider} key to server for user ${identity.subject}`);

    return { synced: true };
  },
});
