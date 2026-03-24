/**
 * User-scoped query hooks.
 * Wraps Convex queries to automatically filter by the current Clerk userId.
 * This ensures each user only sees their own data.
 */

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUserId } from "./useCurrentUserId";

/**
 * Returns tasks scoped to the current user.
 * Falls back to all tasks if userId is "system" (e.g. during SSR or unauthenticated).
 */
export function useUserTasks(filters?: { status?: string; assignee?: string }) {
  const userId = useCurrentUserId();
  const isReal = userId !== "system";
  return useQuery(
    api.tasks.list,
    isReal
      ? { userId, ...filters }
      : filters ?? {}
  ) ?? [];
}

/**
 * Returns missions scoped to the current user.
 */
export function useUserMissions() {
  const userId = useCurrentUserId();
  const isReal = userId !== "system";
  return useQuery(
    api.missions.list,
    isReal ? { userId } : {}
  ) ?? [];
}
