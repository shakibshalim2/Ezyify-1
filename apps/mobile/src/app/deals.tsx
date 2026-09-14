import { FlatList, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { ProductCard } from '@/components/ProductCard';
import { products } from '@/lib/mock';
import { useTheme } from '@/theme';

export default function DealsScreen() {
  const { colors, radius, gradients } = useTheme();
  const deals = products.filter(p => p.compareAtPrice).sort((a, b) => (1 - a.price.amount / a.compareAtPrice!.amount < 1 - b.price.amount / b.compareAtPrice!.amount ? 1 : -1));
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Deals" />
      <FlatList
        data={deals}
        keyExtractor={p => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        ListHeaderComponent={
          <LinearGradient colors={[gradients.warm[0], gradients.warm[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ margin: 16, marginTop: 4, borderRadius: radius.sheet, padding: 20, gap: 6 }}>
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5, fontFamily: 'Inter_600SemiBold' }}>FLASH SALE · ENDS IN 04:12:33</Text>
            <Text variant="title" style={{ color: '#fff' }}>Today&apos;s biggest drops</Text>
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>Escrow-protected · free shipping over $50</Text>
          </LinearGradient>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  );
}
