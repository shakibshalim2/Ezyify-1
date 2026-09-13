import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  Play, Share2, Edit, MessageCircle,
  MapPin, Calendar, Link as LinkIcon, Bookmark, Package, Settings } from 'lucide-react';
import { storage } from '../lib/storage';
import { SEO } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { Skeleton } from '../components/primitives/Skeleton';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/shop/ProductCard';
import {
  EmptyPosts, EmptyContent, EmptyProducts, EmptySearchResults,
} from '../components/EmptyStates';
import {
  fadeUp, staggerContainer, DURATION, EASE_EMPHASIZED, springSnappy,
} from '../lib/motion';
import { posts } from '../data/posts';
import { products } from '../data/products';

// ─── Types & Constants ───────────────────────────────────────────────────────

type Tab = 'posts' | 'loops' | 'products' | 'saved';

interface ProfileState {
  user: any | null;
  userPosts: any[];
  userLoops: any[];
  userProducts: any[];
  savedPosts: any[];
  savedLoops: any[];
  savedProducts: any[];
  isFollowing: boolean;
  likedPostIds: Set<string>;
  cartItems: Set<string>;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Cover image */}
      <Skeleton className="h-48 lg:h-72 w-full" />

      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        {/* Profile header */}
        <div className="relative -mt-16 lg:-mt-24 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Skeleton className="size-32 lg:size-40 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full max-w-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
            </div>
          </div>
        </div>

        {/* Highlights strip */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-6 scrollbar-hide">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="size-20 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Tabs */}
        <Skeleton className="h-12 w-full mb-6" />

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2 lg:gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="aspect-square rounded-card" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const isOwnProfile = !username || username === 'me';

  const [state, setState] = useState<ProfileState>({
    user: null,
    userPosts: [],
    userLoops: [],
    userProducts: [],
    savedPosts: [],
    savedLoops: [],
    savedProducts: [],
    isFollowing: false,
    likedPostIds: new Set(),
    cartItems: new Set(),
  });

  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [isLoading, setIsLoading] = useState(true);

  // Load profile data
  useEffect(() => {
    const loadData = () => {
      const user = {
        username: username || 'fashionista_emma',
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1632163506775-db3341414ffb?w=300',
        coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop',
        verified: true,
        bio: 'Fashion & Lifestyle Content Creator | Sharing daily outfit inspiration and style tips',
        location: 'New York, USA',
        website: 'emmastyle.com',
        joinDate: 'January 2024',
        followers: 156000,
        following: 892,
        posts: 342,
        role: isOwnProfile ? 'creator' : 'user',
      };

      const userPosts = posts
        .filter(p => p.type === 'post' && p.user.username === user.username)
        .slice(0, 9);

      const userLoops = posts
        .filter(p => p.type === 'loop' && p.user.username === user.username)
        .slice(0, 9);

      const userProductIds = new Set(
        posts
          .filter(p => p.user.username === user.username && p.taggedProducts)
          .flatMap(p => p.taggedProducts || [])
      );
      const userProducts = products
        .filter(p => userProductIds.has(p.id))
        .slice(0, 8);

      const savedPosts = posts.filter(p => p.type === 'post' && p.isSaved).slice(0, 9);
      const savedLoops = posts.filter(p => p.type === 'loop' && p.isSaved).slice(0, 6);
      const wishlistIds: string[] = (() => {
        try {
          return storage.get<string[]>('ezyify_wishlist', []);
        } catch {
          return [];
        }
      })();
      const savedProducts = wishlistIds.length > 0
        ? products.filter(p => wishlistIds.includes(p.id)).slice(0, 8)
        : products.slice(0, 8);

      // Load from localStorage
      const likedPostIds = new Set<string>(storage.get<string[]>('ezyify_liked_posts', []));
      const cartItems = new Set<string>(
        storage.get<{ id: string }[]>('ezyify_cart', []).map(item => item.id)
      );

      setState({
        user,
        userPosts,
        userLoops,
        userProducts,
        savedPosts,
        savedLoops,
        savedProducts,
        isFollowing: storage.get<string[]>('ezyify_following', []).includes(user.username),
        likedPostIds,
        cartItems,
      });
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadData, 16);
      return () => clearTimeout(timer);
    }
  }, [username, isOwnProfile]);

  const toggleFollow = () => {
    if (!state.user) return;
    const following = storage.get<string[]>('ezyify_following', []);
    if (state.isFollowing) {
      localStorage.setItem('ezyify_following', JSON.stringify(
        following.filter((u: string) => u !== state.user.username)
      ));
    } else {
      following.push(state.user.username);
      localStorage.setItem('ezyify_following', JSON.stringify(following));
    }
    setState(prev => ({ ...prev, isFollowing: !prev.isFollowing }));
  };

  const toggleLike = (postId: string) => {
    const liked = new Set(state.likedPostIds);
    if (liked.has(postId)) {
      liked.delete(postId);
    } else {
      liked.add(postId);
    }
    setState(prev => ({ ...prev, likedPostIds: liked }));
    localStorage.setItem('ezyify_liked_posts', JSON.stringify(Array.from(liked)));
  };

  const toggleCart = (productId: string) => {
    const cart = new Set(state.cartItems);
    if (cart.has(productId)) {
      cart.delete(productId);
    } else {
      cart.add(productId);
    }
    setState(prev => ({ ...prev, cartItems: cart }));
    const cartData = Array.from(cart).map(id => ({ id, quantity: 1 }));
    localStorage.setItem('ezyify_cart', JSON.stringify(cartData));
  };

  if (isLoading || !state.user) {
    return <ProfileSkeleton />;
  }

  const { user } = state;
  const tabsData = {
    posts: { label: 'Posts', icon: null, count: state.userPosts.length, empty: EmptyPosts },
    loops: { label: 'Loops', icon: Play, count: state.userLoops.length, empty: EmptyContent },
    products: { label: 'Products', icon: Package, count: state.userProducts.length, empty: EmptyProducts },
    saved: { label: 'Saved', icon: Bookmark, count: state.savedPosts.length, empty: EmptySearchResults },
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return state.userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            {state.userPosts.map(post => (
              <motion.button
                key={post.id}
                variants={fadeUp}
                className="group relative aspect-square rounded-card overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {}}
              >
                {post.image && (
                  <ImageWithFallback
                    src={post.image}
                    alt={post.content?.text || 'Post'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <EmptyPosts />
        );

      case 'loops':
        return state.userLoops.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            {state.userLoops.map(loop => (
              <motion.button
                key={loop.id}
                variants={fadeUp}
                className="group relative aspect-[9/16] rounded-card overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                {loop.image && (
                  <ImageWithFallback
                    src={loop.image}
                    alt={loop.content?.text || 'Loop'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="size-12 text-white drop-shadow-lg" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <EmptyContent />
        );

      case 'products':
        return state.userProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {state.userProducts.map(product => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard
                  product={product}
                  isLiked={state.cartItems.has(product.id)}
                  inCart={state.cartItems.has(product.id)}
                  onToggleLike={() => toggleLike(product.id)}
                  onAddToCart={() => toggleCart(product.id)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyProducts />
        );

      case 'saved':
        return state.savedPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 lg:gap-4">
            {state.savedPosts.map(post => (
              <motion.button
                key={post.id}
                variants={fadeUp}
                className="group relative aspect-square rounded-card overflow-hidden bg-muted"
              >
                {post.image && (
                  <ImageWithFallback
                    src={post.image}
                    alt="Saved post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <EmptySearchResults />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SEO
        title={`${user.name} (@${user.username}) - Ezyify`}
        description={user.bio}
      />

      {/* Cover Image with Gradient Scrim */}
      <div className="relative h-48 lg:h-72 w-full overflow-hidden">
        <ImageWithFallback
          src={user.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        {/* Profile Header */}
        <motion.div
          variants={staggerContainer(reduce ? 0 : 0.05)}
          initial="hidden"
          animate="visible"
          className="relative -mt-16 lg:-mt-24 mb-8"
        >
          <div className="flex flex-col gap-6">
            {/* Avatar + Name/Bio */}
            <div className="flex gap-4">
              <motion.div variants={fadeUp}>
                <div className="size-32 lg:size-40 rounded-full ring-4 ring-card bg-card overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    width={160}
                    height={160}
                  />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex-1 pt-4 lg:pt-8">
                <div className="flex items-start gap-2 mb-1">
                  <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                    {user.name}
                  </h1>
                  {user.verified && <VerifiedBadge size="lg" />}
                </div>
                <p className="text-foreground-secondary mb-3">@{user.username}</p>
                <p className="text-foreground text-sm lg:text-base mb-4 max-w-sm line-clamp-3">
                  {user.bio}
                </p>
                {(user.location || user.website) && (
                  <div className="flex flex-col gap-1 text-xs text-foreground-secondary">
                    {user.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {user.location}
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center gap-1.5">
                        <LinkIcon className="size-4" />
                        <Link
                          to="#"
                          className="text-primary hover:underline"
                        >
                          {user.website}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Stats Row */}
            <motion.div variants={fadeUp} className="flex gap-6">
              {[
                { label: 'Posts', value: user.posts },
                { label: 'Followers', value: user.followers },
                { label: 'Following', value: user.following },
              ].map(stat => (
                <button
                  key={stat.label}
                  className="text-center focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-3 py-1"
                >
                  <div className="font-display font-bold text-lg tabular-nums text-foreground">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-foreground-secondary">
                    {stat.label}
                  </div>
                </button>
              ))}
            </motion.div>

            {/* Joined Meta */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-xs text-foreground-secondary">
              <Calendar className="size-4" />
              Joined {user.joinDate}
            </motion.div>
          </div>
        </motion.div>

        {/* Action Row */}
        <motion.div
          variants={fadeUp}
          className="mb-8 flex gap-2 flex-wrap items-center"
        >
          {isOwnProfile ? (
            <>
              <Button variant="outline" size="md" leftIcon={<Edit className="size-5" />}>
                Edit profile
              </Button>
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings className="size-5" />
              </Button>
              <Button variant="link" asChild>
                <Link to="/creator-dashboard">Creator dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <motion.button
                key={state.isFollowing ? 'following' : 'follow'}
                layout="position"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center"
              >
                <Button
                  variant={state.isFollowing ? 'secondary' : 'primary'}
                  size="md"
                  onClick={toggleFollow}
                >
                  {state.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </motion.button>
              <Button variant="outline" size="md" leftIcon={<MessageCircle className="size-5" />}>
                Message
              </Button>
              <Button variant="ghost" size="icon" aria-label="Share profile">
                <Share2 className="size-5" />
              </Button>
            </>
          )}
        </motion.div>

        {/* Highlights Strip */}
        {state.userPosts.length > 0 && (
          <motion.div variants={fadeUp} className="mb-8 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { label: 'Outfits', image: state.userPosts[0]?.content?.images?.[0] },
              { label: 'Hauls', image: state.userPosts[1]?.content?.images?.[0] },
              { label: 'Travel', image: state.userPosts[2]?.content?.images?.[0] },
              { label: 'Live', image: state.userPosts[3]?.content?.images?.[0] },
            ]
              .filter(h => h.image)
              .map(h => (
                <Link
                  key={h.label}
                  to={`/stories/${state.user?.username ?? ''}`}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                  aria-label={`Highlight: ${h.label}`}
                >
                  <span className="story-ring-gradient rounded-full p-[2px]">
                    <span className="block rounded-full bg-background p-[2px]">
                      <ImageWithFallback src={h.image} alt="" className="size-16 rounded-full object-cover" />
                    </span>
                  </span>
                  <span className="text-[11px] font-medium text-foreground-secondary">{h.label}</span>
                </Link>
              ))}
          </motion.div>
        )}

        {/* Sticky Tab Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mx-4 lg:-mx-6 mb-8 border-b border-border"
        >
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="flex gap-6 overflow-x-auto">
              {(Object.entries(tabsData) as [Tab, any][]).map(([tabKey, tabInfo]) => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`relative py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tabKey
                      ? 'text-foreground'
                      : 'text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {tabInfo.icon && <tabInfo.icon className="size-4" />}
                    {tabInfo.label}
                    {tabInfo.count > 0 && (
                      <span className="text-xs text-foreground-tertiary">
                        {tabInfo.count}
                      </span>
                    )}
                  </div>
                  {activeTab === tabKey && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                      transition={{ duration: DURATION.fast }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          variants={staggerContainer(reduce ? 0 : 0.05)}
          initial="hidden"
          animate="visible"
          key={activeTab}
        >
          {getTabContent()}
        </motion.div>

        {/* Seller Badge Card */}
        {user.role === 'seller' && (
          <motion.div variants={fadeUp} className="mt-12">
            <Card variant="featured" className="p-6">
              <h3 className="font-display font-bold text-lg mb-2">
                {user.name}'s Store
              </h3>
              <p className="text-foreground-secondary text-sm mb-4">
                ★★★★★ (2,340 reviews)
              </p>
              <Button asChild variant="primary" size="md">
                <Link to={`/store/${user.username}`}>Visit store</Link>
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
