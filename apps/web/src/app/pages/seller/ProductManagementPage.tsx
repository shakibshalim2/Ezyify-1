import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  TrendingUp,
  AlertCircle,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { mockProducts } from '../../data/enhanced-mock-data';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

function ProductListSkeleton() {
  return (
    <div className="space-y-3">
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

export default function ProductManagementPage() {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const sellerProducts = mockProducts.slice(0, 20).map((product, idx) => ({
    ...product,
    stock: Math.floor(Math.random() * 200) + 10,
    sales: Math.floor(Math.random() * 500) + 50,
    revenue: Math.floor(product.price * (Math.random() * 500 + 50)),
    status: idx % 15 === 0 ? 'out-of-stock' : (idx % 10 === 0 ? 'low-stock' : 'active'),
    views: Math.floor(Math.random() * 5000) + 500,
  }));

  const stats = {
    total: sellerProducts.length,
    active: sellerProducts.filter(p => p.status === 'active').length,
    lowStock: sellerProducts.filter(p => p.status === 'low-stock').length,
    outOfStock: sellerProducts.filter(p => p.status === 'out-of-stock').length,
  };

  const filteredProducts = sellerProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === 'all' || product.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  if (isLoading) {
    return (
      <SellerLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <ProductListSkeleton />
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.products} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Products</h1>
            <p className="text-sm text-foreground-secondary mt-1">{stats.total} products in your store</p>
          </div>
          <Link to="/seller/add-product">
            <Button variant="gradient" size="lg" leftIcon={<Plus className="size-5" />} className="shadow-brand">
              Add Product
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Package className="size-5 text-primary" />
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Total</p>
                <p className="font-display font-bold text-2xl text-foreground">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-5 text-success" />
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Active</p>
                <p className="font-display font-bold text-2xl text-foreground">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-warning" />
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Low Stock</p>
                <p className="font-display font-bold text-2xl text-foreground">{stats.lowStock}</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-error" />
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Out of Stock</p>
                <p className="font-display font-bold text-2xl text-foreground">{stats.outOfStock}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search and Tabs */}
        <motion.div variants={fadeUp} className="space-y-4">
          <Field
            label="Search products"
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="size-5" />}
          />

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
              <TabsTrigger value="low-stock">Low ({stats.lowStock})</TabsTrigger>
              <TabsTrigger value="out-of-stock">Out ({stats.outOfStock})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="size-12 text-foreground-tertiary mx-auto mb-4" />
                  <p className="text-foreground-secondary">No products found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map(product => (
                    <Card
                      key={product.id}
                      variant="default"
                      padding="md"
                      interactive
                      className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      {/* Product info */}
                      <div className="flex gap-4 flex-1 min-w-0 w-full sm:w-auto">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="size-24 rounded-card object-cover flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                          <p className="text-xs text-foreground-secondary mt-1">{product.id}</p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className={cn('text-xs font-semibold px-2 py-1 rounded-lg', 
                              product.status === 'active'
                                ? 'bg-success-subtle text-success'
                                : product.status === 'low-stock'
                                  ? 'bg-warning-subtle text-warning'
                                  : 'bg-error-subtle text-error'
                            )}>
                              {product.status === 'active' ? 'Active' : product.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-sm w-full sm:w-auto">
                        <div>
                          <p className="text-foreground-secondary text-xs">Price</p>
                          <p className="font-semibold text-foreground tabular-nums">${product.price}</p>
                        </div>
                        <div>
                          <p className="text-foreground-secondary text-xs">Stock</p>
                          <p className={cn('font-semibold tabular-nums',
                            product.stock < 20 ? 'text-error' : product.stock < 50 ? 'text-warning' : 'text-foreground'
                          )}>
                            {product.stock}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground-secondary text-xs">Sales</p>
                          <p className="font-semibold text-foreground tabular-nums">{product.sales}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Link to={`/seller/edit-product/${product.id}`}>
                          <Button variant="outline" size="icon" aria-label="Edit product">
                            <Edit className="size-5" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="icon" aria-label="Delete product">
                          <Trash2 className="size-5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
