import { Logger } from '@nestjs/common';
import { loadEnv } from '../../config.js';
import { MailProvider } from './mail.provider.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db', JWT_ACCESS_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'b'.repeat(32) };
const prod = { ...base, NODE_ENV: 'production', JWT_ACCESS_SECRET: 'x'.repeat(40), JWT_REFRESH_SECRET: 'y'.repeat(40), CORS_ORIGINS: 'https://ezyify.app' };
const CODE = '482913';
const TOKEN = 'reset-token-abc';

type Call = { url: string; init: RequestInit };
const capture = (status = 200) => {
  const calls: Call[] = [];
  const fetchImpl: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init: init! });
    return new Response(JSON.stringify({ id: 'em_1' }), { status });
  };
  return { calls, fetchImpl };
};

/** Collects every line Nest's Logger would print so we can assert what leaks. */
const spyLogger = () => {
  const lines: string[] = [];
  const push = (m: unknown) => void lines.push(String(m));
  Logger.overrideLogger({ log: push, error: push, warn: push, debug: push, verbose: push, fatal: push });
  return lines;
};
afterEach(() => Logger.overrideLogger(false));

describe('MailProvider', () => {
  it('without RESEND_API_KEY in development it logs the OTP and reset link instead of sending', async () => {
    const lines = spyLogger();
    const { calls, fetchImpl } = capture();
    const mail = new MailProvider(loadEnv(base), fetchImpl);
    expect(mail.enabled).toBe(false);
    await mail.sendOtp('a@ezyify.test', CODE);
    await mail.sendResetLink('a@ezyify.test', TOKEN);
    expect(calls).toHaveLength(0);
    expect(lines.some(l => l.includes(CODE))).toBe(true);
    expect(lines.some(l => l.includes(`https://ezyify.app/reset-password?token=${TOKEN}`))).toBe(true);
  });

  it('in production without a key it warns but never logs the code or token', async () => {
    const lines = spyLogger();
    const mail = new MailProvider(loadEnv(prod), capture().fetchImpl);
    await mail.sendOtp('a@ezyify.test', CODE);
    await mail.sendResetLink('a@ezyify.test', TOKEN);
    expect(lines.length).toBe(2);
    expect(lines.join('\n')).not.toContain(CODE);
    expect(lines.join('\n')).not.toContain(TOKEN);
  });

  it('sends a branded OTP email through Resend with MAIL_FROM', async () => {
    const lines = spyLogger();
    const { calls, fetchImpl } = capture();
    const mail = new MailProvider(loadEnv({ ...prod, RESEND_API_KEY: 're_test_123', MAIL_FROM: 'Ezyify <hello@ezyify.app>' }), fetchImpl);
    expect(mail.enabled).toBe(true);
    await mail.sendOtp('buyer@ezyify.test', CODE);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.resend.com/emails');
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe('Bearer re_test_123');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body).toMatchObject({ from: 'Ezyify <hello@ezyify.app>', to: ['buyer@ezyify.test'], subject: `${CODE} is your Ezyify verification code` });
    expect(body.html).toContain('#0B5FD6');
    expect(body.html).toContain('monospace');
    expect(body.html).toContain(CODE);
    expect(body.text).toContain(CODE);
    expect(lines.join('\n')).not.toContain(CODE);
  });

  it('builds the reset link from WEB_APP_URL and URL-encodes the token', async () => {
    const { calls, fetchImpl } = capture();
    const mail = new MailProvider(loadEnv({ ...prod, RESEND_API_KEY: 're_test_123', WEB_APP_URL: 'https://app.example.com' }), fetchImpl);
    await mail.sendResetLink('x@ezyify.test', 'a+b/c');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.subject).toBe('Reset your Ezyify password');
    expect(body.html).toContain('https://app.example.com/reset-password?token=a%2Bb%2Fc');
    expect(body.text).toContain('https://app.example.com/reset-password?token=a%2Bb%2Fc');
  });

  it('surfaces provider failures as errors that do not include the secret', async () => {
    const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({ message: 'invalid from' }), { status: 422 });
    const mail = new MailProvider(loadEnv({ ...prod, RESEND_API_KEY: 're_test_123' }), fetchImpl);
    await expect(mail.sendOtp('x@ezyify.test', CODE)).rejects.toThrow(/Resend 422/);
    await expect(mail.sendOtp('x@ezyify.test', CODE)).rejects.not.toThrow(new RegExp(CODE));
  });
});
