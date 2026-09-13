import { QueryClient } from '@tanstack/react-query';
import {
  createApiClient,
  createAuthStore,
  createCartStore,
  createEndpoints,
  webStorage,
  type EzyifyRuntime,
  type TokenStore,
} from '@ezyify/core';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/** Single shared runtime (API client + stores) for the web app; mobile builds its own with SecureStore. */
export function createWebRuntime(): EzyifyRuntime & { queryClient: QueryClient } {
  const auth = createAuthStore(webStorage());
  const cart = createCartStore(webStorage());

  const tokens: TokenStore = {
    getAccessToken: () => auth.getState().accessToken,
    setAccessToken: token => {
      if (token) auth.getState().setAccessToken(token, 15 * 60);
      else auth.getState().clear();
    },
    // Refresh token lives in an httpOnly cookie; the request itself carries it.
    refresh: async () => {
      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/refresh`, { method: 'POST', credentials: 'include' });
        if (!res.ok) return null;
        const json = (await res.json()) as { success: boolean; data?: { accessToken: string; expiresIn: number } };
        if (!json.success || !json.data) return null;
        auth.getState().setAccessToken(json.data.accessToken, json.data.expiresIn);
        return json.data.accessToken;
      } catch {
        return null;
      }
    },
  };

  const client = createApiClient({
    baseUrl,
    tokens,
    onSessionExpired: () => auth.getState().clear(),
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    },
  });

  return { api: createEndpoints(client), auth, cart, queryClient };
}
