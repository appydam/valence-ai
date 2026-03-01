"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { encrypt, decrypt, encryptCredentials, decryptCredentials } from "./lib/crypto";
import crypto from "crypto";

/**
 * OAuth and API key connection actions (Node runtime for crypto)
 *
 * All provider-specific behaviour is driven by authConfig in the blueprint:
 *   - scopeSeparator: "space" (default) | "comma"
 *   - extraAuthParams: {} — additional params for authorization URL
 *   - extraTokenParams: {} — additional params for token exchange
 *   - tokenEndpointAuth: "body" (default) | "header" (Basic auth for token endpoint)
 *   - pkce: boolean — enable PKCE flow (future)
 */

/**
 * Resolve the client secret from either a direct value or an env var reference.
 */
function resolveClientSecret(clientSecret: string): string {
  if (clientSecret && clientSecret.startsWith("OAUTH_SECRET_")) {
    const envValue = process.env[clientSecret];
    if (!envValue) {
      throw new Error(`Environment variable ${clientSecret} not found`);
    }
    return envValue;
  }
  return clientSecret;
}

export const startOAuth = action({
  args: {
    blueprintSlug: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, {
      slug: args.blueprintSlug,
    });

    if (!blueprint || blueprint.authType !== "oauth2") {
      throw new Error(`Blueprint "${args.blueprintSlug}" not found or not OAuth2`);
    }

    // Use enterprise custom OAuth config if set, otherwise fall back to default
    const authConfig = JSON.parse(blueprint.customAuthConfig || blueprint.authConfig);

    // Validate client secret can be resolved
    if (authConfig.clientSecret) {
      resolveClientSecret(authConfig.clientSecret);
    }

    if (!authConfig.clientId || !authConfig.authorizeUrl) {
      throw new Error("OAuth configuration incomplete: missing clientId or authorizeUrl");
    }

    // Generate a short random state token and store payload server-side.
    const token = crypto.randomBytes(16).toString("hex"); // 32 hex chars

    // PKCE: Generate code_verifier and code_challenge if blueprint uses PKCE
    // Twitter/X requires PKCE — without code_challenge the auth page loops forever.
    let codeVerifier: string | undefined;
    if (authConfig.usePKCE) {
      // code_verifier: 43-128 char random URL-safe string
      codeVerifier = crypto.randomBytes(32)
        .toString("base64url")
        .slice(0, 64);
    }

    await ctx.runMutation(api.connections.saveOAuthState, {
      token,
      blueprintSlug: args.blueprintSlug,
      userId: args.userId,
      codeVerifier,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Build callback URL - use CONVEX_SITE_URL env var
    const convexSiteUrl = process.env.CONVEX_SITE_URL || "https://beloved-squirrel-599.convex.site";
    const redirectUri = `${convexSiteUrl}/api/integrations/oauth/callback`;

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: authConfig.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state: token,
    });

    // PKCE: Add code_challenge to authorize URL
    if (codeVerifier) {
      const codeChallenge = crypto.createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");
      params.set("code_challenge", codeChallenge);
      params.set("code_challenge_method", "S256");
    }

    // Add provider-specific authorization parameters (e.g. audience, prompt, login_hint)
    if (authConfig.extraAuthParams) {
      Object.entries(authConfig.extraAuthParams).forEach(([key, value]) => {
        params.set(key, String(value));
      });
    }

    // Build scope string — appended raw to avoid URLSearchParams encoding.
    // URLSearchParams encodes spaces as + and commas as %2C, both of which break
    // providers like Zoho. Scope names only contain letters, dots, and underscores
    // which are all URL-safe, so no encoding is needed at all.
    let scopeSuffix = "";
    if (authConfig.scopes) {
      const separator = authConfig.scopeSeparator === "comma" ? "," : " ";
      const scopeString = Array.isArray(authConfig.scopes)
        ? authConfig.scopes.join(separator)
        : authConfig.scopes;
      scopeSuffix = `&scope=${scopeString}`;
    }

    const authorizeUrl = `${authConfig.authorizeUrl}?${params.toString()}${scopeSuffix}`;

    return { authorizeUrl };
  },
});

export const handleOAuthCallback = action({
  args: {
    code: v.string(),
    state: v.string(),
  },
  handler: async (ctx, args) => {
    const encKey = process.env.INTEGRATION_ENCRYPTION_KEY!;

    // Look up state token from DB (stored server-side to keep OAuth URLs short)
    const stateRecord = await ctx.runQuery(api.connections.getOAuthState, {
      token: args.state,
    });

    if (!stateRecord) {
      throw new Error("Invalid or expired state parameter - please try connecting again");
    }

    if (Date.now() > stateRecord.expiresAt) {
      throw new Error("Authorization expired - please try connecting again");
    }

    const { blueprintSlug, userId, codeVerifier } = stateRecord;

    // Clean up used state token
    await ctx.runMutation(api.connections.deleteOAuthState, { token: args.state });

    // Fetch blueprint
    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, {
      slug: blueprintSlug,
    });

    if (!blueprint) {
      throw new Error(`Blueprint "${blueprintSlug}" not found`);
    }

    // Use enterprise custom OAuth config if set, otherwise fall back to default
    const authConfig = JSON.parse(blueprint.customAuthConfig || blueprint.authConfig);

    if (!authConfig.clientId || !authConfig.clientSecret || !authConfig.tokenUrl) {
      throw new Error("OAuth configuration incomplete: missing clientId, clientSecret, or tokenUrl");
    }

    // Build callback URL (must match the one used in startOAuth)
    const convexSiteUrl = process.env.CONVEX_SITE_URL || "https://beloved-squirrel-599.convex.site";
    const redirectUri = `${convexSiteUrl}/api/integrations/oauth/callback`;

    // Resolve client secret from environment variable if it's a reference
    const clientSecret = resolveClientSecret(authConfig.clientSecret);

    // Use the token URL from config directly — no provider-specific corrections
    const tokenUrl = authConfig.tokenUrl;

    // Build token exchange request — auth method is config-driven
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    };

    const bodyParams: Record<string, string> = {
      grant_type: "authorization_code",
      code: args.code,
      redirect_uri: redirectUri,
    };

    // PKCE: Send code_verifier in token exchange (required by Twitter/X)
    if (codeVerifier) {
      bodyParams.code_verifier = codeVerifier;
    }

    // Token endpoint auth: some providers want client_id/secret in body,
    // others want HTTP Basic auth in header. Config-driven via tokenEndpointAuth.
    if (authConfig.tokenEndpointAuth === "header") {
      const basicAuth = Buffer.from(`${authConfig.clientId}:${clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${basicAuth}`;
    } else {
      // Default: credentials in body (most common)
      bodyParams.client_id = authConfig.clientId;
      bodyParams.client_secret = clientSecret;
    }

    // Add provider-specific token exchange parameters (e.g. audience)
    if (authConfig.extraTokenParams) {
      Object.entries(authConfig.extraTokenParams).forEach(([key, value]) => {
        bodyParams[key] = String(value);
      });
    }

    console.log(`[OAuth] Token exchange:`, {
      url: tokenUrl,
      redirectUri,
      bodyParamKeys: Object.keys(bodyParams),
      authMethod: authConfig.tokenEndpointAuth || "body",
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers,
      body: new URLSearchParams(bodyParams),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`[OAuth] Token exchange failed: ${tokenResponse.status}`, {
        url: tokenUrl,
        status: tokenResponse.status,
        error: errorText.substring(0, 500),
      });
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText.substring(0, 200)}`);
    }

    // Try to parse as JSON, but handle HTML responses gracefully
    const responseText = await tokenResponse.text();
    let tokens;
    try {
      tokens = JSON.parse(responseText);
    } catch (e) {
      console.error(`[OAuth] Token response is not JSON:`, {
        url: tokenUrl,
        responseText: responseText.substring(0, 500),
        contentType: tokenResponse.headers.get("content-type"),
      });
      throw new Error(
        `Token endpoint returned non-JSON response. Check tokenUrl in blueprint authConfig. Response: ${responseText.substring(0, 200)}`
      );
    }

    // Handle providers that return 200 with error field (e.g. GitHub)
    if (tokens.error) {
      throw new Error(`Token exchange error: ${tokens.error} - ${tokens.error_description || ""}`);
    }

    if (!tokens.access_token) {
      throw new Error("No access token received from OAuth provider");
    }

    // Calculate expiration time
    const expiresIn = tokens.expires_in || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    // Build credentials object
    const credentials = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      tokenType: tokens.token_type || "Bearer",
      scope: tokens.scope,
    };

    // Encrypt credentials
    const credentialsEncrypted = encryptCredentials(credentials, encKey);

    // Store connection in database
    await ctx.runMutation(api.connections.upsert, {
      blueprintId: blueprint._id,
      userId,
      credentialsEncrypted,
      expiresAt,
    });

    return { success: true };
  },
});

export const connectApiKey = action({
  args: {
    blueprintSlug: v.string(),
    userId: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const encKey = process.env.INTEGRATION_ENCRYPTION_KEY!;

    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, {
      slug: args.blueprintSlug,
    });

    if (!blueprint) {
      throw new Error(`Blueprint "${args.blueprintSlug}" not found`);
    }

    if (
      blueprint.authType !== "api_key" &&
      blueprint.authType !== "bearer_token" &&
      blueprint.authType !== "basic_auth"
    ) {
      throw new Error(
        `Blueprint "${args.blueprintSlug}" requires ${blueprint.authType} auth, not API key`
      );
    }

    const credentials = { apiKey: args.apiKey };
    const credentialsEncrypted = encryptCredentials(credentials, encKey);

    await ctx.runMutation(api.connections.upsert, {
      blueprintId: blueprint._id,
      userId: args.userId,
      credentialsEncrypted,
    });

    return { success: true };
  },
});

export const refreshToken = action({
  args: { connectionId: v.id("connections") },
  handler: async (ctx, args) => {
    const encKey = process.env.INTEGRATION_ENCRYPTION_KEY!;

    const conn = await ctx.runQuery(api.connections.get, { id: args.connectionId });
    if (!conn) {
      throw new Error("Connection not found");
    }

    const blueprint = await ctx.runQuery(api.blueprints.get, { id: conn.blueprintId });
    if (!blueprint) {
      throw new Error("Blueprint not found");
    }

    // Use enterprise custom OAuth config if set, otherwise fall back to default
    const authConfig = JSON.parse(blueprint.customAuthConfig || blueprint.authConfig);
    const creds = decryptCredentials(conn.credentialsEncrypted, encKey);

    if (!creds.refreshToken) {
      throw new Error("No refresh token available");
    }

    const clientSecret = resolveClientSecret(authConfig.clientSecret);
    const tokenUrl = authConfig.tokenUrl;

    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    };

    const bodyParams: Record<string, string> = {
      grant_type: "refresh_token",
      refresh_token: creds.refreshToken,
    };

    // Token endpoint auth: same logic as handleOAuthCallback
    if (authConfig.tokenEndpointAuth === "header") {
      const basicAuth = Buffer.from(`${authConfig.clientId}:${clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${basicAuth}`;
    } else {
      bodyParams.client_id = authConfig.clientId;
      bodyParams.client_secret = clientSecret;
    }

    // Add provider-specific token refresh parameters
    if (authConfig.extraTokenParams) {
      Object.entries(authConfig.extraTokenParams).forEach(([key, value]) => {
        bodyParams[key] = String(value);
      });
    }

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers,
      body: new URLSearchParams(bodyParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      await ctx.runMutation(api.connections.markError, {
        id: args.connectionId,
        error: `Token refresh failed: ${response.status}`,
      });
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const responseText = await response.text();
    let tokens;
    try {
      tokens = JSON.parse(responseText);
    } catch {
      throw new Error(`Token refresh returned non-JSON: ${responseText.substring(0, 200)}`);
    }

    // Handle error-in-200 responses
    if (tokens.error) {
      await ctx.runMutation(api.connections.markError, {
        id: args.connectionId,
        error: `Token refresh error: ${tokens.error}`,
      });
      throw new Error(`Token refresh error: ${tokens.error} - ${tokens.error_description || ""}`);
    }

    const newCreds = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || creds.refreshToken,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      tokenType: tokens.token_type || "Bearer",
      scope: tokens.scope || creds.scope,
    };

    const credentialsEncrypted = encryptCredentials(newCreds, encKey);

    await ctx.runMutation(api.connections.upsert, {
      blueprintId: conn.blueprintId,
      userId: conn.userId,
      credentialsEncrypted,
      expiresAt: newCreds.expiresAt,
    });

    return { success: true };
  },
});
