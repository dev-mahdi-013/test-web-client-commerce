import { useCallback } from "react";
import { useSessionStore } from "@/features/auth/stores/session.store";
import type { Assembly } from "../types";

function normalizeName(value: string) {
  return value
    .replace(/\u200c/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/**
 * Returns a predicate telling whether an assembly was created by the logged-in user.
 *
 * The backend's `createdBy.data._id` is not guaranteed to equal the role id, so it is
 * compared against every identifier carried by the active role (id, roleId, _id, ...).
 * If no id matches, it falls back to comparing the creator's display name with the
 * logged-in user's name.
 */
export function useAssemblyOwnerCheck() {
  const activeRoleId = useSessionStore((state) => state.activeRoleId);
  const session = useSessionStore((state) => state.session);

  return useCallback(
    (assembly: Pick<Assembly, "createdById" | "createdBy">) => {
      const activeRole =
        session?.user.roles.find((role) => role.id === activeRoleId) ?? session?.user.roles[0];

      const createdById = assembly.createdById?.trim().toLowerCase();
      if (createdById && activeRole) {
        const matchesId = Object.values(activeRole).some(
          (value) => typeof value === "string" && value.trim().toLowerCase() === createdById,
        );
        if (matchesId) return true;
      }

      const creatorName = normalizeName(assembly.createdBy ?? "");
      const userName = normalizeName(session?.user.name ?? "");
      return creatorName !== "" && creatorName !== "—" && creatorName === userName;
    },
    [activeRoleId, session],
  );
}
