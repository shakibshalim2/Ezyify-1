import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PasswordSchema, SignupRequestSchema } from '@ezyify/core';
import { AuthShell, AuthDivider } from '@/components/AuthShell';
import { SocialRow } from '@/components/SocialButton';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { formErrors, useMobileRuntime } from '@/lib/auth';
import { useTheme } from '@/theme';

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function SignupScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { api } = useMobileRuntime();
  const [banner, setBanner] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const s = strength(form.password);
  const strengthColor = [colors.border, colors.error, colors.warning, colors.info, colors.success][s];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][s];

  const submit = async () => {
    const r = SignupRequestSchema.safeParse({ ...form, acceptTerms: terms });
    if (!r.success) {
      const e: Record<string, string> = {};
      for (const i of r.error.issues) e[String(i.path[0])] = i.message;
      if (e.password && !PasswordSchema.safeParse(form.password).success) e.password = 'Use 8+ characters with upper, lower case and a number';
      setErrors(e);
      return;
    }
    setErrors({});
    setBanner(null);
    setLoading(true);
    try {
      const res = await api.auth.signup({ ...r.data, email: form.email.trim().toLowerCase() });
      router.push({ pathname: '/(auth)/verify', params: { email: res.email, userId: res.userId } });
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
      title="Create your account"
      subtitle="Join millions discovering, shopping and selling on Ezyify."
      footer={
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text tone="secondary">Already have an account?</Text>
          <Link href="/(auth)/login" asChild><Pressable accessibilityRole="link"><Text variant="bodyMedium" tone="brand">Sign in</Text></Pressable></Link>
        </View>
      }
    >
      {banner && (
        <View accessibilityRole="alert" style={{ padding: 12, borderRadius: 12, backgroundColor: colors.errorSubtle }}>
          <Text variant="caption" style={{ color: colors.error }}>{banner}</Text>
        </View>
      )}
      <SocialRow onPick={() => undefined} />
      <AuthDivider label="or sign up with email" />
      <Field label="Full name" icon="person-outline" placeholder="Maya Chen" autoComplete="name" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} error={errors.name} />
      <Field label="Email" icon="mail-outline" placeholder="you@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} error={errors.email} />
      <View style={{ gap: 8 }}>
        <Field label="Password" icon="lock-closed-outline" placeholder="At least 8 characters" secureTextEntry autoComplete="new-password" value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} error={errors.password} />
        {form.password.length > 0 && (
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[1, 2, 3, 4].map(i => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= s ? strengthColor : colors.border }} />)}
            </View>
            <Text variant="caption" style={{ color: strengthColor }}>{strengthLabel}</Text>
          </View>
        )}
      </View>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: terms }} onPress={() => setTerms(t => !t)} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <View style={{ width: 22, height: 22, borderRadius: radius.sm - 2, borderWidth: 1.5, borderColor: terms ? colors.primary : colors.borderStrong, backgroundColor: terms ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
          {terms && <Ionicons name="checkmark" size={16} color={colors.primaryForeground} />}
        </View>
        <Text variant="caption" tone="secondary" style={{ flex: 1, lineHeight: 18 }}>
          I agree to the <Text variant="caption" tone="brand">Terms of Service</Text> and <Text variant="caption" tone="brand">Privacy Policy</Text>.
        </Text>
      </Pressable>
      {errors.acceptTerms && <Text variant="caption" style={{ color: colors.error }}>{errors.acceptTerms}</Text>}
      <Button label="Create account" variant="gradient" size="lg" fullWidth loading={loading} onPress={submit} />
    </AuthShell>
  );
}
