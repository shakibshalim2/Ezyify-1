import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Heart, MessageCircle, ShoppingBag, UserPlus, Video, Package, TrendingUp, Repeat2, Bell, CheckCheck } from 'lucide-react';
import { avatarUrlFor, formatTimeAgo, useAuth, useMarkNotificationsRead, useNotifications, useUnreadCount, type Notification } from '@ezyify/core';
import { Button } from '../components/primitives/Button';
import { Img } from '../components/primitives/Img';
import { Skeleton } from '../components/primitives/Skeleton';
import { EmptyState } from '../components/primitives/EmptyState';
import { EmptyNotifications } from '../components/EmptyStates';
import { SEO, SEOConfigs } from '../components/SEO';
import { useInfiniteList } from '../lib/data';
import { formErrors } from '../lib/apiErrors';
import { fadeUp, staggerContainer } from '../lib/motion';
import { cn } from '../components/ui/utils';

type FilterTab = 'all' | 'orders' | 'social' | 'live' | 'system';
const FILTERS: { key: FilterTab; label: string; types: Notification['type'][] | null }[] = [
  { key: 'all', label: 'All', types: null },
  { key: 'orders', label: 'Orders', types: ['order', 'purchase'] },
  { key: 'social', label: 'Social', types: ['like', 'comment', 'follow', 'repost'] },
  { key: 'live', label: 'Live', types: ['live'] },
  { key: 'system', label: 'System', types: ['system', 'trending'] },
];

const TYPE_ICON: Record<Notification['type'], { icon: ReactNode; className: string }> = {
  like: { icon: <Heart className="size-5" />, className: 'bg-primary-subtle text-primary' },
  comment: { icon: <MessageCircle className="size-5" />, className: 'bg-primary-subtle text-primary' },
  follow: { icon: <UserPlus className="size-5" />, className: 'bg-primary-subtle text-primary' },
  repost: { icon: <Repeat2 className="size-5" />, className: 'bg-primary-subtle text-primary' },
  purchase: { icon: <ShoppingBag className="size-5" />, className: 'bg-accent-brand-subtle text-accent-brand' },
  order: { icon: <Package className="size-5" />, className: 'bg-accent-brand-subtle text-accent-brand' },
  live: { icon: <Video className="size-5" />, className: 'bg-error-subtle text-error' },
  trending: { icon: <TrendingUp className="size-5" />, className: 'bg-success-subtle text-success' },
  system: { icon: <Bell className="size-5" />, className: 'bg-muted text-foreground-secondary' },
};

const DAY = 86_400_000;
type Bucket = 'Today' | 'Yesterday' | 'This week' | 'Earlier';
const BUCKETS: Bucket[] = ['Today', 'Yesterday', 'This week', 'Earlier'];
function bucketOf(iso: string, now: number): Bucket {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const t = new Date(iso).getTime();
  if (t >= startOfToday.getTime()) return 'Today';
  if (t >= startOfToday.getTime() - DAY) return 'Yesterday';
  if (t >= startOfToday.getTime() - 6 * DAY) return 'This week';
  return 'Earlier';
}

function NotificationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-3" aria-busy="true" aria-label="Loading notifications">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-3">
          <Skeleton className="size-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="size-11 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

function NotificationRow({ n, onOpen }: { n: Notification; onOpen: (n: Notification) => void }) {
  const type = TYPE_ICON[n.type] ?? TYPE_ICON.system;
  const unread = !n.read;
  const body = (
    <>
      <div className={cn('size-10 rounded-lg flex items-center justify-center flex-shrink-0', type.className)} aria-hidden>
        {n.actor ? <Img src={avatarUrlFor(n.actor, 80)} alt="" className="size-10 rounded-lg object-cover" /> : type.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          {n.actor && <span className="font-semibold">{n.actor.name} </span>}
          <span className={n.actor ? 'text-foreground-secondary' : 'text-foreground'}>{n.message}</span>
        </p>
        <p className="text-xs text-foreground-tertiary mt-1">
          <time dateTime={n.createdAt}>{formatTimeAgo(n.createdAt)}</time>
        </p>
      </div>
      {n.thumbnailUrl && <Img src={n.thumbnailUrl} alt="" loading="lazy" className="size-11 rounded-lg object-cover flex-shrink-0" />}
      {unread && <span className="size-2 rounded-full bg-primary flex-shrink-0 mt-2" aria-label="Unread" />}
    </>
  );
  const className = cn(
    'flex items-start gap-3 p-4 rounded-2xl border transition-all w-full text-left',
    unread ? 'bg-primary-subtle/40 border-primary-subtle border-l-4 border-l-primary' : 'bg-card border-border hover:bg-muted hover:border-border-strong',
  );
  return (
    <motion.li variants={fadeUp} data-testid={`notification-${n.id}`} data-unread={unread || undefined}>
      {n.href ? (
        <Link to={n.href} onClick={() => onOpen(n)} className={className}>{body}</Link>
      ) : (
        <button type="button" onClick={() => onOpen(n)} className={className}>{body}</button>
      )}
    </motion.li>
  );
}

/** `GET /notifications` (infinite) + `POST /notifications/:id/read` / `read-all`; unread badge in the nav shares the same cache. */
export default function NotificationsPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const [filter, setFilter] = useState<FilterTab>('all');
  const query = useNotifications();
  const unread = useUnreadCount();
  const markRead = useMarkNotificationsRead();
  const { items, loadMore, loadingMore, hasMore } = useInfiniteList<Notification>(query);

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/notifications' } });
  }, [status, navigate]);

  const active = FILTERS.find(f => f.key === filter)!;
  const visible = useMemo(() => (active.types ? items.filter(n => active.types!.includes(n.type)) : items), [items, active]);
  const grouped = useMemo(() => {
    const now = Date.now();
    const map = new Map<Bucket, Notification[]>();
    for (const n of visible) {
      const b = bucketOf(n.createdAt, now);
      map.set(b, [...(map.get(b) ?? []), n]);
    }
    return map;
  }, [visible]);
  const unreadCount = unread.data ?? items.filter(n => !n.read).length;

  const open = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id);
  };
  const markAll = () =>
    markRead.mutate(undefined, {
      onSuccess: () => toast.success('All caught up'),
      onError: err => toast.error(formErrors(err).message ?? 'Could not mark as read'),
    });

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEO {...SEOConfigs.notifications} />

      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-2xl font-semibold">
              Notifications
              {unreadCount > 0 && <span className="ml-2 align-middle inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums" aria-label={`${unreadCount} unread`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </h1>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAll} loading={markRead.isPending && markRead.variables === undefined} leftIcon={<CheckCheck className="size-4" />}>
                Mark all read
              </Button>
            )}
          </div>

          <div role="tablist" aria-label="Filter notifications" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {FILTERS.map(f => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn('px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors', filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/70')}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4" role="region" aria-live="polite" aria-label="Notification list">
        {query.isLoading ? (
          <NotificationSkeleton />
        ) : query.isError ? (
          <EmptyState kind="error" title="Couldn’t load notifications" description={formErrors(query.error).message ?? 'Please try again.'} action={<Button onClick={() => query.refetch()}>Retry</Button>} compact />
        ) : visible.length === 0 ? (
          filter === 'all' ? (
            <EmptyNotifications compact />
          ) : (
            <EmptyState kind="notifications" title={`No ${active.label.toLowerCase()} notifications`} description="Try another filter." action={<Button variant="outline" onClick={() => setFilter('all')}>Show all</Button>} compact />
          )
        ) : (
          <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} initial="hidden" animate="visible" className="space-y-6">
            {BUCKETS.map(day => {
              const list = grouped.get(day);
              if (!list) return null;
              return (
                <section key={day} aria-labelledby={`notif-${day.replace(/\s/g, '-')}`}>
                  <h2 id={`notif-${day.replace(/\s/g, '-')}`} className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3">{day}</h2>
                  <ul className="space-y-2">
                    {list.map(n => <NotificationRow key={n.id} n={n} onOpen={open} />)}
                  </ul>
                </section>
              );
            })}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={loadMore} loading={loadingMore}>Load more</Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
