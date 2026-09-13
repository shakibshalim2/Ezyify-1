import { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney, money, useCart } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { EmptyState } from '@/components/EmptyState';
import { Card } from '@/components/Card';
import { findProduct } from '@/lib/mock';
import { useTheme } from '@/theme';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const lines = useCart(s => s.lines);
  const setQuantity = useCart(s => s.setQuantity);
  const remove = useCart(s => s.remove);

  const rows = useMemo(() => lines.map(l => ({ line: l, product: findProduct(l.productId) })).filter(r => r.product), [lines]);
  const subtotal = rows.reduce((n, r) => n + r.product!.price.amount * r.line.quantity, 0);
  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 499;
  const total = subtotal + shipping;
  const sellers = [...new Set(rows.map(r => r.product!.seller.name))];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={`Cart${rows.length ? ` (${rows.length})` : ''}`} />
      <FlatList
        data={rows}
        keyExtractor={r => r.line.productId + (r.line.variantId ?? '')}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 200 }}
        ListEmptyComponent={<EmptyState icon="bag-outline" title="Your cart is empty" body="Products you add from posts, loops and the shop will show up here." actionLabel="Start shopping" onAction={() => router.push('/(tabs)/shop')} />}
        ListHeaderComponent={rows.length ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.successSubtle, borderRadius: radius.md, padding: 12, marginBottom: 4 }}>
            <Ionicons name="shield-checkmark" size={18} color={colors.success} />
            <Text variant="caption" style={{ color: colors.success, flex: 1 }}>Escrow protected — sellers are paid only after you confirm delivery.</Text>
          </View>
        ) : null}
        renderItem={({ item: { line, product } }) => (
          <Card style={{ flexDirection: 'row', gap: 12, padding: 12 }}>
            <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/product/[id]', params: { id: product!.id } })}>
              <Image source={{ uri: product!.imageUrl }} style={{ width: 84, height: 84, borderRadius: radius.md }} contentFit="cover" />
            </Pressable>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="caption" tone="secondary">{product!.seller.name}</Text>
              <Text variant="bodyMedium" numberOfLines={2}>{product!.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <Text variant="label" tone="brand">{formatMoney({ amount: product!.price.amount * line.quantity, currency: product!.price.currency })}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.muted, borderRadius: radius.pill }}>
                  <IconButton icon={line.quantity === 1 ? 'trash-outline' : 'remove'} label={line.quantity === 1 ? 'Remove' : 'Decrease quantity'} size={16} onPress={() => (line.quantity === 1 ? remove(line.productId, line.variantId) : setQuantity(line.productId, line.quantity - 1, line.variantId))} style={{ width: 36, height: 36 }} />
                  <Text variant="label" style={{ minWidth: 20, textAlign: 'center' }}>{line.quantity}</Text>
                  <IconButton icon="add" label="Increase quantity" size={16} onPress={() => setQuantity(line.productId, line.quantity + 1, line.variantId)} style={{ width: 36, height: 36 }} />
                </View>
              </View>
            </View>
          </Card>
        )}
      />
      {rows.length > 0 && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text tone="secondary">Subtotal · {sellers.length} seller{sellers.length > 1 ? 's' : ''}</Text><Text>{formatMoney(money(subtotal / 100))}</Text></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text tone="secondary">Shipping</Text><Text style={{ color: shipping ? colors.foreground : colors.success }}>{shipping ? formatMoney(money(shipping / 100)) : 'Free'}</Text></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}><Text variant="heading">Total</Text><Text variant="title" tone="brand">{formatMoney(money(total / 100))}</Text></View>
          </View>
          <Button label="Checkout" variant="gradient" size="lg" fullWidth onPress={() => router.push('/checkout')} />
        </View>
      )}
    </View>
  );
}
