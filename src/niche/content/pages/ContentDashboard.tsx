import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  CalendarDays,
  Send,
  TrendingUp,
  Users,
  ArrowUpRight,
  PenSquare,
  FileText,
  Calendar,
  Loader2,
  Inbox,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { AgentActivityPanel } from "../../framework/AgentActivityPanel";
import { EngagementChart } from "../components/EngagementChart";
import { TrendingTopics } from "../components/TrendingTopics";
import { useContentMetrics } from "../hooks/useContentMetrics";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useUserTasks } from "@/hooks/useUserScoped";

const PLATFORM_ICONS: Record<string, { icon: string; color: string }> = {
  twitter: { icon: "\u{1D54F}", color: "hsl(203, 89%, 53%)" },
  linkedin: { icon: "in", color: "hsl(210, 70%, 45%)" },
  instagram: { icon: "\uD83D\uDCF8", color: "hsl(330, 70%, 55%)" },
  blog: { icon: "\uD83D\uDCDD", color: "hsl(142, 71%, 45%)" },
};

export function ContentDashboard() {
  const { config } = useNiche();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const { metrics, loading: metricsLoading, isLive } = useContentMetrics();
  const { execute, isConnected } = useIntegrationCall();
  const [twitterProfile, setTwitterProfile] = useState<{ followers_count?: number } | null>(null);

  const tasks = useUserTasks();
  const contentTasks = (tasks ?? []).filter((t: { tags?: string[] }) =>
    t.tags?.includes("niche:content")
  );

  const scheduledTasks = contentTasks.filter(
    (t: { status: string }) => t.status === "assigned" || t.status === "scheduled"
  );
  const doneTasks = contentTasks.filter(
    (t: { status: string }) => t.status === "done"
  );

  // Fetch Twitter profile for follower count
  useEffect(() => {
    if (isConnected("twitter-x")) {
      execute("twitter-x", "get_me", {}).then((res) => {
        if (res.success && res.result?.data) {
          setTwitterProfile(res.result.data);
        }
      });
    }
  }, [execute, isConnected]);

  const stats = [
    {
      label: "Tasks Scheduled",
      value: String(scheduledTasks.length),
      icon: CalendarDays,
    },
    {
      label: "Completed This Week",
      value: String(
        doneTasks.filter((t: { _creationTime: number }) => {
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          return t._creationTime > oneWeekAgo;
        }).length
      ),
      icon: Send,
    },
    {
      label: "Avg Engagement",
      value: metrics ? `${metrics.engagementRate}%` : "--",
      icon: TrendingUp,
    },
    {
      label: "Followers",
      value: twitterProfile?.followers_count
        ? `${(twitterProfile.followers_count / 1000).toFixed(1)}K`
        : isConnected("twitter-x") ? "..." : "--",
      icon: Users,
    },
  ];

  const isLoading = tasks === undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your content performance across all platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            to={`${config.basePath}/compose`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <PenSquare className="w-4 h-4" />
            New Post
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
                {isLive && (
                  <span className="text-[10px] font-medium text-green-500">Live</span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">
                {metricsLoading && stat.label === "Avg Engagement" ? (
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

      {/* Content Performance Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Content Performance</h2>
          <span className="text-xs text-muted-foreground">
            Last {timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"} days
          </span>
        </div>
        <EngagementChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Upcoming Content</h2>
            <Link
              to={`${config.basePath}/calendar`}
              className="text-xs font-medium hover:underline"
              style={{ color: config.accentColor }}
            >
              View Calendar
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : scheduledTasks.length > 0 ? (
            <div className="space-y-2">
              {scheduledTasks.slice(0, 5).map((task: { _id: string; title: string; status: string; assignee?: string; _creationTime: number }) => {
                const platform = task.title.toLowerCase().includes("twitter")
                  ? "twitter"
                  : task.title.toLowerCase().includes("linkedin")
                  ? "linkedin"
                  : task.title.toLowerCase().includes("instagram")
                  ? "instagram"
                  : "blog";
                const platformInfo = PLATFORM_ICONS[platform];
                return (
                  <div
                    key={task._id}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card hover:border-border/80 transition-colors"
                  >
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold text-white"
                      style={{ background: platformInfo?.color ?? config.accentColor }}
                    >
                      {platformInfo?.icon ?? "?"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {task.assignee ?? "Unassigned"} &middot; {new Date(task._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        task.status === "assigned"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Inbox className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No upcoming content scheduled.
              </p>
              <Link
                to={`${config.basePath}/compose`}
                className="text-xs font-medium mt-2 inline-block hover:underline"
                style={{ color: config.accentColor }}
              >
                Start composing a new post
              </Link>
            </div>
          )}
        </div>

        {/* Trending Topics */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Trending Topics</h2>
          <TrendingTopics />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <Link
          to={`${config.basePath}/compose`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: config.accentColor }}
        >
          <PenSquare className="w-4 h-4" />
          New Post
        </Link>
        <Link
          to={`${config.basePath}/blog`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileText className="w-4 h-4" />
          New Blog
        </Link>
        <Link
          to={`${config.basePath}/calendar`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <Calendar className="w-4 h-4" />
          View Calendar
        </Link>
      </div>

      {/* Agent Activity Panel — live reasoning from active task */}
      {(() => {
        const latestActiveTask = contentTasks.find(
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

      {/* Agent Activity Feed for Content Tasks */}
      {contentTasks.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Recent Content Tasks
          </h2>
          <div className="space-y-3">
            {contentTasks.slice(0, 5).map((task: { _id: string; title: string; status: string; assignee?: string }) => (
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
