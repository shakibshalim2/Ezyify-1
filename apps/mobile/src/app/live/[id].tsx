import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Share, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError, formatCompactNumber, formatMoney, formatTimeUntil, useApi, useAuth, useLiveHeartbeat, useLiveSession, useProduct } from '@ezyify/core';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { Skeleton } from '@/components/Skeleton';
import { Text } from '@/components/Text';
import { useAddLine } from '@/lib/data';
import { goBack, shareUrl } from '@/lib/links';
import { useLiveReminders } from '@/lib/reminders';
import { useTheme } from '@/theme';

type TokenState = { room: string; status: 'connected' | 'unavailable' } | null;

function ActionRail({ icon, label, onPress, testID, active }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; testID?: string; active?: boolean }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ width: 56, alignItems: 'center', gap: 4, opacity: pressed ? 0.72 : 1 })}>
      <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? 'rgba(237, 61, 88, 0.92)' : 'rgba(0,0,0,0.42)' }}>
        <Ionicons name={icon} size={25} color="#fff" />
      </View>
      <Text variant="caption" style={{ color: '#fff', fontFamily: 'Inter_600SemiBold' }}>{label}</Text>
    </Pressable>
  );
}

function StreamProductRow({ productId, pinned, onAdded }: { productId: string; pinned: boolean; onAdded: (name: string) => void }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { add, pending } = useAddLine();
  const product = useProduct(productId);
  const [added, setAdded] = useState(false);
  const p = product.data;
  if (product.isLoading) return <Skeleton height={82} radius={radius.md} />;
  if (!p) return null;
  const buy = async () => {
    await add(p.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAdded(true);
    onAdded(`${p.name} added to cart`);
    setTimeout(() => setAdded(false), 1200);
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 9, backgroundColor: colors.muted, borderRadius: radius.md }}>
      <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })} style={{ width: 58, height: 58, overflow: 'hidden', borderRadius: radius.sm, backgroundColor: colors.card }}>
        <Image source={{ uri: p.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      </Pressable>
      <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })} style={{ flex: 1 }}>
        {pinned ? <Text variant="caption" tone="brand">PINNED</Text> : null}
        <Text variant="bodyMedium" numberOfLines={1}>{p.name}</Text>
        <Text variant="label">{formatMoney(p.price)}</Text>
      </Pressable>
      <Button testID={`live-buy-${p.id}`} label={added ? 'Added' : 'Buy'} variant="accent" size="sm" loading={pending && !added} onPress={() => void buy()} />
    </View>
  );
}

function PinnedProduct({ productId, onOpen }: { productId: string; onOpen: () => void }) {
  const { colors, radius } = useTheme();
  const product = useProduct(productId);
  if (!product.data) return null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`View pinned product ${product.data.name}`} onPress={onOpen} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 255, padding: 7, borderRadius: radius.card, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(9,12,20,0.78)', opacity: pressed ? 0.82 : 1 })}>
      <Image source={{ uri: product.data.imageUrl }} style={{ width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.muted }} contentFit="cover" />
      <View style={{ flex: 1 }}>
        <Text variant="caption" style={{ color: 'rgba(255,255,255,0.72)' }}>Pinned product</Text>
        <Text variant="bodyMedium" style={{ color: '#fff' }} numberOfLines={1}>{product.data.name}</Text>
        <Text variant="label" style={{ color: colors.accent }}>{formatMoney(product.data.price)}</Text>
      </View>
      <Ionicons name="chevron-up" size={17} color="#fff" />
    </Pressable>
  );
}

export default function LiveViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const authed = useAuth(state => state.status === 'authenticated');
  const sessionQuery = useLiveSession(id);
  const session = sessionQuery.data;
  const sessionId = session?.id;
  const room = session?.room;
  const sessionStatus = session?.status;
  const heartbeat = useLiveHeartbeat(id, session?.status === 'live');
  const reminders = useLiveReminders();
  const [productsOpen, setProductsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [tokenState, setTokenState] = useState<TokenState>(null);
  const burst = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId || !room || !authed || sessionStatus !== 'live') return;
    let active = true;
    void api.live.token({ room, role: 'viewer' }).then(
      () => { if (active) setTokenState({ room, status: 'connected' }); },
      (error: unknown) => {
        if (active && error instanceof ApiError && error.details?.code === 'LIVE_UNAVAILABLE') setTokenState({ room, status: 'unavailable' });
      },
    );
    return () => { active = false; };
  }, [api, authed, room, sessionId, sessionStatus]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const burstStyle = useAnimatedStyle(() => ({ opacity: 1 - burst.get(), transform: [{ scale: interpolate(burst.get(), [0, 1], [0.55, 1.9]) }, { translateY: interpolate(burst.get(), [0, 1], [0, -60]) }] }));
  const productIds = useMemo(() => {
    if (!session) return [];
    return [...session.productIds].sort((a, b) => Number(b === session.pinnedProductId) - Number(a === session.pinnedProductId));
  }, [session]);
  const live = session?.status === 'live';
  const viewers = heartbeat.viewers ?? session?.viewers ?? 0;
  const likes = heartbeat.likes ?? session?.likes ?? 0;

  const showNotice = (message: string) => {
    setNotice(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2200);
  };
  const gate = () => {
    if (authed) return true;
    router.push('/(auth)/login');
    return false;
  };
  const like = () => {
    if (!gate()) return;
    setLiked(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    burst.set(0);
    burst.set(withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    void heartbeat.like();
  };
  const share = () => void Share.share({ message: `${session?.title ?? 'Live shopping'} on Ezyify`, url: shareUrl(`/live/${id}`) });
  const toggleReminder = () => {
    if (!session) return;
    void reminders.toggle({ id: session.id, title: session.title, scheduledFor: session.scheduledFor }).then(added => showNotice(added ? 'Reminder set' : 'Reminder removed'));
  };

  if (sessionQuery.isLoading) return <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}><ActivityIndicator color="#fff" size="large" /></View>;
  if (sessionQuery.error || !session) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}><EmptyState icon="videocam-off-outline" title="This stream is unavailable" body="It may have been removed or the link is incorrect." actionLabel="Go back" onAction={() => goBack(router)} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {session.coverUrl ? <Image source={{ uri: session.coverUrl }} style={{ position: 'absolute', inset: 0 }} contentFit="cover" transition={200} /> : null}
      <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.86)']} locations={[0, 0.18, 0.48, 1]} style={{ position: 'absolute', inset: 0 }} />

      <View style={{ position: 'absolute', top: insets.top + 8, left: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable accessibilityRole="link" accessibilityLabel={`View ${session.host.name}`} onPress={() => router.push({ pathname: '/profile/[username]', params: { username: session.host.username } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 5, paddingRight: 10, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.43)', flex: 1 }}>
          <Avatar uri={session.host.avatarUrl} name={session.host.name} size={34} ring={live ? 'live' : 'none'} verified={session.host.verified} />
          <View style={{ flex: 1 }}><Text variant="label" style={{ color: '#fff' }} numberOfLines={1}>{session.host.name}</Text><Text variant="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>@{session.host.username}</Text></View>
        </Pressable>
        <IconButton icon="close" label="Close live shopping" variant="overlay" onPress={() => goBack(router)} />
      </View>

      <View style={{ position: 'absolute', top: insets.top + 62, left: 18, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {live ? <View style={{ height: 26, paddingHorizontal: 9, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: colors.error }}><Text variant="caption" style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', letterSpacing: 0.7 }}>● LIVE</Text></View> : null}
        {live ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, height: 26, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.42)' }}><Ionicons name="eye-outline" size={14} color="#fff" /><Text variant="caption" style={{ color: '#fff' }}>{formatCompactNumber(viewers)}</Text></View> : null}
        {tokenState?.room === session.room && tokenState.status === 'connected' ? <View style={{ paddingHorizontal: 9, height: 26, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: 'rgba(14, 142, 91, 0.88)' }}><Text variant="caption" style={{ color: '#fff' }}>Connected</Text></View> : null}
        {tokenState?.room === session.room && tokenState.status === 'unavailable' ? <View style={{ paddingHorizontal: 9, height: 26, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.45)' }}><Text variant="caption" style={{ color: '#fff' }}>Video unavailable in this build</Text></View> : null}
      </View>

      {!live && (
        <View style={{ position: 'absolute', top: '41%', left: 28, right: 28, alignItems: 'center', gap: 10 }}>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.56)', borderRadius: radius.card, padding: 18, alignItems: 'center', gap: 6 }}>
            <Ionicons name={session.status === 'ended' ? 'stop-circle-outline' : 'time-outline'} size={34} color="#fff" />
            <Text variant="heading" style={{ color: '#fff' }}>{session.status === 'ended' ? 'Stream ended' : 'Starts in ' + (session.scheduledFor ? formatTimeUntil(session.scheduledFor) : 'soon')}</Text>
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.74)', textAlign: 'center' }}>{session.status === 'ended' ? 'The products from this stream are still available to shop.' : 'Set a reminder so you don’t miss the drop.'}</Text>
            {session.status === 'scheduled' ? <Button label={reminders.has(session.id) ? 'Reminding' : 'Remind me'} size="sm" variant={reminders.has(session.id) ? 'primary' : 'accent'} onPress={toggleReminder} /> : null}
          </View>
        </View>
      )}

      <Animated.View pointerEvents="none" style={[{ position: 'absolute', right: 26, bottom: 250, width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }, burstStyle]}><Ionicons name="heart" size={52} color="#ff4d6d" /></Animated.View>
      <View style={{ position: 'absolute', right: 12, bottom: insets.bottom + 126, gap: 18 }}>
        <ActionRail testID="live-like" icon={liked ? 'heart' : 'heart-outline'} label={formatCompactNumber(likes)} active={liked} onPress={like} />
        <ActionRail icon="share-outline" label="Share" onPress={share} />
        <ActionRail testID="live-products" icon="bag-handle-outline" label="Products" onPress={() => setProductsOpen(true)} />
      </View>

      <View style={{ position: 'absolute', left: 16, right: 84, bottom: insets.bottom + 16, gap: 8 }}>
        <Text variant="heading" style={{ color: '#fff' }} numberOfLines={2}>{session.title}</Text>
        {session.pinnedProductId ? <PinnedProduct productId={session.pinnedProductId} onOpen={() => setProductsOpen(true)} /> : null}
      </View>
      {notice ? <View accessibilityRole="alert" style={{ position: 'absolute', left: 24, right: 24, bottom: insets.bottom + 8, alignItems: 'center' }}><View style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.82)' }}><Text variant="caption" style={{ color: '#fff' }}>{notice}</Text></View></View> : null}

      <Modal visible={productsOpen} transparent animationType="slide" onRequestClose={() => setProductsOpen(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close products" onPress={() => setProductsOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.52)' }} />
        <View style={{ maxHeight: '68%', padding: 18, paddingBottom: 28, gap: 14, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, backgroundColor: colors.backgroundElevated }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ flex: 1 }}><Text variant="heading">Shop this stream</Text><Text variant="caption" tone="secondary">Escrow-protected checkout on every order.</Text></View><IconButton icon="close" label="Close products" onPress={() => setProductsOpen(false)} /></View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 6 }}>
            {productIds.length ? productIds.map(productId => <StreamProductRow key={productId} productId={productId} pinned={productId === session.pinnedProductId} onAdded={showNotice} />) : <EmptyState icon="bag-outline" title="Products are coming soon" body="The host has not added products to this stream yet." />}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
