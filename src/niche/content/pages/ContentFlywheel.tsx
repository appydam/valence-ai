import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  RotateCcw,
  ArrowRight,
  Loader2,
  Inbox,
  AlertTriangle,
  Zap,
  Clock,
  FileText,
  CheckCircle2,
  BarChart3,
  Search,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useUserTasks } from "@/hooks/useUserScoped";

type FlywheelStage = "Research" | "Draft" | "Review" | "Published" | "Analyzing";

interface StageData {
  stage: FlywheelStage;
  icon: typeof Search;
  items: ContentItem[];
  avgTimeMs: number;
  color: string;
}

interface ContentItem {
  id: string;
  title: string;
  assignee: string;
  createdAt: number;
  status: string;
}

const STAGE_CONFIG: Record<
  FlywheelStage,
  { icon: typeof Search; color: string; statusMap: string[] }
> = {
  Research: {
    icon: Search,
    color: "hsl(217, 89%, 61%)",
    statusMap: ["inbox", "assigned"],
  },
  Draft: {
    icon: FileText,
    color: "hsl(38, 92%, 50%)",
    statusMap: ["in_progress"],
  },
  Review: {
    icon: CheckCircle2,
    color: "hsl(262, 83%, 58%)",
    statusMap: ["in_review"],
  },
  Published: {
    icon: CheckCircle2,
    color: "hsl(142, 71%, 45%)",
    statusMap: ["done"],
  },
  Analyzing: {
    icon: BarChart3,
    color: "hsl(330, 70%, 55%)",
    statusMap: [], // manually assigned based on done + tags
  },
};

const STAGE_ORDER: FlywheelStage[] = [
  "Research",
  "Draft",
  "Review",
  "Published",
  "Analyzing",
];

function msToHumanDays(ms: number): string {
  const days = ms / (1000 * 60 * 60 * 24);
  if (days < 1) {
    const hours = ms / (1000 * 60 * 60);
    return `${Math.round(hours)}h`;
  }
  return `${days.toFixed(1)}d`;
}

export function ContentFlywheel() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();

  const tasks = useUserTasks();
  const contentTasks = useMemo(
    () =>
      (tasks ?? []).filter((t: { tags?: string[] }) =>
        t.tags?.includes("niche:content")
      ),
    [tasks]
  );

  // Map tasks to flywheel stages
  const stages: StageData[] = useMemo(() => {
    const stageMap: Record<FlywheelStage, ContentItem[]> = {
      Research: [],
      Draft: [],
      Review: [],
      Published: [],
      Analyzing: [],
    };

    for (const task of contentTasks) {
      const t = task as any;
      const item: ContentItem = {
        id: t._id,
        title: t.title,
        assignee: t.assignee ?? "Unassigned",
        createdAt: t._creationTime,
        status: t.status,
      };

      // Analyzing: done tasks with analytics tag
      if (t.status === "done" && t.tags?.includes("analyzing")) {
        stageMap.Analyzing.push(item);
      } else if (t.status === "inbox" || t.status === "assigned") {
        stageMap.Research.push(item);
      } else if (t.status === "in_progress") {
        stageMap.Draft.push(item);
      } else if (t.status === "in_review") {
        stageMap.Review.push(item);
      } else if (t.status === "done") {
        stageMap.Published.push(item);
      }
    }

    return STAGE_ORDER.map((stage) => {
      const cfg = STAGE_CONFIG[stage];
      const items = stageMap[stage];

      // Compute avg time in stage (rough estimate from creation time to now for active)
      let avgTimeMs = 0;
      if (items.length > 0) {
        const now = Date.now();
        const totalTime = items.reduce((sum, it) => sum + (now - it.createdAt), 0);
        avgTimeMs = totalTime / items.length;
      }

      return {
        stage,
        icon: cfg.icon,
        items,
        avgTimeMs,
        color: cfg.color,
      };
    });
  }, [contentTasks]);

  // Velocity: avg time from Research to Published
  const velocity = useMemo(() => {
    const researchItems = stages.find((s) => s.stage === "Research");
    const publishedItems = stages.find((s) => s.stage === "Published");
    if (!researchItems || !publishedItems || publishedItems.items.length === 0) return null;

    // Estimate from avg time across all active stages
    const totalAvg = stages
      .filter((s) => s.stage !== "Published" && s.stage !== "Analyzing")
      .reduce((sum, s) => sum + s.avgTimeMs, 0);
    return totalAvg;
  }, [stages]);

  // Bottleneck: stage with longest avg time (excluding Published/Analyzing)
  const bottleneck = useMemo(() => {
    const activeStages = stages.filter(
      (s) => s.stage !== "Published" && s.stage !== "Analyzing" && s.items.length > 0
    );
    if (activeStages.length === 0) return null;
    return activeStages.reduce((max, s) => (s.avgTimeMs > max.avgTimeMs ? s : max));
  }, [stages]);

  // Published this week
  const publishedThisWeek = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const published = stages.find((s) => s.stage === "Published");
    return published?.items.filter((it) => it.createdAt > oneWeekAgo).length ?? 0;
  }, [stages]);

  const totalInPipeline = contentTasks.length;

  const handleSpeedUp = async (stage: StageData) => {
    const agentName = stage.stage === "Draft" ? "Ghost" : stage.stage === "Review" ? "Sentinel" : "Ghost";
    const action =
      stage.stage === "Draft"
        ? "Speed up drafting"
        : stage.stage === "Review"
        ? "Expedite content reviews"
        : `Unblock ${stage.stage} stage`;

    await triggerAgent(
      agentName,
      `${action}: ${stage.items.length} items stuck`,
      `The "${stage.stage}" stage is a bottleneck with ${stage.items.length} content pieces stuck for an average of ${msToHumanDays(stage.avgTimeMs)}. Items:\n${stage.items
        .map((it) => `- "${it.title}" (assigned to ${it.assignee})`)
        .join("\n")}\n\nPlease ${
        stage.stage === "Draft"
          ? "complete the drafts for these content pieces"
          : stage.stage === "Review"
          ? "review and approve/reject these content pieces"
          : "process these items to the next stage"
      }.`,
      ["niche:content", "speed-up", `stage:${stage.stage.toLowerCase()}`],
      { priority: "urgent" }
    );
  };

  const isLoading = tasks === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Flywheel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visual pipeline showing content moving through stages
          </p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Loading pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="w-6 h-6" style={{ color: config.accentColor }} />
            Content Flywheel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visual pipeline showing content moving through stages with velocity metrics
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total in Pipeline", value: String(totalInPipeline), icon: FileText },
          {
            label: "Avg Cycle Time",
            value: velocity ? msToHumanDays(velocity) : "--",
            icon: Clock,
          },
          { label: "Published This Week", value: String(publishedThisWeek), icon: CheckCircle2 },
          {
            label: "Bottleneck Stage",
            value: bottleneck?.stage ?? "None",
            icon: AlertTriangle,
            color: bottleneck ? "text-red-400" : undefined,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ background: `${config.accentColor}15` }}
                >
                  <Icon
                    className={`w-5 h-5 ${stat.color ?? ""}`}
                    style={stat.color ? undefined : { color: config.accentColor }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Flywheel Pipeline */}
      {contentTasks.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isBottleneck = bottleneck?.stage === stage.stage;

            return (
              <div key={stage.stage} className="flex items-start gap-3">
                {/* Stage card */}
                <div
                  className={`flex-shrink-0 w-56 rounded-xl border bg-card overflow-hidden ${
                    isBottleneck ? "ring-2 ring-red-400/50 border-red-400/30" : "border-border"
                  }`}
                >
                  {/* Stage header */}
                  <div
                    className="px-4 py-3 border-b border-border/50"
                    style={{ borderBottomColor: `${stage.color}30` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: stage.color }} />
                        <span className="text-sm font-semibold text-foreground">
                          {stage.stage}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `${stage.color}20`,
                          color: stage.color,
                        }}
                      >
                        {stage.items.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Avg: {stage.items.length > 0 ? msToHumanDays(stage.avgTimeMs) : "--"}
                    </p>
                    {isBottleneck && (
                      <div className="mt-2">
                        <button
                          onClick={() => handleSpeedUp(stage)}
                          disabled={agentLoading}
                          className="flex items-center gap-1 w-full px-2 py-1 rounded-lg text-[10px] font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 disabled:opacity-50 transition-colors"
                        >
                          {agentLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Zap className="w-3 h-3" />
                          )}
                          Speed Up
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content items */}
                  <div className="p-2 space-y-1.5 max-h-64 overflow-y-auto">
                    {stage.items.length > 0 ? (
                      stage.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
                        >
                          <p className="text-xs font-medium text-foreground truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {item.assignee}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <Inbox className="w-5 h-5 text-muted-foreground/20 mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground">Empty</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow between stages */}
                {idx < stages.length - 1 && (
                  <div className="flex items-center pt-12 shrink-0">
                    <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <RotateCcw className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Start Your Content Flywheel
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Create content tasks to see them flow through the pipeline. Content moves
            through Research, Draft, Review, Published, and Analyzing stages.
          </p>
        </div>
      )}

      {/* Velocity summary */}
      {contentTasks.length > 0 && velocity && (
        <div
          className="rounded-xl border px-5 py-4"
          style={{
            borderColor: `${config.accentColor}30`,
            background: `${config.accentColor}08`,
          }}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5" style={{ color: config.accentColor }} />
            <div>
              <p className="text-sm font-medium text-foreground">
                Content moves from Research to Published in avg{" "}
                <span style={{ color: config.accentColor }}>{msToHumanDays(velocity)}</span>
              </p>
              {bottleneck && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bottleneck: {bottleneck.stage} stage ({bottleneck.items.length} items, avg{" "}
                  {msToHumanDays(bottleneck.avgTimeMs)})
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
