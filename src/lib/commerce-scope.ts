import { useSessionStore } from "@/features/auth/stores/session.store";
import { activeRoleOf, appRoleOf, type AppRole } from "@/features/profile/roles";
import type { Profile } from "@/features/profile/types";

/** Path prefix of the Commerce endpoints for the role the user is acting as. */
export type CommerceScope = "pcp" | "pao" | "cio" | "cm" | "ap";

export function commerceScopeFor(role: AppRole): CommerceScope {
  switch (role) {
    case "organizations":
      return "pao";
    case "association-head":
    case "association-info":
    case "association-secretary":
      // Association president / «رئیس انجمن» / secretary all use `/ap` endpoints.
      return "ap";
    case "card-issuance":
      return "cio";
    case "user":
      return "cm";
    case "chamber-president":
      return "pcp";
    default:
      return "pcp";
  }
}

function profileFromSession(): Profile | undefined {
  const { session, activeRoleId } = useSessionStore.getState();
  if (!session) return undefined;
  return {
    fullName: session.user.name,
    phone: session.user.phone,
    roles: session.user.roles,
    activeRoleId,
  };
}

/** Resolves the Commerce path prefix from the active (design) role in the switcher. */
export function currentCommerceScope(): CommerceScope {
  return commerceScopeFor(appRoleOf(activeRoleOf(profileFromSession())));
}

export function currentAppRole(): AppRole {
  return appRoleOf(activeRoleOf(profileFromSession()));
}
