import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Zap, AlertTriangle } from "lucide-react";
import { getRelativeTime } from "@/lib/time";

interface MonitorEvent {
  _id: string;
  monitorId: string;
  eventType: "check_ok" | "triggered" | "error" | "action_failed";
  responseSnapshot?: string;
  conditionResults?: string;
  actionResult?: string;
  errorMessage?: string;
  timestamp: number;
  monitorName?: string;
  blueprintSlug?: string;
}

interface MonitorEventListProps {
  events: MonitorEvent[];
  showMonitorName?: boolean;
}

const EVENT_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  check_ok: { icon: CheckCircle2, label: "OK", color: "text-green-500" },
  triggered: { icon: Zap, label: "Triggered", color: "text-orange-400" },
  error: { icon: XCircle, label: "Error", color: "text-red-500" },
  action_failed: { icon: AlertTriangle, label: "Action Failed", color: "text-yellow-500" },
};

export function MonitorEventList({ events, showMonitorName = false }: MonitorEventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        No events yet. Monitors will log events once they start checking.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {events.map((event) => {
        const config = EVENT_CONFIG[event.eventType] || EVENT_CONFIG.check_ok;
        const Icon = config.icon;

        return (
          <div
            key={event._id}
            className="flex items-center gap-3 py-2 px-3 rounded hover:bg-muted/50 text-sm"
          >
            <Icon className={`w-4 h-4 shrink-0 ${config.color}`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {showMonitorName && event.monitorName && (
                  <span className="font-medium text-xs">{event.monitorName}</span>
                )}
                <Badge variant="outline" className="text-xs">
                  {config.label}
                </Badge>
                {event.errorMessage && (
                  <span className="text-xs text-red-400 truncate max-w-[200px]">
                    {event.errorMessage}
                  </span>
                )}
                {event.eventType === "triggered" && event.conditionResults && (
                  <ConditionSummary results={event.conditionResults} />
                )}
              </div>
            </div>

            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {getRelativeTime(event.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ConditionSummary({ results }: { results: string }) {
  try {
    const parsed = JSON.parse(results);
    const matched = parsed.filter((r: any) => r.passed);
    if (matched.length === 0) return null;

    const summary = matched
      .map((r: any) => `${r.field}: ${r.actual}`)
      .join(", ");

    return (
      <span className="text-xs text-muted-foreground truncate max-w-[300px]">
        {summary}
      </span>
    );
  } catch {
    return null;
  }
}
