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

export function useAssociationMembers(associationId: string | null, page: number, query = "") {
  return useQuery({
    queryKey: associationKeys.members(associationId ?? "none", page, query),
    queryFn: () => associationsApi.listMembers({ associationId: associationId!, page, query }),
    enabled: associationId !== null,
    // Keep the rows while paging, but drop them as soon as the association or the search changes.
    placeholderData: (previous, previousQuery) => {
      const previousKey = previousQuery?.queryKey;
      return previousKey?.[2] === associationId && previousKey?.[4] === query ? previous : undefined;
    },
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
