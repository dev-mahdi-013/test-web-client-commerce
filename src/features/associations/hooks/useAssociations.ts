import { useQuery } from "@tanstack/react-query";
import { associationKeys, associationsApi } from "../api";
import type { ListAssociationsParams } from "../types";

export function useAssociations(params: ListAssociationsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: associationKeys.page(params),
    queryFn: () => associationsApi.listAssociations(params),
    enabled: options?.enabled ?? true,
    placeholderData: (previous, previousQuery) =>
      (previousQuery?.queryKey[1] as ListAssociationsParams | undefined)?.query === params.query
        ? previous
        : undefined,
  });
}

export function useAssociationMembers(associationId: string | null, page: number) {
  return useQuery({
    queryKey: associationKeys.members(associationId ?? "none", page),
    queryFn: () => associationsApi.listMembers({ associationId: associationId!, page }),
    enabled: associationId !== null,
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[2] === associationId ? previous : undefined,
  });
}

/** The president picker reads this list every time it opens, so it always fetches the current members. */
export function useAllAssociationMembers(associationId: string | null) {
  return useQuery({
    queryKey: associationKeys.allMembers(associationId ?? "none"),
    queryFn: () => associationsApi.listAllMembers(associationId!),
    enabled: associationId !== null,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
