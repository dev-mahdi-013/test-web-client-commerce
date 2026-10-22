import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { setAccessTokenGetter, setActiveRoleIdGetter } from "@/lib/http";
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