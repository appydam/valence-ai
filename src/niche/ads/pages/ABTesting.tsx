import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, TrendingUp, Crown, Clock, BarChart3, Wand2, Loader2, Rocket, Plug } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

interface ABTest {
  id: string;
  name: string;
  status: "running" | "completed" | "draft";
  variants: {
    name: string;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    convRate: number;
    confidence: number;
  }[];
  startDate: string;
  metric: string;
  winner?: string;
}

// Matrix view data -- variant hooks x CTAs
const VARIANT_HOOKS = ["Pain Point", "Social Proof", "Curiosity", "Urgency"];
const VARIANT_CTAS = ["Start Free", "Get Started", "Learn More", "Try Now"];

export function ABTesting() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { execute, isConnected, connectionsLoaded, loading: pushLoading } = useIntegrationCall();
  const [filter, setFilter] = useState<"all" | "running" | "completed" | "draft">("all");
  const [showMatrix, setShowMatrix] = useState(false);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);

  const googleConnected = isConnected("google-ads");
  const facebookConnected = isConnected("facebook-ads");
  const posthogConnected = isConnected("posthog");
  const anyConnected = googleConnected || facebookConnected || posthogConnected;

  // Fetch experiments from connected platforms
  useEffect(() => {
    if (!connectionsLoaded || !anyConnected) return;

    let cancelled = false;

    async function fetchExperiments() {
      setLoadingTests(true);
      const fetched: ABTest[] = [];

      try {
        // Try PostHog experiments
        if (posthogConnected) {
          const result = await execute("posthog", "list_insights", {
            type: "experiment",
          });
          if (result.success) {
            const experiments = result.result?.results ?? (Array.isArray(result.result) ? result.result : []);
            for (const exp of experiments) {
              const variants = (exp.parameters?.feature_flag_variants ?? []).map(
                (v: any, idx: number) => ({
                  name: v.key ?? `Variant ${idx}`,
                  impressions: v.impressions ?? 0,
                  clicks: v.clicks ?? 0,
                  conversions: v.conversions ?? 0,
                  ctr: v.impressions > 0 ? Math.round((v.clicks / v.impressions) * 1000) / 10 : 0,
                  convRate: v.impressions > 0 ? Math.round((v.conversions / v.impressions) * 1000) / 10 : 0,
                  confidence: v.confidence ?? 0,
                })
              );
              fetched.push({
                id: `ph-${exp.id ?? fetched.length}`,
                name: exp.name ?? "PostHog Experiment",
                status: exp.end_date ? "completed" : exp.start_date ? "running" : "draft",
                variants: variants.length > 0 ? variants : [
                  { name: "Control", impressions: 0, clicks: 0, conversions: 0, ctr: 0, convRate: 0, confidence: 0 },
                ],
                startDate: exp.start_date
                  ? new Date(exp.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Not started",
                metric: exp.parameters?.aggregation_type ?? "Conversion Rate",
                winner: exp.end_date ? (exp.parameters?.recommended_variant ?? undefined) : undefined,
              });
            }
          }
        }

        // Try Google Ads experiments (campaign experiments)
        if (googleConnected) {
          const result = await execute("google-ads", "search_campaigns", {
            query:
              "SELECT campaign.name, campaign.status, campaign.experiment_type, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign WHERE campaign.experiment_type != 'UNSPECIFIED' ORDER BY campaign.name",
          });
          if (result.success && Array.isArray(result.result) && result.result.length > 0) {
            // Group by experiment pairs (base + experiment)
            for (const row of result.result) {
              const impressions = row.metrics?.impressions ?? 0;
              const clicks = row.metrics?.clicks ?? 0;
              const conversions = row.metrics?.conversions ?? 0;
              fetched.push({
                id: `g-${row.campaign?.id ?? fetched.length}`,
                name: row.campaign?.name ?? "Google Experiment",
                status: row.campaign?.status === "ENABLED" ? "running" : "completed",
                variants: [
                  {
                    name: row.campaign?.name ?? "Variant",
                    impressions,
                    clicks,
                    conversions,
                    ctr: impressions > 0 ? Math.round((clicks / impressions) * 1000) / 10 : 0,
                    convRate: impressions > 0 ? Math.round((conversions / impressions) * 1000) / 10 : 0,
                    confidence: 0,
                  },
                ],
                startDate: "—",
                metric: "Conversions",
              });
            }
          }
        }

        if (!cancelled) {
          setTests(fetched);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoadingTests(false);
      }
    }

    fetchExperiments();
    return () => { cancelled = true; };
  }, [connectionsLoaded, googleConnected, facebookConnected, posthogConnected, execute]);

  const filtered = filter === "all" ? tests : tests.filter((t) => t.status === filter);

  const handleAutoGenerate = async () => {
    await triggerAgent(
      "Ghost",
      "Auto-Generate A/B Test Variants",
      "Generate 8 ad creative variants for A/B testing. Create a matrix of 4 hook angles (Pain Point, Social Proof, Curiosity, Urgency) x 4 CTA variants (Start Free, Get Started, Learn More, Try Now). For each combination, write a headline and body copy optimized for Facebook ads.",
      ["niche:ads", "ab-test", "creative"],
      { priority: "high" }
    );
    setShowMatrix(true);
  };

  const handleLaunchTest = async () => {
    if (googleConnected) {
      await execute("google-ads", "update_campaign_status", {
        campaign_id: "new",
        name: "A/B Test — Auto-Generated Variants",
        status: "ENABLED",
      });
    }
    if (facebookConnected) {
      await execute("facebook-ads", "update_campaign_status", {
        campaign_id: "new",
        name: "A/B Test — Auto-Generated Variants",
        status: "ACTIVE",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">A/B Tests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and analyze your ad experiments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoGenerate}
            disabled={agentLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent/30 transition-colors disabled:opacity-50"
          >
            {agentLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            Auto-Generate Variants
          </button>
          <button
            onClick={handleLaunchTest}
            disabled={pushLoading || !anyConnected}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent/30 transition-colors disabled:opacity-50"
          >
            {pushLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            Launch Test
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <FlaskConical className="w-4 h-4" />
            New Test
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["all", "running", "completed", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f
                ? "text-white"
                : "bg-accent/30 text-muted-foreground hover:text-foreground"
            }`}
            style={filter === f ? { background: config.accentColor } : undefined}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Variant Matrix */}
      {showMatrix && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50">
            <h2 className="text-sm font-semibold text-foreground">Variant Matrix (Hook x CTA)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">Hook \ CTA</th>
                  {VARIANT_CTAS.map((cta) => (
                    <th key={cta} className="text-center text-xs font-medium text-muted-foreground px-4 py-2">
                      {cta}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VARIANT_HOOKS.map((hook, hi) => (
                  <tr key={hook} className="border-b border-border/30">
                    <td className="px-4 py-2 text-xs font-medium text-foreground">{hook}</td>
                    {VARIANT_CTAS.map((cta, ci) => (
                      <td key={cta} className="px-4 py-2">
                        <div
                          className="p-2 rounded-lg border border-border/50 text-center cursor-pointer hover:border-border/80 transition-colors"
                          style={{
                            background: (hi + ci) % 3 === 0 ? `${config.accentColor}08` : undefined,
                          }}
                        >
                          <span className="text-[10px] text-muted-foreground">
                            V{hi * VARIANT_CTAS.length + ci + 1}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loadingTests && !anyConnected && tests.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FlaskConical className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Create your first A/B test
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Connect Google Ads, Facebook Ads, or PostHog to import experiments, or use AI to auto-generate test variants.
          </p>
          <Link
            to="/integrations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <Plug className="w-4 h-4" />
            Connect Integrations
          </Link>
        </div>
      )}

      {!loadingTests && anyConnected && tests.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <FlaskConical className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No experiments found on your connected platforms. Use "Auto-Generate Variants" to create your first test.
          </p>
        </div>
      )}

      {loadingTests && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Loading experiments...</span>
        </div>
      )}

      {/* Test Cards */}
      {filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((test) => (
            <div
              key={test.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Test Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{test.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Started {test.startDate}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> Metric: {test.metric}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    test.status === "running"
                      ? "bg-blue-500/10 text-blue-500"
                      : test.status === "completed"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {test.status}
                </span>
              </div>

              {/* Variants */}
              <div className="divide-y divide-border/30">
                {test.variants.map((variant, i) => {
                  const isWinner = test.winner === variant.name || (test.winner && variant.name.includes(test.winner));
                  const isBest = !test.winner && variant.confidence > 90;
                  return (
                    <div
                      key={variant.name}
                      className={`px-5 py-3 flex items-center gap-6 ${
                        isWinner ? "bg-green-500/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-[200px]">
                        {isWinner && <Crown className="w-4 h-4 text-yellow-500" />}
                        {isBest && <TrendingUp className="w-4 h-4 text-green-500" />}
                        <span className="text-sm font-medium text-foreground">{variant.name}</span>
                      </div>
                      <div className="flex items-center gap-6 flex-1">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Impressions</p>
                          <p className="text-sm font-medium">{variant.impressions.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Clicks</p>
                          <p className="text-sm font-medium">{variant.clicks.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">CTR</p>
                          <p className="text-sm font-medium">{variant.ctr}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Conv. Rate</p>
                          <p className="text-sm font-medium">{variant.convRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Conversions</p>
                          <p className="text-sm font-medium">{variant.conversions}</p>
                        </div>
                      </div>
                      {i > 0 && (
                        <div className="text-right min-w-[80px]">
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <p
                            className={`text-sm font-bold ${
                              variant.confidence >= 95
                                ? "text-green-500"
                                : variant.confidence >= 80
                                ? "text-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {variant.confidence}%
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
