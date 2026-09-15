import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Search, Sparkles, Users, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  avatarUrlFor,
  formatCompactNumber,
  useCategories,
  useProducts,
  useToggleFollow,
  useUnifiedSearch,
  type Post,
  type SearchType,
  type UserSummary,
} from '@ezyify/core';
import { SEO } from '../components/SEO';
import { EmptySearchResults } from '../components/EmptyStates';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { ProductCard } from '../components/shop/ProductCard';
import { Button } from '../components/primitives/Button';
import { Img } from '../components/primitives/Img';
import { Skeleton } from '../components/primitives/Skeleton';
import { fadeUp, staggerContainer } from '../lib/motion';
import { useAuthed } from '../lib/data';

const RECENT_KEY = 'ezyify.search.recent';
type SearchTab = 'all' | 'products' | 'users' | 'posts';
const tabs: { id: SearchTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'products', label: 'Products' },
  { id: 'users', label: 'People' },
  { id: 'posts', label: 'Posts' },
];

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-busy>
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} className="aspect-[.72] rounded-card" />
      ))}
    </div>
  );
}

function PersonRow({ person }: { person: UserSummary }) {
  const authed = useAuthed();
  const navigate = useNavigate();
  const follow = useToggleFollow();
  const [following, setFollowing] = useState(false);
  const onFollow = () => {
    if (!authed)
      return navigate('/login', {
        state: { next: `/search?q=${encodeURIComponent(person.username)}` },
      });
    follow.mutate(
      { username: person.username, following },
      { onSuccess: () => setFollowing((value) => !value) },
    );
  };
  return (
    <article className="flex items-center gap-3 rounded-card border border-border bg-card p-4">
      <Link to={`/profile/${person.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Img
          src={avatarUrlFor(person, 96)}
          alt={`${person.name}'s avatar`}
          loading="lazy"
          className="size-12 rounded-full object-cover"
        />
        <span className="min-w-0">
          <span className="flex items-center gap-1 truncate font-semibold">
            {person.name}
            {person.verified && <VerifiedBadge size="sm" />}
          </span>
          <span className="block truncate text-sm text-foreground-secondary">
            @{person.username}
          </span>
        </span>
      </Link>
      <Button
        size="sm"
        variant={following ? 'secondary' : 'primary'}
        loading={follow.isPending}
        onClick={onFollow}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
    </article>
  );
}

function PostResults({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {posts.map((post) => {
        const image = post.media[0]?.thumbnailUrl ?? post.media[0]?.url;
        return (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="group relative aspect-square overflow-hidden rounded-card bg-muted"
          >
            {image && (
              <Img
                src={image}
                alt={post.caption || `Post by ${post.author.name}`}
                loading="lazy"
                className="size-full object-cover transition-transform group-hover:scale-105"
              />
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-8 text-xs font-semibold text-white line-clamp-2">
              @{post.author.username}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function SearchPage() {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const queryParam = params.get('q') ?? '';
  const [query, setQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [tab, setTab] = useState<SearchTab>('all');
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
    } catch {
      return [];
    }
  });
  const categories = useCategories();
  const trending = useProducts({ sort: 'popular', pageSize: 8 });
  const type: SearchType = tab;
  const results = useUnifiedSearch(debouncedQuery, type);

  useEffect(() => setQuery(queryParam), [queryParam]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    if (!debouncedQuery) return;
    const next = [
      debouncedQuery,
      ...recent.filter((item) => item.toLowerCase() !== debouncedQuery.toLowerCase()),
    ].slice(0, 8);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    if (queryParam !== debouncedQuery) setParams({ q: debouncedQuery }, { replace: true });
  }, [debouncedQuery]);
  const selectRecent = (value: string) => {
    setQuery(value);
    setDebouncedQuery(value);
    setTab('all');
  };
  const clearQuery = () => {
    setQuery('');
    setDebouncedQuery('');
    setParams({}, { replace: true });
  };
  const removeRecent = (value: string) => {
    const next = recent.filter((item) => item !== value);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };
  const hasQuery = debouncedQuery.length > 0;
  const data = results.data;
  const hasResults =
    !!data && (data.products.total > 0 || data.users.total > 0 || data.posts.total > 0);

  return (
    <div className="min-h-screen bg-background pb-nav">
      <SEO title="Search — Ezyify" description="Search products, people and posts on Ezyify." />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-6"
      >
        <motion.header variants={fadeUp}>
          <h1 className="mb-4 font-display text-3xl font-bold">Search</h1>
          <label className="flex h-12 items-center gap-3 rounded-xl border border-border bg-card px-4 shadow-sm">
            <Search className="size-5 text-foreground-secondary" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setTab('all');
              }}
              placeholder="Products, people and posts"
              aria-label="Search Ezyify"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-tertiary"
            />
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                aria-label="Clear search"
                className="flex size-8 items-center justify-center rounded-lg text-foreground-secondary hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
        </motion.header>
        {hasQuery ? (
          <>
            <motion.nav
              variants={fadeUp}
              aria-label="Search result types"
              className="flex gap-2 overflow-x-auto border-b border-border"
            >
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-pressed={tab === item.id}
                  className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${tab === item.id ? 'border-primary text-primary' : 'border-transparent text-foreground-secondary hover:text-foreground'}`}
                >
                  {item.label}
                </button>
              ))}
            </motion.nav>
            {results.isLoading ? (
              <SearchSkeleton />
            ) : results.isError ? (
              <EmptySearchResults />
            ) : !hasResults ? (
              <EmptySearchResults />
            ) : (
              <motion.div variants={fadeUp} className="space-y-8">
                {(tab === 'all' || tab === 'products') && data!.products.items.length > 0 && (
                  <section>
                    <h2 className="mb-3 font-display text-xl font-semibold">Products</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {data!.products.items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                )}
                {(tab === 'all' || tab === 'users') && data!.users.items.length > 0 && (
                  <section>
                    <h2 className="mb-3 font-display text-xl font-semibold">People</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {data!.users.items.map((person) => (
                        <PersonRow key={person.id} person={person} />
                      ))}
                    </div>
                  </section>
                )}
                {(tab === 'all' || tab === 'posts') && data!.posts.items.length > 0 && (
                  <section>
                    <h2 className="mb-3 font-display text-xl font-semibold">Posts</h2>
                    <PostResults posts={data!.posts.items} />
                  </section>
                )}
              </motion.div>
            )}
          </>
        ) : (
          <motion.div variants={fadeUp} className="space-y-8">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Browse categories</h2>
              </div>
              {categories.isLoading ? (
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-10 w-24 rounded-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(categories.data ?? []).map((category) => (
                    <Link
                      key={category.id}
                      to={`/shop?category=${encodeURIComponent(category.slug)}`}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      {category.name}
                      <span className="ml-1 text-xs text-foreground-secondary">
                        {formatCompactNumber(category.productCount)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
            {recent.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">Recent searches</h2>
                  <Users className="size-5 text-primary" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card py-1 pl-3 pr-1 text-sm"
                    >
                      <button type="button" onClick={() => selectRecent(item)}>
                        {item}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecent(item)}
                        aria-label={`Remove ${item} from recent searches`}
                        className="flex size-7 items-center justify-center rounded-full hover:bg-muted"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold">Trending products</h2>
              {trending.isLoading ? (
                <SearchSkeleton />
              ) : trending.isError ? (
                <EmptySearchResults />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {trending.data?.pages
                    .flatMap((page) => page.items)
                    .map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
}
