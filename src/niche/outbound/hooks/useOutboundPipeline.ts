import { useMemo } from "react";
import { useUserTasks } from "@/hooks/useUserScoped";

export interface PipelineStage {
  key: string;
  label: string;
  count: number;
  color: string;
  bgColor: string;
  isActive: boolean;
}

export function useOutboundPipeline() {
  const tasks = useUserTasks();
  const outboundTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) => t.tags?.includes("niche:outbound")
  );

  const stages = useMemo<PipelineStage[]>(() => {
    const activeTags = new Set<string>();
    const tagCounts: Record<string, number> = {};

    for (const task of outboundTasks) {
      const tags = (task as { tags?: string[]; status: string }).tags ?? [];
      const status = (task as { status: string }).status;
      for (const tag of tags) {
        if (tag.startsWith("stage:")) {
          const key = tag.replace("stage:", "");
          tagCounts[key] = (tagCounts[key] || 0) + 1;
          if (status === "in_progress" || status === "assigned") {
            activeTags.add(key);
          }
        }
      }
    }

    return [
      { key: "companies", label: "Companies", count: tagCounts["companies"] ?? 0, color: "#3b82f6", bgColor: "rgba(59,130,246,0.15)", isActive: activeTags.has("companies") },
      { key: "contacts", label: "Contacts", count: tagCounts["contacts"] ?? 0, color: "#a855f7", bgColor: "rgba(168,85,247,0.15)", isActive: activeTags.has("contacts") },
      { key: "enriched", label: "Enriched", count: tagCounts["enriched"] ?? 0, color: "#f59e0b", bgColor: "rgba(245,158,11,0.15)", isActive: activeTags.has("enriched") },
      { key: "crm", label: "In CRM", count: tagCounts["crm"] ?? 0, color: "#f97316", bgColor: "rgba(249,115,22,0.15)", isActive: activeTags.has("crm") },
      { key: "sequences", label: "Sequenced", count: tagCounts["sequences"] ?? 0, color: "#22c55e", bgColor: "rgba(34,197,94,0.15)", isActive: activeTags.has("sequences") },
    ];
  }, [outboundTasks]);

  const totalTasks = outboundTasks.length;
  const completedTasks = outboundTasks.filter((t: { status: string }) => t.status === "done").length;
  const activeTasks = outboundTasks.filter((t: { status: string }) => t.status === "in_progress" || t.status === "assigned").length;

  return { stages, totalTasks, completedTasks, activeTasks, outboundTasks };
}
