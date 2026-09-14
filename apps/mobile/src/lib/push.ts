import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type { Endpoints } from '@ezyify/core';

/** Foreground presentation: banner + sound, list entry, no badge spam. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const CHANNELS = {
  orders: { id: 'orders', name: 'Order updates', importance: Notifications.AndroidImportance.HIGH },
  social: { id: 'social', name: 'Likes, comments & follows', importance: Notifications.AndroidImportance.DEFAULT },
  messages: { id: 'messages', name: 'Messages', importance: Notifications.AndroidImportance.MAX },
  live: { id: 'live', name: 'Live drops', importance: Notifications.AndroidImportance.HIGH },
  promos: { id: 'promos', name: 'Deals & promotions', importance: Notifications.AndroidImportance.LOW },
} as const;

async function ensureChannels() {
  if (Platform.OS !== 'android') return;
  await Promise.all(
    Object.values(CHANNELS).map(c =>
      Notifications.setNotificationChannelAsync(c.id, { name: c.name, importance: c.importance, vibrationPattern: [0, 200, 100, 200], lightColor: '#0f66c7' }),
    ),
  );
}

export type PushStatus = 'granted' | 'denied' | 'unsupported';

/**
 * Asks for POST_NOTIFICATIONS (Android 13+), creates channels and returns the native FCM token.
 * Never called automatically at launch — Play policy prefers a contextual prompt.
 */
export async function requestPush(): Promise<{ status: PushStatus; token: string | null }> {
  if (!Device.isDevice || Platform.OS === 'web') return { status: 'unsupported', token: null };
  await ensureChannels();
  const current = await Notifications.getPermissionsAsync();
  const perm = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!perm.granted) return { status: 'denied', token: null };
  const { data } = await Notifications.getDevicePushTokenAsync();
  return { status: 'granted', token: typeof data === 'string' ? data : null };
}

export async function registerPushWithApi(endpoints: Endpoints, token: string) {
  await endpoints.notifications.registerDevice({
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    provider: Platform.OS === 'ios' ? 'apns' : 'fcm',
    appVersion: Constants.expoConfig?.version ?? '0.0.0',
  });
}

/** Deep link carried in the payload (`{ "url": "ezyify://orders" }` or a data key), if any. */
export function notificationUrl(n: Notifications.Notification | null | undefined): string | null {
  const data = n?.request.content.data as Record<string, unknown> | undefined;
  const url = data?.url ?? data?.href;
  return typeof url === 'string' ? url : null;
}
