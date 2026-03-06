"use node";

import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import { encrypt, decrypt } from "./lib/crypto";

/**
 * Save SSH config with encrypted private key.
 * Encrypts the private key using AES-256-GCM before storing.
 * Falls back to plaintext storage if INTEGRATION_ENCRYPTION_KEY is not set.
 */
export const saveEncrypted = action({
  args: {
    host: v.string(),
    port: v.number(),
    username: v.string(),
    privateKey: v.string(),
  },
  handler: async (ctx, args) => {
    const encryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY;

    let keyToStore = args.privateKey;
    let isEncrypted = false;

    if (encryptionKey) {
      keyToStore = encrypt(args.privateKey, encryptionKey);
      isEncrypted = true;
    }

    return await ctx.runMutation(api.sshConfig.save, {
      host: args.host,
      port: args.port,
      username: args.username,
      privateKey: keyToStore,
      encrypted: isEncrypted,
    });
  },
});

/**
 * Get SSH config with decrypted private key.
 * Transparently handles both encrypted and legacy plaintext keys.
 */
export const getDecrypted = action({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.runQuery(internal.sshConfig.getInternal, {});
    if (!config) return null;

    let privateKey = config.privateKey;

    // Decrypt if the key is marked as encrypted
    if (config.encrypted && privateKey) {
      const encryptionKey = process.env.INTEGRATION_ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error("INTEGRATION_ENCRYPTION_KEY not set — cannot decrypt SSH private key");
      }
      privateKey = decrypt(privateKey, encryptionKey);
    }

    return {
      host: config.host,
      port: config.port,
      username: config.username,
      privateKey,
    };
  },
});
