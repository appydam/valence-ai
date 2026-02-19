import { useState, useCallback } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { apiPost } from "@/lib/api";
import { useCurrentUserId } from "./useCurrentUserId";
import { useOAuthPopup } from "./useOAuthPopup";

export function useIntegrationEngine() {
  const userId = useCurrentUserId();
  const { openOAuth, isConnecting: isOAuthConnecting, error: oauthError } = useOAuthPopup();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectApiKey = useCallback(async (blueprintSlug: string, apiKey: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiPost("/api/integrations/connect-key", {
        blueprintSlug,
        userId,
        apiKey,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to connect");
      }

      setIsLoading(false);
      return result;
    } catch (err: any) {
      setIsLoading(false);
      const errorMsg = err.message || "Connection failed";
      setError(errorMsg);
      throw err;
    }
  }, [userId]);

  const connectOAuth = useCallback(async (blueprintSlug: string) => {
    setError(null);
    try {
      await openOAuth(blueprintSlug);
    } catch (err: any) {
      setError(err.message || "OAuth connection failed");
      throw err;
    }
  }, [openOAuth]);

  const disconnect = useCallback(async (blueprintId: Id<"blueprints">) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiPost("/api/integrations/disconnect", {
        blueprintId,
        userId,
      });

      if (!result.ok) {
        throw new Error("Failed to disconnect");
      }

      setIsLoading(false);
      return result;
    } catch (err: any) {
      setIsLoading(false);
      const errorMsg = err.message || "Disconnect failed";
      setError(errorMsg);
      throw err;
    }
  }, [userId]);

  const testConnection = useCallback(async (
    blueprintSlug: string,
    toolName?: string,
    toolArgs?: Record<string, unknown>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiPost("/api/integrations/execute", {
        userId,
        agentName: "TestAgent",
        blueprintSlug,
        toolName: toolName || "test",
        toolArgs: toolArgs || {},
      });

      setIsLoading(false);
      return result;
    } catch (err: any) {
      setIsLoading(false);
      const errorMsg = err.message || "Test failed";
      setError(errorMsg);
      throw err;
    }
  }, [userId]);

  return {
    userId,
    connectApiKey,
    connectOAuth,
    disconnect,
    testConnection,
    isLoading: isLoading || isOAuthConnecting,
    error: error || oauthError,
  };
}
