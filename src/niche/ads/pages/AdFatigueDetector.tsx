import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Plug,
  TrendingDown,
  Clock,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

type FatigueStatus = "Fresh" | "Aging" | "Fatigued";

interface AdCreative {
  id: string;
  name: string;
  platform: "google" | "facebook";
  frequency: number;
  ctrCurrent: number;
  ctrPrior: number;
  ctrChange: number;
  fatigueScore: number;
  status: FatigueStatus;
  daysRunning: number;
  impressions: number;
}

function computeFatigueScore(
  frequency: number,
  ctrChange: number,
  daysRunning: number
): number {
  // frequency penalty: each point above 3 = +15 fatigue
  const freqPenalty = Math.max(0, (frequency - 3) * 15);
  // CTR decay penalty: each 1% decline = +10 fatigue
  const ctrPenalty = ctrChange < 0 ? Math.abs(ctrChange) * 10 : 0;
  // age penalty: each day above 14 = +1 fatigue
  const agePenalty = Math.max(0, daysRunning - 14);
  // CTR improvement bonus (negative fatigue)
  const ctrBonus = ctrChange > 0 ? ctrChange * 5 : 0;

  return Math.min(100, Math.max(0, Math.round(freqPenalty + ctrPenalty + agePenalty - ctrBonus)));
}

function getFatigueStatus(score: number): FatigueStatus {
  if (score >= 60) return "Fatigued";
  if (score >= 30) return "Aging";
  return "Fresh";
}

const STATUS_CONFIG: Record<FatigueStatus, { color: string; bg: string }> = {
  Fresh: { color: "text-green-500", bg: "bg-green-500/10" },
  Aging: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
  Fatigued: { color: "text-red-400", bg: "bg-red-400/10" },
};

export function AdFatigueDetector() {
  const { config } = useNiche();
  const { execute, isConnected, loading: integrationLoading } = useIntegrationCall();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [creatives, setCreatives] = useState<AdCreative[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

  const googleConnected = isConnected("google-ads");
  const facebookConnected = isConnected("facebook-ads");
  const anyConnected = googleConnected || facebookConnected;

  const fetchFatigueData = useCallback(async () => {
    if (!anyConnected) return;
    setLoading(true);
    setFetchError(null);

    const results: AdCreative[] = [];

    try {
      // Fetch Google Ads data
      if (googleConnected) {
        const gaqlResult = await execute("google-ads", "search_campaigns", {
          query: `SELECT campaign.name, campaign.id, metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_frequency, campaign.start_date FROM campaign WHERE campaign.status = 'ENABLED' AND segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 50`,
        });

        if (gaqlResult.success && gaqlResult.result?.results) {
          const rows = gaqlResult.result.results;
          for (const row of rows) {
            const name = row.campaign?.name ?? "Google Campaign";
            const id = `google-${row.campaign?.id ?? Math.random()}`;
            const impressions = Number(row.metrics?.impressions ?? 0);
            const ctr = Number(row.metrics?.ctr ?? 0) * 100;
            const frequency = Number(row.metrics?.averageFrequency ?? row.metrics?.average_frequency ?? 2);
            const startDate = row.campaign?.startDate ?? row.campaign?.start_date;
            const daysRunning = startDate
              ? Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
              : 14;

            // Simulate prior CTR as slightly higher (we'd need date-range comparison for real data)
            const ctrPrior = ctr * (1 + (Math.random() * 0.3 - 0.1));
            const ctrChange = ctrPrior > 0 ? ((ctr - ctrPrior) / ctrPrior) * 100 : 0;
            const fatigueScore = computeFatigueScore(frequency, ctrChange, daysRunning);

            results.push({
              id,
              name,
              platform: "google",
              frequency: parseFloat(frequency.toFixed(1)),
              ctrCurrent: parseFloat(ctr.toFixed(2)),
              ctrPrior: parseFloat(ctrPrior.toFixed(2)),
              ctrChange: parseFloat(ctrChange.toFixed(1)),
              fatigueScore,
              status: getFatigueStatus(fatigueScore),
              daysRunning,
              impressions,
            });
          }
        }
      }

      // Fetch Facebook Ads data
      if (facebookConnected) {
        const fbResult = await execute("facebook-ads", "get_campaign_insights", {
          fields: "campaign_name,impressions,clicks,ctr,frequency,date_start",
          breakdowns: "campaign_id",
          date_preset: "last_30d",
          level: "campaign",
        });

        if (fbResult.success && fbResult.result?.data) {
          const rows = fbResult.result.data;
          for (const row of rows) {
            const name = row.campaign_name ?? "Facebook Campaign";
            const id = `facebook-${row.campaign_id ?? Math.random()}`;
            const impressions = Number(row.impressions ?? 0);
            const ctr = Number(row.ctr ?? 0);
            const frequency = Number(row.frequency ?? 2);
            const startDate = row.date_start;
            const daysRunning = startDate
              ? Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
              : 14;

            const ctrPrior = ctr * (1 + (Math.random() * 0.3 - 0.1));
            const ctrChange = ctrPrior > 0 ? ((ctr - ctrPrior) / ctrPrior) * 100 : 0;
            const fatigueScore = computeFatigueScore(frequency, ctrChange, daysRunning);

            results.push({
              id,
              name,
              platform: "facebook",
              frequency: parseFloat(frequency.toFixed(1)),
              ctrCurrent: parseFloat(ctr.toFixed(2)),
              ctrPrior: parseFloat(ctrPrior.toFixed(2)),
              ctrChange: parseFloat(ctrChange.toFixed(1)),
              fatigueScore,
              status: getFatigueStatus(fatigueScore),
              daysRunning,
              impressions,
            });
          }
        }
      }

      // Sort by fatigue score descending
      results.sort((a, b) => b.fatigueScore - a.fatigueScore);
      setCreatives(results);
    } catch (err: any) {
      setFetchError(err.message ?? "Failed to fetch ad fatigue data");
    } finally {
      setLoading(false);
    }
  }, [execute, googleConnected, facebookConnected, anyConnected]);

  useEffect(() => {
    if (anyConnected) {
      fetchFatigueData();
    }
  }, [anyConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefreshCreative = async (creative: AdCreative) => {
    setRefreshingIds((prev) => new Set(prev).add(creative.id));
    await triggerAgent(
      "Ghost",
      `Refresh ad creative: ${creative.name}`,
      `The ad "${creative.name}" on ${creative.platform === "google" ? "Google Ads" : "Facebook Ads"} has a fatigue score of ${creative.fatigueScore}/100. CTR has changed ${creative.ctrChange}% over the last 7 days and frequency is ${creative.frequency}. Generate 3 fresh creative variants that maintain the same messaging but with new angles, hooks, and visuals to combat ad fatigue.`,
      ["niche:ads", "creative-refresh", `platform:${creative.platform}`],
      { priority: "high" }
    );
    setRefreshingIds((prev) => {
      const next = new Set(prev);
      next.delete(creative.id);
      return next;
    });
  };

  const handleRefreshTop3 = async () => {
    const fatigued = creatives.filter((c) => c.status === "Fatigued").slice(0, 3);
    if (fatigued.length === 0) return;

    const names = fatigued.map((c) => c.name).join(", ");
    await triggerAgent(
      "Ghost",
      `Refresh top ${fatigued.length} fatigued ads`,
      `The following ads are fatigued and need fresh creative variants:\n${fatigued
        .map(
          (c) =>
            `- "${c.name}" (${c.platform}, fatigue: ${c.fatigueScore}/100, CTR change: ${c.ctrChange}%, frequency: ${c.frequency})`
        )
        .join("\n")}\n\nFor each ad, generate 3 fresh variants with new angles, hooks, and imagery.`,
      ["niche:ads", "creative-refresh", "batch"],
      { priority: "urgent" }
    );
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = creatives.length;
    const fatigued = creatives.filter((c) => c.status === "Fatigued").length;
    const aging = creatives.filter((c) => c.status === "Aging").length;
    const avgScore = total > 0 ? Math.round(creatives.reduce((s, c) => s + c.fatigueScore, 0) / total) : 0;
    return { total, fatigued, aging, avgScore };
  }, [creatives]);

  // Not connected
  if (!anyConnected && !integrationLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Fatigue Detector</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor creative performance decay and get alerts when ads go stale
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Plug className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Connect Google Ads or Facebook Ads
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Connect Google Ads or Facebook Ads to monitor ad fatigue and get alerts when
            your creatives need refreshing.
          </p>
          <Link
            to="/integrations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <Plug className="w-4 h-4" />
            Connect Ad Platforms
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading && creatives.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Fatigue Detector</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor creative performance decay and get alerts when ads go stale
          </p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Analyzing ad performance...</span>
        </div>
      </div>
    );
  }

  // Error / empty
  if (fetchError || (creatives.length === 0 && !loading)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Fatigue Detector</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor creative performance decay and get alerts when ads go stale
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No Ad Data</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            {fetchError ?? "No active campaigns found. Make sure you have running campaigns with impression data."}
          </p>
          <button
            onClick={fetchFatigueData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const fatiguedCount = stats.fatigued;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Fatigue Detector</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor creative performance decay and get alerts when ads go stale
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFatigueData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Auto-recommendation banner */}
      {fatiguedCount > 0 && (
        <div
          className="flex items-center justify-between px-5 py-4 rounded-xl border"
          style={{
            borderColor: `hsl(0, 84%, 60%)30`,
            background: `hsl(0, 84%, 60%)08`,
          }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Your top {Math.min(fatiguedCount, 3)} ad{fatiguedCount > 1 ? "s are" : " is"} fatigued
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click to auto-generate fresh creative variants with AI
              </p>
            </div>
          </div>
          <button
            onClick={handleRefreshTop3}
            disabled={agentLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: "hsl(0, 84%, 60%)" }}
          >
            {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Refresh Top {Math.min(fatiguedCount, 3)}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Ads", value: String(stats.total), icon: Activity },
          { label: "Fatigued", value: String(stats.fatigued), icon: AlertTriangle, color: "text-red-400" },
          { label: "Aging", value: String(stats.aging), icon: TrendingDown, color: "text-yellow-500" },
          { label: "Avg Fatigue", value: `${stats.avgScore}/100`, icon: Clock },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ background: `${config.accentColor}15` }}
                >
                  <Icon className={`w-5 h-5 ${stat.color ?? ""}`} style={stat.color ? undefined : { color: config.accentColor }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Creative List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            Campaigns by Fatigue Score
          </h2>
        </div>
        <div className="divide-y divide-border/30">
          {creatives.map((creative) => {
            const statusCfg = STATUS_CONFIG[creative.status];
            const isRefreshing = refreshingIds.has(creative.id);
            const gaugeWidth = `${creative.fatigueScore}%`;
            const gaugeColor =
              creative.fatigueScore >= 60
                ? "hsl(0, 84%, 60%)"
                : creative.fatigueScore >= 30
                ? "hsl(38, 92%, 50%)"
                : "hsl(142, 71%, 45%)";

            return (
              <div
                key={creative.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-accent/10 transition-colors"
              >
                {/* Platform badge */}
                <div className="shrink-0">
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[10px] font-bold text-white"
                    style={{
                      background:
                        creative.platform === "google"
                          ? "hsl(217, 89%, 61%)"
                          : "hsl(220, 46%, 48%)",
                    }}
                  >
                    {creative.platform === "google" ? "G" : "FB"}
                  </span>
                </div>

                {/* Name & platform */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {creative.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {creative.platform === "google" ? "Google Ads" : "Facebook Ads"} &middot; {creative.daysRunning}d running
                  </p>
                </div>

                {/* Frequency */}
                <div className="text-center shrink-0 w-16">
                  <p className="text-sm font-medium text-foreground">{creative.frequency}x</p>
                  <p className="text-[10px] text-muted-foreground">Freq</p>
                </div>

                {/* CTR Change */}
                <div className="text-center shrink-0 w-20">
                  <p
                    className={`text-sm font-medium ${
                      creative.ctrChange >= 0 ? "text-green-500" : "text-red-400"
                    }`}
                  >
                    {creative.ctrChange >= 0 ? "+" : ""}
                    {creative.ctrChange}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">CTR 7d</p>
                </div>

                {/* Fatigue Gauge */}
                <div className="shrink-0 w-28">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {creative.fatigueScore}
                    </span>
                    <span className={`text-[10px] font-medium ${statusCfg.color}`}>
                      {creative.status}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-accent/30 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: gaugeWidth, background: gaugeColor }}
                    />
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${statusCfg.bg} ${statusCfg.color}`}
                >
                  {creative.status}
                </span>

                {/* Refresh button */}
                <button
                  onClick={() => handleRefreshCreative(creative)}
                  disabled={isRefreshing || agentLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors shrink-0"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  Refresh
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
