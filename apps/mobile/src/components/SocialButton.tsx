import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

type Provider = 'google' | 'apple' | 'facebook';
const META: Record<Provider, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  google: { icon: 'logo-google', label: 'Google' },
  apple: { icon: 'logo-apple', label: 'Apple' },
  facebook: { icon: 'logo-facebook', label: 'Facebook' },
};

export function SocialButton({ provider, onPress }: { provider: Provider; onPress?: () => void }) {
  const { colors, radius } = useTheme();
  const m = META[provider];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Continue with ${m.label}`} onPress={onPress} style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
      <Ionicons name={m.icon} size={22} color={colors.foreground} />
    </Pressable>
  );
}

export function SocialRow({ onPick }: { onPick: (p: Provider) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <SocialButton provider="google" onPress={() => onPick('google')} />
      <SocialButton provider="apple" onPress={() => onPick('apple')} />
      <SocialButton provider="facebook" onPress={() => onPick('facebook')} />
    </View>
  );
}
