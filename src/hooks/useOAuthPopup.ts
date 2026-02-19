import { useState, useCallback } from "react";
import { apiPost } from "@/lib/api";
import { useCurrentUserId } from "./useCurrentUserId";

const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL as string;

export function useOAuthPopup() {
  const userId = useCurrentUserId();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openOAuth = useCallback(async (blueprintSlug: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Step 1: Get authorize URL from backend
      const response = await apiPost("/api/integrations/oauth/start", {
        blueprintSlug,
        userId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const authorizeUrl = response.authorizeUrl;

      // Step 2: Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authorizeUrl,
        "oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Step 3: Listen for OAuth completion message
      return new Promise<void>((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          // Validate origin for security
          if (!event.origin.includes("convex.site")) {
            return;
          }

          if (event.data.type === "oauth_success") {
            window.removeEventListener("message", handleMessage);
            clearInterval(popupCheck);
            setIsConnecting(false);
            resolve();
          } else if (event.data.type === "oauth_error") {
            window.removeEventListener("message", handleMessage);
            clearInterval(popupCheck);
            setIsConnecting(false);
            const errorMsg = event.data.error || "OAuth authentication failed";
            setError(errorMsg);
            reject(new Error(errorMsg));
          }
        };

        // Also check if popup was closed manually
        const popupCheck = setInterval(() => {
          if (popup.closed) {
            window.removeEventListener("message", handleMessage);
            clearInterval(popupCheck);
            setIsConnecting(false);
            const errorMsg = "OAuth window closed without completing authentication";
            setError(errorMsg);
            reject(new Error(errorMsg));
          }
        }, 500);

        window.addEventListener("message", handleMessage);
      });
    } catch (err: any) {
      setIsConnecting(false);
      setError(err.message || "OAuth failed");
      throw err;
    }
  }, [userId]);

  return {
    openOAuth,
    isConnecting,
    error,
  };
}
