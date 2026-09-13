import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session, UserSummary } from '../schemas/user';
import { STORAGE_KEYS, memoryStorage, type KeyValueStorage } from './storage';

export interface AuthState {
  user: UserSummary | null;
  accessToken: string | null;
  /** epoch ms */
  expiresAt: number | null;
  status: 'anonymous' | 'authenticated';
  setSession(session: Session): void;
  setAccessToken(token: string, expiresIn: number): void;
  updateUser(patch: Partial<UserSummary>): void;
  clear(): void;
}

/**
 * Vanilla zustand store so the same instance can be consumed via `useStore` in React
 * and read imperatively by the API client's TokenStore.
 */
export function createAuthStore(storage: KeyValueStorage = memoryStorage()) {
  return createStore<AuthState>()(
    persist(
      set => ({
        user: null,
        accessToken: null,
        expiresAt: null,
        status: 'anonymous',
        setSession: session =>
          set({
            user: session.user,
            accessToken: session.accessToken,
            expiresAt: Date.now() + session.expiresIn * 1000,
            status: 'authenticated',
          }),
        setAccessToken: (token, expiresIn) => set({ accessToken: token, expiresAt: Date.now() + expiresIn * 1000 }),
        updateUser: patch => set(s => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
        clear: () => set({ user: null, accessToken: null, expiresAt: null, status: 'anonymous' }),
      }),
      {
        name: STORAGE_KEYS.session,
        storage: createJSONStorage(() => storage),
        // Access token stays in memory per spec; only the user summary is persisted.
        partialize: s => ({ user: s.user, status: s.status }) as Partial<AuthState>,
      },
    ),
  );
}

export type AuthStore = ReturnType<typeof createAuthStore>;
