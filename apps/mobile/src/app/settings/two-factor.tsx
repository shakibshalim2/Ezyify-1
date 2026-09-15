import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useMfaActions, useMfaStatus, type MfaSetupResponse } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { confirm } from '@/lib/confirm';
import { formErrors } from '@/lib/auth';
import { fontFamily, useTheme } from '@/theme';

type Step = 'idle' | 'setup' | 'codes' | 'disable';

/**
 * TOTP management. On a phone the authenticator usually lives on the same device, so instead of a QR we offer
 * "Open in authenticator" (otpauth:// deep link) plus the manual key.
 */
export default function TwoFactorScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const status = useMfaStatus();
  const { setup, enable, disable } = useMfaActions();
  const [step, setStep] = useState<Step>('idle');
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const begin = async () => {
    setError(null);
    try {
      setSetupData(await setup.mutateAsync());
      setCode('');
      setStep('setup');
    } catch (err) {
      setError(formErrors(err).message ?? 'Could not start two-factor setup');
    }
  };

  const openAuthenticator = async () => {
    if (!setupData) return;
    const { Linking } = await import('react-native');
    const ok = await Linking.canOpenURL(setupData.otpauthUrl).catch(() => false);
    if (ok) return Linking.openURL(setupData.otpauthUrl);
    await WebBrowser.openBrowserAsync('https://support.google.com/accounts/answer/1066447');
  };

  const confirmEnable = async () => {
    if (code.length !== 6) return;
    setError(null);
    try {
      const res = await enable.mutateAsync(code);
      setRecoveryCodes(res.recoveryCodes);
      setStep('codes');
    } catch (err) {
      const { fields, message } = formErrors(err);
      setError(fields.code ?? message ?? 'That code didn’t match. Codes rotate every 30 seconds — try the newest one.');
      setCode('');
    }
  };

  const turnOff = async () => {
    if (code.trim().length < 6) return;
    if (!(await confirm({ title: 'Turn off two-factor?', message: 'Your account will only be protected by your password.', confirmLabel: 'Turn off', destructive: true }))) return;
    setError(null);
    try {
      await disable.mutateAsync(code.trim());
      setStep('idle');
      setCode('');
    } catch (err) {
      const { fields, message } = formErrors(err);
      setError(fields.code ?? message ?? 'That code didn’t match.');
    }
  };

  const enabled = status.data?.enabled ?? false;
  const required = status.data?.requiredForRole ?? false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Two-factor authentication" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        {status.isLoading ? (
          <Skeleton height={88} radius={16} />
        ) : status.error ? (
          <ErrorState error={status.error} onRetry={() => status.refetch()} />
        ) : (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: enabled ? colors.successSubtle : colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={enabled ? 'shield-checkmark-outline' : 'phone-portrait-outline'} size={22} color={enabled ? colors.success : colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyMedium">Authenticator app</Text>
                <Text variant="caption" tone="secondary">
                  {enabled ? `On · ${status.data?.recoveryCodesLeft ?? 0} recovery codes left` : 'Google Authenticator, 1Password, Authy or any TOTP app'}
                </Text>
              </View>
            </View>
            {required && !enabled && (
              <View accessibilityRole="alert" style={{ marginTop: 12, padding: 12, borderRadius: radius.md, backgroundColor: colors.warningSubtle }}>
                <Text variant="caption">Required for seller and admin accounts — protects payouts and customer data.</Text>
              </View>
            )}
            {step === 'idle' && (
              <View style={{ marginTop: 14 }}>
                {enabled ? (
                  <Button label="Turn off" variant="secondary" size="md" fullWidth onPress={() => { setCode(''); setError(null); setStep('disable'); }} />
                ) : (
                  <Button testID="mfa-setup" label="Set up" size="md" fullWidth loading={setup.isPending} onPress={begin} />
                )}
              </View>
            )}
          </Card>
        )}

        {step === 'setup' && setupData && (
          <Card>
            <Text variant="title">1. Add Ezyify to your authenticator</Text>
            <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>Tap below if the app is on this phone, or copy the key into it manually.</Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              <Button label="Open in authenticator" variant="secondary" size="md" fullWidth onPress={openAuthenticator} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share setup key"
                onPress={() => Share.share({ message: setupData.secret })}
                style={{ padding: 12, borderRadius: radius.md, backgroundColor: colors.muted, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: fontFamily.bodySemibold, letterSpacing: 2, color: colors.foreground }} selectable>
                  {setupData.secret}
                </Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>Setup key · tap to share</Text>
              </Pressable>
            </View>
            <Text variant="title" style={{ marginTop: 18 }}>2. Enter the 6-digit code it shows</Text>
            <View style={{ marginTop: 10 }}>
              <Field testID="mfa-enable-code" label="Authenticator code" icon="keypad-outline" keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxLength={6} value={code} onChangeText={v => { setCode(v.replace(/\D/g, '')); setError(null); }} error={error ?? undefined} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <View style={{ flex: 1 }}><Button label="Cancel" variant="ghost" size="md" fullWidth onPress={() => { setStep('idle'); setSetupData(null); setCode(''); setError(null); }} /></View>
              <View style={{ flex: 1 }}><Button testID="mfa-enable" label="Turn on" size="md" fullWidth loading={enable.isPending} disabled={code.length !== 6} onPress={confirmEnable} /></View>
            </View>
          </Card>
        )}

        {step === 'codes' && (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="key-outline" size={20} color={colors.primary} />
              <Text variant="title">Save your recovery codes</Text>
            </View>
            <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>Each code signs you in once if you lose your authenticator. They won’t be shown again.</Text>
            <View style={{ marginTop: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.muted, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {recoveryCodes.map(c => (
                <Text key={c} selectable style={{ width: '47%', fontFamily: fontFamily.bodySemibold, letterSpacing: 1.5, color: colors.foreground }}>
                  {c}
                </Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <View style={{ flex: 1 }}><Button label="Share / save" variant="secondary" size="md" fullWidth onPress={() => Share.share({ title: 'Ezyify recovery codes', message: recoveryCodes.join('\n') })} /></View>
              <View style={{ flex: 1 }}><Button label="I’ve saved them" size="md" fullWidth onPress={() => { setStep('idle'); setSetupData(null); setRecoveryCodes([]); }} /></View>
            </View>
          </Card>
        )}

        {step === 'disable' && (
          <Card>
            <Text variant="title">Confirm with a code</Text>
            <Text variant="caption" tone="secondary" style={{ marginTop: 4 }}>Enter a code from your authenticator, or one of your recovery codes.</Text>
            <View style={{ marginTop: 10 }}>
              <Field label="Authenticator or recovery code" icon="keypad-outline" autoCapitalize="none" autoCorrect={false} autoComplete="one-time-code" value={code} onChangeText={v => { setCode(v); setError(null); }} error={error ?? undefined} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <View style={{ flex: 1 }}><Button label="Keep it on" variant="ghost" size="md" fullWidth onPress={() => { setStep('idle'); setCode(''); setError(null); }} /></View>
              <View style={{ flex: 1 }}><Button label="Turn off" variant="destructive" size="md" fullWidth loading={disable.isPending} disabled={code.trim().length < 6} onPress={turnOff} /></View>
            </View>
          </Card>
        )}

        <Text variant="caption" tone="secondary">You’ll enter a 6-digit code whenever you sign in on a new device. Manage signed-in devices under Devices &amp; sessions.</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/settings/sessions')}>
          <Text variant="label" tone="brand">Devices &amp; sessions →</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
