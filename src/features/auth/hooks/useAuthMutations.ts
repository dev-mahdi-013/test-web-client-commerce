import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api";
import { useSessionStore } from "../stores/session.store";

export function useSendOtp() {
  return useMutation({ mutationFn: authApi.sendOtp });
}

export function useVerifyOtp() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: setSession,
  });
}
