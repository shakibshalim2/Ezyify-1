import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Header } from './Header';
import { BrandMark, BrandWordmark } from './BrandMark';

interface AuthShellProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  back?: boolean;
}

/** Auth flow chrome: aurora wash, brand row, title block, keyboard-safe form, sticky footer. */
export function AuthShell({ title, subtitle, footer, back = true, children }: AuthShellProps) {
  const insets = useSafeAreaInsets();
  const { colors, gradients } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[gradients.vivid[0] + '55', gradients.warm[1] + '22', colors.background]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }} />
      <Header back={back} transparent right={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><BrandMark size={28} /><BrandWordmark size={18} /></View>} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 20 }}>
          <Animated.View entering={FadeInDown.duration(350)} style={{ gap: 8 }}>
            <Text variant="display">{title}</Text>
            {subtitle && <Text tone="secondary">{subtitle}</Text>}
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(80).duration(350)} style={{ gap: 16 }}>
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      {footer && <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, paddingTop: 8, alignItems: 'center' }}>{footer}</View>}
    </View>
  );
}

export function AuthDivider({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text variant="caption" tone="tertiary">{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}
