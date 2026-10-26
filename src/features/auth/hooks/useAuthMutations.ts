import { toast } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api";
import { useSessionStore } from "../stores/session.store";

export const NO_ROLE_MESSAGE = "شما دسترسی ندارید";

/** Thrown when the login succeeds but the account has no role, so no session is stored */
export class NoRoleError extends Error {}

export function useSendOtp() {
  return useMutation({ mutationFn: authApi.sendOtp });
}

export function useVerifyOtp() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload: Parameters<typeof authApi.verifyOtp>[0]) => {
      const session = await authApi.verifyOtp(payload);
      if (session.user.roles.length === 0) throw new NoRoleError(NO_ROLE_MESSAGE);
      return session;
    },
    onSuccess: setSession,
    onError: (error) => {
      if (error instanceof NoRoleError) toast.danger(NO_ROLE_MESSAGE);
    },
  });
}
