import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { QueryClient } from '@tanstack/react-query';
import { createMockFetch } from '@ezyify/core/mock';
import {
  createApiClient,
  createAuthStore,
  createCartStore,
  createEndpoints,
  type EzyifyRuntime,
  type KeyValueStorage,
  type Session,
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

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string; apiMode?: 'live' | 'mock' };
export const API_BASE_URL: string = extra.apiBaseUrl ?? 'https://api.ezyify.app/v1';
/** `mock` runs the in-process API (demo / Maestro / offline QA); release builds default to `live`. */
export const API_MODE: 'live' | 'mock' = extra.apiMode === 'mock' ? 'mock' : 'live';

export interface MobileRuntime extends EzyifyRuntime {
  queryClient: QueryClient;
  /** Persist a fresh session (login / OTP / refresh) — access token in memory, refresh token in the Keystore. */
  commitSession(session: Session): Promise<void>;
  /** Revoke server-side (best effort), then wipe local session + caches. */
  signOut(): Promise<void>;
  /** Cold start: if a refresh token survives, mint an access token and hydrate `me`. Resolves when the gate can render. */
  restoreSession(): Promise<boolean>;
}

export function createMobileRuntime(): MobileRuntime {
  const auth = createAuthStore(secureStorage);
  const cart = createCartStore(secureStorage);

  const mockFetch = API_MODE === 'mock' ? createMockFetch({ latencyMs: 350 }) : undefined;

  const tokens: TokenStore = {
    getAccessToken: () => auth.getState().accessToken,
    setAccessToken: token => {
      if (token) auth.getState().setAccessToken(token, 15 * 60);
      else auth.getState().clear();
    },
    // Native has no cookie jar: the refresh token is kept in SecureStore and sent explicitly; the API rotates it.
    refresh: async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;
      try {
        const res = await api.auth.refresh(refreshToken);
        if (res.refreshToken) await setRefreshToken(res.refreshToken);
        auth.getState().setAccessToken(res.accessToken, res.expiresIn);
        return res.accessToken;
      } catch {
        return null;
      }
    },
  };

  const client = createApiClient({
    baseUrl: API_BASE_URL,
    tokens,
    fetch: mockFetch,
    headers: { 'X-Client': 'native' },
    onSessionExpired: async () => {
      await clearRefreshToken();
      auth.getState().clear();
      queryClient.clear();
    },
  });
  const api = createEndpoints(client);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  });

  const commitSession = async (session: Session) => {
    if (session.refreshToken) await setRefreshToken(session.refreshToken);
    auth.getState().setSession(session);
    // Guest cart → server cart merge, then the server copy is the source of truth.
    const guestLines = cart.getState().lines;
    if (guestLines.length) {
      for (const line of guestLines) await api.cart.add(line.productId, line.quantity, line.variantId).catch(() => undefined);
      cart.getState().clear();
    }
    queryClient.invalidateQueries();
  };

  const signOut = async () => {
    const refreshToken = await getRefreshToken();
    await api.auth.logout(refreshToken ?? undefined).catch(() => undefined);
    await clearRefreshToken();
    auth.getState().clear();
    cart.getState().clear();
    queryClient.clear();
  };

  const restoreSession = async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      if (auth.getState().status === 'authenticated') auth.getState().clear();
      return false;
    }
    const token = await tokens.refresh();
    if (!token) {
      await clearRefreshToken();
      auth.getState().clear();
      return false;
    }
    try {
      const me = await api.users.me();
      auth.getState().setSession({ accessToken: token, expiresIn: 15 * 60, user: { id: me.id, username: me.username, name: me.name, avatarUrl: me.avatarUrl, verified: me.verified, role: me.role } });
    } catch {
      // Access token is valid; the persisted user summary is good enough until `me` loads.
    }
    return true;
  };

  return { api, auth, cart, queryClient, commitSession, signOut, restoreSession };
}
