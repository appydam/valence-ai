import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { cn } from "@/lib/utils";
import { getRelativeTime } from "@/lib/time";
import {
  Newspaper,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Eye,
  Inbox,
  Star,
  ChevronRight,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function MorningBrief() {
  const brief = useQuery(api.morningBrief.getToday);
  const history = useQuery(api.morningBrief.getHistory, { limit: 14 });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedBrief = useQuery(
    api.morningBrief.getByDate,
    selectedDate ? { date: selectedDate } : "skip"
  );

  const activeBrief = selectedDate ? selectedBrief : brief;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-primary" />
              Daily Brief
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeBrief
                ? `${activeBrief.date} — Generated ${getRelativeTime(activeBrief.generatedAt)}`
                : "Your AI team's daily digest"}
            </p>
          </div>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-accent/50 hover:bg-accent text-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Back to today
            </button>
          )}
        </div>

        {!activeBrief ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Main content — 2 cols */}
            <div className="lg:col-span-2 space-y-6 overflow-y-auto pb-6">
              {/* Narrative */}
              {activeBrief.narrative && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {activeBrief.narrative}
                  </p>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <BriefStat
                  label="Completed"
                  value={activeBrief.tasksCompleted}
                  icon={CheckCircle}
                  color="text-green-500"
                />
                <BriefStat
                  label="Created"
                  value={activeBrief.tasksCreated}
                  icon={TrendingUp}
                  color="text-blue-500"
                />
                <BriefStat
                  label="In Progress"
                  value={activeBrief.tasksInProgress}
                  icon={Clock}
                  color="text-amber-500"
                />
                <BriefStat
                  label="In Review"
                  value={activeBrief.tasksInReview}
                  icon={Eye}
                  color="text-purple-500"
                />
                <BriefStat
                  label="Upcoming"
                  value={activeBrief.upcomingTasks}
                  icon={Inbox}
                  color="text-muted-foreground"
                />
              </div>

              {/* Highlights */}
              {activeBrief.highlights.length > 0 && (
                <Section title="Highlights" icon={Star} iconColor="text-amber-400">
                  <div className="space-y-2">
                    {activeBrief.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border border-border/50 bg-accent/20 p-3"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{h.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {h.agent}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Blockers */}
              {activeBrief.blockers.length > 0 && (
                <Section title="Blockers" icon={AlertTriangle} iconColor="text-red-400">
                  <div className="space-y-2">
                    {activeBrief.blockers.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{b.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{b.description}</p>
                          <p className="text-xs text-amber-400 mt-1">{b.suggestedAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Agent Performance */}
              <Section title="Agent Performance" icon={TrendingUp} iconColor="text-blue-400">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeBrief.agentPerformance.map((a) => {
                    const config = AGENT_CONFIG[a.agent as AgentName];
                    return (
                      <div
                        key={a.agent}
                        className="flex items-center gap-3 rounded-lg border border-border/50 bg-accent/20 p-3"
                      >
                        <span className="text-lg">{config?.emoji ?? "?"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{a.agent}</span>
                            <span
                              className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                a.status === "online" || a.status === "working"
                                  ? "bg-green-500/10 text-green-400"
                                  : a.status === "idle"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-zinc-500/10 text-zinc-400"
                              )}
                            >
                              {a.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {a.tasksHandled} handled
                            </span>
                            <span className="text-xs text-green-400">
                              {a.tasksCompleted} completed
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </div>

            {/* Sidebar — history */}
            <div className="space-y-3 overflow-y-auto pb-6">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                Brief History
              </h3>
              {(history ?? []).map((h) => (
                <button
                  key={h._id}
                  onClick={() => setSelectedDate(h.date === activeBrief?.date ? null : h.date)}
                  className={cn(
                    "w-full text-left rounded-lg border p-3 transition-all",
                    h.date === activeBrief?.date
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 bg-accent/10 hover:bg-accent/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{h.date}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="text-green-400">{h.tasksCompleted} done</span>
                    <span>{h.tasksCreated} new</span>
                    {h.tasksStuck > 0 && (
                      <span className="text-red-400">{h.tasksStuck} stuck</span>
                    )}
                  </div>
                </button>
              ))}
              {(!history || history.length === 0) && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No previous briefs yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function BriefStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof CheckCircle;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-3 text-center">
      <Icon className={cn("w-5 h-5 mx-auto mb-1", color)} />
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  icon: typeof Star;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
        <Icon className={cn("w-4 h-4", iconColor)} />
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground">No brief yet</h2>
        <p className="text-sm text-muted-foreground mt-2">
          The daily brief is generated automatically every morning at 8:00 AM IST.
          It aggregates the last 24 hours of task activity, agent performance, and blockers
          into a single digest.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          First brief will appear after the next scheduled run.
        </p>
      </div>
    </div>
  );
}
