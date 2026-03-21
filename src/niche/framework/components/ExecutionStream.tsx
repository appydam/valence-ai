import { useEffect, useRef, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useNiche } from "../NicheContext";
import { StreamCard, type StreamItem } from "./StreamCard";

interface ExecutionStreamProps {
  taskId: string;
  onRetry?: (text: string) => void;
}

export function ExecutionStream({ taskId, onRetry }: ExecutionStreamProps) {
  const { config } = useNiche();
  const bottomRef = useRef<HTMLDivElement>(null);

  const task = useQuery(api.tasks.getById, { id: taskId as any });
  const reasoning = useQuery(api.reasoning.getByTask, { taskId: taskId as any }) ?? [];
  const integrationLogs =
    useQuery(api.integrationActivity.listByTask, { taskId }) ?? [];

  const items: StreamItem[] = useMemo(() => {
    const merged: StreamItem[] = [];

    for (const step of reasoning) {
      let meta: any = {};
      if (step.metadata) {
        try { meta = JSON.parse(step.metadata); } catch { /* ignore */ }
      }
      merged.push({
        id: step._id ?? `r-${step.timestamp}`,
        timestamp: step.timestamp,
        type: step.stepType as StreamItem["type"],
        agentName: step.agentName,
        content: step.content,
        metadata: meta,
        toolName: meta.toolName,
        integrationName: meta.integrationName,
        status: meta.status,
        duration: meta.duration,
      });
    }

    for (const log of integrationLogs) {
      const isDuplicate = merged.some(
        (m) =>
          m.type === "api_call" &&
          Math.abs(m.timestamp - log.timestamp) < 2000 &&
          m.toolName === log.toolName
      );
      if (!isDuplicate) {
        merged.push({
          id: log._id ?? `i-${log.timestamp}`,
          timestamp: log.timestamp,
          type: "api_call",
          agentName: log.agentName,
          content: log.errorMessage || "",
          integrationName: log.integrationType,
          toolName: log.toolName,
          status: log.status === "success" ? "success" : log.status === "error" ? "error" : "calling",
        });
      }
    }

    if (task?.deliverables && task.deliverables.length > 0) {
      for (const d of task.deliverables) {
        merged.push({
          id: `d-${d.name}`,
          timestamp: task.updatedAt ?? task.createdAt,
          type: "deliverable",
          content: d.content,
          deliverableName: d.name,
          deliverableType: d.type,
        });
      }
    }

    merged.sort((a, b) => a.timestamp - b.timestamp);
    return merged;
  }, [reasoning, integrationLogs, task]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [items.length]);

  const isComplete = task?.status === "done";

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground/50">
          Waiting for AI agent to start
          <span className="inline-flex ml-1">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
          </span>
        </p>
        {task && (
          <p className="text-[10px] text-muted-foreground/30 mt-2">
            Task: {task.title} | Status: {task.status}
            {task.assignee ? ` | Assigned to ${task.assignee}` : ""}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isComplete ? "#22c55e" : config.accentColor,
              boxShadow: isComplete ? "0 0 6px #22c55e" : `0 0 6px ${config.accentColor}`,
            }}
          />
          <span className="text-xs font-medium text-foreground/80">
            {isComplete ? "Completed" : "Live Stream"}
          </span>
          <span className="text-[10px] text-muted-foreground/40">{items.length} steps</span>
        </div>
        {task?.assignee && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/30 text-muted-foreground/60">
            {task.assignee}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="relative">
          <div className="absolute left-[13px] top-0 bottom-0 w-[1px] bg-border/20" />
          <div className="space-y-3 relative">
            {items.map((item, idx) => (
              <StreamCard
                key={item.id}
                item={item}
                accentColor={config.accentColor}
                isLatest={idx === items.length - 1 && !isComplete}
                onRetry={onRetry}
              />
            ))}
          </div>
        </div>

        {isComplete && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 mt-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-500">Task Complete</p>
              <p className="text-[10px] text-green-500/60">
                {task.deliverables?.length
                  ? `${task.deliverables.length} deliverable${task.deliverables.length > 1 ? "s" : ""} ready`
                  : "All steps finished successfully"}
              </p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
