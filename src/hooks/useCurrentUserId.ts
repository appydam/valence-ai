import { useUser } from "@clerk/clerk-react";

export function useCurrentUserId(): string {
  const { user } = useUser();
  return user?.id ?? "system";
}
