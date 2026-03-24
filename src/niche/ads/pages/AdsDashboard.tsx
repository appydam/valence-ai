import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Sparkles,
  Send,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  MousePointerClick,
  Loader2,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Play,
  Pause,
  MoreHorizontal,
  RefreshCw,
  Plug,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserTasks } from "@/hooks/useUserScoped";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useCampaignData } from "../hooks/useCampaignData";

const SUGGESTIONS = [
  "Create a search campaign for my product",
  "Show me my top performing ads",
  "Why is my CPA increasing?",
  "Generate ad copy variants for testing",
  "Pause underperforming campaigns",
  "Optimize my budget allocation",
  "Research competitor ad strategies",
  "What keywords should I add?",
];

export function AdsDashboard() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { execute, isConnected } = useIntegrationCall();
  const { campaigns, stats, loading: dataLoading, refresh, isLive, hasConnections } = useCampaignData();

  const [prompt, setPrompt] = useState("");

  const tasks = useUserTasks();
  const adsTasks = (tasks ?? []).filter((t: { tags?: string[] }) =>
    t.tags?.includes("niche:ads")
  );
  const activeTasks = adsTasks.filter(
    (t: { status: string }) => t.status === "in_progress" || t.status === "assigned"
  );

  const handleSubmit = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");

    await triggerAgent(
      "Kaze",
      text.length > 80 ? text.slice(0, 80) + "..." : text,
      `User request from AI Ad Manager:\n\n"${text}"\n\nContext: ${campaigns.length} campaigns. ${isLive ? "Live data available." : "Platforms not connected."}\n\nBreak into tasks for Scout (research), Ghost (creative), Forge (technical).`,
      ["niche:ads", "command"],
      { priority: "high" }
    );
  };

  // Computed insights
  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const highRoas = campaigns.filter((c) => c.roas >= 3);
  const lowRoas = campaigns.filter((c) => c.roas > 0 && c.roas < 2);
  const topCampaigns = [...campaigns].sort((a, b) => b.roas - a.roas).slice(0, 5);

  // Platform breakdown
  const platformSpend: Record<string, number> = {};
  for (const c of campaigns) {
    platformSpend[c.platform] = (platformSpend[c.platform] ?? 0) + c.spend;
  }
  const platformData = Object.entries(platformSpend).map(([name, spend]) => ({
    name: name === "google" ? "Google" : name === "facebook" ? "Meta" : name.charAt(0).toUpperCase() + name.slice(1),
    spend: Math.round(spend),
    color: name === "google" ? "hsl(217, 89%, 61%)" : name === "facebook" ? "hsl(220, 46%, 48%)" : "hsl(330, 70%, 55%)",
  }));

  return (
    <div className="space-y-0">
      {/* ─── AI Prompt Section ─── */}
      <div className="px-6 pt-8 pb-6 border-b border-border/30">
        <div className="max-w-2xl mx-auto">
          {/* Prompt Input */}
          <div
            className="rounded-2xl border-2 bg-card shadow-lg transition-all focus-within:shadow-xl"
            style={{ borderColor: prompt ? config.accentColor : "hsl(0,0%,15%)" }}
          >
            <div className="flex items-center gap-3 px-5 py-4">
              <Sparkles className="w-5 h-5 shrink-0" style={{ color: config.accentColor }} />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Tell your AI ad team what you need..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || agentLoading}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-white transition-all disabled:opacity-30"
                style={{ background: config.accentColor }}
              >
                {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            {agentLoading && (
              <div className="flex items-center gap-2 px-5 py-2 border-t" style={{ borderColor: `${config.accentColor}20` }}>
                <Brain className="w-3.5 h-3.5 animate-pulse" style={{ color: config.accentColor }} />
                <span className="text-xs" style={{ color: config.accentColor }}>Working on it...</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {!prompt && (
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
              {SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="px-3 py-1.5 rounded-full border border-border/40 text-[11px] text-muted-foreground/60 hover:text-foreground hover:border-border hover:bg-accent/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Active Agents Strip ─── */}
      {activeTasks.length > 0 && (
        <div className="px-6 py-3 border-b border-border/30 bg-accent/5">
          <div className="max-w-5xl mx-auto flex items-center gap-4 overflow-x-auto">
            {activeTasks.slice(0, 4).map((task: { _id: string; title: string; assignee?: string }) => (
              <div key={task._id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 whitespace-nowrap">
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: config.accentColor }} />
                <span className="text-[11px] text-foreground/70">{task.title}</span>
                <span className="text-[10px] text-muted-foreground/50">{task.assignee}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Data Dashboard ─── */}
      {hasConnections && campaigns.length > 0 ? (
        <div className="px-6 py-6">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Stats Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {[
                  { label: "Spend", value: `$${stats.totalSpend.toLocaleString()}`, change: stats.totalSpendChange, up: stats.totalSpendUp, icon: DollarSign },
                  { label: "ROAS", value: `${stats.averageRoas}x`, change: stats.averageRoasChange, up: stats.averageRoasUp, icon: TrendingUp },
                  { label: "Impressions", value: stats.totalImpressions >= 1_000_000 ? `${(stats.totalImpressions / 1_000_000).toFixed(1)}M` : stats.totalImpressions >= 1_000 ? `${(stats.totalImpressions / 1_000).toFixed(0)}K` : String(stats.totalImpressions), change: stats.totalImpressionsChange, up: stats.totalImpressionsUp, icon: Eye },
                  { label: "CTR", value: `${stats.averageCtr}%`, change: stats.averageCtrChange, up: stats.averageCtrUp, icon: MousePointerClick },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground/40" />
                      <div>
                        <p className="text-lg font-bold text-foreground leading-none">{s.value}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-muted-foreground/50">{s.label}</span>
                          {s.change && s.change !== "—" && (
                            <span className={`text-[10px] font-medium flex items-center ${s.up ? "text-green-500" : "text-red-400"}`}>
                              {s.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                              {s.change}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={refresh} className="p-2 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-accent/30 transition-colors">
                <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ─── Campaign List (2/3) ─── */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Campaigns</h2>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
                    <span className="flex items-center gap-1"><Play className="w-2.5 h-2.5 text-green-500" />{activeCampaigns.length}</span>
                    <span className="flex items-center gap-1"><Pause className="w-2.5 h-2.5 text-yellow-500" />{campaigns.filter((c) => c.status === "paused").length}</span>
                  </div>
                </div>
                {topCampaigns.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border/30 bg-card hover:border-border/50 transition-colors group">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${c.status === "active" ? "bg-green-500" : c.status === "paused" ? "bg-yellow-500" : "bg-muted-foreground/30"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground/50 capitalize">{c.platform}</p>
                    </div>
                    <div className="flex items-center gap-5 text-right">
                      <div>
                        <p className="text-xs font-medium text-foreground">${c.spend.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground/40">spend</p>
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${c.roas >= 3 ? "text-green-500" : c.roas >= 2 ? "text-yellow-500" : c.roas > 0 ? "text-red-400" : "text-muted-foreground/30"}`}>
                          {c.roas > 0 ? `${c.roas}x` : "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/40">ROAS</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/70">{c.ctr}%</p>
                        <p className="text-[10px] text-muted-foreground/40">CTR</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPrompt(`Analyze campaign "${c.name}" and suggest improvements`)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-accent/30 transition-all"
                      title="Ask AI about this campaign"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* ─── Right Column: Insights + Platform Breakdown ─── */}
              <div className="space-y-4">
                {/* AI Insights */}
                {(highRoas.length > 0 || lowRoas.length > 0) && (
                  <div className="rounded-xl border border-border/30 bg-card p-4 space-y-3">
                    <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">AI Insights</h2>
                    {highRoas.length > 0 && (
                      <button
                        onClick={() => setPrompt(`Scale budget for my ${highRoas.length} campaigns with ROAS above 3x`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/20 transition-colors text-left group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground/80">{highRoas.length} campaign{highRoas.length > 1 ? "s" : ""} above 3x ROAS</p>
                          <p className="text-[10px] text-muted-foreground/40">Click to scale</p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-foreground/40 transition-colors" />
                      </button>
                    )}
                    {lowRoas.length > 0 && (
                      <button
                        onClick={() => setPrompt(`Analyze and fix ${lowRoas.length} underperforming campaigns with ROAS below 2x`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/20 transition-colors text-left group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground/80">{lowRoas.length} campaign{lowRoas.length > 1 ? "s" : ""} below 2x ROAS</p>
                          <p className="text-[10px] text-muted-foreground/40">Click to analyze</p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-foreground/40 transition-colors" />
                      </button>
                    )}
                  </div>
                )}

                {/* Platform Spend */}
                {platformData.length > 0 && (
                  <div className="rounded-xl border border-border/30 bg-card p-4">
                    <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">By Platform</h2>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={platformData} layout="vertical" barSize={18}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} width={50} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: "hsl(240,10%,10%)", border: "1px solid hsl(0,0%,20%)", borderRadius: 8, fontSize: 12 }}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                          />
                          <Bar dataKey="spend" radius={[0, 6, 6, 0]}>
                            {platformData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Recent Agent Work */}
                {adsTasks.filter((t: { status: string }) => t.status === "done").length > 0 && (
                  <div className="rounded-xl border border-border/30 bg-card p-4">
                    <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">Recent</h2>
                    <div className="space-y-2">
                      {adsTasks
                        .filter((t: { status: string }) => t.status === "done")
                        .slice(0, 3)
                        .map((t: { _id: string; title: string; assignee?: string }) => (
                          <div key={t._id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                            <CheckCircle2 className="w-3 h-3 text-green-500/50 shrink-0" />
                            <span className="text-[11px] text-foreground/50 truncate flex-1">{t.title}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : hasConnections && dataLoading ? (
        /* Loading state */
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
        </div>
      ) : !hasConnections ? (
        /* Not connected — show connect CTA + suggestions */
        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
              <Plug className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/60 mb-3">
                Connect Google Ads or Meta Ads to see live campaign data
              </p>
              <Link
                to="/integrations"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white"
                style={{ background: config.accentColor }}
              >
                <Plug className="w-3.5 h-3.5" />
                Connect Integrations
              </Link>
              <p className="text-[10px] text-muted-foreground/30 mt-4">
                You can still use the AI prompt above — agents will research and plan even without live data
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Connected but no campaigns */
        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-muted-foreground/50">
              No campaigns found. Try asking: "Create my first search campaign"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
