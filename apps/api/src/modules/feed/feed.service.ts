import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { Comment, Post } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { forbidden, notFound } from '../../common/errors.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import type { Prisma } from '../../generated/prisma/client.js';
import type { PostKind } from '../../generated/prisma/enums.js';
import { toUserSummary } from '../users/users.mapper.js';
import { SearchIndexer } from '../search/search.indexer.js';

export const CreatePostSchema = z.object({
  kind: z.enum(['post', 'loop', 'story']).default('post'),
  caption: z.string().max(2200).default(''),
  hashtags: z.array(z.string().regex(/^[\w]+$/)).max(30).default([]),
  media: z
    .array(z.object({ type: z.enum(['image', 'video']), url: z.string().url(), thumbnailUrl: z.string().url().nullable().default(null), width: z.number().int().positive().nullable().default(null), height: z.number().int().positive().nullable().default(null), durationMs: z.number().int().positive().nullable().default(null) }))
    .min(1)
    .max(10),
  taggedProductIds: z.array(z.string()).max(10).default([]),
  location: z.string().max(80).nullable().default(null),
});
export const CommentBodySchema = z.object({ text: z.string().min(1).max(1000) });
export const FeedQuerySchema = PageQuerySchema.extend({ kind: z.enum(['post', 'loop', 'story']).optional(), author: z.string().optional(), hashtag: z.string().optional() });

export const postInclude = { author: true, media: { orderBy: { position: 'asc' } }, products: { select: { productId: true } } } satisfies Prisma.PostInclude;
type PostRow = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export const toPost = (p: PostRow, liked: Set<string>, saved: Set<string>): Post => ({
  id: p.id,
  kind: p.kind,
  author: toUserSummary(p.author),
  caption: p.caption,
  hashtags: p.hashtags,
  media: p.media.map(m => ({ type: m.type, url: m.url, thumbnailUrl: m.thumbnailUrl, width: m.width, height: m.height, durationMs: m.durationMs })),
  taggedProductIds: p.products.map(x => x.productId),
  engagement: { likes: p.likeCount, comments: p.commentCount, shares: p.shareCount, saves: p.saveCount, views: p.viewCount, isLiked: liked.has(p.id), isSaved: saved.has(p.id) },
  location: p.location,
  createdAt: p.createdAt.toISOString(),
});

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService, private readonly indexer: SearchIndexer) {}

  /**
   * Feed ranking v1: followed authors first, then recency with an engagement boost. Blocked users (either direction)
   * are excluded. Ranking moves to a materialised score in Phase 7 when volume warrants it.
   */
  async list(q: z.infer<typeof FeedQuerySchema>, viewerId?: string) {
    const blocked = viewerId ? await this.blockedIds(viewerId) : [];
    const where: Prisma.PostWhereInput = {
      deletedAt: null,
      ...(q.kind ? { kind: q.kind } : { kind: { not: 'story' } }),
      ...(q.hashtag ? { hashtags: { has: q.hashtag.replace(/^#/, '') } } : {}),
      ...(blocked.length ? { authorId: { notIn: blocked } } : {}),
      // Private accounts: only the owner and accepted followers see their posts.
      author: { ...(q.author ? { username: q.author } : {}), OR: [{ isPrivate: false }, ...(viewerId ? [{ id: viewerId }, { followers: { some: { followerId: viewerId } } }] : [])] },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({ where, include: postInclude, orderBy: [{ createdAt: 'desc' }], ...skipTake(q) }),
      this.prisma.post.count({ where }),
    ]);
    const { liked, saved } = await this.viewerState(viewerId, rows.map(r => r.id));
    return page(rows.map(r => toPost(r, liked, saved)), total, q);
  }

  async stories(viewerId?: string) {
    const following = viewerId ? (await this.prisma.follow.findMany({ where: { followerId: viewerId }, select: { followingId: true } })).map(f => f.followingId) : [];
    const rows = await this.prisma.post.findMany({
      where: { kind: 'story', deletedAt: null, expiresAt: { gt: new Date() }, ...(following.length ? { authorId: { in: following } } : {}) },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const { liked, saved } = await this.viewerState(viewerId, rows.map(r => r.id));
    return rows.map(r => toPost(r, liked, saved));
  }

  async saved(viewerId: string, q: z.infer<typeof PageQuerySchema>) {
    const where: Prisma.PostWhereInput = { deletedAt: null, saves: { some: { userId: viewerId } } };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({ where, include: postInclude, orderBy: [{ createdAt: 'desc' }], ...skipTake(q) }),
      this.prisma.post.count({ where }),
    ]);
    const { liked, saved } = await this.viewerState(viewerId, rows.map(r => r.id));
    return page(rows.map(r => toPost(r, liked, saved)), total, q);
  }

  async get(id: string, viewerId?: string) {
    const row = await this.prisma.post.findFirst({ where: { id, deletedAt: null }, include: postInclude });
    if (!row) throw notFound('Post');
    await this.prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => undefined);
    const { liked, saved } = await this.viewerState(viewerId, [id]);
    return toPost(row, liked, saved);
  }

  async create(authorId: string, body: z.infer<typeof CreatePostSchema>) {
    const row = await this.prisma.post.create({
      data: {
        kind: body.kind as PostKind,
        authorId,
        caption: body.caption,
        hashtags: body.hashtags.map(h => h.toLowerCase()),
        location: body.location,
        expiresAt: body.kind === 'story' ? new Date(Date.now() + 24 * 3600_000) : null,
        media: { create: body.media.map((m, i) => ({ ...m, position: i })) },
        products: { create: body.taggedProductIds.map(productId => ({ productId })) },
      },
      include: postInclude,
    });
    this.indexer.post(row.id);
    return toPost(row, new Set(), new Set());
  }

  async remove(userId: string, role: string, id: string) {
    const post = await this.prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) throw notFound('Post');
    if (post.authorId !== userId && !['admin', 'superadmin'].includes(role)) throw forbidden();
    await this.prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
    this.indexer.post(id);
    return { ok: true as const };
  }

  async like(userId: string, postId: string, on: boolean) {
    const post = await this.prisma.post.findFirst({ where: { id: postId, deletedAt: null }, select: { authorId: true } });
    if (!post) throw notFound('Post');
    const existing = await this.prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });
    if (on && !existing) {
      await this.prisma.$transaction([
        this.prisma.like.create({ data: { userId, postId } }),
        this.prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } }),
        ...(post.authorId !== userId ? [this.prisma.notification.create({ data: { recipientId: post.authorId, actorId: userId, type: 'like', message: 'liked your post.', href: `/post/${postId}` } })] : []),
      ]);
    } else if (!on && existing) {
      await this.prisma.$transaction([this.prisma.like.delete({ where: { userId_postId: { userId, postId } } }), this.prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } })]);
    }
    return { ok: true as const };
  }

  async save(userId: string, postId: string, on: boolean) {
    const existing = await this.prisma.save.findUnique({ where: { userId_postId: { userId, postId } } });
    if (on && !existing) await this.prisma.$transaction([this.prisma.save.create({ data: { userId, postId } }), this.prisma.post.update({ where: { id: postId }, data: { saveCount: { increment: 1 } } })]);
    if (!on && existing) await this.prisma.$transaction([this.prisma.save.delete({ where: { userId_postId: { userId, postId } } }), this.prisma.post.update({ where: { id: postId }, data: { saveCount: { decrement: 1 } } })]);
    return { ok: true as const };
  }

  async comments(postId: string, q: z.infer<typeof PageQuerySchema>) {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({ where: { postId }, include: { author: true }, orderBy: { createdAt: 'desc' }, ...skipTake(q) }),
      this.prisma.comment.count({ where: { postId } }),
    ]);
    return page(rows.map(toComment), total, q);
  }

  async comment(userId: string, postId: string, text: string): Promise<Comment> {
    const post = await this.prisma.post.findFirst({ where: { id: postId, deletedAt: null }, select: { authorId: true } });
    if (!post) throw notFound('Post');
    const [row] = await this.prisma.$transaction([
      this.prisma.comment.create({ data: { postId, authorId: userId, text }, include: { author: true } }),
      this.prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } }),
      ...(post.authorId !== userId ? [this.prisma.notification.create({ data: { recipientId: post.authorId, actorId: userId, type: 'comment', message: `commented: "${text.slice(0, 60)}"`, href: `/post/${postId}` } })] : []),
    ]);
    return toComment(row);
  }

  private async viewerState(viewerId: string | undefined, postIds: string[]) {
    if (!viewerId || !postIds.length) return { liked: new Set<string>(), saved: new Set<string>() };
    const [likes, saves] = await Promise.all([
      this.prisma.like.findMany({ where: { userId: viewerId, postId: { in: postIds } }, select: { postId: true } }),
      this.prisma.save.findMany({ where: { userId: viewerId, postId: { in: postIds } }, select: { postId: true } }),
    ]);
    return { liked: new Set(likes.map(l => l.postId)), saved: new Set(saves.map(s => s.postId)) };
  }

  private async blockedIds(viewerId: string) {
    const rows = await this.prisma.block.findMany({ where: { OR: [{ blockerId: viewerId }, { blockedId: viewerId }] } });
    return rows.map(b => (b.blockerId === viewerId ? b.blockedId : b.blockerId));
  }
}

const toComment = (c: Prisma.CommentGetPayload<{ include: { author: true } }>): Comment => ({ id: c.id, author: toUserSummary(c.author), text: c.text, likes: c.likeCount, createdAt: c.createdAt.toISOString() });
