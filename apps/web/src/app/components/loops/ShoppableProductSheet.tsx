import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import { queryKeys, useApi, formatMoney } from '@ezyify/core';
import { toast } from 'sonner';
import { Sheet, SheetContent } from '../ui/sheet';
import { VisuallyHidden } from '../ui/visually-hidden';
import { Button } from '../primitives/Button';
import { Img } from '../primitives/Img';
import { useAddLine } from '../../lib/data';
import { formErrors } from '../../lib/apiErrors';

interface ShoppableProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productIds: string[];
}

/** Resolves product references from a social post through the catalog API. */
export function ShoppableProductSheet({ open, onOpenChange, productIds }: ShoppableProductSheetProps) {
  const api = useApi();
  const { add, pending } = useAddLine();
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());
  const queries = useQueries({
    queries: productIds.map(id => ({ queryKey: queryKeys.product(id), queryFn: () => api.catalog.product(id), staleTime: 60_000 })),
  });
  const products = useMemo(() => queries.flatMap(query => (query.data ? [query.data] : [])), [queries]);

  const handleAddToCart = async (productId: string, name: string) => {
    try {
      await add(productId, 1);
      setAddedToCart(current => new Set(current).add(productId));
      toast.success(`${name} added to cart`);
    } catch (error) {
      toast.error(formErrors(error).message ?? 'Couldn’t add to cart');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="flex h-[70vh] flex-col p-0">
        <VisuallyHidden><h2>Tagged products</h2></VisuallyHidden>
        <div className="flex justify-center border-b border-border py-3"><div className="h-1 w-10 rounded-full bg-foreground/20" /></div>
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {products.map(product => (
            <div key={product.id} className="flex gap-3 rounded-card border border-border bg-card p-3 transition-colors hover:border-border-strong">
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Img loading="lazy" src={product.imageUrl} alt={product.name} className="size-full object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <h3 className="truncate text-sm font-semibold text-foreground">{product.name}</h3>
                  <p className="line-clamp-1 text-xs text-foreground-secondary">Sold by {product.seller.name}</p>
                </div>
                <p className="font-display font-bold text-accent-brand">{formatMoney(product.price)}</p>
              </div>
              <div className="flex shrink-0 items-end">
                <Button
                  size="sm"
                  variant={addedToCart.has(product.id) ? 'outline' : 'primary'}
                  onClick={() => void handleAddToCart(product.id, product.name)}
                  disabled={pending || addedToCart.has(product.id) || !product.inStock}
                  leftIcon={<ShoppingCart className="size-4" />}
                >
                  {addedToCart.has(product.id) ? 'Added' : product.inStock ? 'Add' : 'Sold out'}
                </Button>
              </div>
            </div>
          ))}
          {!products.length && queries.some(query => query.isLoading) && <p className="py-8 text-center text-sm text-foreground-secondary">Loading products…</p>}
          {!products.length && !queries.some(query => query.isLoading) && <p className="py-8 text-center text-sm text-foreground-secondary">No products are available for this Loop.</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
