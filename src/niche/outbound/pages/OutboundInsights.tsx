import { useState } from "react";
import {
  BarChart3,
  Users,
  Mail,
  CheckCircle2,
  Clock,
  Loader2,
  TrendingUp,
  Zap,
  Eye,
  Signal,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useProductContext } from "../hooks/useProductContext";
import { useUserTasks } from "@/hooks/useUserScoped";

type Tab = "dashboard" | "history";

export function OutboundInsights() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { getPromptContext } = useProductContext();
  const [tab, setTab] = useState<Tab>("dashboard");

  const tasks = useUserTasks();
  const outboundTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:outbound")
  );
  const isLoading = tasks === undefined;

  // Compute metrics
  const total = outboundTasks.length;
  const completed = outboundTasks.filter((t: { status: string }) => t.status === "done").length;
  const inProgress = outboundTasks.filter((t: { status: string }) => t.status === "in_progress").length;
  const assigned = outboundTasks.filter((t: { status: string }) => t.status === "assigned").length;

  // Stage breakdown
  const stages = ["companies", "contacts", "enriched", "crm", "sequences"].map((key) => {
    const stageTasks = outboundTasks.filter((t: { tags?: string[] }) => t.tags?.includes(`stage:${key}`));
    return {
      key,
      total: stageTasks.length,
      done: stageTasks.filter((t: { status: string }) => t.status === "done").length,
    };
  });

  // Agent breakdown
  const agentCounts: Record<string, { total: number; done: number }> = {};
  for (const t of outboundTasks) {
    const a = (t as { assignee?: string }).assignee ?? "Unassigned";
    if (!agentCounts[a]) agentCounts[a] = { total: 0, done: 0 };
    agentCounts[a].total++;
    if ((t as { status: string }).status === "done") agentCounts[a].done++;
  }

  // Feature breakdown
  const replyTasks = outboundTasks.filter((t: { tags?: string[] }) => t.tags?.includes("reply-detection")).length;
  const followUpTasks = outboundTasks.filter((t: { tags?: string[] }) => t.tags?.includes("follow-up-agent")).length;
  const signalTasks = outboundTasks.filter((t: { tags?: string[] }) =>
    t.tags?.includes("signal:social") || t.tags?.includes("signal:visitor") || t.tags?.includes("signal:hiring")
  ).length;
  const displaceTasks = outboundTasks.filter((t: { tags?: string[] }) => t.tags?.includes("competitor-displacement")).length;

  const handleFetchMetrics = async () => {
    await triggerAgent(
      "Scout",
      "Fetch real campaign metrics from HubSpot/Gmail",
      `CAMPAIGN METRICS REPORT — AI Outbound Engine
${getPromptContext() ? `\n--- PRODUCT CONTEXT ---\n${getPromptContext()}` : ""}

Pull real engagement metrics from connected integrations:

FROM HUBSPOT (if connected):
- Total contacts in outbound lists
- Email send count, open rate, click rate, reply rate
- Deals created from outbound pipeline
- Pipeline value from outbound leads

FROM GMAIL (if connected):
- Emails sent in last 30 days
- Bounce rate
- Thread reply count

COMPUTE & DELIVER:
- Overall conversion funnel: Contacted → Opened → Replied → Meeting → Deal
- Best performing subject line (by open rate)
- Best performing email step (by reply rate)
- Best day/time to send (by open rate)
- Contacts that opened but didn't reply (warm leads for follow-up)

Deliver as a structured metrics report.`,
      ["niche:outbound", "campaign-metrics"],
      { priority: "medium" }
    );
  };

  // History sorted
  const sortedTasks = [...outboundTasks].sort(
    (a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-6 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Insights</h1>
            <p className="text-sm text-muted-foreground">Campaign analytics and task history</p>
          </div>
          <button
            onClick={handleFetchMetrics}
            disabled={agentLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-accent/20 transition-colors"
          >
            {agentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Pull Live Metrics
          </button>
        </div>

        <div className="flex gap-1 border-b border-border/30">
          {[
            { key: "dashboard" as Tab, label: "Dashboard" },
            { key: "history" as Tab, label: "History" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${tab === t.key ? "text-foreground border-current" : "text-muted-foreground/50 border-transparent hover:text-foreground/70"}`}
              style={tab === t.key ? { color: config.accentColor, borderColor: config.accentColor } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {tab === "dashboard" && (
          <div className="space-y-6 pt-4 max-w-4xl">
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Tasks", value: total, icon: BarChart3, color: "text-foreground" },
                { label: "Completed", value: completed, icon: CheckCircle2, color: "text-green-500" },
                { label: "In Progress", value: inProgress, icon: Loader2, color: "text-blue-400" },
                { label: "Queued", value: assigned, icon: Clock, color: "text-yellow-500" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${s.color} ${s.label === "In Progress" ? "" : ""}`} />
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Pipeline stages */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Pipeline Stages</h2>
              <div className="grid grid-cols-5 gap-3">
                {stages.map((s) => (
                  <div key={s.key} className="p-3 rounded-xl border border-border/30 bg-card/50 text-center">
                    <p className="text-lg font-bold text-foreground">{s.done}/{s.total}</p>
                    <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{s.key}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature usage */}
            {(replyTasks + followUpTasks + signalTasks + displaceTasks) > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Feature Usage</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Reply Scans", value: replyTasks, icon: Mail, color: "text-orange-400" },
                    { label: "AI Follow-ups", value: followUpTasks, icon: Zap, color: "text-purple-400" },
                    { label: "Signal Scans", value: signalTasks, icon: Signal, color: "text-green-400" },
                    { label: "Displacements", value: displaceTasks, icon: TrendingUp, color: "text-red-400" },
                  ].filter((f) => f.value > 0).map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/30 bg-card/50">
                        <Icon className={`w-4 h-4 ${f.color}`} />
                        <div>
                          <p className="text-sm font-bold text-foreground">{f.value}</p>
                          <p className="text-[10px] text-muted-foreground">{f.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Agent workload */}
            {Object.keys(agentCounts).length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Agent Workload</h2>
                {Object.entries(agentCounts).sort(([, a], [, b]) => b.total - a.total).map(([agent, counts]) => (
                  <div key={agent} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border/50 bg-card">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{agent}</p>
                      <div className="h-1.5 rounded-full bg-border/20 mt-1.5 overflow-hidden max-w-[200px]">
                        <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${counts.total > 0 ? (counts.done / counts.total) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{counts.done}/{counts.total}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Live metrics results */}
            {(tasks ?? []).filter((t: { tags?: string[] }) => t.tags?.includes("campaign-metrics")).map((t: { _id: string; title: string; status: string; deliverables?: { name: string; content: string }[] }) => (
              <div key={t._id} className="px-4 py-3 rounded-xl border border-border/50 bg-card">
                <div className="flex items-start gap-3">
                  {(t as any).status === "done" ? <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /> : <Loader2 className="w-4 h-4 mt-0.5 text-blue-400 animate-spin shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    {(t as any).status === "done" && t.deliverables && t.deliverables.length > 0 && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-accent/20 text-xs text-foreground/70 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {t.deliverables[0].content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {total === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No outbound activity yet. Launch a campaign from Home.</p>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-2 pt-4 max-w-3xl">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && sortedTasks.length === 0 && (
              <div className="text-center py-20">
                <Inbox className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            )}
            {sortedTasks.slice(0, 50).map((task: { _id: string; title: string; status: string; assignee?: string; _creationTime: number; deliverables?: { name: string; content: string }[] }) => {
              const isDone = task.status === "done";
              const diff = Date.now() - task._creationTime;
              const mins = Math.floor(diff / 60000);
              const timeAgo = mins < 1 ? "just now" : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;

              return (
                <div key={task._id} className="px-4 py-3 rounded-xl border border-border/50 bg-card hover:border-border/80 transition-colors">
                  <div className="flex items-start gap-3">
                    {isDone ? <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /> : task.status === "in_progress" ? <Loader2 className="w-4 h-4 mt-0.5 text-blue-400 animate-spin shrink-0" /> : <Clock className="w-4 h-4 mt-0.5 text-yellow-500 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                        <span className="text-[10px] text-muted-foreground/40">·</span>
                        <span className="text-[10px] text-muted-foreground/60">{timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
