import { useState } from "react";
import { AGENT_CONFIG, AgentName } from "@/types/mission";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Plus,
  Trash2,
  Clock,
  ChevronDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

interface PlanTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee: "Kaze" | "Scout" | "Forge" | "Ghost";
  tags: string[];
  dependsOnIndex: number[];
  requiredIntegrations: string[];
  estimatedMinutes: number;
}

export interface DecomposedPlan {
  missionTitle: string;
  missionDescription: string;
  estimatedDuration: string;
  tasks: PlanTask[];
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const PRIORITY_CYCLE: ("low" | "medium" | "high" | "urgent")[] = ["low", "medium", "high", "urgent"];
const AGENTS: ("Kaze" | "Scout" | "Forge" | "Ghost")[] = ["Kaze", "Scout", "Forge", "Ghost"];

// ── Component ─────────────────────────────────────────────────

export function AutopilotPlanEditor({
  plan,
  onChange,
}: {
  plan: DecomposedPlan;
  onChange: (plan: DecomposedPlan) => void;
}) {
  // Topological sort into phases (same logic as MissionPlanView in Board.tsx)
  const depthMap = new Map<number, number>();

  function getDepth(idx: number, visited = new Set<number>()): number {
    if (depthMap.has(idx)) return depthMap.get(idx)!;
    if (visited.has(idx)) return 0;
    visited.add(idx);
    const task = plan.tasks[idx];
    if (!task.dependsOnIndex || task.dependsOnIndex.length === 0) {
      depthMap.set(idx, 0);
      return 0;
    }
    const maxParentDepth = Math.max(
      ...task.dependsOnIndex.map((depIdx) => getDepth(depIdx, new Set(visited)))
    );
    const depth = maxParentDepth + 1;
    depthMap.set(idx, depth);
    return depth;
  }

  plan.tasks.forEach((_, i) => getDepth(i));
  const maxDepth = plan.tasks.length > 0 ? Math.max(...Array.from(depthMap.values()), 0) : 0;
  const phases: { idx: number; task: PlanTask }[][] = Array.from(
    { length: maxDepth + 1 },
    () => []
  );
  plan.tasks.forEach((task, idx) => {
    const d = depthMap.get(idx) ?? 0;
    phases[d].push({ idx, task });
  });

  const updateTask = (idx: number, updates: Partial<PlanTask>) => {
    const newTasks = [...plan.tasks];
    newTasks[idx] = { ...newTasks[idx], ...updates };
    onChange({ ...plan, tasks: newTasks });
  };

  const removeTask = (idx: number) => {
    const newTasks = plan.tasks.filter((_, i) => i !== idx);
    // Fix dependency indices
    for (const task of newTasks) {
      task.dependsOnIndex = task.dependsOnIndex
        .filter((depIdx) => depIdx !== idx)
        .map((depIdx) => (depIdx > idx ? depIdx - 1 : depIdx));
    }
    onChange({ ...plan, tasks: newTasks });
  };

  const addTask = (afterPhase: number) => {
    // Find indices of tasks in this phase to add dependency
    const phaseTaskIndices = phases[afterPhase]?.map((p) => p.idx) ?? [];
    const newTask: PlanTask = {
      title: "New task",
      description: "",
      priority: "medium",
      assignee: "Kaze",
      tags: [],
      dependsOnIndex: phaseTaskIndices,
      requiredIntegrations: [],
      estimatedMinutes: 30,
    };
    onChange({ ...plan, tasks: [...plan.tasks, newTask] });
  };

  const cyclePriority = (idx: number) => {
    const current = plan.tasks[idx].priority;
    const nextIdx = (PRIORITY_CYCLE.indexOf(current) + 1) % PRIORITY_CYCLE.length;
    updateTask(idx, { priority: PRIORITY_CYCLE[nextIdx] });
  };

  // Summary stats
  const totalMinutes = plan.tasks.reduce((s, t) => s + t.estimatedMinutes, 0);
  const agentWorkload: Record<string, number> = {};
  for (const task of plan.tasks) {
    agentWorkload[task.assignee] = (agentWorkload[task.assignee] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      {/* Mission header (editable) */}
      <div className="space-y-2">
        <input
          value={plan.missionTitle}
          onChange={(e) => onChange({ ...plan, missionTitle: e.target.value })}
          className="w-full bg-transparent text-xl font-bold text-foreground border-none outline-none focus:ring-0 placeholder:text-muted-foreground"
          placeholder="Mission title"
        />
        <textarea
          value={plan.missionDescription}
          onChange={(e) => onChange({ ...plan, missionDescription: e.target.value })}
          className="w-full bg-transparent text-sm text-muted-foreground border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground"
          placeholder="Mission description"
          rows={2}
        />
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {plan.estimatedDuration || `~${Math.round(totalMinutes / 60)} hours`}
        </span>
        <span>{plan.tasks.length} tasks</span>
        <span>{phases.length} phases</span>
        <div className="flex items-center gap-2 ml-auto">
          {Object.entries(agentWorkload).map(([agent, count]) => {
            const config = AGENT_CONFIG[agent as AgentName];
            return (
              <span key={agent} className="flex items-center gap-1">
                {config?.emoji} {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Phase-grouped task cards */}
      {phases.map((phaseTasks, phaseIdx) => (
        <div key={phaseIdx}>
          {/* Phase header */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {phaseIdx === 0 ? "Phase 1 — No dependencies" : `Phase ${phaseIdx + 1}`}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {phaseTasks.length}
            </span>
            {phaseIdx < phases.length - 1 && (
              <div className="flex-1 border-t border-dashed border-border" />
            )}
            {phaseIdx < phases.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            )}
          </div>

          {/* Task cards */}
          <div className="space-y-2 pl-2">
            {phaseTasks.map(({ idx, task }) => (
              <div
                key={idx}
                className="group border border-border rounded-lg p-3 bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Agent selector */}
                  <div className="relative">
                    <select
                      value={task.assignee}
                      onChange={(e) =>
                        updateTask(idx, { assignee: e.target.value as any })
                      }
                      className="appearance-none bg-accent/50 text-sm rounded-md px-2 py-1.5 pr-6 border border-border cursor-pointer focus:outline-none focus:border-primary"
                    >
                      {AGENTS.map((a) => (
                        <option key={a} value={a}>
                          {AGENT_CONFIG[a].emoji} {a}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>

                  {/* Task content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      value={task.title}
                      onChange={(e) => updateTask(idx, { title: e.target.value })}
                      className="w-full bg-transparent text-sm font-medium text-foreground border-none outline-none focus:ring-0"
                      placeholder="Task title"
                    />
                    <textarea
                      value={task.description}
                      onChange={(e) => updateTask(idx, { description: e.target.value })}
                      className="w-full bg-transparent text-xs text-muted-foreground border-none outline-none focus:ring-0 resize-none"
                      placeholder="Task description..."
                      rows={2}
                    />
                  </div>

                  {/* Right controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Priority badge */}
                    <button
                      onClick={() => cyclePriority(idx)}
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border cursor-pointer",
                        PRIORITY_COLORS[task.priority]
                      )}
                    >
                      {task.priority}
                    </button>

                    {/* Time estimate */}
                    <span className="text-[10px] text-muted-foreground">
                      ~{task.estimatedMinutes}m
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => removeTask(idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dependencies indicator */}
                {task.dependsOnIndex.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <ArrowRight className="w-3 h-3 rotate-180" />
                    depends on:{" "}
                    {task.dependsOnIndex.map((depIdx) => (
                      <span key={depIdx} className="px-1 py-0.5 bg-secondary rounded text-[10px]">
                        #{depIdx + 1} {plan.tasks[depIdx]?.title?.slice(0, 20)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add task button */}
          <button
            onClick={() => addTask(phaseIdx)}
            className="mt-2 ml-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add task after Phase {phaseIdx + 1}
          </button>
        </div>
      ))}

      {/* Add first task if empty */}
      {plan.tasks.length === 0 && (
        <button
          onClick={() => addTask(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg p-4 w-full justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add first task
        </button>
      )}
    </div>
  );
}
