import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/AgentStatusCard";
import { AgentConfigPanel } from "@/components/AgentConfigPanel";
import { AGENT_CONFIG } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { apiPost } from "@/lib/api";
import {
  Settings, RefreshCw, AlertCircle, GitBranch, CheckCircle, ChevronDown, ChevronUp, X,
  Plus, Trash2, Edit2, Server as ServerIcon,
} from "lucide-react";
import { AGENT_COLOR_PRESETS, getServerRecommendation } from "@/hooks/useAgents";

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
  const createAgent = useMutation(api.agents.create);
  const updateAgent = useMutation(api.agents.update);
  const removeAgent = useMutation(api.agents.remove);

  const sshConfig = useQuery(api.sshConfig.get);
  const sshConfigured = !!(sshConfig && sshConfig.host);

  const [configPanelAgent, setConfigPanelAgent] = useState<string | null>(null);
  const [configPanelTab, setConfigPanelTab] = useState<"settings" | "soul">("settings");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [expandedDiff, setExpandedDiff] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);

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
        // Build agent map dynamically from DB agents
        const agentMap: Record<string, string> = {};
        for (const a of agents) {
          if (a.slug) agentMap[a.slug] = a.name;
        }

        const skillKeys = data.openclawConfig.skills?.entries
          ? Object.keys(data.openclawConfig.skills.entries)
          : ["mission-control"];

        const configs = data.openclawConfig.agents.list
          .filter((a: any) => agentMap[a.id])
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
        const soulFilesData = Object.entries(data.soulFiles).map(
          ([agentName, content]) => ({
            agentName,
            content: content as string,
          })
        );
        await syncSouls({ soulFiles: soulFilesData });
        syncedItems.push(`${soulFilesData.length} SOUL files`);
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

  const handleDeleteAgent = async (agentId: any, agentName: string) => {
    if (!confirm(`Delete agent "${agentName}"? This cannot be undone.`)) return;
    try {
      await removeAgent({ id: agentId });
      // Also unregister from OpenClaw server if SSH is configured
      if (sshConfigured) {
        try {
          await apiPost("/api/ssh-proxy/unregister-agent", { agentName });
        } catch {
          // Non-fatal — agent is already removed from DB
        }
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Get agent display config (from DB fields, falling back to static AGENT_CONFIG)
  const getConfig = (agent: any) => {
    return {
      emoji: agent.emoji,
      color: agent.color,
      role: agent.role,
      description: agent.description,
    };
  };

  // Determine if color is a named Tailwind agent color or a hex value
  const getColorStyle = (color: string) => {
    const namedColors = ["kaze", "scout", "forge", "ghost", "sentinel"];
    if (namedColors.includes(color)) {
      return { borderColor: `hsl(var(--agent-${color}) / 0.15)` };
    }
    return { borderColor: `${color}25` };
  };

  const getColorVar = (color: string) => {
    const namedColors = ["kaze", "scout", "forge", "ghost", "sentinel"];
    if (namedColors.includes(color)) {
      return `hsl(var(--agent-${color}))`;
    }
    return color;
  };

  const getColorBg = (color: string) => {
    const namedColors = ["kaze", "scout", "forge", "ghost", "sentinel"];
    if (namedColors.includes(color)) {
      return `hsl(var(--agent-${color}) / 0.1)`;
    }
    return `${color}1A`;
  };

  const serverRec = getServerRecommendation(agents.length);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {agents.length} agent{agents.length !== 1 ? "s" : ""} in your squad
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </button>
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
        </div>

        {/* Server recommendation */}
        {agents.length > 5 && (
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 flex items-start gap-2">
            <ServerIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-500">Server recommendation</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                With {agents.length} agents, we recommend at least <strong>{serverRec.ram}</strong> RAM and <strong>{serverRec.cpu}</strong> ({serverRec.estimate}).
              </p>
            </div>
          </div>
        )}

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
                const agentForVersion = agents.find(a => a.name === version.agentName);

                return (
                  <div key={version._id} className="bg-card">
                    <button
                      onClick={() => setExpandedDiff(isExpanded ? null : version._id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left"
                    >
                      <span className="text-base">{agentForVersion?.emoji ?? AGENT_CONFIG[version.agentName]?.emoji ?? "🤖"}</span>
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
            const config = getConfig(agent);
            const agentTasks = tasks.filter(t => t.assignee === agent.name);
            const activeTasks = agentTasks.filter(t => t.status !== "done" && t.status !== "cancelled");
            const recentActivity = activity.filter(a => a.agentName === agent.name).slice(0, 4);
            const agentUsage = usageData.find(u => u.agentName === agent.name);
            const agentCfg = agentConfigs.find(c => c.agentName === agent.name);
            const isActive = agent.status === "online" || agent.status === "working";
            const soulFile = soulFiles.find((s: any) => s.agentName === agent.name);
            const hasPendingDistillation = pendingDistillations.some((v: any) => v.agentName === agent.name);
            const colorStyle = getColorStyle(config.color);
            const colorVar = getColorVar(config.color);
            const colorBg = getColorBg(config.color);

            return (
              <div key={agent._id} className="p-5 rounded-xl border bg-card hover:bg-surface-hover transition-all"
                style={colorStyle}>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl text-4xl shrink-0"
                    style={{
                      backgroundColor: colorBg,
                      boxShadow: isActive ? `0 0 30px ${colorVar}40` : undefined,
                    }}>
                    {agent.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">{agent.name}</h3>
                      <StatusBadge status={agent.status} />
                      {agent.isOrchestrator && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">Orchestrator</span>
                      )}
                      {agent.isReviewer && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-medium">Reviewer</span>
                      )}
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => setEditingAgent(agent)}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                          title="Edit agent"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => { setConfigPanelAgent(agent.name); setConfigPanelTab("settings"); }}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                          title="Configure agent"
                        >
                          <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent._id, agent.name)}
                          className="p-1 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete agent"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>
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
                    {agentCfg && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          {agentCfg.model.split('/')[1]?.replace('claude-', '') || agentCfg.model}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {agentCfg.skills.length} skill{agentCfg.skills.length !== 1 ? 's' : ''}
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
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: colorVar }} />
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
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: colorVar }} />
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

      {/* Create/Edit Agent Modal */}
      {(showCreateModal || editingAgent) && (
        <CreateAgentModal
          agent={editingAgent}
          sshConfigured={sshConfigured}
          onClose={() => { setShowCreateModal(false); setEditingAgent(null); }}
          onCreate={async (data) => {
            await createAgent(data);
            // Auto-deploy to server if SSH is configured
            if (sshConfigured) {
              await apiPost("/api/ssh-proxy/register-agent", {
                agentName: data.name,
                description: data.description,
                model: "claude-sonnet-4-6",
                skills: [],
                sessionMaxTurns: 20,
                sessionTimeout: 300,
                isOrchestrator: data.isOrchestrator ?? false,
              });
            }
            setShowCreateModal(false);
          }}
          onUpdate={async (data) => {
            if (editingAgent) {
              await updateAgent({ id: editingAgent._id, ...data });
              setEditingAgent(null);
            }
          }}
        />
      )}
    </DashboardLayout>
  );
};

// ─── Create/Edit Agent Modal ────────────────────────────────────────────────

function CreateAgentModal({
  agent,
  sshConfigured,
  onClose,
  onCreate,
  onUpdate,
}: {
  agent: any | null;
  sshConfigured: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
  onUpdate: (data: any) => Promise<void>;
}) {
  const isEdit = !!agent;
  const [name, setName] = useState(agent?.name ?? "");
  const [emoji, setEmoji] = useState(agent?.emoji ?? "🤖");
  const [role, setRole] = useState(agent?.role ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [color, setColor] = useState(agent?.color ?? AGENT_COLOR_PRESETS[0].value);
  const [slug, setSlug] = useState(agent?.slug ?? "");
  const [isOrchestrator, setIsOrchestrator] = useState(agent?.isOrchestrator ?? false);
  const [isReviewer, setIsReviewer] = useState(agent?.isReviewer ?? false);
  const [saving, setSaving] = useState(false);
  const [deployStep, setDeployStep] = useState<null | "saving" | "deploying" | "done" | "error">(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !role.trim() || !slug.trim()) return;
    setSaving(true);
    setDeployError(null);
    try {
      const data = {
        name: name.trim(),
        emoji,
        role: role.trim(),
        description: description.trim(),
        color,
        slug: slug.trim(),
        isOrchestrator,
        isReviewer,
        canBeThrottled: !isReviewer,
      };
      if (isEdit) {
        await onUpdate(data);
      } else {
        setDeployStep("saving");
        await onCreate(data); // this also deploys to server if SSH configured
        setDeployStep("done");
        setTimeout(onClose, 1500);
      }
    } catch (error: any) {
      setDeployStep("error");
      setDeployError(error.message);
    }
    setSaving(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">{isEdit ? "Edit Agent" : "Create New Agent"}</h2>
            <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name + Emoji */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground font-medium mb-1 block uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Nexus"
                  disabled={isEdit}
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>
              <div className="w-20">
                <label className="text-xs text-muted-foreground font-medium mb-1 block uppercase tracking-wider">Emoji</label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary text-center text-lg"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block uppercase tracking-wider">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Data Analyst"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this agent do?"
                rows={2}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block uppercase tracking-wider">
                Slug <span className="text-muted-foreground/50">(OpenClaw agent ID)</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. nexus"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground font-mono border-0 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block uppercase tracking-wider">Color</label>
              <div className="flex flex-wrap gap-2">
                {AGENT_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setColor(preset.value)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      color === preset.value ? "ring-2 ring-white ring-offset-2 ring-offset-card" : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>

            {/* Role flags */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOrchestrator}
                  onChange={(e) => setIsOrchestrator(e.target.checked)}
                  className="rounded border-border"
                />
                Orchestrator
                <span className="text-[10px] text-muted-foreground">(delegates tasks)</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReviewer}
                  onChange={(e) => setIsReviewer(e.target.checked)}
                  className="rounded border-border"
                />
                Reviewer
                <span className="text-[10px] text-muted-foreground">(QA, bypasses throttle)</span>
              </label>
            </div>

            {/* Deploy progress (create flow only) */}
            {!isEdit && deployStep && (
              <div className={`rounded-lg p-3 text-sm ${
                deployStep === "done" ? "bg-green-500/10 text-green-400" :
                deployStep === "error" ? "bg-red-500/10 text-red-400" :
                "bg-primary/10 text-primary"
              }`}>
                {deployStep === "saving" && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving agent to database...</span>
                    {sshConfigured && <span className="text-muted-foreground">then deploying to server...</span>}
                  </div>
                )}
                {deployStep === "done" && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Agent created{sshConfigured ? " and deployed to server" : ""}!</span>
                  </div>
                )}
                {deployStep === "error" && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Error: {deployError}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-5">Agent was saved to the database. Configure SSH in Settings → Server to deploy to OpenClaw.</p>
                  </div>
                )}
              </div>
            )}

            {/* No SSH warning */}
            {!isEdit && !sshConfigured && !deployStep && (
              <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
                No SSH configured — agent will be saved to the database only.{" "}
                <a href="/settings" className="underline hover:text-foreground">Configure SSH</a> to auto-deploy to your OpenClaw server.
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !role.trim() || !slug.trim() || saving || deployStep === "done"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {saving
                ? (sshConfigured && !isEdit ? "Creating & Deploying..." : "Saving...")
                : isEdit ? "Save Changes" : "Create Agent"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AgentsPage;
