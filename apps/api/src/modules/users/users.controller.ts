import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { UsersService, UpdateProfileSchema } from './users.service.js';
import { toUserSummary } from './users.mapper.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Public, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AccessClaims) {
    return this.users.profile('me', user.sub);
  }

  @Get('me/account')
  account(@CurrentUser() user: AccessClaims) {
    return this.users.account(user.sub);
  }

  @Patch('me')
  update(@CurrentUser() user: AccessClaims, @Body(zod(UpdateProfileSchema)) body: z.infer<typeof UpdateProfileSchema>) {
    return this.users.update(user.sub, body);
  }

  @Get(':username')
  @Public()
  profile(@Param('username') username: string, @CurrentUser() user?: AccessClaims) {
    return this.users.profile(username, user?.sub);
  }

  @Get(':username/followers')
  @Public()
  async followers(@Param('username') username: string, @CurrentUser() user?: AccessClaims) {
    return (await this.users.followers(username, 'followers', user?.sub, user?.role)).map(toUserSummary);
  }

  @Get(':username/following')
  @Public()
  async following(@Param('username') username: string, @CurrentUser() user?: AccessClaims) {
    return (await this.users.followers(username, 'following', user?.sub, user?.role)).map(toUserSummary);
  }

  @Post(':username/follow')
  follow(@CurrentUser() user: AccessClaims, @Param('username') username: string) {
    return this.users.follow(user.sub, username);
  }

  @Delete(':username/follow')
  unfollow(@CurrentUser() user: AccessClaims, @Param('username') username: string) {
    return this.users.unfollow(user.sub, username);
  }
}
