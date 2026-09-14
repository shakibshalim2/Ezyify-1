import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { CatalogService, ProductQuerySchema } from './catalog.service.js';
import { Public } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';

@ApiTags('catalog')
@Controller()
@Public()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('products')
  list(@Query(zod(ProductQuerySchema)) q: z.infer<typeof ProductQuerySchema>) {
    return this.catalog.list(q);
  }

  @Get('products/:id')
  get(@Param('id') id: string) {
    return this.catalog.get(id);
  }

  @Get('categories')
  categories() {
    return this.catalog.categories();
  }

  @Get('search')
  search(@Query(zod(ProductQuerySchema)) q: z.infer<typeof ProductQuerySchema>) {
    return this.catalog.list(q);
  }
}
