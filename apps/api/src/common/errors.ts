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
  constructor(public readonly code: Code, message: string, public readonly details?: Record<string, string>) {
    super({ success: false, error: { code, message, details } }, STATUS[code]);
  }
}

export const notFound = (what: string) => new ApiException('NOT_FOUND', `${what} not found`);
export const forbidden = (msg = 'You do not have access to this resource') => new ApiException('FORBIDDEN', msg);
export const unauthorized = (msg = 'Authentication required') => new ApiException('UNAUTHORIZED', msg);
export const conflict = (msg: string) => new ApiException('CONFLICT', msg);
export const validation = (details: Record<string, string>, msg = 'Request validation failed') => new ApiException('VALIDATION_ERROR', msg, details);
