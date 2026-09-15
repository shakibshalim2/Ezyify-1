import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { SellerProductsController } from './seller-products.controller.js';
import { ReviewsController } from './reviews.controller.js';

@Module({ controllers: [CatalogController, SellerProductsController, ReviewsController], providers: [CatalogService], exports: [CatalogService] })
export class CatalogModule {}
