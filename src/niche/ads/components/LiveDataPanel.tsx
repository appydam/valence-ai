import {
  DollarSign,
  TrendingUp,
  Eye,
  MousePointerClick,
  Plug,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useCampaignData } from "../hooks/useCampaignData";

const PLATFORMS = [
  { slug: "google-ads", label: "Google Ads", color: "#4285F4" },
  { slug: "facebook-ads", label: "Meta Ads", color: "#1877F2" },
  { slug: "google-analytics", label: "Analytics", color: "#E37400" },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function LiveDataPanel() {
  const { config } = useNiche();
  const { isConnected } = useIntegrationCall();
  const { campaigns, stats, loading, refresh, hasConnections } = useCampaignData();

  const topCampaigns = [...campaigns]
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 3);

  if (!hasConnections) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <Plug className="w-8 h-8 text-muted-foreground/20 mb-3" />
        <p className="text-xs text-muted-foreground/50 mb-3">
          Connect ad platforms to see live data
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 shrink-0">
        <span className="text-xs font-medium text-foreground/80">Live Data</span>
        <button
          onClick={refresh}
          className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="px-4 py-3 space-y-4 flex-1">
        {/* Connected platforms strip */}
        <div className="flex items-center gap-2">
          {PLATFORMS.map((p) => {
            const connected = isConnected(p.slug);
            return (
              <div
                key={p.slug}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/30 text-[10px]"
                style={{ opacity: connected ? 1 : 0.3 }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: connected ? "#22c55e" : "#6b7280" }}
                />
                <span className="text-muted-foreground/70">{p.label}</span>
              </div>
            );
          })}
        </div>

        {/* Loading state */}
        {loading && campaigns.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
          </div>
        ) : (
          <>
            {/* Key metrics */}
            <div className="space-y-2">
              {[
                {
                  label: "Total Spend",
                  value: `$${stats.totalSpend.toLocaleString()}`,
                  icon: DollarSign,
                  color: "text-yellow-500",
                },
                {
                  label: "Avg ROAS",
                  value: `${stats.averageRoas}x`,
                  icon: TrendingUp,
                  color: stats.averageRoas >= 3 ? "text-green-500" : stats.averageRoas >= 2 ? "text-yellow-500" : "text-red-400",
                },
                {
                  label: "Impressions",
                  value: formatNumber(stats.totalImpressions),
                  icon: Eye,
                  color: "text-blue-400",
                },
                {
                  label: "CTR",
                  value: `${stats.averageCtr}%`,
                  icon: MousePointerClick,
                  color: stats.averageCtr >= 2 ? "text-green-500" : "text-muted-foreground/60",
                },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/20 bg-background/50"
                  >
                    <Icon className={`w-3.5 h-3.5 ${metric.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground/50">{metric.label}</p>
                      <p className="text-sm font-bold text-foreground leading-none mt-0.5">
                        {metric.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top campaigns */}
            {topCampaigns.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
                  Top Campaigns
                </h3>
                <div className="space-y-1.5">
                  {topCampaigns.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/15 bg-background/30"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          c.status === "active"
                            ? "bg-green-500"
                            : c.status === "paused"
                              ? "bg-yellow-500"
                              : "bg-muted-foreground/30"
                        }`}
                      />
                      <span className="text-[11px] text-foreground/70 truncate flex-1">
                        {c.name}
                      </span>
                      <span
                        className={`text-[11px] font-bold shrink-0 ${
                          c.roas >= 3
                            ? "text-green-500"
                            : c.roas >= 2
                              ? "text-yellow-500"
                              : c.roas > 0
                                ? "text-red-400"
                                : "text-muted-foreground/30"
                        }`}
                      >
                        {c.roas > 0 ? `${c.roas}x` : "--"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Link to insights */}
            <Link
              to="/niche/ads/insights"
              className="block text-center text-[11px] font-medium hover:underline transition-colors mt-2"
              style={{ color: config.accentColor }}
            >
              View All Insights →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
