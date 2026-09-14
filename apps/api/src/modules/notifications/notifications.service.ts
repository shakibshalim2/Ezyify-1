import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Notification, RegisterDeviceRequest } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ENV, type Env } from '../../config.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { toUserSummary } from '../users/users.mapper.js';
import type { z } from 'zod';
import type { Prisma } from '../../generated/prisma/client.js';

type Row = Prisma.NotificationGetPayload<{ include: { actor: true } }>;
const toNotification = (n: Row): Notification => ({ id: n.id, type: n.type, actor: n.actor ? toUserSummary(n.actor) : null, message: n.message, href: n.href, thumbnailUrl: n.thumbnailUrl, read: !!n.readAt, createdAt: n.createdAt.toISOString() });

@Injectable()
export class NotificationsService {
  private readonly log = new Logger(NotificationsService.name);
  constructor(private readonly prisma: PrismaService, @Inject(ENV) private readonly env: Env) {}

  async list(userId: string, q: z.infer<typeof PageQuerySchema>) {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where: { recipientId: userId }, include: { actor: true }, orderBy: { createdAt: 'desc' }, ...skipTake(q) }),
      this.prisma.notification.count({ where: { recipientId: userId } }),
    ]);
    return page(rows.map(toNotification), total, q);
  }

  async unreadCount(userId: string) {
    return { count: await this.prisma.notification.count({ where: { recipientId: userId, readAt: null } }) };
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({ where: { id, recipientId: userId }, data: { readAt: new Date() } });
    return { ok: true as const };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { recipientId: userId, readAt: null }, data: { readAt: new Date() } });
    return { ok: true as const };
  }

  async registerDevice(userId: string, body: RegisterDeviceRequest) {
    await this.prisma.device.upsert({
      where: { token: body.token },
      create: { userId, ...body },
      update: { userId, platform: body.platform, provider: body.provider, appVersion: body.appVersion, locale: body.locale, lastSeenAt: new Date() },
    });
    return { ok: true as const };
  }

  async unregisterDevice(userId: string, token: string) {
    await this.prisma.device.deleteMany({ where: { token, userId } });
    return { ok: true as const };
  }

  /** FCM HTTP v1 delivery; without a service account we log instead so dev/test never hit the network. */
  async push(userId: string, title: string, body: string, data: Record<string, string> = {}) {
    const devices = await this.prisma.device.findMany({ where: { userId } });
    if (!devices.length) return 0;
    if (!this.env.FCM_SERVICE_ACCOUNT_JSON) {
      this.log.debug(`push→${userId} [${devices.length} device(s)] ${title}: ${body} ${JSON.stringify(data)}`);
      return devices.length;
    }
    // Real FCM v1 send lands in Phase 6 (google-auth-library → fcm.googleapis.com/v1/projects/{id}/messages:send).
    return devices.length;
  }
}
