/**
 * Tenant resolution — reads configuration from environment variables.
 * For open-source self-hosted deployments, set these in .env.local.
 */

interface TenantConfig {
  convexUrl: string;
  convexSiteUrl: string;
  clerkPublishableKey: string;
}

function resolve(): TenantConfig {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!convexUrl) {
    throw new Error(
      "VITE_CONVEX_URL is not set. Copy .env.example to .env.local and configure your Convex deployment URL."
    );
  }

  if (!clerkKey) {
    throw new Error(
      "VITE_CLERK_PUBLISHABLE_KEY is not set. Create a free Clerk app at clerk.com and add your publishable key to .env.local."
    );
  }

  return {
    convexUrl: convexUrl as string,
    convexSiteUrl: (import.meta.env.VITE_CONVEX_SITE_URL || "") as string,
    clerkPublishableKey: clerkKey as string,
  };
}

/** Resolved tenant config — computed once at app startup */
export const tenant = resolve();
