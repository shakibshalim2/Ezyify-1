import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import { map, type Observable } from 'rxjs';

export const RAW = Symbol('RAW_RESPONSE');
/** Controllers return plain data; this wraps it as `{ success:true, data }`. Return `raw(x)` to bypass (webhooks, health). */
export const raw = <T>(value: T) => ({ [RAW]: true, value });

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map(data => {
        if (data && typeof data === 'object' && RAW in data) return (data as { value: unknown }).value;
        return { success: true, data: data === undefined ? null : data };
      }),
    );
  }
}
