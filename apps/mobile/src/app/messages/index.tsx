import { FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatRelativeTime } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { SearchBar } from '@/components/SearchBar';
import { IconButton } from '@/components/IconButton';
import { EmptyState } from '@/components/EmptyState';
import { conversations } from '@/lib/mock';
import { useTheme } from '@/theme';

export default function MessagesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Messages" right={<IconButton icon="create-outline" label="New message" />} />
      <FlatList
        data={conversations}
        keyExtractor={c => c.id}
        ListHeaderComponent={<View style={{ paddingHorizontal: 16, paddingBottom: 8 }}><SearchBar placeholder="Search messages" /></View>}
        ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title="No messages yet" body="Start a conversation with a seller or creator from their profile." />}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const u = item.participants[0];
          const unread = item.unreadCount > 0;
          return (
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/messages/[id]', params: { id: item.id } })} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? colors.muted : 'transparent' })}>
              <Avatar uri={u.avatarUrl} size={52} verified={u.verified} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="bodyMedium">{u.name}</Text>
                  <Text variant="caption" tone={unread ? 'brand' : 'tertiary'}>{item.lastMessage ? formatRelativeTime(item.lastMessage.at) : ''}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text tone={unread ? 'primary' : 'secondary'} numberOfLines={1} style={{ flex: 1, fontFamily: unread ? 'Inter_500Medium' : undefined }}>
                    {item.lastMessage?.fromMe ? 'You: ' : ''}{item.lastMessage?.text}
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
