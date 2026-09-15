import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import {
  Heart,
  MessageCircle,
  Pin,
  Send,
  Share2,
  ShoppingBag,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ApiError,
  avatarUrlFor,
  formatCompactNumber,
  formatMoney,
  formatRelativeTime,
  formatTimeUntil,
  queryKeys,
  useApi,
  useAuth,
  useLiveHeartbeat,
  useLiveSession,
  type ProductDetail,
} from '@ezyify/core';
import { toast } from 'sonner';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { SEO } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { EmptyState } from '../components/primitives/EmptyState';
import { Img } from '../components/primitives/Img';
import { Skeleton } from '../components/primitives/Skeleton';
import { useAddLine } from '../lib/data';
import { formErrors } from '../lib/apiErrors';
import { useLiveReminders } from '../lib/reminders';

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  system?: boolean;
}
interface FloatingHeart {
  id: number;
  x: number;
}

const seedChat: ChatMessage[] = [
  { id: 1, user: 'Sarah123', message: 'Love this drop!' },
  { id: 2, user: 'Mike_Chen', message: 'Can you show that one again?' },
  { id: 3, user: 'Ezyify', message: 'Every purchase is escrow-protected.', system: true },
];
const mockReplies = [
  'That looks great!',
  'Just added it to my cart.',
  'Will there be more colours?',
  'The details are so helpful.',
];

function LiveSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4" aria-busy>
      <div className="mx-auto max-w-6xl">
        <Skeleton className="aspect-video w-full rounded-card" />
      </div>
    </div>
  );
}

function ProductRow({
  product,
  pinned,
  onAdd,
}: {
  product: ProductDetail;
  pinned: boolean;
  onAdd: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-card p-2.5">
      <Link
        to={`/product/${product.id}`}
        className="size-16 shrink-0 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <Img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        {pinned && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Pin className="size-3" aria-hidden />
            Pinned
          </span>
        )}
        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{formatMoney(product.price)}</p>
      </div>
      <Button
        size="sm"
        variant="accent"
        aria-label={`Buy ${product.name}`}
        onClick={() => onAdd(product.id)}
      >
        Buy
      </Button>
    </div>
  );
}

function Products({
  products,
  pinnedProductId,
  onAdd,
  tone = 'dark',
}: {
  products: ProductDetail[];
  pinnedProductId: string | null;
  onAdd: (id: string) => void;
  tone?: 'dark' | 'light';
}) {
  const ordered = useMemo(
    () =>
      [...products].sort(
        (a, b) => Number(b.id === pinnedProductId) - Number(a.id === pinnedProductId),
      ),
    [products, pinnedProductId],
  );
  if (!ordered.length)
    return (
      <p className="text-sm text-foreground-secondary">
        Products will appear here when the host adds them.
      </p>
    );
  if (tone === 'dark')
    return (
      <div className="space-y-2">
        {ordered.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            pinned={product.id === pinnedProductId}
            onAdd={onAdd}
          />
        ))}
      </div>
    );
  return (
    <div className="space-y-2">
      {ordered.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-3 rounded-card border border-border bg-card p-2.5"
        >
          <Link
            to={`/product/${product.id}`}
            className="size-16 shrink-0 overflow-hidden rounded-xl"
          >
            <Img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
          </Link>
          <div className="min-w-0 flex-1">
            {product.id === pinnedProductId && (
              <span className="text-xs font-semibold text-primary">Pinned</span>
            )}
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="text-sm font-semibold">{formatMoney(product.price)}</p>
          </div>
          <Button
            size="sm"
            variant="accent"
            aria-label={`Buy ${product.name}`}
            onClick={() => onAdd(product.id)}
          >
            Buy
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function LivePage() {
  const { id } = useParams();
  const api = useApi();
  const authed = useAuth((state) => state.status === 'authenticated');
  const sessionQuery = useLiveSession(id);
  const session = sessionQuery.data;
  const productIds = session?.productIds ?? [];
  const productQueries = useQueries({
    queries: productIds.map((productId) => ({
      queryKey: queryKeys.product(productId),
      queryFn: () => api.catalog.product(productId),
      staleTime: 60_000,
    })),
  });
  const products = useMemo(
    () => productQueries.flatMap((query) => (query.data ? [query.data] : [])),
    [productQueries],
  );
  const {
    viewers: heartbeatViewers,
    likes: heartbeatLikes,
    like,
  } = useLiveHeartbeat(id, session?.status === 'live');
  const { add, pending: cartPending } = useAddLine();
  const reminders = useLiveReminders();
  const [muted, setMuted] = useState(true);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>(seedChat);
  const [message, setMessage] = useState('');
  const [tokenState, setTokenState] = useState<
    'idle' | 'loading' | 'connected' | 'unavailable' | 'error'
  >('idle');
  const heartId = useRef(0);
  const warnedUnauthed = useRef(false);
  const isMock = import.meta.env.VITE_API_MODE === 'mock';

  useEffect(() => {
    if (!session || !authed || session.status !== 'live') {
      setTokenState('idle');
      return;
    }
    let active = true;
    setTokenState('loading');
    void api.live.token({ room: session.room, role: 'viewer' }).then(
      () => {
        if (active) setTokenState('connected');
      },
      (error) => {
        if (!active) return;
        const unavailable = error instanceof ApiError && error.details?.code === 'LIVE_UNAVAILABLE';
        setTokenState(unavailable ? 'unavailable' : 'error');
        if (!unavailable)
          toast.error(
            formErrors(error, 'Couldn’t connect to the stream.').message ??
              'Couldn’t connect to the stream.',
          );
      },
    );
    return () => {
      active = false;
    };
  }, [api, authed, session]);

  useEffect(() => {
    if (!isMock || session?.status !== 'live') return;
    const interval = window.setInterval(
      () =>
        setChat((current) => [
          ...current.slice(-19),
          {
            id: Date.now(),
            user: ['Lina', 'Andre', 'Kei'][Math.floor(Math.random() * 3)]!,
            message: mockReplies[Math.floor(Math.random() * mockReplies.length)]!,
          },
        ]),
      7_000,
    );
    return () => window.clearInterval(interval);
  }, [isMock, session?.status]);

  const addToCart = async (productId: string) => {
    try {
      await add(productId);
      toast.success('Added to cart');
    } catch (error) {
      toast.error(
        formErrors(error, 'Couldn’t add this item.').message ?? 'Couldn’t add this item.',
      );
    }
  };
  const toggleReminder = async () => {
    if (!session) return;
    const added = await reminders.toggle({
      id: session.id,
      title: session.title,
      at: session.scheduledFor,
    });
    toast.success(added ? 'Reminder set' : 'Reminder removed');
  };
  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;
    setChat((current) => [...current, { id: Date.now(), user: 'You', message: text }]);
    setMessage('');
  };
  const addHeart = () => {
    const next = { id: ++heartId.current, x: 22 + Math.round(Math.random() * 56) };
    setHearts((current) => [...current, next]);
    window.setTimeout(
      () => setHearts((current) => current.filter((heart) => heart.id !== next.id)),
      1300,
    );
    if (!authed) {
      if (!warnedUnauthed.current) {
        toast.info('Sign in to like');
        warnedUnauthed.current = true;
      }
      return;
    }
    void like();
  };
  const share = async () => {
    const url = `${window.location.origin}/live/${id}`;
    try {
      if (navigator.share)
        await navigator.share({ title: session?.title ?? 'Live shopping on Ezyify', url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Live link copied');
      }
    } catch {
      /* share dismissed */
    }
  };

  if (sessionQuery.isLoading) return <LiveSkeleton />;
  if (sessionQuery.isError) {
    const notFound =
      sessionQuery.error instanceof ApiError && sessionQuery.error.code === 'NOT_FOUND';
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <SEO
          title={notFound ? 'Live stream unavailable' : 'Live shopping unavailable'}
          description="This live stream could not be loaded."
        />
        <EmptyState
          kind="error"
          title={notFound ? 'Live stream not found' : 'Couldn’t load this live stream'}
          description={
            notFound
              ? 'It may have ended or the link is incorrect.'
              : 'Check your connection and try again.'
          }
          action={
            notFound ? (
              <Button asChild>
                <Link to="/live-shopping">Browse live shopping</Link>
              </Button>
            ) : (
              <Button onClick={() => void sessionQuery.refetch()}>Retry</Button>
            )
          }
        />
      </main>
    );
  }
  if (!session)
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <SEO title="Live stream unavailable" description="This live stream could not be found." />
        <EmptyState
          kind="error"
          title="Live stream not found"
          description="It may have ended or the link is incorrect."
          action={
            <Button asChild>
              <Link to="/live-shopping">Browse live shopping</Link>
            </Button>
          }
        />
      </main>
    );

  const productLoading = productIds.length > 0 && productQueries.some((query) => query.isLoading);
  const poster = session.coverUrl ?? products[0]?.imageUrl;
  const viewers = heartbeatViewers ?? session.viewers;
  const likes = heartbeatLikes ?? session.likes;
  const hostLink = (
    <Link
      to={`/profile/${session.host.username}`}
      className="inline-flex items-center gap-2 rounded-full bg-white/15 py-1.5 pl-1.5 pr-3 text-sm font-medium text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <Img src={avatarUrlFor(session.host)} alt="" className="size-8 rounded-full object-cover" />
      <span>
        {session.host.name} <span className="text-white/70">@{session.host.username}</span>
      </span>
      {session.host.verified && <VerifiedBadge size="sm" />}
    </Link>
  );

  if (session.status === 'scheduled') {
    return (
      <main className="min-h-screen bg-background">
        <SEO
          title={`${session.title} — Live shopping`}
          description={`Upcoming live shopping stream from ${session.host.name}.`}
        />
        <section className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          <div className="overflow-hidden rounded-sheet border border-border bg-card">
            <div className="relative aspect-video bg-muted">
              <Img src={poster} alt={session.title} className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-sm font-semibold text-white/85">UPCOMING LIVE</p>
                <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                  {session.title}
                </h1>
                <p className="mt-2 text-sm text-white/85">
                  Starts {session.scheduledFor ? formatTimeUntil(session.scheduledFor) : 'soon'} · @
                  {session.host.username}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-2">
                <Img
                  src={avatarUrlFor(session.host)}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
                <Link
                  to={`/profile/${session.host.username}`}
                  className="font-semibold hover:text-primary"
                >
                  {session.host.name}
                </Link>
                {session.host.verified && <VerifiedBadge size="sm" />}
              </div>
              <Button
                variant={reminders.has(session.id) ? 'primary' : 'outline'}
                aria-pressed={reminders.has(session.id)}
                onClick={() => void toggleReminder()}
              >
                {reminders.has(session.id) ? 'Reminding' : 'Remind me'}
              </Button>
            </div>
          </div>
          <section className="mt-8">
            <h2 className="mb-3 font-display text-xl font-semibold">Shop the upcoming stream</h2>
            {productLoading ? (
              <Skeleton className="h-28 w-full rounded-card" />
            ) : (
              <Products
                products={products}
                pinnedProductId={session.pinnedProductId}
                onAdd={addToCart}
                tone="light"
              />
            )}
          </section>
        </section>
      </main>
    );
  }

  if (session.status === 'ended') {
    return (
      <main className="min-h-screen bg-background">
        <SEO
          title={`${session.title} — Live shopping`}
          description={`A completed live shopping stream from ${session.host.name}.`}
        />
        <section className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          <EmptyState
            kind="feed"
            title="This stream has ended"
            description="The host’s products are still available to shop."
            action={
              <Button asChild>
                <Link to={`/profile/${session.host.username}`}>Visit {session.host.name}</Link>
              </Button>
            }
          />
          <section className="mt-2">
            <h2 className="mb-3 font-display text-xl font-semibold">Shop this stream</h2>
            {productLoading ? (
              <Skeleton className="h-28 w-full rounded-card" />
            ) : (
              <Products
                products={products}
                pinnedProductId={session.pinnedProductId}
                onAdd={addToCart}
                tone="light"
              />
            )}
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${session.title} — Live shopping`}
        description={`Watch ${session.host.name} live on Ezyify.`}
        image={poster}
      />
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="relative min-h-[68dvh] overflow-hidden bg-background lg:min-h-screen">
          <Img
            src={poster}
            alt={`${session.title} live stream`}
            className="absolute inset-0 size-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-[var(--background-overlay)]" />
          <div className="relative flex min-h-[68dvh] flex-col justify-between p-4 text-white sm:p-6 lg:min-h-screen">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
                  LIVE
                </span>
                <p className="mt-3 text-sm text-white/80">
                  Started {session.startedAt ? formatRelativeTime(session.startedAt) : 'now'} ago
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label={muted ? 'Unmute stream' : 'Mute stream'}
                  onClick={() => setMuted((value) => !value)}
                  className="grid size-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
                >
                  <>
                    {muted ? (
                      <VolumeX className="size-5" aria-hidden />
                    ) : (
                      <Volume2 className="size-5" aria-hidden />
                    )}
                  </>
                </button>
                <button
                  type="button"
                  aria-label="Share live stream"
                  onClick={() => void share()}
                  className="grid size-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
                >
                  <Share2 className="size-5" aria-hidden />
                </button>
              </div>
            </div>
            <div className="max-w-xl">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{session.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {hostLink}
                <span className="inline-flex items-center gap-1 text-sm text-white/85">
                  <Users className="size-4" aria-hidden />
                  {formatCompactNumber(viewers)}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-white/85">
                  <Heart className="size-4" aria-hidden />
                  {formatCompactNumber(likes)}
                </span>
                {tokenState === 'connected' && (
                  <span className="rounded-full bg-success/90 px-2.5 py-1 text-xs font-semibold text-success-foreground">
                    Connected
                  </span>
                )}
                {tokenState === 'unavailable' && (
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
                    Video unavailable in this environment
                  </span>
                )}
              </div>
            </div>
            <div className="absolute bottom-24 right-5 flex flex-col items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  aria-label="Like live stream"
                  onClick={addHeart}
                  className="grid size-12 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-lg hover:brightness-110"
                >
                  <Heart className="size-6" aria-hidden />
                </button>
                {hearts.map((heart) => (
                  <Heart
                    key={heart.id}
                    aria-hidden
                    className="pointer-events-none absolute bottom-8 size-6 animate-bounce fill-destructive text-destructive"
                    style={{ left: `${heart.x - 50}%` }}
                  />
                ))}
              </div>
              <Button asChild size="md" variant="accent">
                <a href="#stream-products">
                  <ShoppingBag className="size-5" aria-hidden />
                  Shop
                </a>
              </Button>
            </div>
          </div>
        </section>
        <aside className="flex min-h-0 flex-col border-t border-border bg-background lg:border-l lg:border-t-0">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Live chat</h2>
              <MessageCircle className="size-5 text-foreground-secondary" aria-hidden />
            </div>
            {!isMock && (
              <p className="mt-1 text-sm text-foreground-secondary">
                Chat connects when the stream starts.
              </p>
            )}
          </div>
          <div className="min-h-44 flex-1 space-y-3 overflow-y-auto p-4">
            {isMock ? (
              chat.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.system
                      ? 'rounded-full bg-muted px-3 py-1.5 text-xs text-foreground-secondary'
                      : 'text-sm'
                  }
                >
                  {item.system ? (
                    item.message
                  ) : (
                    <>
                      <span className="mr-2 font-semibold text-foreground-secondary">
                        {item.user}
                      </span>
                      {item.message}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-card border border-border p-4 text-sm text-foreground-secondary">
                Chat connects when the stream starts.
              </div>
            )}
          </div>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              aria-label="Chat message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={isMock ? 'Say something…' : 'Chat unavailable'}
              disabled={!isMock}
              className="h-11 min-w-0 flex-1 rounded-xl border border-input-border bg-input-background px-3 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed"
            />
            <button
              aria-label="Send chat message"
              disabled={!isMock || !message.trim()}
              className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Send className="size-5" aria-hidden />
            </button>
          </form>
          <div id="stream-products" className="border-t border-border p-4">
            <h2 className="mb-3 font-display text-lg font-semibold">Shop this stream</h2>
            {productLoading ? (
              <Skeleton className="h-24 w-full rounded-card" />
            ) : (
              <Products
                products={products}
                pinnedProductId={session.pinnedProductId}
                onAdd={addToCart}
              />
            )}
            {cartPending && (
              <p className="mt-2 text-xs text-foreground-secondary">Adding to cart…</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
