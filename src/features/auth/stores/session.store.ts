import { toast } from "@heroui/react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { queryClient } from "@/app/query-client";
import { setAccessTokenGetter, setActiveRoleIdGetter, setSessionRejectedHandler } from "@/lib/http";
import type { AuthSession } from "../types";

type SessionState = {
  session: AuthSession | null;
  activeRoleId: string | null;
  setSession: (session: AuthSession) => void;
  setActiveRole: (roleId: string) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      activeRoleId: null,
      setSession: (session) => set({ session, activeRoleId: session.user.roles[0]?.id ?? null }),
      setActiveRole: (activeRoleId) => set({ activeRoleId }),
      clearSession: () => set({ session: null, activeRoleId: null }),
    }),
    {
      name: "hodhod.session",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session, activeRoleId: state.activeRoleId }),
      migrate: () => ({ session: null, activeRoleId: null }),
    },
  ),
);

setAccessTokenGetter(() => useSessionStore.getState().session?.accessToken ?? null);
setActiveRoleIdGetter(() => {
  const { activeRoleId, session } = useSessionStore.getState();
  return session?.user.roles.some((role) => role.id === activeRoleId)
    ? activeRoleId
    : (session?.user.roles[0]?.id ?? null);
});

const SESSION_EXPIRED_MESSAGE = "نشست شما منقضی شده است، دوباره وارد شوید";
const ACCESS_DENIED_MESSAGE = "شما دسترسی لازم برای این بخش را ندارید";

/** A rejected token or permission signs the user out; RequireAuth then sends them to the login page. */
setSessionRejectedHandler((error) => {
  const { session, clearSession } = useSessionStore.getState();
  if (!session) return;
  clearSession();
  queryClient.clear();
  toast.danger(error.status === 401 ? SESSION_EXPIRED_MESSAGE : ACCESS_DENIED_MESSAGE);
});
