import { Navigate, Outlet } from "react-router";
import { useSession } from "@/features/auth/hooks/useSession";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { activeRoleOf, appRoleOf, homePathFor, type AppRole } from "@/features/profile/roles";

export function RequireAuth() {
  const { isAuthenticated } = useSession();
  return isAuthenticated ? <Outlet /> : <Navigate replace to="/login" />;
}

export function GuestOnly() {
  const { isAuthenticated } = useSession();
  return isAuthenticated ? <Navigate replace to="/" /> : <Outlet />;
}

function useAppRole() {
  const profile = useProfile();
  return appRoleOf(activeRoleOf(profile.data));
}

/** Lands on the first page of the active role's menu. */
export function RoleHome() {
  return <Navigate replace to={homePathFor(useAppRole())} />;
}

/** Keeps a page inside the roles whose design includes it. */
export function RequireAppRole({ roles }: { roles: AppRole[] }) {
  const role = useAppRole();
  if (!roles.includes(role)) return <Navigate replace to={homePathFor(role)} />;
  return <Outlet />;
}
