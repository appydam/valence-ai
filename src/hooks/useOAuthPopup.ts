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

      // Clear any stale oauth_result from a previous flow
      try { localStorage.removeItem("oauth_result"); } catch (e) {}

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

      // Step 3: Listen for OAuth completion via postMessage OR localStorage polling.
      // Atlassian (and some other providers) redirect through their own pages before
      // returning to our callback URL, which breaks window.opener in the popup.
      // localStorage polling is a reliable cross-origin fallback.
      return new Promise<void>((resolve, reject) => {
        const finish = (type: "success" | "error", errorMsg?: string) => {
          window.removeEventListener("message", handleMessage);
          clearInterval(pollInterval);
          clearInterval(popupCheck);
          try { localStorage.removeItem("oauth_result"); } catch (e) {}
          setIsConnecting(false);
          if (type === "success") {
            resolve();
          } else {
            const msg = errorMsg || "OAuth authentication failed";
            setError(msg);
            reject(new Error(msg));
          }
        };

        // Primary: postMessage from popup (works when window.opener is intact)
        const handleMessage = (event: MessageEvent) => {
          if (!event.origin.includes("convex.site")) return;
          if (event.data.type === "oauth_success") finish("success");
          else if (event.data.type === "oauth_error") finish("error", event.data.error);
        };

        // Fallback: poll localStorage (works when window.opener is null,
        // e.g. after Atlassian's multi-hop redirect)
        const pollInterval = setInterval(() => {
          try {
            const raw = localStorage.getItem("oauth_result");
            if (!raw) return;
            const result = JSON.parse(raw);
            // Ignore stale results older than 5 minutes
            if (Date.now() - result.ts > 300000) {
              localStorage.removeItem("oauth_result");
              return;
            }
            if (result.type === "oauth_success") finish("success");
            else if (result.type === "oauth_error") finish("error", result.error);
          } catch (e) {}
        }, 300);

        // Detect manual popup close
        const popupCheck = setInterval(() => {
          if (popup.closed) {
            // Give localStorage poll one last chance before declaring failure
            setTimeout(() => {
              try {
                const raw = localStorage.getItem("oauth_result");
                if (raw) {
                  const result = JSON.parse(raw);
                  if (result.type === "oauth_success") { finish("success"); return; }
                  if (result.type === "oauth_error") { finish("error", result.error); return; }
                }
              } catch (e) {}
              finish("error", "OAuth window closed without completing authentication");
            }, 500);
            clearInterval(popupCheck);
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
