import { Pressable, type PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

interface IconButtonProps extends Omit<PressableProps, 'children'> {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  size?: number;
  color?: string;
  variant?: 'ghost' | 'filled' | 'overlay';
}

/** 44pt hit-target icon button; `label` becomes the accessibility label. */
export function IconButton({ icon, label, size = 22, color, variant = 'ghost', style, ...rest }: IconButtonProps) {
  const { colors, radius } = useTheme();
  const bg = variant === 'filled' ? colors.muted : variant === 'overlay' ? 'rgba(0,0,0,0.35)' : 'transparent';
  const fg = color ?? (variant === 'overlay' ? '#ffffff' : colors.foreground);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [
        { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, opacity: pressed ? 0.7 : 1 },
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      {...rest}
    >
      <Ionicons name={icon} size={size} color={fg} />
    </Pressable>
  );
}
