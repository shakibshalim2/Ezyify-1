import { type CanActivate, type ExecutionContext, Inject, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';
import { ENV, type Env } from '../../config.js';
import { forbidden, unauthorized } from '../../common/errors.js';
import type { Role } from '../../generated/prisma/enums.js';

export interface AccessClaims {
  sub: string;
  email: string;
  role: Role;
  username: string;
}
export type AuthedRequest = FastifyRequest & { user: AccessClaims };

export const IS_PUBLIC = 'isPublic';
export const ROLES = 'roles';
/** Endpoint usable without a session (guest browsing, auth itself). Still parses a token when present. */
export const Public = (isPublic = true) => SetMetadata(IS_PUBLIC, isPublic);
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);

const LEVEL: Record<Role, number> = { user: 1, creator: 2, seller: 3, admin: 4, superadmin: 5 };

/** Bearer JWT guard with role hierarchy from the spec (seller ⊇ creator ⊇ user; admin ⊇ all). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly reflector: Reflector, @Inject(ENV) private readonly env: Env) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()]);
    const claims = await this.verify(req.headers.authorization);
    if (claims) req.user = claims;
    // Authorisation is decided by route metadata only; the request never influences whether the check applies.
    if (!isPublic && !claims) throw unauthorized('Authentication required or session invalid');

    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, [ctx.getHandler(), ctx.getClass()]);
    if (roles?.length) {
      const have = req.user ? LEVEL[req.user.role as Role] : 0;
      const need = Math.min(...roles.map(r => LEVEL[r]));
      const adminOverride = have >= LEVEL.admin;
      if (!adminOverride && have < need) throw forbidden();
    }
    return true;
  }

  /** Returns verified claims for a well-formed bearer token, otherwise null (never throws). */
  private async verify(header: string | undefined): Promise<AccessClaims | null> {
    if (!header?.startsWith('Bearer ')) return null;
    try {
      return await this.jwt.verifyAsync<AccessClaims>(header.slice(7), { secret: this.env.JWT_ACCESS_SECRET });
    } catch {
      return null;
    }
  }
}
