"use node";

/**
 * AES-256-GCM symmetric encryption for secure credential storage
 * Uses Node.js crypto module (available in Convex actions)
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Encrypt plaintext using AES-256-GCM
 * @param plaintext - String to encrypt
 * @param keyHex - 32-byte hex string encryption key
 * @returns Base64-encoded string: iv + ciphertext + authTag
 */
export function encrypt(plaintext: string, keyHex: string): string {
  if (!plaintext) throw new Error("Plaintext is required");
  if (!keyHex) throw new Error("Encryption key is required");

  const key = Buffer.from(keyHex, "hex");
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex chars)`);
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Concatenate: iv + ciphertext + authTag
  const combined = Buffer.concat([
    iv,
    Buffer.from(encrypted, "base64"),
    authTag,
  ]);

  return combined.toString("base64");
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param ciphertext - Base64-encoded encrypted data
 * @param keyHex - 32-byte hex string encryption key
 * @returns Decrypted plaintext
 */
export function decrypt(ciphertext: string, keyHex: string): string {
  if (!ciphertext) throw new Error("Ciphertext is required");
  if (!keyHex) throw new Error("Decryption key is required");

  const key = Buffer.from(keyHex, "hex");
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Decryption key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex chars)`);
  }

  const combined = Buffer.from(ciphertext, "base64");

  // Extract components: iv + ciphertext + authTag
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.toString("base64"), "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Encrypt credentials object (OAuth tokens, API keys, etc.)
 * @param credentials - Object to encrypt
 * @param keyHex - 32-byte hex string encryption key
 * @returns Base64-encoded encrypted JSON
 */
export function encryptCredentials(
  credentials: Record<string, any>,
  keyHex: string
): string {
  const json = JSON.stringify(credentials);
  return encrypt(json, keyHex);
}

/**
 * Decrypt credentials object
 * @param encrypted - Base64-encoded encrypted JSON
 * @param keyHex - 32-byte hex string encryption key
 * @returns Decrypted credentials object
 */
export function decryptCredentials(
  encrypted: string,
  keyHex: string
): Record<string, any> {
  const json = decrypt(encrypted, keyHex);
  return JSON.parse(json);
}
