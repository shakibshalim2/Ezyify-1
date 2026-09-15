import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useStories, type Post } from '@ezyify/core';
import { Avatar } from './Avatar';
import { Text } from './Text';
import { Skeleton } from './Skeleton';
import { useTheme } from '@/theme';

export interface StoryGroup {
  user: Post['author'];
  items: Post[];
  latestAt: string;
}

/** One ring per author, newest first — mirrors how the viewer pages through frames. */
export function groupStories(stories: Post[] | undefined): StoryGroup[] {
  const map = new Map<string, StoryGroup>();
  for (const s of stories ?? []) {
    const g = map.get(s.author.id);
    if (g) {
      g.items.push(s);
      if (s.createdAt > g.latestAt) g.latestAt = s.createdAt;
    } else map.set(s.author.id, { user: s.author, items: [s], latestAt: s.createdAt });
  }
  return [...map.values()].sort((a, b) => b.latestAt.localeCompare(a.latestAt)).map(g => ({ ...g, items: g.items.sort((a, b) => a.createdAt.localeCompare(b.createdAt)) }));
}

export function StoriesRail() {
  const router = useRouter();
  const { colors } = useTheme();
  const me = useAuth(s => s.user);
  const stories = useStories();
  const groups = useMemo(() => groupStories(stories.data), [stories.data]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add to your story" onPress={() => router.push({ pathname: '/create', params: { kind: 'story' } })} style={{ alignItems: 'center', gap: 6, width: 68 }}>
        <View>
          <Avatar uri={me?.avatarUrl ?? null} name={me?.name} size={60} ring="seen" />
          <View style={{ position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={14} color={colors.primaryForeground} />
          </View>
        </View>
        <Text variant="caption" numberOfLines={1}>Your story</Text>
      </Pressable>
      {stories.isLoading && !groups.length
        ? [0, 1, 2, 3].map(i => (
            <View key={i} style={{ alignItems: 'center', gap: 8, width: 68 }}>
              <Skeleton width={60} height={60} radius={30} />
              <Skeleton width={48} height={10} />
            </View>
          ))
        : groups.map(g => (
            <Pressable key={g.user.id} accessibilityRole="button" accessibilityLabel={`${g.user.name}'s story`} onPress={() => router.push({ pathname: '/story/[id]', params: { id: g.user.id } })} style={{ alignItems: 'center', gap: 6, width: 68 }}>
              <Avatar uri={g.user.avatarUrl} name={g.user.name} size={60} ring="story" verified={g.user.verified} />
              <Text variant="caption" numberOfLines={1}>{g.user.username}</Text>
            </Pressable>
          ))}
    </ScrollView>
  );
}
