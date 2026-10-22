import { useQuery } from "@tanstack/react-query";
import { assemblyKeys, assembliesApi } from "../api";
import type { ListAssembliesParams } from "../types";

export function useAssemblies(params: ListAssembliesParams) {
  return useQuery({
    queryKey: assemblyKeys.page(params),
    queryFn: () => assembliesApi.listAssemblies(params),
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
