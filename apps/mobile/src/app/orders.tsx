import { useState } from 'react';
import { Alert, FlatList, Linking, Pressable, ScrollView, View } from 'react-native';
import { confirm } from '@/lib/confirm';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatMoney, formatRelativeTime, formatTimeUntil, useOrderAction, useOrders, type Order, type OrderStatus } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useInfiniteList, useRefresh } from '@/lib/data';
import { useTheme } from '@/theme';

const FILTERS = [['all', 'All'], ['active', 'Active'], ['completed', 'Completed'], ['refunds', 'Refunds & cancelled']] as const;
type Filter = (typeof FILTERS)[number][0];
const ACTIVE: OrderStatus[] = ['pending_payment', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const LABEL: Record<OrderStatus, { text: string; tone: 'primary' | 'success' | 'accent' | 'neutral' }> = {
  pending_payment: { text: 'Awaiting payment', tone: 'accent' },
  paid: { text: 'Paid', tone: 'primary' },
  processing: { text: 'Preparing', tone: 'neutral' },
  shipped: { text: 'Shipped', tone: 'primary' },
  out_for_delivery: { text: 'Out for delivery', tone: 'primary' },
  delivered: { text: 'Delivered', tone: 'success' },
  completed: { text: 'Completed', tone: 'success' },
  cancelled: { text: 'Cancelled', tone: 'neutral' },
  refund_requested: { text: 'Refund requested', tone: 'accent' },
  refunded: { text: 'Refunded', tone: 'neutral' },
  disputed: { text: 'In dispute', tone: 'accent' },
};
const matches = (o: Order, f: Filter) => f === 'all' || (f === 'active' && ACTIVE.includes(o.status)) || (f === 'completed' && o.status === 'completed') || (f === 'refunds' && ['refund_requested', 'refunded', 'disputed', 'cancelled'].includes(o.status));

function OrderSkeleton() {
  const { colors, radius } = useTheme();
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle, padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Skeleton width={140} height={12} /><Skeleton width={70} height={20} radius={10} /></View>
      <View style={{ flexDirection: 'row', gap: 12 }}><Skeleton width={64} height={64} radius={12} /><View style={{ flex: 1, gap: 8 }}><Skeleton width="80%" height={14} /><Skeleton width={60} height={10} /><Skeleton width={80} height={14} /></View></View>
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const action = useOrderAction();
  const l = LABEL[order.status];
  const first = order.items[0];
  const extra = order.items.length - 1;
  const escrow = order.escrow.status;
  const confirmDelivery = async () => {
    if (await confirm({ title: 'Confirm delivery?', message: `This releases ${formatMoney(order.total)} to ${order.seller.name}. Only confirm once you have the items.`, confirmLabel: 'Confirm', cancelLabel: 'Not yet' })) action.mutate({ id: order.id, action: 'confirm' });
  };
  const cancel = async () => {
    if (await confirm({ title: 'Cancel order?', message: order.status === 'pending_payment' ? 'The order will be removed.' : 'Your payment is refunded to your wallet instantly.', confirmLabel: 'Cancel order', cancelLabel: 'Keep it', destructive: true })) action.mutate({ id: order.id, action: 'cancel' });
  };
  const refund = async () => {
    if (await confirm({ title: 'Request a refund?', message: 'Funds stay in escrow while we review with the seller (usually within 48 hours).', confirmLabel: 'Request refund', cancelLabel: 'Back', destructive: true })) action.mutate({ id: order.id, action: 'refund', reason: 'Item not as described', itemIds: order.items.map(i => i.id) });
  };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle, padding: 14, gap: 12, opacity: action.isPending ? 0.7 : 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="caption" tone="secondary">{order.orderNumber} · {order.seller.name} · {formatRelativeTime(order.placedAt)}</Text>
        <Badge label={l.text} tone={l.tone} />
      </View>
      <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/product/[id]', params: { id: first.productId } })} style={{ flexDirection: 'row', gap: 12 }}>
        <Image source={{ uri: first.imageUrl }} style={{ width: 64, height: 64, borderRadius: radius.md }} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyMedium" numberOfLines={2}>{first.name}{extra > 0 ? ` + ${extra} more` : ''}</Text>
          <Text variant="caption" tone="secondary">Qty {order.items.reduce((n, i) => n + i.quantity, 0)}{first.variant ? ` · ${first.variant}` : ''}</Text>
          <Text variant="label" tone="brand">{formatMoney(order.total)}</Text>
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name={escrow === 'released' ? 'checkmark-circle' : escrow === 'disputed' ? 'alert-circle' : escrow === 'refunded' ? 'return-down-back' : 'lock-closed'} size={14} color={escrow === 'released' ? colors.success : escrow === 'disputed' ? colors.warning : colors.primary} />
        <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
          {escrow === 'released' ? 'Payment released to seller' : escrow === 'disputed' ? 'Under review — funds held' : escrow === 'refunded' ? 'Refunded to your wallet' : order.escrow.autoReleaseAt ? `Funds held in escrow · auto-releases ${formatTimeUntil(order.escrow.autoReleaseAt)}` : 'Funds held in escrow until you confirm delivery'}
        </Text>
      </View>
      {action.error && <ErrorState compact error={action.error} />}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {order.tracking && <Button label="Track" variant="primary" size="sm" style={{ flex: 1 }} fullWidth onPress={() => (order.tracking?.url ? Linking.openURL(order.tracking.url) : Alert.alert(order.tracking!.carrier, order.tracking!.number))} />}
        {['shipped', 'out_for_delivery', 'delivered'].includes(order.status) && <Button label="Confirm delivery" variant="accent" size="sm" style={{ flex: 1 }} fullWidth onPress={confirmDelivery} />}
        {['pending_payment', 'paid', 'processing'].includes(order.status) && <Button label="Cancel" variant="secondary" size="sm" style={{ flex: 1 }} fullWidth onPress={cancel} />}
        {['shipped', 'out_for_delivery', 'delivered'].includes(order.status) && escrow === 'held' && <Button label="Problem?" variant="ghost" size="sm" style={{ flex: 1 }} fullWidth onPress={refund} />}
        {order.status === 'completed' && <Button label="Buy again" variant="secondary" size="sm" style={{ flex: 1 }} fullWidth onPress={() => router.push({ pathname: '/product/[id]', params: { id: first.productId } })} />}
        {order.status === 'completed' && <Button label="Message seller" variant="ghost" size="sm" style={{ flex: 1 }} fullWidth onPress={() => router.push({ pathname: '/messages/[id]', params: { id: 'new', username: order.seller.username } })} />}
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const [f, setF] = useState<Filter>('all');
  const orders = useOrders({ pageSize: 50 });
  const { items, loadMore, loadingMore } = useInfiniteList<Order>(orders);
  const { refreshing, onRefresh } = useRefresh(orders.refetch);
  const list = items.filter(o => matches(o, f));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="My orders" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}>
        {FILTERS.map(([id, label]) => <Chip key={id} label={label} selected={f === id} onPress={() => setF(id)} />)}
      </ScrollView>
      <FlatList
        data={list}
        keyExtractor={o => o.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 32 }}
        ListEmptyComponent={
          orders.isLoading ? <View style={{ gap: 12 }}><OrderSkeleton /><OrderSkeleton /></View> : orders.error ? <ErrorState error={orders.error} onRetry={() => orders.refetch()} /> : (
            <EmptyState icon="receipt-outline" title={f === 'all' ? 'No orders yet' : 'No orders here'} body={f === 'all' ? 'Everything you buy shows up here with live tracking and escrow status.' : 'Orders matching this filter will appear here.'} />
          )
        }
        ListFooterComponent={loadingMore ? <OrderSkeleton /> : null}
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </View>
  );
}
