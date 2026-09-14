import { useEffect } from 'react';
import { type DimensionValue, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/** Pulsing placeholder; keep dimensions identical to the content it stands in for. */
export function Skeleton({ width = '100%', height = 16, radius, style }: SkeletonProps) {
  const { colors, radius: r } = useTheme();
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return <Animated.View style={[{ width, height, borderRadius: radius ?? r.sm, backgroundColor: colors.muted }, anim, style]} />;
}
