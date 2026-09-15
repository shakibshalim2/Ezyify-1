import type { PostKind } from '../../generated/prisma/enums.js';

/** Flat documents pushed to the index; hydration back to spec shapes happens in SearchService. */
export interface ProductDoc {
  id: string;
  name: string;
  description: string;
  tags: string[];
  sellerId: string;
  categorySlug: string;
  price: number;
  soldCount: number;
  published: boolean;
}
export interface UserDoc {
  id: string;
  username: string;
  name: string;
  bio: string;
  role: string;
  deleted: boolean;
}
export interface PostDoc {
  id: string;
  caption: string;
  hashtags: string[];
  authorId: string;
  kind: PostKind;
  deleted: boolean;
  createdAt: number;
}

export type SearchType = 'products' | 'users' | 'posts';
export type SearchDoc = { products: ProductDoc; users: UserDoc; posts: PostDoc };

export interface SearchHits {
  ids: string[];
  /** Opaque continuation, `null` when exhausted. */
  cursor: string | null;
  estimatedTotal: number;
}

export interface SearchOptions {
  limit: number;
  cursor?: string;
  /** Author/seller ids the viewer must not see (blocks in either direction). */
  excludeAuthorIds: string[];
}

export interface SearchIndex {
  readonly name: 'meilisearch' | 'postgres';
  ensureIndexes(): Promise<void>;
  search(type: SearchType, q: string, opts: SearchOptions): Promise<SearchHits>;
  upsert<T extends SearchType>(type: T, docs: SearchDoc[T][]): Promise<void>;
  remove(type: SearchType, ids: string[]): Promise<void>;
}

export const SEARCH_INDEX = Symbol('SEARCH_INDEX');
export const SEARCH_FETCH = Symbol('SEARCH_FETCH');

/** Offset cursors are enough for both backends; base64 keeps clients from treating them as numbers. */
export const encodeCursor = (offset: number) => Buffer.from(String(offset)).toString('base64url');
export const decodeCursor = (cursor: string | undefined) => {
  if (!cursor) return 0;
  const n = Number(Buffer.from(cursor, 'base64url').toString());
  return Number.isInteger(n) && n >= 0 ? n : 0;
};
