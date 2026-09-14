import { z } from 'zod';

export const IdSchema = z.string().min(1);
export const IsoDateSchema = z.string().datetime({ offset: true }).or(z.string().min(1));
export const CurrencySchema = z.enum(['USD', 'IDR', 'EUR', 'GBP']);

/** Money is always integer minor units (cents) on the wire; formatting is a UI concern. */
export const MoneySchema = z.object({
  amount: z.number().int(),
  currency: CurrencySchema,
});
export type Money = z.infer<typeof MoneySchema>;

export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  hasMore: z.boolean(),
});

export const paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: z.array(item), pagination: PaginationSchema });

export const ApiErrorSchema = z.object({
  code: z.enum([
    'UNAUTHORIZED',
    'FORBIDDEN',
    'NOT_FOUND',
    'VALIDATION_ERROR',
    'RATE_LIMIT_EXCEEDED',
    'CONFLICT',
    'SERVER_ERROR',
    'NETWORK_ERROR',
  ]),
  message: z.string(),
  details: z.record(z.string()).optional(),
});
export type ApiErrorBody = z.infer<typeof ApiErrorSchema>;

/** Envelope from BACKEND_API_SPECIFICATION.md: `{ success, message?, data }` / `{ success:false, error }`. */
export const envelope = <T extends z.ZodTypeAny>(data: T) =>
  z.discriminatedUnion('success', [
    z.object({ success: z.literal(true), message: z.string().optional(), data }),
    z.object({ success: z.literal(false), error: ApiErrorSchema }),
  ]);
