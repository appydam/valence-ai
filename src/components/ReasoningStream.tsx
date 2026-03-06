import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { cn } from "@/lib/utils";
import { getRelativeTime } from "@/lib/time";
import {
  Brain,
  Wrench,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Flag,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useState } from "react";

const STEP_CONFIG: Record<
  string,
  { icon: typeof Brain; label: string; colorClass: string; bgClass: string }
> = {
  thinking: {
    icon: Brain,
    label: "Thinking",
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10 border-blue-500/20",
  },
  tool_call: {
    icon: Wrench,
    label: "Tool Call",
    colorClass: "text-amber-400",
    bgClass: "bg-amber-500/10 border-amber-500/20",
  },
  tool_result: {
    icon: CheckCircle,
    label: "Result",
    colorClass: "text-green-400",
    bgClass: "bg-green-500/10 border-green-500/20",
  },
  decision: {
    icon: Lightbulb,
    label: "Decision",
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10 border-purple-500/20",
  },
  handoff: {
    icon: ArrowRight,
    label: "Handoff",
    colorClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10 border-cyan-500/20",
  },
  error: {
    icon: AlertTriangle,
    label: "Error",
    colorClass: "text-red-400",
    bgClass: "bg-red-500/10 border-red-500/20",
  },
  checkpoint: {
    icon: Flag,
    label: "Checkpoint",
    colorClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
  },
};

interface ReasoningStreamProps {
  taskId: Id<"tasks">;
  compact?: boolean; // For inline/sidebar use
}

export function ReasoningStream({ taskId, compact = false }: ReasoningStreamProps) {
  const steps = useQuery(api.reasoning.getByTask, { taskId }) ?? [];
  const [expanded, setExpanded] = useState(true);

  if (steps.length === 0) {
    return (
      <div className={cn(
        "rounded-lg border border-border/50 p-4",
        compact ? "p-3" : "p-4"
      )}>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Brain className="w-4 h-4 animate-pulse" />
          <span>No reasoning steps yet — stream will appear when the agent starts working</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left group"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Agent Reasoning
        </span>
        <span className="text-xs text-muted-foreground">
          {steps.length} step{steps.length !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Timeline */}
      {expanded && (
        <div className={cn(
          "relative ml-2 pl-4 border-l-2 border-border/40 space-y-2 mt-2",
          compact ? "max-h-[300px] overflow-y-auto" : "max-h-[500px] overflow-y-auto"
        )}>
          {steps.map((step, i) => {
            const config = STEP_CONFIG[step.stepType] ?? STEP_CONFIG.thinking;
            const Icon = config.icon;
            const agentConfig = AGENT_CONFIG[step.agentName as AgentName];
            const isLast = i === steps.length - 1;

            return (
              <ReasoningStep
                key={step._id}
                step={step}
                config={config}
                Icon={Icon}
                agentConfig={agentConfig}
                isLast={isLast}
                compact={compact}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReasoningStep({
  step,
  config,
  Icon,
  agentConfig,
  isLast,
  compact,
}: {
  step: any;
  config: (typeof STEP_CONFIG)[string];
  Icon: typeof Brain;
  agentConfig: (typeof AGENT_CONFIG)[AgentName] | undefined;
  isLast: boolean;
  compact: boolean;
}) {
  const [showMeta, setShowMeta] = useState(false);
  const meta = step.metadata ? tryParseJSON(step.metadata) : null;

  return (
    <div className={cn(
      "relative group",
      isLast && "animate-in fade-in slide-in-from-bottom-1 duration-300"
    )}>
      {/* Timeline dot */}
      <div className={cn(
        "absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background",
        isLast ? "ring-2 ring-primary/30" : "",
        config.colorClass.replace("text-", "bg-")
      )} />

      <div className={cn(
        "rounded-lg border p-2.5 transition-colors",
        config.bgClass,
        compact ? "p-2" : "p-2.5"
      )}>
        {/* Step header */}
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("w-3.5 h-3.5 shrink-0", config.colorClass)} />
          <span className={cn("text-xs font-medium", config.colorClass)}>
            {config.label}
          </span>
          {agentConfig && (
            <span className="text-[10px] text-muted-foreground">
              {agentConfig.emoji} {step.agentName}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">
            {getRelativeTime(step.timestamp)}
          </span>
        </div>

        {/* Content */}
        <p className={cn(
          "text-sm text-foreground/90 leading-relaxed",
          compact ? "text-xs" : "text-sm"
        )}>
          {step.content}
        </p>

        {/* Metadata (expandable) */}
        {meta && (
          <div className="mt-1.5">
            <button
              onClick={() => setShowMeta(!showMeta)}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showMeta ? "Hide details" : "Show details"}
            </button>
            {showMeta && (
              <pre className="mt-1 text-[10px] text-muted-foreground bg-background/50 rounded p-2 overflow-x-auto">
                {typeof meta === "string" ? meta : JSON.stringify(meta, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function tryParseJSON(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
