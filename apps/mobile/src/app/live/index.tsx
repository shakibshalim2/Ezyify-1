import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatTimeUntil, useLiveSessions, type LiveSession } from '@ezyify/core';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/QueryState';
import { SectionHeader } from '@/components/SectionHeader';
import { Skeleton } from '@/components/Skeleton';
import { Text } from '@/components/Text';
import { LiveSessionCard } from '@/components/LiveSessionCard';
import { useRefresh } from '@/lib/data';
import { useLiveReminders } from '@/lib/reminders';
import { useTheme } from '@/theme';

function HubSkeleton() {
  return (
    <View style={{ padding: 16, gap: 14 }}>
      <Skeleton width={168} height={30} />
      <View style={{ flexDirection: 'row', gap: 8 }}><Skeleton width={70} height={36} radius={18} /><Skeleton width={94} height={36} radius={18} /><Skeleton width={78} height={36} radius={18} /></View>
      <Skeleton height={220} radius={16} />
      <Skeleton height={96} radius={16} />
      <Skeleton height={96} radius={16} />
    </View>
  );
}

function UpcomingRow({ session }: { session: LiveSession }) {
  const router = useRouter();
  const reminders = useLiveReminders();
  const { colors, radius } = useTheme();
  const toggle = () => void reminders.toggle({ id: session.id, title: session.title, scheduledFor: session.scheduledFor });
  return (
    <View style={{ flexDirection: 'row', gap: 12, padding: 10, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.card, backgroundColor: colors.card }}>
      <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/live/[id]', params: { id: session.id } })} style={{ width: 82, height: 82, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.muted }}>
        {session.coverUrl ? <Image source={{ uri: session.coverUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
      </Pressable>
      <View style={{ flex: 1, justifyContent: 'space-between', gap: 4 }}>
        <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/live/[id]', params: { id: session.id } })}>
          <Text variant="bodyMedium" numberOfLines={1}>{session.title}</Text>
          <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Avatar uri={session.host.avatarUrl} name={session.host.name} size={18} />
            <Text variant="caption" tone="secondary" numberOfLines={1}>{session.host.name}</Text>
          </View>
          <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="time-outline" size={13} color={colors.primary} />
            <Text variant="caption" tone="brand">{session.scheduledFor ? formatTimeUntil(session.scheduledFor) : 'Schedule pending'}</Text>
          </View>
        </Pressable>
        <Button label={reminders.has(session.id) ? 'Reminding' : 'Remind me'} size="sm" variant={reminders.has(session.id) ? 'primary' : 'secondary'} onPress={toggle} />
      </View>
    </View>
  );
}

export default function LiveShoppingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<string | null>(null);
  const live = useLiveSessions({ status: 'live', pageSize: 30 });
  const upcoming = useLiveSessions({ status: 'scheduled', pageSize: 30 });
  const sessions = useMemo(() => [...(live.data?.items ?? []), ...(upcoming.data?.items ?? [])], [live.data?.items, upcoming.data?.items]);
  const categories = useMemo(() => [...new Set(sessions.flatMap(session => session.category ? [session.category] : []))], [sessions]);
  const liveSessions = useMemo(() => (live.data?.items ?? []).filter(session => !category || session.category === category), [category, live.data?.items]);
  const upcomingSessions = useMemo(() => (upcoming.data?.items ?? []).filter(session => !category || session.category === category), [category, upcoming.data?.items]);
  const { refreshing, onRefresh } = useRefresh(async () => { await Promise.all([live.refetch(), upcoming.refetch()]); });
  const loading = live.isLoading || upcoming.isLoading;
  const error = live.error ?? upcoming.error;

  if (loading) return <HubSkeleton />;
  if (error) return <ErrorState error={error} onRetry={onRefresh} />;

  return (
    <FlatList
      data={upcomingSessions}
      keyExtractor={session => session.id}
      renderItem={({ item }) => <UpcomingRow session={item} />}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: insets.bottom + 24, gap: 16 }}
      ListHeaderComponent={
        <View style={{ gap: 20 }}>
          <View style={{ gap: 4 }}>
            <Text variant="display">Live shopping</Text>
            <Text tone="secondary">See the details, ask questions, and shop the drop while it’s live.</Text>
          </View>
          {categories.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Chip label="All" selected={category === null} onPress={() => setCategory(null)} />
              {categories.map(item => <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />)}
            </ScrollView>
          ) : null}
          <View style={{ gap: 12 }}>
            <SectionHeader title="Live now" />
            {liveSessions.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {liveSessions.map(session => <LiveSessionCard key={session.id} session={session} width={270} />)}
              </ScrollView>
            ) : <EmptyState icon="videocam-outline" title="No streams live right now" body="Check back soon for creator demos and product drops." />}
          </View>
          <SectionHeader title="Upcoming" />
        </View>
      }
      ListEmptyComponent={<EmptyState icon="calendar-outline" title="No streams scheduled yet" body="Follow your favorite hosts to hear about their next live drop." />}
    />
  );
}
