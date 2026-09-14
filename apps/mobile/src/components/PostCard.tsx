import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, Share, View } from 'react-native';
import { choose } from '@/lib/confirm';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { formatCompactNumber, formatMoney, formatRelativeTime, useAuth, useBlockUser, useProduct, useToggleLike, useToggleSave, type Post } from '@ezyify/core';
import { Avatar } from './Avatar';
import { Text } from './Text';
import { IconButton } from './IconButton';
import { shareUrl } from '@/lib/links';
import { useTheme } from '@/theme';

const W = Dimensions.get('window').width;

/** Tagged-product chip; fetched lazily so a feed page never blocks on the catalog. */
function ProductTag({ productId }: { productId: string }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { data: product } = useProduct(productId);
  if (!product) return null;
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`Shop ${product.name}`} onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} style={{ position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(10,13,20,0.72)', borderRadius: radius.pill, paddingRight: 12, paddingLeft: 4, height: 40 }}>
      <Image source={{ uri: product.imageUrl }} style={{ width: 32, height: 32, borderRadius: 16 }} />
      <View>
        <Text variant="caption" style={{ color: '#fff' }} numberOfLines={1}>{product.name.length > 22 ? product.name.slice(0, 22) + '…' : product.name}</Text>
        <Text variant="caption" style={{ color: colors.accent, fontFamily: 'Inter_600SemiBold' }}>{formatMoney(product.price)}</Text>
      </View>
      <Ionicons name="bag-handle" size={14} color="#fff" />
    </Pressable>
  );
}

export function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const authed = useAuth(s => s.status === 'authenticated');
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const block = useBlockUser();
  const liked = post.engagement.isLiked;
  const saved = post.engagement.isSaved;
  const [page, setPage] = useState(0);
  const heart = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.get() }] }));

  const requireAuth = () => {
    if (authed) return true;
    router.push('/(auth)/login');
    return false;
  };
  const like = () => {
    if (!requireAuth()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    heart.set(withSequence(withSpring(1.35, { stiffness: 500, damping: 12 }), withSpring(1)));
    toggleLike.mutate({ id: post.id, liked });
  };
  const save = () => {
    if (!requireAuth()) return;
    toggleSave.mutate({ id: post.id, saved });
  };
  const more = () =>
    choose(post.author.name, [
      { label: 'Report post', destructive: true, onPress: () => router.push({ pathname: '/report', params: { type: 'post', id: post.id, user: post.author.id } }) },
      { label: `Block @${post.author.username}`, destructive: true, onPress: () => requireAuth() && block.mutate({ userId: post.author.id, blocked: false }) },
      { label: 'Copy link', onPress: () => Share.share({ message: shareUrl(`/post/${post.id}`) }) },
    ]);

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderSubtle }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`View ${post.author.name}'s profile`} onPress={() => router.push({ pathname: '/profile/[username]', params: { username: post.author.username } })} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar uri={post.author.avatarUrl} size={40} verified={post.author.verified} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">{post.author.name}</Text>
            <Text variant="caption" tone="secondary">
              {post.location ? `${post.location} · ` : ''}{formatRelativeTime(post.createdAt)}
            </Text>
          </View>
        </Pressable>
        <IconButton icon="ellipsis-horizontal" label="More options" onPress={more} />
      </View>

      <View>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={e => setPage(Math.round(e.nativeEvent.contentOffset.x / (W - 32)))}>
          {post.media.map(m => (
            <Pressable key={m.url} onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })} style={{ width: W - 32, aspectRatio: 4 / 5 }}>
              <Image source={{ uri: m.thumbnailUrl && m.type === 'video' ? m.thumbnailUrl : m.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
            </Pressable>
          ))}
        </ScrollView>
        {post.media.length > 1 && (
          <View style={{ position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 4 }}>
            {post.media.map((m, i) => <View key={m.url} style={{ width: i === page ? 14 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? '#fff' : 'rgba(255,255,255,0.6)' }} />)}
          </View>
        )}
        {post.taggedProductIds[0] && <ProductTag productId={post.taggedProductIds[0]} />}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingTop: 2 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={liked ? 'Unlike' : 'Like'} accessibilityState={{ selected: liked }} onPress={like} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 44, paddingHorizontal: 10 }}>
          <Animated.View style={heartStyle}><Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? colors.error : colors.foreground} /></Animated.View>
          <Text variant="label">{formatCompactNumber(post.engagement.likes)}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Comments" onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 44, paddingHorizontal: 10 }}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.foreground} />
          <Text variant="label">{formatCompactNumber(post.engagement.comments)}</Text>
        </Pressable>
        <IconButton icon="paper-plane-outline" label="Share" onPress={() => Share.share({ message: `${post.author.name} on Ezyify`, url: shareUrl(`/post/${post.id}`) })} />
        <View style={{ flex: 1 }} />
        <IconButton icon={saved ? 'bookmark' : 'bookmark-outline'} label={saved ? 'Unsave' : 'Save'} color={saved ? colors.primary : undefined} onPress={save} />
      </View>

      <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 4 }}>
        <Text numberOfLines={3}>
          <Text variant="bodyMedium">{post.author.username} </Text>
          {post.caption}
        </Text>
        {post.hashtags.length > 0 && <Text variant="caption" tone="brand">{post.hashtags.map(h => `#${h}`).join(' ')}</Text>}
      </View>
    </View>
  );
}
