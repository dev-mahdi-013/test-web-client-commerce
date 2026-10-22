import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@/shared/types/api";
import { hrApi, hrKeys } from "../api";
import type { AddOfficerPayload, ListOfficersParams, Officer, OfficerUnit } from "../types";

/** The history endpoint is not paginated, so pages are cut from the full list here. */
export function useOfficers({ unit, page, pageSize }: ListOfficersParams) {
  return useQuery({
    queryKey: hrKeys.officers(unit),
    queryFn: () => hrApi.listOfficers(unit),
    select: (officers): Paginated<Officer> => {
      const totalPages = Math.max(1, Math.ceil(officers.length / pageSize));
      const current = Math.min(page, totalPages);
      const start = (current - 1) * pageSize;
      return {
        items: officers.slice(start, start + pageSize),
        page: current,
        pageSize,
        total: officers.length,
        totalPages,
      };
    },
  });
}

export function useAddOfficer(unit: OfficerUnit) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<AddOfficerPayload, "unit">) => hrApi.addOfficer({ unit, ...payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hrKeys.officers(unit) }),
  });
}

export function useDismissOfficer(unit: OfficerUnit) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (officer: Officer) => hrApi.dismissOfficer({ unit, officer }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hrKeys.officers(unit) }),
  });
}
