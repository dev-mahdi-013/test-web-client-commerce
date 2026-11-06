import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import type { DownloadProgressHandler } from "@/lib/http";
import { assemblyKeys, assembliesApi } from "../api";

/** Poll members for the slip (فیش) dialog, loaded one cursor page at a time while scrolling. */
export function usePollMembers(assemblyId: string, query: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: assemblyKeys.pollMembers(assemblyId, query),
    queryFn: ({ pageParam }) =>
      assembliesApi.listPollMembers(assemblyId, { searchKeyword: query, cursor: pageParam }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && Boolean(assemblyId),
  });
}

/** Downloads the QR auth letter (PDF) of a member as a Blob, reporting progress as it arrives. */
export function useDownloadPollSlip(assemblyId: string) {
  return useMutation({
    mutationFn: ({
      memberId,
      memberRoleId,
      onDownloadProgress,
    }: {
      memberId: string;
      memberRoleId: string;
      onDownloadProgress?: DownloadProgressHandler;
    }) => assembliesApi.downloadPollMemberQrAuth(assemblyId, memberId, memberRoleId, onDownloadProgress),
  });
}
