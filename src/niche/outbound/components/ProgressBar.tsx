import { useOutboundProgress } from "../hooks/useOutboundProgress";
import { Trophy } from "lucide-react";

export function ProgressBar() {
  const { totalXp, levelName, completionPct, stages } = useOutboundProgress();
  const completedCount = stages.filter((s) => s.completed).length;
  const activeCount = stages.filter((s) => s.active).length;

  if (totalXp === 0 && completedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-card/50 border-b border-border/20">
      <Trophy className="w-3.5 h-3.5 text-amber-400" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-amber-400">{levelName}</span>
          <span className="text-[10px] text-muted-foreground/40">·</span>
          <span className="text-[10px] text-muted-foreground/50">{totalXp} XP</span>
          <span className="text-[10px] text-muted-foreground/40">·</span>
          <span className="text-[10px] text-muted-foreground/50">{completedCount}/{stages.length} stages</span>
          {activeCount > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground/40">·</span>
              <span className="text-[10px] text-blue-400">{activeCount} active</span>
            </>
          )}
        </div>
        <div className="h-1 rounded-full bg-border/20 mt-1 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-green-500 transition-all duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
