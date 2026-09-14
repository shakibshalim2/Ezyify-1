import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { JWT } from 'google-auth-library';
import { ENV, type Env } from '../../config.js';

export interface FcmMessage {
  token: string;
  title: string;
  body: string;
  data: Record<string, string>;
  channelId?: string;
}

export type FcmSendResult = { ok: true } | { ok: false; status: number; unregistered: boolean; error?: string };

/** Transport seam used by NotificationsService; tests stub it. */
export interface FcmTransport {
  readonly enabled: boolean;
  send(message: FcmMessage): Promise<FcmSendResult>;
}

export interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

/** HTTP + OAuth2 seam so unit tests never touch Google. */
export interface FcmHttp {
  fetch: typeof fetch;
  accessToken(account: ServiceAccount): Promise<string>;
}

export const FCM_TRANSPORT = Symbol('FCM_TRANSPORT');
export const FCM_HTTP = Symbol('FCM_HTTP');
export const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
export const DEFAULT_ANDROID_CHANNEL = 'ezyify_default';

/** Real transport: service-account JWT → cached OAuth2 access token (google-auth-library refreshes it). */
export function googleFcmHttp(): FcmHttp {
  let client: JWT | undefined;
  return {
    fetch: (input, init) => fetch(input, init),
    async accessToken(account) {
      client ??= new JWT({ email: account.client_email, key: account.private_key, scopes: [FCM_SCOPE] });
      const { token } = await client.getAccessToken();
      if (!token) throw new Error('FCM: empty access token');
      return token;
    },
  };
}

/**
 * FCM HTTP v1 — one POST per device. `UNREGISTERED`/`NOT_FOUND` responses tell the caller to drop the token.
 * Without `FCM_SERVICE_ACCOUNT_JSON` the provider is disabled and the service logs instead.
 */
@Injectable()
export class FcmProvider implements FcmTransport {
  private readonly log = new Logger(FcmProvider.name);
  private readonly account: ServiceAccount | null;
  private readonly http: FcmHttp;

  constructor(@Inject(ENV) env: Env, @Optional() @Inject(FCM_HTTP) http?: FcmHttp) {
    this.account = parseServiceAccount(env.FCM_SERVICE_ACCOUNT_JSON);
    this.http = http ?? googleFcmHttp();
  }

  get enabled() {
    return !!this.account;
  }

  async send(message: FcmMessage): Promise<FcmSendResult> {
    if (!this.account) return { ok: false, status: 0, unregistered: false, error: 'FCM not configured' };
    const payload = {
      message: {
        token: message.token,
        notification: { title: message.title, body: message.body },
        data: message.data,
        android: { priority: 'HIGH', notification: { channel_id: message.channelId ?? DEFAULT_ANDROID_CHANNEL } },
      },
    };
    const res = await this.http.fetch(`https://fcm.googleapis.com/v1/projects/${this.account.project_id}/messages:send`, {
      method: 'POST',
      headers: { authorization: `Bearer ${await this.http.accessToken(this.account)}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    const body = await res.text().catch(() => '');
    const code = fcmErrorCode(body);
    const unregistered = res.status === 404 || code === 'UNREGISTERED' || code === 'NOT_FOUND';
    if (!unregistered) this.log.warn(`FCM send failed (${res.status}) ${code ?? body.slice(0, 200)}`);
    return { ok: false, status: res.status, unregistered, error: code ?? undefined };
  }
}

function parseServiceAccount(json: string | undefined): ServiceAccount | null {
  if (!json) return null;
  const parsed = JSON.parse(json) as Partial<ServiceAccount>;
  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) throw new Error('FCM_SERVICE_ACCOUNT_JSON is missing project_id/client_email/private_key');
  return parsed as ServiceAccount;
}

/** FCM v1 errors carry the reason either as `error.status` or in `details[].errorCode`. */
function fcmErrorCode(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { error?: { status?: string; details?: Array<{ errorCode?: string }> } };
    return parsed.error?.details?.find(d => d.errorCode)?.errorCode ?? parsed.error?.status ?? null;
  } catch {
    return null;
  }
}
