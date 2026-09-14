import { describe, it, expect } from 'vitest';
import { createAuthStore } from './auth.js';
import { memoryStorage, webStorage, STORAGE_KEYS } from './storage.js';

const session = {
  accessToken: 'at',
  refreshToken: 'rt',
  expiresIn: 900,
  user: { id: 'u1', username: 'maya', name: 'Maya', avatarUrl: null, verified: true, role: 'creator' as const },
};

describe('auth store', () => {
  it('starts anonymous and becomes authenticated on setSession', () => {
    const store = createAuthStore(memoryStorage());
    expect(store.getState().status).toBe('anonymous');
    store.getState().setSession(session);
    const s = store.getState();
    expect(s.status).toBe('authenticated');
    expect(s.accessToken).toBe('at');
    expect(s.expiresAt).toBeGreaterThan(Date.now());
  });

  it('never persists the access token — only user + status (spec: memory-only)', async () => {
    const storage = memoryStorage();
    const store = createAuthStore(storage);
    store.getState().setSession(session);
    await new Promise(r => setTimeout(r, 0));
    const raw = storage.getItem(STORAGE_KEYS.session) as string;
    expect(raw).toContain('"maya"');
    expect(raw).not.toContain('"at"');
    expect(raw).not.toContain('accessToken');
  });

  it('rotates the access token and patches the user without touching the rest', () => {
    const store = createAuthStore(memoryStorage());
    store.getState().setSession(session);
    store.getState().setAccessToken('at2', 60);
    store.getState().updateUser({ name: 'Maya C.' });
    expect(store.getState().accessToken).toBe('at2');
    expect(store.getState().user?.name).toBe('Maya C.');
    expect(store.getState().user?.username).toBe('maya');
  });

  it('clear() resets to anonymous', () => {
    const store = createAuthStore(memoryStorage());
    store.getState().setSession(session);
    store.getState().clear();
    expect(store.getState()).toMatchObject({ user: null, accessToken: null, expiresAt: null, status: 'anonymous' });
  });
});

describe('webStorage', () => {
  it('round-trips through localStorage when available', () => {
    const map = new Map<string, string>();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
    const s = webStorage();
    s.setItem('k', 'v');
    expect(s.getItem('k')).toBe('v');
    s.removeItem('k');
    expect(s.getItem('k')).toBeNull();
  });

  it('swallows quota / private-mode errors instead of crashing the app', () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {
        throw new Error('SecurityError');
      },
    };
    const s = webStorage();
    expect(() => s.setItem('k', 'v')).not.toThrow();
    expect(s.getItem('k')).toBeNull();
    expect(() => s.removeItem('k')).not.toThrow();
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });
});
