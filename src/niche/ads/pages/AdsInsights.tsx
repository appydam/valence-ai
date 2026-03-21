import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plug,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useCampaignData } from "../hooks/useCampaignData";

export function AdsInsights() {
  const { config } = useNiche();
  const { campaigns, stats, loading, isLive, hasConnections, refresh } = useCampaignData();

  if (!hasConnections && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <Plug className="w-12 h-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Connect your ad platforms</h2>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          Link Google Ads or Facebook Ads to see live performance insights powered by AI
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const topCampaign = [...campaigns].sort((a, b) => b.roas - a.roas)[0];
  const worstCampaign = [...campaigns].filter((c) => c.spend > 0).sort((a, b) => a.roas - b.roas)[0];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">AI-analyzed performance across your campaigns</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spend", value: `$${stats.totalSpend.toLocaleString()}`, icon: DollarSign },
          { label: "Avg ROAS", value: `${stats.averageRoas}x`, icon: TrendingUp },
          { label: "Impressions", value: stats.totalImpressions >= 1000 ? `${(stats.totalImpressions / 1000).toFixed(0)}K` : String(stats.totalImpressions), icon: Eye },
          { label: "Avg CTR", value: `${stats.averageCtr}%`, icon: MousePointerClick },
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

      {/* Campaign list */}
      {campaigns.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Campaigns</h2>
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border/50 bg-card">
              <div className={`w-2 h-2 rounded-full ${campaign.status === "active" ? "bg-green-500" : campaign.status === "paused" ? "bg-yellow-500" : "bg-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{campaign.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{campaign.platform} · {campaign.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">${campaign.spend.toLocaleString()}</p>
                <p className={`text-xs font-medium ${campaign.roas >= 3 ? "text-green-500" : campaign.roas >= 2 ? "text-yellow-500" : "text-red-400"}`}>
                  {campaign.roas > 0 ? `${campaign.roas}x ROAS` : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No campaign data yet. Run some campaigns to see insights here.</p>
        </div>
      )}
    </div>
  );
}
