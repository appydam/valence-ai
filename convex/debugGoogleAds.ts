/**
 * Debug Google Ads API — makes a direct test call to verify the connection.
 * Run from Convex dashboard to see exact request/response.
 */
"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const testDirect = action({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get the blueprint
    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, {
      slug: "google-ads",
    });

    if (!blueprint) return { error: "Blueprint not found" };

    // Show blueprint config
    const blueprintInfo = {
      baseUrl: blueprint.baseUrl,
      defaultHeaders: blueprint.defaultHeaders,
      authType: blueprint.authType,
    };

    // Get connection for this user
    const conn = await ctx.runQuery(api.connections.getForExecution, {
      blueprintId: blueprint._id,
      userId: args.userId,
    });

    if (!conn || conn.status !== "active") {
      return { error: "No active Google Ads connection found", blueprintInfo };
    }

    // Decrypt credentials
    const { decrypt } = await import("./lib/crypto");
    const encKey = process.env.INTEGRATION_ENCRYPTION_KEY;
    if (!encKey) return { error: "INTEGRATION_ENCRYPTION_KEY not set" };

    const creds = JSON.parse(decrypt(conn.credentialsEncrypted, encKey));
    const accessToken = creds.accessToken || creds.access_token;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    // Parse defaultHeaders from blueprint
    let defaultHeaders: Record<string, string> = {};
    try {
      if (blueprint.defaultHeaders) {
        defaultHeaders = JSON.parse(blueprint.defaultHeaders);
      }
    } catch {}

    // Make direct API call
    // Test multiple API versions to find which works
    const versions = ["v19", "v18", "v17", "v16"];
    const results: Array<{version: string, status: number, body: string}> = [];

    for (const ver of versions) {
      const testUrl = `https://googleads.googleapis.com/${ver}/customers:listAccessibleCustomers`;
      try {
        const r = await fetch(testUrl, { method: "GET", headers });
        const b = await r.text();
        results.push({ version: ver, status: r.status, body: b.substring(0, 300) });
        if (r.ok) break; // Found working version
      } catch (e: any) {
        results.push({ version: ver, status: 0, body: e.message });
      }
    }

    const url = `${blueprint.baseUrl}/customers:listAccessibleCustomers`;
    const headers: Record<string, string> = {
      ...defaultHeaders,
      "Authorization": `Bearer ${accessToken}`,
      "developer-token": developerToken || defaultHeaders["developer-token"] || "",
    };

    try {
      const resp = await fetch(url, { method: "GET", headers });
      const status = resp.status;
      const body = await resp.text();

      return {
        url,
        status,
        requestHeaders: Object.fromEntries(
          Object.entries(headers).map(([k, val]) => [
            k,
            k === "Authorization" ? "Bearer ***" : val,
          ])
        ),
        responseBody: body.substring(0, 2000),
        blueprintInfo,
        tokenExpiry: creds.expires_at || creds.expiry_date || "unknown",
        hasDeveloperToken: !!developerToken,
        defaultHeadersHasDevToken: !!defaultHeaders["developer-token"],
        versionTests: results,
      };
    } catch (err: any) {
      return { error: err.message, url, blueprintInfo };
    }
  },
});
