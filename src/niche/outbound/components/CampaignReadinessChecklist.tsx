import { CheckCircle2, Circle } from "lucide-react";

interface ChecklistItem {
  label: string;
  ready: boolean;
  count?: number;
}

interface Props {
  items: ChecklistItem[];
}

export function CampaignReadinessChecklist({ items }: Props) {
  const readyCount = items.filter((i) => i.ready).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Campaign Readiness
        </span>
        <span className="text-xs text-muted-foreground">
          {readyCount}/{items.length}
        </span>
      </div>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
            item.ready
              ? "border-green-500/20 bg-green-500/5"
              : "border-border/20 bg-background/30"
          }`}
        >
          {item.ready ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground/20 shrink-0" />
          )}
          <span className={`text-sm flex-1 ${item.ready ? "text-foreground" : "text-muted-foreground/40"}`}>
            {item.label}
          </span>
          {item.count !== undefined && item.count > 0 && (
            <span className="text-[10px] font-bold text-green-500">{item.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}
