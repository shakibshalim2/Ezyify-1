import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ApiException } from './errors.js';
import { ThrottlerException } from '@nestjs/throttler';

/** Normalises every error into the spec envelope `{ success:false, error:{ code, message, details } }`. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger('Http');

  catch(exception: unknown, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    if (exception instanceof ApiException) {
      return reply.status(exception.getStatus()).send(exception.getResponse());
    }
    if (exception instanceof ThrottlerException) {
      return reply.status(429).send({ success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Slow down and try again.' } });
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code = status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : status === 409 ? 'CONFLICT' : status < 500 ? 'VALIDATION_ERROR' : 'SERVER_ERROR';
      const res = exception.getResponse();
      const message = typeof res === 'string' ? res : ((res as { message?: string | string[] }).message ?? exception.message);
      return reply.status(status).send({ success: false, error: { code, message: Array.isArray(message) ? message.join(', ') : message } });
    }
    this.log.error(exception instanceof Error ? exception.stack : String(exception));
    return reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ success: false, error: { code: 'SERVER_ERROR', message: 'Something went wrong on our side.' } });
  }
}
