import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { Prisma } from '../../generated/prisma/client.js';
import { conflict, forbidden, notFound, validation } from '../../common/errors.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type { AccessClaims } from '../auth/auth.guard.js';

export const LiveSessionsQuerySchema = PageQuerySchema.extend({
  status: z.enum(['scheduled', 'live', 'ended']).default('live'),
  category: z.string().min(1).max(80).optional(),
  host: z.string().min(1).max(30).optional(),
});
export const CreateLiveSessionSchema = z.object({
  title: z.string().min(1).max(120),
  category: z.string().min(1).max(80).optional(),
  coverUrl: z.string().url().optional(),
  productIds: z.array(z.string().min(1)).max(50).optional(),
  scheduledFor: z.string().datetime().optional(),
});
export const PinLiveSessionSchema = z.object({ productId: z.string().min(1).nullable() });
export const LiveHeartbeatSchema = z.object({ like: z.boolean().optional() });

type SessionRow = Prisma.LiveSessionGetPayload<{
  include: { host: { select: { id: true; username: true; name: true; avatarUrl: true; verified: true; role: true } }; _count: { select: { viewers: true } } };
}>;
const sessionInclude = {
  host: { select: { id: true, username: true, name: true, avatarUrl: true, verified: true, role: true } },
  _count: { select: { viewers: true } },
} satisfies Prisma.LiveSessionInclude;

const toSession = (row: SessionRow) => ({
  id: row.id,
  room: row.id,
  title: row.title,
  host: row.host,
  status: row.status,
  category: row.category,
  coverUrl: row.coverUrl,
  productIds: row.productIds,
  pinnedProductId: row.pinnedProductId,
  viewers: row._count.viewers,
  peakViewers: row.peakViewers,
  likes: row.likes,
  scheduledFor: row.scheduledFor?.toISOString() ?? null,
  startedAt: row.startedAt?.toISOString() ?? null,
  endedAt: row.endedAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
});

@Injectable()
export class LiveSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: z.infer<typeof LiveSessionsQuerySchema>) {
    const where: Prisma.LiveSessionWhereInput = {
      status: q.status,
      ...(q.category ? { category: q.category } : {}),
      ...(q.host ? { host: { username: q.host } } : {}),
    };
    const now = new Date(Date.now() - 60_000);
    const orderBy: Prisma.LiveSessionOrderByWithRelationInput[] = q.status === 'scheduled'
      ? [{ scheduledFor: 'asc' }]
      : q.status === 'ended'
        ? [{ endedAt: 'desc' }]
        : [{ peakViewers: 'desc' }, { startedAt: 'desc' }];
    const include = {
      ...sessionInclude,
      _count: { select: { viewers: { where: { lastSeenAt: { gt: now } } } } },
    } satisfies Prisma.LiveSessionInclude;
    // Presence is a rolling 60-second count, so PostgreSQL's stored relation count cannot order it correctly.
    // Fetch the active status set and page it after sorting on that computed count.
    if (q.status === 'live') {
      const rows = await this.prisma.liveSession.findMany({ where, include, orderBy });
      rows.sort((a, b) => b._count.viewers - a._count.viewers || +(b.startedAt ?? 0) - +(a.startedAt ?? 0));
      const { skip, take } = skipTake(q);
      return page(rows.slice(skip, skip + take).map(toSession), rows.length, q);
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.liveSession.findMany({ where, include, orderBy, ...skipTake(q) }),
      this.prisma.liveSession.count({ where }),
    ]);
    return page(rows.map(toSession), total, q);
  }

  async get(id: string) {
    const row = await this.find(id);
    return toSession(row);
  }

  async create(user: AccessClaims, input: z.infer<typeof CreateLiveSessionSchema>) {
    if (!['seller', 'creator', 'admin', 'superadmin'].includes(user.role)) throw forbidden('Only sellers and creators can host live sessions');
    await this.assertProducts(input.productIds ?? []);
    const scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : null;
    const isScheduled = !!scheduledFor;
    const row = await this.prisma.liveSession.create({
      data: {
        hostId: user.sub,
        title: input.title,
        category: input.category ?? null,
        coverUrl: input.coverUrl ?? null,
        productIds: input.productIds ?? [],
        scheduledFor,
        status: isScheduled ? 'scheduled' : 'live',
        startedAt: isScheduled ? null : new Date(),
      },
      include: sessionInclude,
    });
    return toSession(row);
  }

  async start(user: AccessClaims, id: string) {
    const session = await this.find(id);
    this.assertHost(user, session.hostId);
    if (session.status !== 'scheduled') throw conflict('Only scheduled sessions can be started');
    return toSession(await this.prisma.liveSession.update({ where: { id }, data: { status: 'live', startedAt: new Date(), endedAt: null }, include: sessionInclude }));
  }

  async end(user: AccessClaims, id: string) {
    const session = await this.find(id);
    if (session.hostId !== user.sub && !this.isAdmin(user)) throw forbidden('Only the host or an admin can end this session');
    if (session.status !== 'live') throw conflict('Only live sessions can be ended');
    return toSession(await this.prisma.liveSession.update({ where: { id }, data: { status: 'ended', endedAt: new Date() }, include: sessionInclude }));
  }

  async pin(user: AccessClaims, id: string, productId: string | null) {
    const session = await this.find(id);
    this.assertHost(user, session.hostId);
    if (productId && !session.productIds.includes(productId)) throw validation({ productId: 'Pinned product must belong to this live session' });
    return toSession(await this.prisma.liveSession.update({ where: { id }, data: { pinnedProductId: productId }, include: sessionInclude }));
  }

  async heartbeat(user: AccessClaims, id: string, like = false) {
    const session = await this.find(id);
    if (session.status !== 'live') throw conflict('Only live sessions accept heartbeats');
    const seenAt = new Date();
    const activeAfter = new Date(seenAt.getTime() - 60_000);
    const result = await this.prisma.$transaction(async tx => {
      await tx.liveViewer.upsert({
        where: { sessionId_userId: { sessionId: id, userId: user.sub } },
        create: { sessionId: id, userId: user.sub, lastSeenAt: seenAt },
        update: { lastSeenAt: seenAt },
      });
      const viewers = await tx.liveViewer.count({ where: { sessionId: id, lastSeenAt: { gt: activeAfter } } });
      const updated = await tx.liveSession.update({
        where: { id },
        data: { ...(like ? { likes: { increment: 1 } } : {}), peakViewers: { set: Math.max(session.peakViewers, viewers) } },
        select: { likes: true },
      });
      return { viewers, likes: updated.likes };
    });
    return result;
  }

  private async find(id: string) {
    const activeAfter = new Date(Date.now() - 60_000);
    const row = await this.prisma.liveSession.findUnique({
      where: { id },
      include: { ...sessionInclude, _count: { select: { viewers: { where: { lastSeenAt: { gt: activeAfter } } } } } },
    });
    if (!row) throw notFound('Live session');
    return row;
  }

  private async assertProducts(productIds: string[]) {
    if (!productIds.length) return;
    const count = await this.prisma.product.count({ where: { id: { in: productIds }, published: true } });
    if (count !== new Set(productIds).size) throw validation({ productIds: 'One or more products do not exist or are unpublished' });
  }

  private assertHost(user: AccessClaims, hostId: string) {
    if (user.sub !== hostId) throw forbidden('Only the host can manage this session');
  }

  private isAdmin(user: AccessClaims) {
    return user.role === 'admin' || user.role === 'superadmin';
  }
}
