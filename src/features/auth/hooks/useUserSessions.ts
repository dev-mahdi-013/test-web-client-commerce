import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { useSessionStore } from "../stores/session.store";
import { authApi, authKeys } from "../api";

/** Lists the user's active logins and ends them one by one. */
export function useUserSessions() {
  const queryClient = useQueryClient();
  const tokenId = useSessionStore((state) => state.session?.tokenId ?? null);
  const sessions = useQuery({
    queryKey: authKeys.sessions(),
    queryFn: () => authApi.getSessions(tokenId),
    enabled: tokenId !== null,
  });

  const endSession = useMutation({
    mutationFn: (id: string) => authApi.logoutSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
      toast.success("نشست مورد نظر پایان یافت");
    },
    onError: () => toast.danger("پایان دادن به نشست انجام نشد"),
  });

  return {
    sessions: sessions.data ?? [],
    isLoading: sessions.isPending,
    isError: sessions.isError,
    /** Id of the session currently being ended, so only its own button shows as pending */
    endingSessionId: endSession.isPending ? (endSession.variables ?? null) : null,
    endSession: endSession.mutate,
  };
}
