import {
  DollarSign,
  Users,
  TrendingUp,
  Mail,
  Plug,
  RefreshCw,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useCrmSync } from "../hooks/useCrmSync";

export function GtmInsights() {
  const { config } = useNiche();
  const { deals, contacts, loading, isLive, syncNow } = useCrmSync();

  if (!isLive && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <Plug className="w-12 h-12 text-muted-foreground/20 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Connect your CRM</h2>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          Link HubSpot or Salesforce to see live pipeline insights powered by AI
        </p>
        <Link
          to="/integrations"
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: config.accentColor }}
        >
          Connect Integrations
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pipelineValue = deals.reduce((s, d) => s + d.dealSize, 0);
  const avgDealSize = deals.length > 0 ? Math.round(pipelineValue / deals.length) : 0;
  const topDeals = [...deals].sort((a, b) => b.dealSize - a.dealSize).slice(0, 5);
  const contactsWithEmail = contacts.filter((c) => c.email).length;

  // Stage distribution
  const stageCounts: Record<string, number> = {};
  for (const d of deals) {
    stageCounts[d.stage] = (stageCounts[d.stage] || 0) + 1;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">AI-analyzed pipeline and outreach performance</p>
        </div>
        <button
          onClick={syncNow}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync CRM
        </button>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pipeline Value", value: pipelineValue >= 1000 ? `$${(pipelineValue / 1000).toFixed(0)}K` : `$${pipelineValue}`, icon: DollarSign },
          { label: "Active Deals", value: String(deals.length), icon: TrendingUp },
          { label: "Contacts", value: String(contacts.length), icon: Users },
          { label: "Avg Deal Size", value: avgDealSize >= 1000 ? `$${(avgDealSize / 1000).toFixed(0)}K` : `$${avgDealSize}`, icon: BarChart3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-xl border border-border/50 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Stage breakdown */}
      {Object.keys(stageCounts).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Pipeline by Stage</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {["lead", "contacted", "replied", "meeting", "closed"].map((stage) => {
              const count = stageCounts[stage] ?? 0;
              const colors: Record<string, string> = {
                lead: "border-blue-500/30 bg-blue-500/5",
                contacted: "border-yellow-500/30 bg-yellow-500/5",
                replied: "border-orange-500/30 bg-orange-500/5",
                meeting: "border-purple-500/30 bg-purple-500/5",
                closed: "border-green-500/30 bg-green-500/5",
              };
              return (
                <div key={stage} className={`p-3 rounded-xl border ${colors[stage] ?? "border-border/50"}`}>
                  <p className="text-xs text-muted-foreground capitalize">{stage}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top deals */}
      {topDeals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Top Deals</h2>
          {topDeals.map((deal) => (
            <div key={deal.id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border/50 bg-card">
              <div className={`w-2 h-2 rounded-full ${deal.stage === "closed" ? "bg-green-500" : deal.stage === "meeting" ? "bg-purple-500" : "bg-blue-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{deal.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{deal.company} · {deal.stage}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">${deal.dealSize.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Score: {deal.score}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {deals.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No deal data yet. Sync your CRM to see insights here.</p>
        </div>
      )}
    </div>
  );
}
