import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchQuerySchema, SearchService, type SearchQuery } from './search.service.js';
import { Public } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';

/** `GET /search` — unified products/users/posts search. Guests may search; a session only adds block filtering. */
@ApiTags('search')
@Controller()
@Public()
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get('search')
  find(@Query(zod(SearchQuerySchema)) q: SearchQuery, @CurrentUser() user?: AccessClaims) {
    return this.search.search(q, user?.sub);
  }
}
