import { useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCompactNumber, useCategories, useFeed, useLoops, useSearch, type Post } from '@ezyify/core';
import { Text } from '@/components/Text';
import { SearchBar } from '@/components/SearchBar';
import { Chip } from '@/components/Chip';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useInfiniteList, useRefresh } from '@/lib/data';
import { useTheme } from '@/theme';
import { useDebounced } from '@/lib/useDebounced';

const W = Dimensions.get('window').width;
const GAP = 8;
const COL = (W - 32 - GAP) / 2;
const BASE_FILTERS = ['For you', 'Loops', 'Live', 'Creators'] as const;
type Item = { kind: 'loop' | 'post'; post: Post };

function GridSkeleton() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: 16 }}>
      {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} width={COL} height={i % 2 ? COL * 1.3 : COL} radius={12} />)}
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const [filter, setFilter] = useState<string>('For you');
  const [q, setQ] = useState('');
  const query = useDebounced(q.trim(), 300);

  const categories = useCategories();
  // A hashtag filter (category name) narrows both feeds server-side; "Loops" only shows loops.
  const hashtag = BASE_FILTERS.includes(filter as (typeof BASE_FILTERS)[number]) ? undefined : filter.toLowerCase();
  const posts = useFeed(hashtag ? { hashtag } : {});
  const loops = useLoops(hashtag ? { hashtag } : {});
  const search = useSearch(query);
  const postList = useInfiniteList<Post>(posts);
  const loopList = useInfiniteList<Post>(loops);
  const { refreshing, onRefresh } = useRefresh(async () => Promise.all([posts.refetch(), loops.refetch()]));

  const grid = useMemo<Item[]>(() => {
    const items: Item[] = [...loopList.items.map(l => ({ kind: 'loop' as const, post: l })), ...postList.items.map(p => ({ kind: 'post' as const, post: p }))];
    const scoped = filter === 'Loops' ? items.filter(i => i.kind === 'loop') : items;
    if (!query) return scoped;
    const needle = query.toLowerCase();
    return scoped.filter(i => i.post.caption.toLowerCase().includes(needle) || i.post.hashtags.some(h => h.toLowerCase().includes(needle)) || i.post.author.username.includes(needle));
  }, [filter, query, loopList.items, postList.items]);

  // Creators are derived from the authors seen in the feeds (the API has no dedicated discovery endpoint yet).
  const creators = useMemo(() => {
    const seen = new Map<string, Post['author']>();
    for (const p of [...loopList.items, ...postList.items]) if (!seen.has(p.author.id)) seen.set(p.author.id, p.author);
    return [...seen.values()].filter(u => !query || u.username.includes(query.toLowerCase()) || u.name.toLowerCase().includes(query.toLowerCase()));
  }, [loopList.items, postList.items, query]);

  const loading = posts.isLoading || loops.isLoading;
  const error = posts.error ?? loops.error;
  const filters = [...BASE_FILTERS, ...(categories.data ?? []).map(c => c.name)];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Search posts, products, people" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {filters.map(f => <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />)}
        </ScrollView>
      </View>

      {filter === 'Creators' ? (
        <FlatList
          key="creators"
          data={creators}
          keyExtractor={u => u.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 24 }}
          ListEmptyComponent={loading ? <GridSkeleton /> : <EmptyState icon="people-outline" title="No creators found" body="Try a different name." />}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: item.username } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle }}>
              <Avatar uri={item.avatarUrl} size={48} verified={item.verified} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{item.name}</Text>
                <Text variant="caption" tone="secondary">@{item.username}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.foregroundTertiary} />
            </Pressable>
          )}
        />
      ) : filter === 'Live' ? (
        <EmptyState icon="videocam-outline" title="No one is live right now" body="Follow creators to get notified when they go live with new drops." actionLabel="Browse creators" onAction={() => setFilter('Creators')} />
      ) : (
        <FlatList
          key="grid"
          data={grid}
          keyExtractor={i => i.post.id}
          numColumns={2}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={() => {
            postList.loadMore();
            loopList.loadMore();
          }}
          onEndReachedThreshold={0.6}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: GAP, paddingBottom: 24 }}
          ListHeaderComponent={
            <View style={{ gap: 12, paddingBottom: 12 }}>
              {query && search.data?.items.length ? (
                <View style={{ gap: 12 }}>
                  <SectionHeader title="Products" />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                    {search.data.items.map(p => <View key={p.id} style={{ width: 160 }}><ProductCard product={p} /></View>)}
                  </ScrollView>
                </View>
              ) : null}
              {filter === 'For you' && !query && (categories.data?.length ?? 0) > 0 ? (
                <>
                  <SectionHeader title="Trending topics" />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
                    {categories.data!.map(c => (
                      <Pressable key={c.id} accessibilityRole="button" onPress={() => setFilter(c.name)} style={{ width: 120, height: 72, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.muted }}>
                        {c.imageUrl && <Image source={{ uri: c.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />}
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={{ position: 'absolute', inset: 0 }} />
                        <Text variant="label" style={{ position: 'absolute', left: 10, bottom: 8, color: '#fff' }}>{c.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            loading ? <GridSkeleton /> : error ? <ErrorState error={error} onRetry={onRefresh} /> : <EmptyState icon="search-outline" title="Nothing matched" body={`We couldn't find anything for "${query || filter}". Try a different keyword.`} />
          }
          renderItem={({ item, index }) => {
            const tall = item.kind === 'loop';
            const m = item.post.media[0];
            return (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={item.post.caption || `${item.post.author.username}'s ${item.kind}`}
                onPress={() => router.push(item.kind === 'loop' ? { pathname: '/loops', params: { id: item.post.id } } : { pathname: '/post/[id]', params: { id: item.post.id } })}
                style={{ width: COL, height: tall ? COL * 1.5 : COL * (index % 3 === 0 ? 1.25 : 1), borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.muted }}
              >
                <Image source={{ uri: m.thumbnailUrl ?? m.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 }} />
                {tall && <View style={{ position: 'absolute', top: 8, left: 8 }}><Badge label="LOOP" tone="primary" /></View>}
                <View style={{ position: 'absolute', left: 8, right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Avatar uri={item.post.author.avatarUrl} size={20} />
                  <Text variant="caption" style={{ color: '#fff', flex: 1 }} numberOfLines={1}>{item.post.author.username}</Text>
                  <Ionicons name={tall ? 'play' : 'heart'} size={12} color="#fff" />
                  <Text variant="caption" style={{ color: '#fff' }}>{formatCompactNumber(tall ? item.post.engagement.views ?? 0 : item.post.engagement.likes)}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
