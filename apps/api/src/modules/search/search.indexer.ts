import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { SEARCH_INDEX, type PostDoc, type ProductDoc, type SearchIndex, type UserDoc } from './search.index.js';

const BATCH = 500;

/**
 * Keeps the external index in step with Postgres. Every hook is fire-and-forget and swallows errors: a search outage
 * must never fail a signup, product edit or post. With the Postgres fallback the index *is* the database, so hooks
 * short-circuit.
 */
@Injectable()
export class SearchIndexer implements OnModuleInit {
  private readonly log = new Logger(SearchIndexer.name);
  constructor(private readonly prisma: PrismaService, @Inject(SEARCH_INDEX) private readonly index: SearchIndex) {}

  get external() {
    return this.index.name !== 'postgres';
  }

  async onModuleInit() {
    if (!this.external) return;
    await this.index.ensureIndexes().catch((e: Error) => this.log.error(`ensureIndexes failed: ${e.message}`));
  }

  /** Re-read from Postgres and upsert; deletes are handled by the `deleted` flag rather than removal. */
  product(id: string) {
    return this.safe(async () => {
      const p = await this.prisma.product.findUnique({ where: { id }, include: { category: { select: { slug: true } } } });
      if (p) await this.index.upsert('products', [productDoc(p)]);
    });
  }

  /** Hard deletes drop the document; soft deletes (unpublish) go through `product()` and the `published` flag. */
  removeProduct(id: string) {
    return this.safe(() => this.index.remove('products', [id]));
  }

  user(id: string) {
    return this.safe(async () => {
      const u = await this.prisma.user.findUnique({ where: { id } });
      if (u) await this.index.upsert('users', [userDoc(u)]);
    });
  }

  post(id: string) {
    return this.safe(async () => {
      const p = await this.prisma.post.findUnique({ where: { id } });
      if (p) await this.index.upsert('posts', [postDoc(p)]);
    });
  }

  /** Full rebuild in batches; used by `pnpm search:reindex` and after restoring a Meilisearch instance. */
  async reindexAll() {
    await this.index.ensureIndexes();
    const counts = { products: 0, users: 0, posts: 0 };
    for (let skip = 0; ; skip += BATCH) {
      const rows = await this.prisma.product.findMany({ skip, take: BATCH, orderBy: { id: 'asc' }, include: { category: { select: { slug: true } } } });
      if (!rows.length) break;
      await this.index.upsert('products', rows.map(productDoc));
      counts.products += rows.length;
    }
    for (let skip = 0; ; skip += BATCH) {
      const rows = await this.prisma.user.findMany({ skip, take: BATCH, orderBy: { id: 'asc' } });
      if (!rows.length) break;
      await this.index.upsert('users', rows.map(userDoc));
      counts.users += rows.length;
    }
    for (let skip = 0; ; skip += BATCH) {
      const rows = await this.prisma.post.findMany({ skip, take: BATCH, orderBy: { id: 'asc' } });
      if (!rows.length) break;
      await this.index.upsert('posts', rows.map(postDoc));
      counts.posts += rows.length;
    }
    return counts;
  }

  private safe(fn: () => Promise<void>) {
    if (!this.external) return;
    void fn().catch((e: Error) => this.log.warn(`index update skipped: ${e.message}`));
  }
}

type ProductRow = { id: string; name: string; description: string; tags: string[]; sellerId: string; price: number; soldCount: number; published: boolean; category: { slug: string } };
type UserRow = { id: string; username: string; name: string; bio: string | null; role: string; deletedAt: Date | null };
type PostRow = { id: string; caption: string; hashtags: string[]; authorId: string; kind: PostDoc['kind']; deletedAt: Date | null; createdAt: Date };

export const productDoc = (p: ProductRow): ProductDoc => ({ id: p.id, name: p.name, description: p.description, tags: p.tags, sellerId: p.sellerId, categorySlug: p.category.slug, price: p.price, soldCount: p.soldCount, published: p.published });
export const userDoc = (u: UserRow): UserDoc => ({ id: u.id, username: u.username, name: u.name, bio: u.bio ?? '', role: u.role, deleted: !!u.deletedAt });
export const postDoc = (p: PostRow): PostDoc => ({ id: p.id, caption: p.caption, hashtags: p.hashtags, authorId: p.authorId, kind: p.kind, deleted: !!p.deletedAt, createdAt: p.createdAt.getTime() });
