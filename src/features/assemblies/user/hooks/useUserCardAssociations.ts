import { useQuery } from "@tanstack/react-query";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { activeRoleOf, appRoleOf } from "@/features/profile/roles";
import { userAssembliesApi } from "../api/user.api";

export const userCardKeys = {
  associations: ["user", "joined-associations"] as const,
};

export function useUserCardAssociations() {
  const profile = useProfile();
  const isUser = appRoleOf(activeRoleOf(profile.data)) === "user";

  return useQuery({
    queryKey: userCardKeys.associations,
    queryFn: () => userAssembliesApi.listJoinedAssociations(),
    enabled: isUser,
  });
}
