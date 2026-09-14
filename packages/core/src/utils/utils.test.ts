import { describe, it, expect } from 'vitest';
import { formatMoney, money, discountPercent, formatRelativeTime } from './index.js';

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

describe('avatars', () => {
  it('initials handle single, multi-word and handle-style names', async () => {
    const { initialsOf } = await import('./index.js');
    expect(initialsOf('Sara Ahmed')).toBe('SA');
    expect(initialsOf('@sara')).toBe('S');
    expect(initialsOf('mike.johnson')).toBe('MJ');
    expect(initialsOf('   ')).toBe('?');
  });
  it('data URI is deterministic per name and CSP-safe (data: scheme, no external host)', async () => {
    const { avatarDataUri, avatarUrlFor, stableHash } = await import('./index.js');
    expect(avatarDataUri('Sara Ahmed')).toBe(avatarDataUri('Sara Ahmed'));
    expect(avatarDataUri('Sara Ahmed')).not.toBe(avatarDataUri('Mike Johnson'));
    expect(avatarDataUri('Sara Ahmed').startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(decodeURIComponent(avatarDataUri('Sara Ahmed'))).toContain('>SA<');
    expect(stableHash('a')).not.toBe(stableHash('b'));
    expect(avatarUrlFor({ avatarUrl: 'https://cdn/x.jpg', name: 'X' })).toBe('https://cdn/x.jpg');
    expect(avatarUrlFor({ avatarUrl: null, name: 'Sara Ahmed' })).toContain('data:image/svg+xml');
  });
});
