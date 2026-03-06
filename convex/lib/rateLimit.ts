/**
 * Simple sliding-window rate limiter for HTTP endpoints.
 * Uses in-memory counters (resets on cold start — acceptable for per-deployment model).
 */

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

/**
 * Check if a request is within rate limits.
 * @param key - Unique identifier (e.g., `${userId}:${endpoint}`)
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Rate limit presets for different endpoint categories.
 */
export const RATE_LIMITS = {
  general: { limit: 300, windowMs: 60_000 },         // 300/min
  taskMutation: { limit: 30, windowMs: 60_000 },     // 30/min
  integrationExecute: { limit: 100, windowMs: 60_000 }, // 100/min
  ssh: { limit: 5, windowMs: 60_000 },               // 5/min
  scraper: { limit: 3, windowMs: 3_600_000 },        // 3/hour
  reasoning: { limit: 100, windowMs: 60_000 },       // 100/min per agent
} as const;

/**
 * Create a 429 Too Many Requests response.
 */
export function rateLimitResponse(headers: Record<string, string>): Response {
  return new Response(
    JSON.stringify({ error: "Too Many Requests", message: "Rate limit exceeded. Please try again later." }),
    { status: 429, headers },
  );
}
