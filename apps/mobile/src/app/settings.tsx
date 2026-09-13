import { Pressable, ScrollView, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { me } from '@/lib/mock';
import { useAppStore } from '@/store/app';
import { useTheme } from '@/theme';

type Row = { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; toggle?: boolean; danger?: boolean; onPress?: () => void };

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const user = useAuth(s => s.user) ?? me;
  const clear = useAuth(s => s.clear);
  const interests = useAppStore(s => s.interests);

  const groups: { title: string; rows: Row[] }[] = [
    { title: 'Account', rows: [
      { icon: 'person-outline', label: 'Edit profile' },
      { icon: 'heart-outline', label: 'Interests', value: `${interests.length} topics`, onPress: () => router.push('/(onboarding)/interests') },
      { icon: 'location-outline', label: 'Addresses', value: '1 saved' },
      { icon: 'card-outline', label: 'Payment methods', value: 'Visa •••• 4242' },
    ]},
    { title: 'Preferences', rows: [
      { icon: 'notifications-outline', label: 'Push notifications', toggle: true },
      { icon: 'moon-outline', label: 'Appearance', value: 'System' },
      { icon: 'language-outline', label: 'Language', value: 'English' },
    ]},
    { title: 'Privacy & security', rows: [
      { icon: 'lock-closed-outline', label: 'Private account', toggle: true },
      { icon: 'finger-print-outline', label: 'Biometric unlock', toggle: true },
      { icon: 'shield-checkmark-outline', label: 'Two-factor authentication', value: 'Off' },
      { icon: 'download-outline', label: 'Download your data' },
    ]},
    { title: 'Support', rows: [
      { icon: 'help-circle-outline', label: 'Help center' },
      { icon: 'document-text-outline', label: 'Terms & privacy policy' },
      { icon: 'trash-outline', label: 'Delete account', danger: true },
    ]},
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 }}>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: user.username } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle }}>
          <Avatar uri={user.avatarUrl} size={56} verified={user.verified} />
          <View style={{ flex: 1 }}>
            <Text variant="heading">{user.name}</Text>
            <Text variant="caption" tone="secondary">@{user.username}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.foregroundTertiary} />
        </Pressable>

        {groups.map(g => (
          <View key={g.title} style={{ gap: 8 }}>
            <Text variant="caption" tone="secondary" style={{ letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Inter_600SemiBold', paddingLeft: 4 }}>{g.title}</Text>
            <View style={{ backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle, overflow: 'hidden' }}>
              {g.rows.map((r, i) => (
                <Pressable key={r.label} accessibilityRole="button" onPress={r.onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, height: 52, borderTopWidth: i ? 1 : 0, borderTopColor: colors.borderSubtle, backgroundColor: pressed ? colors.muted : 'transparent' })}>
                  <Ionicons name={r.icon} size={20} color={r.danger ? colors.error : colors.foregroundSecondary} />
                  <Text style={{ flex: 1, color: r.danger ? colors.error : colors.foreground }}>{r.label}</Text>
                  {r.toggle ? <Switch value={r.label !== 'Private account'} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" /> : (
                    <>
                      {r.value && <Text variant="caption" tone="secondary">{r.value}</Text>}
                      <Ionicons name="chevron-forward" size={16} color={colors.foregroundTertiary} />
                    </>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Button label="Sign out" variant="secondary" size="lg" fullWidth onPress={() => { clear(); router.replace('/(auth)/login'); }} />
        <Text variant="caption" tone="tertiary" style={{ textAlign: 'center' }}>Ezyify v{Constants.expoConfig?.version} · {Constants.expoConfig?.android?.package}</Text>
      </ScrollView>
    </View>
  );
}
