import { loadEnv } from './config.js';

const prod = { NODE_ENV: 'production', DATABASE_URL: 'postgresql://u:p@db:5432/e', JWT_ACCESS_SECRET: 'A'.repeat(48), JWT_REFRESH_SECRET: 'B'.repeat(48), CORS_ORIGINS: 'https://ezyify.app', MFA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64') };

describe('production env guardrails', () => {
  it('accepts a sane production config', () => {
    expect(loadEnv(prod).NODE_ENV).toBe('production');
  });
  it('rejects placeholder or shared secrets', () => {
    expect(() => loadEnv({ ...prod, JWT_ACCESS_SECRET: 'dev-access-secret-please-rotate-000000000000' })).toThrow(/placeholder/);
    expect(() => loadEnv({ ...prod, JWT_REFRESH_SECRET: prod.JWT_ACCESS_SECRET })).toThrow(/differ/);
  });
  it('requires a well-formed MFA_ENCRYPTION_KEY in production only', () => {
    expect(() => loadEnv({ ...prod, MFA_ENCRYPTION_KEY: undefined })).toThrow(/MFA_ENCRYPTION_KEY/);
    expect(() => loadEnv({ ...prod, MFA_ENCRYPTION_KEY: 'dG9vLXNob3J0' })).toThrow(/32 bytes/);
    expect(() => loadEnv({ ...prod, NODE_ENV: 'development', MFA_ENCRYPTION_KEY: undefined })).not.toThrow();
  });
  it('rejects wildcard / localhost CORS in production', () => {
    expect(() => loadEnv({ ...prod, CORS_ORIGINS: 'https://ezyify.app,http://localhost:5173' })).toThrow(/CORS/);
    expect(() => loadEnv({ ...prod, CORS_ORIGINS: '*' })).toThrow(/CORS/);
  });
});
