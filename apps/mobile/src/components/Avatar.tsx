import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { avatarColors, initialsOf } from '@ezyify/core';
import { fontFamily, useTheme } from '@/theme';
import { Text } from './Text';

interface AvatarProps {
  uri: string | null;
  /** Used for the deterministic initials fallback when `uri` is null or fails to load. */
  name?: string | null;
  size?: number;
  ring?: 'none' | 'story' | 'seen' | 'live';
  verified?: boolean;
}

export function Avatar({ uri, name, size = 40, ring = 'none', verified }: AvatarProps) {
  const { colors, gradients } = useTheme();
  const pad = ring === 'none' ? 0 : 3;
  const fallback = name ? avatarColors(name) : { background: colors.muted, foreground: colors.foregroundTertiary };
  const inner = (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: fallback.background, borderWidth: pad ? 2 : 0, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      {name ? (
        <Text style={{ fontFamily: fontFamily.display, fontSize: size * 0.4, color: fallback.foreground, lineHeight: size * 0.48 }} allowFontScaling={false}>
          {initialsOf(name)}
        </Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={fallback.foreground} />
      )}
      {uri ? <Image source={{ uri }} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" transition={150} /> : null}
    </View>
  );
  const outer = size + pad * 2;
  return (
    <View style={{ width: outer, height: outer }}>
      {ring === 'story' || ring === 'live' ? (
        <LinearGradient
          colors={ring === 'live' ? [colors.error, gradients.warm[0]] : [gradients.vivid[0], gradients.vivid[2], gradients.warm[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: outer, height: outer, borderRadius: outer / 2, alignItems: 'center', justifyContent: 'center' }}
        >
          {inner}
        </LinearGradient>
      ) : ring === 'seen' ? (
        <View style={{ width: outer, height: outer, borderRadius: outer / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border }}>
          {inner}
        </View>
      ) : (
        inner
      )}
      {verified && (
        <View style={{ position: 'absolute', right: -2, bottom: -2, backgroundColor: colors.background, borderRadius: 10 }}>
          <Ionicons name="checkmark-circle" size={size >= 48 ? 18 : 14} color={colors.primary} />
        </View>
      )}
    </View>
  );
}
