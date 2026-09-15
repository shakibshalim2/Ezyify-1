import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Play, Share2, Edit, MessageCircle, MapPin, Calendar, Link as LinkIcon, Bookmark, Package, Settings, Ban, Flag, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import {
  avatarUrlFor, flattenPages, formatCompactNumber, useAuth, useBlockUser, useBlockedUsers, useFeed, useLoops, useMe, useProducts, useProfile, useSavedPosts, useToggleFollow,
  type Post, type UserProfile,
} from '@ezyify/core';
import { SEO } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { Skeleton } from '../components/primitives/Skeleton';
import { EmptyState } from '../components/primitives/EmptyState';
import { Img } from '../components/primitives/Img';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { ProductCard } from '../components/shop/ProductCard';
import { EmptyPosts, EmptyContent, EmptyProducts } from '../components/EmptyStates';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { fadeUp, staggerContainer, DURATION } from '../lib/motion';
import { formErrors } from '../lib/apiErrors';

type Tab = 'posts' | 'loops' | 'products' | 'saved';

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0" aria-busy>
      <Skeleton className="h-48 lg:h-72 w-full" />
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        <div className="relative -mt-16 lg:-mt-24 mb-6 flex flex-col gap-4">
          <div className="flex gap-4">
            <Skeleton className="size-32 lg:size-40 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full max-w-sm" />
            </div>
          </div>
          <div className="flex gap-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-20" />)}</div>
        </div>
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid grid-cols-3 gap-2 lg:gap-4">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="aspect-square rounded-card" />)}</div>
      </div>
    </div>
  );
}

function MediaGrid({ posts, aspect, empty }: { posts: Post[]; aspect: 'square' | 'tall'; empty: React.ReactNode }) {
  if (posts.length === 0) return <>{empty}</>;
  return (
    <div className="grid grid-cols-3 gap-2 lg:gap-4">
      {posts.map(post => {
        const m = post.media[0]!;
        return (
          <motion.div key={post.id} variants={fadeUp}>
            <Link
              to={post.kind === 'loop' ? `/loops?start=${post.id}` : `/post/${post.id}`}
              className={`group relative block ${aspect === 'tall' ? 'aspect-[9/16]' : 'aspect-square'} rounded-card overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring`}
              aria-label={post.caption ? `${post.kind === 'loop' ? 'Loop' : 'Post'}: ${post.caption.slice(0, 80)}` : `Open ${post.kind}`}
            >
              <Img src={m.thumbnailUrl ?? m.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              {post.kind === 'loop' && (
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="size-10 text-white drop-shadow-lg" aria-hidden />
                </span>
              )}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Profile on the real API: `/users/me` or `/users/:username`, feed/loops/products filtered by author, saved for self. */
export default function ProfilePage() {
  const { username: param } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const authUser = useAuth(s => s.user);
  const authed = useAuth(s => s.status === 'authenticated');
  const isMe = !param || param === 'me' || (!!authUser && param === authUser.username);
  const username = isMe ? authUser?.username : param;

  const me = useMe();
  const other = useProfile(isMe ? undefined : username);
  const profile = isMe ? me : other;
  const user: UserProfile | undefined = profile.data;

  const [tab, setTab] = useState<Tab>('posts');
  const posts = useFeed(username ? { author: username, kind: 'post' } : {});
  const loops = useLoops(username ? { author: username } : {});
  const shop = useProducts(username ? { seller: username, pageSize: 24 } : {});
  const saved = useSavedPosts();
  const follow = useToggleFollow();
  const block = useBlockUser();
  const blocked = useBlockedUsers();
  const isBlocked = !!user && (blocked.data ?? []).some(b => b.id === user.id);

  if (isMe && !authed) {
    navigate('/login', { replace: true, state: { next: '/profile/me' } });
    return null;
  }
  if (profile.isLoading || (!user && !profile.isError)) return <ProfileSkeleton />;
  if (profile.isError || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <EmptyState kind="search" title="Profile not found" description="This account may have been removed or the link is wrong." action={<Button asChild><Link to="/explore">Explore creators</Link></Button>} />
      </div>
    );
  }

  const postItems = flattenPages(posts.data);
  const loopItems = flattenPages(loops.data);
  const productItems = flattenPages(shop.data);
  const savedItems = isMe ? flattenPages(saved.data) : [];
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const onFollow = () => {
    if (!authed) return navigate('/login', { state: { next: `/profile/${user.username}` } });
    follow.mutate({ username: user.username, following: !!user.isFollowing }, { onError: e => toast.error(formErrors(e).message ?? 'Couldn’t update follow') });
  };
  const onShare = async () => {
    const url = `${window.location.origin}/profile/${user.username}`;
    try {
      if (navigator.share) await navigator.share({ title: `${user.name} on Ezyify`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Profile link copied');
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };
  const onBlock = () => {
    if (!authed) return navigate('/login');
    block.mutate({ userId: user.id, blocked: isBlocked }, {
      onSuccess: () => toast.success(isBlocked ? `Unblocked @${user.username}` : `Blocked @${user.username}`, { description: isBlocked ? undefined : 'They can no longer see your content or message you.' }),
      onError: e => toast.error(formErrors(e).message ?? 'Couldn’t update block'),
    });
  };

  const tabs: { id: Tab; label: string; icon: typeof Play | null; count: number }[] = [
    { id: 'posts', label: 'Posts', icon: null, count: postItems.length },
    { id: 'loops', label: 'Loops', icon: Play, count: loopItems.length },
    { id: 'products', label: 'Products', icon: Package, count: productItems.length },
    ...(isMe ? [{ id: 'saved' as Tab, label: 'Saved', icon: Bookmark, count: savedItems.length }] : []),
  ];

  const content = () => {
    switch (tab) {
      case 'posts':
        return posts.isLoading ? <Skeleton className="h-64 w-full rounded-card" /> : <MediaGrid posts={postItems} aspect="square" empty={<EmptyPosts />} />;
      case 'loops':
        return loops.isLoading ? <Skeleton className="h-64 w-full rounded-card" /> : <MediaGrid posts={loopItems} aspect="tall" empty={<EmptyContent />} />;
      case 'products':
        if (shop.isLoading) return <Skeleton className="h-64 w-full rounded-card" />;
        return productItems.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {productItems.map(p => (
              <motion.div key={p.id} variants={fadeUp}><ProductCard product={p} /></motion.div>
            ))}
          </div>
        ) : <EmptyProducts />;
      case 'saved':
        return saved.isLoading ? <Skeleton className="h-64 w-full rounded-card" /> : <MediaGrid posts={savedItems} aspect="square" empty={<EmptyState kind="wishlist" title="Nothing saved yet" description="Tap the bookmark on any post to keep it here." />} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SEO title={`${user.name} (@${user.username})`} description={user.bio ?? `${user.name} on Ezyify`} type="profile" noindex={isMe} />

      <div className="relative h-48 lg:h-72 w-full overflow-hidden bg-brand-gradient">
        {user.coverUrl && <Img src={user.coverUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="relative -mt-16 lg:-mt-24 mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <motion.div variants={fadeUp}>
                <div className="size-32 lg:size-40 rounded-full ring-4 ring-card bg-card overflow-hidden flex-shrink-0">
                  <Img src={avatarUrlFor(user, 320)} alt={user.name} className="w-full h-full object-cover" width={160} height={160} />
                </div>
              </motion.div>
              <motion.div variants={fadeUp} className="flex-1 pt-4 lg:pt-8 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground truncate">{user.name}</h1>
                  {user.verified && <VerifiedBadge size="lg" />}
                </div>
                <p className="text-foreground-secondary mb-3">@{user.username}</p>
                {user.bio && <p className="text-foreground text-sm lg:text-base mb-4 max-w-sm line-clamp-3">{user.bio}</p>}
                {(user.location || user.website) && (
                  <div className="flex flex-col gap-1 text-xs text-foreground-secondary">
                    {user.location && <div className="flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{user.location}</div>}
                    {user.website && (
                      <div className="flex items-center gap-1.5">
                        <LinkIcon className="size-4" aria-hidden />
                        <a href={user.website} target="_blank" rel="noopener noreferrer nofollow" className="text-primary hover:underline truncate">
                          {user.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="flex gap-6">
              <div className="text-center px-3 py-1">
                <div className="font-display font-bold text-lg tabular-nums text-foreground">{formatCompactNumber(user.posts)}</div>
                <div className="text-xs text-foreground-secondary">Posts</div>
              </div>
              <Link to={`/profile/${user.username}/followers`} className="text-center focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-3 py-1">
                <div className="font-display font-bold text-lg tabular-nums text-foreground">{formatCompactNumber(user.followers)}</div>
                <div className="text-xs text-foreground-secondary">Followers</div>
              </Link>
              <Link to={`/profile/${user.username}/following`} className="text-center focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-3 py-1">
                <div className="font-display font-bold text-lg tabular-nums text-foreground">{formatCompactNumber(user.following)}</div>
                <div className="text-xs text-foreground-secondary">Following</div>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-2 text-xs text-foreground-secondary">
              <Calendar className="size-4" aria-hidden />
              Joined {joined}
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8 flex gap-2 flex-wrap items-center">
          {isMe ? (
            <>
              <Button variant="outline" size="md" asChild>
                <Link to="/profile/edit"><Edit className="size-5" aria-hidden />Edit profile</Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Settings" asChild>
                <Link to="/settings"><Settings className="size-5" /></Link>
              </Button>
              {(user.role === 'creator' || user.role === 'seller') && (
                <Button variant="link" asChild>
                  <Link to={user.role === 'seller' ? '/seller-dashboard' : '/creator-dashboard'}>{user.role === 'seller' ? 'Seller hub' : 'Creator dashboard'}</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant={user.isFollowing ? 'secondary' : 'primary'} size="md" onClick={onFollow} loading={follow.isPending} aria-pressed={!!user.isFollowing}>
                {user.isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant="outline" size="md" asChild>
                <Link to={authed ? `/messages?with=${encodeURIComponent(user.username)}` : '/login'}><MessageCircle className="size-5" aria-hidden />Message</Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Share profile" onClick={onShare}>
                <Share2 className="size-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="More options"><MoreHorizontal className="size-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => navigate(`/report-problem?type=user&id=${encodeURIComponent(user.id)}`)}>
                    <Flag className="size-4" aria-hidden /> Report @{user.username}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onBlock} className={isBlocked ? '' : 'text-error focus:text-error'}>
                    <Ban className="size-4" aria-hidden /> {isBlocked ? 'Unblock' : 'Block'} @{user.username}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </motion.div>

        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm -mx-4 lg:-mx-6 mb-8 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div role="tablist" aria-label="Profile sections" className="flex gap-6 overflow-x-auto">
              {tabs.map(t => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative py-4 text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'text-foreground' : 'text-foreground-secondary hover:text-foreground'}`}
                >
                  <span className="flex items-center gap-1.5">
                    {t.icon && <t.icon className="size-4" aria-hidden />}
                    {t.label}
                    {t.count > 0 && <span className="text-xs text-foreground-tertiary">{t.count}</span>}
                  </span>
                  {tab === t.id && <motion.div layoutId="profile-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" transition={{ duration: DURATION.fast }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" key={tab} role="tabpanel">
          {content()}
        </motion.div>

        {user.role === 'seller' && !isMe && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-12">
            <Card variant="featured" className="p-6">
              <h3 className="font-display font-bold text-lg mb-2">{user.name}’s store</h3>
              <p className="text-foreground-secondary text-sm mb-4">Escrow‑protected checkout on every order.</p>
              <Button asChild variant="primary" size="md"><Link to={`/seller/${user.username}`}>Visit store</Link></Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
