import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily, useTheme } from '@/theme';
import { Text } from './Text';

export interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

/** Labelled input with error/hint, focus ring and password reveal — mirrors web `Field`. */
export function Field({ label, error, hint, icon, secureTextEntry, style, ...rest }: FieldProps) {
  const { colors, radius } = useTheme();
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const border = error ? colors.error : focused ? colors.primary : colors.border;

  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" tone="secondary">
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 52,
          borderRadius: radius.md,
          borderWidth: focused || error ? 2 : 1,
          borderColor: border,
          backgroundColor: colors.card,
          paddingHorizontal: 14,
          gap: 10,
        }}
      >
        {icon && <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.foregroundTertiary} />}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.foregroundTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureTextEntry && !reveal}
          style={[{ flex: 1, fontFamily: fontFamily.body, fontSize: 16, color: colors.foreground, paddingVertical: 0 }, style]}
          {...rest}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={reveal ? 'Hide password' : 'Show password'}
            onPress={() => setReveal(v => !v)}
            hitSlop={8}
          >
            <Ionicons name={reveal ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.foregroundSecondary} />
          </Pressable>
        )}
      </View>
      {(error || hint) && (
        <Text variant="caption" style={{ color: error ? colors.error : colors.foregroundTertiary }}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}
