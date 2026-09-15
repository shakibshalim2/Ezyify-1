import type { EscrowStatus, OrderStatus } from '../../generated/prisma/enums.js';

/**
 * Order + escrow state machine (BACKEND_API_SPECIFICATION §10, MASTER_PLAN Phase 5).
 * Money is held from `paid` until the buyer confirms delivery (or the auto-release timer fires),
 * then released to the seller minus platform fee. Refund/dispute paths move funds back.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled', 'refund_requested'],
  processing: ['shipped', 'cancelled', 'refund_requested'],
  shipped: ['out_for_delivery', 'delivered', 'refund_requested'],
  out_for_delivery: ['delivered', 'refund_requested'],
  delivered: ['completed', 'refund_requested', 'disputed'],
  completed: ['refund_requested'],
  // Resuming after a withdrawn/declined request goes back to wherever fulfilment was.
  refund_requested: ['refunded', 'disputed', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'],
  disputed: ['refunded', 'completed'],
  cancelled: [],
  refunded: [],
};

export const ESCROW_FOR_STATUS: Partial<Record<OrderStatus, EscrowStatus>> = {
  completed: 'released',
  refunded: 'refunded',
  cancelled: 'refunded',
  disputed: 'disputed',
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return ORDER_TRANSITIONS[from].includes(to);
}

/** Who may trigger which transition. `system` covers cron/webhooks. */
export type Actor = 'buyer' | 'seller' | 'admin' | 'system';
const ALLOWED: Partial<Record<OrderStatus, Actor[]>> = {
  paid: ['system', 'buyer', 'admin'],
  processing: ['seller', 'admin'],
  shipped: ['seller', 'admin'],
  out_for_delivery: ['seller', 'system', 'admin'],
  delivered: ['seller', 'system', 'admin'],
  completed: ['buyer', 'system', 'admin'],
  cancelled: ['buyer', 'seller', 'admin'],
  refund_requested: ['buyer', 'admin'],
  refunded: ['seller', 'admin', 'system'],
  disputed: ['buyer', 'seller', 'admin'],
};
export function actorMay(actor: Actor, to: OrderStatus) {
  return (ALLOWED[to] ?? ['admin']).includes(actor);
}
