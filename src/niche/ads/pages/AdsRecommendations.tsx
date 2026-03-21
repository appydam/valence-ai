import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  Loader2,
  Plug,
  RefreshCw,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  X,
  TrendingUp,
  Zap,
  Target,
  DollarSign,
  Search,
  FileText,
  Link2,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

type RecommendationType =
  | "KEYWORD"
  | "BUDGET"
  | "BID"
  | "AD"
  | "EXTENSION"
  | "TARGETING"
  | "OTHER";

type ImpactLevel = "HIGH" | "MEDIUM" | "LOW";

interface Recommendation {
  id: string;
  type: RecommendationType;
  rawType: string;
  impact: ImpactLevel;
  campaign: string;
  campaignName: string;
  description: string;
  estimatedUplift: string | null;
}

const CATEGORY_ALL = "ALL" as const;

type FilterCategory = RecommendationType | typeof CATEGORY_ALL;

const TYPE_CONFIG: Record<
  RecommendationType,
  { label: string; icon: typeof Sparkles; color: string; bg: string }
> = {
  KEYWORD: {
    label: "Keyword",
    icon: Search,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  BUDGET: {
    label: "Budget",
    icon: DollarSign,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  BID: {
    label: "Bid",
    icon: TrendingUp,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  AD: {
    label: "Ad",
    icon: FileText,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  EXTENSION: {
    label: "Extension",
    icon: Link2,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  TARGETING: {
    label: "Targeting",
    icon: MapPin,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  OTHER: {
    label: "Other",
    icon: Zap,
    color: "text-muted-foreground",
    bg: "bg-accent/50",
  },
};

const IMPACT_CONFIG: Record<
  ImpactLevel,
  { label: string; icon: typeof ArrowUp; color: string; bg: string }
> = {
  HIGH: {
    label: "High",
    icon: ArrowUp,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  MEDIUM: {
    label: "Medium",
    icon: ArrowRight,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  LOW: {
    label: "Low",
    icon: ArrowDown,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
};

function classifyType(rawType: string): RecommendationType {
  const t = rawType.toUpperCase();
  if (t.includes("KEYWORD") || t.includes("SEARCH_TERM")) return "KEYWORD";
  if (t.includes("BUDGET") || t.includes("MOVE_UNUSED_BUDGET")) return "BUDGET";
  if (t.includes("BID") || t.includes("TARGET_CPA") || t.includes("TARGET_ROAS"))
    return "BID";
  if (
    t.includes("AD") ||
    t.includes("RESPONSIVE_SEARCH") ||
    t.includes("TEXT_AD") ||
    t.includes("EXPANDED")
  )
    return "AD";
  if (
    t.includes("SITELINK") ||
    t.includes("CALLOUT") ||
    t.includes("CALL") ||
    t.includes("EXTENSION")
  )
    return "EXTENSION";
  if (
    t.includes("TARGET") ||
    t.includes("LOCATION") ||
    t.includes("AUDIENCE") ||
    t.includes("DEMOGRAPHIC")
  )
    return "TARGETING";
  return "OTHER";
}

function classifyImpact(raw: any): ImpactLevel {
  if (!raw) return "LOW";
  const baseMetric =
    raw.baseMetrics?.impressions ?? raw.base_metrics?.impressions ?? 0;
  const potentialMetric =
    raw.potentialMetrics?.impressions ?? raw.potential_metrics?.impressions ?? 0;
  const ratio = baseMetric > 0 ? potentialMetric / baseMetric : 1;
  if (ratio >= 1.3) return "HIGH";
  if (ratio >= 1.1) return "MEDIUM";
  return "LOW";
}

function describeRecommendation(rawType: string): string {
  const mapping: Record<string, string> = {
    KEYWORD: "Add new keywords to reach more relevant search traffic",
    KEYWORD_MATCH_TYPE:
      "Update keyword match types to capture broader or more precise searches",
    MOVE_UNUSED_BUDGET:
      "Reallocate unused budget from underperforming campaigns to those hitting limits",
    CAMPAIGN_BUDGET: "Increase budget for campaigns that are limited by budget",
    TARGET_CPA_OPT_IN:
      "Switch to Target CPA bidding to let Google optimize bids automatically",
    TARGET_ROAS_OPT_IN:
      "Switch to Target ROAS bidding for automated return-based optimization",
    MAXIMIZE_CONVERSIONS_OPT_IN:
      "Use Maximize Conversions bidding for automated conversion optimization",
    ENHANCED_CPC_OPT_IN:
      "Enable Enhanced CPC to let Google adjust bids based on conversion likelihood",
    RESPONSIVE_SEARCH_AD:
      "Add or improve responsive search ads for better ad combinations",
    TEXT_AD: "Update text ads with more relevant headlines and descriptions",
    SITELINK_EXTENSION:
      "Add sitelink extensions to show additional links below your ads",
    CALLOUT_EXTENSION:
      "Add callout extensions to highlight key features or offers",
    CALL_EXTENSION: "Add a call extension so users can call you directly from the ad",
    OPTIMIZE_AD_ROTATION:
      "Let Google optimize ad rotation to show better-performing ads more often",
    SEARCH_PARTNERS_OPT_IN:
      "Expand to Google Search Partners for additional reach",
  };
  const t = rawType.toUpperCase();
  return (
    mapping[t] ??
    `Google recommends: ${rawType.replace(/_/g, " ").toLowerCase()}`
  );
}

export function AdsRecommendations() {
  const { config } = useNiche();
  const {
    execute,
    isConnected,
    connectionsLoaded,
    loading: callLoading,
  } = useIntegrationCall();

  const connected = isConnected("google-ads");

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("ALL");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!connected) return;
    setLoadingData(true);
    try {
      const result = await execute("google-ads", "get_recommendations", {
        query:
          "SELECT recommendation.type, recommendation.impact, recommendation.campaign, recommendation.resource_name FROM recommendation WHERE recommendation.dismissed = false",
      });
      if (result.success && Array.isArray(result.result)) {
        const parsed: Recommendation[] = result.result.map(
          (r: any, idx: number) => {
            const rec = r.recommendation ?? r;
            const rawType = rec.type ?? "UNKNOWN";
            const type = classifyType(rawType);
            const impact = classifyImpact(rec.impact);
            const campaignResource =
              rec.campaign ?? rec.campaignBudget ?? "";
            const campaignName =
              typeof campaignResource === "string"
                ? campaignResource.split("/").pop() ?? ""
                : "";
            return {
              id: rec.resourceName ?? rec.resource_name ?? `rec-${idx}`,
              type,
              rawType,
              impact,
              campaign: campaignResource,
              campaignName,
              description: describeRecommendation(rawType),
              estimatedUplift: null,
            };
          }
        );
        setRecommendations(parsed);
      }
    } catch {
      // silent
    } finally {
      setLoadingData(false);
    }
  }, [connected, execute]);

  useEffect(() => {
    if (connectionsLoaded && connected) {
      fetchRecommendations();
    }
  }, [connectionsLoaded, connected, fetchRecommendations]);

  const handleApply = async (rec: Recommendation) => {
    setApplyingId(rec.id);
    // In a real implementation, this would call the appropriate mutate API
    // based on the recommendation type. For now we mark it as applied.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setAppliedIds((prev) => new Set(prev).add(rec.id));
    setApplyingId(null);
  };

  const handleDismiss = (recId: string) => {
    setDismissedIds((prev) => new Set(prev).add(recId));
  };

  const activeRecs = useMemo(
    () =>
      recommendations.filter(
        (r) => !appliedIds.has(r.id) && !dismissedIds.has(r.id)
      ),
    [recommendations, appliedIds, dismissedIds]
  );

  const filteredRecs = useMemo(
    () =>
      activeFilter === "ALL"
        ? activeRecs
        : activeRecs.filter((r) => r.type === activeFilter),
    [activeRecs, activeFilter]
  );

  const highImpactCount = activeRecs.filter(
    (r) => r.impact === "HIGH"
  ).length;

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of activeRecs) {
      counts[r.type] = (counts[r.type] ?? 0) + 1;
    }
    return counts;
  }, [activeRecs]);

  const filterTabs: { id: FilterCategory; label: string }[] = [
    { id: "ALL", label: `All (${activeRecs.length})` },
    ...Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        id: type as FilterCategory,
        label: `${TYPE_CONFIG[type as RecommendationType]?.label ?? type} (${count})`,
      })),
  ];

  // Empty state -- not connected
  if (connectionsLoaded && !connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Recommendations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Google's AI-powered recommendations for your account
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Plug className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Connect Google Ads to see recommendations
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Link your Google Ads account to get AI-powered suggestions for
            improving campaign performance.
          </p>
          <Link
            to="/integrations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <Plug className="w-4 h-4" />
            Connect Google Ads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Recommendations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Google's AI-powered suggestions to improve your campaigns
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loadingData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/50 bg-card">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">
              Total Recommendations
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {activeRecs.length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border/50 bg-card">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUp className="w-4 h-4 text-red-500/50" />
            <span className="text-xs text-muted-foreground">High Impact</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {highImpactCount}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border/50 bg-card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-500/50" />
            <span className="text-xs text-muted-foreground">Applied</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {appliedIds.size}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      {activeRecs.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`shrink-0 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeFilter === tab.id
                  ? "border-current"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={
                activeFilter === tab.id
                  ? { color: config.accentColor }
                  : undefined
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loadingData && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading recommendations...
          </span>
        </div>
      )}

      {/* Empty state */}
      {!loadingData && activeRecs.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-500/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No pending recommendations
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your account is optimized. Google has no new suggestions at this
            time. Check back later as new opportunities are generated
            periodically.
          </p>
        </div>
      )}

      {/* Recommendation cards */}
      {!loadingData && filteredRecs.length > 0 && (
        <div className="space-y-3">
          {filteredRecs.map((rec) => {
            const typeConf = TYPE_CONFIG[rec.type];
            const impactConf = IMPACT_CONFIG[rec.impact];
            const TypeIcon = typeConf.icon;
            const ImpactIcon = impactConf.icon;
            const isApplying = applyingId === rec.id;

            return (
              <div
                key={rec.id}
                className="rounded-xl border border-border/50 bg-card p-4 hover:border-border transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Type icon */}
                  <div
                    className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${typeConf.bg}`}
                  >
                    <TypeIcon className={`w-4.5 h-4.5 ${typeConf.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeConf.bg} ${typeConf.color}`}
                      >
                        {typeConf.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${impactConf.bg} ${impactConf.color}`}
                      >
                        <ImpactIcon className="w-2.5 h-2.5" />
                        {impactConf.label} impact
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-0.5">
                      {rec.description}
                    </p>
                    {rec.campaignName && (
                      <p className="text-xs text-muted-foreground">
                        Campaign: {rec.campaignName}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                      {rec.rawType}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApply(rec)}
                      disabled={isApplying}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
                      style={{ background: config.accentColor }}
                    >
                      {isApplying ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      Apply
                    </button>
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtered empty */}
      {!loadingData &&
        activeRecs.length > 0 &&
        filteredRecs.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No recommendations in this category.
            </p>
          </div>
        )}
    </div>
  );
}
