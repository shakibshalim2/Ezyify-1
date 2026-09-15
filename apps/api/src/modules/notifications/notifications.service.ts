import { Inject, Injectable, Logger } from '@nestjs/common';
import { resolveNotificationPreferences, type Notification, type NotificationCategory, type NotificationPreferences, type RegisterDeviceRequest, type UpdateNotificationPreferencesRequest } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { FCM_TRANSPORT, type FcmTransport } from './fcm.provider.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { toUserSummary } from '../users/users.mapper.js';
import type { z } from 'zod';
import type { Prisma } from '../../generated/prisma/client.js';

type Row = Prisma.NotificationGetPayload<{ include: { actor: true } }>;
const toNotification = (n: Row): Notification => ({ id: n.id, type: n.type, actor: n.actor ? toUserSummary(n.actor) : null, message: n.message, href: n.href, thumbnailUrl: n.thumbnailUrl, read: !!n.readAt, createdAt: n.createdAt.toISOString() });

@Injectable()
export class NotificationsService {
  private readonly log = new Logger(NotificationsService.name);
  constructor(private readonly prisma: PrismaService, @Inject(FCM_TRANSPORT) private readonly fcm: FcmTransport) {}

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

  /**
   * FCM HTTP v1 delivery per device; without a service account we log instead so dev/test never hit the network.
   * Returns the number of devices delivered to. Stale tokens (UNREGISTERED/NOT_FOUND) are deleted.
   */
  async preferences(userId: string): Promise<NotificationPreferences> {
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { notificationPrefs: true } });
    return resolveNotificationPreferences(u?.notificationPrefs);
  }

  async updatePreferences(userId: string, body: UpdateNotificationPreferencesRequest): Promise<NotificationPreferences> {
    const current = await this.preferences(userId);
    for (const k of Object.keys(body) as NotificationCategory[]) current[k] = { ...current[k], ...body[k] };
    await this.prisma.user.update({ where: { id: userId }, data: { notificationPrefs: current } });
    return current;
  }

  /** True when the recipient has push enabled for the channel (Android channel id == preference category). */
  async wantsPush(userId: string, channelId?: string) {
    if (!channelId) return true;
    const prefs = await this.preferences(userId);
    const cat = channelId as NotificationCategory;
    return cat in prefs ? prefs[cat].push : true;
  }

  async push(userId: string, title: string, body: string, data: Record<string, string> = {}, channelId?: string) {
    if (!(await this.wantsPush(userId, channelId))) return 0;
    const devices = await this.prisma.device.findMany({ where: { userId } });
    if (!devices.length) return 0;
    if (!this.fcm.enabled) {
      this.log.debug(`push→${userId} [${devices.length} device(s)] ${title}: ${body} ${JSON.stringify(data)}`);
      return devices.length;
    }
    let delivered = 0;
    const stale: string[] = [];
    await Promise.all(
      devices.map(async d => {
        const r = await this.fcm.send({ token: d.token, title, body, data, channelId }).catch((e: Error) => ({ ok: false as const, status: 0, unregistered: false, error: e.message }));
        if (r.ok) delivered++;
        else if (r.unregistered) stale.push(d.token);
        else this.log.warn(`push→${userId} device ${d.id} failed: ${r.error ?? r.status}`);
      }),
    );
    if (stale.length) await this.prisma.device.deleteMany({ where: { token: { in: stale } } }).catch(() => undefined);
    return delivered;
  }
}
