import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { createApiClient, ApiError, type TokenStore } from './client.js';

const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify({ success: true, data }), { status, headers: { 'Content-Type': 'application/json' } });
const fail = (code: string, status: number) =>
  new Response(JSON.stringify({ success: false, error: { code, message: code } }), { status });

function tokens(initial: string | null, refreshed: string | null = null): TokenStore & { current: string | null } {
  const store = {
    current: initial,
    getAccessToken: () => store.current,
    setAccessToken: (t: string | null) => void (store.current = t),
    refresh: vi.fn(async () => refreshed),
  };
  return store;
}

describe('createApiClient', () => {
  it('sends bearer token and validates the envelope', async () => {
    const fetch = vi.fn(async () => ok({ id: 'u1' }));
    const api = createApiClient({ baseUrl: 'https://api.test/v1', tokens: tokens('abc'), fetch });
    const data = await api.get('/users/me', z.object({ id: z.string() }));
    expect(data).toEqual({ id: 'u1' });
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.test/v1/users/me');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc');
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const t = tokens('old', 'new');
    const fetch = vi.fn().mockResolvedValueOnce(fail('UNAUTHORIZED', 401)).mockResolvedValueOnce(ok({ id: 'u1' }));
    const api = createApiClient({ baseUrl: 'https://api.test', tokens: t, fetch });
    await api.get('/users/me', z.object({ id: z.string() }));
    expect(t.refresh).toHaveBeenCalledTimes(1);
    expect(t.current).toBe('new');
    const [, init] = fetch.mock.calls[1] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer new');
  });

  it('signals session expiry when refresh fails', async () => {
    const onSessionExpired = vi.fn();
    const fetch = vi.fn(async () => fail('UNAUTHORIZED', 401));
    const api = createApiClient({ baseUrl: 'https://api.test', tokens: tokens('old', null), fetch, onSessionExpired, retries: 0 });
    await expect(api.get('/users/me', z.any())).rejects.toBeInstanceOf(ApiError);
    expect(onSessionExpired).toHaveBeenCalled();
  });

  it('retries transient GET failures with backoff, but not POST', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockResolvedValueOnce(fail('SERVER_ERROR', 503)).mockResolvedValueOnce(ok({ n: 1 }));
    const api = createApiClient({ baseUrl: 'https://api.test', tokens: tokens(null), fetch, retries: 2 });
    const p = api.get('/x', z.object({ n: z.number() }), { auth: false });
    await vi.runAllTimersAsync();
    expect(await p).toEqual({ n: 1 });
    expect(fetch).toHaveBeenCalledTimes(2);

    const post = vi.fn(async () => fail('SERVER_ERROR', 503));
    const api2 = createApiClient({ baseUrl: 'https://api.test', tokens: tokens(null), fetch: post, retries: 2 });
    await expect(api2.post('/x', {}, z.any(), { auth: false })).rejects.toMatchObject({ code: 'SERVER_ERROR', status: 503 });
    expect(post).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('rejects malformed payloads instead of returning garbage', async () => {
    const fetch = vi.fn(async () => ok({ id: 42 }));
    const api = createApiClient({ baseUrl: 'https://api.test', tokens: tokens(null), fetch });
    await expect(api.get('/x', z.object({ id: z.string() }), { auth: false })).rejects.toMatchObject({ code: 'SERVER_ERROR' });
  });
});
