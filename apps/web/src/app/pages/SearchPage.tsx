import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Search, X, TrendingUp, ArrowLeft, Zap,
} from 'lucide-react';
import { storage } from '../lib/storage';
import { SEO, SEOConfigs } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { Skeleton } from '../components/primitives/Skeleton';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/shop/ProductCard';
import { toProductSummary } from '../data/products';
import { EmptySearchResults } from '../components/EmptyStates';
import {
  fadeUp, staggerContainer, DURATION, EASE_EMPHASIZED,
} from '../lib/motion';
import { mockProducts, mockPosts } from '../data/enhanced-mock-data';

// ─── Types ──────────────────────────────────────────────────────────────────

type SearchTab = 'all' | 'products' | 'creators' | 'posts' | 'stores';

interface SearchState {
  trendingSearches: string[];
  recentSearches: string[];
  filteredProducts: any[];
  filteredPosts: any[];
  filteredCreators: any[];
  filteredStores: any[];
}

interface Creator {
  username: string;
  name: string;
  avatar: string;
  verified?: boolean;
  followers?: number;
}

interface Seller {
  username: string;
  name: string;
  avatar: string;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="aspect-square rounded-card" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Search Page ────────────────────────────────────────────────────────────

export default function SearchPage() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const searchParams = new URLSearchParams(location.search);
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [state, setState] = useState<SearchState>({
    trendingSearches: [],
    recentSearches: [],
    filteredProducts: [],
    filteredPosts: [],
    filteredCreators: [],
    filteredStores: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());

  // Load initial data
  useEffect(() => {
    const loadInitialData = () => {
      const recentSearches = storage.get<string[]>('ezyify.search.recent', []);

      const trendingSearches = [
        'Wireless Earbuds',
        'Winter Fashion',
        'Smart Watch',
        'Home Decor',
        'Fitness Gear',
        'Beauty Products',
      ];

      setState(prev => ({
        ...prev,
        trendingSearches,
        recentSearches,
      }));
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  // Update search results when query changes
  useEffect(() => {
    if (!query) {
      setState(prev => ({
        ...prev,
        filteredProducts: [],
        filteredPosts: [],
        filteredCreators: [],
        filteredStores: [],
      }));
      return;
    }

    const q = query.toLowerCase();

    // Filter products
    const filteredProducts = mockProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category ?? '').toLowerCase().includes(q) ||
      (p.tags && p.tags.some((tag: string) => tag.toLowerCase().includes(q)))
    ).slice(0, 12);

    // Filter posts
    const filteredPosts = mockPosts.filter(post =>
      (post.content?.text ?? '').toLowerCase().includes(q) ||
      (post.hashtags && post.hashtags.some((tag: string) => tag.toLowerCase().includes(q))) ||
      (post.author?.username ?? '').toLowerCase().includes(q)
    ).slice(0, 9);

    // Filter creators (unique from posts)
    const creatorMap = new Map<string, Creator>();
    mockPosts.forEach(post => {
      const author = post.author;
      if (author && author.username.toLowerCase().includes(q)) {
        if (!creatorMap.has(author.username)) {
          creatorMap.set(author.username, { ...author, name: author.username.replace(/_/g, ' ') });
        }
      }
    });
    const filteredCreators = Array.from(creatorMap.values()).slice(0, 8);

    // Filter stores (mock data)
    const storeMap = new Map<string, Seller>();
    mockProducts.forEach(p => {
      // enhanced-mock-data stores the seller as a display name string
      const sellerName = typeof p.seller === 'string' ? p.seller : (p.seller as { name?: string })?.name;
      if (sellerName && sellerName.toLowerCase().includes(q)) {
        const username = sellerName.toLowerCase().replace(/\s+/g, '_');
        if (!storeMap.has(username)) {
          storeMap.set(username, { username, name: sellerName, avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(sellerName)}` });
        }
      }
    });
    const filteredStores = Array.from(storeMap.values()).slice(0, 8);

    setState(prev => ({
      ...prev,
      filteredProducts,
      filteredPosts,
      filteredCreators,
      filteredStores,
    }));
  }, [query]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setActiveTab('all');
  };

  const addRecentSearch = (searchTerm: string) => {
    const recent = storage.get<string[]>('ezyify.search.recent', []);
    const updated = [
      searchTerm,
      ...recent.filter(s => s !== searchTerm),
    ].slice(0, 8);
    localStorage.setItem('ezyify.search.recent', JSON.stringify(updated));
    setState(prev => ({ ...prev, recentSearches: updated }));
  };

  const removeRecentSearch = (searchTerm: string) => {
    const recent = storage.get<string[]>('ezyify.search.recent', []);
    const updated = recent.filter(s => s !== searchTerm);
    localStorage.setItem('ezyify.search.recent', JSON.stringify(updated));
    setState(prev => ({ ...prev, recentSearches: updated }));
  };

  const clearSearchQuery = () => {
    setQuery('');
  };

  const toggleLike = (productId: string) => {
    const updated = new Set(likedProducts);
    if (updated.has(productId)) {
      updated.delete(productId);
    } else {
      updated.add(productId);
    }
    setLikedProducts(updated);
  };

  const toggleCart = (productId: string) => {
    const updated = new Set(cartItems);
    if (updated.has(productId)) {
      updated.delete(productId);
    } else {
      updated.add(productId);
    }
    setCartItems(updated);
  };

  const tabsData = [
    { id: 'all' as SearchTab, label: 'All', count: state.filteredProducts.length + state.filteredPosts.length },
    { id: 'products' as SearchTab, label: 'Products', count: state.filteredProducts.length },
    { id: 'creators' as SearchTab, label: 'Creators', count: state.filteredCreators.length },
    { id: 'posts' as SearchTab, label: 'Posts', count: state.filteredPosts.length },
    { id: 'stores' as SearchTab, label: 'Stores', count: state.filteredStores.length },
  ];

  if (isLoading) {
    return <SearchSkeleton />;
  }

  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SEO {...SEOConfigs.search} />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Search Field with Back Arrow & Clear Button */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex gap-2 items-center"
        >
          {hasQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearchQuery}
              aria-label="Back"
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-foreground-tertiary pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search products, creators, posts..."
              className="w-full h-12 pl-12 pr-12 rounded-full border border-border bg-background text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              autoFocus
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={clearSearchQuery}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="size-5 text-foreground-secondary hover:text-foreground transition-colors" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {!hasQuery ? (
          // Empty state: recent searches + trending
          <motion.div
            variants={staggerContainer(reduce ? 0 : 0.05)}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Recent Searches */}
            {state.recentSearches.length > 0 && (
              <motion.div variants={fadeUp}>
                <h3 className="font-display text-lg font-semibold mb-3 text-foreground">
                  Recent
                </h3>
                <div className="flex flex-wrap gap-2">
                  {state.recentSearches.map(search => (
                    <motion.div key={search} variants={fadeUp}>
                      <button
                        onClick={() => handleSearch(search)}
                        className="inline-flex items-center gap-2 h-10 px-3 rounded-full border border-border bg-card hover:border-border-strong hover:bg-background-elevated transition-colors"
                      >
                        <span className="text-sm font-medium">{search}</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            removeRecentSearch(search);
                          }}
                          className="text-foreground-tertiary hover:text-foreground"
                          aria-label={`Remove "${search}" from recent searches`}
                        >
                          <X className="size-4" />
                        </button>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trending Searches */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="size-5 text-foreground" />
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Trending
                </h3>
              </div>
              <div className="space-y-2">
                {state.trendingSearches.map((search, idx) => (
                  <motion.button
                    key={search}
                    variants={fadeUp}
                    onClick={() => {
                      handleSearch(search);
                      addRecentSearch(search);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-muted transition-colors group flex items-center gap-3"
                  >
                    <span className="font-display font-bold text-foreground-tertiary w-6 text-center">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {search}
                    </span>
                    <Zap className="size-4 ml-auto text-foreground-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // Search results
          <motion.div
            variants={staggerContainer(reduce ? 0 : 0.05)}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Result Tabs with Counts */}
            <motion.div variants={fadeUp} className="-mx-4 lg:-mx-6 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 lg:px-6">
                <div className="flex gap-6 overflow-x-auto pb-2">
                  {tabsData.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'text-foreground'
                          : 'text-foreground-secondary hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="ml-2 text-xs text-foreground-tertiary">
                          {tab.count}
                        </span>
                      )}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="search-tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                          transition={{ duration: DURATION.fast }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Tab: All */}
            {activeTab === 'all' && (
              <motion.div
                variants={staggerContainer(reduce ? 0 : 0.05)}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Products in All */}
                {state.filteredProducts.length > 0 && (
                  <motion.div variants={fadeUp}>
                    <h3 className="font-display text-lg font-semibold mb-4">Products</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                      {state.filteredProducts.slice(0, 4).map(product => (
                        <motion.div key={product.id} variants={fadeUp}>
                          <ProductCard product={toProductSummary(product)} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Posts in All */}
                {state.filteredPosts.length > 0 && (
                  <motion.div variants={fadeUp}>
                    <h3 className="font-display text-lg font-semibold mb-4">Posts</h3>
                    <div className="grid grid-cols-3 gap-2 lg:gap-4">
                      {state.filteredPosts.slice(0, 6).map(post => (
                        <motion.button
                          key={post.id}
                          variants={fadeUp}
                          className="group relative aspect-square rounded-card overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {post.content?.media?.url && (
                            <ImageWithFallback
                              src={post.content.media.url}
                              alt={post.content.text}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {state.filteredProducts.length === 0 && state.filteredPosts.length === 0 && (
                  <EmptySearchResults />
                )}
              </motion.div>
            )}

            {/* Tab: Products */}
            {activeTab === 'products' && (
              <motion.div
                variants={staggerContainer(reduce ? 0 : 0.05)}
                initial="hidden"
                animate="visible"
              >
                {state.filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                    {state.filteredProducts.map(product => (
                      <motion.div key={product.id} variants={fadeUp}>
                        <ProductCard product={toProductSummary(product)} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptySearchResults />
                )}
              </motion.div>
            )}

            {/* Tab: Creators */}
            {activeTab === 'creators' && (
              <motion.div
                variants={staggerContainer(reduce ? 0 : 0.05)}
                initial="hidden"
                animate="visible"
              >
                {state.filteredCreators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    {state.filteredCreators.map(creator => (
                      <motion.div key={creator.username} variants={fadeUp}>
                        <Link
                          to={`/profile/${creator.username}`}
                          className="flex items-center gap-4 p-4 rounded-card border border-border bg-card hover:bg-background-elevated hover:border-border-strong transition-colors"
                        >
                          <div className="relative flex-shrink-0">
                            <ImageWithFallback
                              src={creator.avatar}
                              alt={creator.username}
                              className="size-16 rounded-full object-cover"
                              width={64}
                              height={64}
                            />
                            {creator.verified && (
                              <span className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                                <VerifiedBadge size="sm" />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-foreground truncate">
                                {creator.name}
                              </p>
                            </div>
                            <p className="text-xs text-foreground-secondary truncate mb-2">
                              @{creator.username}
                            </p>
                            <p className="text-xs text-foreground-tertiary">
                              {creator.followers?.toLocaleString()} followers
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            Follow
                          </Button>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptySearchResults />
                )}
              </motion.div>
            )}

            {/* Tab: Posts */}
            {activeTab === 'posts' && (
              <motion.div
                variants={staggerContainer(reduce ? 0 : 0.05)}
                initial="hidden"
                animate="visible"
              >
                {state.filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 lg:gap-4">
                    {state.filteredPosts.map(post => (
                      <motion.button
                        key={post.id}
                        variants={fadeUp}
                        className="group relative aspect-square rounded-card overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {post.content?.media?.url && (
                          <ImageWithFallback
                            src={post.content.media.url}
                            alt={post.content.text}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <EmptySearchResults />
                )}
              </motion.div>
            )}

            {/* Tab: Stores */}
            {activeTab === 'stores' && (
              <motion.div
                variants={staggerContainer(reduce ? 0 : 0.05)}
                initial="hidden"
                animate="visible"
              >
                {state.filteredStores.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                    {state.filteredStores.map(store => (
                      <motion.div key={store.username} variants={fadeUp}>
                        <Card variant="default" className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <ImageWithFallback
                              src={store.avatar}
                              alt={store.name}
                              className="size-14 rounded-full object-cover"
                              width={56}
                              height={56}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {store.name}
                              </p>
                              <p className="text-xs text-foreground-secondary truncate">
                                @{store.username}
                              </p>
                            </div>
                          </div>
                          <Button
                            asChild
                            variant="primary"
                            size="sm"
                            fullWidth
                          >
                            <Link to={`/store/${store.username}`}>
                              Visit store
                            </Link>
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptySearchResults />
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
