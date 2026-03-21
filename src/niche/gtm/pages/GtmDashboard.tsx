import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Users,
  Mail,
  MessageSquare,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  PenLine,
  Bell,
  BellOff,
  Loader2,
  BarChart3,
  Plug,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { IntegrationStatusBanner } from "../../framework/IntegrationStatusBanner";
import { AgentActivityPanel } from "../../framework/AgentActivityPanel";
import { PipelineFunnel } from "../components/PipelineFunnel";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useCrmSync } from "../hooks/useCrmSync";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-muted text-muted-foreground",
  Contacted: "bg-blue-500/10 text-blue-500",
  Replied: "bg-yellow-500/10 text-yellow-500",
  Meeting: "bg-green-500/10 text-green-500",
};

interface DashboardStat {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: typeof Users;
}

interface OutreachDataPoint {
  date: string;
  sent: number;
  replies: number;
}

export function GtmDashboard() {
  const { config } = useNiche();
  const { execute, isConnected } = useIntegrationCall();
  const { deals, contacts, syncNow, loading: crmLoading, isLive } = useCrmSync();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [sendingSlack, setSendingSlack] = useState(false);
  const [outreachData, setOutreachData] = useState<OutreachDataPoint[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const isSlackConnected = isConnected("slack");
  const isGaConnected = isConnected("google-analytics");

  const tasks = useQuery(api.tasks.list, {});
  const gtmTasks = (tasks ?? []).filter((t: { tags?: string[] }) =>
    t.tags?.includes("niche:gtm")
  );

  // Derive stats from real CRM data
  const leadsSourced = contacts.length;
  const meetingsBooked = deals.filter((d) => d.stage === "meeting").length;
  const repliedCount = deals.filter((d) => d.stage === "replied").length;
  const totalPipeline = deals.reduce((sum, d) => sum + d.dealSize, 0);

  // Derive task-based stats
  const emailTasks = gtmTasks.filter((t: { tags?: string[] }) =>
    t.tags?.includes("email-copy")
  );
  const emailsSent = emailTasks.filter((t: { status: string }) => t.status === "done").length;

  const stats: DashboardStat[] = [
    { label: "Leads Sourced", value: isLive ? String(leadsSourced) : "--", change: isLive ? `${leadsSourced}` : "N/A", up: true, icon: Users },
    { label: "Pipeline Value", value: isLive ? `$${(totalPipeline / 1000).toFixed(0)}K` : "--", change: isLive ? `${deals.length} deals` : "N/A", up: true, icon: Mail },
    { label: "Replied", value: isLive ? String(repliedCount) : "--", change: isLive && leadsSourced > 0 ? `${((repliedCount / leadsSourced) * 100).toFixed(1)}%` : "N/A", up: repliedCount > 0, icon: MessageSquare },
    { label: "Meetings Booked", value: isLive ? String(meetingsBooked) : "--", change: isLive ? `${meetingsBooked}` : "N/A", up: meetingsBooked > 0, icon: CalendarCheck },
  ];

  // Derive leads for table from CRM contacts
  const recentLeads = contacts.slice(0, 5).map((c) => {
    const matchingDeal = deals.find(
      (d) => d.company === c.company || d.name === c.name
    );
    return {
      id: c.id,
      name: c.name,
      company: c.company,
      role: c.role,
      score: matchingDeal?.score ?? 50,
      status: matchingDeal
        ? matchingDeal.stage === "meeting"
          ? "Meeting"
          : matchingDeal.stage === "replied"
          ? "Replied"
          : matchingDeal.stage === "contacted"
          ? "Contacted"
          : "New"
        : "New",
    };
  });

  // Fetch outreach performance from Google Analytics if connected
  const fetchAnalytics = useCallback(async () => {
    if (!isGaConnected) return;
    setAnalyticsLoading(true);
    try {
      const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
      const days = daysMap[timeRange];
      const result = await execute("google-analytics", "run_report", {
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "eventCount" },
          { name: "sessions" },
        ],
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      });
      if (result.success && result.result?.rows) {
        const mapped: OutreachDataPoint[] = result.result.rows.map((row: any) => ({
          date: row.dimensionValues?.[0]?.value ?? "",
          sent: Number(row.metricValues?.[0]?.value ?? 0),
          replies: Number(row.metricValues?.[1]?.value ?? 0),
        }));
        setOutreachData(mapped);
      }
    } catch {
      // Silently fail
    } finally {
      setAnalyticsLoading(false);
    }
  }, [execute, isGaConnected, timeRange]);

  useEffect(() => {
    if (isGaConnected) {
      fetchAnalytics();
    }
  }, [fetchAnalytics, isGaConnected]);

  // Auto-sync CRM on mount
  useEffect(() => {
    if (isLive) {
      syncNow();
    }
  }, [isLive]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleSlack = async () => {
    if (!isSlackConnected) return;

    if (!slackNotifications) {
      setSendingSlack(true);
      await execute("slack", "post_message", {
        channel: "#gtm-alerts",
        text: "GTM Engine notifications enabled. You will receive alerts for: new replies, meetings booked, and deals closed.",
      });
      setSendingSlack(false);
    }

    setSlackNotifications(!slackNotifications);
  };

  return (
    <div className="space-y-6">
      {/* Integration Status Banner */}
      <IntegrationStatusBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your outbound pipeline and outreach performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Slack Notification Toggle */}
          {isSlackConnected && (
            <button
              onClick={handleToggleSlack}
              disabled={sendingSlack}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                slackNotifications
                  ? "border-green-500/30 bg-green-500/10 text-green-500"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              title={slackNotifications ? "Slack notifications on" : "Enable Slack notifications"}
            >
              {slackNotifications ? (
                <Bell className="w-3.5 h-3.5" />
              ) : (
                <BellOff className="w-3.5 h-3.5" />
              )}
              {slackNotifications ? "Slack On" : "Slack Off"}
            </button>
          )}

          {!isSlackConnected && (
            <Link
              to="/integrations"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              Connect Slack
            </Link>
          )}

          <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
          <Link
            to={`${config.basePath}/leads`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <Search className="w-4 h-4" />
            Source New Leads
          </Link>
          <Link
            to={`${config.basePath}/sequences`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <PenLine className="w-4 h-4" />
            Create Sequence
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ background: `${config.accentColor}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: config.accentColor }} />
                </div>
                {isLive ? (
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stat.up ? "text-green-500" : "text-red-400"
                    }`}
                  >
                    {stat.up ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Not connected</span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">
                {crmLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Funnel */}
      {isLive && deals.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Pipeline Funnel</h2>
            <span className="text-xs text-muted-foreground">
              Last {timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"} days
            </span>
          </div>
          <PipelineFunnel deals={deals} />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <BarChart3 className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">No pipeline data yet</p>
          <Link
            to="/integrations"
            className="text-xs font-medium hover:underline"
            style={{ color: config.accentColor }}
          >
            Connect your CRM to see pipeline funnel
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Leads</h2>
            <Link
              to={`${config.basePath}/leads`}
              className="text-xs font-medium hover:underline"
              style={{ color: config.accentColor }}
            >
              View all
            </Link>
          </div>
          {recentLeads.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5">Company</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-2.5">Role</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Score</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                    <td className="px-5 py-2.5 text-sm font-medium text-foreground">{lead.name}</td>
                    <td className="px-5 py-2.5 text-sm text-muted-foreground">{lead.company}</td>
                    <td className="px-5 py-2.5 text-sm text-muted-foreground">{lead.role}</td>
                    <td className="px-5 py-2.5 text-sm text-right font-medium" style={{ color: lead.score >= 85 ? "hsl(142,71%,45%)" : lead.score >= 70 ? "hsl(38,92%,50%)" : "hsl(0,84%,60%)" }}>
                      {lead.score}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] ?? STATUS_COLORS.New}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">No leads yet</p>
              <Link
                to="/integrations"
                className="text-xs font-medium hover:underline"
                style={{ color: config.accentColor }}
              >
                Connect your CRM to see leads
              </Link>
            </div>
          )}
        </div>

        {/* Outreach Performance Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Outreach Performance</h2>
          {isGaConnected && outreachData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={outreachData}>
                    <defs>
                      <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={config.accentColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={config.accentColor} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="repliesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(38,92%,50%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(38,92%,50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,20%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(0,0%,50%)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(240,10%,10%)",
                        border: "1px solid hsl(0,0%,20%)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      stroke={config.accentColor}
                      fill="url(#sentGrad)"
                      strokeWidth={2}
                      name="Emails Sent"
                    />
                    <Area
                      type="monotone"
                      dataKey="replies"
                      stroke="hsl(38,92%,50%)"
                      fill="url(#repliesGrad)"
                      strokeWidth={2}
                      name="Replies"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-5 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: config.accentColor }} />
                  Emails Sent
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: "hsl(38,92%,50%)" }} />
                  Replies
                </span>
              </div>
            </>
          ) : analyticsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center">
              <Plug className="w-8 h-8 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground mb-2">No outreach data available</p>
              <Link
                to="/integrations"
                className="text-xs font-medium hover:underline"
                style={{ color: config.accentColor }}
              >
                Connect Google Analytics to track performance
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Agent Activity Panel — live reasoning from active task */}
      {(() => {
        const latestActiveTask = gtmTasks.find(
          (t: { status: string }) => t.status === "in_progress"
        ) as { _id: string; assignee?: string } | undefined;
        return latestActiveTask ? (
          <AgentActivityPanel
            taskId={latestActiveTask._id}
            agentName={latestActiveTask.assignee}
          />
        ) : (
          <AgentActivityPanel />
        );
      })()}

      {/* Agent Activity Feed for GTM Tasks */}
      {gtmTasks.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Recent GTM Tasks
          </h2>
          <div className="space-y-3">
            {gtmTasks.slice(0, 5).map((task: { _id: string; title: string; status: string; assignee?: string }) => (
              <div
                key={task._id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-accent/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {task.assignee ?? "Unassigned"}
                  </span>
                  <span className="text-sm text-foreground">{task.title}</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    task.status === "done"
                      ? "bg-green-500/10 text-green-500"
                      : task.status === "in_progress"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
