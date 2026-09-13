import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeleteAccountRequestSchema, useAuth, useCart, type DeleteAccountRequest } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Card } from '@/components/Card';
import { authenticate } from '@/lib/biometrics';
import { useAppStore } from '@/store/app';
import { useTheme } from '@/theme';

const REASONS: { id: DeleteAccountRequest['reason']; label: string }[] = [
  { id: 'not_useful', label: "I don't find it useful" },
  { id: 'privacy', label: 'Privacy concerns' },
  { id: 'too_many_notifications', label: 'Too many notifications' },
  { id: 'switching', label: 'Switching to another app' },
  { id: 'other', label: 'Something else' },
];

/**
 * Google Play "Account deletion" policy: discoverable in-app flow, explains what is deleted,
 * and mirrors the web URL https://ezyify.app/account/delete (declared in Play Console Data safety).
 */
export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const clearAuth = useAuth(s => s.clear);
  const clearCart = useCart(s => s.clear);
  const [reason, setReason] = useState<DeleteAccountRequest['reason'] | null>(null);
  const [feedback, setFeedback] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = reason !== null && confirm.trim().toUpperCase() === 'DELETE';

  const submit = async () => {
    const body = DeleteAccountRequestSchema.safeParse({ reason, feedback: feedback || undefined });
    if (!body.success) return setError('Pick a reason to continue.');
    const auth = await authenticate('Confirm it’s you to delete your account');
    if (!auth.success) return setError('Authentication was cancelled.');
    setBusy(true);
    await new Promise(r => setTimeout(r, 900)); // → endpoints.account.requestDeletion(body.data) once apps/api ships
    clearCart();
    clearAuth();
    useAppStore.setState({ onboardingSeen: true, interests: [], likedPostIds: [], savedPostIds: [], followedIds: [] });
    setBusy(false);
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Delete account" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 8 }}>
          <Text variant="display">We’re sorry to see you go</Text>
          <Text tone="secondary">Deleting your account is permanent. Here’s exactly what happens:</Text>
        </View>
        <Card style={{ gap: 12 }}>
          {[
            { icon: 'person-remove-outline', t: 'Profile, posts, loops, stories and comments are deleted within 30 days.' },
            { icon: 'chatbubbles-outline', t: 'Messages you sent stay visible to recipients but are detached from your identity.' },
            { icon: 'receipt-outline', t: 'Order and payment records are retained for up to 7 years where required by tax and consumer law.' },
            { icon: 'wallet-outline', t: 'Withdraw your wallet balance first — funds in open escrow are released or refunded before deletion completes.' },
            { icon: 'time-outline', t: 'You have 14 days to cancel by signing back in.' },
          ].map(r => (
            <View key={r.t} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <Ionicons name={r.icon as never} size={18} color={colors.foregroundSecondary} style={{ marginTop: 2 }} />
              <Text variant="caption" tone="secondary" style={{ flex: 1, lineHeight: 18 }}>{r.t}</Text>
            </View>
          ))}
        </Card>

        <View style={{ gap: 10 }}>
          <Text variant="heading">Why are you leaving?</Text>
          {REASONS.map(r => {
            const on = reason === r.id;
            return (
              <Pressable key={r.id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setReason(r.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.card, borderWidth: on ? 2 : 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySubtle : colors.card }}>
                <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? colors.primary : colors.borderStrong} />
                <Text style={{ flex: 1 }}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <Field label="Anything we could do better? (optional)" placeholder="Your feedback helps us improve" value={feedback} onChangeText={setFeedback} multiline maxLength={500} style={{ minHeight: 40 }} />
        <Field label='Type DELETE to confirm' placeholder="DELETE" autoCapitalize="characters" value={confirm} onChangeText={setConfirm} error={error ?? undefined} />
        <Text variant="caption" tone="tertiary">You can also request deletion on the web at ezyify.app/account/delete.</Text>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 }}>
        <Button label="Delete my account" variant="destructive" size="lg" fullWidth disabled={!ready} loading={busy} onPress={submit} />
        <Button label="Keep my account" variant="ghost" size="md" fullWidth onPress={() => router.back()} />
      </View>
    </View>
  );
}
