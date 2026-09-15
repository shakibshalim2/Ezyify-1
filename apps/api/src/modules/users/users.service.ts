import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { UpdateProfileRequestSchema, type AccountDetails } from '@ezyify/core';
import { conflict, forbidden, notFound, validation } from '../../common/errors.js';
import { publicRole, toUserProfile } from './users.mapper.js';
import { SearchIndexer } from '../search/search.indexer.js';

/** Same contract the clients validate against (`@ezyify/core`), so `isPrivate` etc. can't drift. */
export const UpdateProfileSchema = UpdateProfileRequestSchema;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly indexer: SearchIndexer) {}

  async profile(usernameOrMe: string, viewerId?: string) {
    const where = usernameOrMe === 'me' ? { id: viewerId ?? '' } : { username: usernameOrMe };
    const user = await this.prisma.user.findFirst({ where: { ...where, deletedAt: null }, include: { _count: { select: { followers: true, following: true, posts: { where: { deletedAt: null, kind: { not: 'story' } } } } } } });
    if (!user) throw notFound('User');
    if (viewerId && viewerId !== user.id) {
      const blocked = await this.prisma.block.findFirst({ where: { OR: [{ blockerId: user.id, blockedId: viewerId }, { blockerId: viewerId, blockedId: user.id }] } });
      if (blocked) throw notFound('User');
    }
    const isFollowing = viewerId ? !!(await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: user.id } } })) : undefined;
    return toUserProfile(user, { followers: user._count.followers, following: user._count.following, posts: user._count.posts }, isFollowing);
  }

  async update(userId: string, body: z.infer<typeof UpdateProfileSchema>) {
    if (body.username) {
      const taken = await this.prisma.user.findFirst({ where: { username: body.username, NOT: { id: userId } }, select: { id: true } });
      if (taken) throw conflict('That username is taken');
    }
    await this.prisma.user.update({ where: { id: userId }, data: body });
    this.indexer.user(userId);
    return this.profile('me', userId);
  }

  async follow(followerId: string, username: string) {
    const target = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!target) throw notFound('User');
    if (target.id === followerId) throw validation({ username: "You can't follow yourself" });
    await this.prisma.follow.upsert({ where: { followerId_followingId: { followerId, followingId: target.id } }, create: { followerId, followingId: target.id }, update: {} });
    await this.prisma.notification.create({ data: { recipientId: target.id, actorId: followerId, type: 'follow', message: 'started following you.', href: `/profile/${await this.username(followerId)}` } });
    return { ok: true as const };
  }

  async unfollow(followerId: string, username: string) {
    const target = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!target) throw notFound('User');
    await this.prisma.follow.deleteMany({ where: { followerId, followingId: target.id } });
    return { ok: true as const };
  }

  /** Private accounts expose posts / followers / following only to the owner, admins and accepted followers. */
  async canSeeContent(target: { id: string; isPrivate: boolean }, viewerId?: string, viewerRole?: string) {
    if (!target.isPrivate) return true;
    if (!viewerId) return false;
    if (viewerId === target.id || viewerRole === 'admin' || viewerRole === 'superadmin') return true;
    return !!(await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: target.id } } }));
  }

  async account(userId: string): Promise<AccountDetails> {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true, emailVerified: true, phone: true, role: true, createdAt: true, deletedAt: true } });
    return { email: u.email, emailVerified: u.emailVerified, phone: u.phone, role: publicRole(u.role), createdAt: u.createdAt.toISOString(), deletionScheduledAt: u.deletedAt?.toISOString() ?? null };
  }

  async followers(username: string, kind: 'followers' | 'following', viewerId?: string, viewerRole?: string) {
    const user = await this.prisma.user.findUnique({ where: { username }, select: { id: true, isPrivate: true } });
    if (!user) throw notFound('User');
    if (!(await this.canSeeContent(user, viewerId, viewerRole))) throw forbidden('This account is private');
    const rows = kind === 'followers'
      ? await this.prisma.follow.findMany({ where: { followingId: user.id }, include: { follower: true }, take: 100 })
      : await this.prisma.follow.findMany({ where: { followerId: user.id }, include: { following: true }, take: 100 });
    return rows.map(r => ('follower' in r ? r.follower : r.following));
  }

  private async username(id: string) {
    return (await this.prisma.user.findUnique({ where: { id }, select: { username: true } }))?.username ?? '';
  }
}
