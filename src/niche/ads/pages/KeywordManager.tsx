import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Ban,
  Loader2,
  Plug,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

interface SearchTerm {
  term: string;
  impressions: number;
  clicks: number;
  costMicros: number;
  conversions: number;
}

interface KeywordRow {
  keyword: string;
  matchType: string;
  qualityScore: number | null;
  creativeQuality: string | null;
  bid: number;
  status: string;
}

type MatchType = "EXACT" | "PHRASE" | "BROAD";

function qualityColor(score: number | null): string {
  if (score === null) return "text-muted-foreground";
  if (score >= 7) return "text-green-500";
  if (score >= 4) return "text-yellow-500";
  return "text-red-500";
}

function qualityBg(score: number | null): string {
  if (score === null) return "bg-muted";
  if (score >= 7) return "bg-green-500/10";
  if (score >= 4) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

export function KeywordManager() {
  const { config } = useNiche();
  const { execute, isConnected, connectionsLoaded, loading: callLoading } = useIntegrationCall();

  const connected = isConnected("google-ads");

  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingKeywords, setLoadingKeywords] = useState(false);

  // Add keywords form
  const [newKeyword, setNewKeyword] = useState("");
  const [newMatchType, setNewMatchType] = useState<MatchType>("PHRASE");
  const [newBid, setNewBid] = useState("");
  const [addingKeyword, setAddingKeyword] = useState(false);

  // Negative keywords form
  const [negKeyword, setNegKeyword] = useState("");
  const [negMatchType, setNegMatchType] = useState<MatchType>("BROAD");
  const [addingNeg, setAddingNeg] = useState(false);

  const [activeTab, setActiveTab] = useState<"search-terms" | "keywords" | "add" | "negative">("search-terms");
  const [sortField, setSortField] = useState<"impressions" | "clicks" | "conversions" | "costMicros">("impressions");
  const [sortAsc, setSortAsc] = useState(false);

  const fetchData = useCallback(async () => {
    if (!connected) return;

    setLoadingTerms(true);
    setLoadingKeywords(true);

    try {
      const stResult = await execute("google-ads", "get_search_terms", {
        query:
          "SELECT search_term_view.search_term, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions FROM search_term_view WHERE segments.date DURING LAST_30_DAYS ORDER BY metrics.impressions DESC LIMIT 100",
      });
      if (stResult.success && Array.isArray(stResult.result)) {
        setSearchTerms(
          stResult.result.map((r: any) => ({
            term: r.searchTermView?.searchTerm ?? r.search_term_view?.search_term ?? "",
            impressions: r.metrics?.impressions ?? 0,
            clicks: r.metrics?.clicks ?? 0,
            costMicros: r.metrics?.costMicros ?? r.metrics?.cost_micros ?? 0,
            conversions: r.metrics?.conversions ?? 0,
          }))
        );
      }
    } catch {
      // silent
    } finally {
      setLoadingTerms(false);
    }

    try {
      const kwResult = await execute("google-ads", "get_keyword_performance", {
        query:
          "SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ad_group_criterion.quality_info.quality_score, ad_group_criterion.quality_info.creative_quality_score, metrics.average_cpc, ad_group_criterion.status FROM keyword_view WHERE ad_group_criterion.status = 'ENABLED' ORDER BY metrics.impressions DESC LIMIT 100",
      });
      if (kwResult.success && Array.isArray(kwResult.result)) {
        setKeywords(
          kwResult.result.map((r: any) => {
            const criterion = r.adGroupCriterion ?? r.ad_group_criterion ?? {};
            const kw = criterion.keyword ?? {};
            const qi = criterion.qualityInfo ?? criterion.quality_info ?? {};
            return {
              keyword: kw.text ?? "",
              matchType: kw.matchType ?? kw.match_type ?? "BROAD",
              qualityScore: qi.qualityScore ?? qi.quality_score ?? null,
              creativeQuality: qi.creativeQualityScore ?? qi.creative_quality_score ?? null,
              bid: (r.metrics?.averageCpc ?? r.metrics?.average_cpc ?? 0) / 1_000_000,
              status: criterion.status ?? "ENABLED",
            };
          })
        );
      }
    } catch {
      // silent
    } finally {
      setLoadingKeywords(false);
    }
  }, [connected, execute]);

  useEffect(() => {
    if (connectionsLoaded && connected) {
      fetchData();
    }
  }, [connectionsLoaded, connected, fetchData]);

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    setAddingKeyword(true);
    try {
      await execute("google-ads", "add_keywords", {
        operations: [
          {
            create: {
              adGroup: "customers/CUSTOMER_ID/adGroups/AD_GROUP_ID",
              keyword: { text: newKeyword.trim(), matchType: newMatchType },
            },
          },
        ],
      });
      setNewKeyword("");
      setNewBid("");
      fetchData();
    } catch {
      // silent
    } finally {
      setAddingKeyword(false);
    }
  };

  const handleAddNegative = async () => {
    if (!negKeyword.trim()) return;
    setAddingNeg(true);
    try {
      await execute("google-ads", "add_negative_keywords", {
        operations: [
          {
            create: {
              campaign: "customers/CUSTOMER_ID/campaigns/CAMPAIGN_ID",
              negative: true,
              keyword: { text: negKeyword.trim(), matchType: negMatchType },
            },
          },
        ],
      });
      setNegKeyword("");
      fetchData();
    } catch {
      // silent
    } finally {
      setAddingNeg(false);
    }
  };

  const sortedTerms = [...searchTerms].sort((a, b) => {
    const diff = a[sortField] - b[sortField];
    return sortAsc ? diff : -diff;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  // Empty state — not connected
  if (connectionsLoaded && !connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Keyword Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage keywords, search terms, and negative keywords
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Plug className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Connect Google Ads to manage keywords
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Link your Google Ads account to see search terms, quality scores, and manage your keywords.
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
          <h1 className="text-2xl font-bold text-foreground">Keyword Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage keywords, search terms, and negative keywords
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loadingTerms || loadingKeywords}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingTerms || loadingKeywords ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(
          [
            { id: "search-terms", label: "Search Terms", icon: Search },
            { id: "keywords", label: "Keywords", icon: Search },
            { id: "add", label: "Add Keywords", icon: Plus },
            { id: "negative", label: "Negative Keywords", icon: Ban },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-current"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={activeTab === tab.id ? { color: config.accentColor } : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Terms Tab */}
      {activeTab === "search-terms" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loadingTerms ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading search terms...</span>
            </div>
          ) : searchTerms.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No search term data available for the last 30 days.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Search Term</th>
                    <th
                      className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("impressions")}
                    >
                      Impressions <SortIcon field="impressions" />
                    </th>
                    <th
                      className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("clicks")}
                    >
                      Clicks <SortIcon field="clicks" />
                    </th>
                    <th
                      className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("costMicros")}
                    >
                      Cost <SortIcon field="costMicros" />
                    </th>
                    <th
                      className="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort("conversions")}
                    >
                      Conv. <SortIcon field="conversions" />
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTerms.map((st, i) => {
                    const cost = st.costMicros / 1_000_000;
                    const cpa = st.conversions > 0 ? cost / st.conversions : 0;
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-accent/10 transition-colors">
                        <td className="px-4 py-2.5 text-foreground font-medium">{st.term}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">{st.impressions.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">{st.clicks.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">${cost.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">{st.conversions}</td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          {cpa > 0 ? `$${cpa.toFixed(2)}` : "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === "keywords" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loadingKeywords ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading keywords...</span>
            </div>
          ) : keywords.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No active keywords found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Keyword</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Match</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Quality</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Avg CPC</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-accent/10 transition-colors">
                      <td className="px-4 py-2.5 text-foreground font-medium">{kw.keyword}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/50 text-muted-foreground">
                          {kw.matchType}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${qualityColor(kw.qualityScore)} ${qualityBg(kw.qualityScore)}`}
                        >
                          {kw.qualityScore ?? "--"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {kw.bid > 0 ? `$${kw.bid.toFixed(2)}` : "--"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            kw.status === "ENABLED"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {kw.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Keywords Tab */}
      {activeTab === "add" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5 max-w-xl">
          <h2 className="text-sm font-semibold text-foreground">Add Keywords to Ad Group</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Keyword Text</label>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g., best running shoes"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Match Type</label>
              <div className="flex gap-2">
                {(["EXACT", "PHRASE", "BROAD"] as const).map((mt) => (
                  <button
                    key={mt}
                    onClick={() => setNewMatchType(mt)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                      newMatchType === mt
                        ? "border-transparent text-white"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    style={newMatchType === mt ? { background: config.accentColor } : undefined}
                  >
                    {mt === "EXACT" ? "[Exact]" : mt === "PHRASE" ? '"Phrase"' : "Broad"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Max CPC Bid ($)</label>
              <input
                type="number"
                value={newBid}
                onChange={(e) => setNewBid(e.target.value)}
                placeholder="e.g., 2.50"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <button
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim() || addingKeyword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
            style={{ background: config.accentColor }}
          >
            {addingKeyword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Keyword
          </button>
        </div>
      )}

      {/* Negative Keywords Tab */}
      {activeTab === "negative" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-5 max-w-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Add Negative Keywords</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Block irrelevant search terms from triggering your ads. This prevents wasted spend on off-topic queries.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Negative Keyword</label>
              <input
                type="text"
                value={negKeyword}
                onChange={(e) => setNegKeyword(e.target.value)}
                placeholder="e.g., free, cheap, jobs"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Match Type</label>
              <div className="flex gap-2">
                {(["EXACT", "PHRASE", "BROAD"] as const).map((mt) => (
                  <button
                    key={mt}
                    onClick={() => setNegMatchType(mt)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                      negMatchType === mt
                        ? "border-transparent text-white"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    style={negMatchType === mt ? { background: config.accentColor } : undefined}
                  >
                    {mt === "EXACT" ? "[Exact]" : mt === "PHRASE" ? '"Phrase"' : "Broad"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleAddNegative}
            disabled={!negKeyword.trim() || addingNeg}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
            style={{ background: config.accentColor }}
          >
            {addingNeg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            Add Negative Keyword
          </button>
        </div>
      )}
    </div>
  );
}
