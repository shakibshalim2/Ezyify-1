/** Small typed wrapper over localStorage that never throws (private mode, SSR, quota). */
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
  onboardingSeen: 'ezyify.onboarding.seen',
  splashShownAt: 'ezyify.splash.shownAt',
  theme: 'ezyify-theme',
  user: 'ezyify_user',
} as const;
