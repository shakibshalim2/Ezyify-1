import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar } from './Avatar';
import { Text } from './Text';
import { Badge } from './Badge';
import { stories, me } from '@/lib/mock';
import { useTheme } from '@/theme';

export function StoriesRail() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Add to your story" onPress={() => router.push('/create')} style={{ alignItems: 'center', gap: 6, width: 68 }}>
        <View>
          <Avatar uri={me.avatarUrl} size={60} ring="seen" />
          <View style={{ position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={14} color={colors.primaryForeground} />
          </View>
        </View>
        <Text variant="caption" numberOfLines={1}>Your story</Text>
      </Pressable>
      {stories.map(s => (
        <Pressable key={s.id} accessibilityRole="button" accessibilityLabel={`${s.user.name}'s story`} onPress={() => router.push({ pathname: '/story/[id]', params: { id: s.id } })} style={{ alignItems: 'center', gap: 6, width: 68 }}>
          <View>
            <Avatar uri={s.user.avatarUrl} size={60} ring={s.live ? 'live' : s.seen ? 'seen' : 'story'} />
            {s.live && <View style={{ position: 'absolute', bottom: -6, alignSelf: 'center' }}><Badge label="LIVE" tone="live" /></View>}
          </View>
          <Text variant="caption" tone={s.seen ? 'tertiary' : 'primary'} numberOfLines={1}>{s.user.username}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
