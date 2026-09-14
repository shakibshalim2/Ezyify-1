import { Pressable, StyleSheet, ActivityIndicator, type PressableProps, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'gradient' | 'secondary' | 'ghost' | 'accent' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  textColor?: string;
  style?: ViewStyle;
}

const HEIGHT: Record<Size, number> = { sm: 36, md: 44, lg: 52 };

/** Press feedback: spring scale + light haptic, matching the web `Button` motion spec. */
export function Button({ label, variant = 'primary', size = 'md', loading, fullWidth, disabled, textColor, style, onPress, ...rest }: ButtonProps) {
  const { colors, radius, gradients, motion } = useTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const bg = {
    primary: colors.primary,
    gradient: 'transparent',
    secondary: colors.muted,
    ghost: 'transparent',
    accent: colors.accent,
    destructive: colors.error,
  }[variant];
  let fg = {
    primary: colors.primaryForeground,
    gradient: colors.primaryForeground,
    secondary: colors.foreground,
    ghost: colors.primary,
    accent: colors.accentForeground,
    destructive: '#ffffff',
  }[variant];
  if (textColor) fg = textColor;

  const content = loading ? (
    <ActivityIndicator color={fg} />
  ) : (
    <Text variant="label" numberOfLines={1} style={{ color: fg, fontSize: size === 'lg' ? 16 : 14 }}>
      {label}
    </Text>
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-disabled={!!disabled || !!loading} aria-busy={!!loading}
      disabled={disabled || loading}
      onPressIn={() => {
        scale.set(withSpring(0.97, motion.spring.snappy));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, motion.spring.soft));
      }}
      onPress={e => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={[
        styles.base,
        { height: HEIGHT[size], borderRadius: radius.pill, backgroundColor: bg, opacity: disabled ? 0.5 : 1, alignSelf: fullWidth ? 'stretch' : 'flex-start' },
        animated,
        style,
      ]}
      {...rest}
    >
      {variant === 'gradient' && (
        <LinearGradient
          colors={[gradients.brand[0], gradients.brand[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
        />
      )}
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexDirection: 'row', gap: 8, minWidth: 0 },
});
