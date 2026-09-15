import Animated, { useReducedMotion, useSharedValue, useAnimatedProps, withDelay, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Svg, G, Rect, Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { useTheme } from '@/theme';
import { useEffect } from 'react';

const AnimatedG = Animated.createAnimatedComponent(G);

interface SceneProps {
  size: number;
}

function Phone({ children, backgroundElevated, border }: { children: React.ReactNode; backgroundElevated: string; border: string }) {
  return (
    <G>
      <Rect x="110" y="30" width="140" height="280" rx="26" fill={backgroundElevated} stroke={border} strokeWidth="2" />
      <Rect x="150" y="42" width="60" height="8" rx="4" fill={border} />
      {children}
    </G>
  );
}

function FloatingGroup({
  children,
  delay,
  distance = 10,
}: {
  children: React.ReactNode;
  delay: number;
  distance?: number;
}) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) {
      // Staggered start so the cards don't bob in unison (mirrors the web `float(delay)` helper).
      translateY.value = withDelay(
        delay * 1000,
        withRepeat(withTiming(-distance, { duration: 2250, easing: Easing.inOut(Easing.sin) }), -1, true),
      );
    }
  }, [reduceMotion, translateY, distance, delay]);

  const animProps = useAnimatedProps(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (reduceMotion) {
    return <G>{children}</G>;
  }

  return <AnimatedG animatedProps={animProps}>{children}</AnimatedG>;
}

export function DiscoverScene({ size }: SceneProps) {
  const { colors } = useTheme();
  const height = (size * 340) / 360;

  return (
    <Svg viewBox="0 0 360 340" width={size} height={height}>
      <Defs>
        <LinearGradient id="dg1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3f86f0" />
          <Stop offset="1" stopColor="#0c52a2" />
        </LinearGradient>
        <LinearGradient id="dg2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#ff9f6b" />
          <Stop offset="1" stopColor="#c1460d" />
        </LinearGradient>
      </Defs>

      <Circle cx="180" cy="180" r="150" fill={colors.primarySubtle} />

      <Phone backgroundElevated={colors.backgroundElevated} border={colors.border}>
        <Rect x="124" y="64" width="112" height="120" rx="14" fill="url(#dg1)" />
        <Circle cx="146" cy="86" r="10" fill="#fff" opacity={0.9} />
        <Rect x="162" y="80" width="50" height="6" rx="3" fill="#fff" opacity={0.8} />
        <Rect x="162" y="92" width="34" height="5" rx="2.5" fill="#fff" opacity={0.5} />
        <Path d="M180 150 l-9 -9 a6 6 0 0 1 9 -8 a6 6 0 0 1 9 8 z" fill="#fff" />
        <Rect x="124" y="194" width="52" height="60" rx="10" fill={colors.muted} />
        <Rect x="184" y="194" width="52" height="60" rx="10" fill={colors.muted} />
        <Rect x="124" y="262" width="112" height="36" rx="10" fill={colors.muted} />
      </Phone>

      <FloatingGroup delay={0}>
        <Rect x="24" y="70" width="96" height="64" rx="14" fill={colors.card} stroke={colors.border} strokeWidth="1" />
        <Rect x="34" y="80" width="30" height="30" rx="8" fill="url(#dg2)" />
        <Rect x="72" y="84" width="40" height="6" rx="3" fill={colors.foregroundTertiary} />
        <Rect x="72" y="96" width="26" height="6" rx="3" fill={colors.primary} />
        <Rect x="34" y="118" width="70" height="6" rx="3" fill={colors.borderStrong} />
      </FloatingGroup>

      <FloatingGroup delay={0.8} distance={8}>
        <Rect x="236" y="120" width="104" height="72" rx="14" fill={colors.card} stroke={colors.border} strokeWidth="1" />
        <Circle cx="258" cy="144" r="12" fill="url(#dg1)" />
        <Rect x="276" y="138" width="50" height="6" rx="3" fill={colors.foregroundTertiary} />
        <Rect x="276" y="150" width="30" height="5" rx="2.5" fill={colors.borderStrong} />
        <Rect x="248" y="168" width="80" height="14" rx="7" fill={colors.primary} />
        <Rect x="270" y="172" width="36" height="6" rx="3" fill="#fff" />
      </FloatingGroup>

      <FloatingGroup delay={1.4} distance={12}>
        <Rect x="40" y="220" width="84" height="84" rx="16" fill="url(#dg2)" />
        <Path d="M82 246 l6 12 13 2 -9.5 9 2.5 13 -12 -6.5 -12 6.5 2.5 -13 -9.5 -9 13 -2z" fill="#fff" />
      </FloatingGroup>

      <FloatingGroup delay={0.4} distance={6}>
        <Circle cx="290" cy="60" r="22" fill={colors.card} stroke={colors.border} strokeWidth="1" />
        <Circle cx="290" cy="60" r="8" fill={colors.accent} />
      </FloatingGroup>
    </Svg>
  );
}

export function ShopSafeScene({ size }: SceneProps) {
  const { colors } = useTheme();
  const height = (size * 340) / 360;

  return (
    <Svg viewBox="0 0 360 340" width={size} height={height}>
      <Defs>
        <LinearGradient id="sg1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3f86f0" />
          <Stop offset="1" stopColor="#0c52a2" />
        </LinearGradient>
      </Defs>

      <Circle cx="180" cy="180" r="150" fill={colors.accentSubtle} />

      {/* Shield */}
      <FloatingGroup delay={0} distance={6}>
        <Path d="M180 60 l84 30 v70 c0 56 -38 96 -84 116 c-46 -20 -84 -60 -84 -116 v-70z" fill="url(#sg1)" />
        <Path d="M180 78 l66 24 v58 c0 45 -30 78 -66 95 c-36 -17 -66 -50 -66 -95 v-58z" fill="#fff" opacity={0.12} />
        <Path d="M150 178 l20 20 42 -46" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </FloatingGroup>

      {/* Order card */}
      <FloatingGroup delay={0.9} distance={10}>
        <Rect x="18" y="200" width="122" height="78" rx="14" fill={colors.card} stroke={colors.border} strokeWidth="1" />
        <Rect x="30" y="212" width="34" height="34" rx="8" fill={colors.muted} />
        <Rect x="72" y="216" width="56" height="6" rx="3" fill={colors.foregroundTertiary} />
        <Rect x="72" y="228" width="36" height="6" rx="3" fill={colors.borderStrong} />
        <Rect x="30" y="256" width="60" height="12" rx="6" fill={colors.successSubtle} />
        <Rect x="36" y="260" width="48" height="4" rx="2" fill={colors.success} />
      </FloatingGroup>

      {/* Wallet card */}
      <FloatingGroup delay={1.6} distance={8}>
        <Rect x="228" y="188" width="114" height="72" rx="14" fill={colors.accent} />
        <Rect x="240" y="200" width="60" height="7" rx="3.5" fill="#fff" opacity={0.7} />
        <Rect x="240" y="218" width="90" height="10" rx="5" fill="#fff" />
        <Circle cx="318" cy="244" r="8" fill="#fff" opacity={0.6} />
        <Circle cx="306" cy="244" r="8" fill="#fff" opacity={0.9} />
      </FloatingGroup>

      {/* Lock */}
      <FloatingGroup delay={0.4} distance={5}>
        <Rect x="262" y="76" width="56" height="44" rx="10" fill={colors.card} stroke={colors.border} strokeWidth="1" />
        <Path d="M276 76 v-10 a14 14 0 0 1 28 0 v10" stroke={colors.primary} strokeWidth="6" fill="none" />
        <Circle cx="290" cy="98" r="6" fill={colors.primary} />
      </FloatingGroup>
    </Svg>
  );
}

export function GoLiveScene({ size }: SceneProps) {
  const { colors } = useTheme();
  const height = (size * 340) / 360;

  return (
    <Svg viewBox="0 0 360 340" width={size} height={height}>
      <Defs>
        <LinearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#7c5cff" />
          <Stop offset="1" stopColor="#0f66c7" />
        </LinearGradient>
      </Defs>

      <Circle cx="180" cy="180" r="150" fill={colors.primarySubtle} />

      <Phone backgroundElevated={colors.backgroundElevated} border={colors.border}>
        <Rect x="124" y="64" width="112" height="234" rx="14" fill="url(#lg1)" />
        <Circle cx="180" cy="150" r="34" fill="#fff" opacity={0.15} />
        <Circle cx="180" cy="150" r="22" fill="#fff" opacity={0.9} />
        <Circle cx="180" cy="142" r="8" fill="url(#lg1)" />
        <Path d="M166 166 a14 10 0 0 1 28 0z" fill="url(#lg1)" />
        <Rect x="134" y="74" width="40" height="16" rx="8" fill={colors.error} />
        <Circle cx="144" cy="82" r="3" fill="#fff" />
        <Rect x="152" y="79" width="16" height="6" rx="3" fill="#fff" />
        <Rect x="134" y="270" width="92" height="18" rx="9" fill="#fff" opacity={0.2} />
        <Rect x="142" y="276" width="50" height="6" rx="3" fill="#fff" opacity={0.8} />
      </Phone>

      {/* Viewers */}
      <FloatingGroup delay={0.6} distance={8}>
        <Rect x="18" y="80" width="96" height="40" rx="20" fill={colors.card} stroke={colors.border} strokeWidth="1" />
        <Circle cx="40" cy="100" r="12" fill="#74a9fb" />
        <Circle cx="56" cy="100" r="12" fill="#ff9f6b" stroke={colors.card} strokeWidth="2" />
        <Circle cx="72" cy="100" r="12" fill="#7c5cff" stroke={colors.card} strokeWidth="2" />
        <Rect x="88" y="96" width="18" height="8" rx="4" fill={colors.foregroundTertiary} />
      </FloatingGroup>

      {/* Earnings */}
      <FloatingGroup delay={1.2} distance={10}>
        <Rect x="236" y="250" width="106" height="60" rx="14" fill={colors.card} stroke={colors.border} strokeWidth="1" />
        <Rect x="248" y="262" width="40" height="6" rx="3" fill={colors.foregroundTertiary} />
        <Rect x="248" y="276" width="70" height="12" rx="6" fill={colors.success} />
        <Path d="M296 262 l8 -8 8 8" stroke={colors.success} strokeWidth="3" fill="none" strokeLinecap="round" />
      </FloatingGroup>

      {/* Play button */}
      <FloatingGroup delay={0.2} distance={6}>
        <Rect x="30" y="220" width="70" height="70" rx="16" fill={colors.accent} />
        <Path d="M58 240 v30 l24 -15z" fill="#fff" />
      </FloatingGroup>
    </Svg>
  );
}
