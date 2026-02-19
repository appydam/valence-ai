import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { IntegrationCard } from "@/components/IntegrationCard";
import { IntegrationActivityFeed } from "@/components/IntegrationActivityFeed";
import { INTEGRATIONS, INTEGRATION_CATEGORIES, CATEGORY_CONFIG, Integration } from "@/data/integrations";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plug, ExternalLink, Sparkles, Activity, Plus, Code, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";

const Integrations = () => {
  const navigate = useNavigate();
  const userId = useCurrentUserId();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "coming_soon">("all");
  const [showActivity, setShowActivity] = useState(false);
  const [showTemplateCatalog, setShowTemplateCatalog] = useState(false);

  // Get current user
  const { user } = useUser();

  // Get custom blueprints (active only)
  const blueprints = useQuery(api.blueprints.list, { status: "active" }) ?? [];

  // Get connections to see which blueprints are connected
  const connections = useQuery(api.connections.listByUser, { userId }) ?? [];
  const connectedBlueprintIds = new Set(
    connections.filter(c => c.status === "active").map(c => c.blueprintId)
  );

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {blueprints?.length || 0} custom blueprint{blueprints?.length === 1 ? '' : 's'}
              {connections.length > 0 ? ` · ${connections.filter(c => c.status === 'active').length} connected` : ''}
            </p>
          </div>
          <Button onClick={() => navigate("/integrations/blueprint/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Blueprint
          </Button>
        </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {blueprints.map(blueprint => {
                const isConnected = connectedBlueprintIds.has(blueprint._id);
                return (
                  <div
                    key={blueprint._id}
                    onClick={() => navigate(`/integrations/blueprint/${blueprint._id}`)}
                    className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{blueprint.name}</h3>
                      <div className="flex gap-1">
                        <Badge variant={blueprint.status === "active" ? "default" : "secondary"} className="text-xs">
                          {blueprint.status}
                        </Badge>
                        {isConnected && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            Connected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {blueprint.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{blueprint.authType}</Badge>
                      <span>{blueprint.category}</span>
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
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>Custom Blueprints</strong> are API integrations you create manually, import from OpenAPI specs, or generate via AI doc scraping.
              <strong> Connected</strong> blueprints have active credentials stored and can be used by agents.
            </p>
            <p>
              When connected, agents like Scout can pull data from APIs, Forge can create tickets,
              and Ghost can post to social media — all automatically through the Universal Integration Engine.
            </p>
            <a href="https://docs.convex.dev" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline">
              Learn more about integrations <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Integrations;
