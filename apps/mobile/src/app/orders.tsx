import { useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatMoney, type OrderStatus } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { products } from '@/lib/mock';
import { useTheme } from '@/theme';

const ORDERS = [
  { id: 'o1', number: 'EZ-10422', status: 'out_for_delivery' as OrderStatus, product: products[3], qty: 1, escrow: 'held' },
  { id: 'o2', number: 'EZ-10391', status: 'processing' as OrderStatus, product: products[0], qty: 1, escrow: 'held' },
  { id: 'o3', number: 'EZ-10240', status: 'completed' as OrderStatus, product: products[5], qty: 2, escrow: 'released' },
  { id: 'o4', number: 'EZ-10188', status: 'refund_requested' as OrderStatus, product: products[2], qty: 1, escrow: 'disputed' },
];
const FILTERS = [['all', 'All'], ['active', 'Active'], ['completed', 'Completed'], ['refunds', 'Refunds']] as const;
const LABEL: Partial<Record<OrderStatus, { text: string; tone: 'primary' | 'success' | 'accent' | 'neutral' }>> = {
  processing: { text: 'Preparing', tone: 'neutral' }, shipped: { text: 'Shipped', tone: 'primary' }, out_for_delivery: { text: 'Out for delivery', tone: 'primary' },
  completed: { text: 'Completed', tone: 'success' }, refund_requested: { text: 'Refund requested', tone: 'accent' }, delivered: { text: 'Delivered', tone: 'success' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const [f, setF] = useState<(typeof FILTERS)[number][0]>('all');
  const list = ORDERS.filter(o => f === 'all' || (f === 'active' && ['processing', 'shipped', 'out_for_delivery'].includes(o.status)) || (f === 'completed' && o.status === 'completed') || (f === 'refunds' && o.status.startsWith('refund')));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="My orders" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}>
        {FILTERS.map(([id, label]) => <Chip key={id} label={label} selected={f === id} onPress={() => setF(id)} />)}
      </ScrollView>
      <FlatList
        data={list}
        keyExtractor={o => o.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 32 }}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No orders here" body="Orders matching this filter will appear here." />}
        renderItem={({ item }) => {
          const l = LABEL[item.status] ?? { text: item.status, tone: 'neutral' as const };
          const active = ['processing', 'shipped', 'out_for_delivery'].includes(item.status);
          return (
            <View style={{ backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle, padding: 14, gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="caption" tone="secondary">{item.number} · {item.product.seller.name}</Text>
                <Badge label={l.text} tone={l.tone} />
              </View>
              <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.product.id } })} style={{ flexDirection: 'row', gap: 12 }}>
                <Image source={{ uri: item.product.imageUrl }} style={{ width: 64, height: 64, borderRadius: radius.md }} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyMedium" numberOfLines={2}>{item.product.name}</Text>
                  <Text variant="caption" tone="secondary">Qty {item.qty}</Text>
                  <Text variant="label" tone="brand">{formatMoney({ amount: item.product.price.amount * item.qty, currency: 'USD' })}</Text>
                </View>
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={item.escrow === 'released' ? 'checkmark-circle' : item.escrow === 'disputed' ? 'alert-circle' : 'lock-closed'} size={14} color={item.escrow === 'released' ? colors.success : item.escrow === 'disputed' ? colors.warning : colors.primary} />
                <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{item.escrow === 'released' ? 'Payment released to seller' : item.escrow === 'disputed' ? 'Under review — funds held' : 'Funds held in escrow until you confirm delivery'}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {active && <Button label="Track" variant="primary" size="sm" style={{ flex: 1 }} fullWidth />}
                {item.status === 'out_for_delivery' && <Button label="Confirm delivery" variant="accent" size="sm" style={{ flex: 1 }} fullWidth />}
                {item.status === 'completed' && <Button label="Buy again" variant="secondary" size="sm" style={{ flex: 1 }} fullWidth onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.product.id } })} />}
                {item.status === 'completed' && <Button label="Write review" variant="ghost" size="sm" style={{ flex: 1 }} fullWidth />}
                {item.status === 'refund_requested' && <Button label="View dispute" variant="secondary" size="sm" style={{ flex: 1 }} fullWidth />}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
