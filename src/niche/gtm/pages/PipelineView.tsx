import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal, DollarSign, Clock, GripVertical, RefreshCw, Loader2, Wifi, WifiOff, Plug } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { IntegrationStatusBanner } from "../../framework/IntegrationStatusBanner";
import { useCrmSync, type Deal } from "../hooks/useCrmSync";

interface PipelineColumn {
  id: string;
  label: string;
  color: string;
}

const COLUMN_DEFS: PipelineColumn[] = [
  { id: "lead", label: "Lead", color: "hsl(0,0%,50%)" },
  { id: "contacted", label: "Contacted", color: "hsl(217, 89%, 61%)" },
  { id: "replied", label: "Replied", color: "hsl(38, 92%, 50%)" },
  { id: "meeting", label: "Meeting", color: "hsl(160, 84%, 39%)" },
  { id: "closed", label: "Closed", color: "hsl(142, 71%, 45%)" },
];

export function PipelineView() {
  const { config } = useNiche();
  const { deals, syncNow, lastSynced, loading, isLive } = useCrmSync();

  // Auto-sync on mount if CRM is connected
  useEffect(() => {
    if (isLive) {
      syncNow();
    }
  }, [isLive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Group deals by stage
  const columns = COLUMN_DEFS.map((col) => ({
    ...col,
    deals: deals.filter((d) => d.stage === col.id),
  }));

  const totalPipelineValue = deals.reduce((sum, d) => sum + d.dealSize, 0);

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <IntegrationStatusBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kanban view of your sales pipeline — drag deals between stages
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live / Not Connected Badge */}
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              isLive
                ? "bg-green-500/10 text-green-500"
                : "bg-yellow-500/10 text-yellow-500"
            }`}
          >
            {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isLive ? "Live" : "Not Connected"}
          </span>

          {/* Sync Button */}
          <button
            onClick={syncNow}
            disabled={loading || !isLive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Sync Now
          </button>

          {lastSynced && (
            <span className="text-[10px] text-muted-foreground">
              Last synced: {lastSynced}
            </span>
          )}

          {deals.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                ${(totalPipelineValue / 1000).toFixed(0)}K total pipeline
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board or Empty State */}
      {isLive && deals.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const colValue = column.deals.reduce((s: number, d: Deal) => s + d.dealSize, 0);
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-72 rounded-xl border border-border bg-card/50"
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: column.color }}
                      />
                      <span className="text-sm font-semibold text-foreground">{column.label}</span>
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-accent/50 text-muted-foreground">
                        {column.deals.length}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${(colValue / 1000).toFixed(0)}K
                  </p>
                </div>

                {/* Deal Cards */}
                <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                  {column.deals.length > 0 ? (
                    column.deals.map((deal: Deal) => (
                      <div
                        key={deal.id}
                        className="rounded-lg border border-border bg-card p-3 hover:border-border/80 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{deal.name}</p>
                              <p className="text-xs text-muted-foreground">{deal.company}</p>
                            </div>
                          </div>
                          <button className="p-1 rounded text-muted-foreground/30 hover:text-muted-foreground transition-colors">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                          <span className="text-xs font-medium text-foreground">
                            ${(deal.dealSize / 1000).toFixed(0)}K
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="w-2.5 h-2.5" />
                              {deal.lastActivity}
                            </span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: deal.score >= 85 ? "hsl(142,71%,45%,0.1)" : deal.score >= 70 ? "hsl(38,92%,50%,0.1)" : "hsl(0,0%,50%,0.1)",
                                color: deal.score >= 85 ? "hsl(142,71%,45%)" : deal.score >= 70 ? "hsl(38,92%,50%)" : "hsl(0,0%,50%)",
                              }}
                            >
                              {deal.score}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-[10px] text-muted-foreground">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <Plug className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Connect your CRM to see your pipeline</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Connect Salesforce or HubSpot to pull in live deal data and visualize your pipeline stages.
          </p>
          <Link
            to="/integrations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <Plug className="w-4 h-4" />
            Connect CRM
          </Link>
        </div>
      )}
    </div>
  );
}
