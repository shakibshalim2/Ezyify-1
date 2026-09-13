import { Injectable, type PipeTransform } from '@nestjs/common';
import type { ZodTypeAny, z } from 'zod';
import { validation } from './errors.js';

/** Validates a body/query against a `@ezyify/core` schema so the API can never drift from the client contract. */
@Injectable()
export class ZodPipe<T extends ZodTypeAny> implements PipeTransform<unknown, z.infer<T>> {
  constructor(private readonly schema: T) {}
  transform(value: unknown): z.infer<T> {
    const r = this.schema.safeParse(value);
    if (r.success) return r.data;
    const details: Record<string, string> = {};
    for (const i of r.error.issues) details[i.path.join('.') || '_'] = i.message;
    throw validation(details);
  }
}
export const zod = <T extends ZodTypeAny>(schema: T) => new ZodPipe(schema);
