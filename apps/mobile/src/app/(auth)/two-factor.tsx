import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Text } from '@/components/Text';
import { formErrors, useMobileRuntime } from '@/lib/auth';
import { useAppStore } from '@/store/app';
import { fontFamily, useTheme } from '@/theme';

const LEN = 6;

/** Login step-up for accounts with TOTP enabled — reached from login with `challengeToken`. */
export default function TwoFactorScreen() {
  const router = useRouter();
  const { challengeToken } = useLocalSearchParams<{ challengeToken?: string }>();
  const { colors, radius } = useTheme();
  const { api, commitSession } = useMobileRuntime();
  const markSeen = useAppStore(s => s.markOnboardingSeen);
  const [useRecovery, setUseRecovery] = useState(false);
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<TextInput>(null);

  const submit = async (value: string) => {
    if (!value || loading) return;
    if (!challengeToken) {
      setError('This sign-in attempt has expired. Please sign in again.');
      return;
    }
    setLoading(true);
    try {
      const session = await api.auth.mfa.verify({ challengeToken, code: value.trim() });
      await commitSession(session);
      markSeen();
      router.replace('/(tabs)/home');
    } catch (err) {
      const { fields, message } = formErrors(err);
      const msg = fields.code ?? message ?? 'That code is not valid. Try again.';
      setError(msg);
      setCode('');
      if (/expired|invalid challenge|sign in again|too many/i.test(msg)) setTimeout(() => router.replace('/(auth)/login'), 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Two-factor check"
      subtitle={useRecovery ? 'Enter one of the recovery codes you saved when you set up two-factor authentication.' : 'Open your authenticator app and enter the 6-digit code for Ezyify.'}
    >
      {useRecovery ? (
        <Field
          testID="mfa-recovery"
          label="Recovery code"
          icon="key-outline"
          placeholder="xxxxx-xxxxx"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="one-time-code"
          value={recovery}
          onChangeText={v => {
            setRecovery(v);
            setError(null);
          }}
          error={error ?? undefined}
          onSubmitEditing={() => submit(recovery)}
          returnKeyType="go"
        />
      ) : (
        <>
          <Pressable accessibilityLabel="Authenticator code" onPress={() => input.current?.focus()} style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
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
            testID="mfa-code"
            autoFocus
            value={code}
            onChangeText={v => {
              const next = v.replace(/\D/g, '').slice(0, LEN);
              setCode(next);
              setError(null);
              if (next.length === LEN) void submit(next);
            }}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={LEN}
            style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
          />
          {error && (
            <Text variant="caption" accessibilityRole="alert" style={{ color: colors.error }}>
              {error}
            </Text>
          )}
        </>
      )}
      <Button
        testID="mfa-submit"
        label={useRecovery ? 'Use recovery code' : 'Verify'}
        variant="gradient"
        size="lg"
        fullWidth
        loading={loading}
        disabled={useRecovery ? recovery.trim().length < 6 : code.length !== LEN}
        onPress={() => void submit(useRecovery ? recovery : code)}
      />
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setUseRecovery(v => !v);
            setError(null);
            setCode('');
          }}
        >
          <Text variant="label" tone="brand">
            {useRecovery ? 'Use my authenticator app instead' : 'Lost your device? Use a recovery code'}
          </Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
