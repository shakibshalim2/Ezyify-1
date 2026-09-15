import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ENV, type Env } from '../../config.js';

export interface Mailer {
  readonly enabled: boolean;
  sendOtp(to: string, code: string): Promise<void>;
  sendResetLink(to: string, token: string): Promise<void>;
}

export const MAILER = Symbol('MAILER');
export const MAIL_FETCH = Symbol('MAIL_FETCH');
const RESEND_URL = 'https://api.resend.com/emails';
const BRAND_BLUE = '#0B5FD6';

/**
 * Transactional email via Resend's REST API. Without `RESEND_API_KEY` we log the code in non-production only; in
 * production a missing key is a warning, never a leaked secret.
 */
@Injectable()
export class MailProvider implements Mailer {
  private readonly log = new Logger(MailProvider.name);
  private readonly fetchImpl: typeof fetch;

  constructor(@Inject(ENV) private readonly env: Env, @Optional() @Inject(MAIL_FETCH) fetchImpl?: typeof fetch) {
    this.fetchImpl = fetchImpl ?? ((input, init) => fetch(input, init));
  }

  get enabled() {
    return !!this.env.RESEND_API_KEY;
  }

  async sendOtp(to: string, code: string) {
    if (!this.enabled) return this.fallback('verify', to, code);
    await this.deliver('verify', {
      to,
      subject: `${code} is your Ezyify verification code`,
      text: `Your Ezyify verification code is ${code}. It expires in 10 minutes. If you didn't request it, ignore this email.`,
      html: layout('Verify your email', `<p style="margin:0 0 16px">Enter this code in the app to finish signing up. It expires in <strong>10 minutes</strong>.</p>${codeBlock(code)}<p style="color:#64748B;font-size:13px;margin:16px 0 0">Didn't create an Ezyify account? You can safely ignore this email.</p>`),
    });
  }

  async sendResetLink(to: string, token: string) {
    const url = `${this.env.WEB_APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
    if (!this.enabled) return this.fallback('reset', to, url);
    await this.deliver('reset', {
      to,
      subject: 'Reset your Ezyify password',
      text: `We received a request to reset your Ezyify password. Open this link within 10 minutes: ${url}\nIf you didn't ask for this, ignore this email — your password stays the same.`,
      html: layout('Reset your password', `<p style="margin:0 0 20px">Tap the button below within <strong>10 minutes</strong> to choose a new password.</p><p style="margin:0 0 20px"><a href="${url}" style="display:inline-block;background:${BRAND_BLUE};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px">Reset password</a></p><p style="color:#64748B;font-size:13px;margin:0">If the button doesn't work, copy this link:<br><span style="word-break:break-all">${url}</span></p><p style="color:#64748B;font-size:13px;margin:16px 0 0">Didn't request this? Ignore this email — your password stays the same.</p>`),
    });
  }

  private async deliver(kind: 'verify' | 'reset', msg: { to: string; subject: string; text: string; html: string }) {
    const res = await this.fetchImpl(RESEND_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${this.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: this.env.MAIL_FROM, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      // Status + kind + recipient only: subject and response body could echo the code.
      throw new Error(`Resend ${res.status} sending ${kind} email to ${msg.to}${body ? ` (${body.slice(0, 120)})` : ''}`);
    }
  }

  private fallback(purpose: 'verify' | 'reset', to: string, secret: string) {
    if (this.env.NODE_ENV === 'production') this.log.warn(`RESEND_API_KEY unset — ${purpose} email to ${to} not sent`);
    else this.log.log(`[${purpose}] ${purpose === 'reset' ? 'reset link' : 'OTP'} for ${to}: ${secret}`);
  }
}

const codeBlock = (code: string) => `<p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:36px;letter-spacing:10px;font-weight:700;color:#0F172A;background:#F1F5F9;border-radius:12px;padding:18px 24px;text-align:center">${code}</p>`;

const layout = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#F8FAFC;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F172A">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0">
<tr><td style="background:${BRAND_BLUE};color:#fff;padding:20px 28px;font-size:20px;font-weight:700;letter-spacing:-0.2px">Ezyify</td></tr>
<tr><td style="padding:28px"><h1 style="margin:0 0 12px;font-size:22px">${title}</h1>${body}</td></tr>
<tr><td style="padding:16px 28px;color:#94A3B8;font-size:12px;border-top:1px solid #E2E8F0">© Ezyify · Shop, share and go live — securely.</td></tr>
</table></td></tr></table></body></html>`;
