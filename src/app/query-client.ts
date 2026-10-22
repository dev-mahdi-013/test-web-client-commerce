import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/http";

/** Wait before the next attempt after a failed query. The library default doubles from 1s. */
const RETRY_DELAY_MS = 300;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retryDelay: RETRY_DELAY_MS,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
