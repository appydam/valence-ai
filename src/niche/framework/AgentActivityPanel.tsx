import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Brain,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  X,
  Loader2,
  Lightbulb,
  ArrowRightLeft,
} from "lucide-react";
import { useNiche } from "./NicheContext";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<string, { icon: typeof Brain; color: string }> = {
  thinking: { icon: Brain, color: "text-blue-400" },
  tool_call: { icon: Wrench, color: "text-yellow-500" },
  tool_result: { icon: CheckCircle2, color: "text-green-500" },
  decision: { icon: Lightbulb, color: "text-purple-400" },
  handoff: { icon: ArrowRightLeft, color: "text-cyan-400" },
  error: { icon: AlertCircle, color: "text-red-400" },
  checkpoint: { icon: CheckCircle2, color: "text-emerald-400" },
};

interface AgentActivityPanelProps {
  taskId?: string;
  agentName?: string;
  onClose?: () => void;
}

export function AgentActivityPanel({ taskId, agentName, onClose }: AgentActivityPanelProps) {
  const { config } = useNiche();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Query reasoning steps — reactive (auto-updates in real-time)
  const steps = useQuery(
    taskId ? api.reasoning.getByTask : api.reasoning.getLatest,
    taskId ? { taskId } : {}
  );

  const toggleExpand = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (!steps) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: config.accentColor }} />
          <span className="text-sm font-semibold text-foreground">Agent Activity</span>
          {steps.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/50 text-muted-foreground">
              {steps.length}
            </span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {steps.length === 0 ? (
          <div className="p-6 text-center">
            <Brain className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No agent activity yet. Trigger an AI action to see live reasoning.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {steps.map((step: any, idx: number) => {
              const stepConfig = STEP_ICONS[step.stepType] ?? STEP_ICONS.thinking;
              const Icon = stepConfig.icon;
              const isExpanded = expanded.has(idx);
              const content = step.content ?? "";
              const isLong = content.length > 120;

              return (
                <div
                  key={step._id || idx}
                  className="px-4 py-2.5 hover:bg-accent/10 transition-colors"
                >
                  <div
                    className="flex items-start gap-2 cursor-pointer"
                    onClick={() => isLong && toggleExpand(idx)}
                  >
                    <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", stepConfig.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {step.stepType.replace("_", " ")}
                        </span>
                        {step.agentName && (
                          <span className="text-[10px] text-muted-foreground/60">
                            {step.agentName}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/40 ml-auto">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-xs text-foreground/80 mt-0.5",
                          !isExpanded && isLong ? "line-clamp-2" : ""
                        )}
                      >
                        {content}
                      </p>
                    </div>
                    {isLong && (
                      <button className="text-muted-foreground/40 mt-0.5 shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
