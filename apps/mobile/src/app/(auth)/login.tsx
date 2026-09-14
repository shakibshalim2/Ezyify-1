import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LoginRequestSchema } from '@ezyify/core';
import { AuthShell, AuthDivider } from '@/components/AuthShell';
import { SocialRow } from '@/components/SocialButton';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { formErrors, useMobileRuntime } from '@/lib/auth';
import { API_MODE } from '@/lib/runtime';
import { MOCK_CREDENTIALS } from '@ezyify/core/mock';
import { useAppStore } from '@/store/app';
import { useTheme } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { api, commitSession } = useMobileRuntime();
  const markSeen = useAppStore(s => s.markOnboardingSeen);
  const [banner, setBanner] = useState<string | null>(null);
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const r = LoginRequestSchema.safeParse({ identifier, password });
    if (!r.success) {
      const e: typeof errors = {};
      for (const i of r.error.issues) e[i.path[0] as keyof typeof errors] = i.message === 'String must contain at least 3 character(s)' ? `Enter your ${method}` : i.message === 'String must contain at least 1 character(s)' ? 'Enter your password' : i.message;
      setErrors(e);
      return;
    }
    setErrors({});
    setBanner(null);
    setLoading(true);
    try {
      const session = await api.auth.login({ identifier: identifier.trim(), password });
      await commitSession(session);
      markSeen();
      router.replace('/(tabs)/home');
    } catch (err) {
      const { fields, message } = formErrors(err);
      setErrors(fields);
      setBanner(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep shopping, creating and connecting."
      footer={
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text tone="secondary">New to Ezyify?</Text>
          <Link href="/(auth)/signup" asChild><Pressable accessibilityRole="link"><Text variant="bodyMedium" tone="brand">Create an account</Text></Pressable></Link>
        </View>
      }
    >
      {API_MODE === 'mock' && (
        <Pressable accessibilityRole="button" onPress={() => { setMethod('email'); setIdentifier(MOCK_CREDENTIALS.email); setPassword(MOCK_CREDENTIALS.password); }} style={{ padding: 12, borderRadius: 12, backgroundColor: colors.primarySubtle, gap: 2 }}>
          <Text variant="label" tone="brand">Demo mode</Text>
          <Text variant="caption" tone="secondary">Tap to fill the demo account ({MOCK_CREDENTIALS.email})</Text>
        </Pressable>
      )}
      {banner && (
        <View accessibilityRole="alert" style={{ padding: 12, borderRadius: 12, backgroundColor: colors.errorSubtle }}>
          <Text variant="caption" style={{ color: colors.error }}>{banner}</Text>
        </View>
      )}
      <SocialRow onPick={() => undefined} />
      <AuthDivider label="or sign in with" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="Email" icon="mail-outline" selected={method === 'email'} onPress={() => setMethod('email')} />
        <Chip label="Phone" icon="call-outline" selected={method === 'phone'} onPress={() => setMethod('phone')} />
      </View>
      {method === 'email' ? (
        <Field testID="login-email" label="Email" icon="mail-outline" placeholder="you@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={identifier} onChangeText={setIdentifier} error={errors.identifier} />
      ) : (
        <Field label="Phone number" icon="call-outline" placeholder="+62 812 3456 7890" autoComplete="tel" keyboardType="phone-pad" value={identifier} onChangeText={setIdentifier} error={errors.identifier} />
      )}
      <Field testID="login-password" label="Password" icon="lock-closed-outline" placeholder="••••••••" secureTextEntry autoComplete="password" value={password} onChangeText={setPassword} error={errors.password} onSubmitEditing={submit} returnKeyType="go" />
      <Link href="/(auth)/forgot-password" asChild>
        <Pressable accessibilityRole="link" style={{ alignSelf: 'flex-end' }}><Text variant="label" tone="brand">Forgot password?</Text></Pressable>
      </Link>
      <Button label="Sign in" variant="gradient" size="lg" fullWidth loading={loading} onPress={submit} />
    </AuthShell>
  );
}
