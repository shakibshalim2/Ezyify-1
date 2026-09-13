import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartCount } from '@ezyify/core';
import { Text } from '@/components/Text';
import { IconButton } from '@/components/IconButton';
import { BrandMark, BrandWordmark } from '@/components/BrandMark';
import { StoriesRail } from '@/components/StoriesRail';
import { PostCard } from '@/components/PostCard';
import { Skeleton } from '@/components/Skeleton';
import { posts } from '@/lib/mock';
import { useAppStore } from '@/store/app';
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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const cartCount = useCartCount();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const blocked = useAppStore(s => s.blockedIds);
  const feed = posts.filter(p => !blocked.includes(p.author.id));

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top, height: insets.top + 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 }}>
        <BrandMark size={30} />
        <BrandWordmark size={22} />
        <View style={{ flex: 1 }} />
        <IconButton icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
        <View>
          <IconButton icon="bag-handle-outline" label="Cart" onPress={() => router.push('/cart')} />
          {cartCount > 0 && (
            <View style={{ position: 'absolute', top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
              <Text variant="caption" style={{ color: colors.accentForeground, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>{cartCount}</Text>
            </View>
          )}
        </View>
      </View>
      <FlatList
        data={loading ? [] : feed}
        keyExtractor={p => p.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        ListHeaderComponent={<View style={{ paddingVertical: 8 }}><StoriesRail /></View>}
        ListEmptyComponent={<View style={{ paddingHorizontal: 16, gap: 12 }}><PostSkeleton /><PostSkeleton /></View>}
        contentContainerStyle={{ paddingBottom: 24, gap: 12, paddingHorizontal: 16 }}
        renderItem={({ item }) => <PostCard post={item} />}
        onScrollBeginDrag={() => setLoading(false)}
        removeClippedSubviews
      />
    </View>
  );
}
