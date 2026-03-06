import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Thresholds for alerts
const THRESHOLDS = {
  cpuPercent: 85,
  memoryPercent: 90,
  diskPercent: 90,
  heartbeatStaleMs: 5 * 60 * 1000, // 5 minutes without heartbeat
};

export const getServerHealth = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const now = Date.now();

    const health = agents.map((agent) => {
      const alerts: string[] = [];
      const metrics = agent.serverMetrics;
      const heartbeatAge = now - agent.lastHeartbeat;

      // Check heartbeat staleness
      if (heartbeatAge > THRESHOLDS.heartbeatStaleMs) {
        alerts.push(`No heartbeat for ${Math.round(heartbeatAge / 60000)}m`);
      }

      if (metrics) {
        // CPU alert
        if (metrics.cpuPercent > THRESHOLDS.cpuPercent) {
          alerts.push(`CPU at ${metrics.cpuPercent.toFixed(1)}%`);
        }
        // Memory alert
        const memPercent = (metrics.memoryUsedMb / metrics.memoryTotalMb) * 100;
        if (memPercent > THRESHOLDS.memoryPercent) {
          alerts.push(`Memory at ${memPercent.toFixed(1)}%`);
        }
        // Disk alert
        const diskPercent = (metrics.diskUsedGb / metrics.diskTotalGb) * 100;
        if (diskPercent > THRESHOLDS.diskPercent) {
          alerts.push(`Disk at ${diskPercent.toFixed(1)}%`);
        }
      }

      return {
        name: agent.name,
        status: agent.status,
        lastHeartbeat: agent.lastHeartbeat,
        heartbeatAge,
        metrics: metrics ?? null,
        alerts,
        healthy: alerts.length === 0,
      };
    });

    const overall = {
      totalAgents: health.length,
      healthyAgents: health.filter((h) => h.healthy).length,
      totalAlerts: health.reduce((sum, h) => sum + h.alerts.length, 0),
      agents: health,
    };

    return overall;
  },
});

// Internal mutation to log health alerts (called by cron)
export const checkAndLogAlerts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    const now = Date.now();

    for (const agent of agents) {
      const heartbeatAge = now - agent.lastHeartbeat;
      const alerts: string[] = [];

      if (heartbeatAge > THRESHOLDS.heartbeatStaleMs) {
        alerts.push(`No heartbeat for ${Math.round(heartbeatAge / 60000)}m`);
      }

      if (agent.serverMetrics) {
        const m = agent.serverMetrics;
        if (m.cpuPercent > THRESHOLDS.cpuPercent) alerts.push(`CPU ${m.cpuPercent.toFixed(1)}%`);
        const memPct = (m.memoryUsedMb / m.memoryTotalMb) * 100;
        if (memPct > THRESHOLDS.memoryPercent) alerts.push(`Memory ${memPct.toFixed(1)}%`);
        const diskPct = (m.diskUsedGb / m.diskTotalGb) * 100;
        if (diskPct > THRESHOLDS.diskPercent) alerts.push(`Disk ${diskPct.toFixed(1)}%`);
      }

      if (alerts.length > 0) {
        await ctx.db.insert("activity", {
          agentName: agent.name,
          action: "health_alert",
          details: alerts.join("; "),
          timestamp: now,
        });
      }
    }
  },
});
