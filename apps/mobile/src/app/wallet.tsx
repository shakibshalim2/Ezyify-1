import { useState } from 'react';
import { FlatList, Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney, formatRelativeTime, useTopUp, useTransactions, useWallet, useWithdraw, type Transaction } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { Field } from '@/components/Field';
import { Chip } from '@/components/Chip';
import { ErrorState } from '@/components/QueryState';
import { formErrors } from '@/lib/auth';
import { authenticate } from '@/lib/biometrics';
import { useInfiniteList, useRefresh } from '@/lib/data';
import { useTheme } from '@/theme';

const ICON: Record<Transaction['type'], keyof typeof Ionicons.glyphMap> = { topup: 'add-circle', purchase: 'bag-handle', refund: 'return-down-back', commission: 'sparkles', withdrawal: 'arrow-up-circle', transfer: 'swap-horizontal' };
const PRESETS = [10, 25, 50, 100];

/** Bottom sheet for top-up / withdraw; amounts are entered in major units and sent as cents. */
function AmountSheet({ mode, onClose, max }: { mode: 'topup' | 'withdraw' | null; onClose: () => void; max: number }) {
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const topup = useTopUp();
  const withdraw = useWithdraw();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'card' | 'bank_transfer'>('card');
  const cents = Math.round(Number(amount.replace(/[^0-9.]/g, '')) * 100) || 0;
  const busy = topup.isPending || withdraw.isPending;
  const err = topup.error ?? withdraw.error;
  const errors = err ? formErrors(err) : null;
  const tooMuch = mode === 'withdraw' && cents > max;
  const minimum = mode === 'withdraw' ? 500 : 100;

  const submit = async () => {
    if (cents < minimum || tooMuch) return;
    try {
      if (mode === 'withdraw') {
        const auth = await authenticate('Confirm withdrawal');
        if (!auth.success) return;
        await withdraw.mutateAsync({ amount: cents, payoutMethodId: 'bank_primary' });
      } else await topup.mutateAsync({ amount: cents, method });
      setAmount('');
      onClose();
    } catch {
      // Error surfaces through the mutation state below.
    }
  };

  return (
    <Modal visible={!!mode} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <View style={{ backgroundColor: colors.backgroundElevated, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: 20, paddingBottom: insets.bottom + 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="title">{mode === 'withdraw' ? 'Withdraw' : 'Top up wallet'}</Text>
          <IconButton icon="close" label="Close" onPress={onClose} />
        </View>
        <Field label={`Amount (USD)${mode === 'withdraw' ? ` · up to ${formatMoney({ amount: max, currency: 'USD' })}` : ''}`} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" error={tooMuch ? 'Exceeds your available balance' : errors?.fields.amount} autoFocus />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {PRESETS.map(p => <Chip key={p} label={`$${p}`} selected={cents === p * 100} onPress={() => setAmount(String(p))} />)}
        </View>
        {mode === 'topup' && (
          <View style={{ gap: 8 }}>
            <Text variant="label" tone="secondary">Pay with</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label="Card" icon="card-outline" selected={method === 'card'} onPress={() => setMethod('card')} />
              <Chip label="Bank transfer" icon="business-outline" selected={method === 'bank_transfer'} onPress={() => setMethod('bank_transfer')} />
            </View>
          </View>
        )}
        {mode === 'withdraw' && <Text variant="caption" tone="secondary">Sent to your primary bank account · arrives in 1–2 business days.</Text>}
        {errors?.message && <Text variant="caption" style={{ color: colors.error }}>{errors.message}</Text>}
        <Button label={mode === 'withdraw' ? 'Withdraw' : 'Add funds'} variant="gradient" size="lg" fullWidth loading={busy} disabled={cents < minimum || tooMuch} onPress={submit} />
      </View>
    </Modal>
  );
}

export default function WalletScreen() {
  const router = useRouter();
  const { colors, radius, gradients } = useTheme();
  const wallet = useWallet();
  const tx = useTransactions();
  const { items, loadMore, loadingMore } = useInfiniteList<Transaction>(tx);
  const { refreshing, onRefresh } = useRefresh(async () => Promise.all([wallet.refetch(), tx.refetch()]));
  const [sheet, setSheet] = useState<'topup' | 'withdraw' | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Wallet" right={<IconButton icon="receipt-outline" label="Orders" onPress={() => router.push('/orders')} />} />
      <FlatList
        data={items}
        keyExtractor={t => t.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 32 }}
        ListHeaderComponent={
          <View style={{ gap: 20, paddingBottom: 12 }}>
            <LinearGradient colors={[gradients.brand[0], gradients.brand[1], gradients.vivid[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius.sheet, padding: 22, gap: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="caption" style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: 1.4, fontFamily: 'Inter_600SemiBold' }}>AVAILABLE BALANCE</Text>
                <Ionicons name="shield-checkmark" size={18} color="rgba(255,255,255,0.9)" />
              </View>
              {wallet.data ? (
                <Text variant="display" style={{ color: '#fff', fontSize: 40, lineHeight: 46 }}>{formatMoney(wallet.data.balance)}</Text>
              ) : wallet.error ? (
                <Text variant="heading" style={{ color: '#fff' }}>Couldn&apos;t load balance</Text>
              ) : (
                <Skeleton width={180} height={44} style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} />
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="hourglass-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>{wallet.data ? `${formatMoney(wallet.data.pending)} pending` : '—'}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button label="Top up" variant="secondary" size="md" style={{ flex: 1, backgroundColor: '#fff' }} fullWidth onPress={() => setSheet('topup')} />
                <Button label="Withdraw" variant="secondary" size="md" style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.18)' }} fullWidth textColor="#fff" disabled={!wallet.data || wallet.data.balance.amount < 500} onPress={() => setSheet('withdraw')} />
              </View>
            </LinearGradient>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[{ icon: 'receipt-outline', label: 'Orders', href: '/orders' }, { icon: 'pricetags-outline', label: 'Deals', href: '/deals' }, { icon: 'notifications-outline', label: 'Alerts', href: '/notifications' }, { icon: 'settings-outline', label: 'Settings', href: '/settings' }].map(a => (
                <View key={a.label} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                  <IconButton icon={a.icon as never} label={a.label} variant="filled" onPress={() => router.push(a.href as never)} style={{ width: 52, height: 52, borderRadius: radius.card }} />
                  <Text variant="caption" tone="secondary">{a.label}</Text>
                </View>
              ))}
            </View>
            <Text variant="heading">Recent activity</Text>
          </View>
        }
        ListEmptyComponent={
          tx.isLoading ? (
            <View style={{ gap: 8 }}>{[0, 1, 2].map(i => <Skeleton key={i} height={66} radius={16} />)}</View>
          ) : tx.error ? (
            <ErrorState error={tx.error} onRetry={() => tx.refetch()} />
          ) : (
            <EmptyState icon="wallet-outline" title="No transactions yet" body="Top up your wallet or make a purchase to see activity here." actionLabel="Top up" onAction={() => setSheet('topup')} />
          )
        }
        ListFooterComponent={loadingMore ? <Skeleton height={66} radius={16} /> : null}
        renderItem={({ item }) => {
          const inflow = item.direction === 'in';
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: inflow ? colors.successSubtle : colors.muted, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={ICON[item.type]} size={20} color={inflow ? colors.success : colors.foregroundSecondary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyMedium" numberOfLines={1}>{item.description}</Text>
                <Text variant="caption" tone="tertiary">{formatRelativeTime(item.createdAt)}{item.status === 'pending' ? ' · Pending' : item.status === 'failed' ? ' · Failed' : ''}</Text>
              </View>
              <Text variant="label" style={{ color: inflow ? colors.success : colors.foreground, textDecorationLine: item.status === 'failed' ? 'line-through' : 'none' }}>{inflow ? '+' : '−'}{formatMoney(item.amount)}</Text>
            </View>
          );
        }}
      />
      <AmountSheet mode={sheet} onClose={() => setSheet(null)} max={wallet.data?.balance.amount ?? 0} />
    </View>
  );
}
