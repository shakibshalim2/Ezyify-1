import { useCallback, useMemo } from 'react';
import { useQueries, type UseInfiniteQueryResult } from '@tanstack/react-query';
import { flattenPages, queryKeys, useApi, useAddToCart, useAuth, useCart, useCartCount, useRemoveCartItem, useServerCart, useUpdateCartItem, type Cart, type CartItem, type Money } from '@ezyify/core';

export const useAuthed = () => useAuth(s => s.status === 'authenticated');

/** Guest shoppers keep a local cart; signed-in users see the server cart badge. */
export function useBadgeCount() {
  const authed = useAuthed();
  const local = useCartCount();
  const server = useServerCart();
  const serverCount = server.data?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;
  return authed ? serverCount : local;
}

/** Add-to-cart that targets the server cart when signed in and the local (guest) cart otherwise. */
export function useAddLine() {
  const authed = useAuthed();
  const addLocal = useCart(s => s.add);
  const addServer = useAddToCart();
  const add = useCallback(
    async (productId: string, quantity = 1, variantId?: string | null) => {
      if (authed) await addServer.mutateAsync({ productId, quantity, variantId: variantId ?? null });
      else addLocal(productId, quantity, variantId ?? null);
    },
    [authed, addLocal, addServer],
  );
  return { add, pending: addServer.isPending, error: addServer.error };
}

/** Set of product ids currently in the (server or guest) cart — drives "Added ✓" affordances. */
export function useInCart() {
  const authed = useAuthed();
  const local = useCart(s => s.lines);
  const server = useServerCart();
  return useMemo(() => new Set(authed ? (server.data?.items.map(i => i.productId) ?? []) : local.map(l => l.productId)), [authed, local, server.data]);
}

const money = (amount: number, currency: Money['currency'] = 'USD'): Money => ({ amount, currency });

/**
 * One cart shape for both modes. Guests get a locally-priced cart built from the catalog (no coupon);
 * signed-in users get the server cart with shipping / discount computed by the API.
 */
export function useUnifiedCart() {
  const authed = useAuthed();
  const api = useApi();
  const local = useCart(s => s.lines);
  const setLocalQty = useCart(s => s.setQuantity);
  const removeLocal = useCart(s => s.remove);
  const server = useServerCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  // Guest lines only store ids; resolve each product like the mobile cart does.
  const guestProducts = useQueries({
    queries: local.map(l => ({ queryKey: queryKeys.product(l.productId), queryFn: () => api.catalog.product(l.productId), enabled: !authed, staleTime: 60_000 })),
  });

  const guestCart = useMemo<Cart | null>(() => {
    if (authed) return null;
    const items: CartItem[] = local.flatMap((l, i) => {
      const p = guestProducts[i]?.data;
      return p ? [{ productId: p.id, variantId: l.variantId, quantity: l.quantity, product: p }] : [];
    });
    const subtotal = items.reduce((n, i) => n + i.product.price.amount * i.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 5000 ? 0 : 499;
    return { items, subtotal: money(subtotal), shipping: money(shipping), discount: money(0), total: money(subtotal + shipping), couponCode: null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, local, ...guestProducts.map(q => q.data)]);

  const cart = authed ? (server.data ?? null) : guestCart;
  const loading = authed ? server.isLoading : guestProducts.some(q => q.isLoading);
  const error = authed ? server.error : (guestProducts.find(q => q.error)?.error ?? null);

  const setQuantity = useCallback(
    async (productId: string, quantity: number, variantId: string | null = null) => {
      if (authed) await update.mutateAsync({ productId, quantity });
      else setLocalQty(productId, quantity, variantId);
    },
    [authed, update, setLocalQty],
  );
  const removeItem = useCallback(
    async (productId: string, variantId: string | null = null) => {
      if (authed) await remove.mutateAsync({ productId });
      else removeLocal(productId, variantId);
    },
    [authed, remove, removeLocal],
  );
  const refetch = useCallback(() => (authed ? server.refetch() : Promise.all(guestProducts.map(q => q.refetch()))), [authed, server, guestProducts]);

  return { cart, loading, error, authed, setQuantity, removeItem, refetch, busy: update.isPending || remove.isPending };
}

type Paged<T> = { pages: { items: T[]; pagination: { page: number; pageSize: number; total: number; hasMore: boolean } }[] };

/** Flattened items + load-more handler for an infinite query. */
export function useInfiniteList<T>(q: UseInfiniteQueryResult<Paged<T>, unknown>) {
  const items = useMemo(() => flattenPages<T>(q.data), [q.data]);
  const loadMore = useCallback(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
  }, [q]);
  return { items, loadMore, loadingMore: q.isFetchingNextPage, hasMore: !!q.hasNextPage };
}
