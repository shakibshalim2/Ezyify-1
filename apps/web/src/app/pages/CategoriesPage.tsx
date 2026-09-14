import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react';
import { SEO } from '../components/SEO';
import { shopCategories } from '../components/shop/ShopCategories';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { EmptyState } from '../components/primitives/EmptyState';
import { Field } from '../components/primitives/Field';
import { Skeleton } from '../components/primitives/Skeleton';
import { fadeUp, staggerContainer } from '../lib/motion';
function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Skeleton key={i} className="aspect-[4/3] rounded-card" />
      ))}
    </div>
  );
}
export default function CategoriesPage() {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);
  const categories = shopCategories.filter((category) =>
    category.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="min-h-screen bg-background">
      <SEO title="All Categories — Ezyify" description="Browse product categories on Ezyify." />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8"
      >
        <motion.header variants={fadeUp} className="mb-6">
          <Link to="/shop">
            <Button variant="link" leftIcon={<ArrowLeft />}>
              Back to shop
            </Button>
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold">Shop by category</h1>
          <p className="mt-1 text-foreground-secondary">Find your next favorite thing, faster.</p>
        </motion.header>
        <motion.div variants={fadeUp} className="mb-6 max-w-xl">
          <Field
            label="Search categories"
            hideLabel
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search categories"
            leftIcon={<Search className="size-4" />}
          />
        </motion.div>
        {loading ? (
          <CategoriesSkeleton />
        ) : categories.length ? (
          <motion.section
            variants={staggerContainer(reduce ? 0 : 0.05)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {categories.map((category) => (
              <motion.div variants={fadeUp} key={category.id}>
                <Link to={`/shop?category=${encodeURIComponent(category.name)}`}>
                  <Card padding="none" interactive className="group overflow-hidden">
                    <div className="relative aspect-[4/3]">
                      <ImageWithFallback
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                      <div className="absolute inset-x-4 bottom-4 text-primary-foreground">
                        <div className="mb-1 [&_svg]:size-5">{category.icon}</div>
                        <h2 className="font-display text-lg font-semibold">{category.name}</h2>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <p className="text-sm text-foreground-secondary">{category.count} products</p>
                      <ChevronRight className="size-5 text-foreground-secondary transition group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.section>
        ) : (
          <EmptyState
            kind="search"
            title="No categories found"
            description={`We could not find a category matching “${query}”.`}
            action={<Button onClick={() => setQuery('')}>Clear search</Button>}
          />
        )}
      </motion.main>
    </div>
  );
}
