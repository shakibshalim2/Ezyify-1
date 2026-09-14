/** Web storage helper — thin sync facade over the shared core keys so existing callers keep working. */
import { STORAGE_KEYS as CORE_KEYS } from '@ezyify/core/stores';

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  ...CORE_KEYS,
  user: 'ezyify_user',
} as const;
