import { loadEnv } from './config.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db', JWT_ACCESS_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'b'.repeat(32) };

describe('loadEnv', () => {
  it('applies defaults', () => {
    const env = loadEnv(base);
    expect(env.PORT).toBe(4000);
    expect(env.ACCESS_TOKEN_TTL_SECONDS).toBe(900);
    expect(env.PLATFORM_FEE_BPS).toBe(500);
  });
  it('refuses to boot with short secrets', () => {
    expect(() => loadEnv({ ...base, JWT_ACCESS_SECRET: 'short' })).toThrow(/JWT_ACCESS_SECRET/);
  });
});

describe('provider env', () => {
  it('defaults MAIL_FROM and WEB_APP_URL', () => {
    const env = loadEnv(base);
    expect(env.MAIL_FROM).toBe('Ezyify <no-reply@ezyify.app>');
    expect(env.WEB_APP_URL).toBe('https://ezyify.app');
  });
  it('LIVEKIT_API_KEY requires secret + url, in every environment', () => {
    expect(() => loadEnv({ ...base, LIVEKIT_API_KEY: 'APIx' })).toThrow(/LIVEKIT_API_SECRET.*\n.*LIVEKIT_URL|LIVEKIT_URL[\s\S]*LIVEKIT_API_SECRET|LIVEKIT_API_SECRET[\s\S]*LIVEKIT_URL/);
    expect(() => loadEnv({ ...base, LIVEKIT_API_KEY: 'APIx', LIVEKIT_API_SECRET: 's', LIVEKIT_URL: 'wss://lk.example.com' })).not.toThrow();
  });
  it('MEILISEARCH_HOST requires an API key', () => {
    expect(() => loadEnv({ ...base, MEILISEARCH_HOST: 'http://localhost:7700' })).toThrow(/MEILISEARCH_API_KEY/);
  });
});
