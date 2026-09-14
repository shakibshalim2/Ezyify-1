import React, { useState } from 'react';
import { Sheet, SheetContent } from '../ui/sheet';
import { VisuallyHidden } from '../ui/visually-hidden';
import { Button } from '../primitives/Button';
import { ShoppingCart } from 'lucide-react';
import { getProductById } from '../../data/products';
import { toast } from 'sonner';

interface ShoppableProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productIds: string[];
}

export function ShoppableProductSheet({
  open,
  onOpenChange,
  productIds,
}: ShoppableProductSheetProps) {
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  const products = productIds
    .map(id => getProductById(id))
    .filter((p): p is NonNullable<ReturnType<typeof getProductById>> => p !== undefined);

  const handleAddToCart = (productId: string) => {
    const product = getProductById(productId);
    if (!product) return;

    // Add to cart in localStorage
    const savedCart = JSON.parse(
      localStorage.getItem('ezyify_cart') || '[]'
    );
    const existing = savedCart.find((item: any) => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      savedCart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem('ezyify_cart', JSON.stringify(savedCart));
    window.dispatchEvent(new Event('cartUpdated'));

    setAddedToCart(prev => new Set(prev).add(productId));
    toast.success(`${product.name} added to cart`);
    setTimeout(() => {
      setAddedToCart(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 1200);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col">
        <VisuallyHidden>
          <h2>Tagged products</h2>
        </VisuallyHidden>

        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-2 border-b border-border">
          <div className="w-10 h-1 bg-foreground/20 rounded-full" />
        </div>

        {/* Products list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex gap-3 p-3 rounded-card bg-card border border-border hover:border-border-strong transition-colors"
            >
              {/* Product image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img
                  loading="lazy"
                  src={product.images?.[0] || ''}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-foreground-secondary line-clamp-1">
                    {product.description}
                  </p>
                </div>
                <p className="font-display font-bold text-accent-brand">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              {/* Add to cart button */}
              <div className="flex-shrink-0 flex items-end">
                <Button
                  size="sm"
                  variant={addedToCart.has(product.id) ? 'outline' : 'primary'}
                  onClick={() => handleAddToCart(product.id)}
                  disabled={addedToCart.has(product.id)}
                  leftIcon={
                    <ShoppingCart className="w-4 h-4" />
                  }
                >
                  {addedToCart.has(product.id) ? 'Added' : 'Add'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
