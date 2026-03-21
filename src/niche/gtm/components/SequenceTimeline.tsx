interface TimelineStep {
  id: string;
  day: number;
  subject: string;
  status: "drafted" | "approved" | "sent" | "opened" | "replied";
}

interface SequenceTimelineProps {
  steps: TimelineStep[];
  selectedId: string;
  onSelect: (id: string) => void;
  accentColor: string;
}

const STATUS_CONFIG: Record<string, { label: string; dotColor: string; textColor: string }> = {
  drafted: { label: "Drafted", dotColor: "bg-muted-foreground/30", textColor: "text-muted-foreground" },
  approved: { label: "Approved", dotColor: "bg-blue-500", textColor: "text-blue-500" },
  sent: { label: "Sent", dotColor: "bg-yellow-500", textColor: "text-yellow-500" },
  opened: { label: "Opened", dotColor: "bg-orange-500", textColor: "text-orange-500" },
  replied: { label: "Replied", dotColor: "bg-green-500", textColor: "text-green-500" },
};

export function SequenceTimeline({ steps, selectedId, onSelect, accentColor }: SequenceTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-[11px] top-4 bottom-4 w-px bg-border" />

      <div className="space-y-1">
        {steps.map((step, idx) => {
          const isSelected = step.id === selectedId;
          const statusCfg = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.drafted;

          return (
            <button
              key={step.id}
              onClick={() => onSelect(step.id)}
              className={`relative flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                isSelected
                  ? "bg-accent/30"
                  : "hover:bg-accent/15"
              }`}
              style={isSelected ? { outline: `1px solid ${accentColor}30` } : undefined}
            >
              {/* Dot */}
              <div className="relative z-10 mt-1">
                <div
                  className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-transparent" : "border-border bg-card"
                  }`}
                  style={isSelected ? { background: accentColor, borderColor: accentColor } : undefined}
                >
                  <span className={`text-[9px] font-bold ${isSelected ? "text-white" : "text-muted-foreground"}`}>
                    {idx + 1}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Day {step.day}
                  </span>
                  <span className={`text-[10px] font-medium ${statusCfg.textColor}`}>
                    {statusCfg.label}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground truncate mt-0.5">
                  {step.subject}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
