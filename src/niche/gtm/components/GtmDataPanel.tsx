import {
  DollarSign,
  Users,
  TrendingUp,
  Mail,
  Plug,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useCrmSync } from "../hooks/useCrmSync";

const PLATFORMS = [
  { slug: "hubspot", label: "HubSpot", color: "#FF7A59" },
  { slug: "salesforce", label: "Salesforce", color: "#00A1E0" },
  { slug: "apollo", label: "Apollo", color: "#6C5CE7" },
  { slug: "gmail", label: "Gmail", color: "#EA4335" },
];

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  lead: { label: "Lead", color: "bg-blue-500" },
  contacted: { label: "Contacted", color: "bg-yellow-500" },
  replied: { label: "Replied", color: "bg-orange-500" },
  meeting: { label: "Meeting", color: "bg-purple-500" },
  closed: { label: "Closed", color: "bg-green-500" },
};

export function GtmDataPanel() {
  const { config } = useNiche();
  const { isConnected } = useIntegrationCall();
  const { deals, contacts, loading, syncNow, isLive } = useCrmSync();

  const pipelineValue = deals.reduce((s, d) => s + d.dealSize, 0);
  const avgDealSize = deals.length > 0 ? Math.round(pipelineValue / deals.length) : 0;
  const contactsWithEmail = contacts.filter((c) => c.email).length;

  // Stage distribution
  const stageCounts: Record<string, number> = {};
  for (const d of deals) {
    stageCounts[d.stage] = (stageCounts[d.stage] || 0) + 1;
  }

  if (!isLive) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <Plug className="w-8 h-8 text-muted-foreground/20 mb-3" />
        <p className="text-xs text-muted-foreground/50 mb-3">
          Connect a CRM to see live pipeline data
        </p>
        <Link
          to="/integrations"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white transition-colors"
          style={{ background: config.accentColor }}
        >
          <Plug className="w-3 h-3" />
          Connect CRM
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 shrink-0">
        <span className="text-xs font-medium text-foreground/80">Live Pipeline</span>
        <button
          onClick={syncNow}
          className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="px-4 py-3 space-y-4 flex-1">
        {/* Connected platforms */}
        <div className="flex items-center gap-2">
          {PLATFORMS.map((p) => {
            const connected = isConnected(p.slug);
            return (
              <div
                key={p.slug}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border/30 text-[10px]"
                style={{ opacity: connected ? 1 : 0.3 }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: connected ? "#22c55e" : "#6b7280" }} />
                <span className="text-muted-foreground/70">{p.label}</span>
              </div>
            );
          })}
        </div>

        {loading && deals.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
          </div>
        ) : (
          <>
            {/* Key metrics */}
            <div className="space-y-2">
              {[
                { label: "Pipeline Value", value: formatCurrency(pipelineValue), icon: DollarSign, color: "text-green-500" },
                { label: "Active Deals", value: String(deals.length), icon: TrendingUp, color: "text-blue-400" },
                { label: "Contacts", value: String(contacts.length), icon: Users, color: "text-purple-400" },
                { label: "With Email", value: String(contactsWithEmail), icon: Mail, color: "text-orange-400" },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/20 bg-background/50">
                    <Icon className={`w-3.5 h-3.5 ${metric.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground/50">{metric.label}</p>
                      <p className="text-sm font-bold text-foreground leading-none mt-0.5">{metric.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pipeline stages */}
            {Object.keys(stageCounts).length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
                  Pipeline Stages
                </h3>
                <div className="space-y-1.5">
                  {Object.entries(stageCounts)
                    .sort(([a], [b]) => {
                      const order = ["lead", "contacted", "replied", "meeting", "closed"];
                      return order.indexOf(a) - order.indexOf(b);
                    })
                    .map(([stage, count]) => {
                      const cfg = STAGE_LABELS[stage] ?? { label: stage, color: "bg-muted-foreground" };
                      return (
                        <div key={stage} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/15 bg-background/30">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.color}`} />
                          <span className="text-[11px] text-foreground/70 flex-1">{cfg.label}</span>
                          <span className="text-[11px] font-bold text-foreground/80">{count}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <Link
              to="/niche/gtm/insights"
              className="block text-center text-[11px] font-medium hover:underline transition-colors mt-2"
              style={{ color: config.accentColor }}
            >
              View All Insights →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
