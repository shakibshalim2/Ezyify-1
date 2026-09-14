import { describe, it, expect } from 'vitest';
import { formatCompactNumber, formatRelativeTime, clamp, formatMoney } from './index.js';

describe('utils (edge cases)', () => {
  it('compact numbers for engagement counters', () => {
    expect(formatCompactNumber(999)).toBe('999');
    expect(formatCompactNumber(12_453)).toBe('12.5K');
    expect(formatCompactNumber(1_200_000)).toBe('1.2M');
  });
  it('relative time covers every bucket', () => {
    const now = Date.parse('2026-09-13T12:00:00Z');
    expect(formatRelativeTime('2026-09-13T11:59:50Z', now)).toBe('now');
    expect(formatRelativeTime('2026-09-13T09:00:00Z', now)).toBe('3h');
    expect(formatRelativeTime('2026-09-01T09:00:00Z', now)).toMatch(/Sep 1/);
    expect(formatRelativeTime('2027-01-01T00:00:00Z', now)).toBe('now'); // future never goes negative
  });
  it('clamp', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });
  it('formats zero-decimal currencies without decimals', () => {
    expect(formatMoney({ amount: 150000, currency: 'IDR' })).not.toMatch(/,00$/);
    expect(formatMoney({ amount: 1999, currency: 'EUR' })).toMatch(/19[.,]99/);
  });
});
