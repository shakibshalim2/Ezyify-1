import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const REMINDERS_KEY = 'ezyify.live.reminders';
type ReminderStore = Record<string, string | null>;

function parseStore(value: string | null): ReminderStore {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string | null] => typeof entry[1] === 'string' || entry[1] === null));
  } catch {
    return {};
  }
}

async function save(store: ReminderStore) {
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(store));
}

/** Stores stream reminders locally and schedules a notification five minutes before a stream. */
export function useLiveReminders() {
  const [reminders, setReminders] = useState<ReminderStore>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(REMINDERS_KEY).then(value => {
      if (active) {
        setReminders(parseStore(value));
        setReady(true);
      }
    }).catch(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const has = useCallback((id: string) => id in reminders, [reminders]);

  const toggle = useCallback(async ({ id, title, scheduledFor }: { id: string; title: string; scheduledFor: string | null }) => {
    if (id in reminders) {
      const notificationId = reminders[id];
      if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => undefined);
      const next = { ...reminders };
      delete next[id];
      setReminders(next);
      await save(next);
      return false;
    }

    let notificationId: string | null = null;
    const startsAt = scheduledFor ? new Date(scheduledFor) : null;
    const remindAt = startsAt ? new Date(startsAt.getTime() - 5 * 60 * 1000) : null;
    if (remindAt && remindAt.getTime() > Date.now()) {
      const permissions = await Notifications.getPermissionsAsync();
      const granted = permissions.granted || (await Notifications.requestPermissionsAsync()).granted;
      if (granted) {
        notificationId = await Notifications.scheduleNotificationAsync({
          content: { title: 'Your live shopping reminder', body: `${title} starts in 5 minutes.`, sound: 'default', data: { url: `https://ezyify.app/live/${id}` } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: remindAt },
        });
      }
    }
    const next = { ...reminders, [id]: notificationId };
    setReminders(next);
    await save(next);
    return true;
  }, [reminders]);

  return { has, ready, toggle };
}
