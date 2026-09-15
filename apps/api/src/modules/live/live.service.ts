import { Inject, Injectable } from '@nestjs/common';
import { AccessToken, type VideoGrant } from 'livekit-server-sdk';
import { z } from 'zod';
import { ENV, type Env } from '../../config.js';
import { serviceUnavailable } from '../../common/errors.js';
import { MessagingService } from '../messaging/messaging.service.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { forbidden } from '../../common/errors.js';

export const LiveTokenSchema = z.object({
  room: z.string().regex(/^[\w.-]{1,64}$/, 'Room names are 1-64 word characters, dots or dashes'),
  role: z.enum(['host', 'viewer']),
});
export const CallTokenSchema = z.object({ conversationId: z.string().min(1) });
export type LiveTokenRequest = z.infer<typeof LiveTokenSchema>;

/** Hosts publish; viewers only subscribe and send data messages (live chat / reactions). */
const GRANTS: Record<LiveTokenRequest['role'], VideoGrant> = {
  host: { roomJoin: true, roomCreate: true, canPublish: true, canSubscribe: true, canPublishData: true },
  viewer: { roomJoin: true, canPublish: false, canSubscribe: true, canPublishData: true },
};
const LIVE_TOKEN_TTL = '2h';
const CALL_TOKEN_TTL = '1h';
/** 503 + `details.code = LIVE_UNAVAILABLE`: the spec `code` enum stays valid for clients, which key on `details.code`. */
export const liveUnavailable = () => serviceUnavailable('Live video', 'LIVE_UNAVAILABLE');

interface Identity {
  sub: string;
  username: string;
  name?: string;
}

@Injectable()
export class LiveService {
  constructor(@Inject(ENV) private readonly env: Env, private readonly messaging: MessagingService, private readonly prisma: PrismaService) {}

  get enabled() {
    return !!(this.env.LIVEKIT_API_KEY && this.env.LIVEKIT_API_SECRET && this.env.LIVEKIT_URL);
  }

  /** Live-shopping room. A persisted session's room may only be published by its host. */
  async roomToken(user: Identity, body: LiveTokenRequest) {
    if (body.role === 'host') {
      const session = await this.prisma.liveSession.findUnique({ where: { id: body.room }, select: { hostId: true } });
      if (session && session.hostId !== user.sub) throw forbidden('Only the live session host can publish to this room');
    }
    return this.mint(user, body.room, GRANTS[body.role], LIVE_TOKEN_TTL);
  }

  /** 1:1 voice/video call inside an existing conversation — membership is the authorisation. */
  async callToken(user: Identity, conversationId: string) {
    this.requireEnabled();
    await this.messaging.assertMember(user.sub, conversationId);
    return this.mint(user, `call-${conversationId}`, { roomJoin: true, roomCreate: true, canPublish: true, canSubscribe: true, canPublishData: true }, CALL_TOKEN_TTL);
  }

  private async mint(user: Identity, room: string, grant: VideoGrant, ttl: string) {
    this.requireEnabled();
    const at = new AccessToken(this.env.LIVEKIT_API_KEY, this.env.LIVEKIT_API_SECRET, { identity: user.sub, name: user.username, ttl });
    at.addGrant({ ...grant, room });
    return { token: await at.toJwt(), url: this.env.LIVEKIT_URL!, room, identity: user.sub };
  }

  private requireEnabled() {
    if (!this.enabled) throw liveUnavailable();
  }
}
