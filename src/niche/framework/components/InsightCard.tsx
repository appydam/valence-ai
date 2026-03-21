import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface InsightCardProps {
  icon: LucideIcon;
  color: string;
  bg: string;
  text: string;
  action: string;
  onClick: () => void;
}

export function InsightCard({ icon: Icon, color, bg, text, action, onClick }: InsightCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border/30 bg-card hover:border-border/50 hover:bg-accent/10 transition-all group text-left"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: bg }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground/80 leading-snug">{text}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-0.5">{action}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-foreground/40 transition-colors shrink-0" />
    </button>
  );
}
