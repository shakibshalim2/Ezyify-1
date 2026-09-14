import 'reflect-metadata';
import { createApp } from './bootstrap.js';
import { loadEnv } from './config.js';

const env = loadEnv();
const app = await createApp(env);
await app.listen({ port: env.PORT, host: '0.0.0.0' });
console.log(`Ezyify API listening on http://localhost:${env.PORT}/${env.API_PREFIX} (docs: /${env.API_PREFIX}/docs)`);
