import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { formatMoney, discountPercent, type ProductSummary } from '@ezyify/core';
import { useTheme } from '@/theme';
import { Text } from './Text';

export function ProductCard({ product }: { product: ProductSummary }) {
  const { colors, radius } = useTheme();
  const off = discountPercent(product.price, product.compareAtPrice);
  return (
    <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={product.name} style={{ flex: 1 }}>
        <View style={{ borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
          <Image source={{ uri: product.imageUrl }} style={{ aspectRatio: 1 }} contentFit="cover" transition={200} />
          {off !== null && (
            <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text variant="caption" style={{ color: colors.accentForeground, fontFamily: 'Inter_600SemiBold' }}>
                -{off}%
              </Text>
            </View>
          )}
          <View style={{ padding: 10, gap: 2 }}>
            <Text variant="bodyMedium" numberOfLines={2}>
              {product.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Text variant="label" tone="brand">
                {formatMoney(product.price)}
              </Text>
              {product.compareAtPrice && (
                <Text variant="caption" tone="tertiary" style={{ textDecorationLine: 'line-through' }}>
                  {formatMoney(product.compareAtPrice)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
