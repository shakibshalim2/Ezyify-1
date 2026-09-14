import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { AuthShell } from '@/components/AuthShell';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formErrors, useMobileRuntime } from '@/lib/auth';
import { useTheme } from '@/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { api } = useMobileRuntime();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!z.string().email().safeParse(email).success) return setError('Enter a valid email address');
    setError(undefined);
    setLoading(true);
    try {
      await api.auth.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      const { fields, message } = formErrors(err);
      setError(fields.email ?? message ?? undefined);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle={`If an account exists for ${email}, you'll get a reset link within a few minutes.`}>
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View style={{ width: 88, height: 88, borderRadius: radius.card, backgroundColor: colors.successSubtle, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="mail-open-outline" size={40} color={colors.success} />
          </View>
        </View>
        <Button label="Back to sign in" variant="gradient" size="lg" fullWidth onPress={() => router.replace('/(auth)/login')} />
        <Button label="Use a different email" variant="ghost" size="md" fullWidth onPress={() => setSent(false)} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter the email linked to your account and we'll send you a reset link.">
      <Field label="Email" icon="mail-outline" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} error={error} onSubmitEditing={submit} returnKeyType="send" />
      <Button label="Send reset link" variant="gradient" size="lg" fullWidth loading={loading} onPress={submit} />
      <Text variant="caption" tone="tertiary" style={{ textAlign: 'center' }}>For your security, links expire after 30 minutes.</Text>
    </AuthShell>
  );
}
