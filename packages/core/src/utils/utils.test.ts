import { describe, it, expect } from 'vitest';
import { formatMoney, money, discountPercent, formatRelativeTime } from './index';

describe('utils', () => {
  it('formats money from minor units', () => {
    expect(formatMoney(money(19.99))).toBe('$19.99');
    expect(formatMoney({ amount: 150000, currency: 'IDR' })).toMatch(/150\.000/);
  });
  it('computes discount percent', () => {
    expect(discountPercent(money(80), money(100))).toBe(20);
    expect(discountPercent(money(100), money(80))).toBeNull();
  });
  it('formats relative time', () => {
    const now = Date.parse('2026-09-13T12:00:00Z');
    expect(formatRelativeTime('2026-09-13T11:58:00Z', now)).toBe('2m');
    expect(formatRelativeTime('2026-09-12T11:00:00Z', now)).toBe('1d');
  });
});
