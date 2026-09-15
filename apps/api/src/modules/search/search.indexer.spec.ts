import { Logger } from '@nestjs/common';
import { SearchIndexer, postDoc, productDoc, userDoc } from './search.indexer.js';
import type { SearchIndex } from './search.index.js';
import type { PrismaService } from '../../infra/prisma/prisma.service.js';

const flush = () => new Promise(r => setTimeout(r, 0));
const product = { id: 'p1', name: 'Headphones', description: 'd', tags: ['audio'], sellerId: 's1', price: 100, soldCount: 3, published: true, category: { slug: 'tech' } };
const user = { id: 'u1', username: 'maya', name: 'Maya', bio: null, role: 'creator', deletedAt: null };
const post = { id: 'po1', caption: 'hi', hashtags: ['x'], authorId: 'u1', kind: 'post' as const, deletedAt: new Date(1), createdAt: new Date(1000) };

const prismaStub = () =>
  ({
    product: { findUnique: vi.fn().mockResolvedValue(product), findMany: vi.fn() },
    user: { findUnique: vi.fn().mockResolvedValue(user), findMany: vi.fn() },
    post: { findUnique: vi.fn().mockResolvedValue(post), findMany: vi.fn() },
  }) as unknown as PrismaService & { product: { findMany: ReturnType<typeof vi.fn> }; user: { findMany: ReturnType<typeof vi.fn> }; post: { findMany: ReturnType<typeof vi.fn> } };

const indexStub = (name: SearchIndex['name'] = 'meilisearch'): SearchIndex & { upsert: ReturnType<typeof vi.fn>; ensureIndexes: ReturnType<typeof vi.fn> } =>
  ({ name, ensureIndexes: vi.fn().mockResolvedValue(undefined), search: vi.fn(), upsert: vi.fn().mockResolvedValue(undefined), remove: vi.fn() }) as never;

beforeAll(() => Logger.overrideLogger(false));

describe('SearchIndexer', () => {
  it('maps rows to flat documents (deleted flag, empty bio, epoch createdAt)', () => {
    expect(productDoc(product)).toEqual({ id: 'p1', name: 'Headphones', description: 'd', tags: ['audio'], sellerId: 's1', categorySlug: 'tech', price: 100, soldCount: 3, published: true });
    expect(userDoc(user)).toEqual({ id: 'u1', username: 'maya', name: 'Maya', bio: '', role: 'creator', deleted: false });
    expect(postDoc(post)).toEqual({ id: 'po1', caption: 'hi', hashtags: ['x'], authorId: 'u1', kind: 'post', deleted: true, createdAt: 1000 });
  });

  it('hooks re-read the row and upsert on an external index', async () => {
    const index = indexStub();
    const indexer = new SearchIndexer(prismaStub(), index);
    await indexer.onModuleInit();
    expect(index.ensureIndexes).toHaveBeenCalledOnce();
    indexer.product('p1');
    indexer.user('u1');
    indexer.post('po1');
    await flush();
    expect(index.upsert).toHaveBeenCalledWith('products', [productDoc(product)]);
    expect(index.upsert).toHaveBeenCalledWith('users', [userDoc(user)]);
    expect(index.upsert).toHaveBeenCalledWith('posts', [postDoc(post)]);
  });

  it('never throws to the caller when the index or boot fails', async () => {
    const index = indexStub();
    index.upsert.mockRejectedValue(new Error('meili down'));
    index.ensureIndexes.mockRejectedValue(new Error('meili down'));
    const indexer = new SearchIndexer(prismaStub(), index);
    await expect(indexer.onModuleInit()).resolves.toBeUndefined();
    expect(() => indexer.product('p1')).not.toThrow();
    await flush();
    expect(index.upsert).toHaveBeenCalled();
  });

  it('is inert on the postgres backend', async () => {
    const index = indexStub('postgres');
    const prisma = prismaStub();
    const indexer = new SearchIndexer(prisma, index);
    await indexer.onModuleInit();
    indexer.user('u1');
    await flush();
    expect(index.ensureIndexes).not.toHaveBeenCalled();
    expect(index.upsert).not.toHaveBeenCalled();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('reindexAll walks every table in batches until exhausted', async () => {
    const index = indexStub();
    const prisma = prismaStub();
    prisma.product.findMany.mockResolvedValueOnce([product]).mockResolvedValueOnce([]);
    prisma.user.findMany.mockResolvedValueOnce([user]).mockResolvedValueOnce([]);
    prisma.post.findMany.mockResolvedValueOnce([post]).mockResolvedValueOnce([]);
    const counts = await new SearchIndexer(prisma, index).reindexAll();
    expect(counts).toEqual({ products: 1, users: 1, posts: 1 });
    expect(index.ensureIndexes).toHaveBeenCalledOnce();
    expect(index.upsert).toHaveBeenCalledTimes(3);
  });
});
