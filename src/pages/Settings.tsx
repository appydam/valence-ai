import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Server, Key, Zap, Check, Eye, EyeOff, ExternalLink, HelpCircle, AlertCircle, RefreshCw, CheckCircle2, Package, Users, XCircle, Download } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SSH_PROXY_URL } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

interface Skill {
  name: string;
  emoji: string;
  description: string;
  source: string;
  status: "ready" | "missing";
  hasApiKey?: boolean;
}

const SettingsPage = () => {
  // SSH state
  const sshConfig = useQuery(api.sshConfig.get) ?? null;
  const saveSSH = useMutation(api.sshConfig.save);
  const [sshHost, setSshHost] = useState("");
  const [sshPort, setSshPort] = useState("22");
  const [sshUser, setSshUser] = useState("");
  const [sshKey, setSshKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Skills state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agentSkills, setAgentSkills] = useState<Record<string, string[]>>({});
  const [summary, setSummary] = useState<{ ready: number; total: number } | null>(null);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "ready" | "missing">("all");
  const [installing, setInstalling] = useState<string | null>(null);
  const [skillInfo, setSkillInfo] = useState<{ name: string; info: string } | null>(null);

  useEffect(() => {
    if (sshConfig) {
      setSshHost(sshConfig.host);
      setSshPort(sshConfig.port.toString());
      setSshUser(sshConfig.username);
    }
  }, [sshConfig]);

  useEffect(() => {
    loadTools();
  }, []);

  const handleSave = async () => {
    try {
      await saveSSH({
        host: sshHost,
        port: parseInt(sshPort),
        username: sshUser,
        privateKey: sshKey,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error: any) {
      alert(`Error saving SSH config: ${error.message}`);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      let keyToUse = sshKey;
      if (!keyToUse) {
        const configResponse = await fetch("https://beloved-squirrel-599.convex.site/api/ssh/config-full");
        const fullConfig = await configResponse.json();
        if (fullConfig && fullConfig.privateKey) {
          keyToUse = fullConfig.privateKey;
        } else {
          setTestResult({ ok: false, message: "No SSH private key found. Please enter and save your SSH credentials first." });
          setTesting(false);
          return;
        }
      }

      const response = await fetch("https://beloved-squirrel-599.convex.site/api/ssh/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ ok: false, message: `Cannot connect to SSH proxy service: ${error.message}` });
    }
    setTesting(false);
  };

  const loadTools = async () => {
    setSkillsLoading(true);
    setSkillsError(null);
    try {
      const configResponse = await fetch("https://beloved-squirrel-599.convex.site/api/ssh/config-full");
      const sshCfg = await configResponse.json();

      if (!sshCfg || !sshCfg.host) {
        setSkillsError("No SSH configuration found. Please configure SSH in the Server tab first.");
        setSkillsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3001/openclaw/tools-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sshCfg),
      });
      const data = await response.json();

      if (data.ok) {
        setSkills(data.skills || []);
        setAgentSkills(data.agentSkills || {});
        setSummary(data.summary || null);
        if ((data.skills || []).length === 0) {
          setSkillsError("No skills found. Make sure OpenClaw is configured on your server.");
        }
      } else {
        setSkillsError(data.error || "Failed to load skills");
      }
    } catch (error: any) {
      setSkillsError(`Cannot connect to SSH proxy service. Make sure it's running on port 3001. Error: ${error.message}`);
    }
    setSkillsLoading(false);
  };

  const installSkill = async (skillName: string) => {
    setInstalling(skillName);
    try {
      const configResponse = await fetch("https://beloved-squirrel-599.convex.site/api/ssh/config-full");
      const sshCfg = await configResponse.json();

      const response = await fetch("http://localhost:3001/openclaw/tools-install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sshCfg, toolName: skillName }),
      });
      const data = await response.json();

      if (data.ok) {
        alert(`${skillName} installed successfully! Refreshing list...`);
        loadTools();
      } else {
        setSkillInfo({
          name: skillName,
          info: data.info || data.error || "This skill requires manual setup on your server.",
        });
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
    setInstalling(null);
  };

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
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure server connection and OpenClaw skills
          </p>
        </div>

        <Tabs defaultValue="server">
          <TabsList className="mb-6">
            <TabsTrigger value="server">Server</TabsTrigger>
            <TabsTrigger value="skills">OpenClaw Skills</TabsTrigger>
          </TabsList>

          {/* ── Server Tab ── */}
          <TabsContent value="server" className="space-y-6">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">SSH Connection</h2>
                <Tooltip text="Configure SSH access to your OpenClaw server for automated restarts and SOUL file syncing." />
              </div>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-500">
                      Enable One-Click Automation
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Once configured, you'll be able to restart OpenClaw and sync SOUL files directly from the UI without using the terminal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
                    Server Address
                    <Tooltip text="Your AWS Lightsail instance public IP or domain name" />
                  </label>
                  <input
                    type="text"
                    value={sshHost}
                    onChange={(e) => setSshHost(e.target.value)}
                    placeholder="12.34.56.78 or server.example.com"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
                    SSH Port
                    <Tooltip text="Usually 22 unless you've changed it" />
                  </label>
                  <input
                    type="text"
                    value={sshPort}
                    onChange={(e) => setSshPort(e.target.value)}
                    placeholder="22"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
                    Username
                    <Tooltip text="Usually 'ubuntu' for AWS Lightsail" />
                  </label>
                  <input
                    type="text"
                    value={sshUser}
                    onChange={(e) => setSshUser(e.target.value)}
                    placeholder="ubuntu"
                    className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-2 flex items-center uppercase tracking-wider">
                    SSH Private Key
                    <Tooltip text="Your .pem or private key file content. This is stored securely and never sent to third parties." />
                  </label>
                  <div className="relative">
                    <textarea
                      value={sshKey}
                      onChange={(e) => setSshKey(e.target.value)}
                      placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;MIIEpAIBAAKCAQEA...&#10;-----END RSA PRIVATE KEY-----"
                      className="w-full h-32 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground font-mono border-0 outline-none focus:ring-1 focus:ring-primary resize-none"
                      style={{ filter: showKey ? "none" : "blur(4px)" }}
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute top-2 right-2 p-1.5 rounded hover:bg-surface-hover"
                    >
                      {showKey ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste your entire private key file content here
                  </p>
                </div>
              </div>

              {testResult && (
                <div className={`rounded-lg border p-3 ${
                  testResult.ok
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}>
                  <div className="flex items-start gap-2">
                    {testResult.ok ? (
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${
                        testResult.ok ? "text-green-500" : "text-red-500"
                      }`}>
                        {testResult.ok ? "Connection Successful!" : "Connection Failed"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {testResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !sshHost || !sshUser}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors disabled:opacity-50"
                >
                  <Server className="w-4 h-4" />
                  {testing ? "Testing..." : "Test Connection"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!sshHost || !sshUser || !sshKey}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Save Credentials
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Where to find your SSH details?
              </h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong>AWS Lightsail:</strong> Go to your instance → Networking tab → Public IP is your server address
                </p>
                <p>
                  <strong>SSH Key:</strong> Download from Lightsail → Account → SSH Keys, or use the key you created when launching the instance
                </p>
                <p>
                  <strong>Username:</strong> Usually <code className="px-1 py-0.5 rounded bg-secondary">ubuntu</code> for Ubuntu instances
                </p>
              </div>
              <a
                href="https://lightsail.aws.amazon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline"
              >
                Open AWS Lightsail Console
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </TabsContent>

          {/* ── Skills Tab ── */}
          <TabsContent value="skills" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {summary
                    ? `${summary.ready} of ${summary.total} skills ready on your server`
                    : "Discover and manage OpenClaw skills"}
                </p>
              </div>
              <button
                onClick={loadTools}
                disabled={skillsLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${skillsLoading ? "animate-spin" : ""}`} />
                {skillsLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {!skillsLoading && skills.length > 0 && (
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

            {skillsError && !skillsLoading && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-500 mb-1">Error</p>
                    <p className="text-xs text-muted-foreground">{skillsError}</p>
                  </div>
                </div>
              </div>
            )}

            {skillsLoading && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-3 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading skills from server...</p>
              </div>
            )}

            {!skillsLoading && readySkills.length > 0 && (
              <div>
                {filter === "all" && (
                  <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Ready ({readySkills.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            {!skillsLoading && missingSkills.length > 0 && (
              <div>
                {filter === "all" && (
                  <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    Available to Install ({missingSkills.length})
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            {skillInfo && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {skillInfo.name} requires manual setup
                    </h3>
                  </div>
                  <button
                    onClick={() => setSkillInfo(null)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Dismiss
                  </button>
                </div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-secondary/50 rounded-lg p-3 max-h-64 overflow-auto">
                  {skillInfo.info}
                </pre>
                <p className="text-xs text-muted-foreground mt-3">
                  SSH into your server and follow the instructions above to set up this skill.
                </p>
              </div>
            )}

            {!skillsLoading && !skillsError && skills.length === 0 && (
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
                  Enable skills per-agent in the Agents page. You can also install missing
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
