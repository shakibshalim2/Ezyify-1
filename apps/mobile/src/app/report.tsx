import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReportRequestSchema, useApi, useAuth, useBlockUser, useBlockedUsers, type ReportRequest } from '@ezyify/core';
import { ErrorState } from '@/components/QueryState';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useTheme } from '@/theme';
import { goBack } from '@/lib/links';

const REASONS: { id: ReportRequest['reason']; label: string; hint: string }[] = [
  { id: 'spam', label: 'Spam or misleading', hint: 'Fake engagement, repetitive posts, clickbait' },
  { id: 'scam', label: 'Scam or fraud', hint: 'Fake products, payment outside escrow, phishing' },
  { id: 'counterfeit', label: 'Counterfeit product', hint: 'Replica or unlicensed goods' },
  { id: 'harassment', label: 'Harassment or bullying', hint: 'Threats, insults, unwanted contact' },
  { id: 'hate', label: 'Hate speech', hint: 'Attacks on protected groups' },
  { id: 'nudity', label: 'Nudity or sexual content', hint: '' },
  { id: 'child_safety', label: 'Child safety', hint: 'Sexualisation, exploitation or endangerment of a minor — reviewed first' },
  { id: 'violence', label: 'Violence or dangerous acts', hint: '' },
  { id: 'self_harm', label: 'Self-harm', hint: 'We’ll also share support resources' },
  { id: 'ip', label: 'Intellectual property', hint: 'Copyright or trademark' },
  { id: 'other', label: 'Something else', hint: '' },
];

/** UGC policy: report + block in ≤ 2 taps from any content or profile. Opened as `/report?type=post&id=…&user=…`. */
export default function ReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const { type, id, user } = useLocalSearchParams<{ type: ReportRequest['targetType']; id: string; user?: string }>();
  const api = useApi();
  const authed = useAuth(s => s.status === 'authenticated');
  const blockedList = useBlockedUsers();
  const block = useBlockUser();
  const blocked = !!user && (blockedList.data ?? []).some(b => b.id === user);
  const [reason, setReason] = useState<ReportRequest['reason'] | null>(null);
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const submit = async () => {
    const body = ReportRequestSchema.safeParse({ targetType: type, targetId: id, reason, details: details || undefined });
    if (!body.success) return;
    if (!authed) return router.push('/(auth)/login');
    setBusy(true);
    setError(null);
    try {
      await api.moderation.report(body.data);
      setDone(true);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  const toggleBlock = (userId: string) => block.mutate({ userId, blocked });

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Report" back={false} right={<Pressable accessibilityRole="button" onPress={() => goBack(router)} hitSlop={8}><Text variant="label" tone="brand">Done</Text></Pressable>} />
        <View style={{ padding: 24, alignItems: 'center', gap: 16 }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.successSubtle, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="shield-checkmark" size={40} color={colors.success} /></View>
          <Text variant="title" style={{ textAlign: 'center' }}>Thanks for letting us know</Text>
          <Text tone="secondary" style={{ textAlign: 'center' }}>Our team reviews reports within 24 hours. Reports are anonymous — the person won’t know who reported them.</Text>
          {user && (
            <View style={{ width: '100%', gap: 8, marginTop: 8 }}>
              <Button label={blocked ? 'Unblock user' : 'Block this user'} variant="secondary" size="lg" fullWidth loading={block.isPending} onPress={() => toggleBlock(user)} />
              <Text variant="caption" tone="tertiary" style={{ textAlign: 'center' }}>Blocked users can’t see your profile, message you or find your content.</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={`Report ${type ?? 'content'}`} back={false} right={<Pressable accessibilityRole="button" onPress={() => goBack(router)} hitSlop={8}><Text variant="label" tone="secondary">Cancel</Text></Pressable>} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <Text variant="heading">What’s wrong with it?</Text>
        {REASONS.map(r => {
          const on = reason === r.id;
          return (
            <Pressable key={r.id} accessibilityRole="radio" aria-checked={on} onPress={() => setReason(r.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.card, borderWidth: on ? 2 : 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySubtle : colors.card }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{r.label}</Text>
                {r.hint ? <Text variant="caption" tone="secondary">{r.hint}</Text> : null}
              </View>
              <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? colors.primary : colors.borderStrong} />
            </Pressable>
          );
        })}
        <View style={{ marginTop: 8 }}>
          <Field label="Add details (optional)" placeholder="What happened?" value={details} onChangeText={setDetails} multiline maxLength={1000} />
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
        {error ? <ErrorState compact error={error} /> : null}
        <Button label="Submit report" variant="primary" size="lg" fullWidth disabled={!reason} loading={busy} onPress={submit} />
      </View>
    </View>
  );
}
