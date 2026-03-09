import { useState, useMemo, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plus, Building2, LayoutGrid, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { BLUEPRINT_LOGOS } from "@/lib/integrationLogos";
import { CityView } from "@/components/CityView/CityView";
import { Button } from "@/components/ui/button";

// ── Domain categories with icons & colors ────────────────────────────────────

interface DomainCategory {
  name: string;
  icon: string;
  color: string;       // tailwind border/accent color class
  bgColor: string;     // subtle bg tint
  slugs: string[];     // blueprint slugs that belong here
}

const DOMAIN_CATEGORIES: DomainCategory[] = [
  {
    name: "Sales & CRM",
    icon: "💼",
    color: "border-blue-500/30",
    bgColor: "from-blue-500/5 to-transparent",
    slugs: [
      "salesforce", "hubspot", "pipedrive", "copper", "close",
      "apollo", "hunter", "outreach", "salesloft", "gong",
      "mindtickle", "clay", "lagrowthmachine", "instantly", "smartlead",
    ],
  },
  {
    name: "Marketing Automation",
    icon: "📣",
    color: "border-pink-500/30",
    bgColor: "from-pink-500/5 to-transparent",
    slugs: ["mailchimp", "klaviyo", "activecampaign"],
  },
  {
    name: "Advertising & Growth",
    icon: "📈",
    color: "border-orange-500/30",
    bgColor: "from-orange-500/5 to-transparent",
    slugs: ["google-ads", "facebook-ads"],
  },
  {
    name: "Social Media",
    icon: "🌐",
    color: "border-fuchsia-500/30",
    bgColor: "from-fuchsia-500/5 to-transparent",
    slugs: ["instagram", "twitter-x", "tiktok", "youtube", "reddit"],
  },
  {
    name: "Customer Support",
    icon: "🎧",
    color: "border-rose-500/30",
    bgColor: "from-rose-500/5 to-transparent",
    slugs: ["zendesk", "freshdesk", "intercom"],
  },
  {
    name: "Finance & Payments",
    icon: "💳",
    color: "border-emerald-500/30",
    bgColor: "from-emerald-500/5 to-transparent",
    slugs: ["stripe-api", "razorpay", "quickbooks", "xero", "brex", "ramp"],
  },
  {
    name: "HR & Recruiting",
    icon: "👥",
    color: "border-amber-500/30",
    bgColor: "from-amber-500/5 to-transparent",
    slugs: [
      "workday", "sap-successfactors", "rippling", "keka",
      "gusto", "greenhouse", "lever",
    ],
  },
  {
    name: "Engineering & DevOps",
    icon: "⚡",
    color: "border-violet-500/30",
    bgColor: "from-violet-500/5 to-transparent",
    slugs: ["github", "gitlab", "bitbucket", "jira", "linear", "vercel"],
  },
  {
    name: "Product & Design",
    icon: "🎨",
    color: "border-purple-500/30",
    bgColor: "from-purple-500/5 to-transparent",
    slugs: ["figma", "productboard", "asana"],
  },
  {
    name: "Collaboration & Knowledge",
    icon: "💬",
    color: "border-green-500/30",
    bgColor: "from-green-500/5 to-transparent",
    slugs: ["slack", "microsoft-teams", "zoom", "notion", "confluence", "zoho-workspace"],
  },
  {
    name: "Data, Storage & Analytics",
    icon: "📊",
    color: "border-cyan-500/30",
    bgColor: "from-cyan-500/5 to-transparent",
    slugs: [
      "google-sheets", "airtable", "looker", "posthog", "google-analytics",
      "google-drive", "docusign", "typeform", "google-calendar",
    ],
  },
  {
    name: "Commerce & Enterprise",
    icon: "🏢",
    color: "border-slate-400/30",
    bgColor: "from-slate-500/5 to-transparent",
    slugs: ["shopify", "aftership", "servicenow", "sap-s4hana"],
  },
];

// ── Component ────────────────────────────────────────────────────────────────

const Integrations = () => {
  const navigate = useNavigate();
  const userId = useCurrentUserId();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"city" | "list">("list");
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && searchFocused) {
        setSearchQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchFocused]);

  // Data
  const blueprints = useQuery(api.blueprints.list, { status: "active" }) ?? [];
  const toolCounts = useQuery(api.blueprintTools.countsByBlueprint) ?? {};
  const connections = useQuery(api.connections.listByUser, { userId }) ?? [];
  const agents = useQuery(api.agents.list) ?? [];

  const connectedBlueprintIds = new Set(
    connections.filter(c => c.status === "active").map(c => c.blueprintId)
  );
  const activeConnections = connections.filter(c => c.status === "active").length;

  // Build a slug -> blueprint map for quick lookups
  const blueprintBySlug = useMemo(() => {
    const map: Record<string, typeof blueprints[0]> = {};
    for (const bp of blueprints) map[bp.slug] = bp;
    return map;
  }, [blueprints]);

  // Filter blueprints by search
  const query = searchQuery.toLowerCase().trim();

  // For each domain, compute which blueprints match the search
  const domainData = useMemo(() => {
    return DOMAIN_CATEGORIES.map(domain => {
      const items = domain.slugs
        .map(slug => blueprintBySlug[slug])
        .filter((bp): bp is NonNullable<typeof bp> => {
          if (!bp) return false;
          if (!query) return true;
          return (
            bp.name.toLowerCase().includes(query) ||
            bp.slug.toLowerCase().includes(query) ||
            (bp.description ?? "").toLowerCase().includes(query) ||
            domain.name.toLowerCase().includes(query)
          );
        });
      return { domain, items };
    }).filter(d => d.items.length > 0);
  }, [blueprintBySlug, query]);

  // Uncategorized blueprints (not in any domain)
  const categorizedSlugs = useMemo(() => {
    const set = new Set<string>();
    for (const d of DOMAIN_CATEGORIES) for (const s of d.slugs) set.add(s);
    return set;
  }, []);

  const uncategorized = useMemo(() => {
    return blueprints.filter(bp => {
      if (categorizedSlugs.has(bp.slug)) return false;
      if (!query) return true;
      return (
        bp.name.toLowerCase().includes(query) ||
        bp.slug.toLowerCase().includes(query) ||
        (bp.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [blueprints, categorizedSlugs, query]);

  // City view data
  const cityBlueprints = useMemo(() =>
    blueprints.map(bp => ({
      _id: bp._id as string,
      slug: bp.slug,
      name: bp.name,
      description: bp.description ?? "",
      category: bp.category,
      authType: bp.authType,
      toolCount: (toolCounts[bp._id as string] as number) ?? 0,
      isConnected: connectedBlueprintIds.has(bp._id),
    })),
    [blueprints, toolCounts, connectedBlueprintIds]
  );

  const cityAgents = useMemo(() =>
    agents.map(a => ({
      id: a._id as string,
      name: a.name,
      color: "#60a5fa",
      status: a.status,
    })),
    [agents]
  );

  const selectedBlueprint = selectedBlueprintId
    ? blueprints.find(b => (b._id as string) === selectedBlueprintId)
    : null;

  // Total match count for search feedback
  const totalResults = domainData.reduce((sum, d) => sum + d.items.length, 0) + uncategorized.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Integrations</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>{blueprints.length} blueprint{blueprints.length === 1 ? "" : "s"}</span>
              {activeConnections > 0 && (
                <>
                  <span className="text-border select-none">·</span>
                  <span className="text-status-online/80">{activeConnections} connected</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("city")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-all rounded-md ${
                  viewMode === "city"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                <Building2 className="w-3 h-3" />
                City
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-all rounded-md ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                List
              </button>
            </div>
            <Button size="sm" onClick={() => navigate("/integrations/blueprint/new")}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Blueprint
            </Button>
          </div>
        </div>

        {/* ── CITY VIEW ── */}
        {viewMode === "city" && (
          <div className="relative">
            <CityView
              blueprints={cityBlueprints}
              agents={cityAgents}
              selectedBlueprintId={selectedBlueprintId}
              onBuildingSelect={setSelectedBlueprintId}
            />
            {selectedBlueprint && (
              <div
                className="absolute right-0 top-0 bottom-0 w-72 bg-card/95 border-l border-border backdrop-blur-md overflow-y-auto"
                style={{ zIndex: 1000 }}
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-foreground">{selectedBlueprint.name}</h3>
                    <button
                      onClick={() => setSelectedBlueprintId(null)}
                      className="text-muted-foreground hover:text-foreground text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden p-2">
                      {BLUEPRINT_LOGOS[selectedBlueprint.slug] ? (
                        <img src={BLUEPRINT_LOGOS[selectedBlueprint.slug]} alt={selectedBlueprint.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">{selectedBlueprint.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    connectedBlueprintIds.has(selectedBlueprint._id)
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-muted/50 text-muted-foreground"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      connectedBlueprintIds.has(selectedBlueprint._id)
                        ? "bg-green-500 animate-pulse"
                        : "bg-muted-foreground"
                    }`} />
                    {connectedBlueprintIds.has(selectedBlueprint._id) ? "Connected & Live" : "Not Connected"}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary rounded-lg p-2 text-center">
                      <div className="text-lg font-bold text-foreground">
                        {(toolCounts[selectedBlueprint._id as string] as number) ?? 0}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Tools</div>
                    </div>
                    <div className="bg-secondary rounded-lg p-2 text-center">
                      <div className="text-sm font-medium text-foreground capitalize">
                        {selectedBlueprint.authType.replace("_", " ")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Auth</div>
                    </div>
                  </div>
                  {selectedBlueprint.description && (
                    <p className="text-xs text-muted-foreground">{selectedBlueprint.description}</p>
                  )}
                  <Button className="w-full" size="sm" onClick={() => navigate(`/integrations/blueprint/${selectedBlueprint._id}`)}>
                    Manage Blueprint
                  </Button>
                </div>
              </div>
            )}
            {blueprints.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center pointer-events-auto">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">City is Empty</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first integration blueprint to populate the city</p>
                  <Button onClick={() => navigate("/integrations/blueprint/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Blueprint
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LIST VIEW — Domain cards ── */}
        {viewMode === "list" && (
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative group">
              <div className={`relative flex items-center rounded-lg border transition-all duration-300 ${
                searchFocused
                  ? "border-primary/40 bg-card shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                  : "border-border/60 bg-card/80 hover:border-border hover:bg-card"
              }`}>
                <Search className={`absolute left-3.5 w-3.5 h-3.5 transition-colors duration-200 ${
                  searchFocused ? "text-primary" : "text-muted-foreground"
                }`} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full bg-transparent pl-10 pr-24 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                />
                <div className="absolute right-3 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                      className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-secondary/80 border border-border/60 text-[10px] font-medium text-muted-foreground">
                    <span className="text-[11px]">⌘</span>K
                  </kbd>
                </div>
              </div>
              {/* Search results count */}
              {query && (
                <div className="absolute -bottom-5 left-4 text-[11px] text-muted-foreground">
                  {totalResults} result{totalResults !== 1 ? "s" : ""} found
                </div>
              )}
            </div>

            {query && <div className="h-1" />}

            {/* Domain cards — masonry-like layout */}
            {domainData.length > 0 || uncategorized.length > 0 ? (
              <div className="columns-1 md:columns-2 xl:columns-3 gap-3 space-y-3">
                {domainData.map(({ domain, items }) => (
                  <DomainCard
                    key={domain.name}
                    domain={domain}
                    blueprints={items}
                    connectedBlueprintIds={connectedBlueprintIds}
                    toolCounts={toolCounts}
                    onNavigate={navigate}
                  />
                ))}

                {/* Uncategorized */}
                {uncategorized.length > 0 && (
                  <DomainCard
                    domain={{
                      name: "Other",
                      icon: "🔌",
                      color: "border-border/40",
                      bgColor: "from-muted/5 to-transparent",
                      slugs: [],
                    }}
                    blueprints={uncategorized}
                    connectedBlueprintIds={connectedBlueprintIds}
                    toolCounts={toolCounts}
                    onNavigate={navigate}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border/40 bg-card/30">
                {query ? (
                  <>
                    <Search className="w-10 h-10 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-medium text-foreground mb-1">No integrations match "{searchQuery}"</p>
                    <p className="text-xs text-muted-foreground">Try a different search term</p>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-10 h-10 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-medium text-foreground mb-1">No integrations yet</p>
                    <p className="text-xs text-muted-foreground mb-5 max-w-xs text-center">
                      Connect an API by pasting its docs URL — AI generates the blueprint automatically.
                    </p>
                    <Button size="sm" onClick={() => navigate("/integrations/blueprint/new")}>
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      New Blueprint
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// ── Domain Card ──────────────────────────────────────────────────────────────

interface DomainCardProps {
  domain: DomainCategory;
  blueprints: Array<{
    _id: any;
    slug: string;
    name: string;
    description?: string | null;
    authType: string;
    iconUrl?: string | null;
  }>;
  connectedBlueprintIds: Set<any>;
  toolCounts: Record<string, unknown>;
  onNavigate: (path: string) => void;
}

function DomainCard({ domain, blueprints, connectedBlueprintIds, toolCounts, onNavigate }: DomainCardProps) {
  const connectedCount = blueprints.filter(bp => connectedBlueprintIds.has(bp._id)).length;

  return (
    <div
      className={`break-inside-avoid rounded-xl border ${domain.color} bg-gradient-to-br ${domain.bgColor} bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/5`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">{domain.icon}</span>
          <h3 className="text-xs font-semibold text-foreground tracking-tight">{domain.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {connectedCount > 0 && (
            <span className="text-[10px] font-medium text-status-online/80 bg-status-online/10 px-1.5 py-0.5 rounded-full">
              {connectedCount} active
            </span>
          )}
          {blueprints.length > 6 && (
            <span className="text-[10px] text-muted-foreground">
              {blueprints.length} tools
            </span>
          )}
        </div>
      </div>

      {/* Integration items */}
      <div className="px-2.5 pb-2.5 pt-0.5">
        <div className="grid grid-cols-2 gap-1">
          {blueprints.map(bp => {
            const isConnected = connectedBlueprintIds.has(bp._id);
            const logoUrl = BLUEPRINT_LOGOS[bp.slug] || bp.iconUrl;
            const count = (toolCounts[bp._id as string] as number) || 0;

            return (
              <button
                key={bp._id}
                onClick={() => onNavigate(`/integrations/blueprint/${bp._id}`)}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all duration-150 ${
                  isConnected
                    ? "bg-status-online/[0.04] hover:bg-status-online/[0.08]"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                {/* Logo */}
                <div className="relative shrink-0">
                  <div className="w-6 h-6 rounded-md bg-secondary/80 border border-border/40 flex items-center justify-center overflow-hidden p-0.5">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={bp.name}
                        className="w-full h-full object-contain"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {bp.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {/* Connected indicator */}
                  {isConnected && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-status-online ring-1 ring-card" />
                  )}
                </div>

                {/* Name + meta */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate group-hover:text-foreground/90">
                    {bp.name}
                  </p>
                  {count > 0 && (
                    <p className="text-[10px] text-muted-foreground/70">
                      {count} tool{count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Integrations;
