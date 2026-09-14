import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { useAppStore } from '@/store/app';
import { useTheme } from '@/theme';

const INTERESTS: { id: string; name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'fashion', name: 'Fashion', icon: 'shirt-outline' },
  { id: 'beauty', name: 'Beauty', icon: 'sparkles-outline' },
  { id: 'tech', name: 'Tech & Gadgets', icon: 'phone-portrait-outline' },
  { id: 'home', name: 'Home & Living', icon: 'home-outline' },
  { id: 'fitness', name: 'Fitness', icon: 'barbell-outline' },
  { id: 'food', name: 'Food & Cooking', icon: 'restaurant-outline' },
  { id: 'travel', name: 'Travel', icon: 'airplane-outline' },
  { id: 'gaming', name: 'Gaming', icon: 'game-controller-outline' },
  { id: 'books', name: 'Books', icon: 'book-outline' },
  { id: 'music', name: 'Music', icon: 'musical-notes-outline' },
  { id: 'art', name: 'Art & Design', icon: 'color-palette-outline' },
  { id: 'sports', name: 'Sports', icon: 'trophy-outline' },
  { id: 'pets', name: 'Pets', icon: 'paw-outline' },
  { id: 'photo', name: 'Photography', icon: 'camera-outline' },
  { id: 'jewelry', name: 'Jewelry', icon: 'diamond-outline' },
  { id: 'kids', name: 'Kids & Baby', icon: 'happy-outline' },
];
const MIN = 3;

export default function InterestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const setInterests = useAppStore(s => s.setInterests);
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (id: string) => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));
  const ok = picked.length >= MIN;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header back={false} right={<Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home')}><Text variant="label" tone="secondary">Skip</Text></Pressable>} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140, gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text variant="caption" tone="brand" style={{ letterSpacing: 1.6, fontFamily: 'Inter_600SemiBold' }}>STEP 1 OF 2</Text>
          <Text variant="display">What are you into?</Text>
          <Text tone="secondary">Pick at least {MIN} topics and we&apos;ll shape your feed around them. You can change these anytime.</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {INTERESTS.map((it, i) => {
            const on = picked.includes(it.id);
            return (
              <Animated.View key={it.id} entering={FadeInDown.delay(i * 30).duration(300)}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  onPress={() => toggle(it.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingHorizontal: 14, borderRadius: radius.pill,
                    borderWidth: 1.5, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySubtle : colors.card,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Ionicons name={on ? 'checkmark-circle' : it.icon} size={18} color={on ? colors.primary : colors.foregroundSecondary} />
                  <Text variant="label" style={{ color: on ? colors.primary : colors.foreground }}>{it.name}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.borderSubtle, gap: 8 }}>
        <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>{picked.length} selected · {Math.max(0, MIN - picked.length)} more to go</Text>
        <Button label="Continue" variant="gradient" size="lg" fullWidth disabled={!ok} onPress={() => { setInterests(picked); router.push('/(onboarding)/follow'); }} />
      </View>
    </View>
  );
}
