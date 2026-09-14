import { useCallback, useState } from 'react';
import { Dimensions, FlatList, Pressable, View, type ViewToken } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCompactNumber, formatMoney, type Post } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { IconButton } from '@/components/IconButton';
import { Button } from '@/components/Button';
import { findProduct, loops } from '@/lib/mock';
import { useAppStore } from '@/store/app';
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

function LoopItem({ loop, active }: { loop: Post; active: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const liked = useAppStore(s => s.likedPostIds.includes(loop.id));
  const toggleLike = useAppStore(s => s.toggleLike);
  const followed = useAppStore(s => s.followedIds.includes(loop.author.id));
  const toggleFollow = useAppStore(s => s.toggleFollow);
  const product = loop.taggedProductIds[0] ? findProduct(loop.taggedProductIds[0]) : undefined;
  const m = loop.media[0];

  return (
    <View style={{ width: W, height: H, backgroundColor: '#000' }}>
      <Image source={{ uri: m.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={active ? 200 : 0} />
      <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.75)']} locations={[0, 0.25, 0.55, 1]} style={{ position: 'absolute', inset: 0 }} />

      <View style={{ position: 'absolute', right: 8, bottom: insets.bottom + 120, gap: 22 }}>
        <View style={{ alignItems: 'center' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={`View ${loop.author.name}`} onPress={() => router.push({ pathname: '/profile/[username]', params: { username: loop.author.username } })}>
            <Avatar uri={loop.author.avatarUrl} size={46} ring="story" />
          </Pressable>
          {!followed && (
            <Pressable accessibilityRole="button" accessibilityLabel="Follow" onPress={() => toggleFollow(loop.author.id)} style={{ marginTop: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="add" size={14} color="#fff" />
            </Pressable>
          )}
        </View>
        <Rail icon={liked ? 'heart' : 'heart-outline'} label={formatCompactNumber(loop.engagement.likes + (liked ? 1 : 0))} active={liked} color={colors.error} onPress={() => toggleLike(loop.id)} />
        <Rail icon="chatbubble-ellipses-outline" label={formatCompactNumber(loop.engagement.comments)} />
        <Rail icon="bookmark-outline" label={formatCompactNumber(loop.engagement.saves)} />
        <Rail icon="arrow-redo-outline" label="Share" />
      </View>

      <View style={{ position: 'absolute', left: 16, right: 76, bottom: insets.bottom + 24, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="bodyMedium" style={{ color: '#fff' }}>@{loop.author.username}</Text>
          {loop.author.verified && <Ionicons name="checkmark-circle" size={14} color={colors.primary} />}
          <Text variant="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>· {formatCompactNumber(loop.engagement.views ?? 0)} views</Text>
        </View>
        <Text style={{ color: '#fff' }} numberOfLines={2}>{loop.caption} <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.85)' }}>{loop.hashtags.map(h => `#${h}`).join(' ')}</Text></Text>
        {product && (
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
        )}
      </View>
    </View>
  );
}

export default function LoopsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const start = Math.max(0, loops.findIndex(l => l.id === id));
  const [active, setActive] = useState(start);
  const onViewable = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setActive(viewableItems[0].index);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <FlatList
        data={loops}
        keyExtractor={l => l.id}
        pagingEnabled
        initialScrollIndex={start}
        getItemLayout={(_, i) => ({ length: H, offset: H * i, index: i })}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index }) => <LoopItem loop={item} active={index === active} />}
      />
      <View style={{ position: 'absolute', top: insets.top, left: 8, right: 8, flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon="chevron-back" label="Back" variant="overlay" onPress={() => router.back()} />
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 18 }}>
          <Text variant="label" style={{ color: 'rgba(255,255,255,0.6)' }}>Following</Text>
          <Text variant="label" style={{ color: '#fff' }}>For You</Text>
        </View>
        <IconButton icon="search" label="Search" variant="overlay" onPress={() => router.push('/explore')} />
      </View>
    </View>
  );
}
