import { ScrollView, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationPreferences, useUpdateNotificationPreferences, type NotificationCategory } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useTheme } from '@/theme';

const CATEGORIES: { key: NotificationCategory; label: string; body: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'orders', label: 'Orders & escrow', body: 'Paid, shipped, delivered, refunds, escrow releases', icon: 'cube-outline' },
  { key: 'messages', label: 'Messages', body: 'New chats from buyers, sellers and creators', icon: 'chatbubble-outline' },
  { key: 'social', label: 'Likes, comments & follows', body: 'Activity on your posts and profile', icon: 'heart-outline' },
  { key: 'live', label: 'Live drops', body: 'Reminders and go-live alerts', icon: 'radio-outline' },
  { key: 'promos', label: 'Deals & promotions', body: 'Sales, coupons and picks', icon: 'flash-outline' },
];

/** Mirrors the web page: per-category push/email opt-ins stored server-side; the API gates FCM on the same document. */
export default function NotificationSettingsScreen() {
  const { colors, radius } = useTheme();
  const prefs = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Notifications" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text variant="caption" tone="secondary">Choose what reaches you, per channel. Sign-in and security alerts are always sent. On Android these map to the app’s notification channels.</Text>
        {prefs.isLoading ? (
          CATEGORIES.map(c => <Skeleton key={c.key} height={84} radius={radius.md} />)
        ) : prefs.isError || !prefs.data ? (
          <ErrorState error={prefs.error} onRetry={() => prefs.refetch()} />
        ) : (
          <View style={{ backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }}>
            {CATEGORIES.map((c, i) => {
              const row = prefs.data![c.key];
              return (
                <View key={c.key} style={{ padding: 14, gap: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={c.icon} size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="label">{c.label}</Text>
                      <Text variant="caption" tone="secondary">{c.body}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 20, paddingLeft: 48 }}>
                    {(['push', 'email'] as const).map(channel => (
                      <View key={channel} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text variant="caption" tone="secondary">{channel === 'push' ? 'Push' : 'Email'}</Text>
                        <Switch
                          accessibilityLabel={`${c.label} ${channel}`}
                          value={row[channel]}
                          onValueChange={v => update.mutate({ [c.key]: { [channel]: v } })}
                          trackColor={{ true: colors.primary, false: colors.border }}
                          thumbColor="#fff"
                        />
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
