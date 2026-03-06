"use node";

/**
 * Customer Data Export — generates a JSON dump of all customer data.
 * Admin-only action. Returns a structured export for compliance/portability.
 */

import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const exportAllData = action({
  args: {},
  handler: async (ctx) => {
    // Gather all tables
    const [
      agents,
      tasks,
      users,
      activity,
      comments,
      missions,
      agentConfigs,
      soulFiles,
      agentMemory,
      blueprints,
      webhookEndpoints,
      webhookEvents,
      automationRules,
    ] = await Promise.all([
      ctx.runQuery(api.agents.list),
      ctx.runQuery(api.tasks.list, {}),
      ctx.runQuery(api.users.listTeamMembers),
      ctx.runQuery(api.activityFns.list, {}),
      ctx.runQuery(api.comments.list, {}),
      ctx.runQuery(api.missions.list),
      ctx.runQuery(api.agentConfigs.list),
      ctx.runQuery(api.soulFiles.list),
      ctx.runQuery(api.agentMemory.listAll, {}),
      ctx.runQuery(api.blueprints.list, {}),
      ctx.runQuery(api.webhookEndpoints.list, { userId: "" }),
      ctx.runQuery(api.webhookReceiver.listEvents, { limit: 500 }),
      ctx.runQuery(api.automationRules.list, { endpointId: undefined as any }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      data: {
        agents,
        tasks,
        users: users.map((u: any) => ({
          ...u,
          // Strip sensitive fields
          clerkId: undefined,
        })),
        activity,
        comments,
        missions,
        agentConfigs,
        soulFiles,
        agentMemory,
        blueprints: blueprints.map((b: any) => ({
          ...b,
          // Strip OAuth secrets
          oauth2Config: b.oauth2Config
            ? { ...b.oauth2Config, clientSecret: "[REDACTED]" }
            : undefined,
        })),
        webhookEndpoints: webhookEndpoints.map((e: any) => ({
          ...e,
          secret: "[REDACTED]",
        })),
        webhookEvents,
        automationRules,
      },
    };

    return exportData;
  },
});
