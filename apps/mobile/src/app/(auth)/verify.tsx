import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formErrors, useMobileRuntime } from '@/lib/auth';
import { useAppStore } from '@/store/app';
import { fontFamily, useTheme } from '@/theme';

const LEN = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const { email, userId } = useLocalSearchParams<{ email?: string; userId?: string }>();
  const { colors, radius } = useTheme();
  const { api, commitSession } = useMobileRuntime();
  const markSeen = useAppStore(s => s.markOnboardingSeen);
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<TextInput>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const submit = async (value = code) => {
    if (value.length !== LEN) return;
    if (!userId) {
      setError('This link has expired. Please sign up again.');
      return;
    }
    setLoading(true);
    try {
      const session = await api.auth.verifyOtp({ userId, otp: value, type: 'email' });
      await commitSession(session);
      markSeen();
      router.replace('/(onboarding)/interests');
    } catch (err) {
      const { fields, message } = formErrors(err);
      setError(fields.otp ?? message ?? 'That code is not valid. Try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Check your inbox" subtitle={`We sent a 6-digit code to ${email ?? 'your email'}. Enter it below to verify your account.`}>
      <Pressable accessibilityLabel="Verification code" onPress={() => input.current?.focus()} style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
        {Array.from({ length: LEN }).map((_, i) => {
          const active = i === code.length;
          return (
            <View key={i} style={{ flex: 1, height: 60, borderRadius: radius.md, borderWidth: active ? 2 : 1, borderColor: error ? colors.error : active ? colors.primary : colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fontFamily.display, fontSize: 24, color: colors.foreground }}>{code[i] ?? ''}</Text>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={input}
        autoFocus
        value={code}
        onChangeText={v => {
          const next = v.replace(/\D/g, '').slice(0, LEN);
          setCode(next);
          setError(null);
          if (next.length === LEN) submit(next);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={LEN}
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />
      {error && <Text variant="caption" style={{ color: colors.error }}>{error}</Text>}
      <Button label="Verify" variant="gradient" size="lg" fullWidth loading={loading} disabled={code.length !== LEN} onPress={() => submit()} />
      <View style={{ alignItems: 'center', gap: 4 }}>
        {seconds > 0 ? (
          <Text variant="caption" tone="secondary">Resend code in 0:{String(seconds).padStart(2, '0')}</Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setSeconds(45)}><Text variant="label" tone="brand">Resend code</Text></Pressable>
        )}
      </View>
    </AuthShell>
  );
}
