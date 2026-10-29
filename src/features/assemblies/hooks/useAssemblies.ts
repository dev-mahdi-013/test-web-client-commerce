import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/features/auth/stores/session.store";
import { assemblyKeys, assembliesApi } from "../api";
import type { ListAssembliesParams } from "../types";

export function useAssemblies(params: ListAssembliesParams) {
  // Switching role changes the Commerce token, so the list is requested again under the new role.
  const activeRoleId = useSessionStore((state) => state.activeRoleId);
  return useQuery({
    queryKey: [...assemblyKeys.page(params), activeRoleId],
    queryFn: () => assembliesApi.listAssemblies(params),
    // The polls list is never cached: every visit requests it again, and leaving the page drops it.
    staleTime: 0,
    // Not 0: React StrictMode (dev) unmounts and remounts right away, and a query dropped in between is fetched twice.
    gcTime: 1_000,
    refetchOnMount: "always",
    // Keep the current rows while paging, but drop them as soon as the filters change.
    placeholderData: (previous, previousQuery) => {
      // queryKey: ["assemblies", scope, params]
      const previousParams = previousQuery?.queryKey[2] as ListAssembliesParams | undefined;
      if (!previousParams) return undefined;
      const sameFilters =
        previousParams.query === params.query &&
        previousParams.status === params.status &&
        previousParams.association === params.association;
      return sameFilters ? previous : undefined;
    },
  });
}

export function useAssembly(assemblyId: string | null) {
  return useQuery({
    queryKey: assemblyKeys.detail(assemblyId ?? "none"),
    queryFn: () => assembliesApi.getAssembly(assemblyId!),
    enabled: assemblyId !== null,
  });
}
