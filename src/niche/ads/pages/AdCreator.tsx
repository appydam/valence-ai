import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  PenTool,
  Plus,
  Trash2,
  Loader2,
  Plug,
  Sparkles,
  Eye,
  Pin,
  ExternalLink,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

const MAX_HEADLINES = 15;
const MAX_HEADLINE_CHARS = 30;
const MAX_DESCRIPTIONS = 4;
const MAX_DESCRIPTION_CHARS = 90;

interface HeadlineSlot {
  text: string;
  pinned: string | null; // HEADLINE_1, HEADLINE_2, HEADLINE_3, or null
}

interface DescriptionSlot {
  text: string;
  pinned: string | null; // DESCRIPTION_1, DESCRIPTION_2, or null
}

interface ExistingAd {
  id: string;
  status: string;
  headlines: string[];
  impressions: number;
  clicks: number;
  conversions: number;
}

export function AdCreator() {
  const { config } = useNiche();
  const { execute, isConnected, connectionsLoaded } = useIntegrationCall();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();

  const connected = isConnected("google-ads");

  const [headlines, setHeadlines] = useState<HeadlineSlot[]>([
    { text: "", pinned: null },
    { text: "", pinned: null },
    { text: "", pinned: null },
  ]);
  const [descriptions, setDescriptions] = useState<DescriptionSlot[]>([
    { text: "", pinned: null },
    { text: "", pinned: null },
  ]);
  const [finalUrl, setFinalUrl] = useState("");
  const [adGroupResource, setAdGroupResource] = useState("");
  const [creating, setCreating] = useState(false);
  const [existingAds, setExistingAds] = useState<ExistingAd[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [activeView, setActiveView] = useState<"builder" | "existing">("builder");

  const fetchExistingAds = useCallback(async () => {
    if (!connected) return;
    setLoadingAds(true);
    try {
      const result = await execute("google-ads", "get_ad_performance", {
        query:
          "SELECT ad_group_ad.ad.id, ad_group_ad.ad.responsive_search_ad.headlines, ad_group_ad.status, metrics.impressions, metrics.clicks, metrics.conversions FROM ad_group_ad WHERE segments.date DURING LAST_30_DAYS AND ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD' ORDER BY metrics.impressions DESC LIMIT 30",
      });
      if (result.success && Array.isArray(result.result)) {
        setExistingAds(
          result.result.map((r: any) => {
            const ad = r.adGroupAd?.ad ?? r.ad_group_ad?.ad ?? {};
            const rsa = ad.responsiveSearchAd ?? ad.responsive_search_ad ?? {};
            const hdls = (rsa.headlines ?? []).map((h: any) => h.text ?? "");
            return {
              id: ad.id ?? "",
              status: r.adGroupAd?.status ?? r.ad_group_ad?.status ?? "UNKNOWN",
              headlines: hdls,
              impressions: r.metrics?.impressions ?? 0,
              clicks: r.metrics?.clicks ?? 0,
              conversions: r.metrics?.conversions ?? 0,
            };
          })
        );
      }
    } catch {
      // silent
    } finally {
      setLoadingAds(false);
    }
  }, [connected, execute]);

  useEffect(() => {
    if (connectionsLoaded && connected) {
      fetchExistingAds();
    }
  }, [connectionsLoaded, connected, fetchExistingAds]);

  const updateHeadline = (idx: number, text: string) => {
    setHeadlines((prev) => prev.map((h, i) => (i === idx ? { ...h, text } : h)));
  };

  const updateHeadlinePin = (idx: number, pin: string | null) => {
    setHeadlines((prev) => prev.map((h, i) => (i === idx ? { ...h, pinned: pin } : h)));
  };

  const addHeadline = () => {
    if (headlines.length < MAX_HEADLINES) {
      setHeadlines((prev) => [...prev, { text: "", pinned: null }]);
    }
  };

  const removeHeadline = (idx: number) => {
    if (headlines.length > 3) {
      setHeadlines((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const updateDescription = (idx: number, text: string) => {
    setDescriptions((prev) => prev.map((d, i) => (i === idx ? { ...d, text } : d)));
  };

  const updateDescriptionPin = (idx: number, pin: string | null) => {
    setDescriptions((prev) => prev.map((d, i) => (i === idx ? { ...d, pinned: pin } : d)));
  };

  const addDescription = () => {
    if (descriptions.length < MAX_DESCRIPTIONS) {
      setDescriptions((prev) => [...prev, { text: "", pinned: null }]);
    }
  };

  const removeDescription = (idx: number) => {
    if (descriptions.length > 2) {
      setDescriptions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleCreate = async () => {
    const validHeadlines = headlines.filter((h) => h.text.trim());
    const validDescs = descriptions.filter((d) => d.text.trim());
    if (validHeadlines.length < 3 || validDescs.length < 2 || !finalUrl.trim()) return;

    setCreating(true);
    try {
      await execute("google-ads", "create_ad", {
        operations: [
          {
            create: {
              adGroup: adGroupResource || "customers/CUSTOMER_ID/adGroups/AD_GROUP_ID",
              ad: {
                responsiveSearchAd: {
                  headlines: validHeadlines.map((h) => ({
                    text: h.text,
                    ...(h.pinned ? { pinnedField: h.pinned } : {}),
                  })),
                  descriptions: validDescs.map((d) => ({
                    text: d.text,
                    ...(d.pinned ? { pinnedField: d.pinned } : {}),
                  })),
                },
                finalUrls: [finalUrl.trim()],
              },
              status: "PAUSED",
            },
          },
        ],
      });
      fetchExistingAds();
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const handleAiGenerate = async () => {
    const url = finalUrl.trim() || "the advertised product/service";
    await triggerAgent(
      "Ghost",
      "Generate Google Ads headlines and descriptions",
      `Generate 10 unique responsive search ad headlines (max 30 chars each) and 4 descriptions (max 90 chars each) for: ${url}. Focus on compelling CTAs, unique value props, and urgency. Return as a structured list.`,
      ["niche:ads", "ad-copy"],
      { priority: "high" }
    );
  };

  // Preview: pick up to 3 headlines and 2 descriptions
  const previewHeadlines = headlines.filter((h) => h.text.trim()).slice(0, 3);
  const previewDescs = descriptions.filter((d) => d.text.trim()).slice(0, 2);

  // Empty state
  if (connectionsLoaded && !connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Creator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build responsive search ads with live preview
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Plug className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Connect Google Ads to create ads
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Link your Google Ads account to build, preview, and publish responsive search ads.
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
          <h1 className="text-2xl font-bold text-foreground">Ad Creator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build responsive search ads with live preview
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card overflow-hidden">
          <button
            onClick={() => setActiveView("builder")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeView === "builder" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Builder
          </button>
          <button
            onClick={() => setActiveView("existing")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              activeView === "existing" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Existing Ads
          </button>
        </div>
      </div>

      {activeView === "builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Builder */}
          <div className="lg:col-span-3 space-y-5">
            {/* Ad Group */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Ad Group Resource Name</label>
                <input
                  type="text"
                  value={adGroupResource}
                  onChange={(e) => setAdGroupResource(e.target.value)}
                  placeholder="customers/123/adGroups/456"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Final URL</label>
                <input
                  type="url"
                  value={finalUrl}
                  onChange={(e) => setFinalUrl(e.target.value)}
                  placeholder="https://example.com/landing"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Headlines */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Headlines ({headlines.length}/{MAX_HEADLINES})
                </h2>
                <button
                  onClick={handleAiGenerate}
                  disabled={agentLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {agentLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  AI Generate
                </button>
              </div>
              {headlines.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={h.text}
                      onChange={(e) => updateHeadline(idx, e.target.value.slice(0, MAX_HEADLINE_CHARS))}
                      placeholder={`Headline ${idx + 1}`}
                      className="w-full px-3 py-2 pr-14 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] ${
                        h.text.length >= MAX_HEADLINE_CHARS ? "text-red-400" : "text-muted-foreground"
                      }`}
                    >
                      {h.text.length}/{MAX_HEADLINE_CHARS}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      updateHeadlinePin(
                        idx,
                        h.pinned ? null : `HEADLINE_${Math.min(idx + 1, 3)}`
                      )
                    }
                    className={`p-1.5 rounded transition-colors ${
                      h.pinned ? "text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={h.pinned ? { background: config.accentColor } : undefined}
                    title={h.pinned ? `Pinned to ${h.pinned}` : "Pin to position"}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  {headlines.length > 3 && (
                    <button
                      onClick={() => removeHeadline(idx)}
                      className="p-1.5 rounded text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {headlines.length < MAX_HEADLINES && (
                <button
                  onClick={addHeadline}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Headline
                </button>
              )}
            </div>

            {/* Descriptions */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">
                Descriptions ({descriptions.length}/{MAX_DESCRIPTIONS})
              </h2>
              {descriptions.map((d, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={d.text}
                      onChange={(e) => updateDescription(idx, e.target.value.slice(0, MAX_DESCRIPTION_CHARS))}
                      placeholder={`Description ${idx + 1}`}
                      rows={2}
                      className="w-full px-3 py-2 pr-14 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                    <span
                      className={`absolute right-3 bottom-2 text-[10px] ${
                        d.text.length >= MAX_DESCRIPTION_CHARS ? "text-red-400" : "text-muted-foreground"
                      }`}
                    >
                      {d.text.length}/{MAX_DESCRIPTION_CHARS}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      updateDescriptionPin(
                        idx,
                        d.pinned ? null : `DESCRIPTION_${Math.min(idx + 1, 2)}`
                      )
                    }
                    className={`p-1.5 rounded transition-colors mt-1.5 ${
                      d.pinned ? "text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={d.pinned ? { background: config.accentColor } : undefined}
                    title={d.pinned ? `Pinned to ${d.pinned}` : "Pin to position"}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  {descriptions.length > 2 && (
                    <button
                      onClick={() => removeDescription(idx)}
                      className="p-1.5 rounded text-muted-foreground hover:text-red-400 transition-colors mt-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {descriptions.length < MAX_DESCRIPTIONS && (
                <button
                  onClick={addDescription}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Description
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={
                creating ||
                headlines.filter((h) => h.text.trim()).length < 3 ||
                descriptions.filter((d) => d.text.trim()).length < 2 ||
                !finalUrl.trim()
              }
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
              style={{ background: config.accentColor }}
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
              Create Ad
            </button>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4" style={{ color: config.accentColor }} />
                <h2 className="text-sm font-semibold text-foreground">Live Preview</h2>
              </div>
              <div className="rounded-lg border border-border p-4 bg-white text-black space-y-1.5">
                <p className="text-[10px] text-gray-500">Ad</p>
                <p className="text-blue-700 text-sm font-medium leading-tight">
                  {previewHeadlines.length > 0
                    ? previewHeadlines.map((h) => h.text || "Headline").join(" | ")
                    : "Headline 1 | Headline 2 | Headline 3"}
                </p>
                <p className="text-green-700 text-xs truncate">
                  {finalUrl || "https://example.com"}
                </p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {previewDescs.length > 0
                    ? previewDescs.map((d) => d.text || "Description text").join(" ")
                    : "Your ad description will appear here. Write compelling copy to drive clicks."}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Google rotates headlines and descriptions to find the best combination. Pin assets to fix their position.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Ads View */}
      {activeView === "existing" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loadingAds ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading ads...</span>
            </div>
          ) : existingAds.length === 0 ? (
            <div className="p-8 text-center">
              <PenTool className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No responsive search ads found in the last 30 days.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ad</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Impressions</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Clicks</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {existingAds.map((ad) => (
                    <tr key={ad.id} className="border-b border-border/50 hover:bg-accent/10 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="text-foreground font-medium text-xs truncate max-w-xs">
                          {ad.headlines.slice(0, 3).join(" | ") || `Ad #${ad.id}`}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            ad.status === "ENABLED"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{ad.impressions.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{ad.clicks.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">{ad.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
