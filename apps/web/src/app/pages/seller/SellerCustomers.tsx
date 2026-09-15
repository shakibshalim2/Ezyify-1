import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Users, Repeat, ShoppingCart, Search, MessageSquare, MapPin, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, avatarUrlFor, formatMoney, formatTimeAgo, useAuth, useSellerCustomers, useStartConversation, type SellerCustomer } from '@ezyify/core';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Img } from '../../components/primitives/Img';
import { QueryError } from '../../components/QueryError';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

const SORTS = [
  ['recent', 'Most recent'],
  ['spent', 'Top spenders'],
  ['orders', 'Most orders'],
] as const;
type Sort = (typeof SORTS)[number][0];

function CustomerRow({ c }: { c: SellerCustomer }) {
  const navigate = useNavigate();
  const startChat = useStartConversation();
  const message = () =>
    startChat.mutate(c.user.username, { onSuccess: r => navigate(`/messages?c=${encodeURIComponent(r.id)}`), onError: err => toast.error(formErrors(err).message ?? 'Could not open chat') });
  return (
    <li className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-background-elevated" data-testid={`seller-customer-${c.user.username}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Img src={avatarUrlFor(c.user, 96)} alt="" className="size-11 rounded-full object-cover shrink-0" loading="lazy" />
        <div className="min-w-0">
          <Link to={`/profile/${c.user.username}`} className="font-medium text-foreground text-sm hover:underline inline-flex items-center gap-1">
            <span className="truncate">{c.user.name}</span>
            {c.user.verified && <BadgeCheck className="size-3.5 text-primary shrink-0" aria-label="Verified" />}
          </Link>
          <p className="text-xs text-foreground-secondary truncate">
            @{c.user.username}
            {c.lastShippedTo && <> · <MapPin className="inline size-3 -mt-0.5" aria-hidden /> {c.lastShippedTo.city}, {c.lastShippedTo.country}</>}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {c.orders > 1 && <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-success-subtle text-success">Repeat</span>}
            {c.openOrders > 0 && <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-info-subtle text-info">{c.openOrders} open</span>}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-3 text-sm sm:w-72">
        <div>
          <dt className="text-xs text-foreground-secondary">Orders</dt>
          <dd className="font-semibold text-foreground tabular-nums">{c.orders}</dd>
        </div>
        <div>
          <dt className="text-xs text-foreground-secondary">Spent</dt>
          <dd className="font-semibold text-foreground tabular-nums">{formatMoney(c.spent)}</dd>
        </div>
        <div>
          <dt className="text-xs text-foreground-secondary">Last order</dt>
          <dd className="font-semibold text-foreground tabular-nums"><time dateTime={c.lastOrderAt}>{formatTimeAgo(c.lastOrderAt)}</time></dd>
        </div>
      </dl>
      <Button variant="outline" size="sm" leftIcon={<MessageSquare className="size-4" aria-hidden />} loading={startChat.isPending} onClick={message} className="sm:ml-2">
        Message
      </Button>
    </li>
  );
}

/** Seller customers on `GET /seller/customers` — buyers aggregated from paid orders, public profile data only. */
export default function SellerCustomers() {
  const reduce = useReducedMotion();
  const status = useAuth(s => s.status);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const t = window.setTimeout(() => setQ(search.trim()), 250);
    return () => window.clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [q, sort]);

  const customers = useSellerCustomers({ q: q || undefined, sort, page, pageSize: 20 });
  const data = customers.data;
  const summary = data?.summary;

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.customers} />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Customers</h1>
          <p className="text-sm text-foreground-secondary mt-1">Everyone who has bought from your store, with lifetime value and open orders.</p>
        </motion.div>

        {status === 'anonymous' || (customers.error instanceof ApiError && customers.error.code === 'UNAUTHORIZED') ? (
          <EmptyState kind="orders" title="Sign in to see customers" description="Your buyers and their lifetime value live here." action={<Button asChild><Link to="/login" state={{ next: '/seller/customers' }}>Sign in</Link></Button>} />
        ) : customers.isError && customers.error instanceof ApiError && customers.error.code === 'FORBIDDEN' ? (
          <EmptyState kind="orders" title="Seller account required" description="Open a store to see who’s buying from you." action={<Button variant="gradient" asChild><Link to="/sell-on-ezyify">Open a store</Link></Button>} />
        ) : (
          <>
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" data-testid="customers-summary">
              {[
                { label: 'Customers', value: summary?.total, icon: Users, tone: 'text-primary' },
                { label: 'Repeat buyers', value: summary?.repeat, icon: Repeat, tone: 'text-success', sub: summary && summary.total ? `${Math.round((summary.repeat / summary.total) * 100)}% of customers` : undefined },
                { label: 'Avg. order', value: summary ? formatMoney(summary.averageOrder) : undefined, icon: ShoppingCart, tone: 'text-info' },
                { label: 'Avg. lifetime value', value: summary ? formatMoney(summary.averageLifetime) : undefined, icon: Users, tone: 'text-warning' },
              ].map(({ label, value, icon: Icon, tone, sub }) => (
                <Card key={label} variant="default" padding="md">
                  <div className="flex items-center gap-3">
                    <Icon className={cn('size-5 shrink-0', tone)} aria-hidden />
                    <div className="min-w-0">
                      <p className="text-xs text-foreground-secondary">{label}</p>
                      {value != null ? <p className="font-display font-bold text-2xl text-foreground tabular-nums truncate">{value}</p> : <Skeleton className="h-8 w-14 mt-1" />}
                      {sub && <p className="text-xs text-foreground-tertiary">{sub}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <Field label="Search customers" type="search" placeholder="Name or @username…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="size-5" aria-hidden />} />
              </div>
              <div role="group" aria-label="Sort customers" className="inline-flex rounded-xl border border-border bg-card p-1 self-start">
                {SORTS.map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setSort(id)} aria-pressed={sort === id} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap', sort === id ? 'bg-primary text-primary-foreground' : 'text-foreground-secondary hover:text-foreground')}>
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <div role="region" aria-live="polite" aria-label="Customer list">
                  {customers.isLoading ? (
                    <div className="space-y-3" aria-busy>{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
                  ) : customers.isError || !data ? (
                    <QueryError error={customers.error} onRetry={() => void customers.refetch()} compact />
                  ) : data.items.length === 0 ? (
                    <EmptyState kind="orders" title={q ? 'No customers match' : 'No customers yet'} description={q ? 'Try a different name or username.' : 'Your first buyer shows up here the moment an order is paid.'} compact />
                  ) : (
                    <ul className={cn('space-y-3', customers.isPlaceholderData && 'opacity-60 transition-opacity')}>
                      {data.items.map(c => <CustomerRow key={c.user.id} c={c} />)}
                    </ul>
                  )}
                  {data && data.pagination.total > data.pagination.pageSize && (
                    <div className="flex items-center justify-between pt-4 text-sm text-foreground-secondary">
                      <span>{(data.pagination.page - 1) * data.pagination.pageSize + 1}–{Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of {data.pagination.total}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={data.pagination.page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={!data.pagination.hasMore} onClick={() => setPage(p => p + 1)}>Next</Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </SellerLayout>
  );
}
