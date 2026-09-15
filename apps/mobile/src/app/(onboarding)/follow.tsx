import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useFeed, useFollowers, useLoops, useToggleFollow, type UserSummary } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useTheme } from '@/theme';

export default function FollowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const me = useAuth(s => s.user);
  // Suggestions = the most active authors in the public feeds (no dedicated discovery endpoint yet).
  const posts = useFeed({ pageSize: 30 });
  const loops = useLoops({ pageSize: 30 });
  const following = useFollowers(me?.username, 'following');
  const follow = useToggleFollow();
  const followedIds = new Set((following.data ?? []).map(u => u.id));

  const creators = useMemo(() => {
    const seen = new Map<string, UserSummary & { score: number }>();
    for (const p of [...(posts.data?.pages[0]?.items ?? []), ...(loops.data?.pages[0]?.items ?? [])]) {
      if (p.author.id === me?.id) continue;
      const cur = seen.get(p.author.id);
      seen.set(p.author.id, { ...p.author, score: (cur?.score ?? 0) + p.engagement.likes });
    }
    return [...seen.values()].sort((a, b) => b.score - a.score).slice(0, 8);
  }, [posts.data, loops.data, me?.id]);
  const loading = posts.isLoading || loops.isLoading;
  const error = posts.error ?? loops.error;
  const count = followedIds.size;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140, gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text variant="caption" tone="brand" style={{ letterSpacing: 1.6, fontFamily: 'Inter_600SemiBold' }}>STEP 2 OF 2</Text>
          <Text variant="display">Creators you might love</Text>
          <Text tone="secondary">Follow a few to fill your feed from day one.</Text>
        </View>
        <View style={{ gap: 10 }}>
          {loading && [0, 1, 2, 3].map(i => <Skeleton key={i} height={72} radius={16} />)}
          {error && <ErrorState compact error={error} onRetry={() => { posts.refetch(); loops.refetch(); }} />}
          {creators.map(u => {
            const on = followedIds.has(u.id);
            return (
              <Card key={u.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
                <Avatar uri={u.avatarUrl} name={u.name} size={48} verified={u.verified} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">{u.name}</Text>
                  <Text variant="caption" tone="secondary">@{u.username} · {u.role === 'seller' ? 'Seller' : 'Creator'}</Text>
                </View>
                <Button label={on ? 'Following' : 'Follow'} variant={on ? 'secondary' : 'primary'} size="sm" onPress={() => follow.mutate({ username: u.username, following: on })} />
              </Card>
            );
          })}
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
        <Button label={count ? `Continue · ${count} following` : 'Continue'} variant="gradient" size="lg" fullWidth onPress={() => router.replace('/(tabs)/home')} />
      </View>
    </View>
  );
}
