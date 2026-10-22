import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@/shared/types/api";
import { associationSecretariesApi } from "../api/association-secretaries.api";
import { SECRETARIES_PAGE_SIZE } from "../config";
import type { AddSecretaryPayload, AssociationSecretary } from "../types";

const secretaryKeys = {
  all: ["association-secretaries"] as const,
};

/** The history endpoint is not paginated, so pages are cut from the full list here. */
export function useAssociationSecretaries({ page, pageSize = SECRETARIES_PAGE_SIZE }: { page: number; pageSize?: number }) {
  return useQuery({
    queryKey: secretaryKeys.all,
    queryFn: associationSecretariesApi.list,
    select: (secretaries): Paginated<AssociationSecretary> => {
      const totalPages = Math.max(1, Math.ceil(secretaries.length / pageSize));
      const current = Math.min(page, totalPages);
      const start = (current - 1) * pageSize;
      return {
        items: secretaries.slice(start, start + pageSize),
        page: current,
        pageSize,
        total: secretaries.length,
        totalPages,
      };
    },
  });
}

export function useAddAssociationSecretary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddSecretaryPayload) => associationSecretariesApi.add(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: secretaryKeys.all }),
  });
}

export function useRemoveAssociationSecretary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (secretary: AssociationSecretary) => associationSecretariesApi.remove(secretary),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: secretaryKeys.all }),
  });
}
