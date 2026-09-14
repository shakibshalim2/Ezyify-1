/** Minimal async KV the stores persist through — localStorage on web, SecureStore/AsyncStorage on native. */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

export const memoryStorage = (): KeyValueStorage => {
  const map = new Map<string, string>();
  return {
    getItem: k => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: k => void map.delete(k),
  };
};

/** Web default: swallows quota/private-mode errors so a broken localStorage never breaks the app. */
export const webStorage = (): KeyValueStorage => ({
  getItem: k => {
    try {
      return globalThis.localStorage?.getItem(k) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (k, v) => {
    try {
      globalThis.localStorage?.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
  removeItem: k => {
    try {
      globalThis.localStorage?.removeItem(k);
    } catch {
      /* ignore */
    }
  },
});

export const STORAGE_KEYS = {
  session: 'ezyify.session',
  cart: 'ezyify.cart',
  onboardingSeen: 'ezyify.onboarding.seen',
  splashShownAt: 'ezyify.splash.shownAt',
  theme: 'ezyify-theme',
} as const;
