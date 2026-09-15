import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { formatCompactNumber, type LiveSession } from '@ezyify/core';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';

function PulseDot() {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      opacity.set(1);
      scale.set(1);
      return;
    }
    opacity.set(withRepeat(withTiming(0.35, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true));
    scale.set(withRepeat(withTiming(1.5, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [opacity, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ scale: scale.get() }] }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' }, style]} />;
}

interface LiveSessionCardProps {
  session: LiveSession;
  width?: number;
}

/** Reusable live-session entry point for discovery, home, and the dedicated hub. */
export function LiveSessionCard({ session, width }: LiveSessionCardProps) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const live = session.status === 'live';

  return (
    <Pressable
      testID={`live-card-${session.id}`}
      accessibilityRole="link"
      accessibilityLabel={`${session.title}, ${live ? 'live now' : 'upcoming'}`}
      onPress={() => router.push({ pathname: '/live/[id]', params: { id: session.id } })}
      style={({ pressed }) => ({ width, overflow: 'hidden', borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderSubtle, opacity: pressed ? 0.92 : 1 })}
    >
      <View style={{ height: width ? width * 0.6 : 190, backgroundColor: colors.muted }}>
        {session.coverUrl ? <Image source={{ uri: session.coverUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={180} /> : null}
        <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.18)' }} />
        <View style={{ position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {live ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.error, borderRadius: radius.pill, paddingHorizontal: 8, height: 24 }}>
              <PulseDot />
              <Text variant="caption" style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 }}>LIVE</Text>
            </View>
          ) : <Badge label="UPCOMING" tone="neutral" />}
        </View>
        {live && (
          <View style={{ position: 'absolute', right: 10, bottom: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.58)', borderRadius: radius.pill, paddingHorizontal: 8, height: 24 }}>
            <Ionicons name="eye-outline" size={13} color="#fff" />
            <Text variant="caption" style={{ color: '#fff' }}>{formatCompactNumber(session.viewers)}</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        <Text variant="bodyMedium" numberOfLines={2}>{session.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Avatar uri={session.host.avatarUrl} name={session.host.name} size={22} verified={session.host.verified} />
          <Text variant="caption" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>{session.host.name}</Text>
          {session.category ? <Text variant="caption" tone="brand" numberOfLines={1}>{session.category}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}
