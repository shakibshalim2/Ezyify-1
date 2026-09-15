import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useBlockUser, useBlockedUsers } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useTheme } from '@/theme';

export default function BlockedScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const blocked = useBlockedUsers();
  const block = useBlockUser();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Blocked accounts" />
      <FlatList
        data={blocked.data ?? []}
        keyExtractor={u => u.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshing={blocked.isRefetching}
        onRefresh={() => blocked.refetch()}
        ListHeaderComponent={<Text variant="caption" tone="secondary" style={{ paddingBottom: 6 }}>Blocked people can&apos;t see your profile or posts, message you, or find your content.</Text>}
        ListEmptyComponent={
          blocked.isLoading ? <View style={{ gap: 10 }}>{[0, 1].map(i => <Skeleton key={i} height={68} radius={16} />)}</View> : blocked.error ? <ErrorState error={blocked.error} onRetry={() => blocked.refetch()} /> : (
            <EmptyState icon="ban-outline" title="No blocked accounts" body="Block someone from their profile or from any post's menu." />
          )
        }
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle }}>
            <Avatar uri={item.avatarUrl} name={item.name} size={44} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: item.username } })}>{item.name}</Text>
              <Text variant="caption" tone="secondary">@{item.username}</Text>
            </View>
            <Button label="Unblock" variant="secondary" size="sm" loading={block.isPending && block.variables?.userId === item.id} onPress={() => block.mutate({ userId: item.id, blocked: true })} />
          </View>
        )}
      />
    </View>
  );
}
