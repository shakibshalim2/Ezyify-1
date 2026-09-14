import { actorMay, canTransition, ESCROW_FOR_STATUS, ORDER_TRANSITIONS } from './escrow.js';

describe('escrow state machine', () => {
  it('follows the happy path paid → processing → shipped → delivered → completed', () => {
    const path = ['paid', 'processing', 'shipped', 'delivered', 'completed'] as const;
    for (let i = 0; i < path.length - 1; i++) expect(canTransition(path[i], path[i + 1])).toBe(true);
    expect(ESCROW_FOR_STATUS.completed).toBe('released');
  });

  it('never leaves terminal states', () => {
    expect(ORDER_TRANSITIONS.refunded).toEqual([]);
    expect(ORDER_TRANSITIONS.cancelled).toEqual([]);
    expect(canTransition('completed', 'paid')).toBe(false);
  });

  it('refund paths move escrow back to the buyer', () => {
    expect(canTransition('delivered', 'refund_requested')).toBe(true);
    expect(canTransition('refund_requested', 'refunded')).toBe(true);
    expect(ESCROW_FOR_STATUS.refunded).toBe('refunded');
    expect(ESCROW_FOR_STATUS.disputed).toBe('disputed');
  });

  it('enforces who can trigger which transition', () => {
    expect(actorMay('buyer', 'completed')).toBe(true);
    expect(actorMay('buyer', 'shipped')).toBe(false);
    expect(actorMay('seller', 'shipped')).toBe(true);
    expect(actorMay('seller', 'refund_requested')).toBe(false);
    expect(actorMay('system', 'completed')).toBe(true);
    expect(actorMay('admin', 'disputed')).toBe(true);
  });
});
