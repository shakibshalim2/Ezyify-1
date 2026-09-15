import { useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, Share, View } from 'react-native';
import { choose } from '@/lib/confirm';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCompactNumber, useAuth, useBlockUser, useBlockedUsers, useFeed, useLoops, useMe, useProducts, useProfile, useSavedPosts, useToggleFollow, type Post, type ProductSummary } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useMobileRuntime } from '@/lib/auth';
import { useInfiniteList, useRefresh } from '@/lib/data';
import { shareUrl } from '@/lib/links';
import { useTheme } from '@/theme';

const W = Dimensions.get('window').width;
const TABS = [{ id: 'posts', icon: 'grid-outline' }, { id: 'loops', icon: 'play-outline' }, { id: 'shop', icon: 'bag-handle-outline' }, { id: 'saved', icon: 'bookmark-outline' }] as const;
type Tab = (typeof TABS)[number]['id'];

function HeaderSkeleton() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 110, paddingHorizontal: 16, gap: 12 }}>
      <Skeleton width={80} height={80} radius={40} />
      <Skeleton width={160} height={24} />
      <Skeleton width={100} height={14} />
      <Skeleton height={64} radius={16} />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius, gradients } = useTheme();
  const { username: param } = useLocalSearchParams<{ username: string }>();
  const authUser = useAuth(s => s.user);
  const authed = useAuth(s => s.status === 'authenticated');
  const { signOut } = useMobileRuntime();
  const isMe = param === 'me' || (!!authUser && param === authUser.username);
  const username = isMe ? authUser?.username : param;

  const me = useMe();
  const other = useProfile(isMe ? undefined : username);
  const profile = isMe ? me : other;
  const user = profile.data;

  const [tab, setTab] = useState<Tab>('posts');
  const posts = useFeed(username ? { author: username } : {});
  const loops = useLoops(username ? { author: username } : {});
  const saved = useSavedPosts();
  const shop = useProducts(username ? { seller: username, pageSize: 20 } : {});
  const postList = useInfiniteList<Post>(posts);
  const loopList = useInfiniteList<Post>(loops);
  const savedList = useInfiniteList<Post>(saved);
  const shopList = useInfiniteList<ProductSummary>(shop);
  const follow = useToggleFollow();
  const block = useBlockUser();
  const blocked = useBlockedUsers();
  const isBlocked = !!user && (blocked.data ?? []).some(b => b.id === user.id);
  const { refreshing, onRefresh } = useRefresh(async () => Promise.all([profile.refetch(), posts.refetch(), loops.refetch()]));

  const active = tab === 'posts' ? postList : tab === 'loops' ? loopList : tab === 'saved' ? savedList : null;
  const activeQuery = tab === 'posts' ? posts : tab === 'loops' ? loops : tab === 'saved' ? saved : shop;
  const gridData = useMemo(() => (tab === 'shop' ? [] : active?.items ?? []), [tab, active?.items]);
  const showShopTab = shopList.items.length > 0 || user?.role === 'seller';

  if (isMe && !authed) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <EmptyState icon="person-circle-outline" title="Your profile lives here" body="Sign in to see your posts, saved items and orders." actionLabel="Sign in" onAction={() => router.push('/(auth)/login')} />
      </View>
    );
  }
  if (profile.isLoading && !user) return <View style={{ flex: 1, backgroundColor: colors.background }}><HeaderSkeleton /></View>;
  if (profile.error || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 8 }}><IconButton icon="chevron-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))} /></View>
        <ErrorState error={profile.error ?? new Error('not found')} onRetry={() => profile.refetch()} />
      </View>
    );
  }

  const stats = [
    { label: 'Posts', value: user.posts },
    { label: 'Followers', value: user.followers },
    { label: 'Following', value: user.following },
  ];
  const more = () =>
    choose(`@${user.username}`, [
      { label: 'Report user', destructive: true, onPress: () => router.push({ pathname: '/report', params: { type: 'user', id: user.id, user: user.id } }) },
      { label: isBlocked ? 'Unblock' : 'Block', destructive: true, onPress: () => (authed ? block.mutate({ userId: user.id, blocked: isBlocked }) : router.push('/(auth)/login')) },
    ]);
  const onFollow = () => (authed ? follow.mutate({ username: user.username, following: !!user.isFollowing }) : router.push('/(auth)/login'));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        key={tab}
        data={gridData}
        keyExtractor={p => p.id}
        numColumns={3}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={() => active?.loadMore()}
        contentContainerStyle={{ paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 2 }}
        ListHeaderComponent={
          <View>
            <View style={{ height: 150 }}>
              {user.coverUrl ? <Image source={{ uri: user.coverUrl }} style={{ position: 'absolute', inset: 0 }} contentFit="cover" /> : <LinearGradient colors={[gradients.vivid[0], gradients.vivid[1], gradients.vivid[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0 }} />}
              <View style={{ paddingTop: insets.top, flexDirection: 'row', paddingHorizontal: 8, justifyContent: 'space-between' }}>
                {!isMe ? <IconButton icon="chevron-back" label="Back" variant="overlay" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))} /> : <View style={{ width: 44 }} />}
                <View style={{ flexDirection: 'row' }}>
                  {isMe && <IconButton icon="settings-outline" label="Settings" variant="overlay" onPress={() => router.push('/settings')} />}
                  <IconButton icon="share-outline" label="Share profile" variant="overlay" onPress={() => Share.share({ message: `${user.name} on Ezyify`, url: shareUrl(`/profile/${user.username}`) })} />
                  {!isMe && <IconButton icon="ellipsis-horizontal" label="More options" variant="overlay" onPress={more} />}
                </View>
              </View>
            </View>
            <View style={{ paddingHorizontal: 16, marginTop: -40, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View style={{ borderWidth: 4, borderColor: colors.background, borderRadius: 48, backgroundColor: colors.background }}>
                  <Avatar uri={user.avatarUrl} name={user.name} size={80} verified={user.verified} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                  {isMe ? (
                    <>
                      <Button label="Edit profile" variant="secondary" size="sm" onPress={() => router.push('/settings/edit-profile')} />
                      <Button label="Sign out" variant="ghost" size="sm" onPress={() => signOut().then(() => router.replace('/(auth)/login'))} />
                    </>
                  ) : (
                    <>
                      <Button label={user.isFollowing ? 'Following' : 'Follow'} variant={user.isFollowing ? 'secondary' : 'primary'} size="sm" loading={follow.isPending} onPress={onFollow} />
                      <Button label="Message" variant="secondary" size="sm" onPress={() => (authed ? router.push({ pathname: '/messages/[id]', params: { id: 'new', username: user.username } }) : router.push('/(auth)/login'))} />
                    </>
                  )}
                </View>
              </View>
              <View style={{ gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text variant="title">{user.name}</Text>
                  {user.role !== 'user' && <Badge label={user.role === 'seller' ? 'Seller' : user.role === 'admin' ? 'Team' : 'Creator'} tone="primary" />}
                </View>
                <Text tone="secondary">@{user.username}{user.location ? ` · ${user.location}` : ''}</Text>
              </View>
              {user.bio ? <Text>{user.bio}</Text> : isMe ? <Pressable accessibilityRole="button" onPress={() => router.push('/settings/edit-profile')}><Text tone="secondary">Add a bio to tell people what you love.</Text></Pressable> : null}
              {user.website && <Text variant="label" tone="brand">{user.website.replace(/^https?:\/\//, '')}</Text>}
              {isBlocked && (
                <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, backgroundColor: colors.errorSubtle }}>
                  <Ionicons name="ban" size={18} color={colors.error} />
                  <Text variant="caption" style={{ flex: 1, color: colors.error }}>You blocked @{user.username}. They can&apos;t see your content or message you.</Text>
                  <Button label="Unblock" size="sm" variant="secondary" loading={block.isPending} onPress={() => block.mutate({ userId: user.id, blocked: true })} />
                </View>
              )}
              <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle, paddingVertical: 12 }}>
                {stats.map((s, i) => (
                  <View key={s.label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: colors.borderSubtle }}>
                    <Text variant="heading">{formatCompactNumber(s.value)}</Text>
                    <Text variant="caption" tone="secondary">{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              {TABS.filter(t => (t.id === 'saved' ? isMe : t.id === 'shop' ? showShopTab : true)).map(t => (
                <Pressable key={t.id} accessibilityRole="tab" accessibilityLabel={t.id} aria-selected={tab === t.id} onPress={() => setTab(t.id)} style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: tab === t.id ? colors.primary : 'transparent' }}>
                  <Ionicons name={t.icon} size={22} color={tab === t.id ? colors.primary : colors.foregroundTertiary} />
                </Pressable>
              ))}
            </View>
            {tab === 'shop' && (
              <View style={{ padding: 16, gap: 12 }}>
                {shop.isLoading ? (
                  <View style={{ flexDirection: 'row', gap: 12 }}><Skeleton height={250} radius={16} style={{ flex: 1 }} /><Skeleton height={250} radius={16} style={{ flex: 1 }} /></View>
                ) : shopList.items.length ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {shopList.items.map(p => <View key={p.id} style={{ width: (W - 44) / 2 }}><ProductCard product={p} /></View>)}
                  </View>
                ) : (
                  <EmptyState icon="storefront-outline" title="No products listed" body={isMe ? 'Open your shop from Settings to start selling.' : 'This seller has nothing listed right now.'} />
                )}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          tab === 'shop' ? null : activeQuery.isLoading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, paddingTop: 2 }}>{[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} width={(W - 4) / 3} height={(W - 4) / 3} radius={0} />)}</View>
          ) : activeQuery.error ? (
            <ErrorState error={activeQuery.error} onRetry={() => activeQuery.refetch()} />
          ) : (
            <EmptyState icon={tab === 'saved' ? 'bookmark-outline' : tab === 'loops' ? 'play-outline' : 'camera-outline'} title={tab === 'saved' ? 'Nothing saved yet' : tab === 'loops' ? 'No loops yet' : 'No posts yet'} body={tab === 'saved' ? 'Tap the bookmark on any post to keep it here.' : isMe ? 'Share your first post or loop to get started.' : 'Check back soon.'} actionLabel={isMe && tab !== 'saved' ? 'Create' : undefined} onAction={() => router.push('/create')} />
          )
        }
        renderItem={({ item }) => (
          <Pressable accessibilityRole="link" accessibilityLabel={item.caption || item.kind} onPress={() => router.push(item.kind === 'loop' ? { pathname: '/loops', params: { id: item.id } } : { pathname: '/post/[id]', params: { id: item.id } })} style={{ width: (W - 4) / 3, aspectRatio: item.kind === 'loop' ? 9 / 16 : 1, marginBottom: 2 }}>
            <Image source={{ uri: item.media[0].thumbnailUrl ?? item.media[0].url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            {item.kind === 'loop' && <Ionicons name="play" size={16} color="#fff" style={{ position: 'absolute', top: 6, right: 6 }} />}
            {item.kind !== 'loop' && item.media.length > 1 && <Ionicons name="copy-outline" size={14} color="#fff" style={{ position: 'absolute', top: 6, right: 6 }} />}
          </Pressable>
        )}
      />
    </View>
  );
}
