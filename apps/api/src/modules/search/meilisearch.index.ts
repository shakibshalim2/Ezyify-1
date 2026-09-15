import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ENV, type Env } from '../../config.js';
import { SEARCH_FETCH, decodeCursor, encodeCursor, type SearchDoc, type SearchHits, type SearchIndex, type SearchOptions, type SearchType } from './search.index.js';

const SETTINGS: Record<SearchType, { searchableAttributes: string[]; filterableAttributes: string[]; sortableAttributes: string[] }> = {
  products: { searchableAttributes: ['name', 'tags', 'description'], filterableAttributes: ['published', 'sellerId', 'categorySlug', 'price'], sortableAttributes: ['soldCount', 'price'] },
  users: { searchableAttributes: ['username', 'name', 'bio'], filterableAttributes: ['deleted', 'id', 'role'], sortableAttributes: [] },
  posts: { searchableAttributes: ['caption', 'hashtags'], filterableAttributes: ['deleted', 'authorId', 'kind'], sortableAttributes: ['createdAt'] },
};

/** Per-type visibility filter; blocked authors are excluded server-side so hits never leak through pagination. */
const filterFor = (type: SearchType, opts: SearchOptions): string[] => {
  const notIn = (field: string) => (opts.excludeAuthorIds.length ? [`${field} NOT IN [${opts.excludeAuthorIds.map(id => JSON.stringify(id)).join(', ')}]`] : []);
  if (type === 'products') return ['published = true'];
  if (type === 'users') return ['deleted = false', ...notIn('id')];
  return ['deleted = false', 'kind != story', ...notIn('authorId')];
};

/** Meilisearch over its REST API (no SDK — three endpoints). Index uids are prefixed so one instance can host several envs. */
@Injectable()
export class MeilisearchIndex implements SearchIndex {
  readonly name = 'meilisearch' as const;
  private readonly log = new Logger(MeilisearchIndex.name);
  private readonly host: string;
  private readonly key: string;
  private readonly prefix: string;
  private readonly fetchImpl: typeof fetch;

  constructor(@Inject(ENV) env: Env, @Optional() @Inject(SEARCH_FETCH) fetchImpl?: typeof fetch) {
    if (!env.MEILISEARCH_HOST || !env.MEILISEARCH_API_KEY) throw new Error('MeilisearchIndex requires MEILISEARCH_HOST and MEILISEARCH_API_KEY');
    this.host = env.MEILISEARCH_HOST.replace(/\/$/, '');
    this.key = env.MEILISEARCH_API_KEY;
    this.prefix = `ezyify_${env.NODE_ENV}_`;
    this.fetchImpl = fetchImpl ?? ((input, init) => fetch(input, init));
  }

  uid(type: SearchType) {
    return `${this.prefix}${type}`;
  }

  /** PATCHing settings implicitly creates the index, so boot is a single call per type. */
  async ensureIndexes() {
    for (const type of Object.keys(SETTINGS) as SearchType[]) {
      await this.request('PATCH', `/indexes/${this.uid(type)}/settings`, SETTINGS[type]);
    }
    this.log.log(`Meilisearch indexes ready (${this.prefix}*)`);
  }

  async search(type: SearchType, q: string, opts: SearchOptions): Promise<SearchHits> {
    const offset = decodeCursor(opts.cursor);
    const sort = type === 'products' ? ['soldCount:desc'] : type === 'posts' ? ['createdAt:desc'] : undefined;
    const res = await this.request<{ hits: Array<{ id: string }>; estimatedTotalHits: number }>('POST', `/indexes/${this.uid(type)}/search`, {
      q,
      limit: opts.limit,
      offset,
      filter: filterFor(type, opts),
      attributesToRetrieve: ['id'],
      ...(sort ? { sort } : {}),
    });
    const ids = res.hits.map(h => h.id);
    return { ids, cursor: offset + ids.length < res.estimatedTotalHits ? encodeCursor(offset + opts.limit) : null, estimatedTotal: res.estimatedTotalHits };
  }

  async upsert<T extends SearchType>(type: T, docs: SearchDoc[T][]) {
    if (!docs.length) return;
    await this.request('POST', `/indexes/${this.uid(type)}/documents?primaryKey=id`, docs);
  }

  async remove(type: SearchType, ids: string[]) {
    if (!ids.length) return;
    await this.request('POST', `/indexes/${this.uid(type)}/documents/delete-batch`, ids);
  }

  private async request<T = unknown>(method: 'POST' | 'PATCH', path: string, body: unknown): Promise<T> {
    const res = await this.fetchImpl(`${this.host}${path}`, { method, headers: { authorization: `Bearer ${this.key}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Meilisearch ${method} ${path} → ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
    return (await res.json()) as T;
  }
}
