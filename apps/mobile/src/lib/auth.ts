import { ApiError, useRuntime } from '@ezyify/core';
import type { MobileRuntime } from './runtime';

/** The runtime mounted in `_layout.tsx` is the mobile one; expose its extra session helpers with the right type. */
export const useMobileRuntime = () => useRuntime() as MobileRuntime;

/** Maps an ApiError onto form fields (`details`) or a single banner message. */
export function formErrors(err: unknown, fallback = 'Something went wrong. Please try again.'): { fields: Record<string, string>; message: string | null } {
  if (err instanceof ApiError) {
    if (err.code === 'NETWORK_ERROR') return { fields: {}, message: "Can't reach Ezyify. Check your connection and try again." };
    if (err.details && Object.keys(err.details).length) return { fields: err.details, message: null };
    return { fields: {}, message: err.message || fallback };
  }
  return { fields: {}, message: fallback };
}
