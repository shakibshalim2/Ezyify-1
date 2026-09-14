import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type OnGatewayConnection, type OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ENV, type Env } from '../../config.js';
import type { AccessClaims } from '../auth/auth.guard.js';

/**
 * Realtime channel for chat + typing indicators + notification pushes.
 * Auth: `auth.token` (bearer access token) in the socket handshake; each user joins room `user:{id}`.
 */
@WebSocketGateway({ namespace: '/realtime', cors: { origin: true, credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly log = new Logger(ChatGateway.name);

  constructor(private readonly jwt: JwtService, @Inject(ENV) private readonly env: Env) {}

  async handleConnection(client: Socket) {
    const token = (client.handshake.auth as { token?: string })?.token ?? (client.handshake.headers.authorization?.replace(/^Bearer /, '') as string | undefined);
    try {
      const claims = await this.jwt.verifyAsync<AccessClaims>(token ?? '', { secret: this.env.JWT_ACCESS_SECRET });
      client.data.userId = claims.sub;
      await client.join(`user:${claims.sub}`);
    } catch {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Invalid or missing token' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) this.log.debug(`disconnect ${client.data.userId}`);
  }

  @SubscribeMessage('typing')
  typing(client: Socket, payload: { conversationId: string; to: string[] }) {
    for (const uid of payload.to ?? []) this.server.to(`user:${uid}`).emit('typing', { conversationId: payload.conversationId, userId: client.data.userId });
  }

  emitToUsers(userIds: string[], event: string, payload: unknown) {
    for (const uid of userIds) this.server?.to(`user:${uid}`).emit(event, payload);
  }
}
