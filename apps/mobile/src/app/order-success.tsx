import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { formatMoney, money } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useTheme } from '@/theme';
import { requestPush } from '@/lib/push';
import { useAppStore } from '@/store/app';


export default function OrderSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const { total } = useLocalSearchParams<{ total?: string }>();
  const [orderNo] = useState(() => `EZ-${Math.floor(10000 + Math.random() * 89999)}`);
  const pushAsked = useAppStore(s => s.pushAsked);
  const setPushAsked = useAppStore(s => s.setPushAsked);
  const [pushState, setPushState] = useState<'idle' | 'granted' | 'denied'>('idle');
  const enablePush = async () => {
    const r = await requestPush();
    setPushAsked();
    setPushState(r.status === 'granted' ? 'granted' : 'denied');
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + 60, paddingHorizontal: 20, paddingBottom: insets.bottom + 20, alignItems: 'center', gap: 20 }}>
      <Animated.View entering={ZoomIn.springify().damping(14)} style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: colors.successSubtle, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="checkmark-circle" size={72} color={colors.success} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(150)} style={{ alignItems: 'center', gap: 8 }}>
        <Text variant="display" style={{ textAlign: 'center' }}>Order placed!</Text>
        <Text tone="secondary" style={{ textAlign: 'center' }}>Order {orderNo} · {total ? formatMoney(money(Number(total) / 100)) : ''} held safely in escrow. We&apos;ll notify you at every step.</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(300)} style={{ width: '100%' }}>
        <Card style={{ gap: 12 }}>
          {[{ icon: 'checkmark-circle', label: 'Paid & escrowed', done: true }, { icon: 'cube-outline', label: 'Seller preparing your order', done: false }, { icon: 'bicycle-outline', label: 'On the way', done: false }, { icon: 'home-outline', label: 'Delivered — confirm to release payment', done: false }].map((s, i) => (
            <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: s.done ? colors.success : colors.muted, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={s.icon as never} size={16} color={s.done ? '#fff' : colors.foregroundTertiary} />
              </View>
              <Text tone={s.done ? 'primary' : 'secondary'} style={{ flex: 1 }}>{s.label}</Text>
              {i === 1 && <View style={{ backgroundColor: colors.primarySubtle, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}><Text variant="caption" tone="brand">Now</Text></View>}
            </View>
          ))}
        </Card>
      </Animated.View>
      {!pushAsked && pushState === 'idle' && (
        <Animated.View entering={FadeInDown.delay(450)} style={{ width: '100%' }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="notifications-outline" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">Get delivery updates</Text>
              <Text variant="caption" tone="secondary">We’ll ping you when it ships and arrives.</Text>
            </View>
            <Button label="Turn on" size="sm" onPress={enablePush} />
          </Card>
        </Animated.View>
      )}
      {pushState === 'granted' && <Text variant="caption" style={{ color: colors.success }}>Notifications on — you’ll hear from us at each step.</Text>}
      <View style={{ flex: 1 }} />
      <Button label="Track order" variant="gradient" size="lg" fullWidth onPress={() => router.replace('/orders')} />
      <Button label="Continue shopping" variant="ghost" size="md" fullWidth onPress={() => router.replace('/(tabs)/home')} />
    </View>
  );
}
