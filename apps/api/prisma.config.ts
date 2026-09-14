import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'node --env-file=.env --import @swc-node/register/esm-register prisma/seed.ts' },
  datasource: { url: env('DATABASE_URL') },
});
