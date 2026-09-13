import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { QueryClient } from '@tanstack/react-query';
import {
  createApiClient,
  createAuthStore,
  createCartStore,
  createEndpoints,
  type EzyifyRuntime,
  type KeyValueStorage,
  type TokenStore,
} from '@ezyify/core';

const REFRESH_KEY = 'ezyify.refreshToken';

/** SecureStore-backed KV (Keystore on Android). Keys must be alphanumeric + [._-]. */
const secureStorage: KeyValueStorage = {
  getItem: key => SecureStore.getItemAsync(key.replace(/[^A-Za-z0-9._-]/g, '_')),
  setItem: (key, value) => SecureStore.setItemAsync(key.replace(/[^A-Za-z0-9._-]/g, '_'), value),
  removeItem: key => SecureStore.deleteItemAsync(key.replace(/[^A-Za-z0-9._-]/g, '_')),
};

const baseUrl: string = Constants.expoConfig?.extra?.apiBaseUrl ?? 'https://api.ezyify.app/v1';

export function createMobileRuntime(): EzyifyRuntime & { queryClient: QueryClient } {
  const auth = createAuthStore(secureStorage);
  const cart = createCartStore(secureStorage);

  const tokens: TokenStore = {
    getAccessToken: () => auth.getState().accessToken,
    setAccessToken: token => {
      if (token) auth.getState().setAccessToken(token, 15 * 60);
      else auth.getState().clear();
    },
    // Native has no cookie jar: the refresh token is kept in SecureStore and sent explicitly.
    refresh: async () => {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!refreshToken) return null;
      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return null;
        const json = (await res.json()) as {
          success: boolean;
          data?: { accessToken: string; expiresIn: number; refreshToken?: string };
        };
        if (!json.success || !json.data) return null;
        if (json.data.refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, json.data.refreshToken);
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
    onSessionExpired: async () => {
      await SecureStore.deleteItemAsync(REFRESH_KEY);
      auth.getState().clear();
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  });

  return { api: createEndpoints(client), auth, cart, queryClient };
}
