import { Logger } from '@nestjs/common';
import { loadEnv } from '../../config.js';
import { DEFAULT_ANDROID_CHANNEL, FcmProvider, type FcmHttp, type ServiceAccount } from './fcm.provider.js';
import { NotificationsService } from './notifications.service.js';
import type { PrismaService } from '../../infra/prisma/prisma.service.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db', JWT_ACCESS_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'b'.repeat(32) };
const account = { project_id: 'ezyify-test', client_email: 'fcm@ezyify-test.iam.gserviceaccount.com', private_key: '-----BEGIN PRIVATE KEY-----\nx\n-----END PRIVATE KEY-----\n' };

const response = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status });
const stubHttp = (fetchImpl: FcmHttp['fetch']): FcmHttp & { tokenCalls: ServiceAccount[] } => {
  const tokenCalls: ServiceAccount[] = [];
  return {
    tokenCalls,
    fetch: fetchImpl,
    async accessToken(acc) {
      tokenCalls.push(acc);
      return 'ya29.stub';
    },
  };
};

beforeAll(() => Logger.overrideLogger(false));

describe('FcmProvider', () => {
  it('is disabled without a service account and reports that on send', async () => {
    const p = new FcmProvider(loadEnv(base), stubHttp(() => Promise.resolve(response(200))));
    expect(p.enabled).toBe(false);
    expect(await p.send({ token: 't', title: 'a', body: 'b', data: {} })).toMatchObject({ ok: false, status: 0, unregistered: false });
  });

  it('rejects a malformed service account at construction', () => {
    expect(() => new FcmProvider(loadEnv({ ...base, FCM_SERVICE_ACCOUNT_JSON: JSON.stringify({ project_id: 'x' }) }))).toThrow(/project_id\/client_email\/private_key/);
  });

  it('POSTs an HTTP v1 message per device with the minted bearer token and android channel', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const http = stubHttp(async (url, init) => {
      calls.push({ url: String(url), init: init! });
      return response(200, { name: 'projects/ezyify-test/messages/1' });
    });
    const p = new FcmProvider(loadEnv({ ...base, FCM_SERVICE_ACCOUNT_JSON: JSON.stringify(account) }), http);
    expect(p.enabled).toBe(true);
    const r = await p.send({ token: 'device-1', title: 'Order shipped', body: 'EZ-1 is on the way', data: { orderId: 'o1' } });
    expect(r).toEqual({ ok: true });
    expect(http.tokenCalls[0]).toEqual(account);
    expect(calls[0].url).toBe('https://fcm.googleapis.com/v1/projects/ezyify-test/messages:send');
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe('Bearer ya29.stub');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.message).toEqual({
      token: 'device-1',
      notification: { title: 'Order shipped', body: 'EZ-1 is on the way' },
      data: { orderId: 'o1' },
      android: { priority: 'HIGH', notification: { channel_id: DEFAULT_ANDROID_CHANNEL } },
    });
  });

  it('flags UNREGISTERED / NOT_FOUND / 404 tokens for deletion and other errors as retryable', async () => {
    const env = loadEnv({ ...base, FCM_SERVICE_ACCOUNT_JSON: JSON.stringify(account) });
    const unregistered = new FcmProvider(env, stubHttp(async () => response(400, { error: { status: 'INVALID_ARGUMENT', details: [{ '@type': 'type.googleapis.com/google.firebase.fcm.v1.FcmError', errorCode: 'UNREGISTERED' }] } })));
    expect(await unregistered.send({ token: 'gone', title: 'a', body: 'b', data: {} })).toMatchObject({ ok: false, status: 400, unregistered: true, error: 'UNREGISTERED' });
    const notFound = new FcmProvider(env, stubHttp(async () => response(404, { error: { status: 'NOT_FOUND' } })));
    expect(await notFound.send({ token: 'gone', title: 'a', body: 'b', data: {} })).toMatchObject({ ok: false, unregistered: true });
    const quota = new FcmProvider(env, stubHttp(async () => response(429, { error: { status: 'RESOURCE_EXHAUSTED' } })));
    expect(await quota.send({ token: 'ok', title: 'a', body: 'b', data: {} })).toMatchObject({ ok: false, status: 429, unregistered: false, error: 'RESOURCE_EXHAUSTED' });
    const garbage = new FcmProvider(env, stubHttp(async () => new Response('<html>', { status: 502 })));
    expect(await garbage.send({ token: 'ok', title: 'a', body: 'b', data: {} })).toMatchObject({ ok: false, status: 502, unregistered: false });
  });
});

describe('NotificationsService.push', () => {
  const devices = [
    { id: 'd1', token: 'live-token' },
    { id: 'd2', token: 'dead-token' },
    { id: 'd3', token: 'flaky-token' },
  ];
  const prismaStub = () => {
    const deleted: unknown[] = [];
    return {
      deleted,
      device: { findMany: vi.fn().mockResolvedValue(devices), deleteMany: vi.fn(async (args: unknown) => void deleted.push(args)) },
    };
  };

  it('logs and counts devices when FCM is disabled', async () => {
    const prisma = prismaStub();
    const svc = new NotificationsService(prisma as unknown as PrismaService, { enabled: false, send: vi.fn() });
    expect(await svc.push('u1', 'Hi', 'there')).toBe(3);
    expect(prisma.device.deleteMany).not.toHaveBeenCalled();
  });

  it('sends per device, deletes unregistered tokens, tolerates transport throws', async () => {
    const prisma = prismaStub();
    const send = vi.fn(async ({ token }: { token: string }) => {
      if (token === 'live-token') return { ok: true as const };
      if (token === 'dead-token') return { ok: false as const, status: 404, unregistered: true };
      throw new Error('socket hang up');
    });
    const svc = new NotificationsService(prisma as unknown as PrismaService, { enabled: true, send });
    expect(await svc.push('u1', 'Hi', 'there', { k: 'v' }, 'orders')).toBe(1);
    expect(send).toHaveBeenCalledTimes(3);
    expect(send.mock.calls[0][0]).toMatchObject({ data: { k: 'v' }, channelId: 'orders' });
    expect(prisma.deleted).toEqual([{ where: { token: { in: ['dead-token'] } } }]);
  });

  it('returns 0 without touching the transport when the user has no devices', async () => {
    const prisma = prismaStub();
    prisma.device.findMany.mockResolvedValueOnce([]);
    const send = vi.fn();
    const svc = new NotificationsService(prisma as unknown as PrismaService, { enabled: true, send });
    expect(await svc.push('u1', 'Hi', 'there')).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });
});
