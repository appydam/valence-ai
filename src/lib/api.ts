const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL as string;

/**
 * Get the Clerk JWT token for authenticating HTTP requests to Convex.
 * Uses the global window.Clerk object injected by ClerkProvider.
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // Clerk exposes a global object when loaded via ClerkProvider
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      const token = await clerk.session.getToken({ template: "convex" });
      return token;
    }
  } catch {
    // Silently fail — unauthenticated requests will get 401 from the server
  }
  return null;
}

/**
 * Build headers with optional auth token.
 */
async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = await getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiPost(path: string, body: Record<string, unknown>) {
  const headers = await buildHeaders();
  const response = await fetch(`${CONVEX_SITE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function apiGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${CONVEX_SITE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers = await buildHeaders();
  const response = await fetch(url.toString(), { headers });
  return response.json();
}
