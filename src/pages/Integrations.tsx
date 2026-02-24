import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { IntegrationCard } from "@/components/IntegrationCard";
import { IntegrationActivityFeed } from "@/components/IntegrationActivityFeed";
import { INTEGRATIONS, INTEGRATION_CATEGORIES, CATEGORY_CONFIG, Integration } from "@/data/integrations";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plug, Sparkles, Activity, Plus, Code, ChevronRight, Wrench, Building2, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { BLUEPRINT_LOGOS } from "@/lib/integrationLogos";
import { CityView } from "@/components/CityView/CityView";

// Category labels to display-friendly text
const CATEGORY_LABELS: Record<string, string> = {
  "developer_tools": "Dev Tools",
  "project_management": "Project Mgmt",
  "communication": "Communication",
  "CRM": "CRM",
  "Productivity": "Productivity",
  "Communication": "Communication",
  "Payments": "Payments",
  "support": "Support",
};

const Integrations = () => {
  const navigate = useNavigate();
  const userId = useCurrentUserId();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "coming_soon">("all");
  const [showActivity, setShowActivity] = useState(false);
  const [showTemplateCatalog, setShowTemplateCatalog] = useState(false);
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

  // Group by category for display
  const groupedIntegrations = useMemo(() => {
    const groups: Record<string, Integration[]> = {};
    for (const integration of filteredIntegrations) {
      if (!groups[integration.category]) groups[integration.category] = [];
      groups[integration.category].push(integration);
    }
    return groups;
  }, [filteredIntegrations]);

  const activeConnections = connections.filter(c => c.status === "active").length;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {blueprints?.length || 0} custom blueprint{blueprints?.length === 1 ? '' : 's'}
              {connections.length > 0 ? ` · ${connections.filter(c => c.status === 'active').length} connected` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-secondary rounded-lg p-1 gap-1">
              <button
                onClick={() => setViewMode("city")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "city"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                City View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                List View
              </button>
            </div>
            <Button onClick={() => navigate("/integrations/blueprint/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Blueprint
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
            {/* Universal Integration Engine info banner */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-500">Universal Integration Engine</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create custom API integrations or import from OpenAPI specs. Your AI agents can discover and execute any connected integration at runtime.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Blueprints Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Custom Blueprints ({blueprints?.length || 0})
                </h2>
              </div>
              {blueprints && blueprints.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {blueprints.map(blueprint => {
                    const isConnected = connectedBlueprintIds.has(blueprint._id);
                    const logoUrl = BLUEPRINT_LOGOS[blueprint.slug] || blueprint.iconUrl;
                    const categoryLabel = CATEGORY_LABELS[blueprint.category] || blueprint.category;
                    const count = toolCounts[blueprint._id as string] || 0;
                    return (
                      <div
                        key={blueprint._id}
                        onClick={() => navigate(`/integrations/blueprint/${blueprint._id}`)}
                        className={`group relative rounded-lg border bg-card transition-all cursor-pointer hover:shadow-md hover:shadow-black/5 hover:-translate-y-0.5 ${
                          isConnected
                            ? "border-green-500/30 hover:border-green-500/50"
                            : "border-border hover:border-border/80"
                        }`}
                      >
                        {/* Connected indicator bar */}
                        {isConnected && (
                          <div className="absolute top-0 left-3 right-3 h-[2px] bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0 rounded-b" />
                        )}

                        <div className="px-3 py-2.5">
                          {/* Row: logo + name + status */}
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
                              {logoUrl ? (
                                <img
                                  src={logoUrl}
                                  alt={blueprint.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-xs font-bold text-muted-foreground">
                                  {blueprint.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-sm truncate flex-1 group-hover:text-primary transition-colors">
                              {blueprint.name}
                            </h3>
                            {isConnected ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Live
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium text-muted-foreground/60 shrink-0">
                                Setup
                              </span>
                            )}
                          </div>

                          {/* Description - single line */}
                          <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1 leading-normal pl-[42px]">
                            {blueprint.description}
                          </p>

                          {/* Footer: category + auth + tool count */}
                          <div className="flex items-center gap-1.5 pl-[42px]">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted/60 text-muted-foreground capitalize">
                              {categoryLabel}
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted/60 text-muted-foreground">
                              {blueprint.authType.replace("_", " ")}
                            </span>
                            {count > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary ml-auto">
                                <Wrench className="w-2.5 h-2.5" />
                                {count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 rounded-lg border border-dashed border-border">
                  <Code className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">No Custom Blueprints Yet</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create your first integration to get started
                  </p>
                  <Button onClick={() => navigate("/integrations/blueprint/new")} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Blueprint
                  </Button>
                </div>
              )}
            </div>

            {/* Template Catalog Toggle */}
            <div className="rounded-lg border border-border bg-card">
              <button
                onClick={() => setShowTemplateCatalog(!showTemplateCatalog)}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Plug className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Integration Templates ({INTEGRATIONS.length})
                  </h3>
                  <Badge variant="secondary" className="text-xs">Reference Only</Badge>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showTemplateCatalog ? 'rotate-90' : ''}`} />
              </button>

              {showTemplateCatalog && (
                <div className="p-4 pt-0 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Browse integration templates for inspiration.
                    Click "Create Blueprint" to build your own custom integration.
                  </p>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-secondary rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground border-0 outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Category filter tabs - horizontally scrollable */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setCategoryFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}>
                      All ({INTEGRATIONS.length})
                    </button>
                    {INTEGRATION_CATEGORIES.map(cat => {
                      const count = INTEGRATIONS.filter(i => i.category === cat).length;
                      const config = CATEGORY_CONFIG[cat];
                      return (
                        <button key={cat} onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                            categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}>
                          {config.emoji} {cat} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Status filter */}
                  <div className="flex items-center gap-2">
                    {(["all", "available", "coming_soon"] as const).map(f => (
                      <button key={f} onClick={() => setStatusFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          statusFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}>
                        {f === "all" ? "All" : f === "available" ? "Available" : "Coming Soon"}
                      </button>
                    ))}
                  </div>

                  {/* Integration Grid - grouped by category when "all" is selected */}
                  {categoryFilter === "all" ? (
                    Object.entries(groupedIntegrations).map(([category, integrations]) => (
                      <div key={category}>
                        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <span>{CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.emoji}</span>
                          {category} ({integrations.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {integrations.map(integration => (
                            <IntegrationCard
                              key={integration.slug}
                              integration={integration}
                              isEnabled={false}
                              isConnected={false}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredIntegrations.map(integration => (
                        <IntegrationCard
                          key={integration.slug}
                          integration={integration}
                          isEnabled={false}
                          isConnected={false}
                        />
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {filteredIntegrations.length === 0 && (
                    <div className="text-center py-12 rounded-lg border border-dashed border-border">
                      <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Templates Found</h3>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity Section */}
            {activeConnections > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
                  </div>
                  <button
                    onClick={() => setShowActivity(!showActivity)}
                    className="text-xs text-primary hover:underline"
                  >
                    {showActivity ? "Hide" : "Show"}
                  </button>
                </div>
                {showActivity && (
                  <IntegrationActivityFeed userId={user?.id} limit={10} />
                )}
              </div>
            )}

            {/* Help section */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">About Integrations</h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground">Blueprints</strong> define how Mission Control talks to an external API — the base URL, authentication method, and a set of callable tools (endpoints). Create one manually, import an OpenAPI/Swagger spec, or let AI scrape a docs page and generate one automatically.
                </p>
                <p>
                  <strong className="text-foreground">Connections</strong> store your credentials for a given blueprint. Once connected, auth tokens are encrypted at rest and automatically refreshed — agents never handle raw secrets.
                </p>
                <p>
                  <strong className="text-foreground">Agents use blueprints at runtime.</strong> Scout can query REST APIs for live data, Forge can open or update tickets, Ghost can publish to social platforms — all without manual intervention, resolved and executed through the Universal Integration Engine.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Integrations;
