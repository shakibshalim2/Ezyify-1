import { describe, it, expect } from 'vitest';
import { SignupRequestSchema, PasswordSchema, envelope, ProductSummarySchema } from './index';
import { z } from 'zod';

describe('schemas', () => {
  it('enforces the password policy used by the signup UI', () => {
    expect(PasswordSchema.safeParse('short').success).toBe(false);
    expect(PasswordSchema.safeParse('longenough').success).toBe(false);
    expect(PasswordSchema.safeParse('LongEnough1').success).toBe(true);
  });

  it('requires accepted terms on signup', () => {
    const r = SignupRequestSchema.safeParse({ name: 'Ana', email: 'a@b.co', password: 'LongEnough1', acceptTerms: false });
    expect(r.success).toBe(false);
  });

  it('parses both envelope arms', () => {
    const E = envelope(z.object({ id: z.string() }));
    expect(E.parse({ success: true, data: { id: '1' } })).toMatchObject({ success: true });
    expect(E.parse({ success: false, error: { code: 'NOT_FOUND', message: 'x' } })).toMatchObject({ success: false });
  });

  it('applies defaults on product summaries', () => {
    const p = ProductSummarySchema.parse({
      id: 'p1', slug: 'p1', name: 'Tee', imageUrl: 'https://x.co/a.jpg',
      price: { amount: 1999, currency: 'USD' }, compareAtPrice: null, rating: 4.5, reviewCount: 3,
      seller: { id: 's1', username: 'shop', name: 'Shop' }, badge: null, inStock: true,
    });
    expect(p.seller.verified).toBe(false);
  });
});
