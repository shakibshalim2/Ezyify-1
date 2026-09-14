import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney, useAddresses, useAuth, useCheckout, useCreateAddress, useServerCart, useWallet, type Address, type CheckoutRequest, type CreateAddressRequest } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { formErrors } from '@/lib/auth';
import { authenticate } from '@/lib/biometrics';
import { useTheme } from '@/theme';

type Method = CheckoutRequest['paymentMethod'];

function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="heading">{title}</Text>
        {action && <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}><Text variant="label" tone="brand">{action}</Text></Pressable>}
      </View>
      {children}
    </View>
  );
}

const oneLine = (a: Address) => [a.line1, a.line2, a.city, a.region, a.postal].filter(Boolean).join(', ');

/** Inline address form (first order / "Add new"); ISO country defaults to the account's locale region. */
function AddressForm({ onSaved, onCancel }: { onSaved: (a: Address) => void; onCancel?: () => void }) {
  const create = useCreateAddress();
  const [form, setForm] = useState<CreateAddressRequest>({ label: 'Home', recipient: '', phone: '', line1: '', line2: '', city: '', region: '', postal: '', country: 'ID', isDefault: true });
  const errors = create.error ? formErrors(create.error) : { fields: {}, message: null };
  const set = (k: keyof CreateAddressRequest) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => {
    const body: CreateAddressRequest = { ...form, line2: form.line2 || undefined, region: form.region || undefined, country: form.country.toUpperCase() };
    const saved = await create.mutateAsync(body).catch(() => undefined);
    if (saved) onSaved(saved);
  };
  return (
    <Card style={{ gap: 12 }}>
      <Field label="Recipient" value={form.recipient} onChangeText={set('recipient')} error={errors.fields.recipient} autoComplete="name" textContentType="name" />
      <Field label="Phone" value={form.phone} onChangeText={set('phone')} error={errors.fields.phone} keyboardType="phone-pad" autoComplete="tel" />
      <Field label="Address" value={form.line1} onChangeText={set('line1')} error={errors.fields.line1} autoComplete="street-address" />
      <Field label="Apartment, floor (optional)" value={form.line2 ?? ''} onChangeText={set('line2')} error={errors.fields.line2} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="City" value={form.city} onChangeText={set('city')} error={errors.fields.city} /></View>
        <View style={{ flex: 1 }}><Field label="Postal code" value={form.postal} onChangeText={set('postal')} error={errors.fields.postal} autoComplete="postal-code" /></View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Region / state" value={form.region ?? ''} onChangeText={set('region')} error={errors.fields.region} /></View>
        <View style={{ width: 96 }}><Field label="Country" value={form.country} onChangeText={set('country')} error={errors.fields.country} autoCapitalize="characters" maxLength={2} hint="ISO code" /></View>
      </View>
      {errors.message && <Text variant="caption" style={{ color: 'tomato' }}>{errors.message}</Text>}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {onCancel && <Button label="Cancel" variant="secondary" size="md" onPress={onCancel} />}
        <Button label="Save address" variant="primary" size="md" fullWidth style={{ flex: 1 }} loading={create.isPending} onPress={submit} />
      </View>
    </Card>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const authed = useAuth(s => s.status === 'authenticated');
  const { addressId: preselected } = useLocalSearchParams<{ addressId?: string }>();
  const cart = useServerCart();
  const addresses = useAddresses();
  const wallet = useWallet();
  const checkout = useCheckout();
  const [method, setMethod] = useState<Method>('wallet');
  const [chosen, setChosen] = useState<string | null>(preselected ?? null);
  const [picking, setPicking] = useState(false);
  const [adding, setAdding] = useState(false);
  // One key per checkout attempt so a retry after a network blip can't create duplicate orders.
  const [idempotencyKey] = useState(() => Crypto.randomUUID());

  const addressList = useMemo(() => addresses.data ?? [], [addresses.data]);
  const address = useMemo(() => addressList.find(a => a.id === chosen) ?? addressList.find(a => a.isDefault) ?? addressList[0], [addressList, chosen]);
  const items = cart.data?.items ?? [];
  const total = cart.data?.total;
  const balance = wallet.data?.balance.amount ?? 0;
  const walletShort = method === 'wallet' && total != null && balance < total.amount;
  const submitError = checkout.error ? formErrors(checkout.error, "We couldn't place your order. Please try again.") : null;

  const METHODS: { id: Method; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'wallet', label: 'Ezyify Wallet', sub: wallet.data ? `Balance ${formatMoney(wallet.data.balance)}` : 'Loading balance…', icon: 'wallet-outline' },
    { id: 'card', label: 'Card', sub: 'Visa, Mastercard · pay on the next step', icon: 'card-outline' },
    { id: 'bank_transfer', label: 'Bank transfer', sub: 'Virtual account · instant', icon: 'business-outline' },
    { id: 'cod', label: 'Cash on delivery', sub: 'Pay the courier', icon: 'cash-outline' },
  ];

  if (!authed) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Checkout" />
        <View style={{ padding: 24, gap: 12 }}>
          <Text variant="title">Sign in to check out</Text>
          <Text tone="secondary">Your cart is saved on this device and moves to your account when you sign in.</Text>
          <Button label="Sign in" variant="gradient" size="lg" fullWidth onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    );
  }

  const place = async () => {
    if (!address || !total) return;
    if (method === 'wallet') {
      const auth = await authenticate('Confirm payment from your Ezyify Wallet');
      if (!auth.success) return;
    }
    const orders = await checkout.mutateAsync({ body: { addressId: address.id, paymentMethod: method, ...(cart.data?.couponCode ? { couponCode: cart.data.couponCode } : {}) }, idempotencyKey }).catch(() => undefined);
    if (!orders) return;
    router.replace({ pathname: '/order-success', params: { total: String(orders.reduce((n, o) => n + o.total.amount, 0)), orderNumber: orders.map(o => o.orderNumber).join(', '), orderId: orders[0].id, method } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Checkout" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 180 }} keyboardShouldPersistTaps="handled">
        <Section title="Deliver to" action={addressList.length && !adding ? (picking ? 'Done' : 'Change') : undefined} onAction={() => setPicking(p => !p)}>
          {addresses.isLoading ? (
            <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Skeleton width={40} height={40} radius={20} /><View style={{ flex: 1, gap: 6 }}><Skeleton width={140} height={14} /><Skeleton width="90%" height={10} /></View></Card>
          ) : addresses.error ? (
            <ErrorState compact error={addresses.error} onRetry={() => addresses.refetch()} />
          ) : adding || !addressList.length ? (
            <AddressForm onSaved={a => { setChosen(a.id); setAdding(false); }} onCancel={addressList.length ? () => setAdding(false) : undefined} />
          ) : picking ? (
            <View style={{ gap: 8 }}>
              {addressList.map(a => {
                const on = a.id === address?.id;
                return (
                  <Pressable key={a.id} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => { setChosen(a.id); setPicking(false); }} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: radius.card, borderWidth: on ? 2 : 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySubtle : colors.card }}>
                    <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={20} color={on ? colors.primary : colors.borderStrong} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{a.label} · {a.recipient}</Text>
                      <Text variant="caption" tone="secondary">{oneLine(a)} · {a.phone}</Text>
                    </View>
                  </Pressable>
                );
              })}
              <Button label="Add new address" variant="ghost" size="sm" onPress={() => { setAdding(true); setPicking(false); }} />
            </View>
          ) : address ? (
            <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="location" size={20} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{address.label} · {address.recipient}</Text>
                <Text variant="caption" tone="secondary">{oneLine(address)} · {address.phone}</Text>
              </View>
            </Card>
          ) : null}
        </Section>

        <Section title="Order summary">
          <Card style={{ gap: 10 }}>
            {cart.isLoading && [0, 1].map(i => <Skeleton key={i} height={14} />)}
            {!cart.isLoading && !items.length && <Text tone="secondary">Your cart is empty — add something from the shop first.</Text>}
            {items.map(i => (
              <View key={i.productId + (i.variantId ?? '')} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ flex: 1 }} numberOfLines={1}>{i.quantity} × {i.product.name}</Text>
                <Text variant="bodyMedium">{formatMoney({ amount: i.product.price.amount * i.quantity, currency: i.product.price.currency })}</Text>
              </View>
            ))}
            {cart.data && cart.data.discount.amount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text tone="secondary">Discount {cart.data.couponCode ? `(${cart.data.couponCode})` : ''}</Text><Text style={{ color: colors.success }}>−{formatMoney(cart.data.discount)}</Text></View>
            )}
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
            {walletShort && (
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: colors.errorSubtle, borderRadius: radius.md, padding: 12 }}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text variant="caption" style={{ color: colors.error, flex: 1 }}>Wallet balance is short by {formatMoney({ amount: total!.amount - balance, currency: total!.currency })}. Top up or pick another method.</Text>
                <Button label="Top up" size="sm" variant="secondary" onPress={() => router.push('/wallet')} />
              </View>
            )}
          </View>
        </Section>

        <View style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.successSubtle, borderRadius: radius.md, padding: 12 }}>
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <Text variant="caption" style={{ color: colors.success, flex: 1 }}>Payment is held in escrow and released to the seller only after you confirm delivery (auto-release after 7 days).</Text>
        </View>

        {submitError && <ErrorState compact error={checkout.error} onRetry={place} />}
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text tone="secondary">Total · {cart.data?.shipping.amount ? `incl. ${formatMoney(cart.data.shipping)} shipping` : 'free shipping'}</Text>
          {total ? <Text variant="title" tone="brand">{formatMoney(total)}</Text> : <Skeleton width={80} height={24} />}
        </View>
        <Button label={total ? `Pay ${formatMoney(total)}` : 'Pay'} variant="gradient" size="lg" fullWidth loading={checkout.isPending} disabled={!items.length || !address || walletShort || adding} onPress={place} />
      </View>
    </View>
  );
}
