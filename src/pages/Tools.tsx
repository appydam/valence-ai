import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Package, Users, Key, XCircle, Download } from "lucide-react";

interface Skill {
  name: string;
  emoji: string;
  description: string;
  source: string;
  status: "ready" | "missing";
  hasApiKey?: boolean;
}

const Tools = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agentSkills, setAgentSkills] = useState<Record<string, string[]>>({});
  const [summary, setSummary] = useState<{ ready: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "ready" | "missing">("all");
  const [installing, setInstalling] = useState<string | null>(null);

  const loadTools = async () => {
    setLoading(true);
    setError(null);
    try {
      const configResponse = await fetch("https://beloved-squirrel-599.convex.site/api/ssh/config-full");
      const sshConfig = await configResponse.json();

      if (!sshConfig || !sshConfig.host) {
        setError("No SSH configuration found. Please configure SSH in Settings first.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3001/openclaw/tools-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sshConfig),
      });
      const data = await response.json();

      if (data.ok) {
        setSkills(data.skills || []);
        setAgentSkills(data.agentSkills || {});
        setSummary(data.summary || null);
        if ((data.skills || []).length === 0) {
          setError("No skills found. Make sure OpenClaw is configured on your server.");
        }
      } else {
        setError(data.error || "Failed to load skills");
      }
    } catch (error: any) {
      setError(`Cannot connect to SSH proxy service. Make sure it's running on port 3001. Error: ${error.message}`);
    }
    setLoading(false);
  };

  const installSkill = async (skillName: string) => {
    setInstalling(skillName);
    try {
      const configResponse = await fetch("https://beloved-squirrel-599.convex.site/api/ssh/config-full");
      const sshConfig = await configResponse.json();

      const response = await fetch("http://localhost:3001/openclaw/tools-install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sshConfig, toolName: skillName }),
      });
      const data = await response.json();

      if (data.ok) {
        alert(`${skillName} installed successfully! Refreshing list...`);
        loadTools();
      } else {
        alert(`Installation failed: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
    setInstalling(null);
  };

  useEffect(() => {
    loadTools();
  }, []);

  const getAgentsForSkill = (skillName: string): string[] => {
    const agents: string[] = [];
    for (const [agentId, skillList] of Object.entries(agentSkills)) {
      if (skillList.includes(skillName)) {
        agents.push(agentId.charAt(0).toUpperCase() + agentId.slice(1));
      }
    }
    return agents;
  };

  const filteredSkills = skills.filter(s => {
    if (filter === "ready") return s.status === "ready";
    if (filter === "missing") return s.status === "missing";
    return true;
  });

  const readySkills = filteredSkills.filter(s => s.status === "ready");
  const missingSkills = filteredSkills.filter(s => s.status === "missing");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">OpenClaw Skills</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {summary
                ? `${summary.ready} of ${summary.total} skills ready on your server`
                : "Discover and manage OpenClaw skills"}
            </p>
          </div>
          <button
            onClick={loadTools}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Filter Tabs */}
        {!loading && skills.length > 0 && (
          <div className="flex items-center gap-2">
            {(["all", "ready", "missing"] as const).map((f) => {
              const count = f === "all"
                ? skills.length
                : skills.filter(s => s.status === (f === "missing" ? "missing" : "ready")).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : f === "ready" ? "Ready" : "Available"} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-500 mb-1">Error</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading skills from server...</p>
          </div>
        )}

        {/* Ready Skills Section */}
        {!loading && readySkills.length > 0 && (
          <div>
            {filter === "all" && (
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Ready ({readySkills.length})
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {readySkills.map((skill) => {
                const agents = getAgentsForSkill(skill.name);
                return (
                  <div
                    key={skill.name}
                    className="rounded-lg border border-border bg-card p-4 hover:border-green-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{skill.emoji || "📦"}</span>
                        <h3 className="text-sm font-semibold text-foreground">{skill.name}</h3>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {skill.source}
                      </span>

                      {skill.hasApiKey && (
                        <span className="flex items-center gap-1 text-[10px] text-green-500">
                          <Key className="w-3 h-3" />
                          API Key
                        </span>
                      )}

                      {agents.length > 0 && (
                        <div className="flex items-center gap-1 ml-auto">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            {agents.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Missing/Available Skills Section */}
        {!loading && missingSkills.length > 0 && (
          <div>
            {filter === "all" && (
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                Available to Install ({missingSkills.length})
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {missingSkills.map((skill) => (
                <div
                  key={skill.name}
                  className="rounded-lg border border-dashed border-border bg-card/50 p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base opacity-60">{skill.emoji || "📦"}</span>
                      <h3 className="text-sm font-semibold text-foreground/70">{skill.name}</h3>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-500">
                      <XCircle className="w-3 h-3" />
                      Missing
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {skill.source}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        installSkill(skill.name);
                      }}
                      disabled={installing === skill.name}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
                    >
                      {installing === skill.name ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      {installing === skill.name ? "Installing..." : "Install"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && skills.length === 0 && (
          <div className="text-center py-12 rounded-lg border border-dashed border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Skills Found</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Click "Refresh" to load OpenClaw skills from your server.
            </p>
            <button
              onClick={loadTools}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            About OpenClaw Skills
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>Ready</strong> skills have all dependencies met and are available for use.
              <strong> Missing</strong> skills need dependencies installed first.
            </p>
            <p>
              Enable skills per-agent in the Agents settings page. You can also install missing
              skills using <code className="px-1 py-0.5 rounded bg-secondary text-foreground">openclaw configure</code> on your server.
            </p>
            <p>
              <a
                href="https://openclaw.com/docs/tools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                OpenClaw documentation
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tools;
