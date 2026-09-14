import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Share2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'motion/react';
import { formatMoney, useProduct, useProducts, useProfile, useToggleFollow, type ProductDetail } from '@ezyify/core';
import { SEO } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { EmptyState } from '../components/primitives/EmptyState';
import { Skeleton } from '../components/ui/skeleton';
import { QueryError } from '../components/QueryError';
import { ImageGallery } from '../components/product/ImageGallery';
import { SellerRow } from '../components/product/SellerRow';
import { PriceBlock } from '../components/product/PriceBlock';
import { EscrowCard } from '../components/product/EscrowCard';
import { VariantSelectors } from '../components/product/VariantSelectors';
import { InfoRows } from '../components/product/InfoRows';
import { DescriptionSection } from '../components/product/DescriptionSection';
import { ReviewsSection } from '../components/product/ReviewsSection';
import { StickyActionBar } from '../components/product/StickyActionBar';
import { ProductCard } from '../components/shop/ProductCard';
import { PageTransition } from '../components/primitives/PageTransition';
import { useAddLine, useAuthed, useInCart } from '../lib/data';
import { useWishlist } from '../lib/wishlist';
import { formErrors } from '../lib/apiErrors';
import { fadeUp, staggerContainer } from '../lib/motion';

/** Variants arrive flat ({ Color: 'Black' }); the picker wants one axis per option key. */
function variantAxes(variants: ProductDetail['variants']) {
  const axes = new Map<string, string[]>();
  for (const v of variants) for (const [k, val] of Object.entries(v.options)) {
    const list = axes.get(k) ?? [];
    if (!list.includes(val)) list.push(val);
    axes.set(k, list);
  }
  return [...axes.entries()].map(([name, options]) => ({ name, options }));
}

// Skeleton for loading state
function ProductDetailSkeleton() {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Gallery skeleton */}
          <Skeleton className="aspect-square rounded-card" />
          {/* Details skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const authed = useAuthed();

  const product = useProduct(id);
  const data = product.data;
  const related = useProducts({ category: data?.category ?? '', pageSize: 5 });
  const relatedItems = useMemo(() => (related.data?.pages[0]?.items ?? []).filter(p => p.id !== id).slice(0, 4), [related.data, id]);
  const seller = useProfile(data?.seller.username);
  const follow = useToggleFollow();
  const { add, pending } = useAddLine();
  const inCart = useInCart().has(id ?? '');
  const wishlist = useWishlist();
  const isInWishlist = wishlist.has(id ?? '');

  const axes = useMemo(() => variantAxes(data?.variants ?? []), [data?.variants]);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const selectedVariant = useMemo(() => {
    if (!data?.variants.length) return null;
    return data.variants.find(v => Object.entries(v.options).every(([k, val]) => selection[k] === val)) ?? null;
  }, [data?.variants, selection]);
  const needsVariant = axes.length > 0 && !selectedVariant;
  const price = selectedVariant?.price ?? data?.price;

  const addToCart = async () => {
    if (!data) return false;
    if (needsVariant) {
      toast.error(`Choose a ${axes.find(a => !selection[a.name])?.name.toLowerCase() ?? 'variant'} first`);
      return false;
    }
    try {
      await add(data.id, 1, selectedVariant?.id ?? null);
      toast.success('Added to cart');
      return true;
    } catch (err) {
      toast.error(formErrors(err).message ?? 'Couldn’t add to cart');
      return false;
    }
  };

  const buyNow = async () => {
    if (await addToCart()) navigate(authed ? '/checkout' : '/login', authed ? undefined : { state: { next: '/checkout' } });
  };

  const toggleFollow = () => {
    if (!data) return;
    if (!authed) return navigate('/login', { state: { next: `/product/${data.id}` } });
    follow.mutate({ username: data.seller.username, following: !!seller.data?.isFollowing });
  };

  const toggleWishlist = () => {
    if (!data) return;
    wishlist.toggle(data.id);
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const share = async () => {
    if (!data) return;
    const url = `${window.location.origin}/product/${data.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: data.name, text: `Check out ${data.name} on Ezyify`, url });
      } catch {
        /* cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Could not copy link');
      }
    }
  };

  if (product.isLoading) return <ProductDetailSkeleton />;

  if (product.error || !data) {
    const notFound = !product.error || (product.error as { status?: number }).status === 404;
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          {notFound ? (
            <EmptyState
              kind="search"
              title="Product not found"
              description="This product might have been removed or is no longer available."
              action={
                <Button variant="gradient" asChild>
                  <Link to="/shop">Back to shop</Link>
                </Button>
              }
            />
          ) : (
            <QueryError error={product.error} onRetry={() => void product.refetch()} />
          )}
        </div>
      </PageTransition>
    );
  }

  const eta = `${data.shipping.etaDays[0]}–${data.shipping.etaDays[1]} business days`;

  return (
    <PageTransition>
      <SEO title={`${data.name} — Ezyify`} description={data.description} image={data.imageUrl} />

      <div className="bg-background min-h-screen pb-32 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
          <motion.div initial={reduce ? {} : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="mb-6">
            <Link to="/shop" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1">
              ← Back to shop
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <ImageGallery images={data.images} alt={data.name} />
            </div>

            <motion.div variants={staggerContainer(reduce ? 0 : 0.06)} initial="hidden" animate="visible" className="space-y-6">
              <SellerRow
                seller={{ id: data.seller.id, name: data.seller.name, avatar: seller.data?.avatarUrl ?? '', verified: data.seller.verified, username: data.seller.username }}
                isFollowing={!!seller.data?.isFollowing}
                onToggleFollow={toggleFollow}
              />

              <motion.h1 variants={fadeUp} className="font-display text-2xl font-bold text-foreground">
                {data.name}
              </motion.h1>

              <PriceBlock
                price={price!.amount / 100}
                originalPrice={data.compareAtPrice ? data.compareAtPrice.amount / 100 : undefined}
                sold={data.soldCount}
                rating={data.rating}
                reviewCount={data.reviewCount}
              />

              <EscrowCard />

              {axes.length > 0 && (
                <VariantSelectors variants={axes} selected={selection} onSelect={(name, option) => setSelection(s => ({ ...s, [name]: option }))} />
              )}
              {selectedVariant && selectedVariant.stock <= 5 && (
                <p className="text-xs font-medium text-warning">Only {selectedVariant.stock} left in {selectedVariant.name}</p>
              )}

              <InfoRows deliveryDays={eta} returnDays={7} />
              {data.shipping.freeOver && (
                <p className="text-xs text-foreground-secondary -mt-3">Free shipping on orders over {formatMoney(data.shipping.freeOver)}</p>
              )}

              <DescriptionSection description={data.description} />

              <motion.button
                type="button"
                onClick={share}
                initial={reduce ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.35 }}
                className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5"
              >
                <Share2 className="size-4" />
                Share
              </motion.button>
            </motion.div>
          </div>

          <motion.div initial={reduce ? {} : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="mt-12 lg:mt-16">
            <ReviewsSection reviews={[]} stats={{ average: data.rating, total: data.reviewCount }} />
          </motion.div>

          {relatedItems.length > 0 && (
            <motion.div initial={reduce ? {} : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }} className="mt-12 lg:mt-16">
              <h2 className="font-display text-lg font-semibold text-foreground mb-6">Related products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedItems.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <StickyActionBar productId={data.id} isInWishlist={isInWishlist} isInCart={inCart} onToggleWishlist={toggleWishlist} onAddToCart={() => void addToCart()} onBuyNow={() => void buyNow()} />
      </div>

      <motion.div initial={reduce ? {} : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.4 }} className="hidden lg:flex gap-3 mt-8 max-w-7xl mx-auto px-4">
        <Button variant="outline" size="lg" onClick={toggleWishlist} aria-pressed={isInWishlist} aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
          <Heart className={isInWishlist ? 'fill-error text-error' : ''} /> Wishlist
        </Button>
        <Button variant="outline" size="lg" fullWidth loading={pending} disabled={!data.inStock} onClick={() => void addToCart()}>
          {inCart ? 'Added ✓' : 'Add to cart'}
        </Button>
        <Button variant="gradient" size="lg" fullWidth disabled={!data.inStock} onClick={() => void buyNow()}>
          Buy now
        </Button>
      </motion.div>
    </PageTransition>
  );
}
