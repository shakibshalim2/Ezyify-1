import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AccessClaims, AuthedRequest } from './auth.guard.js';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AccessClaims | undefined => {
  return ctx.switchToHttp().getRequest<AuthedRequest>().user;
});
