interface Props {
  total: number;
  enriched: number;
  color: string;
}

export function EnrichmentStatusBar({ total, enriched, color }: Props) {
  const pct = total > 0 ? Math.round((enriched / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {enriched} / {total} contacts enriched
        </span>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-border/20 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
