import { View } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { formatMoney, useCart } from '@ezyify/core';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { sampleProducts } from '@/lib/sample-data';
import { useTheme } from '@/theme';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { radius } = useTheme();
  const add = useCart(s => s.add);
  const product = sampleProducts.find(p => p.id === id);

  if (!product) {
    return (
      <Screen>
        <Text variant="title">Product not found</Text>
        <Button label="Go back" variant="secondary" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '', headerTransparent: true }} />
      <Screen padded={false}>
        <Image source={{ uri: product.imageUrl }} style={{ aspectRatio: 1 }} contentFit="cover" />
        <View style={{ padding: 16, gap: 12, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, marginTop: -24, backgroundColor: 'transparent' }}>
          <Text variant="caption" tone="secondary">
            {product.seller.name}
            {product.seller.verified ? ' · Verified' : ''}
          </Text>
          <Text variant="title">{product.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text variant="display" tone="brand">
              {formatMoney(product.price)}
            </Text>
            {product.compareAtPrice && (
              <Text tone="tertiary" style={{ textDecorationLine: 'line-through' }}>
                {formatMoney(product.compareAtPrice)}
              </Text>
            )}
          </View>
          <Text tone="secondary">
            ★ {product.rating.toFixed(1)} · {product.reviewCount.toLocaleString()} reviews
          </Text>
          <Button
            label="Add to cart"
            variant="gradient"
            size="lg"
            fullWidth
            onPress={() => {
              add(product.id, 1);
              router.back();
            }}
            style={{ marginTop: 8 }}
          />
        </View>
      </Screen>
    </>
  );
}
