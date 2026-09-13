import { SEO } from '../components/SEO';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  Heart, MessageCircle, Share2, BookmarkPlus, MoreVertical,
  Send, Smile, ArrowLeft, ShoppingBag, Star, Play, Image as ImageIcon, Repeat2
} from 'lucide-react';
import { getPostById } from '../data/posts';
import { getProductById } from '../data/products';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Skeleton } from '../components/ui/skeleton';
import { RepostSheet } from '../components/RepostSheet';
import { toast } from 'sonner';

// SKELETON FOR INSTANT UI
function PostDetailSkeleton() {
  return (<div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 min-h-screen">
          {/* Left - Image Skeleton */}
          <div className="lg:col-span-2 bg-muted lg:sticky lg:top-0 lg:h-screen">
            <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-screen flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          </div>
          {/* Right - Details Skeleton */}
          <div className="lg:col-span-1 bg-card">
            <div className="p-4 space-y-4">
              {/* Header Skeleton */}
              <div className="flex items-start gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              {/* Description Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              {/* Stats Skeleton */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              {/* Comments Skeleton */}
              <div className="space-y-4 pt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ✅ All useState hooks first
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isReposted, setIsReposted] = useState(() => {
    try {
      const saved = localStorage.getItem('ezyify_reposted_posts');
      return saved ? (JSON.parse(saved) as string[]).includes(id ?? '') : false;
    } catch { return false; }
  });
  const [repostSheetOpen, setRepostSheetOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);

  // PROGRESSIVE LOADING: Load post data after initial render
  const [pageData, setPageData] = useState<{
    post: any;
    taggedProducts: any[];
    mockComments: any[];
  } | null>(null);

  // Load post data progressively
  useEffect(() => {
    const loadPostData = () => {
      const post = getPostById(id || '');
      
      if (!post) {
        setPageData({ post: null, taggedProducts: [], mockComments: [] });
        return;
      }

      // Get tagged products
      const taggedProducts = post.taggedProducts 
        ? post.taggedProducts.map(pid => getProductById(pid)).filter(Boolean) 
        : [];

      // Mock comments
      const mockComments = [
        {
          id: '1',
          user: {
            username: 'sarah_j',
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1557353425-09253747c2bf?w=150&h=150&fit=crop&crop=face',
            verified: false
          },
          text: 'Love this! Where did you get that? 😍',
          likes: 45,
          timestamp: '2h ago',
        },
        {
          id: '2',
          user: {
            username: 'mike_style',
            name: 'Mike Stevens',
            avatar: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=150&h=150&fit=crop&crop=face',
            verified: true
          },
          text: 'Amazing! The quality looks great 🔥',
          likes: 32,
          timestamp: '3h ago',
        },
        {
          id: '3',
          user: {
            username: 'emma_wilson',
            name: 'Emma Wilson',
            avatar: 'https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?w=150&h=150&fit=crop&crop=face',
            verified: false
          },
          text: 'Just ordered mine! Can\'t wait 🛍️',
          likes: 18,
          timestamp: '5h ago',
        },
        {
          id: '4',
          user: {
            username: 'alex_photo',
            name: 'Alex Turner',
            avatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=150&h=150&fit=crop&crop=face',
            verified: true
          },
          text: 'Great content as always! Keep it up 👏',
          likes: 27,
          timestamp: '6h ago',
        },
      ];

      setPageData({ post, taggedProducts, mockComments });
      setComments(mockComments);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadPostData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadPostData, 16);
      return () => clearTimeout(timer);
    }
  }, [id]);

  // Show skeleton while loading
  if (!pageData) {
    return <PostDetailSkeleton />;
  }

  const { post, taggedProducts, mockComments } = pageData;

  // Show 404 if post not found
  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
      <SEO title="Post — Ezyify" description="Discover posts, loops, and shoppable content from creators on Ezyify." />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-foreground">Post Not Found</h2>
          <p className="text-muted-foreground mb-4">The post you are looking for does not exist.</p>
          <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const displayComments = showAllComments ? comments : comments.slice(0, 3);

  return (
    <>
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 min-h-screen">
          {/* Left/Top - Post Image/Video */}
          <div className="lg:col-span-2 bg-muted lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
            <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-20 w-10 h-10 bg-muted/50 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-muted/70 transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Post Type Badge */}
              {post.type === 'loop' && (
                <div className="absolute top-4 right-4 z-20 bg-primary/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-lg">
                  <Play className="w-4 h-4 fill-white" />
                  Loop
                </div>
              )}

              {/* Main Image/Video - with Loading State and Fallback */}
              {post.content.images && post.content.images[0] ? (
                <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
                  {/* Loading Skeleton */}
                  {!mainImageLoaded && !mainImageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground text-sm">Loading image...</p>
                      </div>
                    </div>
                  )}

                  {/* Error Fallback */}
                  {mainImageError && (
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <ImageIcon className="w-16 h-16" />
                      <p className="text-sm">Image unavailable</p>
                    </div>
                  )}

                  {/* Main Post Image — eager: primary foreground content */}
                  <img
                    src={post.content.images[0]}
                    alt={post.content.text || 'Post image'}
                    loading="eager"
                    className={`max-w-full max-h-full w-auto h-auto object-contain rounded-xl transition-opacity duration-300 ${
                      mainImageLoaded && !mainImageError ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      maxHeight: 'calc(100vh - 2rem)',
                    }}
                    onLoad={() => setMainImageLoaded(true)}
                    onError={() => {
                      setMainImageError(true);
                      setMainImageLoaded(true);
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <ImageIcon className="w-16 h-16" />
                  <p className="text-sm">No image available</p>
                </div>
              )}

              {/* Desktop Back Button */}
              <Link
                to="/"
                className="hidden lg:flex absolute top-4 left-4 z-20 w-10 h-10 bg-muted/50 backdrop-blur-md rounded-full items-center justify-center text-foreground hover:bg-muted/70 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right/Bottom - Post Details & Comments */}
          <div className="lg:col-span-1 bg-card lg:h-screen lg:overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Post Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <Link 
                    to={`/profile/${post.user.username}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    {/* User Avatar with Loading State */}
                    <div className="relative flex-shrink-0">
                      <img 
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-12 h-12 rounded-full object-cover bg-muted ring-2 ring-border"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect width="48" height="48" fill="%23666"/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-base text-foreground truncate">{post.user.name}</p>
                        {post.user.verified && (
                          <VerifiedBadge />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">@{post.user.username}</p>
                    </div>
                  </Link>
                  
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {!isFollowing && (
                      <button
                        onClick={() => setIsFollowing(true)}
                        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all"
                      >
                        Follow
                      </button>
                    )}
                    <button className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                      <MoreVertical className="w-5 h-5 text-foreground" />
                    </button>
                  </div>
                </div>

                {/* Post Description */}
                {post.content.text && (
                  <p className="text-sm sm:text-base mb-3 leading-relaxed text-foreground">
                    {post.content.text}
                  </p>
                )}

                {/* Post Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
                  <span>{post.likes.toLocaleString()} likes</span>
                  <span>{post.comments} comments</span>
                  <span>{post.shares} shares</span>
                  {post.views && <span>{post.views.toLocaleString()} views</span>}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 sm:gap-5 border-t border-b border-border">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center gap-1.5 py-2.5 px-2 hover:scale-110 transition-transform"
                    aria-label={isLiked ? 'Unlike post' : 'Like post'}
                    aria-pressed={isLiked}
                  >
                    <Heart className={`w-6 h-6 ${isLiked || post.isLiked ? 'fill-like text-like' : 'text-foreground'}`} />
                    <span className="text-sm text-muted-foreground tabular-nums">{post.likes?.toLocaleString()}</span>
                  </button>

                  <button
                    className="flex items-center gap-1.5 py-2.5 px-2 hover:scale-110 transition-transform text-foreground"
                    aria-label="Comment"
                    onClick={() => document.getElementById('comment-input-detail')?.focus()}
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm text-muted-foreground tabular-nums">{post.comments}</span>
                  </button>

                  <button
                    onClick={() => setRepostSheetOpen(true)}
                    className={`flex items-center gap-1.5 py-2.5 px-2 hover:scale-110 transition-transform ${isReposted ? 'text-emerald-500' : 'text-foreground'}`}
                    aria-label={isReposted ? 'Undo repost' : 'Repost'}
                    aria-pressed={isReposted}
                  >
                    <Repeat2 className="w-6 h-6" />
                    <span className="text-sm text-muted-foreground tabular-nums">{Math.round((post.shares ?? 0) * 0.4) + (isReposted ? 1 : 0)}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: post.content?.text ?? 'Check this on Ezyify', url: window.location.href }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href).catch(() => {});
                        toast.success('Link copied!');
                      }
                    }}
                    className="flex items-center gap-1.5 py-2.5 px-2 hover:scale-110 transition-transform text-foreground"
                    aria-label="Share"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className="flex items-center gap-1.5 py-2.5 px-2 hover:scale-110 transition-transform ml-auto"
                    aria-label={isSaved ? 'Unsave post' : 'Save post'}
                    aria-pressed={isSaved}
                  >
                    <BookmarkPlus className={`w-6 h-6 ${isSaved || post.isSaved ? 'fill-primary text-primary' : 'text-foreground'}`} />
                  </button>
                </div>
              </div>

              {/* Tagged Products */}
              {taggedProducts.length > 0 && (
                <div className="p-4 bg-muted/50 border-b border-border">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-foreground">
                    <ShoppingBag className="w-4 h-4" />
                    Tagged Products
                  </h3>
                  <div className="space-y-3">
                    {taggedProducts.map(product => {
                      if (!product) return null;
                      return (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-card/80 transition-colors group"
                        >
                          {/* Product Image with Fixed Aspect Ratio */}
                          <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-muted">
                            <img 
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23888"/%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-base font-bold text-primary">
                                ${product.price}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-primary text-primary" />
                                <span className="text-xs text-muted-foreground">{product.rating}</span>
                              </div>
                            </div>
                          </div>
                          <ShoppingBag className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="font-bold mb-4 text-foreground">Comments ({post.comments})</h3>
                
                <div className="space-y-4 mb-4">
                  {displayComments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <Link to={`/profile/${comment.user.username}`} className="flex-shrink-0">
                        {/* Comment User Avatar with Fixed Size */}
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted ring-1 ring-border">
                          <img 
                            src={comment.user.avatar}
                            alt={comment.user.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Crect width="36" height="36" fill="%23666"/%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="bg-muted/70 rounded-2xl px-4 py-2">
                          <Link 
                            to={`/profile/${comment.user.username}`}
                            className="flex items-center gap-1 mb-1"
                          >
                            <span className="font-medium text-sm text-foreground truncate">{comment.user.name}</span>
                            {comment.user.verified && (
                              <VerifiedBadge />
                            )}
                          </Link>
                          <p className="text-sm text-foreground break-words">{comment.text}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 px-4">
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                          <button className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                            {comment.likes} likes
                          </button>
                          <button className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!showAllComments && comments.length > 3 && (
                  <button
                    onClick={() => setShowAllComments(true)}
                    className="text-sm text-muted-foreground hover:text-foreground font-medium mb-4 transition-colors"
                  >
                    View all {comments.length} comments
                  </button>
                )}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-border bg-card sticky bottom-0" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (comment.trim()) {
                      setComments(prev => [...prev, {
                        id: Date.now().toString(),
                        user: { username: 'you', name: 'You', avatar: 'https://images.unsplash.com/photo-1758521541720-1809f58388c2?w=50', verified: false },
                        text: comment.trim(),
                        likes: 0,
                        timestamp: 'just now',
                      }]);
                      setComment('');
                      if (!showAllComments) setShowAllComments(true);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <button 
                    type="button"
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
                    aria-label="Add emoji"
                  >
                    <Smile className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <input
                    id="comment-input-detail"
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 bg-muted text-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-muted-foreground min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex-shrink-0 ${
                      comment.trim()
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {pageData?.post && (
      <RepostSheet
        open={repostSheetOpen}
        onOpenChange={setRepostSheetOpen}
        post={pageData.post}
        isReposted={isReposted}
        onRepost={(quoteText) => {
          const postId = pageData!.post.id;
          try {
            const saved = localStorage.getItem('ezyify_reposted_posts');
            const list: string[] = saved ? JSON.parse(saved) : [];
            if (!list.includes(postId)) list.push(postId);
            localStorage.setItem('ezyify_reposted_posts', JSON.stringify(list));
          } catch {}
          setIsReposted(true);
          toast.success(quoteText ? 'Quote reposted to your followers!' : 'Reposted to your followers!');
        }}
        onUndoRepost={() => {
          const postId = pageData!.post.id;
          try {
            const saved = localStorage.getItem('ezyify_reposted_posts');
            const list: string[] = saved ? JSON.parse(saved) : [];
            localStorage.setItem('ezyify_reposted_posts', JSON.stringify(list.filter(i => i !== postId)));
          } catch {}
          setIsReposted(false);
          toast.success('Repost removed');
        }}
      />
    )}
    </>
  );
}