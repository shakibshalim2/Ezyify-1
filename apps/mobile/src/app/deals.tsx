import { FlatList, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts, type ProductSummary } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton';
import { ErrorState } from '@/components/QueryState';
import { useInfiniteList, useRefresh } from '@/lib/data';
import { useTheme } from '@/theme';

const discount = (p: ProductSummary) => (p.compareAtPrice ? 1 - p.price.amount / p.compareAtPrice.amount : 0);

export default function DealsScreen() {
  const { colors, radius, gradients } = useTheme();
  const products = useProducts({ sort: 'popular', pageSize: 50 });
  const { items, loadMore } = useInfiniteList<ProductSummary>(products);
  const { refreshing, onRefresh } = useRefresh(products.refetch);
  // The catalog has no "on sale" filter yet; deals are products with a compare-at price, biggest discount first.
  const deals = items.filter(p => p.compareAtPrice).sort((a, b) => discount(b) - discount(a));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Deals" />
      <FlatList
        data={deals}
        keyExtractor={p => p.id}
        numColumns={2}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        ListHeaderComponent={
          <LinearGradient colors={[gradients.warm[0], gradients.warm[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ margin: 16, marginTop: 4, borderRadius: radius.sheet, padding: 20, gap: 6 }}>
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5, fontFamily: 'Inter_600SemiBold' }}>FLASH SALE · TODAY ONLY</Text>
            <Text variant="title" style={{ color: '#fff' }}>Today&apos;s biggest drops</Text>
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>Escrow-protected · free shipping over $50</Text>
          </LinearGradient>
        }
        ListEmptyComponent={
          products.isLoading ? <ProductGridSkeleton /> : products.error ? <ErrorState error={products.error} onRetry={() => products.refetch()} /> : (
            <EmptyState icon="pricetags-outline" title="No deals right now" body="Check back soon — sellers drop new discounts every day." />
          )
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
