import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { useAppStore } from '@/store/app';
import { users } from '@/lib/mock';
import { useTheme } from '@/theme';

export default function FollowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const followed = useAppStore(s => s.followedIds);
  const toggleFollow = useAppStore(s => s.toggleFollow);

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
          {users.map(u => {
            const on = followed.includes(u.id);
            return (
              <Card key={u.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
                <Avatar uri={u.avatarUrl} size={48} verified={u.verified} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">{u.name}</Text>
                  <Text variant="caption" tone="secondary">@{u.username} · {u.role === 'seller' ? 'Seller' : 'Creator'}</Text>
                </View>
                <Button label={on ? 'Following' : 'Follow'} variant={on ? 'secondary' : 'primary'} size="sm" onPress={() => toggleFollow(u.id)} />
              </Card>
            );
          })}
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
        <Button label={followed.length ? `Continue · ${followed.length} following` : 'Continue'} variant="gradient" size="lg" fullWidth onPress={() => router.replace('/(tabs)/home')} />
      </View>
    </View>
  );
}
