import { Global, Module } from '@nestjs/common';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';
import { SearchIndexer } from './search.indexer.js';
import { SEARCH_INDEX } from './search.index.js';
import { MeilisearchIndex } from './meilisearch.index.js';
import { PostgresSearchIndex } from './postgres.index.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ENV, type Env } from '../../config.js';

/** Global so catalog/feed/users can inject `SearchIndexer` without a circular module import. */
@Global()
@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchIndexer,
    {
      provide: SEARCH_INDEX,
      inject: [ENV, PrismaService],
      useFactory: (env: Env, prisma: PrismaService) => (env.MEILISEARCH_HOST && env.MEILISEARCH_API_KEY ? new MeilisearchIndex(env) : new PostgresSearchIndex(prisma)),
    },
  ],
  exports: [SearchService, SearchIndexer, SEARCH_INDEX],
})
export class SearchModule {}
