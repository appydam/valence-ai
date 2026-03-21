import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wand2, Image, Type, Video, Copy, Download, ThumbsUp, ThumbsDown, Sparkles, Loader2, Plug } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { AdPreview } from "../components/AdPreview";
import { ImageGenerator } from "../components/ImageGenerator";
import { AgentActivityPanel } from "../../framework/AgentActivityPanel";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

type CreativeType = "image" | "video" | "text";
type Platform = "google" | "facebook" | "instagram" | "tiktok";
type Tab = "copy" | "images";

interface Creative {
  id: string;
  type: "text";
  platform: string;
  headline: string;
  description: string;
  cta: string;
  imageUrl?: string;
}

export function CreativeStudio() {
  const { config } = useNiche();
  const { triggerAgent, loading: triggerLoading } = useAgentTrigger();
  const { execute, isConnected, connectionsLoaded } = useIntegrationCall();
  const [prompt, setPrompt] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("google");
  const [selectedType, setSelectedType] = useState<CreativeType>("text");
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("copy");
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loadingCreatives, setLoadingCreatives] = useState(false);

  const facebookConnected = isConnected("facebook-ads");

  // Fetch real creatives from Facebook Ads
  useEffect(() => {
    if (!connectionsLoaded || !facebookConnected) return;

    let cancelled = false;

    async function fetchCreatives() {
      setLoadingCreatives(true);
      try {
        const result = await execute("facebook-ads", "get_ads", {
          fields: "name,creative{title,body,image_url,call_to_action_type}",
        });
        if (result.success && !cancelled) {
          const ads = result.result?.data ?? (Array.isArray(result.result) ? result.result : []);
          const mapped: Creative[] = ads.map((ad: any, idx: number) => ({
            id: ad.id ?? `fb-${idx}`,
            type: "text" as const,
            platform: "facebook",
            headline: ad.creative?.title ?? ad.name ?? "Untitled Ad",
            description: ad.creative?.body ?? "",
            cta: formatCTA(ad.creative?.call_to_action_type ?? ""),
            imageUrl: ad.creative?.image_url,
          }));
          setCreatives(mapped);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoadingCreatives(false);
      }
    }

    fetchCreatives();
    return () => { cancelled = true; };
  }, [connectionsLoaded, facebookConnected, execute]);

  const handleGenerate = async () => {
    setGenerating(true);
    await triggerAgent(
      "Ghost",
      `Ad Copy: ${selectedPlatform} ${selectedType}`,
      `Generate ad creatives for ${selectedPlatform}.\nType: ${selectedType}\nBrief: ${prompt}\n\nCreate 4 variants with headline, body copy, and CTA. Score each variant 1-10 on clarity and persuasiveness.`,
      ["niche:ads", "creative-copy"]
    );
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Creative Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate and preview ad creatives with AI
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {([
          { id: "copy" as Tab, label: "Generate Copy", icon: Type },
          { id: "images" as Tab, label: "Generate Images", icon: Image },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === id
                ? "border-current"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            style={activeTab === id ? { color: config.accentColor } : undefined}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Images Tab */}
      {activeTab === "images" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <ImageGenerator />
          </div>
          <div className="lg:col-span-3">
            {(generating || triggerLoading) && (
              <AgentActivityPanel agentName="Ghost" />
            )}
          </div>
        </div>
      )}

      {/* Copy Tab */}
      {activeTab === "copy" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left -- Generate Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: config.accentColor }} />
                AI Creative Generator
              </h2>

              {/* Creative Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  Creative Type
                </label>
                <div className="flex gap-2">
                  {([
                    { id: "text", icon: Type, label: "Text/Copy" },
                    { id: "image", icon: Image, label: "Image" },
                    { id: "video", icon: Video, label: "Video Script" },
                  ] as const).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedType(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        selectedType === id
                          ? "border-2 shadow-sm"
                          : "border-border text-muted-foreground hover:border-border/80"
                      }`}
                      style={
                        selectedType === id
                          ? { borderColor: config.accentColor, color: config.accentColor, background: `${config.accentColor}08` }
                          : undefined
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  Platform
                </label>
                <div className="flex gap-2">
                  {([
                    { id: "google", emoji: "G", name: "Google" },
                    { id: "facebook", emoji: "F", name: "Facebook" },
                    { id: "instagram", emoji: "I", name: "Instagram" },
                    { id: "tiktok", emoji: "T", name: "TikTok" },
                  ] as const).map(({ id, emoji, name }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedPlatform(id)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                        selectedPlatform === id
                          ? "border-2 shadow-sm"
                          : "border-border text-muted-foreground hover:border-border/80"
                      }`}
                      style={
                        selectedPlatform === id
                          ? { borderColor: config.accentColor, background: `${config.accentColor}08` }
                          : undefined
                      }
                    >
                      <span className="font-bold">{emoji}</span>
                      <span>{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-2">
                  Brief / Instructions
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your product, target audience, and desired tone. E.g., 'SaaS tool for small businesses, professional but approachable, focus on time savings...'"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || triggerLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
                style={{ background: config.accentColor }}
              >
                {generating || triggerLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate Creatives
                  </>
                )}
              </button>
            </div>

            {/* Agent activity when generating */}
            {(generating || triggerLoading) && (
              <AgentActivityPanel agentName="Ghost" />
            )}
          </div>

          {/* Right -- Creative Library */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              {creatives.length > 0 ? "Ad Creatives" : "Generated Creatives"}
            </h2>

            {loadingCreatives && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading creatives...</span>
              </div>
            )}

            {!loadingCreatives && creatives.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Generate your first ad creative with AI
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Use the generator on the left, or connect Facebook Ads to import existing creatives.
                </p>
                {!facebookConnected && (
                  <Link
                    to="/integrations"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                    style={{ background: config.accentColor, color: "white" }}
                  >
                    <Plug className="w-3 h-3" />
                    Connect Facebook Ads
                  </Link>
                )}
              </div>
            )}

            {!loadingCreatives && creatives.length > 0 && (
              <div className="grid gap-4">
                {creatives.map((creative) => (
                  <div
                    key={creative.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <AdPreview platform={creative.platform} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {creative.headline}
                      </p>
                      {creative.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {creative.description}
                        </p>
                      )}
                      {creative.cta && (
                        <span
                          className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-md"
                          style={{ background: `${config.accentColor}15`, color: config.accentColor }}
                        >
                          {creative.cta}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-green-500 transition-colors">
                        <ThumbsUp className="w-3 h-3" /> Approve
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-red-400 transition-colors">
                        <ThumbsDown className="w-3 h-3" /> Reject
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Download className="w-3 h-3" /> Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Converts Facebook CTA types like "LEARN_MORE" to "Learn More" */
function formatCTA(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
