import { useMemo } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Plug, Loader2 } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { type CampaignData } from "../hooks/useCampaignData";

interface Recommendation {
  platform: string;
  currentSpend: number;
  suggestedSpend: number;
  reason: string;
  impact: "increase" | "decrease" | "maintain";
}

interface BudgetOptimizerProps {
  campaigns: CampaignData[];
  loading?: boolean;
  hasConnections?: boolean;
}

/**
 * Computes budget recommendations from real campaign data.
 * Recommends increasing budget for high-ROAS platforms and decreasing for low-ROAS ones.
 */
function computeRecommendations(campaigns: CampaignData[]): Recommendation[] {
  const active = campaigns.filter((c) => c.status === "active" && c.spend > 0);
  if (active.length === 0) return [];

  // Group by platform
  const platformMap = new Map<string, { totalSpend: number; totalConversions: number; avgRoas: number; count: number }>();
  for (const c of active) {
    const existing = platformMap.get(c.platform) ?? { totalSpend: 0, totalConversions: 0, avgRoas: 0, count: 0 };
    existing.totalSpend += c.spend;
    existing.totalConversions += c.conversions;
    existing.avgRoas += c.roas;
    existing.count += 1;
    platformMap.set(c.platform, existing);
  }

  const overallAvgRoas =
    active.reduce((sum, c) => sum + c.roas, 0) / active.length;

  const platformNames: Record<string, string> = {
    google: "Google Ads",
    facebook: "Facebook Ads",
    instagram: "Instagram",
    tiktok: "TikTok",
  };

  const recommendations: Recommendation[] = [];
  for (const [platform, data] of platformMap) {
    const avgRoas = data.count > 0 ? data.avgRoas / data.count : 0;
    const cpa = data.totalConversions > 0 ? data.totalSpend / data.totalConversions : Infinity;

    let impact: Recommendation["impact"];
    let suggestedSpend: number;
    let reason: string;

    if (avgRoas >= overallAvgRoas * 1.15) {
      // Performing well above average — increase
      impact = "increase";
      suggestedSpend = Math.round(data.totalSpend * 1.2);
      reason = `High ROAS (${avgRoas.toFixed(1)}x) — increasing budget will capture more conversions at $${cpa.toFixed(2)} CPA`;
    } else if (avgRoas < overallAvgRoas * 0.8) {
      // Performing below average — decrease
      impact = "decrease";
      suggestedSpend = Math.round(data.totalSpend * 0.7);
      reason = `Below-average ROAS (${avgRoas.toFixed(1)}x) — reduce and reinvest in higher-performing platforms`;
    } else {
      // Near average — maintain
      impact = "maintain";
      suggestedSpend = Math.round(data.totalSpend);
      reason = `Average ROAS (${avgRoas.toFixed(1)}x) — maintain current budget and monitor performance`;
    }

    recommendations.push({
      platform: platformNames[platform] ?? platform,
      currentSpend: Math.round(data.totalSpend),
      suggestedSpend,
      reason,
      impact,
    });
  }

  return recommendations.sort((a, b) => {
    const order = { increase: 0, maintain: 1, decrease: 2 };
    return order[a.impact] - order[b.impact];
  });
}

export function BudgetOptimizer({ campaigns, loading, hasConnections }: BudgetOptimizerProps) {
  const { config } = useNiche();

  const recommendations = useMemo(() => computeRecommendations(campaigns), [campaigns]);
  const totalCurrent = recommendations.reduce((s, r) => s + r.currentSpend, 0);
  const totalSuggested = recommendations.reduce((s, r) => s + r.suggestedSpend, 0);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Analyzing budgets...</span>
        </div>
      </div>
    );
  }

  if (!hasConnections) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: config.accentColor }} />
          AI Budget Recommendations
        </h2>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Plug className="w-6 h-6 text-muted-foreground/40 mb-2" />
          <p className="text-xs text-muted-foreground mb-2">
            Connect ad platforms to get AI budget recommendations
          </p>
          <Link
            to="/integrations"
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            style={{ background: config.accentColor, color: "white" }}
          >
            Connect Integrations
          </Link>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: config.accentColor }} />
          AI Budget Recommendations
        </h2>
        <p className="text-xs text-muted-foreground text-center py-4">
          No active campaigns with spend data to analyze yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: config.accentColor }} />
          AI Budget Recommendations
        </h2>
        <span className="text-xs text-muted-foreground">
          Total: ${totalCurrent.toLocaleString()} → ${totalSuggested.toLocaleString()}
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.platform}
            className="flex items-start gap-3 px-3 py-3 rounded-lg bg-accent/20"
          >
            <div className="mt-0.5">
              {rec.impact === "increase" ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : rec.impact === "decrease" ? (
                <TrendingDown className="w-4 h-4 text-red-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{rec.platform}</span>
                <span className="text-xs font-medium">
                  <span className="text-muted-foreground">${rec.currentSpend.toLocaleString()}</span>
                  <span className="text-muted-foreground/50 mx-1">→</span>
                  <span
                    className={
                      rec.impact === "increase" ? "text-green-500" : rec.impact === "decrease" ? "text-red-400" : "text-foreground"
                    }
                  >
                    ${rec.suggestedSpend.toLocaleString()}
                  </span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="w-full px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
      >
        Apply Recommended Budget
      </button>
    </div>
  );
}
