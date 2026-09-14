import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { requestPush } from '@/lib/push';
import { biometricsAvailable } from '@/lib/biometrics';
import { useAddresses, useApi, useAuth, useBlockedUsers } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { useMobileRuntime } from '@/lib/auth';
import { useAppStore } from '@/store/app';
import { useTheme } from '@/theme';

type Row = { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; toggle?: boolean; toggleValue?: boolean; onToggle?: (v: boolean) => void; danger?: boolean; onPress?: () => void };

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const user = useAuth(s => s.user);
  const { signOut } = useMobileRuntime();
  const [signingOut, setSigningOut] = useState(false);
  const interests = useAppStore(s => s.interests);
  const blocked = useBlockedUsers();
  const addresses = useAddresses();
  const api = useApi();
  const setPushAsked = useAppStore(s => s.setPushAsked);
  const [pushOn, setPushOn] = useState(false);
  const [bioOk, setBioOk] = useState(false);
  const [privateAcct, setPrivateAcct] = useState(false);
  useEffect(() => {
    biometricsAvailable().then(setBioOk);
  }, []);
  const enablePush = async (v: boolean) => {
    if (!v) return setPushOn(false);
    const r = await requestPush();
    setPushAsked();
    setPushOn(r.status === 'granted');
  };

  const groups: { title: string; rows: Row[] }[] = [
    { title: 'Account', rows: [
      { icon: 'person-outline', label: 'Edit profile', onPress: () => router.push('/settings/edit-profile') },
      { icon: 'heart-outline', label: 'Interests', value: `${interests.length} topics`, onPress: () => router.push('/(onboarding)/interests') },
      { icon: 'location-outline', label: 'Addresses', value: addresses.data ? `${addresses.data.length} saved` : '—', onPress: () => router.push('/settings/addresses') },
      { icon: 'wallet-outline', label: 'Wallet', onPress: () => router.push('/wallet') },
      { icon: 'receipt-outline', label: 'Orders', onPress: () => router.push('/orders') },
    ]},
    { title: 'Preferences', rows: [
      { icon: 'notifications-outline', label: 'Push notifications', toggle: true, toggleValue: pushOn, onToggle: enablePush },
      { icon: 'moon-outline', label: 'Appearance', value: 'System' },
      { icon: 'language-outline', label: 'Language', value: 'English' },
    ]},
    { title: 'Privacy & security', rows: [
      { icon: 'lock-closed-outline', label: 'Private account', toggle: true, toggleValue: privateAcct, onToggle: setPrivateAcct },
      { icon: 'finger-print-outline', label: 'Biometric unlock', value: bioOk ? 'Available' : 'Not set up on device' },
      { icon: 'phone-portrait-outline', label: 'Devices & sessions', onPress: () => router.push('/settings/sessions') },
      { icon: 'download-outline', label: 'Download your data', onPress: () => Alert.alert('Export your data', "We'll email you a download link within 24 hours.", [{ text: 'Cancel', style: 'cancel' }, { text: 'Request export', onPress: () => api.account.exportData().then(() => Alert.alert('Request received', 'Check your inbox soon.')).catch(() => Alert.alert('Something went wrong', 'Please try again later.')) }]) },
      { icon: 'ban-outline', label: 'Blocked accounts', value: `${blocked.data?.length ?? 0}`, onPress: () => router.push('/settings/blocked') },
    ]},
    { title: 'Support', rows: [
      { icon: 'help-circle-outline', label: 'Help center', onPress: () => WebBrowser.openBrowserAsync('https://ezyify.app/help') },
      { icon: 'document-text-outline', label: 'Terms of service', onPress: () => WebBrowser.openBrowserAsync('https://ezyify.app/legal/terms') },
      { icon: 'shield-outline', label: 'Privacy policy', onPress: () => WebBrowser.openBrowserAsync('https://ezyify.app/legal/privacy') },
      { icon: 'flag-outline', label: 'Report a problem', onPress: () => router.push({ pathname: '/report', params: { type: 'user', id: 'app' } }) },
      { icon: 'trash-outline', label: 'Delete account', danger: true, onPress: () => router.push('/settings/delete-account') },
    ]},
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 }}>
        {user && <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: user.username } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle }}>
          <Avatar uri={user.avatarUrl} size={56} verified={user.verified} />
          <View style={{ flex: 1 }}>
            <Text variant="heading">{user.name}</Text>
            <Text variant="caption" tone="secondary">@{user.username}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.foregroundTertiary} />
        </Pressable>}

        {groups.map(g => (
          <View key={g.title} style={{ gap: 8 }}>
            <Text variant="caption" tone="secondary" style={{ letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: 'Inter_600SemiBold', paddingLeft: 4 }}>{g.title}</Text>
            <View style={{ backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle, overflow: 'hidden' }}>
              {g.rows.map((r, i) => (
                <Pressable key={r.label} accessibilityRole="button" onPress={r.onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, height: 52, borderTopWidth: i ? 1 : 0, borderTopColor: colors.borderSubtle, backgroundColor: pressed ? colors.muted : 'transparent' })}>
                  <Ionicons name={r.icon} size={20} color={r.danger ? colors.error : colors.foregroundSecondary} />
                  <Text style={{ flex: 1, color: r.danger ? colors.error : colors.foreground }}>{r.label}</Text>
                  {r.toggle ? <Switch value={r.toggleValue ?? false} onValueChange={r.onToggle} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" /> : (
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

        <Button label="Sign out" variant="secondary" size="lg" fullWidth loading={signingOut} onPress={async () => { setSigningOut(true); await signOut(); router.replace('/(auth)/login'); }} />
        <Text variant="caption" tone="tertiary" style={{ textAlign: 'center' }}>Ezyify v{Constants.expoConfig?.version} · {Constants.expoConfig?.android?.package}</Text>
      </ScrollView>
    </View>
  );
}
