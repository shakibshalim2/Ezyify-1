import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { buildAppModule } from '../app.module.js';
import { loadEnv } from '../config.js';
import { SearchIndexer } from '../modules/search/search.indexer.js';

/** `pnpm search:reindex` — rebuild every Meilisearch index from Postgres. No-op (with a hint) on the Postgres fallback. */
const app = await NestFactory.createApplicationContext(buildAppModule(loadEnv()), { logger: ['warn', 'error'] });
const indexer = app.get(SearchIndexer);
if (!indexer.external) {
  console.log('MEILISEARCH_HOST is not set — the Postgres fallback needs no reindex.');
} else {
  const counts = await indexer.reindexAll();
  console.log(`Reindexed ${counts.products} products, ${counts.users} users, ${counts.posts} posts.`);
}
await app.close();
