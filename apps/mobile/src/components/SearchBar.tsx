import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily, useTheme } from '@/theme';
import { Text } from './Text';

interface SearchBarProps extends TextInputProps {
  asButton?: boolean;
  onPressButton?: () => void;
}

export function SearchBar({ asButton, onPressButton, placeholder = 'Search products, creators, loops', ...rest }: SearchBarProps) {
  const { colors, radius } = useTheme();
  const shell = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, height: 44, borderRadius: radius.pill, backgroundColor: colors.muted, paddingHorizontal: 14 };
  if (asButton) {
    return (
      <Pressable accessibilityRole="search" onPress={onPressButton} style={shell}>
        <Ionicons name="search" size={18} color={colors.foregroundTertiary} />
        <Text tone="tertiary">{placeholder}</Text>
      </Pressable>
    );
  }
  return (
    <View style={shell}>
      <Ionicons name="search" size={18} color={colors.foregroundTertiary} />
      <TextInput placeholder={placeholder} placeholderTextColor={colors.foregroundTertiary} returnKeyType="search" style={{ flex: 1, fontFamily: fontFamily.body, fontSize: 15, color: colors.foreground, paddingVertical: 0 }} {...rest} />
    </View>
  );
}
