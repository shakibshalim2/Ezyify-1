import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { Conversation, Message } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { forbidden, notFound, validation } from '../../common/errors.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { toUserSummary } from '../users/users.mapper.js';
import type { Prisma } from '../../generated/prisma/client.js';

export const SendMessageSchema = z.object({ text: z.string().max(4000).optional(), productId: z.string().optional(), mediaUrl: z.string().url().optional() }).refine(b => b.text || b.productId || b.mediaUrl, { message: 'Message is empty' });
export const StartConversationSchema = z.object({ username: z.string().min(1) });

type MessageRow = Prisma.MessageGetPayload<Record<string, never>>;
const toMessage = (m: MessageRow): Message => ({
  id: m.id,
  conversationId: m.conversationId,
  senderId: m.senderId,
  text: m.text,
  media: m.mediaUrl ? { type: m.mediaType ?? 'image', url: m.mediaUrl, thumbnailUrl: null, width: null, height: null, durationMs: null } : null,
  productId: m.productId,
  status: m.status,
  createdAt: m.createdAt.toISOString(),
});

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  async conversations(userId: string): Promise<Conversation[]> {
    const rows = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: { participants: { include: { user: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
    const result: Conversation[] = [];
    for (const c of rows) {
      const me = c.participants.find(p => p.userId === userId);
      const unreadCount = await this.prisma.message.count({ where: { conversationId: c.id, senderId: { not: userId }, createdAt: me?.lastReadAt ? { gt: me.lastReadAt } : undefined } });
      const last = c.messages[0];
      result.push({
        id: c.id,
        participants: c.participants.filter(p => p.userId !== userId).map(p => toUserSummary(p.user)),
        lastMessage: last ? { text: last.text ?? (last.productId ? 'Shared a product' : 'Sent a photo'), at: last.createdAt.toISOString(), fromMe: last.senderId === userId } : null,
        unreadCount,
      });
    }
    return result;
  }

  /** Find-or-create the 1:1 thread; blocked pairs cannot open one. */
  async start(userId: string, username: string) {
    const other = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!other) throw notFound('User');
    if (other.id === userId) throw validation({ username: "You can't message yourself" });
    const blocked = await this.prisma.block.findFirst({ where: { OR: [{ blockerId: other.id, blockedId: userId }, { blockerId: userId, blockedId: other.id }] } });
    if (blocked) throw forbidden('You cannot message this user');
    const existing = await this.prisma.conversation.findFirst({ where: { AND: [{ participants: { some: { userId } } }, { participants: { some: { userId: other.id } } }] } });
    const convo = existing ?? (await this.prisma.conversation.create({ data: { participants: { create: [{ userId }, { userId: other.id }] } } }));
    return { id: convo.id };
  }

  async messages(userId: string, conversationId: string, q: z.infer<typeof PageQuerySchema>) {
    await this.assertMember(userId, conversationId);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'desc' }, ...skipTake(q) }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);
    await this.prisma.participant.update({ where: { conversationId_userId: { conversationId, userId } }, data: { lastReadAt: new Date() } });
    return page(rows.reverse().map(toMessage), total, q);
  }

  async send(userId: string, conversationId: string, body: z.infer<typeof SendMessageSchema>) {
    await this.assertMember(userId, conversationId);
    const [row] = await this.prisma.$transaction([
      this.prisma.message.create({ data: { conversationId, senderId: userId, text: body.text ?? null, productId: body.productId ?? null, mediaUrl: body.mediaUrl ?? null, mediaType: body.mediaUrl ? 'image' : null } }),
      this.prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
      this.prisma.participant.update({ where: { conversationId_userId: { conversationId, userId } }, data: { lastReadAt: new Date() } }),
    ]);
    return toMessage(row);
  }

  async recipients(conversationId: string, exceptUserId: string) {
    const rows = await this.prisma.participant.findMany({ where: { conversationId, userId: { not: exceptUserId } }, select: { userId: true } });
    return rows.map(r => r.userId);
  }

  private async assertMember(userId: string, conversationId: string) {
    const p = await this.prisma.participant.findUnique({ where: { conversationId_userId: { conversationId, userId } } });
    if (!p) throw notFound('Conversation');
  }
}
