import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatRelativeTime, useConversations } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { SearchBar } from '@/components/SearchBar';
import { IconButton } from '@/components/IconButton';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useRefresh } from '@/lib/data';
import { useTheme } from '@/theme';

export default function MessagesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const convos = useConversations();
  const { refreshing, onRefresh } = useRefresh(convos.refetch);
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (convos.data ?? []).filter(c => !needle || c.participants.some(u => u.name.toLowerCase().includes(needle) || u.username.includes(needle)) || c.lastMessage?.text.toLowerCase().includes(needle));
  }, [convos.data, q]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Messages" right={<IconButton icon="create-outline" label="New message" onPress={() => router.push({ pathname: '/(tabs)/explore' })} />} />
      <FlatList
        data={list}
        keyExtractor={c => c.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={<View style={{ paddingHorizontal: 16, paddingBottom: 8 }}><SearchBar placeholder="Search messages" value={q} onChangeText={setQ} /></View>}
        ListEmptyComponent={
          convos.isLoading ? (
            <View style={{ paddingHorizontal: 16, gap: 16, paddingTop: 8 }}>
              {[0, 1, 2].map(i => (
                <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Skeleton width={52} height={52} radius={26} />
                  <View style={{ flex: 1, gap: 8 }}><Skeleton width="50%" height={14} /><Skeleton width="80%" height={10} /></View>
                </View>
              ))}
            </View>
          ) : convos.error ? (
            <ErrorState error={convos.error} onRetry={() => convos.refetch()} />
          ) : (
            <EmptyState icon="chatbubbles-outline" title={q ? 'No matches' : 'No messages yet'} body={q ? 'Try another name.' : 'Start a conversation with a seller or creator from their profile.'} />
          )
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const u = item.participants[0];
          const unread = item.unreadCount > 0;
          return (
            <Pressable accessibilityRole="button" accessibilityLabel={`Chat with ${u.name}`} onPress={() => router.push({ pathname: '/messages/[id]', params: { id: item.id } })} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? colors.muted : 'transparent' })}>
              <Avatar uri={u.avatarUrl} size={52} verified={u.verified} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="bodyMedium">{u.name}</Text>
                  <Text variant="caption" tone={unread ? 'brand' : 'tertiary'}>{item.lastMessage ? formatRelativeTime(item.lastMessage.at) : ''}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text tone={unread ? 'primary' : 'secondary'} numberOfLines={1} style={{ flex: 1, fontFamily: unread ? 'Inter_500Medium' : undefined }}>
                    {item.lastMessage ? `${item.lastMessage.fromMe ? 'You: ' : ''}${item.lastMessage.text}` : 'Say hello 👋'}
                  </Text>
                  {unread && <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}><Text variant="caption" style={{ color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }}>{item.unreadCount}</Text></View>}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
