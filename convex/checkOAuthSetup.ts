/**
 * Check OAuth Setup - Diagnostics Tool
 *
 * Run this to verify your OAuth integration setup is correct
 *
 * Usage: npx convex run checkOAuthSetup:default --arg blueprintSlug=github
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

export default query({
  args: {
    blueprintSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const results: any = {
      blueprintSlug: args.blueprintSlug,
      timestamp: new Date().toISOString(),
      checks: [],
      status: "unknown",
    };

    // Check 1: Blueprint exists
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", args.blueprintSlug))
      .first();

    if (!blueprint) {
      results.checks.push({
        name: "Blueprint Exists",
        status: "❌ FAIL",
        message: `Blueprint "${args.blueprintSlug}" not found in database`,
        fix: `Run: npx convex run seedGitHubBlueprint:default`,
      });
      results.status = "FAILED";
      return results;
    }

    results.checks.push({
      name: "Blueprint Exists",
      status: "✅ PASS",
      message: `Found blueprint: ${blueprint.name} (v${blueprint.version})`,
      blueprintId: blueprint._id,
    });

    // Check 2: Blueprint is active
    if (blueprint.status !== "active") {
      results.checks.push({
        name: "Blueprint Active",
        status: "⚠️ WARN",
        message: `Blueprint status is "${blueprint.status}" (should be "active")`,
      });
    } else {
      results.checks.push({
        name: "Blueprint Active",
        status: "✅ PASS",
        message: "Blueprint is active",
      });
    }

    // Check 3: Auth type is OAuth2
    if (blueprint.authType !== "oauth2") {
      results.checks.push({
        name: "Auth Type",
        status: "⚠️ WARN",
        message: `Auth type is "${blueprint.authType}" (expected "oauth2")`,
      });
    } else {
      results.checks.push({
        name: "Auth Type",
        status: "✅ PASS",
        message: "Auth type is oauth2",
      });
    }

    // Check 4: Auth config is valid
    let authConfig: any;
    try {
      authConfig = JSON.parse(blueprint.authConfig);

      const requiredFields = ["clientId", "clientSecret", "authorizeUrl", "tokenUrl"];
      const missingFields = requiredFields.filter((field) => !authConfig[field]);

      if (missingFields.length > 0) {
        results.checks.push({
          name: "Auth Config",
          status: "❌ FAIL",
          message: `Missing required fields: ${missingFields.join(", ")}`,
          authConfig: authConfig,
          fix: "Update blueprint.authConfig with missing OAuth2 fields",
        });
      } else {
        results.checks.push({
          name: "Auth Config",
          status: "✅ PASS",
          message: "All required OAuth2 fields present",
          authConfig: {
            clientId: authConfig.clientId,
            clientSecret: authConfig.clientSecret.substring(0, 8) + "...",
            authorizeUrl: authConfig.authorizeUrl,
            tokenUrl: authConfig.tokenUrl,
            scopes: authConfig.scopes,
          },
        });
      }
    } catch (e) {
      results.checks.push({
        name: "Auth Config",
        status: "❌ FAIL",
        message: "authConfig is not valid JSON",
        error: String(e),
      });
    }

    // Check 5: Environment variables
    const hasEncryptionKey = !!process.env.INTEGRATION_ENCRYPTION_KEY;
    const hasConvexUrl = !!process.env.CONVEX_SITE_URL;

    if (!hasEncryptionKey) {
      results.checks.push({
        name: "Encryption Key",
        status: "❌ FAIL",
        message: "INTEGRATION_ENCRYPTION_KEY not set",
        fix: "Add INTEGRATION_ENCRYPTION_KEY to Convex environment variables",
      });
    } else {
      results.checks.push({
        name: "Encryption Key",
        status: "✅ PASS",
        message: "INTEGRATION_ENCRYPTION_KEY is configured",
      });
    }

    if (!hasConvexUrl) {
      results.checks.push({
        name: "Convex Site URL",
        status: "⚠️ WARN",
        message: "CONVEX_SITE_URL not set (will use default)",
      });
    } else {
      results.checks.push({
        name: "Convex Site URL",
        status: "✅ PASS",
        message: `CONVEX_SITE_URL: ${process.env.CONVEX_SITE_URL}`,
      });
    }

    // Check 6: Tools exist
    const tools = await ctx.db
      .query("blueprintTools")
      .withIndex("by_blueprint", (q) => q.eq("blueprintId", blueprint._id))
      .collect();

    if (tools.length === 0) {
      results.checks.push({
        name: "Tools Defined",
        status: "⚠️ WARN",
        message: "No tools defined for this blueprint",
        fix: "Run seedGitHubBlueprint or add tools manually",
      });
    } else {
      const activeTools = tools.filter((t) => t.status === "active");
      results.checks.push({
        name: "Tools Defined",
        status: "✅ PASS",
        message: `${activeTools.length} active tools (${tools.length} total)`,
        tools: activeTools.map((t) => ({
          name: t.name,
          displayName: t.displayName,
          method: t.method,
          path: t.path,
        })),
      });
    }

    // Check 7: Existing connections
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_blueprint_user", (q) => q.eq("blueprintId", blueprint._id))
      .collect();

    if (connections.length === 0) {
      results.checks.push({
        name: "User Connections",
        status: "ℹ️ INFO",
        message: "No users have connected this integration yet",
      });
    } else {
      const activeConnections = connections.filter((c) => c.status === "active");
      results.checks.push({
        name: "User Connections",
        status: "ℹ️ INFO",
        message: `${activeConnections.length} active connections (${connections.length} total)`,
        connections: connections.map((c) => ({
          userId: c.userId,
          status: c.status,
          connectedAt: new Date(c.connectedAt).toISOString(),
          expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
          lastError: c.lastError,
        })),
      });
    }

    // Overall status
    const hasFailures = results.checks.some((c: any) => c.status.includes("FAIL"));
    const hasWarnings = results.checks.some((c: any) => c.status.includes("WARN"));

    if (hasFailures) {
      results.status = "FAILED - Fix errors above";
    } else if (hasWarnings) {
      results.status = "WARNING - Check warnings above";
    } else {
      results.status = "✅ ALL CHECKS PASSED - OAuth should work!";
    }

    // Add next steps
    if (results.status.includes("PASSED")) {
      results.nextSteps = [
        "1. Test OAuth flow using TEST-GITHUB-OAUTH-DEBUG.html",
        "2. Or test in app: http://localhost:5173/integrations",
        "3. Click 'Connect' and authorize on GitHub",
        "4. Popup should close automatically",
      ];
    }

    return results;
  },
});
