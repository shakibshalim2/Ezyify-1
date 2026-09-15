import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { decodeCursor, encodeCursor, type SearchHits, type SearchIndex, type SearchOptions, type SearchType } from './search.index.js';

/**
 * Fallback when Meilisearch is not configured: case-insensitive `ILIKE` over the source tables. The database *is*
 * the index, so upsert/remove are no-ops. Good enough for small catalogues; swap in Meilisearch for typo tolerance.
 */
@Injectable()
export class PostgresSearchIndex implements SearchIndex {
  readonly name = 'postgres' as const;
  constructor(private readonly prisma: PrismaService) {}

  async ensureIndexes() {}
  async upsert() {}
  async remove() {}

  async search(type: SearchType, q: string, opts: SearchOptions): Promise<SearchHits> {
    const skip = decodeCursor(opts.cursor);
    const take = opts.limit;
    const term = q.trim();
    const tag = term.toLowerCase().replace(/^[#@]/, '');
    const contains = { contains: term, mode: 'insensitive' as const };
    let ids: string[] = [];
    let total = 0;

    if (type === 'products') {
      const where: Prisma.ProductWhereInput = { published: true, OR: [{ name: contains }, { description: contains }, { tags: { has: tag } }] };
      const [rows, count] = await this.prisma.$transaction([
        this.prisma.product.findMany({ where, select: { id: true }, orderBy: [{ soldCount: 'desc' }, { createdAt: 'desc' }], skip, take }),
        this.prisma.product.count({ where }),
      ]);
      ids = rows.map(r => r.id);
      total = count;
    } else if (type === 'users') {
      const where: Prisma.UserWhereInput = {
        deletedAt: null,
        ...(opts.excludeAuthorIds.length ? { id: { notIn: opts.excludeAuthorIds } } : {}),
        OR: [{ username: { contains: tag, mode: 'insensitive' } }, { name: contains }, { bio: contains }],
      };
      const [rows, count] = await this.prisma.$transaction([
        // Exact handle first, then verified accounts, then alphabetical.
        this.prisma.user.findMany({ where, select: { id: true, username: true }, orderBy: [{ verified: 'desc' }, { username: 'asc' }], skip, take }),
        this.prisma.user.count({ where }),
      ]);
      ids = rows.sort((a, b) => Number(b.username === tag) - Number(a.username === tag)).map(r => r.id);
      total = count;
    } else {
      const where: Prisma.PostWhereInput = {
        deletedAt: null,
        kind: { not: 'story' },
        ...(opts.excludeAuthorIds.length ? { authorId: { notIn: opts.excludeAuthorIds } } : {}),
        OR: [{ caption: contains }, { hashtags: { has: tag } }],
      };
      const [rows, count] = await this.prisma.$transaction([
        this.prisma.post.findMany({ where, select: { id: true }, orderBy: [{ likeCount: 'desc' }, { createdAt: 'desc' }], skip, take }),
        this.prisma.post.count({ where }),
      ]);
      ids = rows.map(r => r.id);
      total = count;
    }
    return { ids, cursor: skip + ids.length < total ? encodeCursor(skip + take) : null, estimatedTotal: total };
  }
}
