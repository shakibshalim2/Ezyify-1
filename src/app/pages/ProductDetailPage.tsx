import { SEO } from '../components/SEO';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router';
import {
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Check,
  Truck,
  Shield,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  UserCheck,
  ThumbsUp,
  BadgeCheck,
  Award,
  MessageCircle,
  RotateCcw,
  Package,
  Clock,
  MapPin,
  Repeat2
} from 'lucide-react';
import { getProductById, getProductsByCategory } from '../data/products';
import { users } from '../data/users';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { EscrowProtectionBanner } from '../components/EscrowProtectionBanner';
import { SellerTrustCard } from '../components/SellerTrustCard';
import { TrustSignals } from '../components/TrustSignals';
import { ProductRepostSheet } from '../components/ProductRepostSheet';
import { ReferralService } from '../services/referral';

// SKELETON COMPONENTS FOR INSTANT UI
function ProductDetailSkeleton() {
  return (<div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Image Skeleton */}
          <div className="bg-card border border-border rounded-2xl p-3 sm:p-6">
            <Skeleton className="aspect-square rounded-xl mb-4" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
          
          {/* Info Skeleton */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WriteReviewForm({ productId, onSubmit }: { productId: string; onSubmit: () => void }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  return (
    <div className="border border-border rounded-2xl p-5 bg-muted/30 space-y-4 mb-4">
      <h4 className="font-semibold text-foreground">Your Review</h4>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(star => (
          <button key={star} type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star className={`w-6 h-6 transition-colors ${star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share your experience with this product…"
        rows={4}
        className="w-full border border-border bg-background rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
      />
      <button
        type="button"
        disabled={!text.trim()}
        onClick={onSubmit}
        className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        style={{ background: 'var(--brand-gradient)' }}
      >
        Submit Review
      </button>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // PROGRESSIVE LOADING: Load data after initial render
  const [pageData, setPageData] = useState<{
    product: any;
    relatedProducts: any[];
    seller: any;
  } | null>(null);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isProductReposted, setIsProductReposted] = useState(false);
  const [productRepostSheetOpen, setProductRepostSheetOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [visibleReviewCount, setVisibleReviewCount] = useState(4);

  // Load product data progressively
  useEffect(() => {
    const loadPageData = () => {
      const product = getProductById(id || '');
      if (!product) {
        setPageData(null);
        return;
      }
      
      const relatedProducts = getProductsByCategory(product.category)
        .filter(p => p.id !== product.id)
        .slice(0, 4);
      const seller = users.find(u => u.id === product.seller.id);
      
      setPageData({
        product,
        relatedProducts,
        seller
      });
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadPageData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadPageData, 16);
      return () => clearTimeout(timer);
    }
  }, [id]);

  // Check if in wishlist - load after page data
  useEffect(() => {
    if (pageData?.product) {
      const savedWishlist = localStorage.getItem('ezyify_wishlist');
      if (savedWishlist) {
        const wishlist = JSON.parse(savedWishlist);
        setIsInWishlist(wishlist.includes(pageData.product.id));
      }
    }
  }, [pageData]);

  // Check if in cart - load after page data
  useEffect(() => {
    if (pageData?.product) {
      const savedCart = localStorage.getItem('ezyify_cart');
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        setIsInCart(cart.some((item: any) => item.id === pageData.product.id));
      }
    }
  }, [pageData]);

  // Check existing repost status
  useEffect(() => {
    if (pageData?.product) {
      setIsProductReposted(ReferralService.hasReposted(pageData.product.id));
    }
  }, [pageData]);

  // Detect inbound referral link (?ref=...) and persist for checkout attribution
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refId = params.get('ref');
    if (refId && id) {
      // Store pending referral so CheckoutPage can attribute the purchase
      sessionStorage.setItem('ezyify_pending_referral', JSON.stringify({ referralId: refId, productId: id }));
    }
  }, [location.search, id]);

  // Show skeleton while loading
  if (!pageData) {
    return <ProductDetailSkeleton />;
  }

  const { product, relatedProducts, seller: sellerWithMetrics } = pageData;

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-foreground mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you are looking for does not exist.</p>
          <Link to="/shop" className="text-primary hover:underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const images = product.images || [product.image];
  
  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success('Following store!');
    } else {
      toast.success('Unfollowed store');
    }
  };

  const handleAddToCart = () => {
    const savedCart = localStorage.getItem('ezyify_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ id: product.id, quantity });
    }
    
    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
    setIsInCart(true);
    toast.success('Added to Cart');
    
    // Dispatch custom event to update Navigation cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleToggleWishlist = () => {
    const savedWishlist = localStorage.getItem('ezyify_wishlist');
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    
    if (isInWishlist) {
      const filtered = wishlist.filter((id: string) => id !== product.id);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(filtered));
      setIsInWishlist(false);
      toast.success('Removed from Wishlist');
    } else {
      wishlist.push(product.id);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
      toast.success('Added to Wishlist');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleProductRepost = (quoteText?: string) => {
    const { product } = pageData!;
    // Create referral attribution automatically — no manual link generation needed
    ReferralService.createReferral({
      productId: product.id,
      sellerId: product.seller?.id ?? product.seller?.username ?? 'unknown',
      source: 'repost',
    });
    setIsProductReposted(true);
    toast.success(quoteText ? 'Quote reposted to your followers!' : 'Product reposted to your followers!');
  };

  const handleProductUndoRepost = () => {
    setIsProductReposted(false);
    toast.success('Repost removed');
  };

  const handleShare = () => {
    const { product } = pageData!;
    // Generate referral-tagged URL automatically
    const referral = ReferralService.createReferral({
      productId: product.id,
      sellerId: product.seller?.id ?? product.seller?.username ?? 'unknown',
      source: 'share',
    });
    const url = ReferralService.buildReferralUrl(product.id, referral.referralId);
    if (navigator.share) {
      navigator.share({ title: product.name, text: `Check out ${product.name} on Ezyify`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
      toast.success('Referral link copied!');
    }
  };

  // Mock reviews data
  const productReviews = [
    {
      id: 'rev-1',
      user: {
        name: 'Sarah Johnson',
        username: 'sarahj',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        verified: true
      },
      rating: 5,
      date: 'Jan 8, 2026',
      text: 'Absolutely love this product! The quality exceeded my expectations and it arrived quickly. Highly recommend to anyone looking for great value.',
      helpful: 24,
      images: []
    },
    {
      id: 'rev-2',
      user: {
        name: 'Michael Chen',
        username: 'mchen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        verified: false
      },
      rating: 4,
      date: 'Jan 7, 2026',
      text: 'Great product overall. Works exactly as described. Only minor issue was the packaging could be better, but the product itself is fantastic.',
      helpful: 18,
      images: []
    },
    {
      id: 'rev-3',
      user: {
        name: 'Emma Wilson',
        username: 'emmaw',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        verified: true
      },
      rating: 5,
      date: 'Jan 6, 2026',
      text: 'Perfect! This is my second purchase and I\'m just as satisfied as the first time. The seller is also very responsive and helpful.',
      helpful: 31,
      images: []
    },
    {
      id: 'rev-4',
      user: {
        name: 'David Martinez',
        username: 'davidm',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        verified: false
      },
      rating: 4,
      date: 'Jan 5, 2026',
      text: 'Good quality for the price. Delivery was fast and the product matches the description. Would buy again!',
      helpful: 12,
      images: []
    }
  ];

  const reviewStats = {
    average: product.rating,
    total: product.reviews,
    distribution: {
      5: Math.floor(product.reviews * 0.65),
      4: Math.floor(product.reviews * 0.20),
      3: Math.floor(product.reviews * 0.10),
      2: Math.floor(product.reviews * 0.03),
      1: Math.floor(product.reviews * 0.02)
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Product Details — Ezyify" description="Discover and shop products from verified sellers on the Ezyify E-Commerce Social Media Ecosystem." />
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
        {/* Back Button */}
        <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Back to Shop</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Product Images */}
          <div className="bg-card border border-border rounded-2xl p-3 sm:p-6">
            {/* Main Image */}
            <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-muted">
              <img
                      loading="lazy" 
                src={images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card border border-border transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card border border-border transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-error text-error-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img
                      loading="lazy" src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-4">
              {/* Category */}
              <Link to={`/shop?category=${product.category}`} className="text-xs sm:text-sm text-primary hover:underline mb-2 block">
                {product.category}
              </Link>

              {/* Title */}
              <h1 className="text-foreground mb-3 sm:mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 sm:gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <span className="text-sm sm:text-base font-medium text-foreground">{product.rating}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">({product.reviews.toLocaleString()} reviews)</span>
                {product.sold && product.sold > 100 && (
                  <span className="text-xs sm:text-sm text-primary font-medium">• {product.sold}+ sold</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">${product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg sm:text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                    <span className="text-sm sm:text-base text-primary font-medium">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">{product.description}</p>

              {/* Escrow Protection Banner */}
              <EscrowProtectionBanner 
                amount={product.price * quantity}
                variant="product"
              />

              {/* Size Selection (optional) */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Size:</label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border-2 transition-colors text-sm sm:text-base ${
                        selectedSize === size
                          ? 'border-primary bg-accent text-primary'
                          : 'border-border hover:border-muted-foreground text-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-2xl border border-border hover:bg-muted transition-colors text-lg font-medium text-foreground"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-2xl border border-border hover:bg-muted transition-colors text-lg font-medium text-foreground"
                  >
                    +
                  </button>
                  {product.stock && (
                    <span className="text-sm text-muted-foreground ml-2">({product.stock} available)</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-brand hover:shadow-brand-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 border-2 transition-all ${
                    isInCart
                      ? 'border-success bg-success/10 text-success'
                      : 'border-primary bg-primary/8 text-primary hover:bg-primary/12'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isInCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleToggleWishlist}
                  className={`flex-1 py-2.5 border rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                    isInWishlist
                      ? 'border-like/30 bg-like/8 text-like'
                      : 'border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'Saved' : 'Wishlist'}
                </button>
                <button
                  onClick={() => setProductRepostSheetOpen(true)}
                  className={`flex-1 py-2.5 border rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                    isProductReposted
                      ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-600'
                      : 'border-border hover:bg-muted text-foreground'
                  }`}
                >
                  <Repeat2 className="w-4 h-4" />
                  {isProductReposted ? 'Reposted' : 'Repost'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1.5 text-foreground"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Seller Info - Replaced with SellerTrustCard */}
            {product.seller && sellerWithMetrics && (
              <div className="mt-8">
                <SellerTrustCard
                  seller={{
                    ...product.seller,
                    metrics: sellerWithMetrics.sellerMetrics
                  }}
                  variant="default"
                  onFollowStore={handleFollow}
                  onVisitStore={() => navigate(`/seller/${product.seller.username}`)}
                  showCTA={true}
                  isFollowing={isFollowing}
                />
              </div>
            )}

            {/* Trust Signals */}
            <div className="mb-4">
              <TrustSignals variant="compact" context="product" />
            </div>

            {/* Features */}
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-4">
              <h3 className="text-base sm:text-lg font-medium text-foreground mb-3">Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base text-foreground">Free Delivery</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base text-foreground">Buyer Protection</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">30-day return guarantee</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base text-foreground">Quality Verified</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Authentic products only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Removed explicit affiliate section - sharing is now handled automatically through backend tracking */}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-foreground mb-4 sm:mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      loading="lazy" 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-foreground">{relatedProduct.rating}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">${relatedProduct.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="mt-8 sm:mt-12 bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8">
          <h2 className="text-foreground mb-6">Customer Reviews</h2>

          {/* Review Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
            {/* Overall Rating */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="text-center md:text-left">
                <div className="text-5xl font-bold text-foreground mb-2">{reviewStats.average}</div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${star <= Math.floor(reviewStats.average) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Based on {reviewStats.total.toLocaleString()} reviews</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewStats.distribution[rating as keyof typeof reviewStats.distribution];
                const percentage = (count / reviewStats.total) * 100;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium text-foreground">{rating}</span>
                      <Star className="w-3 h-3 fill-primary text-primary" />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{count.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Reviews</h3>
              <button
                onClick={() => setShowReviewForm(f => !f)}
                className="px-4 py-2 border border-primary text-primary rounded-xl hover:bg-accent transition-colors text-sm sm:text-base font-medium"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            </div>

            {showReviewForm && (
              <WriteReviewForm productId={product.id} onSubmit={() => { setShowReviewForm(false); toast.success('Review submitted! It will appear after moderation.'); }} />
            )}

            {productReviews.slice(0, visibleReviewCount).map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
                {/* Review Header */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                      loading="lazy" 
                    src={review.user.avatar} 
                    alt={review.user.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{review.user.name}</span>
                      {review.user.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">• {review.date}</span>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <p className="text-foreground mb-3 leading-relaxed">{review.text}</p>

                {/* Review Actions */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                  <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Report
                  </button>
                </div>
              </div>
            ))}

            {/* Load More Reviews */}
            {visibleReviewCount < productReviews.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleReviewCount(c => c + 4)}
                  className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium text-foreground"
                >
                  Load More Reviews ({(productReviews.length - visibleReviewCount).toLocaleString()} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Repost Sheet */}
      <ProductRepostSheet
        open={productRepostSheetOpen}
        onOpenChange={setProductRepostSheetOpen}
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          rating: product.rating,
          seller: {
            name: product.seller?.name ?? product.seller?.storeName ?? 'Seller',
            username: product.seller?.username,
            verified: product.seller?.verified,
          },
        }}
        isReposted={isProductReposted}
        onRepost={handleProductRepost}
        onUndoRepost={handleProductUndoRepost}
      />
    </div>
  );
}