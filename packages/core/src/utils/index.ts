import type { Money } from '../schemas/common.js';

const LOCALE: Record<Money['currency'], string> = { USD: 'en-US', IDR: 'id-ID', EUR: 'de-DE', GBP: 'en-GB' };
const MINOR_UNITS: Record<Money['currency'], number> = { USD: 100, IDR: 1, EUR: 100, GBP: 100 };

export function formatMoney(money: Money, opts: { compact?: boolean } = {}): string {
  const value = money.amount / MINOR_UNITS[money.currency];
  return new Intl.NumberFormat(LOCALE[money.currency], {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: MINOR_UNITS[money.currency] === 1 ? 0 : 2,
    notation: opts.compact ? 'compact' : 'standard',
  }).format(value);
}

export function money(amountMajor: number, currency: Money['currency'] = 'USD'): Money {
  return { amount: Math.round(amountMajor * MINOR_UNITS[currency]), currency };
}

export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

/** "3m", "2h", "5d" style relative time for feeds; falls back to a short date beyond a week. */
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

/** Future-facing counterpart of `formatRelativeTime` ("in 6d", "in 3h", "in 12m"). */
export function formatTimeUntil(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return 'now';
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `in ${Math.max(1, m)}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `in ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `in ${d}d`;
  return `on ${new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })}`;
}

export function discountPercent(price: Money, compareAt: Money | null): number | null {
  if (!compareAt || compareAt.amount <= price.amount) return null;
  return Math.round((1 - price.amount / compareAt.amount) * 100);
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
