import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney, useApplyCoupon, useAuth, useCart, useProduct, useRemoveCartItem, useServerCart, useUpdateCartItem, type Cart, type LocalCartLine, type Money, type ProductSummary } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { EmptyState } from '@/components/EmptyState';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { SearchBar } from '@/components/SearchBar';
import { ErrorState } from '@/components/QueryState';
import { formErrors } from '@/lib/auth';
import { useTheme } from '@/theme';

type Row = { productId: string; variantId: string | null; quantity: number; product: ProductSummary | undefined; variantLabel?: string | null };

function LineCard({ row, onChange, onRemove, busy }: { row: Row; onChange: (qty: number) => void; onRemove: () => void; busy?: boolean }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { product } = row;
  if (!product) {
    return (
      <Card style={{ flexDirection: 'row', gap: 12, padding: 12 }}>
        <Skeleton width={84} height={84} radius={12} />
        <View style={{ flex: 1, gap: 8 }}><Skeleton width={90} height={10} /><Skeleton width="80%" height={14} /><Skeleton width={70} height={14} /></View>
      </Card>
    );
  }
  return (
    <Card style={{ flexDirection: 'row', gap: 12, padding: 12, opacity: busy ? 0.7 : 1 }}>
      <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}>
        <Image source={{ uri: product.imageUrl }} style={{ width: 84, height: 84, borderRadius: radius.md }} contentFit="cover" />
      </Pressable>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="caption" tone="secondary">{product.seller.name}{row.variantLabel ? ` · ${row.variantLabel}` : ''}</Text>
        <Text variant="bodyMedium" numberOfLines={2}>{product.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <Text variant="label" tone="brand">{formatMoney({ amount: product.price.amount * row.quantity, currency: product.price.currency })}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.muted, borderRadius: radius.pill }}>
            <IconButton icon={row.quantity === 1 ? 'trash-outline' : 'remove'} label={row.quantity === 1 ? 'Remove' : 'Decrease quantity'} size={16} disabled={busy} onPress={() => (row.quantity === 1 ? onRemove() : onChange(row.quantity - 1))} style={{ width: 36, height: 36 }} />
            <Text variant="label" style={{ minWidth: 20, textAlign: 'center' }}>{row.quantity}</Text>
            <IconButton icon="add" label="Increase quantity" size={16} disabled={busy || row.quantity >= 99} onPress={() => onChange(row.quantity + 1)} style={{ width: 36, height: 36 }} />
          </View>
        </View>
      </View>
    </Card>
  );
}

/** Guest line: the product summary is fetched per line since only ids are stored locally. */
function GuestLine({ line }: { line: LocalCartLine }) {
  const setQuantity = useCart(s => s.setQuantity);
  const remove = useCart(s => s.remove);
  const product = useProduct(line.productId);
  const variantLabel = product.data?.variants.find(v => v.id === line.variantId)?.name ?? null;
  return <LineCard row={{ ...line, product: product.data, variantLabel }} onChange={q => setQuantity(line.productId, q, line.variantId)} onRemove={() => remove(line.productId, line.variantId)} />;
}

function Summary({ subtotal, shipping, discount, total, sellers, couponCode, onCoupon, couponError, couponBusy, onCheckout }: { subtotal: Money; shipping: Money; discount?: Money; total: Money; sellers: number; couponCode?: string | null; onCoupon?: (code: string) => void; couponError?: string | null; couponBusy?: boolean; onCheckout: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
      {onCoupon && (
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={{ flex: 1 }}><SearchBar placeholder={couponCode ? `Applied: ${couponCode}` : 'Promo code'} value={code} onChangeText={setCode} autoCapitalize="characters" onSubmitEditing={() => code && onCoupon(code)} returnKeyType="done" /></View>
            <Button label="Apply" variant="secondary" size="md" loading={couponBusy} disabled={!code} onPress={() => onCoupon(code)} />
          </View>
          {couponError && <Text variant="caption" style={{ color: colors.error }}>{couponError}</Text>}
        </View>
      )}
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text tone="secondary">Subtotal · {sellers} seller{sellers > 1 ? 's' : ''}</Text><Text>{formatMoney(subtotal)}</Text></View>
        {discount && discount.amount > 0 && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text tone="secondary">Discount{couponCode ? ` (${couponCode})` : ''}</Text><Text style={{ color: colors.success }}>−{formatMoney(discount)}</Text></View>}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text tone="secondary">Shipping</Text><Text style={{ color: shipping.amount ? colors.foreground : colors.success }}>{shipping.amount ? formatMoney(shipping) : 'Free'}</Text></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}><Text variant="heading">Total</Text><Text variant="title" tone="brand">{formatMoney(total)}</Text></View>
      </View>
      <Button label="Checkout" variant="gradient" size="lg" fullWidth onPress={onCheckout} />
    </View>
  );
}

const EscrowNote = () => {
  const { colors, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.successSubtle, borderRadius: radius.md, padding: 12, marginBottom: 4 }}>
      <Ionicons name="shield-checkmark" size={18} color={colors.success} />
      <Text variant="caption" style={{ color: colors.success, flex: 1 }}>Escrow protected — sellers are paid only after you confirm delivery.</Text>
    </View>
  );
};

function ServerCartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const cart = useServerCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const coupon = useApplyCoupon();
  const data: Cart | undefined = cart.data;
  const busy = update.isPending || remove.isPending;
  const sellers = new Set(data?.items.map(i => i.product.seller.id)).size;
  const couponError = coupon.error ? (formErrors(coupon.error).fields.code ?? formErrors(coupon.error).message) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={`Cart${data?.items.length ? ` (${data.items.length})` : ''}`} />
      <FlatList
        data={data?.items ?? []}
        keyExtractor={i => i.productId + (i.variantId ?? '')}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 260 }}
        refreshing={cart.isRefetching && !busy}
        onRefresh={() => cart.refetch()}
        ListHeaderComponent={data?.items.length ? <EscrowNote /> : null}
        ListEmptyComponent={
          cart.isLoading ? (
            <View style={{ gap: 12 }}>{[0, 1].map(i => <LineCard key={i} row={{ productId: '', variantId: null, quantity: 1, product: undefined }} onChange={() => {}} onRemove={() => {}} />)}</View>
          ) : cart.error ? (
            <ErrorState error={cart.error} onRetry={() => cart.refetch()} />
          ) : (
            <EmptyState icon="bag-outline" title="Your cart is empty" body="Products you add from posts, loops and the shop will show up here." actionLabel="Start shopping" onAction={() => router.push('/(tabs)/shop')} />
          )
        }
        renderItem={({ item }) => (
          <LineCard
            row={{ productId: item.productId, variantId: item.variantId, quantity: item.quantity, product: item.product }}
            busy={busy}
            onChange={q => update.mutate({ productId: item.productId, quantity: q })}
            onRemove={() => remove.mutate({ productId: item.productId })}
          />
        )}
      />
      {(update.error || remove.error) && <View style={{ position: 'absolute', bottom: 280, left: 0, right: 0 }}><ErrorState compact error={update.error ?? remove.error} /></View>}
      {data && data.items.length > 0 && (
        <Summary subtotal={data.subtotal} shipping={data.shipping} discount={data.discount} total={data.total} sellers={sellers} couponCode={data.couponCode} onCoupon={code => coupon.mutate({ code })} couponError={couponError} couponBusy={coupon.isPending} onCheckout={() => router.push('/checkout')} />
      )}
    </View>
  );
}

function GuestCartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const lines = useCart(s => s.lines);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={`Cart${lines.length ? ` (${lines.length})` : ''}`} />
      <FlatList
        data={lines}
        keyExtractor={l => l.productId + (l.variantId ?? '')}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 200 }}
        ListHeaderComponent={lines.length ? <EscrowNote /> : null}
        ListEmptyComponent={<EmptyState icon="bag-outline" title="Your cart is empty" body="Products you add from posts, loops and the shop will show up here." actionLabel="Start shopping" onAction={() => router.push('/(tabs)/shop')} />}
        renderItem={({ item }) => <GuestLine line={item} />}
      />
      {lines.length > 0 && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 32, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
          <Text tone="secondary" style={{ textAlign: 'center' }}>Sign in to see your total and check out — your cart comes with you.</Text>
          <Button label="Sign in to checkout" variant="gradient" size="lg" fullWidth onPress={() => router.push('/(auth)/login')} />
        </View>
      )}
    </View>
  );
}

export default function CartScreen() {
  const authed = useAuth(s => s.status === 'authenticated');
  return authed ? <ServerCartScreen /> : <GuestCartScreen />;
}
