import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { PRIVATE_PREFIXES, PUBLIC_ROUTES, absoluteUrl, site } from '../src/app/config/site';

export interface SeoPluginOptions {
  apiBaseUrl?: string;
  sentryDsn?: string;
  posthogHost?: string;
}

const originOf = (url?: string) => {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

/** Content-Security-Policy shared by the `<meta>` tag (build only) and the `_headers` file. */
export function buildCsp(opts: SeoPluginOptions, { forHeader }: { forHeader: boolean }) {
  const api = originOf(opts.apiBaseUrl);
  const apiWs = api ? api.replace(/^http/, 'ws') : null;
  const sentry = originOf(opts.sentryDsn);
  const posthog = originOf(opts.posthogHost) ?? 'https://eu.i.posthog.com';
  const connect = ["'self'", api, apiWs, sentry, posthog, 'https://*.ingest.sentry.io', 'https://*.ingest.de.sentry.io'].filter(Boolean).join(' ');

  const directives = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    // No inline scripts: theme bootstrap ships as /theme-init.js, SW registration is bundled.
    `script-src 'self'`,
    // React/Radix/motion write inline style attributes and Sonner injects a <style> tag.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `media-src 'self' blob: https:`,
    `font-src 'self' data:`,
    `connect-src ${connect}`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `frame-src 'self' https://js.stripe.com https://hooks.stripe.com`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ];
  // frame-ancestors is ignored inside <meta>; only the header carries it.
  if (forHeader) directives.push(`frame-ancestors 'none'`);
  return directives.join('; ');
}

function robotsTxt() {
  const lines = ['User-agent: *', 'Allow: /', ...PRIVATE_PREFIXES.map(p => `Disallow: ${p}`), 'Disallow: /*?*', '', `Sitemap: ${site.origin}/sitemap.xml`];
  return lines.join('\n') + '\n';
}

function sitemapXml(lastmod: string) {
  const urls = PUBLIC_ROUTES.map(
    r => `  <url>\n    <loc>${absoluteUrl(r.path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function headersFile(csp: string) {
  return [
    '/*',
    `  Content-Security-Policy: ${csp}`,
    '  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: DENY',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: camera=(self), microphone=(self), geolocation=(), payment=(self), interest-cohort=()',
    '  Cross-Origin-Opener-Policy: same-origin',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/sw.js',
    '  Cache-Control: no-cache',
    '',
    '/manifest.webmanifest',
    '  Content-Type: application/manifest+json',
    '',
    '/.well-known/assetlinks.json',
    '  Content-Type: application/json',
    '  Access-Control-Allow-Origin: *',
    '',
  ].join('\n');
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Rewrites the title/description/canonical/OG block of the built index.html for one public route. */
function routeShell(indexHtml: string, route: (typeof PUBLIC_ROUTES)[number]) {
  const title = escapeHtml(route.title);
  const desc = escapeHtml(route.description);
  const url = absoluteUrl(route.path);
  return indexHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
}

/**
 * Build-time SEO + hardening:
 *  - injects the CSP <meta> (production builds only; dev needs Vite's inline preamble),
 *  - emits robots.txt, sitemap.xml and Cloudflare/Netlify-style `_headers`,
 *  - writes a per-route `index.html` shell for every indexable route so crawlers and link unfurlers
 *    see the right title/description/canonical without executing JavaScript.
 */
export function seoPlugin(opts: SeoPluginOptions): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'ezyify:seo',
    apply: 'build',
    configResolved(c) {
      config = c;
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return {
          html,
          tags: [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: buildCsp(opts, { forHeader: false }) }, injectTo: 'head-prepend' }],
        };
      },
    },
    generateBundle() {
      const lastmod = new Date().toISOString().slice(0, 10);
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(lastmod) });
      this.emitFile({ type: 'asset', fileName: '_headers', source: headersFile(buildCsp(opts, { forHeader: true })) });
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);
      const index = await readFile(path.join(outDir, 'index.html'), 'utf8').catch(() => null);
      if (!index) return;
      await Promise.all(
        PUBLIC_ROUTES.filter(r => r.path !== '/').map(async r => {
          const dir = path.join(outDir, r.path.replace(/^\//, ''));
          await mkdir(dir, { recursive: true });
          await writeFile(path.join(dir, 'index.html'), routeShell(index, r));
        }),
      );
      config.logger.info(`[seo] wrote ${PUBLIC_ROUTES.length - 1} route shells, sitemap.xml, robots.txt, _headers`);
    },
  };
}
