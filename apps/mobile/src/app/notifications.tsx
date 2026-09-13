import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatRelativeTime, type Notification } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { users } from '@/lib/mock';
import { useTheme } from '@/theme';

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const items: Notification[] = [
  { id: 'n1', type: 'order', actor: null, message: 'Your Leather Everyday Backpack is out for delivery.', href: '/orders', thumbnailUrl: null, read: false, createdAt: ago(0.5) },
  { id: 'n2', type: 'like', actor: users[0], message: 'liked your post.', href: '/post/post-001', thumbnailUrl: null, read: false, createdAt: ago(2) },
  { id: 'n3', type: 'follow', actor: users[5], message: 'started following you.', href: '/profile/noor.travels', thumbnailUrl: null, read: true, createdAt: ago(6) },
  { id: 'n4', type: 'live', actor: users[1], message: 'is live now: Desk setup Q&A', href: '/loops', thumbnailUrl: null, read: true, createdAt: ago(9) },
  { id: 'n5', type: 'comment', actor: users[3], message: 'commented: "Need this in my life"', href: '/post/post-001', thumbnailUrl: null, read: true, createdAt: ago(26) },
  { id: 'n6', type: 'system', actor: null, message: 'Escrow released for order #EZ-10422 — thanks for confirming delivery.', href: '/wallet', thumbnailUrl: null, read: true, createdAt: ago(50) },
];
const ICON: Record<Notification['type'], keyof typeof Ionicons.glyphMap> = { like: 'heart', comment: 'chatbubble', follow: 'person-add', purchase: 'bag-check', live: 'videocam', order: 'cube', trending: 'trending-up', repost: 'repeat', system: 'shield-checkmark' };

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Notifications" right={<Pressable accessibilityRole="button" hitSlop={8}><Text variant="label" tone="brand">Mark all read</Text></Pressable>} />
      <FlatList
        data={items}
        keyExtractor={n => n.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="You're all caught up" body="Likes, comments, order updates and live alerts land here." />}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => item.href && router.push(item.href as never)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? colors.muted : item.read ? 'transparent' : colors.primarySubtle })}>
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
            {!item.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />}
          </Pressable>
        )}
      />
    </View>
  );
}
