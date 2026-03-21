import { useNiche } from "../../framework/NicheContext";

interface LeadCardProps {
  name: string;
  company: string;
  role: string;
  score: number;
  status: "New" | "Contacted" | "Replied" | "Meeting";
  intentSignals: string[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  New: { bg: "bg-muted", text: "text-muted-foreground" },
  Contacted: { bg: "bg-blue-500/10", text: "text-blue-500" },
  Replied: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  Meeting: { bg: "bg-green-500/10", text: "text-green-500" },
};

export function LeadCard({ name, company, role, score, status, intentSignals }: LeadCardProps) {
  const { config } = useNiche();
  const statusStyle = STATUS_COLORS[status] ?? STATUS_COLORS.New;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
      {/* Avatar Placeholder */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold text-white shrink-0"
        style={{ background: config.accentColor }}
      >
        {name.split(" ").map((n) => n[0]).join("")}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: score >= 85 ? "hsl(142,71%,45%,0.1)" : score >= 70 ? "hsl(38,92%,50%,0.1)" : "hsl(0,0%,50%,0.1)",
              color: score >= 85 ? "hsl(142,71%,45%)" : score >= 70 ? "hsl(38,92%,50%)" : "hsl(0,0%,50%)",
            }}
          >
            {score}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {role} at {company}
        </p>
        {intentSignals.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {intentSignals.slice(0, 3).map((signal) => (
              <span
                key={signal}
                className="px-1.5 py-0.5 rounded text-[9px] bg-accent/50 text-muted-foreground"
              >
                {signal}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${statusStyle.bg} ${statusStyle.text}`}>
        {status}
      </span>
    </div>
  );
}
