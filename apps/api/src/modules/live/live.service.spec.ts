import { TokenVerifier } from 'livekit-server-sdk';
import { loadEnv } from '../../config.js';
import { ApiException } from '../../common/errors.js';
import { LiveService } from './live.service.js';
import type { MessagingService } from '../messaging/messaging.service.js';
import type { PrismaService } from '../../infra/prisma/prisma.service.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db', JWT_ACCESS_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'b'.repeat(32) };
const livekit = { LIVEKIT_URL: 'wss://ezyify.livekit.cloud', LIVEKIT_API_KEY: 'APIabc123', LIVEKIT_API_SECRET: 's'.repeat(48) };
const user = { sub: 'u_maya', username: 'fashionista_maya' };

const messaging = (member: boolean) =>
  ({
    assertMember: vi.fn(async () => {
      if (!member) throw new ApiException('NOT_FOUND', 'Conversation not found');
    }),
  }) as unknown as MessagingService;

const prisma = (hostId: string | null = null) => ({
  liveSession: { findUnique: vi.fn(async () => (hostId ? { hostId } : null)) },
}) as unknown as PrismaService;

describe('LiveService', () => {
  it('reports disabled and throws 503 LIVE_UNAVAILABLE when LiveKit env is unset', async () => {
    const svc = new LiveService(loadEnv(base), messaging(true), prisma());
    expect(svc.enabled).toBe(false);
    const err = await svc.roomToken(user, { room: 'r1', role: 'host' }).catch(e => e as ApiException);
    expect(err).toBeInstanceOf(ApiException);
    expect((err as ApiException).getStatus()).toBe(503);
    expect((err as ApiException).getResponse()).toMatchObject({ success: false, error: { code: 'SERVER_ERROR', details: { code: 'LIVE_UNAVAILABLE' } } });
    await expect(svc.callToken(user, 'c1')).rejects.toMatchObject({ details: { code: 'LIVE_UNAVAILABLE' } });
  });

  it('host tokens can create + publish; viewer tokens can only subscribe and send data', async () => {
    const svc = new LiveService(loadEnv({ ...base, ...livekit }), messaging(true), prisma());
    const verifier = new TokenVerifier(livekit.LIVEKIT_API_KEY, livekit.LIVEKIT_API_SECRET);

    const host = await svc.roomToken(user, { room: 'maya-live', role: 'host' });
    expect(host.url).toBe(livekit.LIVEKIT_URL);
    expect(host.room).toBe('maya-live');
    const hostClaims = await verifier.verify(host.token);
    expect(hostClaims.sub).toBe('u_maya');
    expect(hostClaims.name).toBe('fashionista_maya');
    expect(hostClaims.video).toMatchObject({ room: 'maya-live', roomJoin: true, roomCreate: true, canPublish: true, canSubscribe: true, canPublishData: true });

    const viewer = await svc.roomToken({ sub: 'u_buyer', username: 'buyer' }, { room: 'maya-live', role: 'viewer' });
    const viewerClaims = await verifier.verify(viewer.token);
    expect(viewerClaims.video).toMatchObject({ room: 'maya-live', roomJoin: true, canPublish: false, canSubscribe: true, canPublishData: true });
    expect(viewerClaims.video?.roomCreate).toBeFalsy();
  });

  it('call tokens require conversation membership and use the call-<id> room', async () => {
    const env = loadEnv({ ...base, ...livekit });
    const ok = new LiveService(env, messaging(true), prisma());
    const r = await ok.callToken(user, 'c_buyer_maya');
    expect(r.room).toBe('call-c_buyer_maya');
    const claims = await new TokenVerifier(livekit.LIVEKIT_API_KEY, livekit.LIVEKIT_API_SECRET).verify(r.token);
    expect(claims.video).toMatchObject({ room: 'call-c_buyer_maya', canPublish: true, canSubscribe: true });

    const denied = new LiveService(env, messaging(false), prisma());
    await expect(denied.callToken(user, 'c_other')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('only permits a persisted session host to mint a host token', async () => {
    const svc = new LiveService(loadEnv({ ...base, ...livekit }), messaging(true), prisma('u_maya'));
    await expect(svc.roomToken({ sub: 'u_buyer', username: 'buyer' }, { room: 'live-001', role: 'host' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(svc.roomToken(user, { room: 'live-001', role: 'host' })).resolves.toMatchObject({ room: 'live-001' });
  });
});
