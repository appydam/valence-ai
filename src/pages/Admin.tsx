import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getRelativeTime } from "@/lib/time";
import {
  Shield,
  Users,
  Activity,
  Server,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  BarChart3,
  Zap,
  Webhook,
  Cpu,
  HardDrive,
  MemoryStick,
} from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color = "primary",
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: `hsl(var(--${color}))` }}
          />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-green-500",
    working: "bg-blue-500 animate-pulse",
    idle: "bg-yellow-500",
    offline: "bg-gray-400",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[status] || "bg-gray-400"}`}
    />
  );
}

export default function Admin() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const overview = useQuery(api.adminDashboard.getSystemOverview);
  const recentActivity = useQuery(api.adminDashboard.getRecentActivity);
  const recentTasks = useQuery(api.adminDashboard.getTasksOverview);
  const serverHealth = useQuery(api.serverHealth.getServerHealth);
  const exportData = useAction(api.dataExport.exportAllData);

  const [exporting, setExporting] = useState(false);

  // Admin gate
  if (currentUser && currentUser.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-2">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">
              Admin Access Required
            </h2>
            <p className="text-sm text-muted-foreground">
              This page is restricted to administrators.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mission-control-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    }
    setExporting(false);
  };

  if (!overview) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              System overview and operator controls
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting ? "Exporting..." : "Export All Data"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Agents Online"
            value={`${overview.agents.online}/${overview.agents.total}`}
            icon={Server}
            color="primary"
            sub={
              overview.agents.lastHeartbeat
                ? `Last heartbeat ${getRelativeTime(overview.agents.lastHeartbeat)}`
                : undefined
            }
          />
          <StatCard
            label="Active Tasks"
            value={overview.tasks.active}
            icon={Activity}
            color="primary"
            sub={`${overview.tasks.completed} completed total`}
          />
          <StatCard
            label="Team Members"
            value={overview.users.total}
            icon={Users}
            color="primary"
          />
          <StatCard
            label="Integrations"
            value={overview.integrations.activeConnections}
            icon={Zap}
            color="primary"
            sub={`${overview.integrations.activeEndpoints} webhook endpoints`}
          />
        </div>

        {/* Usage & Alerts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="API Calls (This Period)"
            value={overview.usage.totalApiCalls}
            icon={BarChart3}
          />
          <StatCard
            label="Agent Sessions"
            value={overview.usage.totalAgentSessions}
            icon={Activity}
          />
          <StatCard
            label="Dead Letters"
            value={overview.integrations.deadLetterCount}
            icon={Webhook}
            color={overview.integrations.deadLetterCount > 0 ? "destructive" : "primary"}
            sub={
              overview.integrations.deadLetterCount > 0
                ? "Check Webhooks → Dead Letters"
                : "All webhooks healthy"
            }
          />
        </div>

        {/* Agent Status + Task Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agents */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Agent Status
            </h2>
            <div className="space-y-3">
              {overview.agents.list.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <StatusDot status={agent.status} />
                    <span className="text-sm font-medium text-foreground">
                      {agent.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{agent.tasksCompleted} completed</span>
                    <span>
                      {agent.lastHeartbeat
                        ? getRelativeTime(agent.lastHeartbeat)
                        : "never"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Breakdown */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Tasks by Status
            </h2>
            <div className="space-y-2">
              {Object.entries(overview.tasks.byStatus)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([status, count]) => {
                  const colors: Record<string, string> = {
                    done: "bg-green-500",
                    in_progress: "bg-blue-500",
                    assigned: "bg-yellow-500",
                    in_review: "bg-purple-500",
                    inbox: "bg-gray-400",
                    cancelled: "bg-red-500",
                    blocked: "bg-orange-500",
                  };
                  const pct = overview.tasks.total
                    ? Math.round(((count as number) / overview.tasks.total) * 100)
                    : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground capitalize">
                          {status.replace("_", " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {count as number} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${colors[status] || "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Server Health */}
        {serverHealth && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Server Health
              </h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                serverHealth.totalAlerts > 0
                  ? "bg-red-500/10 text-red-500"
                  : "bg-green-500/10 text-green-500"
              }`}>
                {serverHealth.healthyAgents}/{serverHealth.totalAgents} healthy
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serverHealth.agents.map((agent) => (
                <div
                  key={agent.name}
                  className={`rounded-lg border p-3 space-y-2 ${
                    agent.healthy ? "border-border" : "border-red-500/50 bg-red-500/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{agent.name}</span>
                    {agent.healthy ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {agent.metrics ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <Cpu className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">CPU</span>
                        <div className="flex-1 h-1.5 rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${agent.metrics.cpuPercent > 85 ? "bg-red-500" : agent.metrics.cpuPercent > 60 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${Math.min(agent.metrics.cpuPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-foreground w-10 text-right">{agent.metrics.cpuPercent.toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <MemoryStick className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">RAM</span>
                        <div className="flex-1 h-1.5 rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${(agent.metrics.memoryUsedMb / agent.metrics.memoryTotalMb) > 0.9 ? "bg-red-500" : (agent.metrics.memoryUsedMb / agent.metrics.memoryTotalMb) > 0.7 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${(agent.metrics.memoryUsedMb / agent.metrics.memoryTotalMb) * 100}%` }}
                          />
                        </div>
                        <span className="text-foreground w-10 text-right">{Math.round(agent.metrics.memoryUsedMb)}MB</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <HardDrive className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Disk</span>
                        <div className="flex-1 h-1.5 rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${(agent.metrics.diskUsedGb / agent.metrics.diskTotalGb) > 0.9 ? "bg-red-500" : (agent.metrics.diskUsedGb / agent.metrics.diskTotalGb) > 0.7 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${(agent.metrics.diskUsedGb / agent.metrics.diskTotalGb) * 100}%` }}
                          />
                        </div>
                        <span className="text-foreground w-10 text-right">{agent.metrics.diskUsedGb.toFixed(1)}GB</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No metrics reported yet</p>
                  )}
                  {agent.alerts.length > 0 && (
                    <div className="space-y-1">
                      {agent.alerts.map((alert, i) => (
                        <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> {alert}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Recent Activity (Last 50)
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((a) => (
                <div
                  key={a._id}
                  className="flex items-center gap-3 text-xs py-1.5 border-b border-border/50 last:border-0"
                >
                  <span className="font-medium text-foreground w-16 shrink-0">
                    {a.agentName}
                  </span>
                  <span className="text-muted-foreground truncate flex-1">
                    {a.action}: {a.details}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {getRelativeTime(a.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Recent Tasks (Last 100)
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentTasks && recentTasks.length > 0 ? (
              recentTasks.map((t) => {
                const statusColors: Record<string, string> = {
                  done: "text-green-500",
                  in_progress: "text-blue-500",
                  assigned: "text-yellow-500",
                  in_review: "text-purple-500",
                  inbox: "text-gray-400",
                  cancelled: "text-red-500",
                };
                return (
                  <div
                    key={t._id}
                    className="flex items-center gap-3 text-xs py-1.5 border-b border-border/50 last:border-0"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        t.status === "done"
                          ? "bg-green-500"
                          : t.status === "in_progress"
                          ? "bg-blue-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="font-medium text-foreground truncate flex-1">
                      {t.title}
                    </span>
                    <span className="text-muted-foreground shrink-0 w-16">
                      {t.assignee || "—"}
                    </span>
                    <span
                      className={`shrink-0 w-20 text-right capitalize ${statusColors[t.status] || "text-muted-foreground"}`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
