import { View } from 'react-native';
import { Image } from 'expo-image';
import { fontFamily, useTheme } from '@/theme';
import { Text } from './Text';

const mark = require('../../assets/images/android-icon-foreground.png');

export function BrandMark({ size = 40, onDark = false }: { size?: number; onDark?: boolean }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: onDark ? 'rgba(255,255,255,0.15)' : colors.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Image source={mark} style={{ width: size * 1.4, height: size * 1.4 }} contentFit="contain" />
      <View style={{ position: 'absolute', inset: 0, borderRadius: radius.md }} pointerEvents="none" />
    </View>
  );
}

export function BrandWordmark({ size = 22, color }: { size?: number; color?: string }) {
  const { colors } = useTheme();
  return <Text style={{ fontFamily: fontFamily.display, fontSize: size, letterSpacing: -0.5, color: color ?? colors.foreground }}>Ezyify</Text>;
}
