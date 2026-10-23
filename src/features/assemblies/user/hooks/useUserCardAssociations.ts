import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { activeRoleOf, appRoleOf } from "@/features/profile/roles";
import { userAssembliesApi, userCardAssociations } from "../api/user.api";

export const userCardKeys = {
  associations: ["user", "joined-associations"] as const,
};

export function useUserCardAssociations() {
  const profile = useProfile();
  const isUser = appRoleOf(activeRoleOf(profile.data)) === "user";

  const query = useQuery({
    queryKey: userCardKeys.associations,
    queryFn: () => userAssembliesApi.listJoinedAssociations(),
    enabled: isUser,
  });

  const recorded = useMemo(
    () => userCardAssociations(profile.data?.fullName ?? "", profile.data?.phone ?? ""),
    [profile.data?.fullName, profile.data?.phone],
  );

  const data = query.data && query.data.length > 0 ? query.data : recorded;

  return { ...query, data };
}
