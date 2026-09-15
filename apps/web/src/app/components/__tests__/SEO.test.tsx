import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { SEO } from '../SEO';
import { PUBLIC_ROUTES, isPrivatePath } from '../../config/site';

const meta = (sel: string) => document.head.querySelector<HTMLMetaElement>(sel)?.content;

function mount(path: string, props: Parameters<typeof SEO>[0] = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SEO {...props} />
    </MemoryRouter>,
  );
}

describe('<SEO />', () => {
  it('sets title, canonical and Open Graph for a public route', () => {
    mount('/shop', { title: 'Shop', description: 'Browse products' });
    expect(document.title).toBe('Shop | Ezyify');
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe('https://ezyify.app/shop');
    expect(meta('meta[property="og:url"]')).toBe('https://ezyify.app/shop');
    expect(meta('meta[property="og:image"]')).toBe('https://ezyify.app/og-image.png');
    expect(meta('meta[name="robots"]')).toMatch(/^index, follow/);
  });

  it('keeps branded titles verbatim', () => {
    mount('/cart', { title: 'Cart — Ezyify' });
    expect(document.title).toBe('Cart — Ezyify');
  });

  it('marks private routes noindex automatically', () => {
    mount('/wallet', { title: 'Wallet' });
    expect(meta('meta[name="robots"]')).toBe('noindex, nofollow');
    mount('/checkout');
    expect(meta('meta[name="robots"]')).toBe('noindex, nofollow');
  });

  it('writes and removes JSON-LD', () => {
    const { unmount } = mount('/', { jsonLd: { '@type': 'WebSite' } });
    expect(document.head.querySelector('script[type="application/ld+json"]')?.textContent).toContain('WebSite');
    unmount();
    mount('/about');
    expect(document.head.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});

describe('site config', () => {
  it('never lists a private path as indexable', () => {
    for (const r of PUBLIC_ROUTES) expect(isPrivatePath(r.path), r.path).toBe(false);
  });
  it('flags account and checkout surfaces as private', () => {
    for (const p of ['/login', '/cart', '/checkout', '/orders/refund-request', '/seller-dashboard', '/admin/users', '/profile/me']) expect(isPrivatePath(p), p).toBe(true);
    expect(isPrivatePath('/profile/jane')).toBe(false);
    expect(isPrivatePath('/seller/urban-threads')).toBe(false);
  });
});
