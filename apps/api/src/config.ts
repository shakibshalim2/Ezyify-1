import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('v1'),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  COOKIE_DOMAIN: z.string().optional(),
  ESCROW_AUTO_RELEASE_DAYS: z.coerce.number().int().positive().default(7),
  PLATFORM_FEE_BPS: z.coerce.number().int().min(0).max(10_000).default(500),
  FCM_SERVICE_ACCOUNT_JSON: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default('Ezyify <no-reply@ezyify.app>'),
  WEB_APP_URL: z.string().url().default('https://ezyify.app'),
  MEILISEARCH_HOST: z.string().url().optional(),
  MEILISEARCH_API_KEY: z.string().optional(),
  LIVEKIT_URL: z.string().url().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional(),
}).superRefine((env, ctx) => {
  // A half-configured LiveKit deployment would mint tokens the server can't sign or point clients nowhere.
  if (env.LIVEKIT_API_KEY) {
    if (!env.LIVEKIT_API_SECRET) ctx.addIssue({ code: 'custom', path: ['LIVEKIT_API_SECRET'], message: 'required when LIVEKIT_API_KEY is set' });
    if (!env.LIVEKIT_URL) ctx.addIssue({ code: 'custom', path: ['LIVEKIT_URL'], message: 'required when LIVEKIT_API_KEY is set' });
  }
  if (env.MEILISEARCH_HOST && !env.MEILISEARCH_API_KEY) ctx.addIssue({ code: 'custom', path: ['MEILISEARCH_API_KEY'], message: 'required when MEILISEARCH_HOST is set' });
  // Production must never run with placeholder secrets or a permissive CORS list.
  if (env.NODE_ENV !== 'production') return;
  for (const k of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if (/change-me|dev-|test-|secret-please/i.test(env[k])) ctx.addIssue({ code: 'custom', path: [k], message: 'placeholder secret in production' });
  }
  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) ctx.addIssue({ code: 'custom', path: ['JWT_REFRESH_SECRET'], message: 'must differ from JWT_ACCESS_SECRET' });
  if (env.CORS_ORIGINS.split(',').some(o => o.trim() === '*' || o.includes('localhost'))) ctx.addIssue({ code: 'custom', path: ['CORS_ORIGINS'], message: 'wildcard/localhost origins not allowed in production' });
});

export type Env = z.infer<typeof EnvSchema>;

/** Fail fast on boot: a misconfigured secret must never start serving traffic. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n  ');
    throw new Error(`Invalid environment:\n  ${issues}`);
  }
  return parsed.data;
}

export const ENV = Symbol('ENV');
