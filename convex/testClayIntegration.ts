"use node";

/**
 * Test Clay integration end-to-end.
 *
 * Pushes a test row into a Clay table via our execution engine,
 * verifying that: blueprint resolves, connection is found, API key auth works,
 * and Clay accepts the webhook payload.
 *
 * Usage:
 *   npx convex run testClayIntegration '{"userId":"<YOUR_CLERK_USER_ID>","webhookId":"pull-in-data-from-a-webhook-f2081e27-6a6a-462e-8932-89f081bf778b"}' --url https://beloved-squirrel-599.convex.cloud
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export default action({
  args: {
    userId: v.string(),
    webhookId: v.string(),
  },
  handler: async (ctx, args) => {
    const results: Array<{ test: string; status: "pass" | "fail"; detail: string }> = [];

    // ── Test 1: Blueprint exists and is active ────────────────────────────
    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, { slug: "clay" });

    if (!blueprint || blueprint.status !== "active") {
      results.push({ test: "Blueprint exists", status: "fail", detail: "Clay blueprint not found or inactive" });
      return { success: false, results };
    }
    results.push({ test: "Blueprint exists", status: "pass", detail: `id=${blueprint._id}, authType=${blueprint.authType}` });

    // ── Test 2: Tools are registered ──────────────────────────────────────
    const tools = await ctx.runQuery(api.blueprintTools.listByBlueprint, { blueprintId: blueprint._id });
    const toolNames = tools.map((t) => t.name);
    const expectedTools = ["push_to_table", "run_table", "enrich_person", "enrich_company"];
    const missingTools = expectedTools.filter((n) => !toolNames.includes(n));

    if (missingTools.length > 0) {
      results.push({ test: "Tools registered", status: "fail", detail: `Missing: ${missingTools.join(", ")}` });
    } else {
      results.push({ test: "Tools registered", status: "pass", detail: `${tools.length} tools: ${toolNames.join(", ")}` });
    }

    // ── Test 3: Connection exists for user ────────────────────────────────
    const connection = await ctx.runQuery(api.connections.getForExecution, {
      blueprintId: blueprint._id,
      userId: args.userId,
    });

    if (!connection || connection.status === "disconnected") {
      results.push({ test: "Connection exists", status: "fail", detail: "No active Clay connection for this user. Connect first via Integrations page." });
      return { success: false, results };
    }
    results.push({ test: "Connection exists", status: "pass", detail: `status=${connection.status}` });

    // ── Test 4: Push test data to Clay table via webhook ──────────────────
    const testData = {
      name: "MissionControl Test",
      email: "test@missioncontrol.dev",
      company: "MissionControl",
      source: "integration-test",
      timestamp: new Date().toISOString(),
    };

    try {
      const pushResult = await ctx.runAction(api.executionEngine.executeTool, {
        userId: args.userId,
        agentName: "IntegrationTest",
        blueprintSlug: "clay",
        toolName: "push_to_table",
        toolArgs: {
          webhook_id: args.webhookId,
          ...testData,
        },
      });

      if (pushResult.success) {
        results.push({
          test: "Push to table (webhook)",
          status: "pass",
          detail: `Data pushed successfully. Response: ${JSON.stringify(pushResult.result).substring(0, 200)}`,
        });
      } else {
        results.push({
          test: "Push to table (webhook)",
          status: "fail",
          detail: `${pushResult.error}: ${pushResult.details || ""}`,
        });
      }
    } catch (err: any) {
      results.push({
        test: "Push to table (webhook)",
        status: "fail",
        detail: err.message,
      });
    }

    // ── Summary ───────────────────────────────────────────────────────────
    const passed = results.filter((r) => r.status === "pass").length;
    const failed = results.filter((r) => r.status === "fail").length;

    return {
      success: failed === 0,
      summary: `${passed}/${results.length} tests passed`,
      results,
    };
  },
});
