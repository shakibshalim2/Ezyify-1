import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Bell, ChevronRight, CirclePlay, Clock3, Eye, Radio, TrendingUp } from 'lucide-react';
import { avatarUrlFor, formatCompactNumber, formatTimeUntil, useLiveSessions } from '@ezyify/core';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { EmptyState } from '../components/primitives/EmptyState';
import { Img } from '../components/primitives/Img';
import { Skeleton } from '../components/primitives/Skeleton';
import { useLiveReminders } from '../lib/reminders';

function LiveShoppingSkeleton() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 lg:px-6 lg:py-8" aria-busy>
      <div className="space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="aspect-video rounded-card" />
        ))}
      </div>
    </main>
  );
}

export default function LiveShoppingPage() {
  const [category, setCategory] = useState<string | null>(null);
  const live = useLiveSessions({ status: 'live' });
  const upcoming = useLiveSessions({ status: 'scheduled' });
  const reminders = useLiveReminders();
  const liveSessions = live.data?.items ?? [];
  const upcomingSessions = upcoming.data?.items ?? [];
  const categories = useMemo(
    () => [
      ...new Set(
        [...liveSessions, ...upcomingSessions].flatMap((session) =>
          session.category ? [session.category] : [],
        ),
      ),
    ],
    [liveSessions, upcomingSessions],
  );
  const visibleLive = category
    ? liveSessions.filter((session) => session.category === category)
    : liveSessions;
  const hosts = useMemo(
    () =>
      Array.from(
        new Map(
          [...liveSessions, ...upcomingSessions].map((session) => [
            session.host.username,
            session.host,
          ]),
        ).values(),
      ),
    [liveSessions, upcomingSessions],
  );

  const toggleReminder = async (id: string, title: string, at: string | null) => {
    const added = await reminders.toggle({ id, title, at });
    toast.success(added ? 'Reminder set' : 'Reminder removed', {
      description: added ? title : undefined,
    });
  };

  if (live.isLoading || upcoming.isLoading) return <LiveShoppingSkeleton />;
  if (live.isError || upcoming.isError) {
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <EmptyState
          kind="error"
          title="Couldn’t load live shopping"
          description="Check your connection and try again."
          action={
            <Button
              onClick={() => {
                void live.refetch();
                void upcoming.refetch();
              }}
            >
              Retry
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Live shopping"
        description="Shop creator-led live product demos and upcoming drops on Ezyify."
      />
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-6 pb-12 lg:px-6 lg:py-8">
        <header className="rounded-sheet bg-brand-gradient p-6 text-white sm:p-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold">
              <Radio className="size-4" aria-hidden />
              Live shopping
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              See it live. Shop with confidence.
            </h1>
            <p className="mt-2 text-sm text-white/85 sm:text-base">
              Creator demos, real-time product drops, and escrow-protected checkout.
            </p>
          </div>
        </header>

        <section className="space-y-4" aria-labelledby="live-now">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="live-now" className="font-display text-xl font-semibold">
                Live now
              </h2>
              <p className="text-sm text-foreground-secondary">
                Join a stream before the best drops are gone.
              </p>
            </div>
            <span className="text-sm text-foreground-secondary">
              {visibleLive.length} streaming
            </span>
          </div>
          {categories.length > 0 && (
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              aria-label="Filter live streams by category"
            >
              <Button
                variant={category === null ? 'primary' : 'outline'}
                size="sm"
                aria-pressed={category === null}
                onClick={() => setCategory(null)}
              >
                All
              </Button>
              {categories.map((item) => (
                <Button
                  key={item}
                  variant={category === item ? 'primary' : 'outline'}
                  size="sm"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          )}
          {visibleLive.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleLive.map((session) => (
                <Link
                  key={session.id}
                  to={`/live/${session.id}`}
                  className="group block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card interactive padding="none" className="h-full overflow-hidden">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Img
                        src={session.coverUrl ?? undefined}
                        alt={`${session.title} live stream`}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-transparent to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                        LIVE
                      </span>
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-1 text-xs font-semibold text-foreground">
                        <Eye className="size-3.5" aria-hidden />
                        {formatCompactNumber(session.viewers)}
                      </span>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center gap-2">
                        <Img
                          src={avatarUrlFor(session.host)}
                          alt=""
                          className="size-8 rounded-full object-cover"
                        />
                        <span className="min-w-0 truncate text-sm font-medium">
                          {session.host.name}
                        </span>
                        {session.host.verified && <VerifiedBadge size="sm" />}
                      </div>
                      <div>
                        <h3 className="line-clamp-2 font-display font-semibold">{session.title}</h3>
                        {session.category && (
                          <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground-secondary">
                            {session.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              kind="feed"
              title="No one is live right now"
              description="Check upcoming streams and set a reminder."
            />
          )}
        </section>

        <section className="space-y-4" aria-labelledby="upcoming">
          <div>
            <h2 id="upcoming" className="font-display text-xl font-semibold">
              Upcoming
            </h2>
            <p className="text-sm text-foreground-secondary">Save a spot for the next drop.</p>
          </div>
          {upcomingSessions.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="flex items-center gap-3 p-3">
                  <Img
                    src={session.coverUrl ?? undefined}
                    alt=""
                    className="size-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/live/${session.id}`}
                      className="font-display font-semibold hover:text-primary"
                    >
                      {session.title}
                    </Link>
                    <p className="mt-1 text-sm text-foreground-secondary">
                      {session.host.name} ·{' '}
                      {session.scheduledFor
                        ? formatTimeUntil(session.scheduledFor)
                        : 'Schedule pending'}
                    </p>
                  </div>
                  <Button
                    variant={reminders.has(session.id) ? 'primary' : 'outline'}
                    size="sm"
                    aria-pressed={reminders.has(session.id)}
                    onClick={() =>
                      void toggleReminder(session.id, session.title, session.scheduledFor)
                    }
                    leftIcon={
                      <Bell
                        className={reminders.has(session.id) ? 'size-4 fill-current' : 'size-4'}
                        aria-hidden
                      />
                    }
                  >
                    {reminders.has(session.id) ? 'Reminding' : 'Remind'}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              kind="feed"
              title="No streams scheduled yet"
              description="Follow your favorite hosts to hear about their next stream."
            />
          )}
        </section>

        <section className="space-y-4" aria-labelledby="top-hosts">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="top-hosts" className="font-display text-xl font-semibold">
                Top hosts
              </h2>
              <p className="text-sm text-foreground-secondary">
                Meet the people behind the streams.
              </p>
            </div>
            <TrendingUp className="size-6 text-primary" aria-hidden />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hosts.map((host) => (
              <Link
                key={host.id}
                to={`/profile/${host.username}`}
                className="rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card interactive className="flex items-center gap-3 p-4">
                  <Img
                    src={avatarUrlFor(host)}
                    alt=""
                    className="size-11 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate font-semibold">
                      {host.name}
                      {host.verified && <VerifiedBadge size="sm" />}
                    </p>
                    <p className="text-sm text-foreground-secondary">@{host.username}</p>
                  </div>
                  <ChevronRight className="ml-auto size-4 text-foreground-tertiary" aria-hidden />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
