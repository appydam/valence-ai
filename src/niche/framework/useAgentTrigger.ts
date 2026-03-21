import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface TriggerResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

/**
 * Hook for triggering agent work from niche UIs.
 * Creates a task assigned to a specific agent — the sweep cron auto-wakes the agent.
 *
 * Usage:
 *   const { triggerAgent, loading } = useAgentTrigger();
 *   const result = await triggerAgent("Ghost", "Write ad copy for campaign", "...", ["niche:ads"]);
 */
export function useAgentTrigger() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = useMutation(api.tasks.create);
  const currentUser = useQuery(api.users.getCurrentUser);

  const triggerAgent = useCallback(
    async (
      agentName: "Kaze" | "Scout" | "Forge" | "Ghost" | "Sentinel",
      title: string,
      description: string,
      tags: string[] = [],
      options?: {
        priority?: "low" | "medium" | "high" | "urgent";
        requiredIntegrations?: string[];
      }
    ): Promise<TriggerResult> => {
      if (!currentUser) {
        return { success: false, error: "User not authenticated" };
      }

      setLoading(true);
      setError(null);

      try {
        const result = await createTask({
          title,
          description,
          priority: options?.priority ?? "high",
          assignee: agentName,
          creator: "Human",
          tags,
          ...(options?.requiredIntegrations
            ? {
                requiredIntegrations: options.requiredIntegrations,
                requiredUserId: currentUser.clerkId,
              }
            : {}),
        });

        // tasks.create returns { taskId, missionId } — extract taskId
        const taskId = typeof result === "object" && result !== null && "taskId" in result
          ? (result as { taskId: string }).taskId
          : (result as string);

        setLoading(false);
        return { success: true, taskId };
      } catch (err: any) {
        const errMsg = err.message || "Failed to trigger agent";
        setError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }
    },
    [createTask, currentUser]
  );

  return {
    triggerAgent,
    loading,
    error,
    isReady: currentUser !== undefined,
  };
}
