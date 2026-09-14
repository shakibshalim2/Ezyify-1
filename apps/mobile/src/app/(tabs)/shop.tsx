import { useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCategories, useProducts, type ProductSummary } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { SearchBar } from '@/components/SearchBar';
import { Chip } from '@/components/Chip';
import { IconButton } from '@/components/IconButton';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton';
import { ErrorState } from '@/components/QueryState';
import { categoryIcon } from '@/lib/categories';
import { useBadgeCount, useInfiniteList, useRefresh } from '@/lib/data';
import { useTheme } from '@/theme';

const SORTS = [
  { id: 'popular', label: 'Popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'price_asc', label: 'Price ↑' },
  { id: 'price_desc', label: 'Price ↓' },
  { id: 'rating', label: 'Top rated' },
] as const;
type Sort = (typeof SORTS)[number]['id'];

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius, gradients } = useTheme();
  const cartCount = useBadgeCount();
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('popular');

  const categories = useCategories();
  const products = useProducts({ sort, ...(cat ? { category: cat } : {}) });
  const { items, loadMore, loadingMore } = useInfiniteList<ProductSummary>(products);
  const { refreshing, onRefresh } = useRefresh(products.refetch);
  const total = products.data?.pages[0]?.pagination.total;
  const hero = items[0];
  const catName = categories.data?.find(c => c.slug === cat)?.name;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}><SearchBar asButton placeholder="Search products" onPressButton={() => router.push('/explore')} /></View>
        <View>
          <IconButton icon="bag-handle-outline" label="Cart" variant="filled" onPress={() => router.push('/cart')} />
          {cartCount > 0 && <View style={{ position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}><Text variant="caption" style={{ color: colors.accentForeground, fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>{cartCount}</Text></View>}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={p => p.id}
        numColumns={2}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24, paddingTop: 12 }}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 4 }}>
            <View style={{ marginHorizontal: 16, borderRadius: radius.sheet, overflow: 'hidden' }}>
              <LinearGradient colors={[gradients.warm[0], gradients.warm[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 20, gap: 8, minHeight: 140, justifyContent: 'center' }}>
                <Text variant="caption" style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5, fontFamily: 'Inter_600SemiBold' }}>FLASH DEALS · TODAY ONLY</Text>
                <Text variant="title" style={{ color: '#fff', maxWidth: '70%' }}>Up to 60% off tech & beauty</Text>
                <Button label="Shop deals" variant="secondary" size="sm" style={{ backgroundColor: '#fff' }} onPress={() => router.push('/deals')} />
              </LinearGradient>
              {hero && <Image source={{ uri: hero.imageUrl }} style={{ position: 'absolute', right: -10, bottom: -10, width: 120, height: 120, borderRadius: 60, opacity: 0.9 }} contentFit="cover" />}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              <Chip label="All" selected={!cat} onPress={() => setCat(null)} />
              {(categories.data ?? []).map(c => <Chip key={c.id} label={c.name} icon={categoryIcon(c.slug)} selected={cat === c.slug} onPress={() => setCat(cat === c.slug ? null : c.slug)} />)}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
              <Text variant="heading">{catName ?? 'All products'} {total != null && <Text variant="caption" tone="secondary">· {total}</Text>}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Change sort" onPress={() => setSort(SORTS[(SORTS.findIndex(s => s.id === sort) + 1) % SORTS.length].id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 36, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.muted }}>
                <Ionicons name="swap-vertical" size={14} color={colors.foregroundSecondary} />
                <Text variant="label" tone="secondary">{SORTS.find(s => s.id === sort)!.label}</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          products.isLoading ? <ProductGridSkeleton /> : products.error ? <ErrorState error={products.error} onRetry={() => products.refetch()} /> : (
            <EmptyState icon="bag-outline" title="No products here yet" body="Try another category or clear the filter." actionLabel="Show all" onAction={() => setCat(null)} />
          )
        }
        ListFooterComponent={loadingMore ? <ProductGridSkeleton rows={1} /> : null}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
