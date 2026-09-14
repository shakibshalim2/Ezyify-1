import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { CommentBodySchema, CreatePostSchema, FeedQuerySchema, FeedService } from './feed.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Public, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { PageQuerySchema } from '../../common/pagination.js';

@ApiTags('feed')
@Controller()
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get('feed')
  @Public()
  home(@Query(zod(FeedQuerySchema)) q: z.infer<typeof FeedQuerySchema>, @CurrentUser() user?: AccessClaims) {
    return this.feed.list({ ...q, kind: q.kind ?? 'post' }, user?.sub);
  }

  @Get('loops')
  @Public()
  loops(@Query(zod(FeedQuerySchema)) q: z.infer<typeof FeedQuerySchema>, @CurrentUser() user?: AccessClaims) {
    return this.feed.list({ ...q, kind: 'loop' }, user?.sub);
  }

  @Get('stories')
  @Public()
  stories(@CurrentUser() user?: AccessClaims) {
    return this.feed.stories(user?.sub);
  }

  @Get('posts/:id')
  @Public()
  get(@Param('id') id: string, @CurrentUser() user?: AccessClaims) {
    return this.feed.get(id, user?.sub);
  }

  @Post('posts')
  create(@CurrentUser() user: AccessClaims, @Body(zod(CreatePostSchema)) body: z.infer<typeof CreatePostSchema>) {
    return this.feed.create(user.sub, body);
  }

  @Delete('posts/:id')
  remove(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.feed.remove(user.sub, user.role, id);
  }

  @Post('posts/:id/like')
  like(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.feed.like(user.sub, id, true);
  }

  @Delete('posts/:id/like')
  unlike(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.feed.like(user.sub, id, false);
  }

  @Post('posts/:id/save')
  save(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.feed.save(user.sub, id, true);
  }

  @Delete('posts/:id/save')
  unsave(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.feed.save(user.sub, id, false);
  }

  @Get('posts/:id/comments')
  @Public()
  comments(@Param('id') id: string, @Query(zod(PageQuerySchema)) q: z.infer<typeof PageQuerySchema>) {
    return this.feed.comments(id, q);
  }

  @Post('posts/:id/comments')
  comment(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Body(zod(CommentBodySchema)) body: z.infer<typeof CommentBodySchema>) {
    return this.feed.comment(user.sub, id, body.text);
  }
}
