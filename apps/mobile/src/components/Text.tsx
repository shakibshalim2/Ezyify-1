import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { fontFamily, useTheme } from '@/theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyMedium' | 'caption' | 'label';
type Tone = 'primary' | 'secondary' | 'tertiary' | 'brand' | 'inverse' | 'accent';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
}

/** Typography primitive mirroring the web token scale (display = Plus Jakarta Sans, body = Inter). */
export function Text({ variant = 'body', tone = 'primary', style, ...rest }: TextProps) {
  const { colors, typography } = useTheme();
  const color = {
    primary: colors.foreground,
    secondary: colors.foregroundSecondary,
    tertiary: colors.foregroundTertiary,
    brand: colors.primary,
    inverse: colors.primaryForeground,
    accent: colors.accent,
  }[tone];

  const preset = {
    display: { fontFamily: fontFamily.display, fontSize: typography.size['3xl'], lineHeight: typography.size['3xl'] * 1.15, letterSpacing: -0.5 },
    title: { fontFamily: fontFamily.display, fontSize: typography.size['2xl'], lineHeight: typography.size['2xl'] * 1.2, letterSpacing: -0.3 },
    heading: { fontFamily: fontFamily.displayMedium, fontSize: typography.size.lg, lineHeight: typography.size.lg * 1.3 },
    body: { fontFamily: fontFamily.body, fontSize: typography.size.base, lineHeight: typography.size.base * 1.5 },
    bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: typography.size.base, lineHeight: typography.size.base * 1.5 },
    caption: { fontFamily: fontFamily.body, fontSize: typography.size.xs, lineHeight: typography.size.xs * 1.4 },
    label: { fontFamily: fontFamily.bodySemibold, fontSize: typography.size.sm, lineHeight: typography.size.sm * 1.3 },
  }[variant];

  return <RNText {...rest} style={[preset, { color }, style]} />;
}
