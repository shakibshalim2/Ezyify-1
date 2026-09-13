import type { PropsWithChildren } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 16 },
        style,
      ]}
    >
      {children}
    </View>
  );
}
