import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Pressable, Share, View, type ViewToken } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCompactNumber, formatMoney, useAuth, useLoops, useProduct, useProfile, useToggleFollow, useToggleLike, useToggleSave, type Post } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { IconButton } from '@/components/IconButton';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/QueryState';
import { useInfiniteList } from '@/lib/data';
import { shareUrl, goBack } from '@/lib/links';
import { useTheme } from '@/theme';

const { width: W, height: H } = Dimensions.get('window');

function Rail({ icon, label, onPress, active, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; active?: boolean; color?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ alignItems: 'center', gap: 2, width: 52 }}>
      <Ionicons name={icon} size={30} color={active ? color ?? '#fff' : '#fff'} />
      <Text variant="caption" style={{ color: '#fff', fontFamily: 'Inter_600SemiBold' }}>{label}</Text>
    </Pressable>
  );
}

function FeaturedProduct({ productId }: { productId: string }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { data: product } = useProduct(productId);
  if (!product) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.25)', borderWidth: 1, borderRadius: radius.card, padding: 8 }}>
      <Pressable accessibilityRole="link" accessibilityLabel={product.name} onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Image source={{ uri: product.imageUrl }} style={{ width: 48, height: 48, borderRadius: radius.sm }} />
        <View style={{ flex: 1 }}>
          <Text variant="caption" style={{ color: 'rgba(255,255,255,0.75)' }}>Featured product</Text>
          <Text variant="bodyMedium" style={{ color: '#fff' }} numberOfLines={1}>{product.name}</Text>
          <Text variant="label" style={{ color: colors.accent }}>{formatMoney(product.price)}</Text>
        </View>
      </Pressable>
      <Button label="Buy" variant="accent" size="sm" onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} />
    </View>
  );
}

function LoopItem({ loop, active }: { loop: Post; active: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const authed = useAuth(s => s.status === 'authenticated');
  const me = useAuth(s => s.user);
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const toggleFollow = useToggleFollow();
  // Only fetch the author's follow state for the visible loop to keep the vertical pager cheap.
  const author = useProfile(active && authed && me?.id !== loop.author.id ? loop.author.username : undefined);
  const liked = loop.engagement.isLiked;
  const saved = loop.engagement.isSaved;
  const followed = author.data?.isFollowing ?? true;
  const gate = () => (authed ? true : (router.push('/(auth)/login'), false));
  const m = loop.media[0];

  return (
    <View style={{ width: W, height: H, backgroundColor: '#000' }}>
      <Image source={{ uri: m.type === 'video' && m.thumbnailUrl ? m.thumbnailUrl : m.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={active ? 200 : 0} />
      <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.75)']} locations={[0, 0.25, 0.55, 1]} style={{ position: 'absolute', inset: 0 }} />

      <View style={{ position: 'absolute', right: 8, bottom: insets.bottom + 120, gap: 22 }}>
        <View style={{ alignItems: 'center' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={`View ${loop.author.name}`} onPress={() => router.push({ pathname: '/profile/[username]', params: { username: loop.author.username } })}>
            <Avatar uri={loop.author.avatarUrl} name={loop.author.name} size={46} ring="story" />
          </Pressable>
          {!followed && (
            <Pressable accessibilityRole="button" accessibilityLabel={`Follow ${loop.author.username}`} onPress={() => gate() && toggleFollow.mutate({ username: loop.author.username, following: false })} style={{ marginTop: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="add" size={14} color="#fff" />
            </Pressable>
          )}
        </View>
        <Rail icon={liked ? 'heart' : 'heart-outline'} label={formatCompactNumber(loop.engagement.likes)} active={liked} color={colors.error} onPress={() => gate() && toggleLike.mutate({ id: loop.id, liked })} />
        <Rail icon="chatbubble-ellipses-outline" label={formatCompactNumber(loop.engagement.comments)} onPress={() => router.push({ pathname: '/post/[id]', params: { id: loop.id } })} />
        <Rail icon={saved ? 'bookmark' : 'bookmark-outline'} label={formatCompactNumber(loop.engagement.saves)} active={saved} color={colors.primary} onPress={() => gate() && toggleSave.mutate({ id: loop.id, saved })} />
        <Rail icon="arrow-redo-outline" label="Share" onPress={() => Share.share({ message: `${loop.author.name} on Ezyify`, url: shareUrl(`/loops/${loop.id}`) })} />
      </View>

      <View style={{ position: 'absolute', left: 16, right: 76, bottom: insets.bottom + 24, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="bodyMedium" style={{ color: '#fff' }}>@{loop.author.username}</Text>
          {loop.author.verified && <Ionicons name="checkmark-circle" size={14} color={colors.primary} />}
          <Text variant="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>· {formatCompactNumber(loop.engagement.views ?? 0)} views</Text>
        </View>
        <Text style={{ color: '#fff' }} numberOfLines={2}>{loop.caption} <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.85)' }}>{loop.hashtags.map(h => `#${h}`).join(' ')}</Text></Text>
        {loop.taggedProductIds[0] && <FeaturedProduct productId={loop.taggedProductIds[0]} />}
      </View>
    </View>
  );
}

export default function LoopsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const query = useLoops();
  const { items, loadMore } = useInfiniteList<Post>(query);
  // Deep-linked loop first, then the rest of the feed in order.
  const loops = useMemo(() => (id && items.some(l => l.id === id) ? [items.find(l => l.id === id)!, ...items.filter(l => l.id !== id)] : items), [items, id]);
  const [active, setActive] = useState(0);
  const onViewable = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setActive(viewableItems[0].index);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      {query.isLoading && !loops.length && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#fff" /></View>}
      {query.error && !loops.length && <View style={{ flex: 1, justifyContent: 'center' }}><ErrorState error={query.error} onRetry={() => query.refetch()} /></View>}
      {!query.isLoading && !query.error && !loops.length && <View style={{ flex: 1, justifyContent: 'center' }}><EmptyState icon="play-outline" title="No loops yet" body="Short shoppable videos from creators you follow will play here." /></View>}
      <FlatList
        data={loops}
        keyExtractor={l => l.id}
        pagingEnabled
        onEndReached={loadMore}
        onEndReachedThreshold={2}
        getItemLayout={(_, i) => ({ length: H, offset: H * i, index: i })}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index }) => <LoopItem loop={item} active={index === active} />}
      />
      <View style={{ position: 'absolute', top: insets.top, left: 8, right: 8, flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon="chevron-back" label="Back" variant="overlay" onPress={() => goBack(router)} />
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 18 }}>
          <Text variant="label" style={{ color: 'rgba(255,255,255,0.6)' }}>Following</Text>
          <Text variant="label" style={{ color: '#fff' }}>For You</Text>
        </View>
        <IconButton icon="search" label="Search" variant="overlay" onPress={() => router.push('/explore')} />
      </View>
    </View>
  );
}
