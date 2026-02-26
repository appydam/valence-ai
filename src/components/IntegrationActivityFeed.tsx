import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getRelativeTime } from "@/lib/time";

interface IntegrationActivityFeedProps {
  userId?: string;
  limit?: number;
}

export function IntegrationActivityFeed({ userId, limit = 20 }: IntegrationActivityFeedProps) {
  const activities = useQuery(api.integrationActivity.list, {
    userId,
    limit,
  }) ?? [];

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-border px-4 py-8 text-center text-muted-foreground">
        <p className="text-xs">No executions yet — connect an integration and run an agent to see activity here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {activities.map((activity, index) => (
        <div
          key={activity._id}
          className={`flex items-center gap-3 px-4 py-2.5 ${index !== 0 ? "border-t border-border" : ""}`}
        >
          {/* Status dot */}
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            activity.status === "success" ? "bg-status-online" : "bg-destructive"
          }`} />

          {/* Tool name — mono */}
          <span className="text-xs font-mono text-foreground flex-1 min-w-0 truncate">
            {activity.toolName}
          </span>

          {/* Agent */}
          {activity.agentName && (
            <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
              {activity.agentName}
            </span>
          )}

          {/* Integration type */}
          <span className="text-xs text-muted-foreground shrink-0 hidden md:block">
            {activity.integrationType}
          </span>

          {/* Error (inline, compact) */}
          {activity.status === "error" && activity.errorMessage && (
            <span className="text-[11px] text-destructive shrink-0 truncate max-w-[160px] hidden lg:block">
              {activity.errorMessage}
            </span>
          )}

          {/* Timestamp */}
          <span className="text-xs text-muted-foreground/60 shrink-0 tabular-nums text-right w-20">
            {getRelativeTime(activity.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}
