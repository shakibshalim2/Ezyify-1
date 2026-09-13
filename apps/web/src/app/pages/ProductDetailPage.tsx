import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Share2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'motion/react';
import { SEO } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { EmptyState } from '../components/primitives/EmptyState';
import { Skeleton } from '../components/ui/skeleton';
import { getProductById, getProductsByCategory } from '../data/products';
import { getProductById as getProductByIdType } from '../data/products';
import type { Product } from '../data/products';
import { users } from '../data/users';
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
import { fadeUp, staggerContainer } from '../lib/motion';
import { cn } from '../components/ui/utils';

// Mock data for variants — extend if your products have variant data
const PRODUCT_VARIANTS = {
  'prod-001': [{ name: 'Color', options: ['Black', 'Silver', 'Blue'] }],
  'prod-004': [
    { name: 'Color', options: ['Brown', 'Black', 'Tan'] },
    { name: 'Size', options: ['Small', 'Medium', 'Large'] },
  ],
} as Record<string, Array<{ name: string; options: string[] }>>;

// Mock review data — extend if you have real review data
const MOCK_REVIEWS = [
  {
    id: 'rev-1',
    user: {
      name: 'Sarah M.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
      verified: true,
    },
    rating: 5,
    text: 'Amazing quality! Arrived faster than expected and exactly as described. Highly recommend this seller.',
    date: '2 weeks ago',
    helpful: 48,
  },
  {
    id: 'rev-2',
    user: {
      name: 'James K.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
      verified: false,
    },
    rating: 4,
    text: 'Great product, very happy with the purchase. Only minor issue was the packaging could be better.',
    date: '1 month ago',
    helpful: 24,
  },
  {
    id: 'rev-3',
    user: {
      name: 'Emma L.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80',
      verified: true,
    },
    rating: 5,
    text: 'Perfect! Exactly what I was looking for. Customer service was very responsive to my questions.',
    date: '1 month ago',
    helpful: 32,
  },
];

const REVIEW_STATS = {
  average: 4.8,
  total: 2847,
  distribution: { 5: 2250, 4: 450, 3: 95, 2: 35, 1: 17 },
};

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

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [seller, setSeller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [relatedCartStates, setRelatedCartStates] = useState<Record<string, boolean>>({});
  const [relatedWishlistStates, setRelatedWishlistStates] = useState<Record<string, boolean>>({});

  // Load product data
  useEffect(() => {
    if (!id) return;

    const data = getProductById(id);
    if (!data) {
      setIsLoading(false);
      return;
    }

    setProduct(data);

    const related = getProductsByCategory(data.category)
      .filter(p => p.id !== data.id)
      .slice(0, 4);
    setRelatedProducts(related);

    const sellerData = users.find(u => u.id === data.seller.id);
    setSeller(sellerData);

    // Initialize variant selection
    if (PRODUCT_VARIANTS[data.id]) {
      const initial: Record<string, string> = {};
      PRODUCT_VARIANTS[data.id].forEach(v => {
        initial[v.name] = v.options[0];
      });
      setSelectedVariants(initial);
    }

    // Load wishlist state
    const savedWishlist = localStorage.getItem('ezyify_wishlist');
    if (savedWishlist) {
      setIsInWishlist(JSON.parse(savedWishlist).includes(data.id));
    }

    // Load cart state
    const savedCart = localStorage.getItem('ezyify_cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setIsInCart(cart.some((item: any) => item.id === data.id));
    }

    // Load related product states
    const cartItems = savedCart ? JSON.parse(savedCart) : [];
    const wishlistItems = savedWishlist ? JSON.parse(savedWishlist) : [];
    const cartMap: Record<string, boolean> = {};
    const wishlistMap: Record<string, boolean> = {};

    related.forEach(p => {
      cartMap[p.id] = cartItems.some((item: any) => item.id === p.id);
      wishlistMap[p.id] = wishlistItems.includes(p.id);
    });

    setRelatedCartStates(cartMap);
    setRelatedWishlistStates(wishlistMap);

    setIsLoading(false);
  }, [id]);

  // Handle wishlist toggle
  const handleToggleWishlist = () => {
    if (!product) return;
    const savedWishlist = localStorage.getItem('ezyify_wishlist');
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];

    if (isInWishlist) {
      const updated = wishlist.filter((pid: string) => pid !== product.id);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(updated));
    } else {
      wishlist.push(product.id);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(wishlist));
    }
    setIsInWishlist(!isInWishlist);
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    const savedCart = localStorage.getItem('ezyify_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existing = cart.find((item: any) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: product.id, quantity: 1 });
    }

    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
    setIsInCart(true);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  // Handle follow seller
  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed seller' : 'Following seller');
  };

  // Handle share
  const handleShare = async () => {
    if (!product) return;
    const url = `${window.location.origin}/product/${product.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Ezyify`,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } catch {
        toast.error('Could not copy link');
      }
    }
  };

  // Handle related product cart/wishlist
  const handleRelatedAddToCart = (productId: string) => {
    const savedCart = localStorage.getItem('ezyify_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existing = cart.find((item: any) => item.id === productId);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
    setRelatedCartStates(s => ({ ...s, [productId]: true }));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRelatedToggleWishlist = (productId: string) => {
    const savedWishlist = localStorage.getItem('ezyify_wishlist');
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];

    if (relatedWishlistStates[productId]) {
      const updated = wishlist.filter((pid: string) => pid !== productId);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(updated));
    } else {
      wishlist.push(productId);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(wishlist));
    }
    setRelatedWishlistStates(s => ({ ...s, [productId]: !s[productId] }));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <EmptyState
            kind="search"
            title="Product not found"
            description="This product might have been removed or is no longer available."
            action={
              <Link to="/shop">
                <Button variant="gradient">Back to shop</Button>
              </Link>
            }
          />
        </div>
      </PageTransition>
    );
  }

  const variants = PRODUCT_VARIANTS[product.id] || [];

  return (
    <PageTransition>
      <SEO
        title={`${product.name} — Ezyify`}
        description={product.description}
        image={product.image}
      />

      <div className="bg-background min-h-screen pb-32 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
          {/* Back link */}
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="mb-6"
          >
            <Link
              to="/shop"
              className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
            >
              ← Back to shop
            </Link>
          </motion.div>

          {/* Layout grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Left: Gallery (sticky on desktop) */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <ImageGallery
                images={product.images || [product.image]}
                alt={product.name}
                isLoading={isLoading}
              />
            </div>

            {/* Right: Details */}
            <motion.div
              variants={staggerContainer(reduce ? 0 : 0.06)}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Seller row */}
              <SellerRow
                seller={product.seller}
                isFollowing={isFollowing}
                onToggleFollow={handleToggleFollow}
              />

              {/* Title */}
              <motion.h1 variants={fadeUp} className="font-display text-2xl font-bold text-foreground">
                {product.name}
              </motion.h1>

              {/* Price & rating */}
              <PriceBlock
                price={product.price}
                originalPrice={product.originalPrice}
                sold={product.sold}
                rating={product.rating}
                reviewCount={product.reviews}
              />

              {/* Escrow card */}
              <EscrowCard />

              {/* Variant selectors */}
              {variants.length > 0 && (
                <VariantSelectors
                  variants={variants}
                  selected={selectedVariants}
                  onSelect={(name, option) =>
                    setSelectedVariants(s => ({ ...s, [name]: option }))
                  }
                />
              )}

              {/* Delivery & returns */}
              <InfoRows />

              {/* Description */}
              <DescriptionSection description={product.description} />

              {/* Share button */}
              <motion.button
                type="button"
                onClick={handleShare}
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

          {/* Reviews section */}
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-12 lg:mt-16"
          >
            <ReviewsSection reviews={MOCK_REVIEWS} stats={REVIEW_STATS} />
          </motion.div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={reduce ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="mt-12 lg:mt-16"
            >
              <h2 className="font-display text-lg font-semibold text-foreground mb-6">
                Related products
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map(relProd => (
                  <ProductCard
                    key={relProd.id}
                    product={relProd}
                    isLiked={relatedWishlistStates[relProd.id] || false}
                    inCart={relatedCartStates[relProd.id] || false}
                    onToggleLike={() => handleRelatedToggleWishlist(relProd.id)}
                    onAddToCart={() => handleRelatedAddToCart(relProd.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sticky action bar - mobile only */}
      <div className="lg:hidden">
        <StickyActionBar
          productId={product.id}
          isInWishlist={isInWishlist}
          isInCart={isInCart}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      </div>

      {/* Desktop action buttons - shown inline on lg */}
      <motion.div
        initial={reduce ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.4 }}
        className="hidden lg:flex gap-3 mt-8 max-w-7xl mx-auto px-4"
      >
        <Button
          variant="outline"
          size="lg"
          onClick={handleToggleWishlist}
          aria-pressed={isInWishlist}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={isInWishlist ? 'fill-error text-error' : ''} /> Wishlist
        </Button>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={handleAddToCart}
        >
          Add to cart
        </Button>
        <Button
          variant="gradient"
          size="lg"
          fullWidth
          onClick={handleBuyNow}
        >
          Buy now
        </Button>
      </motion.div>
    </PageTransition>
  );
}
