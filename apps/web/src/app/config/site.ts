/**
 * Public-facing site metadata — the single source for canonical URLs, Open Graph defaults and the
 * indexable route list consumed by `components/SEO.tsx`, `scripts/generate-sitemap.mjs` and `scripts/prerender.mjs`.
 * Keep this file free of browser/Node-only APIs: it is imported from both the app bundle and build scripts.
 */
export const SITE_ORIGIN = 'https://ezyify.app';

export const site = {
  name: 'Ezyify',
  origin: SITE_ORIGIN,
  tagline: 'Shop. Talk. Share. Live the Moment.',
  defaultTitle: 'Ezyify — Shop. Talk. Share. Live the Moment.',
  defaultDescription:
    'Ezyify is a social commerce super-app: discover products from creators you trust, buy with escrow-protected checkout, chat with sellers and shop live.',
  ogImage: `${SITE_ORIGIN}/og-image.png`,
  twitterHandle: '@ezyify',
  locale: 'en_US',
  themeColor: { light: '#0F66C7', dark: '#0A0D14' },
} as const;

export interface PublicRoute {
  path: string;
  title: string;
  description: string;
  changefreq: 'hourly' | 'daily' | 'weekly' | 'monthly';
  priority: number;
  /** Prerendered into a static HTML shell at build time (SEO + instant first paint). */
  prerender?: boolean;
}

/** Routes that may be indexed. Everything else is `noindex` by default (auth, account, checkout, dashboards). */
export const PUBLIC_ROUTES: readonly PublicRoute[] = [
  { path: '/', title: site.defaultTitle, description: site.defaultDescription, changefreq: 'daily', priority: 1, prerender: true },
  { path: '/shop', title: 'Shop — Discover products from creators you trust', description: 'Browse trending products from verified sellers with escrow-protected checkout, free returns and live deals.', changefreq: 'hourly', priority: 0.9, prerender: true },
  { path: '/explore', title: 'Explore — Trending posts, loops and creators', description: 'Discover trending videos, photos and shoppable posts from creators across Ezyify.', changefreq: 'hourly', priority: 0.9 },
  { path: '/categories', title: 'Categories — Shop by category', description: 'Browse every product category on Ezyify — fashion, electronics, home, beauty, sports and more.', changefreq: 'daily', priority: 0.8 },
  { path: '/deals', title: 'Deals — Today’s best offers', description: 'Limited-time deals and flash sales from sellers on Ezyify, all protected by escrow.', changefreq: 'hourly', priority: 0.8 },
  { path: '/loops', title: 'Loops — Short shoppable videos', description: 'Swipe through short videos featuring products you can buy in one tap.', changefreq: 'hourly', priority: 0.7 },
  { path: '/live-shopping', title: 'Live Shopping — Watch, chat and buy in real time', description: 'Join live shopping streams, ask sellers questions and grab exclusive live-only deals.', changefreq: 'hourly', priority: 0.7 },
  { path: '/sell-on-ezyify', title: 'Sell on Ezyify — Start your store', description: 'Open a store in minutes, reach a social audience and get paid securely through escrow.', changefreq: 'monthly', priority: 0.6 },
  { path: '/creator-program', title: 'Creator Program — Earn from your content', description: 'Tag products, go live and earn commissions with the Ezyify creator program.', changefreq: 'monthly', priority: 0.6 },
  { path: '/about', title: 'About Ezyify', description: 'Our mission: make social shopping safe, fun and fair for buyers, sellers and creators.', changefreq: 'monthly', priority: 0.5 },
  { path: '/help', title: 'Help Center', description: 'Answers about orders, escrow, refunds, wallet and your account.', changefreq: 'weekly', priority: 0.5 },
  { path: '/faq', title: 'FAQ', description: 'Frequently asked questions about shopping, selling and creating on Ezyify.', changefreq: 'monthly', priority: 0.4 },
  { path: '/safety', title: 'Safety & Trust', description: 'How escrow, verification and moderation keep Ezyify safe.', changefreq: 'monthly', priority: 0.4 },
  { path: '/terms', title: 'Terms of Service', description: 'Ezyify terms of service.', changefreq: 'monthly', priority: 0.3 },
  { path: '/privacy', title: 'Privacy Policy', description: 'How Ezyify collects, uses and protects your data.', changefreq: 'monthly', priority: 0.3 },
  { path: '/community-guidelines', title: 'Community Guidelines', description: 'What is and is not allowed on Ezyify.', changefreq: 'monthly', priority: 0.3 },
  { path: '/accessibility', title: 'Accessibility', description: 'Our WCAG 2.2 AA commitment and how to reach us.', changefreq: 'monthly', priority: 0.2 },
  { path: '/contact', title: 'Contact', description: 'Get in touch with the Ezyify team.', changefreq: 'monthly', priority: 0.3 },
];

/** Path prefixes that must never be indexed or cached by the service worker's navigation fallback. */
export const PRIVATE_PREFIXES = [
  '/login', '/signup', '/forgot-password', '/reset-password', '/otp-verification', '/two-factor', '/welcome', '/onboarding',
  '/cart', '/checkout', '/wallet', '/orders', '/order', '/order-success', '/messages', '/notifications', '/wishlist',
  '/settings', '/dashboard', '/profile/me', '/profile/edit', '/profile/followers', '/upload', '/creator-dashboard',
  '/live-schedule', '/affiliate-manager', '/admin', '/user', '/report-problem', '/referral-tracking', '/verification-status',
  '/seller-dashboard', '/seller/products', '/seller/add-product', '/seller/edit-product', '/seller/orders', '/seller/order-detail',
  '/seller/logistics', '/seller/settings', '/seller/analytics', '/seller/customers', '/seller/reviews', '/seller/support',
  '/seller/kyc-verification', '/seller/earnings', '/seller/withdraw', '/seller/payout-settings', '/seller/security-monitor',
] as const;

export const isPrivatePath = (pathname: string) =>
  PRIVATE_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`));

export const absoluteUrl = (pathname: string) => `${SITE_ORIGIN}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
