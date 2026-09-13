import { SEO } from '../components/SEO';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { posts } from '../data/posts';
import { products } from '../data/products';
import { ReferralService } from '../services/referral';
import {
  Grid, Play, Heart, MessageCircle, Share2,
  MoreVertical, MapPin, Calendar, Link as LinkIcon,
  ShoppingBag, Award, CheckCircle2, Bookmark, Settings, Edit, Wallet, Package,
  Repeat2, Star, Images, Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { VisuallyHidden } from '../components/ui/visually-hidden';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { FollowButton } from '../components/FollowButton';
import { PostViewer } from '../components/PostViewer';
import { LoopViewer } from '../components/LoopViewer';

// SKELETON FOR INSTANT UI
function ProfileSkeleton() {
  return (<div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Skeleton className="h-48 lg:h-64 w-full" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative -mt-20 lg:-mt-24 mb-6">
          <div className="bg-card rounded-2xl p-6 shadow-md border border-border">
            <div className="flex flex-col lg:flex-row gap-6">
              <Skeleton className="w-32 h-32 lg:w-40 lg:h-40 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [postSheetPost, setPostSheetPost] = useState<any>(null);
  const [loopSheetLoop, setLoopSheetLoop] = useState<any>(null);
  const isOwnProfile = !username || username === 'me'; // Check if viewing own profile

  // PROGRESSIVE LOADING: Load data after initial render
  const [pageData, setPageData] = useState<{
    user: any;
    userPosts: any[];
    userLoops: any[];
    userProducts: any[];
    savedPosts: any[];
    savedLoops: any[];
    savedProducts: any[];
    repostedPosts: any[];
    repostedProducts: any[];
  } | null>(null);

  useEffect(() => {
    const loadPageData = () => {
      const user = {
        username: username || 'fashionista_emma',
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1632163506775-db3341414ffb?w=300',
        coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop',
        verified: true,
        bio: 'Fashion & Lifestyle Content Creator 👗✨ | Sharing daily outfit inspiration',
        location: 'New York, USA',
        joinDate: 'January 2024',
        website: 'emmastyle.com',
        followers: 156000,
        following: 892,
        posts: 342
      };

      // Get user posts (excluding loops)
      const userPosts = posts.filter(post => 
        post.type === 'post' && post.user.username === user.username
      ).slice(0, 12);

      // Get user loops (only video content)
      const userLoops = posts.filter(post => 
        post.type === 'loop' && post.user.username === user.username
      ).slice(0, 12);

      // Get user products (products tagged in their posts)
      const userProductIds = new Set(
        posts
          .filter(post => post.user.username === user.username && post.taggedProducts)
          .flatMap(post => post.taggedProducts || [])
      );
      const userProducts = products.filter(product => 
        userProductIds.has(product.id)
      ).slice(0, 8);

      // Saved content — use isSaved flag for posts/loops, localStorage wishlist for products
      const savedPosts = posts.filter(post => post.type === 'post' && post.isSaved).slice(0, 9);
      const savedLoops = posts.filter(post => post.type === 'loop' && post.isSaved).slice(0, 6);
      const wishlistIds: string[] = (() => {
        try { return JSON.parse(localStorage.getItem('ezyify_wishlist') || '[]'); } catch { return []; }
      })();
      const savedProducts = wishlistIds.length > 0
        ? products.filter(p => wishlistIds.includes(p.id)).slice(0, 8)
        : products.slice(0, 8); // fallback to first 8 for demo

      // Reposted content — posts/loops from OTHER creators that this user has reposted
      const otherUserPosts = posts.filter(post =>
        post.type === 'post' && post.user.username !== user.username
      ).slice(0, 6);
      const repostedPosts = otherUserPosts.map(post => ({
        ...post,
        _repost: {
          repostedAt: '3 hours ago',
          repostedByUsername: user.username,
          repostedByName: user.name,
        }
      }));

      // Reposted products — products from OTHER sellers that this user has reposted
      const otherSellerProducts = products.filter(p =>
        p.seller.username !== user.username
      ).slice(0, 6);

      // Restore any real repost state from localStorage via ReferralService
      const repostedProducts = otherSellerProducts.map(product => {
        const hasRealRepost = ReferralService.hasReposted(product.id);
        return {
          ...product,
          _repost: {
            repostedAt: hasRealRepost ? 'Recently' : '1 day ago',
            repostedByUsername: user.username,
            repostedByName: user.name,
            isReferralEligible: product.affiliateCommission > 0,
            commissionRate: product.affiliateCommission,
            hasActiveReferral: hasRealRepost,
          }
        };
      });

      setPageData({
        user,
        userPosts,
        userLoops,
        userProducts,
        savedPosts,
        savedLoops,
        savedProducts,
        repostedPosts,
        repostedProducts,
      });
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadPageData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadPageData, 16);
      return () => clearTimeout(timer);
    }
  }, [username]);

  if (!pageData) {
    return <ProfileSkeleton />;
  }

  const { user, userPosts, userLoops, userProducts, savedPosts, savedLoops, savedProducts, repostedPosts, repostedProducts } = pageData;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SEO title={`${user.name} (@${user.username}) — Ezyify`} description={`${user.bio || `View ${user.name}'s profile on Ezyify.`}`} />
      {/* Cover image */}
      <div className="relative h-44 lg:h-60 overflow-hidden bg-muted">
        <img loading="eager"
          src={user.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.3) 100%)' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile card */}
        <div className="relative -mt-16 mb-5">
          <div className="bg-card rounded-3xl p-5 sm:p-6 shadow-xl border border-border">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              {/* Avatar */}
              <div className="relative self-start sm:self-auto">
                <img loading="lazy"
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-card shadow-md object-cover"
                />
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1">
                    <VerifiedBadge size="md" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h1 className="text-xl font-bold text-foreground truncate">{user.name}</h1>
                      {user.verified && <VerifiedBadge />}
                    </div>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap shrink-0">
                    {isOwnProfile ? (
                      <>
                        <Link to="/profile/edit">
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        </Link>
                        <Link to="/settings"><Button variant="outline" size="icon-sm"><Settings className="w-4 h-4" /></Button></Link>
                        <Link to="/wallet"><Button variant="outline" size="icon-sm"><Wallet className="w-4 h-4" /></Button></Link>
                        <Link to="/orders"><Button variant="outline" size="icon-sm"><Package className="w-4 h-4" /></Button></Link>
                      </>
                    ) : (
                      <>
                        <FollowButton username={user.username} initialFollowing={isFollowing} className="shrink-0" />
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/messages?user=${user.username}`)}>
                          <MessageCircle className="w-3.5 h-3.5" />
                          Message
                        </Button>
                        <Button variant="outline" size="icon-sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon-sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-5 mb-3">
                  <div className="text-center">
                    <p className="font-bold text-foreground leading-tight">{userPosts.length + userLoops.length || user.posts}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <Link to={`/profile/${user.username}/followers`} className="text-center group hover:opacity-80 transition-opacity">
                    <p className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {user.followers >= 1000 ? `${(user.followers/1000).toFixed(0)}K` : user.followers}
                    </p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </Link>
                  <Link to={`/profile/${user.username}/following`} className="text-center group hover:opacity-80 transition-opacity">
                    <p className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{user.following}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </Link>
                </div>

                <p className="text-sm text-foreground mb-3 leading-relaxed">{user.bio}</p>

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {user.joinDate}
                  </span>
                  {user.website && (
                    <a 
                      href={`https://${user.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {user.website}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Own profile quick-access chip row */}
        {isOwnProfile && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              { to: '/wallet',   icon: Wallet,   label: 'Wallet'   },
              { to: '/orders',   icon: Package,  label: 'Orders'   },
              { to: '/wishlist', icon: Bookmark, label: 'Saved'    },
              { to: '/settings', icon: Settings, label: 'Settings' },
              { to: '/help',     icon: Award,    label: 'Help'     },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-muted/60 border border-border/50 hover:bg-muted hover:border-border transition-all text-[12px] font-medium text-foreground/70 hover:text-foreground"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        )}

        <Tabs defaultValue="posts" className="mb-8">
          <TabsList className="grid w-full grid-cols-5 bg-card">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="loops" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Loops</span>
            </TabsTrigger>
            <TabsTrigger value="reposts" className="flex items-center gap-2">
              <Repeat2 className="w-4 h-4" />
              <span className="hidden sm:inline">Reposts</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            {userPosts.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center border border-border">
                <Grid className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl text-foreground mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground">Photo posts will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-1.5 lg:gap-2">
                {userPosts.map((post) => {
                  const imageUrl = post.content?.images?.[0] ?? post.content?.video ?? null;
                  if (!imageUrl) return null;
                  const isVideo = post.type === 'loop' || !!post.content?.video;
                  const multiImage = (post.content?.images?.length ?? 0) > 1;
                  const hasProduct = (post.taggedProducts?.length ?? 0) > 0;
                  const likesDisplay = (post.likes ?? 0) >= 1000
                    ? `${((post.likes ?? 0) / 1000).toFixed(1)}K`
                    : String(post.likes ?? 0);

                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => setPostSheetPost(post)}
                      className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden group bg-muted w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      {/* Main image */}
                      <img
                        loading="lazy"
                        src={imageUrl}
                        alt={post.content?.text || ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                      />

                      {/* Persistent bottom gradient for engagement peek */}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

                      {/* Engagement count — always visible at bottom */}
                      <div className="absolute bottom-1.5 left-2 flex items-center gap-2.5 text-white">
                        <div className="flex items-center gap-0.5">
                          <Heart className="w-3 h-3 fill-white" />
                          <span className="text-[10px] font-semibold leading-none">{likesDisplay}</span>
                        </div>
                        {(post.comments ?? 0) > 0 && (
                          <div className="flex items-center gap-0.5">
                            <MessageCircle className="w-3 h-3 fill-white" />
                            <span className="text-[10px] font-semibold leading-none">{post.comments}</span>
                          </div>
                        )}
                      </div>

                      {/* Top-right type indicators */}
                      <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-1">
                        {multiImage && (
                          <div className="bg-black/55 backdrop-blur-sm rounded-full p-1 shadow-sm">
                            <Images className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        {isVideo && !multiImage && (
                          <div className="bg-black/55 backdrop-blur-sm rounded-full p-1 shadow-sm">
                            <Play className="w-2.5 h-2.5 text-white fill-white" />
                          </div>
                        )}
                      </div>

                      {/* Top-left product badge */}
                      {hasProduct && (
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/55 backdrop-blur-sm rounded-full px-1.5 py-0.5 shadow-sm">
                          <ShoppingBag className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}

                      {/* Hover engagement overlay */}
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="flex items-center gap-5 text-white">
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-5 h-5 fill-white" />
                            <span className="text-sm font-semibold drop-shadow">{likesDisplay}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-5 h-5 fill-white" />
                            <span className="text-sm font-semibold drop-shadow">{post.comments ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reposts" className="mt-6">
            {repostedPosts.length === 0 && repostedProducts.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center border border-border">
                <Repeat2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl text-foreground mb-2">No Reposts Yet</h3>
                <p className="text-muted-foreground mb-6">Reposted content and products will appear here</p>
                <Link to="/">
                  <Button>Explore Content</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Reposted Posts */}
                {repostedPosts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Repeat2 className="w-5 h-5" />
                      Reposted Posts
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
                      {repostedPosts.map(post => {
                        const imageUrl = post.content.images?.[0];
                        if (!imageUrl) return null;
                        return (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => setPostSheetPost(post)}
                            className="relative aspect-square rounded-2xl overflow-hidden group bg-muted w-full"
                          >
                            <img loading="lazy"
                              src={imageUrl}
                              alt={post.content.text || ''}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            {/* Repost indicator badge */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                              <Repeat2 className="w-3 h-3 text-white" />
                            </div>
                            {/* Original creator attribution */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6">
                              <div className="flex items-center gap-1.5">
                                <img
                                  src={post.user.avatar}
                                  alt={post.user.name}
                                  className="w-5 h-5 rounded-full border border-white/50 object-cover"
                                />
                                <span className="text-white text-xs truncate">@{post.user.username}</span>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-white flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Heart className="w-5 h-5 fill-white" />
                                  <span>{(post.likes / 1000).toFixed(1)}K</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-5 h-5 fill-white" />
                                  <span>{post.comments}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reposted Products */}
                {repostedProducts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Reposted Products
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {repostedProducts.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group border border-border"
                        >
                          <div className="aspect-square relative overflow-hidden">
                            {/* Repost indicator */}
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                              <Repeat2 className="w-3 h-3 text-white" />
                            </div>
                            {/* Referral badge */}
                            {product._repost.isReferralEligible && (
                              <div className="absolute top-2 right-2 z-10 bg-primary text-white text-[10px] font-semibold rounded-full px-2 py-0.5">
                                {product._repost.commissionRate}% earn
                              </div>
                            )}
                            <img loading="lazy"
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="p-3">
                            {/* Original seller attribution */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <img
                                src={product.seller.avatar}
                                alt={product.seller.name}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                              <span className="text-xs text-muted-foreground truncate">@{product.seller.username}</span>
                              {product.seller.verified && (
                                <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                              )}
                            </div>
                            <h3 className="text-foreground mb-1.5 line-clamp-2">{product.name}</h3>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-lg text-foreground">${product.price}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${product.originalPrice}
                                </span>
                              )}
                            </div>
                            {/* Rating row */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{product.rating}</span>
                              <span>({product.reviews})</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="loops" className="mt-4">
            {userLoops.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center border border-border">
                <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl text-foreground mb-2">No Loops Yet</h3>
                <p className="text-muted-foreground">Video loops will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-1.5 lg:gap-2">
                {userLoops.map((loop) => {
                  const imageUrl = loop.content?.images?.[0] ?? loop.content?.video ?? null;
                  if (!imageUrl) return null;
                  const viewsDisplay = loop.views
                    ? loop.views >= 1000
                      ? `${(loop.views / 1000).toFixed(1)}K`
                      : String(loop.views)
                    : null;

                  return (
                    <button
                      key={loop.id}
                      type="button"
                      onClick={() => setLoopSheetLoop(loop)}
                      className="relative aspect-[9/16] rounded-xl sm:rounded-2xl overflow-hidden group bg-muted w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      <img
                        loading="lazy"
                        src={imageUrl}
                        alt={loop.content?.text || ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                      />

                      {/* Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/65 pointer-events-none" />

                      {/* Centered play icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-black/60 transition-all duration-200">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Views at bottom */}
                      {viewsDisplay && (
                        <div className="absolute bottom-1.5 left-2 flex items-center gap-0.5 text-white">
                          <Eye className="w-2.5 h-2.5" />
                          <span className="text-[10px] font-semibold leading-none">{viewsDisplay}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userProducts.map(product => (
                <Link 
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group border border-border"
                >
                  <div className="aspect-square relative overflow-hidden">
                    {product.badge && (
                      <Badge className="absolute top-2 left-2 z-10 bg-error text-error-foreground">
                        {product.badge}
                      </Badge>
                    )}
                    <img loading="lazy"
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-foreground mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-lg text-foreground">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {savedPosts.length === 0 && savedLoops.length === 0 && savedProducts.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center border border-border">
                <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl text-foreground mb-2">No Saved Items</h3>
                <p className="text-muted-foreground mb-6">Save posts, loops, and products to view them here</p>
                <Link to="/">
                  <Button>Explore Content</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Saved Posts */}
                {savedPosts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Grid className="w-5 h-5" />
                      Saved Posts
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
                      {savedPosts.map(post => {
                        const imageUrl = post.content.images?.[0];
                        if (!imageUrl) return null;

                        return (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => setPostSheetPost(post)}
                            className="relative aspect-square rounded-2xl overflow-hidden group bg-muted w-full"
                          >
                            <img loading="lazy"
                              src={imageUrl}
                              alt={post.content.text || ''}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                              <Bookmark className="w-2.5 h-2.5 text-white fill-white" />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <div className="text-white flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <Heart className="w-5 h-5 fill-white" />
                                  <span className="text-sm font-semibold drop-shadow">{(post.likes / 1000).toFixed(1)}K</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MessageCircle className="w-5 h-5 fill-white" />
                                  <span className="text-sm font-semibold drop-shadow">{post.comments}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Saved Loops */}
                {savedLoops.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Saved Loops
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-1.5 lg:gap-2">
                      {savedLoops.map(loop => {
                        const imageUrl = loop.content.images?.[0] || loop.content.video;
                        if (!imageUrl) return null;
                        const viewsDisplay = loop.views
                          ? loop.views >= 1000 ? `${(loop.views / 1000).toFixed(1)}K` : String(loop.views)
                          : null;

                        return (
                          <button
                            key={loop.id}
                            type="button"
                            onClick={() => setLoopSheetLoop(loop)}
                            className="relative aspect-[9/16] rounded-xl sm:rounded-2xl overflow-hidden group bg-muted w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                          >
                            <img loading="lazy"
                              src={imageUrl}
                              alt={loop.content.text || ''}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/65 pointer-events-none" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-black/60 transition-all duration-200">
                                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                              <Bookmark className="w-2.5 h-2.5 text-white fill-white" />
                            </div>
                            {viewsDisplay && (
                              <div className="absolute bottom-1.5 left-2 flex items-center gap-0.5 text-white">
                                <Eye className="w-2.5 h-2.5" />
                                <span className="text-[10px] font-semibold leading-none">{viewsDisplay}</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Saved Products */}
                {savedProducts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Saved Products
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {savedProducts.map(product => (
                        <Link 
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group relative border border-border"
                        >
                          <div className="aspect-square relative overflow-hidden">
                            {product.badge && (
                              <Badge className="absolute top-2 left-2 z-10 bg-error">
                                {product.badge}
                              </Badge>
                            )}
                            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-10 shadow-sm">
                              <Bookmark className="w-3 h-3 text-white fill-white" />
                            </div>
                            <img loading="lazy" 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="text-foreground mb-2 line-clamp-2">{product.name}</h3>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-lg text-foreground">${product.price}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${product.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Post viewer sheet */}
      <Sheet open={!!postSheetPost} onOpenChange={open => { if (!open) setPostSheetPost(null); }}>
        <SheetContent side="bottom" className="h-[95dvh] p-0 overflow-hidden bg-background [&>button]:hidden">
          <VisuallyHidden><SheetTitle>Post</SheetTitle></VisuallyHidden>
          <VisuallyHidden><SheetDescription>View post details, like, comment and share</SheetDescription></VisuallyHidden>
          {postSheetPost && (
            <PostViewer post={postSheetPost} onClose={() => setPostSheetPost(null)} />
          )}
        </SheetContent>
      </Sheet>

      {/* Loop viewer sheet — opens when tapping a loop tile in the Loops grid */}
      <Sheet open={!!loopSheetLoop} onOpenChange={open => { if (!open) setLoopSheetLoop(null); }}>
        <SheetContent
          side="bottom"
          className="h-[100dvh] p-0 bg-black border-0 [&>button]:hidden"
        >
          <VisuallyHidden><SheetTitle>Loop</SheetTitle></VisuallyHidden>
          <VisuallyHidden><SheetDescription>Watch and interact with this Loop</SheetDescription></VisuallyHidden>
          {loopSheetLoop && (
            <LoopViewer
              loop={loopSheetLoop}
              onClose={() => setLoopSheetLoop(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}