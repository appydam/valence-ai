import { useState, useEffect, useCallback } from "react";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

export interface CampaignData {
  id: string;
  name: string;
  platform: "google" | "facebook" | "instagram" | "tiktok";
  status: "active" | "paused" | "draft";
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  roas: number;
}

export interface AggregateStats {
  totalSpend: number;
  totalSpendChange: string;
  totalSpendUp: boolean;
  averageRoas: number;
  averageRoasChange: string;
  averageRoasUp: boolean;
  totalImpressions: number;
  totalImpressionsChange: string;
  totalImpressionsUp: boolean;
  averageCtr: number;
  averageCtrChange: string;
  averageCtrUp: boolean;
}

const EMPTY_STATS: AggregateStats = {
  totalSpend: 0,
  totalSpendChange: "—",
  totalSpendUp: false,
  averageRoas: 0,
  averageRoasChange: "—",
  averageRoasUp: false,
  totalImpressions: 0,
  totalImpressionsChange: "—",
  totalImpressionsUp: false,
  averageCtr: 0,
  averageCtrChange: "—",
  averageCtrUp: false,
};

function buildStatsFromCampaigns(campaigns: CampaignData[]): AggregateStats {
  const active = campaigns.filter((c) => c.status === "active");
  if (active.length === 0) return EMPTY_STATS;

  const totalSpend = active.reduce((s, c) => s + c.spend, 0);
  const totalImpressions = active.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = active.reduce((s, c) => s + c.clicks, 0);
  const roasArr = active.filter((c) => c.roas > 0).map((c) => c.roas);
  const averageRoas =
    roasArr.length > 0
      ? Math.round((roasArr.reduce((a, b) => a + b, 0) / roasArr.length) * 10) / 10
      : 0;
  const averageCtr =
    totalImpressions > 0
      ? Math.round(((totalClicks / totalImpressions) * 100) * 10) / 10
      : 0;

  return {
    totalSpend,
    totalSpendChange: "—",
    totalSpendUp: false,
    averageRoas,
    averageRoasChange: "—",
    averageRoasUp: false,
    totalImpressions,
    totalImpressionsChange: "—",
    totalImpressionsUp: false,
    averageCtr,
    averageCtrChange: "—",
    averageCtrUp: false,
  };
}

export function useCampaignData() {
  const { execute, isConnected, loading: integrationLoading, connectionsLoaded } = useIntegrationCall();
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [stats, setStats] = useState<AggregateStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const googleConnected = isConnected("google-ads");
  const facebookConnected = isConnected("facebook-ads");

  const refresh = useCallback(async () => {
    if (!connectionsLoaded) return;

    if (!googleConnected && !facebookConnected) {
      setCampaigns([]);
      setStats(EMPTY_STATS);
      setIsLive(false);
      return;
    }

    setLoading(true);
    const liveCampaigns: CampaignData[] = [];

    try {
      if (googleConnected) {
        const result = await execute("google-ads", "search_campaigns", {
          query:
            "SELECT campaign.name, campaign.status, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value FROM campaign WHERE campaign.status != 'REMOVED' ORDER BY metrics.cost_micros DESC",
        });
        if (result.success && Array.isArray(result.result)) {
          for (const row of result.result) {
            const costMicros = row.metrics?.cost_micros ?? 0;
            const impressions = row.metrics?.impressions ?? 0;
            const clicks = row.metrics?.clicks ?? 0;
            const conversions = row.metrics?.conversions ?? 0;
            const conversionsValue = row.metrics?.conversions_value ?? 0;
            const spend = costMicros / 1_000_000;
            liveCampaigns.push({
              id: `g-${row.campaign?.id ?? liveCampaigns.length}`,
              name: row.campaign?.name ?? "Google Campaign",
              platform: "google",
              status:
                row.campaign?.status === "ENABLED"
                  ? "active"
                  : row.campaign?.status === "PAUSED"
                  ? "paused"
                  : "draft",
              spend,
              impressions,
              clicks,
              conversions,
              ctr: impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0,
              roas: spend > 0 ? Math.round((conversionsValue / spend) * 10) / 10 : 0,
            });
          }
        }
      }

      if (facebookConnected) {
        // Fetch campaigns
        const campaignsResult = await execute("facebook-ads", "get_campaigns", {
          fields: "name,status,objective",
        });

        if (campaignsResult.success && Array.isArray(campaignsResult.result?.data ?? campaignsResult.result)) {
          const fbCampaigns = campaignsResult.result?.data ?? campaignsResult.result ?? [];

          // Fetch insights for each campaign
          for (const fbCamp of fbCampaigns) {
            const insightsResult = await execute("facebook-ads", "get_campaign_insights", {
              campaign_id: fbCamp.id,
              fields: "spend,impressions,clicks,cpc,ctr,actions",
              date_preset: "last_30d",
            });

            const insights = insightsResult.success
              ? (insightsResult.result?.data?.[0] ?? insightsResult.result ?? {})
              : {};

            const spend = parseFloat(insights.spend ?? "0");
            const impressions = parseInt(insights.impressions ?? "0", 10);
            const clicks = parseInt(insights.clicks ?? "0", 10);
            const conversionAction = (insights.actions ?? []).find(
              (a: { action_type: string; value: string }) =>
                a.action_type === "offsite_conversion" ||
                a.action_type === "purchase" ||
                a.action_type === "lead"
            );
            const conversions = Number(conversionAction?.value ?? 0);

            liveCampaigns.push({
              id: `f-${fbCamp.id ?? liveCampaigns.length}`,
              name: fbCamp.name ?? "Facebook Campaign",
              platform: "facebook",
              status:
                fbCamp.status === "ACTIVE"
                  ? "active"
                  : fbCamp.status === "PAUSED"
                  ? "paused"
                  : "draft",
              spend,
              impressions,
              clicks,
              conversions,
              ctr: impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0,
              roas: spend > 0 ? Math.round((conversions * 50) / spend * 10) / 10 : 0,
            });
          }
        }
      }

      setCampaigns(liveCampaigns);
      setStats(buildStatsFromCampaigns(liveCampaigns));
      setIsLive(liveCampaigns.length > 0);
    } catch {
      setCampaigns([]);
      setStats(EMPTY_STATS);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [googleConnected, facebookConnected, execute, connectionsLoaded]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    campaigns,
    stats,
    loading: loading || integrationLoading,
    refresh,
    isLive,
    hasConnections: googleConnected || facebookConnected,
  };
}
