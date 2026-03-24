import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Plug,
  RefreshCw,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useNiche } from "../../framework/NicheContext";
import { useContentMetrics } from "../hooks/useContentMetrics";
import { useUserTasks } from "@/hooks/useUserScoped";

export function ContentInsights() {
  const { config } = useNiche();
  const { metrics, loading, isLive, refresh } = useContentMetrics();

  const tasks = useUserTasks();
  const contentTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:content")
  );
  const completedTasks = contentTasks.filter((t: { status: string }) => t.status === "done");
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const completedThisWeek = completedTasks.filter(
    (t: { _creationTime: number }) => t._creationTime > weekAgo
  ).length;

  if (!isLive && !loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <Plug className="w-12 h-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Connect your platforms</h2>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          Link Twitter/X, LinkedIn, or Google Analytics to see live content performance insights
        </p>
        <Link
          to="/integrations"
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: config.accentColor }}
        >
          Connect Integrations
        </Link>
      </div>
    );
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">Content performance across your platforms</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Key metrics */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Impressions", value: metrics.impressions >= 1000 ? `${(metrics.impressions / 1000).toFixed(1)}K` : String(metrics.impressions), icon: Eye },
            { label: "Engagement Rate", value: `${metrics.engagementRate}%`, icon: Heart },
            { label: "Total Likes", value: metrics.likes >= 1000 ? `${(metrics.likes / 1000).toFixed(1)}K` : String(metrics.likes), icon: Heart },
            { label: "Comments", value: String(metrics.comments), icon: MessageCircle },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Content production stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/50 bg-card">
          <p className="text-xs text-muted-foreground">Total Published</p>
          <p className="text-2xl font-bold text-foreground mt-1">{completedTasks.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-border/50 bg-card">
          <p className="text-xs text-muted-foreground">This Week</p>
          <p className="text-2xl font-bold text-foreground mt-1">{completedThisWeek}</p>
        </div>
        <div className="p-4 rounded-xl border border-border/50 bg-card">
          <p className="text-xs text-muted-foreground">In Pipeline</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {contentTasks.filter((t: { status: string }) => t.status !== "done" && t.status !== "cancelled").length}
          </p>
        </div>
      </div>

      {/* Recent content */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Content</h2>
          {completedTasks
            .sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime)
            .slice(0, 8)
            .map((task: { _id: string; title: string; assignee?: string; _creationTime: number }) => (
              <div key={task._id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border/50 bg-card">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.assignee ?? "Agent"} · {new Date(task._creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      {completedTasks.length === 0 && !metrics && (
        <div className="text-center py-12">
          <BarChart3 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No content data yet. Start creating to see insights here.</p>
        </div>
      )}
    </div>
  );
}
