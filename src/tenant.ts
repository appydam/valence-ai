/**
 * Runtime tenant resolution — determines which Convex backend to connect to
 * based on the subdomain (e.g., acme.use-valence.ai → "acme" → tenants.json["acme"]).
 *
 * For local dev, prefers .env.local vars, falls back to tenants.json["localhost"].
 */
import tenantsConfig from "./tenants.json";

interface TenantConfig {
  convexUrl: string;
  convexSiteUrl: string;
  clerkPublishableKey: string;
}

type TenantsMap = Record<string, TenantConfig>;

function resolve(): TenantConfig {
  const hostname = window.location.hostname;

  // Local development — prefer env vars for backwards compatibility
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const envConvexUrl = import.meta.env.VITE_CONVEX_URL;
    const envClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    if (envConvexUrl && envClerkKey) {
      return {
        convexUrl: envConvexUrl as string,
        convexSiteUrl: (import.meta.env.VITE_CONVEX_SITE_URL || "") as string,
        clerkPublishableKey: envClerkKey as string,
      };
    }
    const local = (tenantsConfig.tenants as TenantsMap)["localhost"];
    if (local?.convexUrl) return local;
  }

  // Production: extract slug from subdomain
  const slug = hostname.split(".")[0];
  const tenant = (tenantsConfig.tenants as TenantsMap)[slug];
  if (tenant?.convexUrl) return tenant;

  // Fallback: env vars (for single-tenant Vercel deploys during migration)
  const envConvexUrl = import.meta.env.VITE_CONVEX_URL;
  const envClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (envConvexUrl && envClerkKey) {
    return {
      convexUrl: envConvexUrl as string,
      convexSiteUrl: (import.meta.env.VITE_CONVEX_SITE_URL || "") as string,
      clerkPublishableKey: envClerkKey as string,
    };
  }

  throw new Error(
    `Unknown tenant "${slug}". Add it to src/tenants.json and redeploy.\nHostname: ${hostname}`
  );
}

/** Resolved tenant config — computed once at app startup */
export const tenant = resolve();
