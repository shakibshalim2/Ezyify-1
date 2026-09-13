import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartCount } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { SearchBar } from '@/components/SearchBar';
import { Chip } from '@/components/Chip';
import { IconButton } from '@/components/IconButton';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { products, categories } from '@/lib/mock';
import { useTheme } from '@/theme';

const SORTS = ['Popular', 'Newest', 'Price ↑', 'Price ↓'] as const;
const CATEGORY_MAP: Record<string, string> = { 'prod-001': 'Tech', 'prod-002': 'Tech', 'prod-003': 'Tech', 'prod-004': 'Fashion', 'prod-005': 'Fashion', 'prod-006': 'Beauty', 'prod-007': 'Fitness', 'prod-008': 'Home' };

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius, gradients } = useTheme();
  const cartCount = useCartCount();
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Popular');

  const list = useMemo(() => {
    let l = cat ? products.filter(p => CATEGORY_MAP[p.id] === cat) : [...products];
    if (sort === 'Price ↑') l = [...l].sort((a, b) => a.price.amount - b.price.amount);
    if (sort === 'Price ↓') l = [...l].sort((a, b) => b.price.amount - a.price.amount);
    if (sort === 'Popular') l = [...l].sort((a, b) => b.reviewCount - a.reviewCount);
    return l;
  }, [cat, sort]);

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
        data={list}
        keyExtractor={p => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24, paddingTop: 12 }}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 4 }}>
            <View style={{ marginHorizontal: 16, borderRadius: radius.sheet, overflow: 'hidden' }}>
              <LinearGradient colors={[gradients.warm[0], gradients.warm[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 20, gap: 8, minHeight: 140, justifyContent: 'center' }}>
                <Text variant="caption" style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5, fontFamily: 'Inter_600SemiBold' }}>FLASH DEALS · ENDS IN 04:12:33</Text>
                <Text variant="title" style={{ color: '#fff', maxWidth: '70%' }}>Up to 60% off tech & beauty</Text>
                <Button label="Shop deals" variant="secondary" size="sm" style={{ backgroundColor: '#fff' }} onPress={() => router.push('/deals')} />
              </LinearGradient>
              <Image source={{ uri: products[0].imageUrl }} style={{ position: 'absolute', right: -10, bottom: -10, width: 120, height: 120, borderRadius: 60, opacity: 0.9 }} contentFit="cover" />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              <Chip label="All" selected={!cat} onPress={() => setCat(null)} />
              {categories.map(c => <Chip key={c.id} label={c.name} icon={c.icon} selected={cat === c.name} onPress={() => setCat(cat === c.name ? null : c.name)} />)}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
              <Text variant="heading">{cat ?? 'All products'} <Text variant="caption" tone="secondary">· {list.length}</Text></Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Change sort" onPress={() => setSort(SORTS[(SORTS.indexOf(sort) + 1) % SORTS.length])} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 36, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: colors.muted }}>
                <Ionicons name="swap-vertical" size={14} color={colors.foregroundSecondary} />
                <Text variant="label" tone="secondary">{sort}</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState icon="bag-outline" title="No products here yet" body="Try another category or clear the filter." actionLabel="Show all" onAction={() => setCat(null)} />}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
