import { View, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartCount } from '@ezyify/core';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { ProductCard } from '@/components/ProductCard';
import { sampleProducts } from '@/lib/sample-data';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const { colors, radius, gradients } = useTheme();
  const cartCount = useCartCount();

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={sampleProducts}
        keyExtractor={p => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, gap: 16, paddingBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
              <Text variant="title">Ezyify</Text>
              <Text variant="caption" tone="secondary">
                Cart · {cartCount}
              </Text>
            </View>
            <LinearGradient
              colors={[gradients.vivid[0], gradients.vivid[1], gradients.vivid[2]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: radius.sheet, padding: 20, gap: 12 }}
            >
              <Text variant="caption" style={{ color: colors.primaryForeground, opacity: 0.85, letterSpacing: 1.5 }}>
                DISCOVER
              </Text>
              <Text variant="display" style={{ color: colors.primaryForeground }}>
                Shopping that feels like scrolling
              </Text>
              <Button label="Explore live drops" variant="accent" size="md" />
            </LinearGradient>
            <Text variant="heading">Trending now</Text>
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </Screen>
  );
}
