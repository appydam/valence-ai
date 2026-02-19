import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
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
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No integration activity yet</p>
        <p className="text-xs mt-1">
          Connect an integration and have your agents use it to see activity here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div
          key={activity._id}
          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors"
        >
          {/* Status Icon */}
          <div className="shrink-0 mt-0.5">
            {activity.status === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>

          {/* Activity Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.toolName.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.agentName ? (
                    <>
                      <span className="font-medium">{activity.agentName}</span>
                      {" · "}
                    </>
                  ) : null}
                  {activity.integrationType}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {getRelativeTime(activity.timestamp)}
              </span>
            </div>

            {/* Error Message */}
            {activity.status === "error" && activity.errorMessage && (
              <p className="text-xs text-red-500 mt-1 line-clamp-1">
                {activity.errorMessage}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
