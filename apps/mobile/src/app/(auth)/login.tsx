import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LoginRequestSchema, useAuth } from '@ezyify/core';
import { AuthShell, AuthDivider } from '@/components/AuthShell';
import { SocialRow } from '@/components/SocialButton';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { mockLogin } from '@/lib/auth';
import { useAppStore } from '@/store/app';

export default function LoginScreen() {
  const router = useRouter();
  const setSession = useAuth(s => s.setSession);
  const markSeen = useAppStore(s => s.markOnboardingSeen);
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
    setLoading(true);
    const session = await mockLogin(identifier);
    setSession(session);
    markSeen();
    setLoading(false);
    router.replace('/(tabs)/home');
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
