import {
  Building2,
  Users,
  Sparkles,
  Database,
  Mail,
  Plug,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useUserTasks } from "@/hooks/useUserScoped";

const PLATFORMS = [
  { slug: "apollo", label: "Apollo", color: "#6C5CE7" },
  { slug: "clay", label: "Clay", color: "#FF6B35" },
  { slug: "hubspot", label: "HubSpot", color: "#FF7A59" },
  { slug: "lagrowthmachine", label: "LGM", color: "#00C48C" },
];

const PIPELINE_STAGES = [
  { key: "companies", label: "Companies", color: "bg-blue-500", icon: Building2 },
  { key: "contacts", label: "Contacts", color: "bg-purple-500", icon: Users },
  { key: "enriched", label: "Enriched", color: "bg-amber-500", icon: Sparkles },
  { key: "crm", label: "In CRM", color: "bg-orange-500", icon: Database },
  { key: "sequences", label: "Sequenced", color: "bg-green-500", icon: Mail },
];

export function OutboundDataPanel() {
  const { config } = useNiche();
  const { isConnected } = useIntegrationCall();

  const tasks = useUserTasks();
  const outboundTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:outbound")
  );

  const hasAnyConnection = PLATFORMS.some((p) => isConnected(p.slug));

  // Count tasks by stage tags
  const stageCounts: Record<string, number> = {};
  for (const task of outboundTasks) {
    const tags = (task as { tags?: string[] }).tags ?? [];
    for (const stage of PIPELINE_STAGES) {
      if (tags.includes(`stage:${stage.key}`)) {
        stageCounts[stage.key] = (stageCounts[stage.key] || 0) + 1;
      }
    }
  }

  // Count deliverables as a proxy for stage progress
  const completed = outboundTasks.filter((t: { status: string }) => t.status === "done").length;
  const active = outboundTasks.filter((t: { status: string }) => t.status === "in_progress" || t.status === "assigned").length;

  if (!hasAnyConnection) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <Plug className="w-8 h-8 text-muted-foreground/20 mb-3" />
        <p className="text-xs text-muted-foreground/50 mb-3">
          Connect Apollo + HubSpot to see live pipeline data
        </p>
        <Link
          to="/integrations"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white transition-colors"
          style={{ background: config.accentColor }}
        >
          <Plug className="w-3 h-3" />
          Connect Integrations
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 shrink-0">
        <span className="text-xs font-medium text-foreground/80">Outbound Pipeline</span>
      </div>

      <div className="px-4 py-3 space-y-4 flex-1">
        {/* Connected platforms */}
        <div className="flex items-center gap-2 flex-wrap">
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

        {/* Pipeline stage counts */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
            Pipeline Stages
          </h3>
          <div className="space-y-1.5">
            {PIPELINE_STAGES.map((stage) => {
              const Icon = stage.icon;
              const count = stageCounts[stage.key] ?? 0;
              return (
                <div key={stage.key} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/15 bg-background/30">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${stage.color}`} />
                  <Icon className="w-3 h-3 text-muted-foreground/40" />
                  <span className="text-[11px] text-foreground/70 flex-1">{stage.label}</span>
                  <span className="text-[11px] font-bold text-foreground/80">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task summary */}
        <div>
          <h3 className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
            Task Summary
          </h3>
          <div className="space-y-1.5">
            {[
              { label: "Active Tasks", value: String(active), color: "text-blue-400" },
              { label: "Completed", value: String(completed), color: "text-green-500" },
              { label: "Total", value: String(outboundTasks.length), color: "text-foreground/60" },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-border/15 bg-background/30">
                <span className="text-[11px] text-foreground/70">{metric.label}</span>
                <span className={`text-[11px] font-bold ${metric.color}`}>{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/niche/outbound/pipeline"
          className="block text-center text-[11px] font-medium hover:underline transition-colors mt-2"
          style={{ color: config.accentColor }}
        >
          View Full Pipeline →
        </Link>
      </div>
    </div>
  );
}
