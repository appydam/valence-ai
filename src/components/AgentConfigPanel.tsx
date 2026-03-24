import { useState, useEffect } from "react";
import { AgentName } from "@/types/mission";
import { useAgents } from "@/hooks/useAgents";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { generateOpenClawConfig, downloadConfig } from "@/lib/configExport";
import { apiPost } from "@/lib/api";
import { getRelativeTime } from "@/lib/time";
import { X, Settings, Download, Check, AlertTriangle, HelpCircle, Zap, Lock } from "lucide-react";

function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block ml-1">
      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
      <div className="invisible group-hover:visible absolute z-50 w-64 p-2 bg-popover border border-border rounded-lg shadow-lg text-xs text-popover-foreground bottom-full left-1/2 -translate-x-1/2 mb-2">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-border"></div>
      </div>
    </div>
  );
}

const AVAILABLE_MODELS = [
  { value: "anthropic/claude-opus-4-5", label: "Claude Opus 4.5", cost: "$$$$" },
  { value: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet 4.5", cost: "$$$" },
  { value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5", cost: "$$" },
];

const AVAILABLE_SKILLS = [
  { id: "mission-control", name: "Mission Control", description: "Task management, comments, activity tracking" },
  { id: "web-search", name: "Web Search", description: "Search the web using Perplexity, Tavily, or Serper APIs" },
  { id: "github", name: "GitHub", description: "Repos, PRs, issues, actions via GitHub API" },
  { id: "slack", name: "Slack", description: "Send messages, read channels, manage workspace" },
  { id: "email", name: "Email", description: "Send and read emails via SMTP/IMAP" },
  { id: "notion", name: "Notion", description: "Create pages, update databases, search content" },
  { id: "google-sheets", name: "Google Sheets", description: "Read and write spreadsheet data" },
  { id: "twitter", name: "Twitter/X", description: "Post tweets, read timeline, manage account" },
];

interface AgentConfigPanelProps {
  agentName: AgentName;
  onClose: () => void;
  initialTab?: "settings" | "soul";
}

export function AgentConfigPanel({ agentName, onClose, initialTab = "settings" }: AgentConfigPanelProps) {
  const config = useQuery(api.agentConfigs.getByAgent, { agentName });
  const allConfigs = useQuery(api.agentConfigs.list) ?? [];
  const soulFile = useQuery(api.soulFiles.get, { agentName });
  const sshConfig = useQuery(api.sshConfig.get);
  const currentUser = useQuery(api.users.getCurrentUser);
  const auditEntries = useQuery(api.auditLog.listForResource, {
    resource: "soul_file",
    resourceId: agentName,
    limit: 5,
  }) ?? [];
  const sshConfigured = !!(sshConfig && sshConfig.host);
  const isAdmin = currentUser?.role === "admin";
  const updateConfig = useMutation(api.agentConfigs.update);
  const saveSoul = useMutation(api.soulFiles.save);

  const [model, setModel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [maxTurns, setMaxTurns] = useState(20);
  const [timeout, setTimeout] = useState(300);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "soul">(initialTab);
  const [soulContent, setSoulContent] = useState("");
  const [restarting, setRestarting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pulling, setPulling] = useState(false);

  const { agentConfig: dynamicConfig } = useAgents();
  const agentCfg = dynamicConfig[agentName] ?? { emoji: "🤖", color: "#6366F1", role: "Agent", description: "" };

  useEffect(() => {
    if (config) {
      setModel(config.model);
      setSkills(config.skills);
      setMaxTurns(config.sessionMaxTurns);
      setTimeout(config.sessionTimeout);
    }
  }, [config]);

  useEffect(() => {
    if (soulFile) {
      setSoulContent(soulFile.content);
    }
  }, [soulFile]);

  // Auto-pull SOUL from server when tab opens and no local content exists
  useEffect(() => {
    if (activeTab === "soul" && !soulFile && !pulling && !soulContent) {
      (async () => {
        setPulling(true);
        try {
          const data = await apiPost("/api/ssh-proxy/pull-soul", { agentName });
          if (data.ok && data.content) {
            setSoulContent(data.content);
            await saveSoul({ agentName, content: data.content });
          }
        } catch {
          // SSH proxy not running or server unreachable — silent fail
        }
        setPulling(false);
      })();
    }
  }, [activeTab, soulFile]);

  const handleSave = async () => {
    await updateConfig({
      agentName,
      model,
      skills,
      sessionMaxTurns: maxTurns,
      sessionTimeout: timeout,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = () => {
    // Build config list from DB records, merging in current unsaved edits for this agent
    const configsFromDb = allConfigs.map((c) => ({
      agentName: c.agentName,
      model: c.agentName === agentName ? model : c.model,
      skills: c.agentName === agentName ? skills : c.skills,
      sessionMaxTurns: c.agentName === agentName ? maxTurns : c.sessionMaxTurns,
      sessionTimeout: c.agentName === agentName ? timeout : c.sessionTimeout,
      isOrchestrator: dynamicConfig[c.agentName]?.isOrchestrator,
      description: dynamicConfig[c.agentName]?.description,
    }));
    // If the current agent has no config record yet, add it so it appears in the export
    const alreadyIncluded = configsFromDb.some((c) => c.agentName === agentName);
    if (!alreadyIncluded) {
      configsFromDb.push({
        agentName,
        model: model || "claude-sonnet-4-6",
        skills,
        sessionMaxTurns: maxTurns,
        sessionTimeout: timeout,
        isOrchestrator: agentCfg.isOrchestrator,
        description: agentCfg.description,
      });
    }
    const configData = generateOpenClawConfig(configsFromDb);
    downloadConfig(configData);
  };

  const toggleSkill = async (skillId: string) => {
    const isEnabling = !skills.includes(skillId);

    // Auto-generate SKILL.md template on server when enabling non-mission-control skills
    if (isEnabling && skillId !== "mission-control") {
      try {
        const skill = AVAILABLE_SKILLS.find(s => s.id === skillId);
        await apiPost("/api/ssh-proxy/generate-skill", {
          skillId,
          skillName: skill?.name || skillId,
        });
      } catch (error) {
        console.error("Failed to generate skill template:", error);
        // Continue with toggle even if template generation fails
      }
    }

    // Toggle skill in state
    setSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((s) => s !== skillId)
        : [...prev, skillId]
    );
  };

  const handleRestartOpenClaw = async () => {
    setRestarting(true);
    try {
      // Save config to Convex first
      await updateConfig({
        agentName,
        model,
        skills,
        sessionMaxTurns: maxTurns,
        sessionTimeout: timeout,
      });

      // Call SSH proxy service via Convex (config + auth handled server-side)
      const data = await apiPost("/api/ssh-proxy/restart-openclaw", { agentName, model });
      if (data.ok) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Restart failed: ${data.error || "Check SSH configuration in Settings → Server."}`);
      }
    } catch (error: any) {
      alert(`❌ Cannot reach server. Check SSH configuration in Settings → Server.\n\n${error.message}`);
    }
    setRestarting(false);
  };

  const handleSyncSoul = async () => {
    setSyncing(true);
    try {
      // First save to Convex
      await saveSoul({ agentName, content: soulContent });

      // Sync to server via Convex proxy (config + auth handled server-side)
      const data = await apiPost("/api/ssh-proxy/sync-soul", { agentName, content: soulContent });
      if (data.ok) {
        alert("✅ SOUL file synced to server successfully!");
      } else {
        alert(`❌ Sync failed: ${data.error || "Check SSH configuration in Settings → Server."}`);
      }
    } catch (error: any) {
      alert(`❌ Cannot reach server. Check SSH configuration in Settings → Server.\n\n${error.message}`);
    }
    setSyncing(false);
  };

  const handlePullSoul = async () => {
    setPulling(true);
    try {
      // Pull SOUL file via Convex proxy (config + auth handled server-side)
      const data = await apiPost("/api/ssh-proxy/pull-soul", { agentName });

      if (data.ok) {
        setSoulContent(data.content);
        await saveSoul({ agentName, content: data.content });
        alert("✅ SOUL file pulled from server successfully!");
      } else {
        alert(`❌ Pull failed: ${data.error || "Check SSH configuration in Settings → Server."}`);
      }
    } catch (error: any) {
      alert(`❌ Cannot reach server. Check SSH configuration in Settings → Server.\n\n${error.message}`);
    }
    setPulling(false);
  };

  // Still loading — show nothing
  if (config === undefined) {
    return null;
  }
  // config === null means no DB record yet (new agent) — show panel with defaults

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-card border-l border-border z-50 animate-slide-in-right overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Configure {agentName}
            </span>
            <span className="text-lg">{agentCfg.emoji}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-hover text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors ${
              activeTab === "settings"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("soul")}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors ${
              activeTab === "soul"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Personality (SOUL)
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {activeTab === "settings" ? (
          <>
            {/* Agent Info */}
            <div>
              <p className="text-sm text-muted-foreground">{agentCfg.role}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {agentCfg.description}
              </p>
            </div>

        {/* Warning Banner */}
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-yellow-500">
                Restart Required
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Changes are saved but won't apply until OpenClaw restarts.
              </p>
            </div>
          </div>
          <button
            onClick={handleRestartOpenClaw}
            disabled={restarting || !sshConfigured}
            title={!sshConfigured ? "Configure SSH in Settings → Server first" : undefined}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-xs font-medium text-yellow-600 transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            {restarting ? "Restarting..." : !sshConfigured ? "Restart (SSH not configured)" : "Auto-Restart OpenClaw"}
          </button>
        </div>

        {/* Model Selection */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
            Model
            <Tooltip text="Choose which AI model powers this agent. Opus is most capable but expensive, Sonnet is balanced, Haiku is fastest and cheapest." />
          </label>
          <div className="space-y-2">
            {AVAILABLE_MODELS.map((m) => (
              <button
                key={m.value}
                onClick={() => setModel(m.value)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  model === m.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {model === m.value && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {m.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.cost}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
            Skills
            <Tooltip text="Skills are tools and APIs the agent can use. Enable the skills this agent needs for its tasks." />
          </label>
          <div className="space-y-2">
            {AVAILABLE_SKILLS.map((skill) => (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  skills.includes(skill.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={skills.includes(skill.id)}
                    readOnly
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {skill.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {skill.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Session Settings */}
        <div>
          <label className="text-xs text-muted-foreground font-medium mb-3 flex items-center uppercase tracking-wider">
            Session Settings
            <Tooltip text="Control how long and how many actions an agent can take in a single work session." />
          </label>

          {/* Max Turns */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground flex items-center">
                Max Turns
                <Tooltip text="Maximum conversation rounds before the agent stops. Each tool use or response counts as one turn. Prevents infinite loops." />
              </span>
              <span className="text-sm font-medium text-foreground">
                {maxTurns}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={maxTurns}
              onChange={(e) => setMaxTurns(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-secondary appearance-none cursor-pointer accent-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum conversation turns before stopping
            </p>
          </div>

          {/* Timeout */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground flex items-center">
                Timeout
                <Tooltip text="Maximum time (in seconds) a session can run before being automatically stopped. Prevents agents from running indefinitely." />
              </span>
              <span className="text-sm font-medium text-foreground">
                {timeout}s
              </span>
            </div>
            <input
              type="number"
              min="60"
              max="3600"
              step="30"
              value={timeout}
              onChange={(e) => setTimeout(parseInt(e.target.value))}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Session timeout in seconds (60-3600)
            </p>
          </div>
        </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              {!isAdmin && (
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  Read-only — only admins can save settings
                </div>
              )}
              {isAdmin && (
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              )}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Config
              </button>
            </div>
          </>
        ) : (
          <>
            {/* SOUL Editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-muted-foreground font-medium flex items-center uppercase tracking-wider">
                  Agent Personality
                  <Tooltip text="SOUL.md defines your agent's personality, behavior, goals, and communication style. This is their 'character sheet'." />
                </label>
              </div>

              <div className="rounded-lg border border-border bg-secondary/50 p-3 mb-3">
                <p className="text-xs text-muted-foreground">
                  The SOUL file tells the agent who they are, how to behave, and what their priorities are.
                  Think of it as their personality and operating instructions.
                </p>
              </div>

              <textarea
                value={soulContent}
                onChange={isAdmin ? (e) => setSoulContent(e.target.value) : undefined}
                readOnly={!isAdmin}
                placeholder={`# ${agentName} — ${agentCfg.role}\n\nYou are ${agentName}, the ${agentCfg.role} for this AI squad.\n\n## Your Role\n${agentCfg.description}\n\n## Personality\nDescribe how you communicate, make decisions, and approach tasks...\n\n## Priorities\n1. Your top priority\n2. Second priority\n3. Third priority`}
                className={`w-full h-96 bg-background rounded-lg px-3 py-2 text-sm text-foreground font-mono border border-border focus:ring-1 focus:ring-primary outline-none resize-none ${!isAdmin ? "opacity-70 cursor-not-allowed" : ""}`}
              />

              {!isAdmin && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground mt-2">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  Read-only — only admins can edit and sync SOUL files
                </div>
              )}

              {isAdmin && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={handlePullSoul}
                  disabled={pulling || !sshConfigured}
                  title={!sshConfigured ? "Configure SSH in Settings → Server first" : undefined}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {pulling ? "Pulling..." : "Pull from Server"}
                </button>
                <button
                  onClick={handleSyncSoul}
                  disabled={syncing || !soulContent || !sshConfigured}
                  title={!sshConfigured ? "Configure SSH in Settings → Server first" : undefined}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {syncing ? "Syncing..." : "Save & Sync to Server"}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([soulContent], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${agentName.toLowerCase()}-SOUL.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              )}

              {/* Audit Log */}
              {auditEntries.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">Recent Changes</p>
                  <div className="space-y-1.5">
                    {auditEntries.map((entry: any) => (
                      <div key={entry._id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                        <span className="truncate">
                          {entry.action === "soul_file.synced" ? "Synced to server" :
                           entry.action === "soul_file.pulled" ? "Pulled from server" :
                           entry.action === "soul_file.distillation_approved" ? "Distillation approved" :
                           entry.action}
                        </span>
                        <span className="ml-auto shrink-0 text-[10px]">{getRelativeTime(entry.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
