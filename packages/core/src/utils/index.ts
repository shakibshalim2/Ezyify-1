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

/** "3h ago" / "2d ago" for recent times, otherwise an absolute "Sep 8" — never "Sep 8 ago". */
export function formatTimeAgo(iso: string, now = Date.now()): string {
  const r = formatRelativeTime(iso, now);
  return r === 'now' ? 'just now' : /^\d+[mhd]$/.test(r) ? `${r} ago` : r;
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

/* ------------------------------------------------------------------ */
/* Avatars — deterministic initials fallback, no third‑party service    */
/* ------------------------------------------------------------------ */

/** Brand‑adjacent palette that reads well on both themes (bg, fg). */
const AVATAR_PALETTE: readonly [string, string][] = [
  ['#0F66C7', '#FFFFFF'],
  ['#FF6F22', '#FFFFFF'],
  ['#7C5CFF', '#FFFFFF'],
  ['#0E9F6E', '#FFFFFF'],
  ['#D9366B', '#FFFFFF'],
  ['#0B7285', '#FFFFFF'],
  ['#B7791F', '#FFFFFF'],
  ['#5C6AC4', '#FFFFFF'],
];

/** Stable 32‑bit FNV‑1a hash so the same name always gets the same colour. */
export function stableHash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** "Sara Ahmed" → "SA", "@sara" → "S", "" → "?" */
export function initialsOf(name: string): string {
  const words = name.replace(/^@/, '').trim().split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : '';
  return (first + last).toUpperCase();
}

export function avatarColors(seed: string): { background: string; foreground: string } {
  const [background, foreground] = AVATAR_PALETTE[stableHash(seed) % AVATAR_PALETTE.length]!;
  return { background, foreground };
}

/**
 * Inline SVG data URI for a user without a photo. Deterministic per name, renders offline and
 * satisfies a `img-src 'self' data:` CSP — no DiceBear / pravatar network round‑trips.
 */
export function avatarDataUri(name: string, size = 128): string {
  const { background, foreground } = avatarColors(name);
  const initials = initialsOf(name);
  const fontSize = initials.length > 1 ? size * 0.42 : size * 0.5;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" fill="${background}"/>` +
    `<text x="50%" y="50%" dy="0.36em" text-anchor="middle" font-family="Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-weight="600" font-size="${fontSize}" fill="${foreground}">${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Photo if present, otherwise the deterministic initials avatar. */
export function avatarUrlFor(user: { avatarUrl?: string | null; avatar?: string | null; name?: string | null; username?: string | null }, size = 128): string {
  return user.avatarUrl ?? user.avatar ?? avatarDataUri(user.name ?? user.username ?? '?', size);
}
