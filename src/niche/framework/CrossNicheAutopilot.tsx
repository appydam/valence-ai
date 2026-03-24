import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Rocket,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Megaphone,
  Target,
  PenTool,
  CheckCircle2,
  Zap,
  X,
} from "lucide-react";
import { useNiche } from "./NicheContext";
import { useAgentTrigger } from "./useAgentTrigger";
import { useUserTasks } from "@/hooks/useUserScoped";

type WizardStep = 1 | 2 | 3 | 4;

interface WorkstreamTask {
  id: string;
  niche: "ads" | "gtm" | "content";
  title: string;
  description: string;
  agent: "Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel";
  dependsOn?: string[];
}

interface Workstream {
  niche: "ads" | "gtm" | "content";
  label: string;
  icon: typeof Megaphone;
  color: string;
  tasks: WorkstreamTask[];
}

const NICHE_META: Record<string, { label: string; icon: typeof Megaphone; color: string }> = {
  ads: { label: "Ads", icon: Megaphone, color: "hsl(262, 83%, 58%)" },
  gtm: { label: "GTM", icon: Target, color: "hsl(160, 84%, 39%)" },
  content: { label: "Content", icon: PenTool, color: "hsl(38, 92%, 50%)" },
};

function parseWorkstreamsFromDeliverable(deliverable: string): Workstream[] {
  const workstreams: Workstream[] = [];

  try {
    const parsed = JSON.parse(deliverable);
    const tracks = parsed.workstreams ?? parsed.tracks ?? parsed;

    if (typeof tracks === "object" && !Array.isArray(tracks)) {
      for (const [nicheId, tasks] of Object.entries(tracks)) {
        const meta = NICHE_META[nicheId];
        if (!meta || !Array.isArray(tasks)) continue;

        workstreams.push({
          niche: nicheId as "ads" | "gtm" | "content",
          label: meta.label,
          icon: meta.icon,
          color: meta.color,
          tasks: (tasks as any[]).map((t, idx) => ({
            id: `${nicheId}-${idx}`,
            niche: nicheId as "ads" | "gtm" | "content",
            title: t.title ?? t.name ?? `Task ${idx + 1}`,
            description: t.description ?? "",
            agent: t.agent ?? "Kaze",
            dependsOn: t.dependsOn ?? t.depends_on,
          })),
        });
      }
    }
  } catch {
    // If JSON parsing fails, create a default structure
  }

  // Ensure all 3 niches are present even if empty
  for (const nicheId of ["ads", "gtm", "content"] as const) {
    if (!workstreams.find((w) => w.niche === nicheId)) {
      const meta = NICHE_META[nicheId];
      workstreams.push({
        niche: nicheId,
        label: meta.label,
        icon: meta.icon,
        color: meta.color,
        tasks: [],
      });
    }
  }

  return workstreams.sort((a, b) => {
    const order = ["gtm", "content", "ads"];
    return order.indexOf(a.niche) - order.indexOf(b.niche);
  });
}

interface CrossNicheAutopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrossNicheAutopilot({ isOpen, onClose }: CrossNicheAutopilotProps) {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [step, setStep] = useState<WizardStep>(1);
  const [goal, setGoal] = useState("");
  const [planningTaskId, setPlanningTaskId] = useState<string | null>(null);
  const [workstreams, setWorkstreams] = useState<Workstream[]>([]);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);

  // Watch the planning task for completion
  const tasks = useUserTasks();
  const planningTask = useMemo(
    () =>
      planningTaskId
        ? (tasks ?? []).find((t: any) => t._id === planningTaskId)
        : null,
    [tasks, planningTaskId]
  );

  // When planning task is done, parse workstreams
  const planDeliverable = (planningTask as any)?.deliverable;
  const planStatus = (planningTask as any)?.status;

  // Parse workstreams from the deliverable when it arrives
  useMemo(() => {
    if (planStatus === "done" && planDeliverable && workstreams.length === 0) {
      const parsed = parseWorkstreamsFromDeliverable(planDeliverable);
      if (parsed.some((w) => w.tasks.length > 0)) {
        setWorkstreams(parsed);
        setStep(3);
      }
    }
  }, [planStatus, planDeliverable]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlan = async () => {
    if (!goal.trim()) return;
    const result = await triggerAgent(
      "Kaze",
      `Cross-niche autopilot: ${goal.slice(0, 80)}`,
      `Decompose this goal into a cross-niche execution plan spanning Ads, GTM, and Content.\n\nGoal: ${goal}\n\nReturn a JSON object with this structure:\n{\n  "workstreams": {\n    "gtm": [{ "title": "...", "description": "...", "agent": "Scout|Ghost|Forge|Sentinel", "dependsOn": [] }],\n    "content": [{ "title": "...", "description": "...", "agent": "Ghost|Forge", "dependsOn": [] }],\n    "ads": [{ "title": "...", "description": "...", "agent": "Ghost|Forge", "dependsOn": [] }]\n  }\n}\n\nCreate 3-5 tasks per niche. Use appropriate agents: Scout for research, Ghost for content/copy, Forge for building/technical tasks, Sentinel for quality/review.`,
      ["cross-niche", "autopilot-planning"],
      { priority: "urgent" }
    );
    if (result.success && result.taskId) {
      setPlanningTaskId(result.taskId);
      setStep(2);
    }
  };

  const handleLaunchAll = async () => {
    setLaunching(true);
    for (const ws of workstreams) {
      for (const task of ws.tasks) {
        await triggerAgent(
          task.agent,
          task.title,
          task.description,
          [`niche:${task.niche}`, "autopilot", "cross-niche"],
          { priority: "high" }
        );
      }
    }
    setLaunching(false);
    setLaunched(true);
    setStep(4);
  };

  const handleRemoveTask = (nicheId: string, taskId: string) => {
    setWorkstreams((prev) =>
      prev.map((ws) =>
        ws.niche === nicheId
          ? { ...ws, tasks: ws.tasks.filter((t) => t.id !== taskId) }
          : ws
      )
    );
  };

  const handleReset = () => {
    setStep(1);
    setGoal("");
    setPlanningTaskId(null);
    setWorkstreams([]);
    setLaunching(false);
    setLaunched(false);
  };

  const totalTasks = workstreams.reduce((sum, ws) => sum + ws.tasks.length, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5" style={{ color: config.accentColor }} />
            <div>
              <h2 className="text-lg font-bold text-foreground">Cross-Niche Autopilot</h2>
              <p className="text-xs text-muted-foreground">
                Create missions spanning Ads, GTM, and Content
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border/50">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s ? "text-white" : "text-muted-foreground border border-border"
                }`}
                style={step >= s ? { background: config.accentColor } : undefined}
              >
                {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
              </span>
              <span className={`text-xs ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                {s === 1 ? "Goal" : s === 2 ? "Planning" : s === 3 ? "Review" : "Launch"}
              </span>
              {s < 4 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground/30 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Goal input */}
          {step === 1 && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center">
                <Rocket className="w-10 h-10 mx-auto mb-3" style={{ color: config.accentColor }} />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  What do you want to achieve?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Describe your goal and AI will decompose it into cross-niche workstreams
                </p>
              </div>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder='e.g. "Get 50 customers in 60 days" or "Launch product on ProductHunt and get 1000 signups"'
                className="w-full h-32 p-4 rounded-xl border border-border bg-accent/10 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2"
                style={{ focusRingColor: config.accentColor } as any}
              />
              <div className="flex justify-end">
                <button
                  onClick={handlePlan}
                  disabled={!goal.trim() || agentLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: config.accentColor }}
                >
                  {agentLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Decompose with AI
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: AI is planning */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: config.accentColor }} />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                AI is decomposing your goal...
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Kaze is analyzing your goal and creating cross-niche workstreams for Ads, GTM, and Content.
                This may take a minute.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-4">
                Task ID: {planningTaskId?.slice(0, 12)}...
              </p>
            </div>
          )}

          {/* Step 3: Review tasks */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Review Cross-Niche Plan
                </h3>
                <p className="text-sm text-muted-foreground">
                  {totalTasks} tasks across 3 niches. Remove any you don't need.
                </p>
              </div>

              {/* 3-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {workstreams.map((ws) => {
                  const Icon = ws.icon;
                  return (
                    <div
                      key={ws.niche}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      <div
                        className="px-4 py-3 border-b"
                        style={{ borderBottomColor: `${ws.color}30` }}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: ws.color }} />
                          <span className="text-sm font-semibold text-foreground">
                            {ws.label}
                          </span>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-auto"
                            style={{ background: `${ws.color}20`, color: ws.color }}
                          >
                            {ws.tasks.length}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
                        {ws.tasks.length > 0 ? (
                          ws.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="p-3 rounded-lg bg-accent/20 group relative"
                            >
                              <button
                                onClick={() => handleRemoveTask(ws.niche, task.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <p className="text-xs font-medium text-foreground pr-4">
                                {task.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/40 text-muted-foreground">
                                  {task.agent}
                                </span>
                                {task.dependsOn && task.dependsOn.length > 0 && (
                                  <span className="text-[10px] text-muted-foreground/60">
                                    Depends on {task.dependsOn.length} task(s)
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            No tasks for this niche
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Launched */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Mission Launched!</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {totalTasks} tasks have been created across Ads, GTM, and Content. Your AI agents
                are now working on them.
              </p>
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="mt-6 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: config.accentColor }}
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 3) && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Start Over
            </button>
            <button
              onClick={handleLaunchAll}
              disabled={launching || totalTasks === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{ background: config.accentColor }}
            >
              {launching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              Launch All ({totalTasks} tasks)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
