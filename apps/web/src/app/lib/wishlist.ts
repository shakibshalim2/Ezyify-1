import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'ezyify_wishlist';
const EVENT = 'wishlistUpdated';

const read = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
};
let cache = read();
let cacheRaw: string | null = null;
const snapshot = () => {
  const raw = (() => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  })();
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cache = read();
  }
  return cache;
};
const subscribe = (cb: () => void) => {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(EVENT, cb);
  };
};

/** Wishlist is device-local for now (no API endpoint yet); shared across tabs through `storage` events. */
export function useWishlist() {
  const ids = useSyncExternalStore(subscribe, snapshot, () => []);
  const toggle = useCallback((id: string) => {
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event(EVENT));
  }, [ids]);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, has, toggle };
}
