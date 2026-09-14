import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

interface AvatarProps {
  uri: string | null;
  size?: number;
  ring?: 'none' | 'story' | 'seen' | 'live';
  verified?: boolean;
}

export function Avatar({ uri, size = 40, ring = 'none', verified }: AvatarProps) {
  const { colors, gradients } = useTheme();
  const pad = ring === 'none' ? 0 : 3;
  const inner = (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: colors.muted, borderWidth: pad ? 2 : 0, borderColor: colors.background }}>
      {uri ? <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={150} /> : null}
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
