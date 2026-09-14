import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { formatMoney, formatRelativeTime, queryKeys, useApi, useAuth, useProduct, useStories, useToggleLike, type Post } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { IconButton } from '@/components/IconButton';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/QueryState';
import { groupStories } from '@/components/StoriesRail';
import { useTheme } from '@/theme';

const { width: W } = Dimensions.get('window');
const IMAGE_MS = 5000;

function StoryProduct({ productId }: { productId: string }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { data: product } = useProduct(productId);
  if (!product) return null;
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`Shop ${product.name}`} onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radius.card, padding: 8, marginBottom: 12 }}>
      <Image source={{ uri: product.imageUrl }} style={{ width: 44, height: 44, borderRadius: radius.sm }} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ color: '#0A0D14' }} numberOfLines={1}>{product.name}</Text>
        <Text variant="label" style={{ color: colors.primary }}>{formatMoney(product.price)}</Text>
      </View>
      <Button label="Shop" size="sm" variant="primary" onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} />
    </Pressable>
  );
}

/** `id` is the author's user id (one ring per author); frames are that author's active stories, oldest first. */
export default function StoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const authed = useAuth(s => s.status === 'authenticated');
  const stories = useStories();
  const groups = useMemo(() => groupStories(stories.data), [stories.data]);
  const gi = Math.max(0, groups.findIndex(g => g.user.id === id));
  const [g, setG] = useState(gi);
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const group = groups[g];
  const frame: Post | undefined = group?.items[i];
  const toggleLike = useToggleLike();
  const api = useApi();
  const qc = useQueryClient();
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<unknown>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'));
  const next = () => {
    setProgress(0);
    if (group && i < group.items.length - 1) setI(i + 1);
    else if (g < groups.length - 1) {
      setG(g + 1);
      setI(0);
    } else close();
  };
  const prev = () => {
    setProgress(0);
    if (i > 0) setI(i - 1);
    else if (g > 0) {
      setG(g - 1);
      setI(0);
    } else close();
  };

  useEffect(() => {
    if (!frame || paused) return;
    const duration = frame.media[0].durationMs ?? IMAGE_MS;
    const started = Date.now() - progress * duration;
    const t = setInterval(() => {
      const p = (Date.now() - started) / duration;
      if (p >= 1) {
        clearInterval(t);
        next();
      } else setProgress(p);
    }, 50);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame?.id, paused]);

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !group) return;
    if (!authed) return router.push('/(auth)/login');
    setSending(true);
    setSendError(null);
    try {
      // Replies land in the 1:1 thread with the author (find-or-create), same as web.
      const { id: cid } = await api.messaging.start(group.user.username);
      await api.messaging.send(cid, { text });
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
      setReply('');
      setSent(true);
      setTimeout(() => setSent(false), 1500);
    } catch (e) {
      setSendError(e);
    } finally {
      setSending(false);
    }
  };

  if (stories.isLoading) return <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#fff" /></View>;
  if (stories.error) return <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}><ErrorState error={stories.error} onRetry={() => stories.refetch()} /><Button label="Close" variant="ghost" onPress={close} /></View>;
  if (!group || !frame) return <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}><EmptyState icon="time-outline" title="Story expired" body="Stories disappear after 24 hours." actionLabel="Back" onAction={close} /></View>;

  const m = frame.media[0];
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <Image source={{ uri: m.type === 'video' && m.thumbnailUrl ? m.thumbnailUrl : m.url }} style={{ position: 'absolute', inset: 0 }} contentFit="cover" transition={150} />
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']} locations={[0, 0.2, 0.7, 1]} style={{ position: 'absolute', inset: 0 }} />
      <Pressable accessibilityLabel="Previous" onPress={prev} onLongPress={() => setPaused(true)} onPressOut={() => setPaused(false)} style={{ position: 'absolute', left: 0, top: 120, bottom: 140, width: W * 0.3 }} />
      <Pressable accessibilityLabel="Next" onPress={next} onLongPress={() => setPaused(true)} onPressOut={() => setPaused(false)} style={{ position: 'absolute', right: 0, top: 120, bottom: 140, width: W * 0.7 }} />

      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 10, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {group.items.map((f, k) => (
            <View key={f.id} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' }}>
              <View style={{ width: k < i ? '100%' : k === i ? `${Math.min(progress, 1) * 100}%` : '0%', height: '100%', backgroundColor: '#fff' }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 }}>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: group.user.username } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <Avatar uri={group.user.avatarUrl} size={36} verified={group.user.verified} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" style={{ color: '#fff' }}>{group.user.username}</Text>
              <Text variant="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>{formatRelativeTime(frame.createdAt)}</Text>
            </View>
          </Pressable>
          <IconButton icon="close" label="Close" variant="overlay" onPress={close} />
        </View>
      </View>

      <View style={{ position: 'absolute', left: 12, right: 12, bottom: insets.bottom + 12 }}>
        {frame.caption ? <Text style={{ color: '#fff', marginBottom: 12, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 }}>{frame.caption}</Text> : null}
        {frame.taggedProductIds[0] && <StoryProduct productId={frame.taggedProductIds[0]} />}
        {sendError ? <View style={{ marginBottom: 8 }}><ErrorState compact error={sendError} onRetry={sendReply} /></View> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SearchBar placeholder={sent ? 'Sent ✓' : `Reply to ${group.user.username}…`} value={reply} onChangeText={setReply} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onSubmitEditing={sendReply} returnKeyType="send" />
          </View>
          <IconButton icon={frame.engagement.isLiked ? 'heart' : 'heart-outline'} label={frame.engagement.isLiked ? 'Unlike story' : 'Like story'} variant="overlay" color={frame.engagement.isLiked ? colors.error : undefined} onPress={() => (authed ? toggleLike.mutate({ id: frame.id, liked: frame.engagement.isLiked }) : router.push('/(auth)/login'))} />
          <IconButton icon="paper-plane-outline" label="Send reply" variant="overlay" disabled={!reply || sending} onPress={sendReply} />
        </View>
      </View>
    </View>
  );
}
