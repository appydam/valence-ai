import {
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Plug,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useContentMetrics } from "../hooks/useContentMetrics";

const PLATFORMS = [
  { slug: "twitter-x", label: "Twitter/X", color: "#1DA1F2" },
  { slug: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { slug: "instagram", label: "Instagram", color: "#E1306C" },
  { slug: "google-analytics", label: "Analytics", color: "#E37400" },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ContentDataPanel() {
  const { config } = useNiche();
  const { isConnected } = useIntegrationCall();
  const { metrics, loading, isLive, refresh } = useContentMetrics();

  const hasConnections = PLATFORMS.some((p) => isConnected(p.slug));

  // Recent content tasks
  const tasks = useQuery(api.tasks.list, {});
  const recentContent = (tasks ?? [])
    .filter((t: { tags?: string[]; status: string }) => t.tags?.includes("niche:content") && t.status === "done")
    .sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime)
    .slice(0, 4);

  if (!hasConnections && !isLive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <Plug className="w-8 h-8 text-muted-foreground/20 mb-3" />
        <p className="text-xs text-muted-foreground/50 mb-3">
          Connect platforms to see live engagement data
        </p>
        <Link
          to="/integrations"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white transition-colors"
          style={{ background: config.accentColor }}
        >
          <Plug className="w-3 h-3" />
          Connect Platforms
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 shrink-0">
        <span className="text-xs font-medium text-foreground/80">Live Engagement</span>
        <button
          onClick={refresh}
          className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="px-4 py-3 space-y-4 flex-1">
        {/* Connected platforms */}
        <div className="flex items-center gap-2 flex-wrap">
          {PLATFORMS.map((p) => {
            const connected = isConnected(p.slug);
            return (
              <div
                key={p.slug}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/30 text-[10px]"
                style={{ opacity: connected ? 1 : 0.3 }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: connected ? "#22c55e" : "#6b7280" }} />
                <span className="text-muted-foreground/70">{p.label}</span>
              </div>
            );
          })}
        </div>

        {loading && !metrics ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
          </div>
        ) : metrics ? (
          <>
            {/* Key metrics */}
            <div className="space-y-2">
              {[
                { label: "Impressions", value: formatNumber(metrics.impressions), icon: Eye, color: "text-blue-400" },
                { label: "Likes", value: formatNumber(metrics.likes), icon: Heart, color: "text-pink-400" },
                { label: "Comments", value: formatNumber(metrics.comments), icon: MessageCircle, color: "text-green-400" },
                { label: "Shares", value: formatNumber(metrics.shares), icon: Share2, color: "text-purple-400" },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/20 bg-background/50">
                    <Icon className={`w-3.5 h-3.5 ${metric.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground/50">{metric.label}</p>
                      <p className="text-sm font-bold text-foreground leading-none mt-0.5">{metric.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Engagement rate highlight */}
            <div
              className="px-3 py-2.5 rounded-lg border"
              style={{ borderColor: `${config.accentColor}30`, background: `${config.accentColor}08` }}
            >
              <p className="text-[10px] text-muted-foreground/50">Engagement Rate</p>
              <p className="text-lg font-bold" style={{ color: config.accentColor }}>
                {metrics.engagementRate}%
              </p>
            </div>

            {/* Recent published content */}
            {recentContent.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
                  Recent Content
                </h3>
                <div className="space-y-1.5">
                  {recentContent.map((task: { _id: string; title: string; assignee?: string }) => (
                    <div key={task._id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/15 bg-background/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="text-[11px] text-foreground/70 truncate flex-1">{task.title}</span>
                      {task.assignee && (
                        <span className="text-[10px] text-muted-foreground/40 shrink-0">{task.assignee}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              to="/niche/content/insights"
              className="block text-center text-[11px] font-medium hover:underline transition-colors mt-2"
              style={{ color: config.accentColor }}
            >
              View All Insights →
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
