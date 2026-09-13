import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const safeKey = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, '_');
const isNative = Platform.OS !== 'web';

/** SecureStore (Keystore) on device; expo-secure-store has no web module, so the web preview falls back to AsyncStorage. */
const secureStorage: KeyValueStorage = {
  getItem: key => (isNative ? SecureStore.getItemAsync(safeKey(key)) : AsyncStorage.getItem(key).catch(() => null)),
  setItem: (key, value) => (isNative ? SecureStore.setItemAsync(safeKey(key), value) : AsyncStorage.setItem(key, value).catch(() => undefined)),
  removeItem: key => (isNative ? SecureStore.deleteItemAsync(safeKey(key)) : AsyncStorage.removeItem(key).catch(() => undefined)),
};
const getRefreshToken = () => (isNative ? SecureStore.getItemAsync(REFRESH_KEY) : AsyncStorage.getItem(REFRESH_KEY));
const setRefreshToken = (v: string) => (isNative ? SecureStore.setItemAsync(REFRESH_KEY, v) : AsyncStorage.setItem(REFRESH_KEY, v));
const clearRefreshToken = () => (isNative ? SecureStore.deleteItemAsync(REFRESH_KEY) : AsyncStorage.removeItem(REFRESH_KEY));

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
      const refreshToken = await getRefreshToken();
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
        if (json.data.refreshToken) await setRefreshToken(json.data.refreshToken);
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
      await clearRefreshToken();
      auth.getState().clear();
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  });

  return { api: createEndpoints(client), auth, cart, queryClient };
}
