import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { Post, ProductSummary, UserSummary } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { productInclude, toProductSummary } from '../catalog/catalog.mapper.js';
import { postInclude, toPost } from '../feed/feed.service.js';
import { toUserSummary } from '../users/users.mapper.js';
import { SEARCH_INDEX, decodeCursor, encodeCursor, type SearchHits, type SearchIndex, type SearchType } from './search.index.js';

export const SearchQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(100),
    type: z.enum(['products', 'users', 'posts', 'all']).default('all'),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    cursor: z.string().max(64).optional(),
    // Legacy `PageQuery` from `api.catalog.search` — mapped onto limit/cursor so older clients keep working.
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(50).optional(),
  })
  .transform(q => {
    const limit = q.pageSize ?? q.limit;
    return { ...q, limit, cursor: q.cursor ?? (q.page ? encodeCursor((q.page - 1) * limit) : undefined) };
  });
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export interface SearchSection<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
}
/**
 * Unified sections plus a `paginated(ProductSummary)` view of the products section (`items`/`pagination`) so the
 * pre-existing `api.catalog.search` client contract still validates.
 */
export interface SearchResponse {
  products: SearchSection<ProductSummary>;
  users: SearchSection<UserSummary>;
  posts: SearchSection<Post>;
  items: ProductSummary[];
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
}

const EMPTY = { items: [], nextCursor: null, total: 0 };

/** Index returns ids; Postgres hydrates them into the shared spec shapes so clients reuse existing mappers. */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService, @Inject(SEARCH_INDEX) private readonly index: SearchIndex) {}

  get backend() {
    return this.index.name;
  }

  async search(q: SearchQuery, viewerId?: string): Promise<SearchResponse> {
    const types: SearchType[] = q.type === 'all' ? ['products', 'users', 'posts'] : [q.type];
    const excludeAuthorIds = viewerId ? await this.blockedIds(viewerId) : [];
    const hits = Object.fromEntries(await Promise.all(types.map(async t => [t, await this.index.search(t, q.q, { limit: q.limit, cursor: q.cursor, excludeAuthorIds })] as const))) as Partial<Record<SearchType, SearchHits>>;
    const [products, users, posts] = await Promise.all([
      hits.products ? this.products(hits.products) : EMPTY,
      hits.users ? this.users(hits.users, excludeAuthorIds) : EMPTY,
      hits.posts ? this.posts(hits.posts, viewerId, excludeAuthorIds) : EMPTY,
    ]);
    const offset = decodeCursor(q.cursor);
    return {
      products,
      users,
      posts,
      items: products.items,
      pagination: { page: Math.floor(offset / q.limit) + 1, pageSize: q.limit, total: products.total, hasMore: products.nextCursor !== null },
    };
  }

  private async products(h: SearchHits): Promise<SearchSection<ProductSummary>> {
    const rows = await this.prisma.product.findMany({ where: { id: { in: h.ids }, published: true }, include: productInclude });
    return section(h, rows, toProductSummary);
  }

  private async users(h: SearchHits, exclude: string[]): Promise<SearchSection<UserSummary>> {
    const rows = await this.prisma.user.findMany({ where: { id: { in: h.ids, notIn: exclude }, deletedAt: null } });
    return section(h, rows, toUserSummary);
  }

  private async posts(h: SearchHits, viewerId: string | undefined, exclude: string[]): Promise<SearchSection<Post>> {
    const rows = await this.prisma.post.findMany({ where: { id: { in: h.ids }, deletedAt: null, ...(exclude.length ? { authorId: { notIn: exclude } } : {}) }, include: postInclude });
    const [likes, saves] = viewerId
      ? await Promise.all([
          this.prisma.like.findMany({ where: { userId: viewerId, postId: { in: h.ids } }, select: { postId: true } }),
          this.prisma.save.findMany({ where: { userId: viewerId, postId: { in: h.ids } }, select: { postId: true } }),
        ])
      : [[], []];
    const liked = new Set(likes.map(l => l.postId));
    const saved = new Set(saves.map(s => s.postId));
    return section(h, rows, r => toPost(r, liked, saved));
  }

  private async blockedIds(viewerId: string) {
    const rows = await this.prisma.block.findMany({ where: { OR: [{ blockerId: viewerId }, { blockedId: viewerId }] } });
    return rows.map(b => (b.blockerId === viewerId ? b.blockedId : b.blockerId));
  }
}

/** Preserve index ranking: hydrate by id then reorder to match `ids`. Rows the index knew but Postgres hid drop out. */
function section<R extends { id: string }, T>(h: SearchHits, rows: R[], map: (r: R) => T): SearchSection<T> {
  const byId = new Map(rows.map(r => [r.id, r]));
  return { items: h.ids.flatMap(id => (byId.has(id) ? [map(byId.get(id)!)] : [])), nextCursor: h.cursor, total: h.estimatedTotal };
}
