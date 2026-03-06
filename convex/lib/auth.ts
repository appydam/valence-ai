/**
 * Authentication middleware for HTTP endpoints.
 * Supports two auth modes:
 * 1. Clerk JWT (frontend) — via Authorization: Bearer <token>
 * 2. API key (agents/external) — via X-API-Key header
 */

import { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";

export type AuthResult = {
  userId: string;       // Clerk ID
  role: string;         // "admin" | "member" | "viewer" | "agent"
  authMethod: "jwt" | "api_key";
  permissions?: string[]; // API key permissions (e.g., ["tasks:read", "tasks:write"])
};

/**
 * Authenticate a request using Clerk JWT or API key.
 * Returns null if authentication fails.
 */
export async function authenticateRequest(
  ctx: ActionCtx,
  request: Request,
): Promise<AuthResult | null> {
  // Mode 1: Clerk JWT (frontend sends Authorization: Bearer <jwt>)
  // Convex automatically validates the JWT if it's in the Authorization header
  // and matches the auth.config.ts provider
  try {
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      // Look up the user to get their role
      const user = await ctx.runQuery(api.users.getUserByClerkId, {
        clerkId: identity.subject,
      });
      return {
        userId: identity.subject,
        role: user?.role ?? "member",
        authMethod: "jwt",
      };
    }
  } catch {
    // JWT validation failed — try API key
  }

  // Mode 2: API key (agents send X-API-Key: vk_live_...)
  const apiKey = request.headers.get("X-API-Key");
  if (apiKey) {
    const keyResult = await ctx.runQuery(api.apiKeys.validateKey, {
      key: apiKey,
    });
    if (keyResult) {
      return {
        userId: keyResult.userId,
        role: keyResult.role,
        authMethod: "api_key",
        permissions: keyResult.permissions,
      };
    }
  }

  return null;
}

/**
 * Check if an authenticated user has a specific permission.
 * - JWT users (frontend) always have full permissions.
 * - API key users with an empty permissions array have full permissions (backward-compatible).
 * - API key users with a non-empty permissions array must have the specific permission.
 */
export function hasPermission(auth: AuthResult, permission: string): boolean {
  // JWT-authenticated users (frontend) always have full access based on role
  if (auth.authMethod === "jwt") return true;

  // API key with no permissions array or empty array = full access (backward-compatible)
  if (!auth.permissions || auth.permissions.length === 0) return true;

  // Check for specific permission or wildcard
  return auth.permissions.includes(permission) || auth.permissions.includes("*");
}

/**
 * Build CORS headers with configurable origin.
 * Reads ALLOWED_ORIGIN from env var, defaults to "*" for backwards compat.
 */
export function buildCorsHeaders(request?: Request): Record<string, string> {
  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? "*";
  const requestOrigin = request?.headers.get("Origin") ?? "";

  // If ALLOWED_ORIGIN is set, validate the request origin
  let origin: string;
  if (allowedOrigin === "*") {
    origin = "*";
  } else {
    // Support comma-separated list of origins
    const origins = allowedOrigin.split(",").map((o) => o.trim());
    origin = origins.includes(requestOrigin) ? requestOrigin : origins[0];
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
  };
}
