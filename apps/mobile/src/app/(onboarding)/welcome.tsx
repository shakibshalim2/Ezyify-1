import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { BrandMark, BrandWordmark } from '@/components/BrandMark';
import { useAppStore } from '@/store/app';
import { useTheme } from '@/theme';
import { DiscoverScene, ShopSafeScene, GoLiveScene } from '@/components/onboarding/Scenes';

const SLIDES = [
  { id: 'discover', eyebrow: 'DISCOVER', title: 'Shopping that feels like scrolling', body: 'Loops, stories and live drops from creators you love — every product one tap away.' },
  { id: 'protect', eyebrow: 'PROTECTED BY ESCROW', title: 'Pay with confidence, every time', body: 'Your money is held safely until your order arrives. Refunds and disputes handled in-app.' },
  { id: 'earn', eyebrow: 'CREATE & EARN', title: 'Go live. Sell. Get paid.', body: 'Start a store or share products you love and earn commissions from a single feed.' },
];
const AUTO_MS = 6000;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius, gradients } = useTheme();
  const markSeen = useAppStore(s => s.markOnboardingSeen);
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;
  const width = Dimensions.get('window').width;

  const go = useCallback((n: number) => setIndex(Math.max(0, Math.min(SLIDES.length - 1, n))), []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!last) timer.current = setTimeout(() => go(index + 1), AUTO_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, last, go]);

  const finish = () => {
    markSeen();
    router.replace('/(auth)/signup');
  };

  const swipe = Gesture.Pan().onEnd(e => {
    if (e.translationX < -40) go(index + 1);
    if (e.translationX > 40) go(index - 1);
  }).runOnJS(true);

  const accents = [gradients.vivid, [gradients.warm[0], gradients.warm[1], gradients.warm[1]], [gradients.vivid[2], gradients.vivid[1], gradients.vivid[0]]];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[...accents[index]] as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58%', borderBottomLeftRadius: radius.sheet * 2, borderBottomRightRadius: radius.sheet * 2 }} />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <BrandMark size={32} onDark />
          <BrandWordmark size={20} color="#fff" />
        </View>
        {!last && (
          <Pressable accessibilityRole="button" onPress={finish} hitSlop={8}>
            <Text variant="label" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      <GestureDetector gesture={swipe}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View key={slide.id + '-art'} entering={FadeInUp.duration(400)} exiting={FadeOut.duration(150)} style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ width: width * 0.78, aspectRatio: 360 / 340, borderRadius: radius.sheet, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {slide.id === 'discover' && <DiscoverScene size={width * 0.78} />}
              {slide.id === 'protect' && <ShopSafeScene size={width * 0.78} />}
              {slide.id === 'earn' && <GoLiveScene size={width * 0.78} />}
            </View>
          </Animated.View>

          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingHorizontal: 24, paddingTop: 28, paddingBottom: insets.bottom + 24, gap: 16, minHeight: 320 }}>
            <Animated.View key={slide.id} entering={FadeInDown.duration(350)} exiting={FadeOut.duration(120)} style={{ gap: 10 }}>
              <Text variant="caption" tone="brand" style={{ letterSpacing: 1.6, fontFamily: 'Inter_600SemiBold' }}>
                {slide.eyebrow}
              </Text>
              <Text variant="display">{slide.title}</Text>
              <Text tone="secondary">{slide.body}</Text>
            </Animated.View>

            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              {SLIDES.map((s, i) => (
                <Pressable key={s.id} accessibilityRole="button" accessibilityLabel={`Slide ${i + 1}`} onPress={() => go(i)} style={{ height: 6, width: i === index ? 24 : 6, borderRadius: 3, backgroundColor: i === index ? colors.primary : colors.border }} />
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              {index > 0 && <Button label="Back" variant="secondary" size="lg" onPress={() => go(index - 1)} />}
              <Button label={last ? 'Get started' : 'Next'} variant="gradient" size="lg" fullWidth style={{ flex: 1 }} onPress={() => (last ? finish() : go(index + 1))} />
            </View>
            {last && (
              <Pressable accessibilityRole="button" onPress={() => { markSeen(); router.replace('/(auth)/login'); }} style={{ alignSelf: 'center' }}>
                <Text variant="label" tone="brand">
                  I already have an account
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}
