import { HttpException, HttpStatus } from '@nestjs/common';
import type { ApiErrorBody } from '@ezyify/core';

type Code = ApiErrorBody['code'];
const STATUS: Record<Code, number> = {
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  VALIDATION_ERROR: HttpStatus.UNPROCESSABLE_ENTITY,
  RATE_LIMIT_EXCEEDED: HttpStatus.TOO_MANY_REQUESTS,
  CONFLICT: HttpStatus.CONFLICT,
  SERVER_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
  NETWORK_ERROR: HttpStatus.BAD_GATEWAY,
};

/** Every thrown error carries a spec error code so the client's `ApiError` maps 1:1. */
export class ApiException extends HttpException {
  /** `status` overrides the default mapping (e.g. 503 for a disabled provider) while keeping a spec `code`. */
  constructor(public readonly code: Code, message: string, public readonly details?: Record<string, string>, status: number = STATUS[code]) {
    super({ success: false, error: { code, message, details } }, status);
  }
}

/** Provider not configured on this deployment → 503. `details.code` carries the feature-specific reason (e.g. LIVE_UNAVAILABLE). */
export const serviceUnavailable = (feature: string, reason: string) => new ApiException('SERVER_ERROR', `${feature} is not enabled on this server`, { code: reason }, HttpStatus.SERVICE_UNAVAILABLE);

export const notFound = (what: string) => new ApiException('NOT_FOUND', `${what} not found`);
export const forbidden = (msg = 'You do not have access to this resource') => new ApiException('FORBIDDEN', msg);
export const unauthorized = (msg = 'Authentication required') => new ApiException('UNAUTHORIZED', msg);
export const conflict = (msg: string) => new ApiException('CONFLICT', msg);
export const validation = (details: Record<string, string>, msg = 'Request validation failed') => new ApiException('VALIDATION_ERROR', msg, details);
