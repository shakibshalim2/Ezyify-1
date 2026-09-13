import { useState } from 'react';
import { Dimensions, FlatList, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCompactNumber, useAuth } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { loops, me, posts, products, users } from '@/lib/mock';
import { useAppStore } from '@/store/app';
import { useTheme } from '@/theme';

const W = Dimensions.get('window').width;
const TABS = [{ id: 'posts', icon: 'grid-outline' }, { id: 'loops', icon: 'play-outline' }, { id: 'shop', icon: 'bag-handle-outline' }, { id: 'saved', icon: 'bookmark-outline' }] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius, gradients } = useTheme();
  const { username } = useLocalSearchParams<{ username: string }>();
  const authUser = useAuth(s => s.user);
  const clear = useAuth(s => s.clear);
  const isMe = username === 'me' || username === authUser?.username;
  const user = isMe ? { ...me, ...(authUser ?? {}) } : users.find(u => u.username === username);
  const followed = useAppStore(s => (user ? s.followedIds.includes(user.id) : false));
  const toggleFollow = useAppStore(s => s.toggleFollow);
  const savedIds = useAppStore(s => s.savedPostIds);
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('posts');

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <EmptyState icon="person-outline" title="Profile not found" body={`@${username} doesn't exist or was removed.`} actionLabel="Go back" onAction={() => router.back()} />
      </View>
    );
  }

  const userPosts = isMe ? posts.slice(0, 2) : posts.filter(p => p.author.id === user.id);
  const userLoops = isMe ? [] : loops.filter(l => l.author.id === user.id);
  const saved = posts.filter(p => savedIds.includes(p.id) || p.engagement.isSaved);
  const gridData = tab === 'posts' ? userPosts : tab === 'loops' ? userLoops : tab === 'saved' ? saved : [];
  const stats = [{ label: 'Posts', value: userPosts.length }, { label: 'Loops', value: userLoops.length }, { label: 'Followers', value: isMe ? 128 : 48200 + (followed ? 1 : 0) }];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        key={tab}
        data={tab === 'shop' ? [] : gridData}
        keyExtractor={p => p.id}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 2 }}
        ListHeaderComponent={
          <View>
            <View style={{ height: 150 }}>
              <LinearGradient colors={[gradients.vivid[0], gradients.vivid[1], gradients.vivid[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0 }} />
              <View style={{ paddingTop: insets.top, flexDirection: 'row', paddingHorizontal: 8, justifyContent: 'space-between' }}>
                {!isMe ? <IconButton icon="chevron-back" label="Back" variant="overlay" onPress={() => router.back()} /> : <View style={{ width: 44 }} />}
                <View style={{ flexDirection: 'row' }}>
                  {isMe && <IconButton icon="settings-outline" label="Settings" variant="overlay" onPress={() => router.push('/settings')} />}
                  <IconButton icon="share-outline" label="Share profile" variant="overlay" />
                </View>
              </View>
            </View>
            <View style={{ paddingHorizontal: 16, marginTop: -40, gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View style={{ borderWidth: 4, borderColor: colors.background, borderRadius: 48, backgroundColor: colors.background }}>
                  <Avatar uri={user.avatarUrl} size={80} verified={user.verified} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                  {isMe ? (
                    <>
                      <Button label="Edit profile" variant="secondary" size="sm" onPress={() => router.push('/settings')} />
                      <Button label="Sign out" variant="ghost" size="sm" onPress={() => { clear(); router.replace('/(auth)/login'); }} />
                    </>
                  ) : (
                    <>
                      <Button label={followed ? 'Following' : 'Follow'} variant={followed ? 'secondary' : 'primary'} size="sm" onPress={() => toggleFollow(user.id)} />
                      <Button label="Message" variant="secondary" size="sm" onPress={() => router.push({ pathname: '/messages/[id]', params: { id: 'c1' } })} />
                    </>
                  )}
                </View>
              </View>
              <View style={{ gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text variant="title">{user.name}</Text>
                  {user.role !== 'user' && <Badge label={user.role === 'seller' ? 'Seller' : 'Creator'} tone="primary" />}
                </View>
                <Text tone="secondary">@{user.username}</Text>
              </View>
              <Text>{isMe ? 'Add a bio to tell people what you love.' : 'Sharing honest reviews and everyday finds ✨ Links in every post are escrow-protected.'}</Text>
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
              {TABS.filter(t => isMe || t.id !== 'saved').map(t => (
                <Pressable key={t.id} accessibilityRole="tab" accessibilityState={{ selected: tab === t.id }} onPress={() => setTab(t.id)} style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: tab === t.id ? colors.primary : 'transparent' }}>
                  <Ionicons name={t.icon} size={22} color={tab === t.id ? colors.primary : colors.foregroundTertiary} />
                </Pressable>
              ))}
            </View>
            {tab === 'shop' && (
              <View style={{ padding: 16, gap: 12 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {products.slice(0, 4).map(p => <View key={p.id} style={{ width: (W - 44) / 2 }}><ProductCard product={p} /></View>)}
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={tab === 'shop' ? null : <EmptyState icon={tab === 'saved' ? 'bookmark-outline' : 'camera-outline'} title={tab === 'saved' ? 'Nothing saved yet' : 'No posts yet'} body={tab === 'saved' ? 'Tap the bookmark on any post to keep it here.' : isMe ? 'Share your first post or loop to get started.' : 'Check back soon.'} actionLabel={isMe && tab !== 'saved' ? 'Create' : undefined} onAction={() => router.push('/create')} />}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="link" onPress={() => router.push(item.kind === 'loop' ? { pathname: '/loops', params: { id: item.id } } : { pathname: '/post/[id]', params: { id: item.id } })} style={{ width: (W - 4) / 3, aspectRatio: item.kind === 'loop' ? 9 / 16 : 1, marginBottom: 2 }}>
            <Image source={{ uri: item.media[0].thumbnailUrl ?? item.media[0].url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            {item.kind === 'loop' && <Ionicons name="play" size={16} color="#fff" style={{ position: 'absolute', top: 6, right: 6 }} />}
            {item.media.length > 1 && <Ionicons name="copy-outline" size={14} color="#fff" style={{ position: 'absolute', top: 6, right: 6 }} />}
          </Pressable>
        )}
      />
    </View>
  );
}
