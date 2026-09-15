import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConversations, useFeed, useLiveSessions, useUnreadCount, type Post } from '@ezyify/core';
import { Text } from '@/components/Text';
import { IconButton } from '@/components/IconButton';
import { BrandMark, BrandWordmark } from '@/components/BrandMark';
import { StoriesRail } from '@/components/StoriesRail';
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/QueryState';
import { LiveSessionCard } from '@/components/LiveSessionCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useBadgeCount, useInfiniteList, useRefresh } from '@/lib/data';
import { useTheme } from '@/theme';

function PostSkeleton() {
  const { colors, radius } = useTheme();
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.card, padding: 12, gap: 12, borderWidth: 1, borderColor: colors.borderSubtle }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Skeleton width={40} height={40} radius={20} />
        <View style={{ gap: 6 }}><Skeleton width={120} height={14} /><Skeleton width={80} height={10} /></View>
      </View>
      <Skeleton height={340} radius={12} />
      <Skeleton width="70%" height={12} />
    </View>
  );
}

function CountBadge({ count }: { count: number | undefined }) {
  const { colors } = useTheme();
  if (!count) return null;
  return (
    <View style={{ position: 'absolute', top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
      <Text variant="caption" style={{ color: colors.accentForeground, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const cartCount = useBadgeCount();
  const unread = useUnreadCount();
  const convos = useConversations();
  const unreadMessages = convos.data?.reduce((n, c) => n + c.unreadCount, 0) ?? 0;
  const feed = useFeed();
  const live = useLiveSessions({ status: 'live', pageSize: 6 });
  const { items, loadMore, loadingMore } = useInfiniteList<Post>(feed);
  const { refreshing, onRefresh } = useRefresh(feed.refetch);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top, height: insets.top + 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 }}>
        <BrandMark size={30} />
        <BrandWordmark size={22} />
        <View style={{ flex: 1 }} />
        <View>
          <IconButton icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
          <CountBadge count={unread.data} />
        </View>
        <View>
          <IconButton icon="chatbubble-ellipses-outline" label="Messages" onPress={() => router.push('/messages')} />
          <CountBadge count={unreadMessages} />
        </View>
        <View>
          <IconButton icon="bag-handle-outline" label="Cart" onPress={() => router.push('/cart')} />
          <CountBadge count={cartCount} />
        </View>
      </View>
      <FlatList
        data={items}
        keyExtractor={p => p.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={{ paddingVertical: 8, gap: 16 }}>
            <StoriesRail />
            {(live.data?.items.length ?? 0) > 0 ? (
              <View style={{ gap: 10 }}>
                <SectionHeader title="Live now" actionLabel="See all" onAction={() => router.push('/live')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {live.data!.items.map(session => <LiveSessionCard key={session.id} session={session} width={228} />)}
                </ScrollView>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          feed.isLoading ? (
            <View style={{ gap: 12 }}><PostSkeleton /><PostSkeleton /></View>
          ) : feed.error ? (
            <ErrorState error={feed.error} onRetry={() => feed.refetch()} />
          ) : (
            <EmptyState icon="sparkles-outline" title="Your feed is quiet" body="Follow a few creators and their posts will show up here." actionLabel="Explore" onAction={() => router.push('/(tabs)/explore')} />
          )
        }
        ListFooterComponent={loadingMore ? <PostSkeleton /> : null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        contentContainerStyle={{ paddingBottom: 24, gap: 12, paddingHorizontal: 16 }}
        renderItem={({ item }) => <PostCard post={item} />}
        removeClippedSubviews
      />
    </View>
  );
}
