import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatRelativeTime, useMarkNotificationsRead, useNotifications, type Notification } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { pathFromUrl } from '@/lib/links';
import { useInfiniteList, useRefresh } from '@/lib/data';
import { useTheme } from '@/theme';

const ICON: Record<Notification['type'], keyof typeof Ionicons.glyphMap> = { like: 'heart', comment: 'chatbubble', follow: 'person-add', purchase: 'bag-check', live: 'videocam', order: 'cube', trending: 'trending-up', repost: 'repeat', system: 'shield-checkmark' };

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const q = useNotifications();
  const markRead = useMarkNotificationsRead();
  const { items, loadMore, loadingMore } = useInfiniteList<Notification>(q);
  const { refreshing, onRefresh } = useRefresh(q.refetch);
  const hasUnread = items.some(n => !n.read);

  const open = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id);
    // `href` is a web path (`/orders/o1`, `/post/x`); reuse the deep-link mapper so both surfaces agree.
    const path = n.href ? pathFromUrl(`https://ezyify.app${n.href}`) : null;
    if (path) router.push(path as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Notifications" right={hasUnread ? <Pressable accessibilityRole="button" hitSlop={8} disabled={markRead.isPending} onPress={() => markRead.mutate(undefined)}><Text variant="label" tone="brand">Mark all read</Text></Pressable> : undefined} />
      <FlatList
        data={items}
        keyExtractor={n => n.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          q.isLoading ? (
            <View style={{ paddingHorizontal: 16, gap: 16, paddingTop: 8 }}>
              {[0, 1, 2, 3].map(i => (
                <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Skeleton width={44} height={44} radius={22} />
                  <View style={{ flex: 1, gap: 8 }}><Skeleton width="85%" height={14} /><Skeleton width={60} height={10} /></View>
                </View>
              ))}
            </View>
          ) : q.error ? (
            <ErrorState error={q.error} onRetry={() => q.refetch()} />
          ) : (
            <EmptyState icon="notifications-off-outline" title="You're all caught up" body="Likes, comments, order updates and live alerts land here." />
          )
        }
        ListFooterComponent={loadingMore ? <View style={{ padding: 16 }}><Skeleton height={44} radius={12} /></View> : null}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => open(item)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? colors.muted : item.read ? 'transparent' : colors.primarySubtle })}>
            {item.actor ? (
              <Avatar uri={item.actor.avatarUrl} size={44} />
            ) : (
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: item.type === 'system' ? colors.successSubtle : colors.accentSubtle, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={ICON[item.type]} size={20} color={item.type === 'system' ? colors.success : colors.accent} />
              </View>
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <Text numberOfLines={2}>
                {item.actor && <Text variant="bodyMedium">{item.actor.username} </Text>}
                {item.message}
              </Text>
              <Text variant="caption" tone="tertiary">{formatRelativeTime(item.createdAt)}</Text>
            </View>
            {item.thumbnailUrl && <Avatar uri={item.thumbnailUrl} size={40} />}
            {!item.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />}
          </Pressable>
        )}
      />
    </View>
  );
}
