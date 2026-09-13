import { FlatList, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { formatMoney, formatRelativeTime, type Transaction } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { EmptyState } from '@/components/EmptyState';
import { transactions, wallet } from '@/lib/mock';
import { useTheme } from '@/theme';

const ICON: Record<Transaction['type'], keyof typeof Ionicons.glyphMap> = { topup: 'add-circle', purchase: 'bag-handle', refund: 'return-down-back', commission: 'sparkles', withdrawal: 'arrow-up-circle', transfer: 'swap-horizontal' };

export default function WalletScreen() {
  const router = useRouter();
  const { colors, radius, gradients } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Wallet" right={<IconButton icon="time-outline" label="History" />} />
      <FlatList
        data={transactions}
        keyExtractor={t => t.id}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 32 }}
        ListHeaderComponent={
          <View style={{ gap: 20, paddingBottom: 12 }}>
            <LinearGradient colors={[gradients.brand[0], gradients.brand[1], gradients.vivid[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radius.sheet, padding: 22, gap: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="caption" style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: 1.4, fontFamily: 'Inter_600SemiBold' }}>AVAILABLE BALANCE</Text>
                <Ionicons name="shield-checkmark" size={18} color="rgba(255,255,255,0.9)" />
              </View>
              <Text variant="display" style={{ color: '#fff', fontSize: 40, lineHeight: 46 }}>{formatMoney(wallet.balance)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="hourglass-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>{formatMoney(wallet.pending)} pending in escrow</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button label="Top up" variant="secondary" size="md" style={{ flex: 1, backgroundColor: '#fff' }} fullWidth />
                <Button label="Withdraw" variant="secondary" size="md" style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.18)" }} fullWidth textColor="#fff" />
              </View>
            </LinearGradient>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[{ icon: 'receipt-outline', label: 'Orders', href: '/orders' }, { icon: 'gift-outline', label: 'Rewards', href: '/deals' }, { icon: 'people-outline', label: 'Referrals', href: '/deals' }, { icon: 'card-outline', label: 'Cards', href: '/settings' }].map(a => (
                <View key={a.label} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                  <IconButton icon={a.icon as never} label={a.label} variant="filled" onPress={() => router.push(a.href as never)} style={{ width: 52, height: 52, borderRadius: radius.card }} />
                  <Text variant="caption" tone="secondary">{a.label}</Text>
                </View>
              ))}
            </View>
            <Text variant="heading">Recent activity</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="wallet-outline" title="No transactions yet" body="Top up your wallet or make a purchase to see activity here." />}
        renderItem={({ item }) => {
          const inflow = item.direction === 'in';
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: inflow ? colors.successSubtle : colors.muted, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={ICON[item.type]} size={20} color={inflow ? colors.success : colors.foregroundSecondary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyMedium" numberOfLines={1}>{item.description}</Text>
                <Text variant="caption" tone="tertiary">{formatRelativeTime(item.createdAt)}{item.status === 'pending' ? ' · Pending' : ''}</Text>
              </View>
              <Text variant="label" style={{ color: inflow ? colors.success : colors.foreground }}>{inflow ? '+' : '−'}{formatMoney(item.amount)}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}
