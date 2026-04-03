import { useUserTasks } from "@/hooks/useUserScoped";

export interface SequenceStats {
  totalSequenceTasks: number;
  emailTasks: number;
  linkedinTasks: number;
  completedSequences: number;
  activeSequences: number;
}

export function useSequenceStats(): SequenceStats {
  const tasks = useUserTasks();
  const seqTasks = (tasks ?? []).filter(
    (t: { tags?: string[] }) =>
      t.tags?.includes("niche:outbound") && t.tags?.includes("stage:sequences")
  );

  const emailTasks = seqTasks.filter((t: { tags?: string[] }) =>
    t.tags?.includes("channel:email")
  ).length;

  const linkedinTasks = seqTasks.filter((t: { tags?: string[] }) =>
    t.tags?.includes("channel:linkedin")
  ).length;

  const completedSequences = seqTasks.filter((t: { status: string }) => t.status === "done").length;
  const activeSequences = seqTasks.filter((t: { status: string }) =>
    t.status === "in_progress" || t.status === "assigned"
  ).length;

  return {
    totalSequenceTasks: seqTasks.length,
    emailTasks,
    linkedinTasks,
    completedSequences,
    activeSequences,
  };
}
