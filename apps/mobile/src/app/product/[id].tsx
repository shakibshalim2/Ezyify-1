import { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Share, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { discountPercent, formatCompactNumber, formatMoney, useProduct, useProducts, useProfile, type ProductDetail, type ProductSummary } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { shareUrl } from '@/lib/links';
import { useAddLine, useBadgeCount } from '@/lib/data';
import { useTheme } from '@/theme';

const W = Dimensions.get('window').width;

/** Variants are flat `{ Color: 'Blue', Size: 'M' }` records; group the option values per axis for pickers. */
function optionAxes(variants: ProductDetail['variants']) {
  const axes = new Map<string, string[]>();
  for (const v of variants) for (const [k, val] of Object.entries(v.options)) axes.set(k, [...new Set([...(axes.get(k) ?? []), val])]);
  return [...axes.entries()];
}

function ProductSkeleton() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Skeleton width={W} height={W} radius={0} />
      <View style={{ padding: 20, gap: 14 }}>
        <Skeleton width={120} height={20} />
        <Skeleton width="85%" height={26} />
        <Skeleton width={160} height={14} />
        <Skeleton width={140} height={32} />
        <Skeleton height={64} radius={16} />
      </View>
      <View style={{ position: 'absolute', top: insets.top, left: 8 }}><IconButton icon="chevron-back" label="Back" variant="overlay" /></View>
    </View>
  );
}

function Related({ exclude, category }: { exclude: string; category: string }) {
  const q = useProducts({ category: category.toLowerCase(), pageSize: 6 });
  const related = (q.data?.pages[0]?.items ?? []).filter(p => p.id !== exclude).slice(0, 4);
  if (!related.length) return null;
  return (
    <View style={{ gap: 12 }}>
      <Text variant="heading">You might also like</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {related.map((p: ProductSummary) => <View key={p.id} style={{ width: (W - 52) / 2 }}><ProductCard product={p} /></View>)}
      </View>
    </View>
  );
}

function SellerCard({ username, verified, name }: { username: string; verified: boolean; name: string }) {
  const router = useRouter();
  const profile = useProfile(username);
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
      <Avatar uri={profile.data?.avatarUrl ?? null} size={44} verified={verified} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">{name}</Text>
        <Text variant="caption" tone="secondary">{profile.data ? `${formatCompactNumber(profile.data.followers)} followers · ${profile.data.posts} posts` : 'Ships in 1–2 days'}</Text>
      </View>
      <Button label="Visit" variant="secondary" size="sm" onPress={() => router.push({ pathname: '/profile/[username]', params: { username } })} />
    </Card>
  );
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const cartCount = useBadgeCount();
  const { add, pending } = useAddLine();
  const product = useProduct(id);
  const [img, setImg] = useState(0);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const p = product.data;
  const axes = useMemo(() => optionAxes(p?.variants ?? []), [p?.variants]);
  const variant = useMemo(() => {
    if (!p?.variants.length) return null;
    return p.variants.find(v => axes.every(([axis]) => (selection[axis] ?? axes.find(a => a[0] === axis)![1][0]) === v.options[axis])) ?? p.variants[0];
  }, [p, axes, selection]);
  const price = variant?.price ?? p?.price;
  const inStock = variant ? variant.stock > 0 : p?.inStock ?? false;

  if (product.isLoading) return <ProductSkeleton />;
  if (product.error || !p) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 8 }}><IconButton icon="chevron-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/shop'))} /></View>
        <ErrorState error={product.error} onRetry={() => product.refetch()} />
      </View>
    );
  }

  const gallery = p.images.length ? p.images : [p.imageUrl];
  const off = discountPercent(p.price, p.compareAtPrice);
  const addToCart = async () => {
    await add(p.id, qty, variant?.id ?? null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };
  const buyNow = async () => {
    await add(p.id, qty, variant?.id ?? null);
    router.push('/checkout');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={e => setImg(Math.round(e.nativeEvent.contentOffset.x / W))}>
            {gallery.map((u, i) => <Image key={u + i} source={{ uri: u }} style={{ width: W, aspectRatio: 1 }} contentFit="cover" transition={200} />)}
          </ScrollView>
          <View style={{ position: 'absolute', top: insets.top, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton icon="chevron-back" label="Back" variant="overlay" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/shop'))} />
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <IconButton icon="share-outline" label="Share" variant="overlay" onPress={() => Share.share({ message: `${p.name} on Ezyify`, url: shareUrl(`/product/${p.slug}`) })} />
              <View>
                <IconButton icon="bag-handle-outline" label="Cart" variant="overlay" onPress={() => router.push('/cart')} />
                {cartCount > 0 && <View style={{ position: 'absolute', top: 4, right: 4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}><Text variant="caption" style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter_600SemiBold' }}>{cartCount}</Text></View>}
              </View>
            </View>
          </View>
          {gallery.length > 1 && (
            <View style={{ position: 'absolute', bottom: 28, alignSelf: 'center', flexDirection: 'row', gap: 5 }}>
              {gallery.map((u, i) => <View key={u + i} style={{ width: i === img ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === img ? '#fff' : 'rgba(255,255,255,0.6)' }} />)}
            </View>
          )}
        </View>

        <View style={{ marginTop: -20, backgroundColor: colors.background, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: 20, gap: 18 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {p.badge && <Badge label={p.badge.toUpperCase()} tone={p.badge === 'sale' ? 'accent' : 'primary'} />}
              {off !== null && <Badge label={`-${off}%`} tone="accent" />}
              {p.escrowProtected && <Badge label="ESCROW" tone="success" />}
            </View>
            <Text variant="title">{p.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text variant="label">{p.rating.toFixed(1)}</Text>
              <Text variant="caption" tone="secondary">({formatCompactNumber(p.reviewCount)} reviews) · {formatCompactNumber(p.soldCount)} sold</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <Text variant="display" tone="brand">{formatMoney(price!)}</Text>
              {p.compareAtPrice && <Text tone="tertiary" style={{ textDecorationLine: 'line-through' }}>{formatMoney(p.compareAtPrice)}</Text>}
            </View>
            {!inStock && <Text variant="label" style={{ color: colors.error }}>Out of stock</Text>}
          </View>

          {axes.length > 0 && (
            <View style={{ gap: 10 }}>
              {axes.map(([axis, values]) => {
                const current = selection[axis] ?? values[0];
                return (
                  <View key={axis} style={{ gap: 8 }}>
                    <Text variant="label">{axis} · <Text variant="label" tone="secondary">{current}</Text></Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {values.map(v => {
                        const on = current === v;
                        return (
                          <Pressable key={v} accessibilityRole="radio" aria-checked={on} accessibilityLabel={`${axis} ${v}`} onPress={() => setSelection(s => ({ ...s, [axis]: v }))} style={{ height: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: on ? 2 : 1, borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primarySubtle : colors.card, justifyContent: 'center' }}>
                            <Text variant="label" style={{ color: on ? colors.primary : colors.foreground }}>{v}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
              {variant && variant.stock > 0 && variant.stock <= 5 && <Text variant="caption" style={{ color: colors.accent }}>Only {variant.stock} left</Text>}
            </View>
          )}

          <SellerCard username={p.seller.username} verified={p.seller.verified} name={p.seller.name} />

          <View style={{ gap: 8 }}>
            {[
              { icon: 'shield-checkmark-outline', t: 'Escrow protection', d: 'Seller is paid only after you confirm delivery' },
              { icon: 'return-down-back-outline', t: '7-day returns', d: 'Free returns on unused items' },
              { icon: 'rocket-outline', t: p.shipping.freeOver ? `Free shipping over ${formatMoney(p.shipping.freeOver)}` : 'Fast shipping', d: `Arrives in ${p.shipping.etaDays[0]}–${p.shipping.etaDays[1]} days` },
            ].map(r => (
              <View key={r.t} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.successSubtle, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={r.icon as never} size={18} color={colors.success} /></View>
                <View style={{ flex: 1 }}><Text variant="bodyMedium">{r.t}</Text><Text variant="caption" tone="secondary">{r.d}</Text></View>
              </View>
            ))}
          </View>

          <View style={{ gap: 6 }}>
            <Text variant="heading">About</Text>
            <Text tone="secondary">{p.description}</Text>
            {p.tags.length > 0 && <Text variant="caption" tone="brand">{p.tags.map(t => `#${t}`).join(' ')}</Text>}
          </View>

          <Related exclude={p.id} category={p.category} />
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.muted, borderRadius: radius.pill, height: 48 }}>
          <IconButton icon="remove" label="Decrease quantity" size={16} style={{ width: 36, height: 36 }} onPress={() => setQty(q => Math.max(1, q - 1))} />
          <Text variant="label" style={{ minWidth: 16, textAlign: 'center' }}>{qty}</Text>
          <IconButton icon="add" label="Increase quantity" size={16} style={{ width: 36, height: 36 }} onPress={() => setQty(q => Math.min(10, q + 1))} />
        </View>
        <Button label={added ? 'Added ✓' : 'Add to cart'} variant={added ? 'primary' : 'gradient'} size="lg" fullWidth style={{ flex: 1.2 }} disabled={!inStock} loading={pending && !added} onPress={addToCart} />
        <Button label="Buy now" variant="accent" size="lg" fullWidth style={{ flex: 0.9 }} disabled={!inStock} onPress={buyNow} />
      </View>
    </View>
  );
}
