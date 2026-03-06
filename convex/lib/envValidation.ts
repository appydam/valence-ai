/**
 * Environment variable validation.
 * Validates that critical env vars are set and returns clear error messages when they're missing.
 * Uses lazy validation — checks on first use, not at module load time.
 */

type EnvVarConfig = {
  name: string;
  required: boolean;
  description: string;
};

const CRITICAL_ENV_VARS: EnvVarConfig[] = [
  { name: "INTEGRATION_ENCRYPTION_KEY", required: true, description: "AES-256-GCM key for encrypting OAuth tokens and API keys" },
  { name: "ALLOWED_ORIGIN", required: false, description: "CORS allowed origins (comma-separated). Defaults to * if not set" },
];

const BILLING_ENV_VARS: EnvVarConfig[] = [
  { name: "STRIPE_SECRET_KEY", required: false, description: "Stripe secret key for billing" },
  { name: "STRIPE_WEBHOOK_SECRET", required: false, description: "Stripe webhook signing secret" },
];

const AGENT_ENV_VARS: EnvVarConfig[] = [
  { name: "AGENT_WAKEUP_WEBHOOK_URL", required: false, description: "Agent wakeup webhook endpoint URL" },
  { name: "AGENT_WAKEUP_WEBHOOK_SECRET", required: false, description: "HMAC secret for agent wakeup webhook" },
];

const AUTH_ENV_VARS: EnvVarConfig[] = [
  { name: "CLERK_JWT_ISSUER_DOMAIN", required: true, description: "Clerk JWT issuer domain for auth validation" },
];

/**
 * Get a required env var or throw a clear error.
 */
export function requireEnvVar(name: string, description?: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}${description ? ` (${description})` : ""}. ` +
      `Set it via: npx convex env set ${name} <value>`
    );
  }
  return value;
}

/**
 * Get an optional env var with a fallback.
 */
export function getEnvVar(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

/**
 * Check all env vars and return a health report.
 * Does NOT throw — returns status for each var.
 */
export function checkEnvVarHealth(): {
  status: "healthy" | "degraded" | "critical";
  vars: { name: string; set: boolean; required: boolean; description: string }[];
} {
  const allVars = [
    ...CRITICAL_ENV_VARS,
    ...AUTH_ENV_VARS,
    ...BILLING_ENV_VARS,
    ...AGENT_ENV_VARS,
  ];

  const results = allVars.map((v) => ({
    name: v.name,
    set: !!process.env[v.name],
    required: v.required,
    description: v.description,
  }));

  const missingRequired = results.filter((r) => r.required && !r.set);
  const missingOptional = results.filter((r) => !r.required && !r.set);

  let status: "healthy" | "degraded" | "critical";
  if (missingRequired.length > 0) {
    status = "critical";
  } else if (missingOptional.length > 0) {
    status = "degraded";
  } else {
    status = "healthy";
  }

  return { status, vars: results };
}
