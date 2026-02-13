import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { IntegrationCard } from "@/components/IntegrationCard";
import { INTEGRATIONS, INTEGRATION_CATEGORIES, CATEGORY_CONFIG, Integration } from "@/data/integrations";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plug, ExternalLink, Sparkles } from "lucide-react";

const Integrations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "enabled" | "coming_soon">("all");

  // Get enabled integrations from Convex
  const enabledIntegrations = useQuery(api.integrations.list, {}) ?? [];
  const enabledSlugs = new Set(enabledIntegrations.filter(i => i.enabled).map(i => i.slug));
  const connectedSlugs = new Set(enabledIntegrations.filter(i => i.connectedAt).map(i => i.slug));

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
      if (statusFilter === "enabled" && !enabledSlugs.has(integration.slug)) return false;
      if (statusFilter === "available" && integration.status !== "available") return false;
      if (statusFilter === "coming_soon" && integration.status !== "coming_soon") return false;
      return true;
    });
  }, [searchQuery, categoryFilter, statusFilter, enabledSlugs]);

  // Group by category for display
  const groupedIntegrations = useMemo(() => {
    const groups: Record<string, Integration[]> = {};
    for (const integration of filteredIntegrations) {
      if (!groups[integration.category]) groups[integration.category] = [];
      groups[integration.category].push(integration);
    }
    return groups;
  }, [filteredIntegrations]);

  // Stats
  const totalAvailable = INTEGRATIONS.filter(i => i.status === "available").length;
  const totalEnabled = enabledSlugs.size;
  const totalConnected = connectedSlugs.size;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalAvailable} integrations available{totalEnabled > 0 ? ` · ${totalEnabled} enabled` : ""}
              {totalConnected > 0 ? ` · ${totalConnected} connected` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Paragon
            </span>
          </div>
        </div>

        {/* Paragon not configured banner */}
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-start gap-3">
            <Plug className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-500">Paragon Integration Hub</p>
              <p className="text-xs text-muted-foreground mt-1">
                Enable integrations below to give your AI agents superpowers. Once Paragon is configured,
                agents will be able to read and write data across all your connected tools.
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search integrations..."
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
          {(["all", "available", "enabled", "coming_soon"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              {f === "all" ? "All" : f === "available" ? "Available" : f === "enabled" ? "Enabled" : "Coming Soon"}
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
                    isEnabled={enabledSlugs.has(integration.slug)}
                    isConnected={connectedSlugs.has(integration.slug)}
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
                isEnabled={enabledSlugs.has(integration.slug)}
                isConnected={connectedSlugs.has(integration.slug)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12 rounded-lg border border-dashed border-border">
            <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Integrations Found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Help section */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">About Integrations</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>Available</strong> integrations can be connected once Paragon is set up.
              <strong> Enabled</strong> integrations are marked for use by your AI agents.
              <strong> Connected</strong> integrations have active OAuth connections.
            </p>
            <p>
              When connected, agents like Scout can pull data from your CRM, Forge can create Jira tickets,
              and Ghost can post to social media — all automatically.
            </p>
            <a href="https://useparagon.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline">
              Learn more about Paragon <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Integrations;
