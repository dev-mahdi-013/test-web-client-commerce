import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api";
import { useSessionStore } from "../stores/session.store";

export function useSession() {
  const queryClient = useQueryClient();
  const session = useSessionStore((state) => state.session);
  const clearSession = useSessionStore((state) => state.clearSession);

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: session !== null,
    logout: () => {
      // Ending the session on the server is best-effort; the user is signed out locally either way.
      if (session) authApi.logout(session.tokenId).catch(() => {});
      clearSession();
      queryClient.clear();
    },
  };
}
