import type { PropsWithChildren } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

/** Edge-to-edge safe container (Android 16 requires edge-to-edge; insets are applied here, not via SafeAreaView). */
export function Screen({ children, scroll = true, padded = true, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors, layout } = useTheme();
  const base: ViewStyle = { flex: 1, backgroundColor: colors.background, paddingTop: insets.top };
  const inner: ViewStyle = { paddingHorizontal: padded ? layout.gutter : 0, paddingBottom: insets.bottom + 24 };

  if (!scroll) return <View style={[base, inner, style]}>{children}</View>;
  return (
    <ScrollView style={[base, style]} contentContainerStyle={inner} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}
