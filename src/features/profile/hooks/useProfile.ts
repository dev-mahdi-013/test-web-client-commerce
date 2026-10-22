import { useMemo } from "react";
import { useSessionStore } from "@/features/auth/stores/session.store";
import type { Profile } from "../types";

/** The Account Service has no profile endpoint; the user's details come with the login response. */
export function useProfile() {
  const session = useSessionStore((state) => state.session);
  const activeRoleId = useSessionStore((state) => state.activeRoleId);

  const data = useMemo<Profile | undefined>(
    () =>
      session
        ? {
            fullName: session.user.name,
            phone: session.user.phone,
            roles: session.user.roles,
            activeRoleId,
          }
        : undefined,
    [session, activeRoleId],
  );

  return { data };
}
