import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError, NetworkError, TimeoutError } from "@/lib/api-client";
import { useSessionStore } from "@/store/session.store";

function retryPolicy(failureCount: number, error: unknown) {
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return failureCount < 3;
  }
  return false;
}

function handleGlobalError(error: unknown) {
  if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
    useSessionStore.getState().clearSession();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleGlobalError }),
    mutationCache: new MutationCache({ onError: handleGlobalError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: retryPolicy,
      },
      mutations: {
        retry: retryPolicy,
      },
    },
  });
}
