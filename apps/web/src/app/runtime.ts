import { QueryClient } from '@tanstack/react-query';
import {
  createApiClient,
  createAuthStore,
  createCartStore,
  createEndpoints,
  webStorage,
  type EzyifyRuntime,
  type Session,
  type TokenStore,
} from '@ezyify/core';
import { createMockFetch } from '@ezyify/core/mock';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
/**
 * `mock` runs the in-process API (same fixtures as the mobile demo build) — used by Playwright in CI and for
 * offline previews. Production builds default to `live`; the mock is tree-shaken out when the flag is off.
 */
export const API_MODE: 'live' | 'mock' = import.meta.env.VITE_API_MODE === 'mock' ? 'mock' : 'live';

const MOCK_COOKIE_KEY = 'ezyify.mock.refresh';
const MOCK_STATE_KEY = 'ezyify.mock.state';

export interface WebRuntime extends EzyifyRuntime {
  queryClient: QueryClient;
  /** Persist a fresh session (login / OTP); merges the guest cart into the server cart. */
  commitSession(session: Session): Promise<void>;
  /** Revoke server-side (best effort), then wipe local session + caches. */
  signOut(): Promise<void>;
  /** Cold start: exchange the httpOnly refresh cookie for an access token and hydrate `me`. */
  restoreSession(): Promise<boolean>;
}

/** Single shared runtime (API client + stores) for the web app; mobile builds its own with SecureStore. */
export function createWebRuntime(): WebRuntime {
  const auth = createAuthStore(webStorage());
  const cart = createCartStore(webStorage());

  // Browsers keep the real refresh token in an httpOnly cookie; the mock keeps its stand-in in localStorage so a
  // reload in demo mode still restores the session.
  const mockFetch =
    API_MODE === 'mock'
      ? createMockFetch({
          latencyMs: 250,
          // Demo state (cart, orders, chats) survives reloads; `sessionStorage` keeps it per tab and short-lived.
          persist: {
            load: () => {
              try {
                return sessionStorage.getItem(MOCK_STATE_KEY);
              } catch {
                return null;
              }
            },
            save: v => {
              try {
                sessionStorage.setItem(MOCK_STATE_KEY, v);
              } catch {
                /* quota */
              }
            },
          },
          cookieJar: {
            get: () => {
              try {
                return localStorage.getItem(MOCK_COOKIE_KEY);
              } catch {
                return null;
              }
            },
            set: v => {
              try {
                if (v) localStorage.setItem(MOCK_COOKIE_KEY, v);
                else localStorage.removeItem(MOCK_COOKIE_KEY);
              } catch {
                /* private mode */
              }
            },
          },
        })
      : undefined;
  const fetchImpl: typeof fetch = mockFetch ?? ((input, init) => fetch(input, init));

  const tokens: TokenStore = {
    getAccessToken: () => auth.getState().accessToken,
    setAccessToken: token => {
      if (token) auth.getState().setAccessToken(token, 15 * 60);
      else auth.getState().clear();
    },
    // Refresh token lives in an httpOnly cookie; the request itself carries it.
    refresh: async () => {
      try {
        const res = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        });
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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    },
  });

  const client = createApiClient({
    baseUrl,
    tokens,
    fetch: mockFetch,
    onSessionExpired: () => {
      auth.getState().clear();
      queryClient.clear();
    },
  });
  const api = createEndpoints(client);

  const commitSession = async (session: Session) => {
    auth.getState().setSession(session);
    const guestLines = cart.getState().lines;
    if (guestLines.length) {
      for (const line of guestLines) await api.cart.add(line.productId, line.quantity, line.variantId).catch(() => undefined);
      cart.getState().clear();
    }
    queryClient.invalidateQueries();
  };

  const signOut = async () => {
    await api.auth.logout().catch(() => undefined);
    auth.getState().clear();
    cart.getState().clear();
    queryClient.clear();
  };

  const restoreSession = async () => {
    // Only users who were signed in before have a cookie worth exchanging; skip the round-trip for guests.
    if (auth.getState().status !== 'authenticated') return false;
    const token = await tokens.refresh();
    if (!token) {
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
