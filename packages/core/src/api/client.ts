import type { z } from 'zod';
import { envelope, type ApiErrorBody } from '../schemas/common.js';

export class ApiError extends Error {
  readonly code: ApiErrorBody['code'];
  readonly status: number;
  readonly details?: Record<string, string>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }

  get isAuthError() {
    return this.code === 'UNAUTHORIZED';
  }
}

export interface TokenStore {
  getAccessToken(): string | null | Promise<string | null>;
  setAccessToken(token: string | null): void | Promise<void>;
  /** Returns a fresh access token or null when the session is gone. Web relies on the httpOnly cookie; native passes the stored refresh token. */
  refresh(): Promise<string | null>;
}

export interface ApiClientOptions {
  baseUrl: string;
  tokens: TokenStore;
  fetch?: typeof fetch;
  /** Static headers on every request, e.g. `{ 'X-Client': 'native' }` so the API returns refresh tokens in the body. */
  headers?: Record<string, string>;
  /** Called after a refresh fails so the host app can route to login. */
  onSessionExpired?: () => void;
  timeoutMs?: number;
  retries?: number;
}

interface RequestOptions<T extends z.ZodTypeAny> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  schema: T;
  auth?: boolean;
  signal?: AbortSignal;
  /** Per-request headers (e.g. `Idempotency-Key` on checkout). */
  headers?: Record<string, string>;
}

const RETRYABLE = new Set([408, 425, 429, 500, 502, 503, 504]);

function buildUrl(baseUrl: string, path: string, query?: RequestOptions<z.ZodTypeAny>['query']) {
  const url = new URL(path.replace(/^\//, ''), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  if (query) {
    for (const [k, v] of Object.entries(query)) if (v !== undefined) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

/**
 * Typed fetch wrapper shared by web and native:
 * bearer auth, one silent refresh on 401, bounded retry with backoff on transient failures,
 * timeout via AbortController, and zod-validated envelopes so bad payloads fail loudly in dev.
 */
export function createApiClient(options: ApiClientOptions) {
  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  const timeoutMs = options.timeoutMs ?? 15_000;
  const maxRetries = options.retries ?? 2;
  let refreshing: Promise<string | null> | null = null;

  const refreshOnce = () => {
    refreshing ??= options.tokens.refresh().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  async function request<T extends z.ZodTypeAny>(path: string, opts: RequestOptions<T>): Promise<z.infer<T>> {
    const method = opts.method ?? 'GET';
    const url = buildUrl(options.baseUrl, path, opts.query);
    const useAuth = opts.auth ?? true;

    let attempt = 0;
    let refreshed = false;

    for (;;) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      opts.signal?.addEventListener('abort', () => controller.abort(), { once: true });

      const headers: Record<string, string> = { Accept: 'application/json', ...options.headers, ...opts.headers };
      if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
      if (useAuth) {
        const token = await options.tokens.getAccessToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }

      let res: Response;
      try {
        res = await fetchImpl(url, {
          method,
          headers,
          body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
          credentials: 'include',
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timer);
        if (opts.signal?.aborted) throw err;
        if (attempt < maxRetries && method === 'GET') {
          await backoff(attempt++);
          continue;
        }
        throw new ApiError(0, { code: 'NETWORK_ERROR', message: 'Network request failed' });
      }
      clearTimeout(timer);

      if (res.status === 401 && useAuth && !refreshed) {
        refreshed = true;
        const token = await refreshOnce();
        if (token) {
          await options.tokens.setAccessToken(token);
          continue;
        }
        options.onSessionExpired?.();
      }

      if (RETRYABLE.has(res.status) && attempt < maxRetries && method === 'GET') {
        await backoff(attempt++);
        continue;
      }

      const json: unknown = res.status === 204 ? { success: true, data: null } : await res.json().catch(() => null);
      const parsed = envelope(opts.schema).safeParse(json) as
        | { success: true; data: { success: true; data: z.infer<T> } | { success: false; error: ApiErrorBody } }
        | { success: false };
      if (!parsed.success) {
        if (!res.ok) throw new ApiError(res.status, { code: statusToCode(res.status), message: res.statusText || 'Request failed' });
        throw new ApiError(res.status, { code: 'SERVER_ERROR', message: `Malformed response for ${method} ${path}` });
      }
      if (!parsed.data.success) throw new ApiError(res.status, parsed.data.error);
      return parsed.data.data;
    }
  }

  return {
    request,
    get: <T extends z.ZodTypeAny>(path: string, schema: T, opts: Omit<RequestOptions<T>, 'schema' | 'method' | 'body'> = {}) =>
      request(path, { ...opts, schema, method: 'GET' }),
    post: <T extends z.ZodTypeAny>(path: string, body: unknown, schema: T, opts: Omit<RequestOptions<T>, 'schema' | 'method' | 'body'> = {}) =>
      request(path, { ...opts, schema, method: 'POST', body }),
    patch: <T extends z.ZodTypeAny>(path: string, body: unknown, schema: T, opts: Omit<RequestOptions<T>, 'schema' | 'method' | 'body'> = {}) =>
      request(path, { ...opts, schema, method: 'PATCH', body }),
    delete: <T extends z.ZodTypeAny>(path: string, schema: T, opts: Omit<RequestOptions<T>, 'schema' | 'method' | 'body'> = {}) =>
      request(path, { ...opts, schema, method: 'DELETE' }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

function statusToCode(status: number): ApiErrorBody['code'] {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 422 || status === 400) return 'VALIDATION_ERROR';
  if (status === 429) return 'RATE_LIMIT_EXCEEDED';
  return 'SERVER_ERROR';
}

function backoff(attempt: number) {
  const base = 250 * 2 ** attempt;
  return new Promise(r => setTimeout(r, base + Math.random() * 100));
}
