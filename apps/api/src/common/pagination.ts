import { z } from 'zod';

export const PageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PageQuery = z.infer<typeof PageQuerySchema>;

export const skipTake = (q: PageQuery) => ({ skip: (q.page - 1) * q.pageSize, take: q.pageSize });

export const page = <T>(items: T[], total: number, q: PageQuery) => ({
  items,
  pagination: { page: q.page, pageSize: q.pageSize, total, hasMore: q.page * q.pageSize < total },
});
