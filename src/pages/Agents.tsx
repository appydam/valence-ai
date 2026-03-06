import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/AgentStatusCard";
import { AgentConfigPanel } from "@/components/AgentConfigPanel";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { apiPost } from "@/lib/api";
import { Settings, RefreshCw, AlertCircle, GitBranch, CheckCircle, ChevronDown, ChevronUp, X } from "lucide-react";

const AgentsPage = () => {
  const agents = useQuery(api.agents.list) ?? [];
  const tasks = useQuery(api.tasks.list, {}) ?? [];
  const activity = useQuery(api.activityFns.list, {}) ?? [];
  const usageData = useQuery(api.usage.listAll) ?? [];
  const agentConfigs = useQuery(api.agentConfigs.list) ?? [];
  const soulFiles = useQuery(api.soulFiles.listAll) ?? [];
  const pendingDistillations = useQuery(api.soulDistillation.listPendingReview) ?? [];

  const syncConfigs = useMutation(api.agentConfigs.syncFromServer);
  const syncSouls = useMutation(api.soulFiles.syncFromServer);

  const sshConfig = useQuery(api.sshConfig.get);
  const sshConfigured = !!(sshConfig && sshConfig.host);

  const [configPanelAgent, setConfigPanelAgent] = useState<AgentName | null>(null);
  const [configPanelTab, setConfigPanelTab] = useState<"settings" | "soul">("settings");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [expandedDiff, setExpandedDiff] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const handleApproveVersion = async (versionId: string, agentName: string) => {
    setApproving(versionId);
    try {
      const data = await apiPost("/api/soul/approve-version", { versionId, agentName });
      if (data.ok) {
        setExpandedDiff(null);
        alert(`SOUL update for ${agentName} approved${data.syncedToServer ? " and synced to server" : " (sync failed — check SSH config)"}.`);
      } else {
        alert(`Approval failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
    setApproving(null);
  };

  const handleRejectVersion = async (versionId: string, agentName: string) => {
    setRejecting(versionId);
    try {
      await apiPost("/api/soul/reject-version", { versionId, agentName });
      setExpandedDiff(null);
    } catch {
      // Best-effort — rejection via direct Convex call not possible from frontend without HTTP route
      alert("Rejection not supported from UI yet. Use the Convex dashboard to reject.");
    }
    setRejecting(null);
  };

  // Simple line diff renderer
  function renderDiff(oldContent: string, newContent: string) {
    const oldLines = oldContent.split("\n");
    const newLines = newContent.split("\n");
    const maxLen = Math.max(oldLines.length, newLines.length);
    const result: { type: "same" | "removed" | "added"; line: string }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i] ?? "";
      const newLine = newLines[i] ?? "";
      if (oldLine === newLine) {
        result.push({ type: "same", line: newLine });
      } else {
        if (oldLine) result.push({ type: "removed", line: oldLine });
        if (newLine) result.push({ type: "added", line: newLine });
      }
    }
    return result;
  }

  const handleSyncFromServer = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const data = await apiPost("/api/ssh-proxy/sync-all", {});

      if (!data.ok) {
        setSyncError(data.error || "Sync failed");
        setSyncing(false);
        return;
      }

      let syncedItems: string[] = [];

      if (data.openclawConfig?.agents?.list) {
        const validAgents = ["kaze", "scout", "forge", "ghost", "sentinel"];
        const agentMap: Record<string, "Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel"> = {
          kaze: "Kaze", scout: "Scout", forge: "Forge", ghost: "Ghost", sentinel: "Sentinel",
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

      if (data.soulFiles && Object.keys(data.soulFiles).length > 0) {
        const soulFiles = Object.entries(data.soulFiles).map(
          ([agentName, content]) => ({
            agentName: agentName as "Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel",
            content: content as string,
          })
        );
        await syncSouls({ soulFiles });
        syncedItems.push(`${soulFiles.length} SOUL files`);
      }

      if (syncedItems.length > 0) {
        setSyncError(null);
        alert(`Synced from server: ${syncedItems.join(", ")}`);
      } else {
        alert("No data found on server to sync.");
      }
    } catch (error: any) {
      setSyncError(`Cannot connect to server: ${error.message}`);
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
            disabled={syncing || !sshConfigured}
            title={!sshConfigured ? "Configure SSH in Settings → Server first" : undefined}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from Server"}
          </button>
        </div>

        {!sshConfigured && sshConfig !== undefined && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-500">SSH not configured</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Go to <a href="/settings" className="underline hover:text-foreground">Settings → Server</a> to configure SSH access. Agents will still appear here via heartbeat, but server sync and remote operations require SSH.
              </p>
            </div>
          </div>
        )}

        {syncError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{syncError}</p>
          </div>
        )}

        {/* Distillation pending banner */}
        {pendingDistillations.length > 0 && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
            <div className="p-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-400 shrink-0" />
              <p className="text-sm font-medium text-blue-400 flex-1">
                {pendingDistillations.length} SOUL update{pendingDistillations.length > 1 ? "s" : ""} ready for review
              </p>
              <span className="text-xs text-muted-foreground">Weekly distillation from agent memories</span>
            </div>
            <div className="divide-y divide-border">
              {pendingDistillations.map((version: any) => {
                const currentSoul = soulFiles.find((s: any) => s.agentName === version.agentName);
                const isExpanded = expandedDiff === version._id;
                const diffLines = isExpanded && currentSoul
                  ? renderDiff(currentSoul.content || "", version.content)
                  : [];

                return (
                  <div key={version._id} className="bg-card">
                    <button
                      onClick={() => setExpandedDiff(isExpanded ? null : version._id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left"
                    >
                      <span className="text-base">{AGENT_CONFIG[version.agentName as AgentName]?.emoji || "🤖"}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{version.agentName}</span>
                        <span className="text-xs text-muted-foreground ml-2">v{version.version} distillation</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4">
                        {currentSoul ? (
                          <div className="rounded-lg border border-border overflow-auto max-h-80 bg-background font-mono text-xs">
                            {diffLines.map((dl, i) => (
                              <div
                                key={i}
                                className={`px-3 py-0.5 whitespace-pre-wrap ${
                                  dl.type === "added" ? "bg-green-500/10 text-green-400" :
                                  dl.type === "removed" ? "bg-red-500/10 text-red-400 line-through" :
                                  "text-muted-foreground"
                                }`}
                              >
                                {dl.type === "added" ? "+ " : dl.type === "removed" ? "− " : "  "}{dl.line || " "}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-border overflow-auto max-h-80 bg-background font-mono text-xs p-3 text-muted-foreground whitespace-pre-wrap">
                            {version.content}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleApproveVersion(version._id, version.agentName)}
                            disabled={approving === version._id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {approving === version._id ? "Approving..." : "Approve & Sync"}
                          </button>
                          <button
                            onClick={() => handleRejectVersion(version._id, version.agentName)}
                            disabled={rejecting === version._id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map(agent => {
            const config = AGENT_CONFIG[agent.name];
            const agentTasks = tasks.filter(t => t.assignee === agent.name);
            const activeTasks = agentTasks.filter(t => t.status !== "done" && t.status !== "cancelled");
            const recentActivity = activity.filter(a => a.agentName === agent.name).slice(0, 4);
            const agentUsage = usageData.find(u => u.agentName === agent.name);
            const agentConfig = agentConfigs.find(c => c.agentName === agent.name);
            const isActive = agent.status === "online" || agent.status === "working";
            const soulFile = soulFiles.find((s: any) => s.agentName === agent.name);
            const hasPendingDistillation = pendingDistillations.some((v: any) => v.agentName === agent.name);

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
                        onClick={() => { setConfigPanelAgent(agent.name); setConfigPanelTab("settings"); }}
                        className="ml-auto p-1 rounded hover:bg-secondary transition-colors"
                        title="Configure agent"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{config.role}</p>
                    {/* SOUL sync status badge */}
                    {hasPendingDistillation ? (
                      <button
                        onClick={() => setExpandedDiff(pendingDistillations.find((v: any) => v.agentName === agent.name)?._id ?? null)}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        <GitBranch className="w-2.5 h-2.5" />
                        Update ready
                      </button>
                    ) : soulFile?.syncedToServer === true ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
                        <CheckCircle className="w-2.5 h-2.5" />
                        SOUL synced
                      </span>
                    ) : soulFile?.syncedToServer === false ? (
                      <button
                        onClick={() => { setConfigPanelAgent(agent.name); setConfigPanelTab("soul"); }}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                      >
                        Changes pending
                      </button>
                    ) : (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        No SOUL
                      </span>
                    )}
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
          initialTab={configPanelTab}
          onClose={() => { setConfigPanelAgent(null); setConfigPanelTab("settings"); }}
        />
      )}
    </DashboardLayout>
  );
};

export default AgentsPage;
