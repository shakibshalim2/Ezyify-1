import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatMoney, discountPercent, useCart, type ProductSummary } from '@ezyify/core';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function ProductCard({ product }: { product: ProductSummary }) {
  const { colors, radius } = useTheme();
  const off = discountPercent(product.price, product.compareAtPrice);
  const add = useCart(s => s.add);

  return (
    <View style={{ flex: 1, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
      <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
        <Pressable accessibilityRole="link" accessibilityLabel={product.name}>
          <View style={{ aspectRatio: 1 }}>
            <Image source={{ uri: product.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
          </View>
          {off !== null && (
            <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text variant="caption" style={{ color: colors.accentForeground, fontFamily: 'Inter_600SemiBold' }}>
                -{off}%
              </Text>
            </View>
          )}
          <View style={{ padding: 10, paddingBottom: 6, gap: 2 }}>
            <Text variant="bodyMedium" numberOfLines={2} style={{ minHeight: 44 }}>
              {product.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star" size={11} color={colors.warning} />
              <Text variant="caption" tone="secondary">{product.rating.toFixed(1)} · {product.reviewCount.toLocaleString()}</Text>
            </View>
          </View>
        </Pressable>
      </Link>
      {/* Price + quick-add live outside the link so the card never nests interactive elements */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flex: 1 }}>
          <Text variant="label" tone="brand">{formatMoney(product.price)}</Text>
          {product.compareAtPrice && (
            <Text variant="caption" tone="tertiary" style={{ textDecorationLine: 'line-through' }}>
              {formatMoney(product.compareAtPrice)}
            </Text>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.name} to cart`}
          hitSlop={6}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            add(product.id, 1);
          }}
          style={({ pressed }) => ({ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.92 : 1 }] })}
        >
          <Ionicons name="add" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </View>
  );
}
