import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/AgentStatusCard";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const AgentsPage = () => {
  const agents = useQuery(api.agents.list) ?? [];
  const tasks = useQuery(api.tasks.list, {}) ?? [];
  const activity = useQuery(api.activityFns.list, {}) ?? [];
  const usageData = useQuery(api.usage.listAll) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">Your AI agent squad</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map(agent => {
            const config = AGENT_CONFIG[agent.name];
            const agentTasks = tasks.filter(t => t.assignee === agent.name);
            const activeTasks = agentTasks.filter(t => t.status !== "done" && t.status !== "cancelled");
            const recentActivity = activity.filter(a => a.agentName === agent.name).slice(0, 4);
            const agentUsage = usageData.find(u => u.agentName === agent.name);
            const isActive = agent.status === "online" || agent.status === "working";

            return (
              <div key={agent._id} className="p-5 rounded-xl border bg-card hover:bg-surface-hover transition-all"
                style={{ borderColor: `hsl(var(--agent-${config.color}) / 0.15)` }}>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl text-4xl shrink-0"
                    style={{
                      backgroundColor: `hsl(var(--agent-${config.color}) / 0.1)`,
                      boxShadow: isActive ? `0 0 30px hsl(var(--agent-${config.color}) / 0.25)` : undefined,
                    }}>
                    {agent.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">{agent.name}</h3>
                      <StatusBadge status={agent.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{config.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="p-2 rounded-lg bg-secondary text-center">
                    <p className="text-lg font-bold text-foreground">{agent.tasksCompleted}</p>
                    <p className="text-[10px] text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary text-center">
                    <p className="text-lg font-bold text-foreground">{activeTasks.length}</p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary text-center">
                    <p className="text-xs font-medium text-foreground mt-1">{getRelativeTime(agent.lastHeartbeat)}</p>
                    <p className="text-[10px] text-muted-foreground">Last Seen</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary text-center">
                    <p className="text-lg font-bold text-foreground">{agentUsage ? `$${agentUsage.totalCost.toFixed(2)}` : "—"}</p>
                    <p className="text-[10px] text-muted-foreground">Cost</p>
                  </div>
                </div>

                {/* Model breakdown */}
                {agentUsage && agentUsage.modelBreakdowns.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Cost by Model</p>
                    {agentUsage.modelBreakdowns.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: `hsl(var(--agent-${config.color}))` }} />
                        <span className="truncate">{m.model}</span>
                        <span className="ml-auto shrink-0 font-medium text-foreground">${m.cost.toFixed(2)}</span>
                      </div>
                    ))}
                    {agentUsage.reportedAt && (
                      <p className="text-[10px] text-muted-foreground mt-1">Last reported {getRelativeTime(agentUsage.reportedAt)}</p>
                    )}
                  </div>
                )}

                {/* Recent activity */}
                {recentActivity.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Recent Activity</p>
                    {recentActivity.map(a => (
                      <div key={a._id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: `hsl(var(--agent-${config.color}))` }} />
                        <span className="truncate">{a.action}: {a.details}</span>
                        <span className="ml-auto shrink-0 text-[10px]">{getRelativeTime(a.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentsPage;
