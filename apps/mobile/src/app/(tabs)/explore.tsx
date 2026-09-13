import { useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCompactNumber } from '@ezyify/core';
import { Text } from '@/components/Text';
import { SearchBar } from '@/components/SearchBar';
import { Chip } from '@/components/Chip';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { loops, posts, categories, users } from '@/lib/mock';
import { useTheme } from '@/theme';

const W = Dimensions.get('window').width;
const GAP = 8;
const COL = (W - 32 - GAP) / 2;
const FILTERS = ['For you', 'Loops', 'Live', 'Creators', ...categories.map(c => c.name)];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const [filter, setFilter] = useState('For you');
  const [q, setQ] = useState('');

  const grid = useMemo(() => {
    const items = [...loops.map(l => ({ kind: 'loop' as const, post: l })), ...posts.map(p => ({ kind: 'post' as const, post: p }))];
    const filtered = filter === 'Loops' ? items.filter(i => i.kind === 'loop') : filter === 'Creators' || filter === 'Live' ? [] : items;
    return q ? filtered.filter(i => i.post.caption.toLowerCase().includes(q.toLowerCase()) || i.post.hashtags.some(h => h.toLowerCase().includes(q.toLowerCase()))) : filtered;
  }, [filter, q]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
        <SearchBar value={q} onChangeText={setQ} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map(f => <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />)}
        </ScrollView>
      </View>

      {filter === 'Creators' ? (
        <FlatList
          data={users}
          keyExtractor={u => u.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 24 }}
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
          data={grid}
          keyExtractor={i => i.post.id}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: GAP, paddingBottom: 24 }}
          ListHeaderComponent={
            filter === 'For you' && !q ? (
              <View style={{ gap: 12, paddingBottom: 12 }}>
                <SectionHeader title="Trending topics" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
                  {categories.map(c => (
                    <Pressable key={c.id} accessibilityRole="button" onPress={() => setFilter(c.name)} style={{ width: 120, height: 72, borderRadius: radius.md, overflow: 'hidden' }}>
                      <Image source={{ uri: c.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={{ position: 'absolute', inset: 0 }} />
                      <Text variant="label" style={{ position: 'absolute', left: 10, bottom: 8, color: '#fff' }}>{c.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null
          }
          ListEmptyComponent={<EmptyState icon="search-outline" title="Nothing matched" body={`We couldn't find anything for "${q || filter}". Try a different keyword.`} />}
          renderItem={({ item, index }) => {
            const tall = item.kind === 'loop';
            const m = item.post.media[0];
            return (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={item.post.caption}
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
