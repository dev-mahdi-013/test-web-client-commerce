import { useQuery } from "@tanstack/react-query";
import { memberKeys, membersApi } from "../api";
import type { ListMembersParams } from "../types";

export function useMembers(params: ListMembersParams, enabled = true) {
  return useQuery({
    queryKey: memberKeys.page(params),
    queryFn: () => membersApi.listMembers(params),
    enabled,
    // Keep the current rows while paging, but drop them as soon as the search changes.
    placeholderData: (previous, previousQuery) => {
      const previousParams = previousQuery?.queryKey[1] as ListMembersParams | undefined;
      return previousParams?.query === params.query && previousParams?.associationId === params.associationId
        ? previous
        : undefined;
    },
  });
}

export function useCardAssociations(memberId: string, cardId: string) {
  return useQuery({
    queryKey: memberKeys.cardAssociations(memberId, cardId),
    queryFn: () => membersApi.listCardAssociations(memberId, cardId),
  });
}
