import { useCallback, useMemo, useState } from 'react';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { flattenPages, useAddToCart, useAuth, useCart, useCartCount, useServerCart } from '@ezyify/core';

/** Guest shoppers keep a local cart; signed-in users see the server cart badge. */
export function useBadgeCount() {
  const authed = useAuth(s => s.status === 'authenticated');
  const local = useCartCount();
  const server = useServerCart();
  const serverCount = server.data?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;
  return authed ? serverCount : local;
}

/** Add-to-cart that targets the server cart when signed in and the local (guest) cart otherwise. */
export function useAddLine() {
  const authed = useAuth(s => s.status === 'authenticated');
  const addLocal = useCart(s => s.add);
  const addServer = useAddToCart();
  const add = useCallback(
    async (productId: string, quantity = 1, variantId?: string | null) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (authed) await addServer.mutateAsync({ productId, quantity, variantId: variantId ?? null });
      else addLocal(productId, quantity, variantId ?? null);
    },
    [authed, addLocal, addServer],
  );
  return { add, pending: addServer.isPending, error: addServer.error };
}

/** Pull-to-refresh state wired to react-query `refetch`. */
export function useRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  return { refreshing, onRefresh };
}

type Paged<T> = { pages: { items: T[]; pagination: { page: number; pageSize: number; total: number; hasMore: boolean } }[] };

/** Flattened items + `onEndReached` handler for an infinite query. */
export function useInfiniteList<T>(q: UseInfiniteQueryResult<Paged<T>, unknown>) {
  const items = useMemo(() => flattenPages<T>(q.data), [q.data]);
  const loadMore = useCallback(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
  }, [q]);
  return { items, loadMore, loadingMore: q.isFetchingNextPage };
}
