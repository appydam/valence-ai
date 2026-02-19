const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL as string;

export async function apiPost(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${CONVEX_SITE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function apiGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${CONVEX_SITE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const response = await fetch(url.toString());
  return response.json();
}
