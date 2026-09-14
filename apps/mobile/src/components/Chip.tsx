import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

interface ChipProps {
  label: string;
  selected?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function Chip({ label, selected, icon, onPress }: ChipProps) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      aria-selected={!!selected}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 36,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        backgroundColor: selected ? colors.primary : colors.muted,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {icon && <Ionicons name={icon} size={16} color={selected ? colors.primaryForeground : colors.foregroundSecondary} />}
      <Text variant="label" style={{ color: selected ? colors.primaryForeground : colors.foreground }}>
        {label}
      </Text>
    </Pressable>
  );
}
