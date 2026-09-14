import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

/** Migrate + seed the test database once per vitest run. `.env.test` fills anything CI hasn't already set. */
export default function globalSetup() {
  const env: Record<string, string | undefined> = { ...process.env, NODE_ENV: 'test' };
  if (existsSync('.env.test')) {
    for (const line of readFileSync('.env.test', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) env[m[1]] = m[2];
    }
  }
  execSync('pnpm exec prisma migrate deploy', { stdio: 'inherit', env });
  execSync('node --import @swc-node/register/esm-register prisma/seed.ts', { stdio: 'inherit', env });
  Object.assign(process.env, env);
}
