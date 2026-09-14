import { FlatList, View } from 'react-native';
import { confirm } from '@/lib/confirm';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatRelativeTime, useApi, type DeviceSession } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useMobileRuntime } from '@/lib/auth';
import { useTheme } from '@/theme';

const KEY = ['auth', 'sessions'] as const;

export default function SessionsScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const api = useApi();
  const qc = useQueryClient();
  const { signOut } = useMobileRuntime();
  const sessions = useQuery({ queryKey: KEY, queryFn: () => api.auth.sessions() });
  const revoke = useMutation({ mutationFn: (id: string) => api.auth.revokeSession(id), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
  const logoutAll = useMutation({ mutationFn: () => api.auth.logoutAll(), onSuccess: async () => { await signOut(); router.replace('/(auth)/login'); } });

  // Sessions only carry a user agent; derive a friendly device label from it.
  const describe = (s: DeviceSession): { label: string; icon: keyof typeof Ionicons.glyphMap } => {
    const ua = s.userAgent ?? '';
    if (/Ezyify|okhttp|Android/i.test(ua)) return { label: 'Android app', icon: 'phone-portrait-outline' };
    if (/iPhone|iPad|Darwin/i.test(ua)) return { label: 'iPhone app', icon: 'phone-portrait-outline' };
    if (/Chrome|Safari|Firefox|Edg/i.test(ua)) return { label: 'Web browser', icon: 'laptop-outline' };
    return { label: 'Unknown device', icon: 'help-circle-outline' };
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Devices & sessions" />
      <FlatList
        data={sessions.data ?? []}
        keyExtractor={s => s.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        refreshing={sessions.isRefetching}
        onRefresh={() => sessions.refetch()}
        ListHeaderComponent={<Text variant="caption" tone="secondary" style={{ paddingBottom: 6 }}>Every device signed in to your account. Sign out of any you don&apos;t recognise.</Text>}
        ListEmptyComponent={
          sessions.isLoading ? <View style={{ gap: 10 }}>{[0, 1].map(i => <Skeleton key={i} height={72} radius={16} />)}</View> : sessions.error ? <ErrorState error={sessions.error} onRetry={() => sessions.refetch()} /> : (
            <EmptyState icon="phone-portrait-outline" title="No other sessions" body="Only this device is signed in." />
          )
        }
        ListFooterComponent={
          (sessions.data?.length ?? 0) > 1 ? (
            <View style={{ paddingTop: 12 }}>
              <Button label="Sign out of all devices" variant="destructive" size="lg" fullWidth loading={logoutAll.isPending} onPress={async () => (await confirm({ title: 'Sign out everywhere?', message: 'You will need to sign in again on every device, including this one.', confirmLabel: 'Sign out all', destructive: true })) && logoutAll.mutate()} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: item.current ? 2 : 1, borderColor: item.current ? colors.primary : colors.borderSubtle }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={describe(item).icon} size={20} color={colors.foregroundSecondary} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyMedium">{describe(item).label}{item.current ? ' · This device' : ''}</Text>
              <Text variant="caption" tone="secondary">{item.ip ? `${item.ip} · ` : ''}Signed in {formatRelativeTime(item.createdAt)}</Text>
            </View>
            {!item.current && <Button label="Sign out" variant="ghost" size="sm" loading={revoke.isPending && revoke.variables === item.id} onPress={() => revoke.mutate(item.id)} />}
          </View>
        )}
      />
      {revoke.error ? <ErrorState compact error={revoke.error} /> : null}
    </View>
  );
}
