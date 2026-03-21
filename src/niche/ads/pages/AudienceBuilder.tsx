import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, X, Sparkles, Loader2, Plug } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { OverlapDetector } from "../components/OverlapDetector";

interface AudienceSegment {
  id: string;
  name: string;
  size: string;
  criteria: string[];
}

const TARGETING_OPTIONS = {
  demographics: ["Age: 18-24", "Age: 25-34", "Age: 35-44", "Age: 45-54", "Age: 55+", "Gender: Male", "Gender: Female"],
  interests: ["Technology", "Business", "Marketing", "Finance", "E-commerce", "AI/ML", "Startups", "SaaS", "Digital Marketing"],
  behaviors: ["Online shoppers", "Frequent travelers", "Tech early adopters", "Business decision makers", "Social media power users"],
  locations: ["United States", "United Kingdom", "Canada", "Australia", "India", "Germany", "France"],
};

export function AudienceBuilder() {
  const { config } = useNiche();
  const { execute, isConnected, connectionsLoaded } = useIntegrationCall();
  const [audienceName, setAudienceName] = useState("");
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"demographics" | "interests" | "behaviors" | "locations">("interests");
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<AudienceSegment[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);

  const facebookConnected = isConnected("facebook-ads");
  const googleConnected = isConnected("google-ads");
  const anyConnected = facebookConnected || googleConnected;

  const toggleCriteria = (criterion: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(criterion) ? prev.filter((c) => c !== criterion) : [...prev, criterion]
    );
  };

  // Fetch saved audiences from connected platforms
  useEffect(() => {
    if (!connectionsLoaded || !anyConnected) return;

    let cancelled = false;

    async function fetchAudiences() {
      setLoadingAudiences(true);
      const fetched: AudienceSegment[] = [];

      try {
        // Facebook Ads — get ad sets with targeting info
        if (facebookConnected) {
          const result = await execute("facebook-ads", "get_adsets", {
            fields: "name,targeting,reach_estimate",
          });
          if (result.success) {
            const adsets = result.result?.data ?? (Array.isArray(result.result) ? result.result : []);
            for (const adset of adsets) {
              const targeting = adset.targeting ?? {};
              const criteria: string[] = [];

              // Extract targeting criteria
              if (targeting.age_min || targeting.age_max) {
                criteria.push(`Age: ${targeting.age_min ?? 18}-${targeting.age_max ?? 65}`);
              }
              if (targeting.genders?.length) {
                const genderMap: Record<number, string> = { 1: "Male", 2: "Female" };
                criteria.push(`Gender: ${targeting.genders.map((g: number) => genderMap[g] ?? g).join(", ")}`);
              }
              if (targeting.geo_locations?.countries?.length) {
                criteria.push(`Locations: ${targeting.geo_locations.countries.join(", ")}`);
              }
              if (targeting.interests?.length) {
                criteria.push(
                  ...targeting.interests.slice(0, 3).map((i: { name: string }) => `Interest: ${i.name}`)
                );
              }
              if (targeting.behaviors?.length) {
                criteria.push(
                  ...targeting.behaviors.slice(0, 2).map((b: { name: string }) => `Behavior: ${b.name}`)
                );
              }

              const reach = adset.reach_estimate?.users_lower_bound ?? 0;
              const reachUpper = adset.reach_estimate?.users_upper_bound ?? reach;
              const avgReach = Math.round((reach + reachUpper) / 2);

              fetched.push({
                id: `fb-${adset.id ?? fetched.length}`,
                name: adset.name ?? "Facebook Audience",
                size: formatAudienceSize(avgReach),
                criteria: criteria.length > 0 ? criteria : ["Facebook Ad Set"],
              });
            }
          }
        }

        // Google Ads — get ad groups with targeting info
        if (googleConnected) {
          const result = await execute("google-ads", "search_ad_groups", {
            query:
              "SELECT ad_group.name, ad_group.status, ad_group.targeting_setting.target_restrictions FROM ad_group WHERE ad_group.status != 'REMOVED' LIMIT 20",
          });
          if (result.success && Array.isArray(result.result)) {
            for (const row of result.result) {
              const criteria: string[] = [];
              const restrictions = row.ad_group?.targeting_setting?.target_restrictions ?? [];
              for (const r of restrictions) {
                criteria.push(`Targeting: ${r.targeting_dimension ?? "Unknown"}`);
              }
              if (criteria.length === 0) {
                criteria.push("Google Ad Group");
              }

              fetched.push({
                id: `g-${row.ad_group?.id ?? fetched.length}`,
                name: row.ad_group?.name ?? "Google Audience",
                size: "—",
                criteria,
              });
            }
          }
        }

        if (!cancelled) {
          setAudiences(fetched);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoadingAudiences(false);
      }
    }

    fetchAudiences();
    return () => { cancelled = true; };
  }, [connectionsLoaded, facebookConnected, googleConnected, execute]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audience Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define and manage your target audiences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left -- Create Audience */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <h2 className="text-sm font-semibold">Create New Audience</h2>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Audience Name
              </label>
              <input
                type="text"
                value={audienceName}
                onChange={(e) => setAudienceName(e.target.value)}
                placeholder="e.g., Tech-Savvy Decision Makers"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Targeting tabs */}
            <div>
              <div className="flex items-center gap-1 border-b border-border mb-4">
                {(Object.keys(TARGETING_OPTIONS) as Array<keyof typeof TARGETING_OPTIONS>).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-current"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    style={activeTab === tab ? { color: config.accentColor } : undefined}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {TARGETING_OPTIONS[activeTab].map((option) => {
                  const isSelected = selectedCriteria.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleCriteria(option)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "border-transparent text-white"
                          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                      style={isSelected ? { background: config.accentColor } : undefined}
                    >
                      {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected criteria */}
            {selectedCriteria.length > 0 && (
              <div className="p-3 rounded-lg bg-accent/30">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Selected Criteria ({selectedCriteria.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCriteria.map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-white"
                      style={{ background: config.accentColor }}
                    >
                      {c}
                      <button onClick={() => toggleCriteria(c)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: config.accentColor }}
              >
                <Users className="w-4 h-4" />
                Save Audience
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
                <Sparkles className="w-4 h-4" />
                AI Suggest
              </button>
            </div>
          </div>
        </div>

        {/* Right -- Saved Audiences */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Saved Audiences</h2>

          {loadingAudiences && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-xs text-muted-foreground">Loading audiences...</span>
            </div>
          )}

          {!loadingAudiences && audiences.length === 0 && !anyConnected && (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <Plug className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-2">
                Connect Facebook Ads or Google Ads to import saved audiences
              </p>
              <Link
                to="/integrations"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
                style={{ background: config.accentColor, color: "white" }}
              >
                <Plug className="w-3 h-3" />
                Connect
              </Link>
            </div>
          )}

          {!loadingAudiences && audiences.length === 0 && anyConnected && (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-xs text-muted-foreground">
                No saved audiences found on your connected platforms. Build one using the form.
              </p>
            </div>
          )}

          {!loadingAudiences && audiences.length > 0 && (
            <div className="space-y-3">
              {audiences.map((audience) => {
                const isSelected = selectedAudiences.includes(audience.id);
                return (
                  <div
                    key={audience.id}
                    onClick={() =>
                      setSelectedAudiences((prev) =>
                        prev.includes(audience.id)
                          ? prev.filter((id) => id !== audience.id)
                          : [...prev, audience.id]
                      )
                    }
                    className={`rounded-xl border bg-card p-4 space-y-2 transition-colors cursor-pointer ${
                      isSelected ? "border-2 shadow-sm" : "border-border hover:border-border/80"
                    }`}
                    style={
                      isSelected
                        ? { borderColor: config.accentColor, background: `${config.accentColor}08` }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">{audience.name}</h3>
                      <span className="text-xs font-medium text-muted-foreground">{audience.size}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {audience.criteria.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded text-[10px] bg-accent/50 text-muted-foreground"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Overlap Detector */}
          {selectedAudiences.length >= 2 && (
            <OverlapDetector
              audiences={audiences.filter((a) => selectedAudiences.includes(a.id))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function formatAudienceSize(count: number): string {
  if (count <= 0) return "—";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return `${count}`;
}
