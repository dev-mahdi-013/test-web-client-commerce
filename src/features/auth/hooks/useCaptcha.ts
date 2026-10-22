import { useQuery } from "@tanstack/react-query";
import { authApi, authKeys } from "../api";

/** Fetched once when the phone step mounts; after that only on refresh or a wrong answer. */
export function useCaptcha() {
  return useQuery({
    queryKey: authKeys.captcha(),
    queryFn: authApi.getCaptcha,
    staleTime: Infinity,
    gcTime: 0,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
