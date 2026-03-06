import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import {
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
} from "lucide-react";

const AGENT_NAMES: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost", "Sentinel"];

const statusDot: Record<string, string> = {
  online: "bg-status-online",
  working: "bg-status-working animate-pulse",
  idle: "bg-status-idle",
  offline: "bg-status-offline",
};

const statusLabel: Record<string, string> = {
  online: "Online",
  working: "Working",
  idle: "Idle",
  offline: "Offline",
};

function MetricBar({ label, value, max, unit, warn, danger }: {
  label: string;
  value: number;
  max: number;
  unit: string;
  warn?: number;
  danger?: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const color =
    danger && pct >= danger ? "bg-destructive" :
    warn && pct >= warn ? "bg-amber-500" :
    "bg-status-online";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-[11px] font-mono text-foreground">{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function IntegrationChip({ slug, connected }: { slug: string; connected: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
      connected
        ? "bg-status-online/10 text-status-online border-status-online/20"
        : "bg-destructive/10 text-destructive border-destructive/20"
    }`}>
      {connected ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
      {slug}
    </span>
  );
}

export default function AgentHealth() {
  const userId = useCurrentUserId();
  const agents = useQuery(api.agents.listWithActivity) ?? [];
  const tasks = useQuery(api.tasks.list, {}) ?? [];
  const connections = useQuery(api.connections.listByUser, { userId }) ?? [];
  const blueprints = useQuery(api.blueprints.list, { status: "active" }) ?? [];
  const integrationLogs = useQuery(api.integrationActivity.list, { limit: 200 }) ?? [];

  const [expandedAgent, setExpandedAgent] = useState<AgentName | null>(null);

  // Build slug → blueprint name map
  const slugMap = Object.fromEntries(blueprints.map((b: any) => [b.slug, b.name ?? b.slug]));

  // Active connection slugs for user
  const activeConnectionSlugs = new Set(
    connections
      .filter((c: any) => c.status === "active")
      .map((c: any) => {
        const bp = blueprints.find((b: any) => b._id === c.blueprintId);
        return bp?.slug;
      })
      .filter(Boolean)
  );

  // Per-agent derived data
  const agentData = AGENT_NAMES.map((name) => {
    const agent = agents.find((a: any) => a.name === name);
    const agentTasks = tasks.filter((t: any) => t.assignee === name);
    const activeTasks = agentTasks.filter((t: any) => ["assigned", "in_progress", "in_review"].includes(t.status));
    const doneTasks = agentTasks.filter((t: any) => t.status === "done");
    const escalatedTasks = agentTasks.filter((t: any) => (t.iterationCount ?? 0) > (t.maxIterations ?? 3));

    // Integrations this agent has used (from recent tasks' requiredIntegrations)
    const requiredSlugs = new Set<string>(
      agentTasks.flatMap((t: any) => t.requiredIntegrations ?? [])
    );

    // Recent integration calls for this agent
    const recentCalls = integrationLogs.filter((l: any) => l.agentName === name).slice(0, 5);
    const failedCalls = recentCalls.filter((l: any) => l.status !== "success");

    // Use lastSeen = max(lastHeartbeat, lastComment, lastActivity) for true last-active time.
    // Agents often crash before sending idle heartbeat — comments/activity don't lie.
    const lastSeen: number = (agent as any)?.lastSeen ?? agent?.lastHeartbeat ?? 0;
    const lastSeenAgoMin = lastSeen > 0 ? Math.floor((Date.now() - lastSeen) / 60000) : null;
    const isStale = lastSeenAgoMin !== null && lastSeenAgoMin > 5 && agent?.status !== "offline";

    return {
      name,
      agent,
      activeTasks,
      doneTasks,
      escalatedTasks,
      requiredSlugs,
      recentCalls,
      failedCalls,
      lastSeenAgoMin,
      isStale,
      config: AGENT_CONFIG[name],
    };
  });

  // Summary counts
  const onlineCount = agents.filter((a: any) => ["online", "working", "idle"].includes(a.status)).length;
  const staleCount = agentData.filter((d) => d.isStale).length;
  const escalatedCount = agentData.reduce((sum, d) => sum + d.escalatedTasks.length, 0);
  const totalActive = agentData.reduce((sum, d) => sum + d.activeTasks.length, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Health</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time status, integration connectivity, and task throughput per agent
          </p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Agents Online", value: onlineCount, icon: Activity, color: "text-status-online" },
            { label: "Active Tasks", value: totalActive, icon: Zap, color: "text-primary" },
            { label: "Stale Heartbeats", value: staleCount, icon: Clock, color: staleCount > 0 ? "text-amber-500" : "text-muted-foreground" },
            { label: "Escalated Tasks", value: escalatedCount, icon: AlertTriangle, color: escalatedCount > 0 ? "text-destructive" : "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Per-agent cards */}
        <div className="space-y-3">
          {agentData.map((d) => {
            const isExpanded = expandedAgent === d.name;
            const metrics = d.agent?.serverMetrics;

            return (
              <div key={d.name} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Card header — always visible */}
                <button
                  onClick={() => setExpandedAgent(isExpanded ? null : d.name)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors text-left"
                >
                  {/* Agent identity */}
                  <span className="text-2xl shrink-0">{d.config.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{d.config.role}</span>
                      {d.isStale && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          stale
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-muted-foreground">
                        {d.lastSeenAgoMin !== null
                          ? d.lastSeenAgoMin < 1 ? "just now" : `${d.lastSeenAgoMin}m ago`
                          : "never"}
                      </span>
                      {d.escalatedTasks.length > 0 && (
                        <span className="text-[10px] text-destructive flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {d.escalatedTasks.length} escalated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${statusDot[d.agent?.status ?? "offline"]}`} />
                    <span className="text-xs text-muted-foreground">{statusLabel[d.agent?.status ?? "offline"]}</span>
                  </div>

                  {/* Task counts */}
                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                    <span><span className="font-medium text-foreground">{d.activeTasks.length}</span> active</span>
                    <span><span className="font-medium text-foreground">{d.doneTasks.length}</span> done</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-5 bg-accent/10">
                    <div className="grid grid-cols-2 gap-5">
                      {/* Server metrics */}
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                          <Cpu className="w-3 h-3" /> Server Metrics
                        </p>
                        {metrics ? (
                          <div className="space-y-3">
                            <MetricBar label="CPU" value={metrics.cpuPercent} max={100} unit="%" warn={70} danger={90} />
                            <MetricBar label="Memory" value={metrics.memoryUsedMb} max={metrics.memoryTotalMb} unit="MB" warn={80} danger={95} />
                            <MetricBar label="Disk" value={metrics.diskUsedGb} max={metrics.diskTotalGb} unit="GB" warn={80} danger={95} />
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Load (1m)</span>
                              <span className="text-[11px] font-mono text-foreground">{metrics.loadAvg1m.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Uptime</span>
                              <span className="text-[11px] font-mono text-foreground">
                                {Math.floor(metrics.uptimeSeconds / 3600)}h {Math.floor((metrics.uptimeSeconds % 3600) / 60)}m
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No server metrics — agent hasn't reported yet</p>
                        )}
                      </div>

                      {/* Integrations */}
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Integrations Used by This Agent
                        </p>
                        {d.requiredSlugs.size > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from(d.requiredSlugs).map((slug) => (
                              <IntegrationChip
                                key={slug}
                                slug={slugMap[slug] ?? slug}
                                connected={activeConnectionSlugs.has(slug)}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No integrations required by tasks</p>
                        )}

                        {/* Recent API calls */}
                        {d.recentCalls.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" /> Recent Calls
                            </p>
                            <div className="space-y-1">
                              {d.recentCalls.map((log: any) => (
                                <div key={log._id} className="flex items-center gap-2 text-[11px]">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === "success" ? "bg-status-online" : "bg-destructive"}`} />
                                  <span className="font-mono text-muted-foreground shrink-0">{log.integrationType}</span>
                                  <span className="text-foreground truncate flex-1">{log.toolName}</span>
                                  <span className="text-muted-foreground shrink-0">{getRelativeTime(log.timestamp)}</span>
                                </div>
                              ))}
                            </div>
                            {d.failedCalls.length > 0 && (
                              <p className="text-[10px] text-destructive mt-2 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> {d.failedCalls.length} failed call{d.failedCalls.length > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active tasks list */}
                    {d.activeTasks.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Active Tasks</p>
                        <div className="space-y-1">
                          {d.activeTasks.map((t: any) => (
                            <div key={t._id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-xs">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                t.status === "in_review" ? "bg-primary" :
                                t.status === "in_progress" ? "bg-status-working animate-pulse" :
                                "bg-muted-foreground"
                              }`} />
                              <span className="text-foreground truncate flex-1">{t.title}</span>
                              <span className="text-muted-foreground shrink-0">{t.status.replace("_", " ")}</span>
                              {(t.iterationCount ?? 0) > 0 && (
                                <span className="text-amber-500 shrink-0 text-[10px]">
                                  rev {t.iterationCount}/{t.maxIterations ?? 3}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
