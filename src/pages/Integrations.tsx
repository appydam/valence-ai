import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { IntegrationActivityFeed } from "@/components/IntegrationActivityFeed";
import { INTEGRATIONS, INTEGRATION_CATEGORIES } from "@/data/integrations";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plug, Plus, Building2, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { BLUEPRINT_LOGOS } from "@/lib/integrationLogos";
import { CityView } from "@/components/CityView/CityView";


const Integrations = () => {
  const navigate = useNavigate();
  const userId = useCurrentUserId();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "coming_soon">("all");
  const [viewMode, setViewMode] = useState<"city" | "list">("list");
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null);

  // Get current user
  const { user } = useUser();

  // Get custom blueprints (active only)
  const blueprints = useQuery(api.blueprints.list, { status: "active" }) ?? [];

  // Get tool counts for all blueprints
  const toolCounts = useQuery(api.blueprintTools.countsByBlueprint) ?? {};

  // Get connections to see which blueprints are connected
  const connections = useQuery(api.connections.listByUser, { userId }) ?? [];
  const connectedBlueprintIds = new Set(
    connections.filter(c => c.status === "active").map(c => c.blueprintId)
  );

  // Get agents for city walkers
  const agents = useQuery(api.agents.list) ?? [];

  // Map blueprints to CityView format
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

  // Map agents to city format
  const cityAgents = useMemo(() =>
    agents.map(a => ({
      id: a._id as string,
      name: a.name,
      color: "#60a5fa",
      status: a.status,
    })),
    [agents]
  );

  // Selected blueprint detail
  const selectedBlueprint = selectedBlueprintId
    ? blueprints.find(b => (b._id as string) === selectedBlueprintId)
    : null;

  // Filter logic
  const filteredIntegrations = useMemo(() => {
    return INTEGRATIONS.filter(integration => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!integration.name.toLowerCase().includes(q) &&
            !integration.description.toLowerCase().includes(q) &&
            !integration.category.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Category filter
      if (categoryFilter !== "all" && integration.category !== categoryFilter) return false;
      // Status filter
      if (statusFilter === "available" && integration.status !== "available") return false;
      if (statusFilter === "coming_soon" && integration.status !== "coming_soon") return false;
      return true;
    });
  }, [searchQuery, categoryFilter, statusFilter]);

  const activeConnections = connections.filter(c => c.status === "active").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Integrations</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>{blueprints?.length || 0} blueprint{blueprints?.length === 1 ? '' : 's'}</span>
              {activeConnections > 0 && (
                <>
                  <span className="text-border select-none">·</span>
                  <span className="text-status-online/80">{activeConnections} connected</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* View toggle — pill tray */}
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
            {/* City canvas */}
            <CityView
              blueprints={cityBlueprints}
              agents={cityAgents}
              selectedBlueprintId={selectedBlueprintId}
              onBuildingSelect={setSelectedBlueprintId}
            />

            {/* Side panel for selected blueprint */}
            {selectedBlueprint && (
              <div
                className="absolute right-0 top-0 bottom-0 w-72 bg-card/95 border-l border-border backdrop-blur-md overflow-y-auto"
                style={{ zIndex: 1000 }}
              >
                <div className="p-4 space-y-4">
                  {/* Close button */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-foreground">{selectedBlueprint.name}</h3>
                    <button
                      onClick={() => setSelectedBlueprintId(null)}
                      className="text-muted-foreground hover:text-foreground text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>

                  {/* Logo */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden p-2">
                      {BLUEPRINT_LOGOS[selectedBlueprint.slug] ? (
                        <img
                          src={BLUEPRINT_LOGOS[selectedBlueprint.slug]}
                          alt={selectedBlueprint.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {selectedBlueprint.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connection status */}
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

                  {/* Stats */}
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

                  {/* Description */}
                  {selectedBlueprint.description && (
                    <p className="text-xs text-muted-foreground">{selectedBlueprint.description}</p>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => navigate(`/integrations/blueprint/${selectedBlueprint._id}`)}
                    >
                      Manage Blueprint
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state for city when no blueprints */}
            {blueprints.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center pointer-events-auto">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">City is Empty</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first integration blueprint to populate the city
                  </p>
                  <Button onClick={() => navigate("/integrations/blueprint/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Blueprint
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {viewMode === "list" && (
          <div className="space-y-6">
            {/* Blueprint List */}
            {blueprints && blueprints.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
                {blueprints.map(blueprint => {
                  const isConnected = connectedBlueprintIds.has(blueprint._id);
                  const logoUrl = BLUEPRINT_LOGOS[blueprint.slug] || blueprint.iconUrl;
                  const count = toolCounts[blueprint._id as string] || 0;
                  return (
                    <div
                      key={blueprint._id}
                      onClick={() => navigate(`/integrations/blueprint/${blueprint._id}`)}
                      className={`relative group rounded-xl border bg-card p-4 cursor-pointer transition-all duration-150 hover:bg-surface-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 hover:border-border/80 ${
                        isConnected
                          ? "border-status-online/25 ring-1 ring-status-online/20"
                          : "border-border"
                      }`}
                    >
                      {/* Status dot — absolute top right */}
                      {isConnected && (
                        <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-status-online animate-pulse-glow" />
                      )}

                      {/* Logo */}
                      <div className="w-10 h-10 rounded-xl bg-secondary border border-border/60 flex items-center justify-center mx-auto mt-3 mb-2 overflow-hidden p-2">
                        {logoUrl ? (
                          <img src={logoUrl} alt={blueprint.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-sm font-semibold text-muted-foreground">
                            {blueprint.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Name + tool count */}
                      <div className="mt-1 text-center">
                        <p className="text-sm font-medium text-foreground group-hover:text-foreground/90 truncate">{blueprint.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {count > 0 ? `${count} tools` : blueprint.authType.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-dashed border-border/60 bg-card/50">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <Plug className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No integrations yet</p>
                <p className="text-xs text-muted-foreground mb-5 max-w-xs text-center">
                  Connect an API by pasting its docs URL — AI generates the blueprint automatically.
                </p>
                <Button size="sm" onClick={() => navigate("/integrations/blueprint/new")}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New Blueprint
                </Button>
              </div>
            )}

            {/* Template Catalog — always visible */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Template Catalog
                </span>
                <span className="text-xs text-muted-foreground">{INTEGRATIONS.length} templates</span>
              </div>

              <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-card rounded-lg pl-9 pr-4 py-2 text-xs text-foreground border border-border/60 outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 transition-colors placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Category filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                      categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                    }`}
                  >
                    All ({INTEGRATIONS.length})
                  </button>
                  {INTEGRATION_CATEGORIES.map(cat => {
                    const catCount = INTEGRATIONS.filter(i => i.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                          categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                        }`}
                      >
                        {cat} ({catCount})
                      </button>
                    );
                  })}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1.5">
                  {(["all", "available", "coming_soon"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        statusFilter === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                      }`}
                    >
                      {f === "all" ? "All" : f === "available" ? "Available" : "Coming Soon"}
                    </button>
                  ))}
                </div>

                {/* Template rows */}
                {filteredIntegrations.length > 0 ? (
                  <div className="rounded-lg border border-border/60 overflow-hidden bg-card">
                    {filteredIntegrations.map((integration, index) => {
                      const logoUrl = BLUEPRINT_LOGOS[integration.slug] || integration.iconUrl;
                      const isComingSoon = integration.status === "coming_soon";
                      return (
                        <div
                          key={integration.slug}
                          className={`flex items-center gap-3 px-4 py-3 ${
                            index !== 0 ? "border-t border-border" : ""
                          } ${isComingSoon ? "opacity-40" : "hover:bg-surface-hover transition-colors duration-100 cursor-pointer"}`}
                        >
                          <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0 overflow-hidden p-1">
                            {logoUrl ? (
                              <img
                                src={logoUrl}
                                alt={integration.name}
                                className="w-full h-full object-contain"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {integration.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{integration.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{integration.description}</p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-[11px] text-muted-foreground hidden sm:block">{integration.category}</span>
                            {isComingSoon ? (
                              <span className="text-[11px] text-muted-foreground/50">Soon</span>
                            ) : (
                              <button
                                onClick={() => navigate(`/integrations/blueprint/new?name=${encodeURIComponent(integration.name)}&category=${encodeURIComponent(integration.category)}`)}
                                className="text-[11px] font-medium text-primary hover:text-primary/80 hover:underline transition-colors whitespace-nowrap"
                              >
                                Use template
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 rounded-lg border border-dashed border-border">
                    <p className="text-xs text-muted-foreground">No templates match your filters</p>
                  </div>
                )}
              </div>
            </div>

            {/* Execution Log */}
            {activeConnections > 0 && (
              <div className="pt-2 border-t border-border/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Execution Log
                  </span>
                  <span className="text-xs text-muted-foreground">Last 10 calls</span>
                </div>
                <IntegrationActivityFeed userId={user?.id} limit={10} />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Integrations;
