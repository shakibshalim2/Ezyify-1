import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney, money, useCart } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { findProduct, wallet } from '@/lib/mock';
import { useTheme } from '@/theme';
import { authenticate } from '@/lib/biometrics';

const METHODS = [
  { id: 'wallet', label: 'Ezyify Wallet', sub: `Balance ${formatMoney(wallet.balance)}`, icon: 'wallet-outline' as const },
  { id: 'card', label: 'Visa •••• 4242', sub: 'Expires 09/28', icon: 'card-outline' as const },
  { id: 'bank_transfer', label: 'Bank transfer', sub: 'Virtual account · instant', icon: 'business-outline' as const },
  { id: 'cod', label: 'Cash on delivery', sub: 'Pay the courier', icon: 'cash-outline' as const },
];

function Section({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="heading">{title}</Text>
        {action && <Text variant="label" tone="brand">{action}</Text>}
      </View>
      {children}
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const lines = useCart(s => s.lines);
  const clear = useCart(s => s.clear);
  const [method, setMethod] = useState('wallet');
  const [placing, setPlacing] = useState(false);
  const rows = lines.map(l => ({ l, p: findProduct(l.productId)! })).filter(r => r.p);
  const subtotal = rows.reduce((n, r) => n + r.p.price.amount * r.l.quantity, 0);
  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 499;
  const total = subtotal + shipping;

  const place = async () => {
    if (method === 'wallet') {
      const auth = await authenticate('Confirm payment from your Ezyify Wallet');
      if (!auth.success) return;
    }
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1200));
    clear();
    setPlacing(false);
    router.replace({ pathname: '/order-success', params: { total: String(total) } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Checkout" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 160 }}>
        <Section title="Deliver to" action="Change">
          <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="location" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">Home · Maya Chen</Text>
              <Text variant="caption" tone="secondary">Jl. Sudirman No. 21, Jakarta 10220 · +62 812 3456 7890</Text>
            </View>
          </Card>
        </Section>

        <Section title={`Items · ${rows.length}`}>
          <Card style={{ gap: 12 }}>
            {rows.length === 0 && <Text tone="secondary">Your cart is empty — add something from the shop first.</Text>}
            {rows.map(({ l, p }) => (
              <View key={l.productId} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ flex: 1 }} numberOfLines={1}>{l.quantity} × {p.name}</Text>
                <Text variant="bodyMedium">{formatMoney({ amount: p.price.amount * l.quantity, currency: 'USD' })}</Text>
              </View>
            ))}
          </Card>
        </Section>

        <Section title="Payment">
          <View style={{ gap: 8 }}>
            {METHODS.map(m => {
              const on = method === m.id;
              return (
                <Pressable key={m.id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setMethod(m.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.card, borderWidth: on ? 2 : 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySubtle : colors.card }}>
                  <Ionicons name={m.icon} size={22} color={on ? colors.primary : colors.foregroundSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium">{m.label}</Text>
                    <Text variant="caption" tone="secondary">{m.sub}</Text>
                  </View>
                  <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? colors.primary : colors.borderStrong} />
                </Pressable>
              );
            })}
          </View>
        </Section>

        <View style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.successSubtle, borderRadius: radius.md, padding: 12 }}>
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <Text variant="caption" style={{ color: colors.success, flex: 1 }}>Payment is held in escrow and released to the seller only after you confirm delivery (auto-release after 7 days).</Text>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text tone="secondary">Total · {shipping ? `incl. ${formatMoney(money(shipping / 100))} shipping` : 'free shipping'}</Text>
          <Text variant="title" tone="brand">{formatMoney(money(total / 100))}</Text>
        </View>
        <Button label={`Pay ${formatMoney(money(total / 100))}`} variant="gradient" size="lg" fullWidth loading={placing} disabled={!rows.length} onPress={place} />
      </View>
    </View>
  );
}
