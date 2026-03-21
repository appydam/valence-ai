import { useState, useCallback, useMemo } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface ExecuteResult {
  success: boolean;
  result?: any;
  error?: string;
  details?: string;
}

/**
 * Hook for executing integration API calls from niche UIs.
 * Wraps convex executionEngine.executeTool with connection status checking.
 *
 * Usage:
 *   const { execute, isConnected, loading } = useIntegrationCall();
 *   const data = await execute("google-ads", "search_campaigns", { query: "..." });
 */
export function useIntegrationCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTool = useAction(api.executionEngine.executeTool);
  const connections = useQuery(api.connections.listAll);
  const blueprints = useQuery(api.blueprints.list, {});
  const currentUser = useQuery(api.users.getCurrentUser);

  // Build a map of blueprintId -> slug from blueprints
  const blueprintIdToSlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const bp of blueprints ?? []) {
      map.set(bp._id, bp.slug);
    }
    return map;
  }, [blueprints]);

  // Build set of connected blueprint slugs by joining connections with blueprints
  const connectedSlugs = useMemo(() => {
    const slugs = new Set<string>();
    for (const c of connections ?? []) {
      if (c.status === "active") {
        const slug = (c as any).blueprintSlug || blueprintIdToSlug.get(c.blueprintId);
        if (slug) slugs.add(slug);
      }
    }
    return slugs;
  }, [connections, blueprintIdToSlug]);

  const isConnected = useCallback(
    (blueprintSlug: string) => connectedSlugs.has(blueprintSlug),
    [connectedSlugs]
  );

  const execute = useCallback(
    async (
      blueprintSlug: string,
      toolName: string,
      toolArgs: Record<string, any> = {},
      options?: { agentName?: string; taskId?: string }
    ): Promise<ExecuteResult> => {
      if (!currentUser) {
        return { success: false, error: "User not authenticated" };
      }

      if (!connectedSlugs.has(blueprintSlug)) {
        return {
          success: false,
          error: `Integration "${blueprintSlug}" is not connected. Please connect it in Integrations settings.`,
        };
      }

      setLoading(true);
      setError(null);

      try {
        const result = await executeTool({
          userId: currentUser.clerkId,
          blueprintSlug,
          toolName,
          toolArgs,
          ...(options?.agentName ? { agentName: options.agentName } : {}),
          ...(options?.taskId ? { taskId: options.taskId } : {}),
        });
        setLoading(false);
        return result as ExecuteResult;
      } catch (err: any) {
        const errMsg = err.message || "Integration call failed";
        setError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }
    },
    [executeTool, currentUser, connectedSlugs]
  );

  return {
    execute,
    isConnected,
    loading,
    error,
    connectionsLoaded: connections !== undefined && blueprints !== undefined,
  };
}
