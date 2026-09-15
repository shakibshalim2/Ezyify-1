import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Plus, Search, Edit, Package, TrendingUp, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { formatCompactNumber, formatMoney, sellerProductStatus, useAuth, useSellerProducts, type SellerProduct, type SellerProductStatus } from '@ezyify/core';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Img } from '../../components/primitives/Img';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { formErrors } from '../../lib/apiErrors';
import { cn } from '../../components/ui/utils';

type Tab = 'all' | SellerProductStatus;

const STATUS_LABEL: Record<SellerProductStatus, string> = { active: 'Active', low_stock: 'Low stock', out_of_stock: 'Out of stock', draft: 'Draft' };
const STATUS_CLASS: Record<SellerProductStatus, string> = {
  active: 'bg-success-subtle text-success',
  low_stock: 'bg-warning-subtle text-warning',
  out_of_stock: 'bg-error-subtle text-error',
  draft: 'bg-muted text-foreground-secondary',
};

function ProductListSkeleton() {
  return (
    <div className="space-y-3" aria-busy>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex gap-4 p-4 bg-background-elevated rounded-card">
          <Skeleton className="size-24 rounded-card flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductRow({ product }: { product: SellerProduct }) {
  const status = sellerProductStatus(product);
  return (
    <Card variant="default" padding="md" className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" data-testid={`seller-product-${product.id}`}>
      <div className="flex gap-4 flex-1 min-w-0 w-full sm:w-auto">
        <Img src={product.imageUrl} alt="" className="size-24 rounded-card object-cover flex-shrink-0" loading="lazy" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
          <p className="text-xs text-foreground-tertiary mt-1 font-mono">{product.slug}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={cn('text-xs font-semibold px-2 py-1 rounded-lg', STATUS_CLASS[status])}>{STATUS_LABEL[status]}</span>
            {product.badge && <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-primary/10 text-primary capitalize">{product.badge}</span>}
            {!product.published && (
              <span className="inline-flex items-center gap-1 text-xs text-foreground-tertiary"><EyeOff className="size-3.5" aria-hidden />Hidden from shoppers</span>
            )}
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-4 gap-4 text-sm w-full sm:w-auto">
        <div>
          <dt className="text-foreground-secondary text-xs">Price</dt>
          <dd className="font-semibold text-foreground tabular-nums">{formatMoney(product.price)}</dd>
        </div>
        <div>
          <dt className="text-foreground-secondary text-xs">Stock</dt>
          <dd className={cn('font-semibold tabular-nums', status === 'out_of_stock' ? 'text-error' : status === 'low_stock' ? 'text-warning' : 'text-foreground')}>{product.stock}</dd>
        </div>
        <div>
          <dt className="text-foreground-secondary text-xs">Sold</dt>
          <dd className="font-semibold text-foreground tabular-nums">{formatCompactNumber(product.soldCount)}</dd>
        </div>
        <div>
          <dt className="text-foreground-secondary text-xs">Revenue</dt>
          <dd className="font-semibold text-foreground tabular-nums">{formatMoney(product.revenue, { compact: true })}</dd>
        </div>
      </dl>

      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="outline" size="icon" aria-label={`Preview ${product.name}`} asChild>
          <Link to={`/product/${product.id}`}><Eye className="size-5" /></Link>
        </Button>
        <Button variant="outline" size="icon" aria-label={`Edit ${product.name}`} asChild>
          <Link to={`/seller/edit-product/${product.id}`}><Edit className="size-5" /></Link>
        </Button>
      </div>
    </Card>
  );
}

/** Seller hub inventory on `GET /seller/products` — the only place drafts and revenue are visible. */
export default function ProductManagementPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = window.setTimeout(() => setQ(search.trim()), 250);
    return () => window.clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [q, tab]);
  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/seller/products' } });
  }, [status, navigate]);

  const products = useSellerProducts({ q: q || undefined, status: tab === 'all' ? undefined : tab, page, pageSize: 20 });
  const summary = products.data?.summary;
  const items = products.data?.items ?? [];
  const pagination = products.data?.pagination;

  const stats: { key: keyof NonNullable<typeof summary>; label: string; icon: typeof Package; tone: string }[] = [
    { key: 'total', label: 'Total', icon: Package, tone: 'text-primary' },
    { key: 'active', label: 'Active', icon: TrendingUp, tone: 'text-success' },
    { key: 'lowStock', label: 'Low stock', icon: AlertCircle, tone: 'text-warning' },
    { key: 'outOfStock', label: 'Out of stock', icon: AlertCircle, tone: 'text-error' },
  ];

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.products} />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Products</h1>
            <p className="text-sm text-foreground-secondary mt-1">
              {summary ? `${summary.total} ${summary.total === 1 ? 'product' : 'products'} in your store` : 'Your store inventory'}
            </p>
          </div>
          <Button variant="gradient" size="lg" asChild className="shadow-brand">
            <Link to="/seller/add-product"><Plus className="size-5" aria-hidden />Add product</Link>
          </Button>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ key, label, icon: Icon, tone }) => (
            <Card key={key} variant="default" padding="md">
              <div className="flex items-center gap-3">
                <Icon className={cn('size-5', tone)} aria-hidden />
                <div>
                  <p className="text-xs font-medium text-foreground-secondary">{label}</p>
                  {summary ? <p className="font-display font-bold text-2xl text-foreground tabular-nums">{summary[key]}</p> : <Skeleton className="h-8 w-10 mt-1" />}
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <Field label="Search products" type="search" placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="size-5" aria-hidden />} />

          <Tabs value={tab} onValueChange={v => setTab(v as Tab)}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="all">All{summary ? ` (${summary.total})` : ''}</TabsTrigger>
              <TabsTrigger value="active">Active{summary ? ` (${summary.active})` : ''}</TabsTrigger>
              <TabsTrigger value="low_stock">Low{summary ? ` (${summary.lowStock})` : ''}</TabsTrigger>
              <TabsTrigger value="out_of_stock">Out{summary ? ` (${summary.outOfStock})` : ''}</TabsTrigger>
              <TabsTrigger value="draft">Drafts{summary ? ` (${summary.draft})` : ''}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-6" role="region" aria-live="polite" aria-label="Product list">
            {products.isLoading ? (
              <ProductListSkeleton />
            ) : products.isError ? (
              <EmptyState kind="error" title="Couldn’t load your products" description={formErrors(products.error).message ?? 'Please try again.'} action={<Button onClick={() => products.refetch()}>Retry</Button>} compact />
            ) : items.length === 0 ? (
              <EmptyState
                kind="orders"
                title={q || tab !== 'all' ? 'No products match' : 'No products yet'}
                description={q || tab !== 'all' ? 'Try a different search or status.' : 'Add your first product to start selling with escrow protection.'}
                action={q || tab !== 'all' ? undefined : <Button asChild><Link to="/seller/add-product">Add product</Link></Button>}
                compact
              />
            ) : (
              <div className={cn('space-y-3', products.isPlaceholderData && 'opacity-60 transition-opacity')}>
                {items.map(p => <ProductRow key={p.id} product={p} />)}
                {pagination && pagination.total > pagination.pageSize && (
                  <div className="flex items-center justify-between pt-2 text-sm text-foreground-secondary">
                    <span>
                      {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                      <Button variant="outline" size="sm" disabled={!pagination.hasMore} onClick={() => setPage(p => p + 1)}>Next</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
