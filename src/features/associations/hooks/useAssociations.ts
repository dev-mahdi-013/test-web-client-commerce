import { useQuery } from "@tanstack/react-query";
import { associationKeys, associationsApi } from "../api";
import type { ListAssociationsParams } from "../types";

export function useAssociations(params: ListAssociationsParams) {
  return useQuery({
    queryKey: associationKeys.page(params),
    queryFn: () => associationsApi.listAssociations(params),
    // Keep the current rows while paging, but drop them as soon as the search changes.
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
    // Keep the current cards while the next page loads, but never show another association's members.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[2] === associationId ? previous : undefined,
  });
}

export function useAllAssociationMembers(associationId: string | null) {
  return useQuery({
    queryKey: associationKeys.allMembers(associationId ?? "none"),
    queryFn: () => associationsApi.listAllMembers(associationId!),
    enabled: associationId !== null,
  });
}
