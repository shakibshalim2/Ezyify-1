import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'ezyify_live_reminders';
const EVENT = 'liveRemindersUpdated';

type Reminder = { id: string; title: string; at: string | null };

const read = (): Reminder[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((r): r is Reminder => !!r && typeof (r as Reminder).id === 'string') : [];
  } catch {
    return [];
  }
};
let cacheRaw: string | null = null;
let cache: Reminder[] = [];
const snapshot = () => {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* private mode */
  }
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

/**
 * Live-stream reminders are device-local until the API exposes a schedule endpoint. Toggling asks for
 * browser Notification permission once so the reminder can actually fire while the tab is open.
 */
export function useLiveReminders() {
  const list = useSyncExternalStore(subscribe, snapshot, () => []);
  const has = useCallback((id: string) => list.some(r => r.id === id), [list]);
  const toggle = useCallback(
    async (r: Reminder) => {
      const next = list.some(x => x.id === r.id) ? list.filter(x => x.id !== r.id) : [...list, r];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private mode */
      }
      window.dispatchEvent(new Event(EVENT));
      if (next.length > list.length && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        await Notification.requestPermission().catch(() => undefined);
      }
      return next.length > list.length;
    },
    [list],
  );
  return { list, has, toggle };
}
