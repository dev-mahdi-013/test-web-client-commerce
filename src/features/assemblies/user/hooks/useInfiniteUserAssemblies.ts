import { useInfiniteQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/features/auth/stores/session.store";
import { currentCommerceScope } from "@/lib/commerce-scope";
import { assemblyKeys, assembliesApi } from "../../api";

/** Mobile list: pages are appended as the user scrolls (no pagination controls). */
export function useInfiniteUserAssemblies({ enabled }: { enabled: boolean }) {
  // Switching role changes the Commerce token, so the list is requested again under the new role.
  const activeRoleId = useSessionStore((state) => state.activeRoleId);
  return useInfiniteQuery({
    queryKey: [...assemblyKeys.all, currentCommerceScope(), "user-infinite", activeRoleId],
    queryFn: ({ pageParam }) => assembliesApi.listAssemblies({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled,
    // The polls list is never cached: every visit to the page requests it again, and leaving the page drops it.
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}
