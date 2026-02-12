import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/AgentStatusCard";
import { AgentConfigPanel } from "@/components/AgentConfigPanel";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Settings, RefreshCw } from "lucide-react";

const AgentsPage = () => {
  const agents = useQuery(api.agents.list) ?? [];
  const tasks = useQuery(api.tasks.list, {}) ?? [];
  const activity = useQuery(api.activityFns.list, {}) ?? [];
  const usageData = useQuery(api.usage.listAll) ?? [];
  const agentConfigs = useQuery(api.agentConfigs.list) ?? [];

  const syncConfigs = useMutation(api.agentConfigs.syncFromServer);
  const syncSouls = useMutation(api.soulFiles.syncFromServer);

  const [configPanelAgent, setConfigPanelAgent] = useState<AgentName | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleSyncFromServer = async () => {
    setSyncing(true);
    try {
      // Get SSH config from Convex
      const configResponse = await fetch("https://beloved-squirrel-599.convex.site/api/ssh/config-full");
      const sshConfig = await configResponse.json();

      if (!sshConfig || !sshConfig.host) {
        alert("No SSH configuration found. Please configure SSH in Settings first.");
        setSyncing(false);
        return;
      }

      // Call SSH proxy to pull everything
      const response = await fetch("http://localhost:3001/ssh/sync-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sshConfig),
      });
      const data = await response.json();

      if (!data.ok) {
        alert(`Sync failed: ${data.error}`);
        setSyncing(false);
        return;
      }

      let syncedItems: string[] = [];

      // Sync agent configs from openclaw.json (agents.list is an array)
      if (data.openclawConfig?.agents?.list) {
        const validAgents = ["kaze", "scout", "forge", "ghost"];
        const agentMap: Record<string, "Kaze" | "Scout" | "Forge" | "Ghost"> = {
          kaze: "Kaze", scout: "Scout", forge: "Forge", ghost: "Ghost",
        };
        const skillKeys = data.openclawConfig.skills?.entries
          ? Object.keys(data.openclawConfig.skills.entries)
          : ["mission-control"];

        const configs = data.openclawConfig.agents.list
          .filter((a: any) => validAgents.includes(a.id))
          .map((a: any) => ({
            agentName: agentMap[a.id],
            model: a.model || "anthropic/claude-sonnet-4-5",
            skills: skillKeys,
          }));

        if (configs.length > 0) {
          await syncConfigs({ configs });
          syncedItems.push(`${configs.length} agent configs`);
        }
      }

      // Sync SOUL files
      if (data.soulFiles && Object.keys(data.soulFiles).length > 0) {
        const soulFiles = Object.entries(data.soulFiles).map(
          ([agentName, content]) => ({
            agentName: agentName as "Kaze" | "Scout" | "Forge" | "Ghost",
            content: content as string,
          })
        );
        await syncSouls({ soulFiles });
        syncedItems.push(`${soulFiles.length} SOUL files`);
      }

      if (syncedItems.length > 0) {
        alert(`Synced from server: ${syncedItems.join(", ")}`);
      } else {
        alert("No data found on server to sync.");
      }
    } catch (error: any) {
      alert(`Error: Cannot connect to SSH proxy service. Make sure it's running on port 3001.\n\n${error.message}`);
    }
    setSyncing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agents</h1>
            <p className="text-sm text-muted-foreground mt-1">Your AI agent squad</p>
          </div>
          <button
            onClick={handleSyncFromServer}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from Server"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map(agent => {
            const config = AGENT_CONFIG[agent.name];
            const agentTasks = tasks.filter(t => t.assignee === agent.name);
            const activeTasks = agentTasks.filter(t => t.status !== "done" && t.status !== "cancelled");
            const recentActivity = activity.filter(a => a.agentName === agent.name).slice(0, 4);
            const agentUsage = usageData.find(u => u.agentName === agent.name);
            const agentConfig = agentConfigs.find(c => c.agentName === agent.name);
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
                      <button
                        onClick={() => setConfigPanelAgent(agent.name)}
                        className="ml-auto p-1 rounded hover:bg-secondary transition-colors"
                        title="Configure agent"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{config.role}</p>
                    {agentConfig && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          {agentConfig.model.split('/')[1]?.replace('claude-', '') || agentConfig.model}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {agentConfig.skills.length} skill{agentConfig.skills.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
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

      {/* Config panel */}
      {configPanelAgent && (
        <AgentConfigPanel
          agentName={configPanelAgent}
          onClose={() => setConfigPanelAgent(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default AgentsPage;
