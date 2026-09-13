import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { discountPercent, formatCompactNumber, formatMoney, useCart, useCartCount } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { ProductCard } from '@/components/ProductCard';
import { findProduct, products, users } from '@/lib/mock';
import { useTheme } from '@/theme';

const W = Dimensions.get('window').width;
const COLORS = ['Midnight', 'Sand', 'Olive'];
const SIZES = ['S', 'M', 'L', 'XL'];

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const add = useCart(s => s.add);
  const cartCount = useCartCount();
  const product = findProduct(id);
  const [img, setImg] = useState(0);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <EmptyState icon="cube-outline" title="Product not found" body="This item may have sold out or been removed." actionLabel="Back to shop" onAction={() => router.replace('/(tabs)/shop')} />
      </View>
    );
  }

  const gallery = [product.imageUrl, ...products.filter(p => p.id !== product.id).slice(0, 2).map(p => p.imageUrl)];
  const off = discountPercent(product.price, product.compareAtPrice);
  const seller = users.find(u => u.username === product.seller.username) ?? users[3];
  const related = products.filter(p => p.id !== product.id).slice(0, 4);

  const addToCart = () => {
    add(product.id, qty, `${color}/${size}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={e => setImg(Math.round(e.nativeEvent.contentOffset.x / W))}>
            {gallery.map((u, i) => <Image key={u + i} source={{ uri: u }} style={{ width: W, aspectRatio: 1 }} contentFit="cover" transition={200} />)}
          </ScrollView>
          <View style={{ position: 'absolute', top: insets.top, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton icon="chevron-back" label="Back" variant="overlay" onPress={() => router.back()} />
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <IconButton icon="share-outline" label="Share" variant="overlay" />
              <IconButton icon="heart-outline" label="Add to wishlist" variant="overlay" />
              <View>
                <IconButton icon="bag-handle-outline" label="Cart" variant="overlay" onPress={() => router.push('/cart')} />
                {cartCount > 0 && <View style={{ position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}><Text variant="caption" style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>{cartCount}</Text></View>}
              </View>
            </View>
          </View>
          <View style={{ position: 'absolute', bottom: 28, alignSelf: 'center', flexDirection: 'row', gap: 5 }}>
            {gallery.map((u, i) => <View key={u + i} style={{ width: i === img ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === img ? '#fff' : 'rgba(255,255,255,0.6)' }} />)}
          </View>
        </View>

        <View style={{ marginTop: -20, backgroundColor: colors.background, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: 20, gap: 18 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {product.badge && <Badge label={product.badge.toUpperCase()} tone={product.badge === 'sale' ? 'accent' : 'primary'} />}
              {off !== null && <Badge label={`-${off}%`} tone="accent" />}
              <Badge label="ESCROW" tone="success" />
            </View>
            <Text variant="title">{product.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text variant="label">{product.rating.toFixed(1)}</Text>
              <Text variant="caption" tone="secondary">({formatCompactNumber(product.reviewCount)} reviews) · {formatCompactNumber(1250)} sold</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <Text variant="display" tone="brand">{formatMoney(product.price)}</Text>
              {product.compareAtPrice && <Text tone="tertiary" style={{ textDecorationLine: 'line-through' }}>{formatMoney(product.compareAtPrice)}</Text>}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <Text variant="label">Colour · <Text variant="label" tone="secondary">{color}</Text></Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {COLORS.map(c => <Pressable key={c} accessibilityRole="radio" accessibilityState={{ checked: color === c }} accessibilityLabel={c} onPress={() => setColor(c)} style={{ height: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: color === c ? 2 : 1, borderColor: color === c ? colors.primary : colors.border, backgroundColor: color === c ? colors.primarySubtle : colors.card, justifyContent: 'center' }}><Text variant="label" style={{ color: color === c ? colors.primary : colors.foreground }}>{c}</Text></Pressable>)}
            </View>
            <Text variant="label">Size · <Text variant="label" tone="secondary">{size}</Text></Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {SIZES.map(s => <Pressable key={s} accessibilityRole="radio" accessibilityState={{ checked: size === s }} accessibilityLabel={`Size ${s}`} onPress={() => setSize(s)} style={{ width: 48, height: 44, borderRadius: radius.md, borderWidth: size === s ? 2 : 1, borderColor: size === s ? colors.primary : colors.border, backgroundColor: size === s ? colors.primarySubtle : colors.card, alignItems: 'center', justifyContent: 'center' }}><Text variant="label" style={{ color: size === s ? colors.primary : colors.foreground }}>{s}</Text></Pressable>)}
            </View>
          </View>

          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
            <Avatar uri={seller.avatarUrl} size={44} verified={product.seller.verified} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">{product.seller.name}</Text>
              <Text variant="caption" tone="secondary">98% positive · ships in 1–2 days</Text>
            </View>
            <Button label="Visit" variant="secondary" size="sm" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: seller.username } })} />
          </Card>

          <View style={{ gap: 8 }}>
            {[{ icon: 'shield-checkmark-outline', t: 'Escrow protection', d: 'Seller is paid only after you confirm delivery' }, { icon: 'return-down-back-outline', t: '7-day returns', d: 'Free returns on unworn items' }, { icon: 'rocket-outline', t: 'Free shipping over $50', d: 'Arrives in 3–5 days' }].map(r => (
              <View key={r.t} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.successSubtle, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={r.icon as never} size={18} color={colors.success} /></View>
                <View style={{ flex: 1 }}><Text variant="bodyMedium">{r.t}</Text><Text variant="caption" tone="secondary">{r.d}</Text></View>
              </View>
            ))}
          </View>

          <View style={{ gap: 6 }}>
            <Text variant="heading">About</Text>
            <Text tone="secondary">Premium build, everyday comfort. Designed for people who move fast — with details that hold up to daily use. Every purchase is covered by Ezyify escrow.</Text>
          </View>

          <View style={{ gap: 12 }}>
            <Text variant="heading">You might also like</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {related.map(p => <View key={p.id} style={{ width: (W - 52) / 2 }}><ProductCard product={p} /></View>)}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.muted, borderRadius: radius.pill, height: 48 }}>
          <IconButton icon="remove" label="Decrease quantity" size={16} style={{ width: 36, height: 36 }} onPress={() => setQty(q => Math.max(1, q - 1))} />
          <Text variant="label" style={{ minWidth: 16, textAlign: 'center' }}>{qty}</Text>
          <IconButton icon="add" label="Increase quantity" size={16} style={{ width: 36, height: 36 }} onPress={() => setQty(q => Math.min(10, q + 1))} />
        </View>
        <Button label={added ? 'Added ✓' : 'Add to cart'} variant={added ? 'primary' : 'gradient'} size="lg" fullWidth style={{ flex: 1.2 }} onPress={addToCart} />
        <Button label="Buy now" variant="accent" size="lg" fullWidth style={{ flex: 0.9 }} onPress={() => { add(product.id, qty, `${color}/${size}`); router.push('/checkout'); }} />
      </View>
    </View>
  );
}
