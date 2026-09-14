import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/shop/ProductCard';
import { toProductSummary } from '../data/products';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { EmptyState } from '../components/primitives/EmptyState';
import { Skeleton } from '../components/primitives/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { products } from '../data/products';
import { posts } from '../data/posts';
import { fadeUp, staggerContainer } from '../lib/motion';

const seller = {
  name: 'TechHub Store',
  username: 'techhub_official',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  cover: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
  rating: 4.8,
  reviews: 2543,
  followers: 45600,
};
const reviews = [
  {
    name: 'Rahul Ahmed',
    rating: 5,
    time: '2 days ago',
    text: 'Exactly as described, carefully packed and delivered faster than expected.',
  },
  {
    name: 'Ayesha Khan',
    rating: 5,
    time: '5 days ago',
    text: 'Great communication and a genuine product. Would buy again.',
  },
  {
    name: 'Kabir Hassan',
    rating: 4,
    time: '1 week ago',
    text: 'A dependable seller with helpful support throughout delivery.',
  },
];
function StoreSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Skeleton className="aspect-[16/9] w-full rounded-card lg:h-56" />
      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 rounded-card" />
        ))}
      </div>
    </div>
  );
}

export default function SellerStorePage() {
  const { storeName } = useParams();
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Set<string>>(new Set());
  const storeProducts = useMemo(() => products.slice(0, 12), []);
  const loops = useMemo(() => posts.filter((post) => post.type === 'loop').slice(0, 4), []);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 120);
    return () => clearTimeout(timer);
  }, []);
  if (loading) return <StoreSkeleton />;
  const toggleLike = (_: React.MouseEvent, productId: string) =>
    setLiked((current) => {
      const next = new Set(current);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  const addToCart = (_: React.MouseEvent, productId: string) => {
    setCart((current) => new Set(current).add(productId));
    toast.success('Added to cart');
  };
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${seller.name} — Ezyify`}
        description="Shop verified products from TechHub Store."
      />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-8"
      >
        <motion.div variants={fadeUp} className="relative">
          <ImageWithFallback
            src={seller.cover}
            alt=""
            loading="lazy"
            className="aspect-[16/9] w-full rounded-card object-cover lg:h-56 lg:aspect-auto"
          />
          <Link to="/shop">
            <Button
              aria-label="Back to shop"
              variant="secondary"
              size="icon"
              className="absolute left-3 top-3"
            >
              <ArrowLeft />
            </Button>
          </Link>
        </motion.div>
        <motion.section variants={fadeUp} className="relative -mt-10 mb-6 px-2 lg:-mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <ImageWithFallback
              src={seller.avatar}
              alt=""
              loading="lazy"
              className="size-24 rounded-card border-4 border-background object-cover shadow-md lg:size-28"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold">
                  {storeName?.replace(/-/g, ' ') || seller.name}
                </h1>
                <VerifiedBadge size="sm" />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-foreground-secondary">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-warning text-warning" />
                  {seller.rating} ({seller.reviews.toLocaleString()})
                </span>
                <span>{(seller.followers / 1000).toFixed(1)}K followers</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => toast.success('Following TechHub Store')}>Follow</Button>
              <Button
                variant="outline"
                onClick={() => toast.success('Message composer opened')}
                leftIcon={<MessageCircle />}
              >
                Message
              </Button>
            </div>
          </div>
        </motion.section>
        <motion.div variants={fadeUp} className="mb-6 grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <ShieldCheck className="mx-auto size-5 text-success" />
            <p className="mt-1 text-xs font-semibold">Escrow protected</p>
          </Card>
          <Card className="p-3 text-center">
            <Clock3 className="mx-auto size-5 text-primary" />
            <p className="mt-1 text-xs font-semibold">Ships in 24h</p>
          </Card>
          <Card className="p-3 text-center">
            <PackageCheck className="mx-auto size-5 text-accent-brand" />
            <p className="mt-1 text-xs font-semibold">Free returns</p>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Tabs defaultValue="products">
            <TabsList className="mb-5 grid h-11 w-full grid-cols-4">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="loops">Loops</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-0">
              {storeProducts.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {storeProducts.map((product) => (
                    <ProductCard key={product.id}
                      product={toProductSummary(product)} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  kind="orders"
                  title="No products listed"
                  description="Check back soon for the next release."
                />
              )}
            </TabsContent>
            <TabsContent value="loops" className="mt-0">
              {loops.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {loops.map((loop) => (
                    <Link
                      key={loop.id}
                      to={`/post/${loop.id}`}
                      className="group overflow-hidden rounded-card bg-muted"
                    >
                      <ImageWithFallback
                        src={loop.content.images?.[0] || ''}
                        alt=""
                        loading="lazy"
                        className="aspect-[9/16] w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <p className="p-3 text-sm font-medium">{loop.content.text}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  kind="feed"
                  title="No Loops yet"
                  description="New creator content will appear here."
                />
              )}
            </TabsContent>
            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{review.name}</p>
                      <span className="text-xs text-foreground-tertiary">{review.time}</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground-secondary">{review.text}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="about" className="mt-0">
              <Card className="max-w-2xl space-y-5">
                <div>
                  <h2 className="font-display text-lg font-semibold">About {seller.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
                    Official electronics retailer for dependable everyday tech. Every order is
                    inspected, backed by escrow protection, and supported by a dedicated team.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-sm">
                    <MapPin className="size-4 text-primary" />
                    San Francisco, USA
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Truck className="size-4 text-primary" />
                    Worldwide shipping
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-success" />
                    Verified business
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-primary" />
                    Replies within an hour
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.main>
    </div>
  );
}
