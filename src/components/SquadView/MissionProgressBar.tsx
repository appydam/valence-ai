import { motion } from "framer-motion";
import { TaskStatus } from "@/types/mission";

interface Task {
  _id: string;
  status: TaskStatus;
  title: string;
}

interface MissionProgressBarProps {
  tasks: Task[];
  missionTitle?: string;
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  done: "hsl(160 84% 39%)",
  in_progress: "hsl(217 91% 60%)",
  in_review: "hsl(38 92% 50%)",
  assigned: "hsl(220 9% 46%)",
  inbox: "hsl(240 20% 22%)",
  cancelled: "hsl(0 84% 60%)",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  done: "Done",
  in_progress: "Active",
  in_review: "Review",
  assigned: "Assigned",
  inbox: "Inbox",
  cancelled: "Cancelled",
};

const STATUS_ORDER: TaskStatus[] = ["done", "in_progress", "in_review", "assigned", "inbox", "cancelled"];

export function MissionProgressBar({ tasks, missionTitle }: MissionProgressBarProps) {
  if (tasks.length === 0) return null;

  const counts = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  const done = counts["done"] ?? 0;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Build segments excluding zeros
  const segments = STATUS_ORDER
    .filter((s) => (counts[s] ?? 0) > 0)
    .map((s) => ({ status: s, count: counts[s]!, pct: ((counts[s]!) / total) * 100 }));

  return (
    <div className="px-6 py-3 border-b border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Mission
          </span>
          {missionTitle && (
            <span className="text-xs font-medium text-foreground truncate max-w-[300px]">
              {missionTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Status legend */}
          {segments.map(({ status, count }) => (
            <div key={status} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[status] }}
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                {count} {STATUS_LABEL[status]}
              </span>
            </div>
          ))}
          <span
            className="text-xs font-bold font-mono ml-2"
            style={{ color: "hsl(160 84% 39%)" }}
          >
            {pct}%
          </span>
        </div>
      </div>

      {/* Segmented progress bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px bg-border/30">
        {segments.map(({ status, pct: segPct }, i) => (
          <motion.div
            key={status}
            className="h-full rounded-sm relative overflow-hidden"
            style={{ width: `${segPct}%`, backgroundColor: STATUS_COLOR[status] }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
          >
            {/* Shimmer on in_progress */}
            {status === "in_progress" && (
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                  animation: "shimmer 2s infinite",
                  backgroundSize: "200% 100%",
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
