import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

type Tone = 'accent' | 'live' | 'success' | 'neutral' | 'primary';

export function Badge({ label, tone = 'accent' }: { label: string; tone?: Tone }) {
  const { colors, radius } = useTheme();
  const bg = { accent: colors.accent, live: colors.error, success: colors.success, neutral: colors.muted, primary: colors.primary }[tone];
  const fg = tone === 'neutral' ? colors.foreground : tone === 'accent' ? colors.accentForeground : '#ffffff';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 8, height: 22 }}>
      {tone === 'live' && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />}
      <Text variant="caption" style={{ color: fg, fontFamily: 'Inter_600SemiBold', letterSpacing: tone === 'live' ? 0.8 : 0 }}>
        {label}
      </Text>
    </View>
  );
}
