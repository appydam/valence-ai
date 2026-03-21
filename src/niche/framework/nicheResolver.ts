import type { NicheId } from "./types";

const NICHE_SUBDOMAINS: Record<string, NicheId> = {
  ads: "ads",
  gtm: "gtm",
  content: "content",
};

/**
 * Detects if the current hostname is a niche subdomain.
 * e.g. ads.usevalence.ai → "ads", gtm.usevalence.ai → "gtm"
 * Returns null for the main app or localhost.
 */
export function resolveNiche(): NicheId | null {
  const hostname = window.location.hostname;

  // Local development — never resolve to niche
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  const subdomain = hostname.split(".")[0];
  return NICHE_SUBDOMAINS[subdomain] ?? null;
}
