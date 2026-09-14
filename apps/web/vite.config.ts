import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { PRIVATE_PREFIXES, site } from './src/app/config/site';
import { seoPlugin } from './vite/seo';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiOrigin = (() => {
    try {
      return new URL(env.VITE_API_BASE_URL || 'http://localhost:4000/v1').origin;
    } catch {
      return null;
    }
  })();

  return {
    plugins: [
      react(),
      tailwindcss(),
      seoPlugin({ apiBaseUrl: env.VITE_API_BASE_URL, sentryDsn: env.VITE_SENTRY_DSN, posthogHost: env.VITE_POSTHOG_HOST }),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false, // registered from app/pwa.ts so the update toast can use React
        includeAssets: ['favicon.svg', 'favicon-32.png', 'favicon-16.png', 'apple-touch-icon.png', 'og-image.png', 'theme-init.js', 'icons/*.png'],
        manifest: {
          id: '/',
          name: 'Ezyify — Social Commerce',
          short_name: 'Ezyify',
          description: site.defaultDescription,
          start_url: '/?source=pwa',
          scope: '/',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone'],
          orientation: 'portrait',
          background_color: site.themeColor.dark,
          theme_color: site.themeColor.light,
          lang: 'en',
          dir: 'ltr',
          categories: ['shopping', 'social', 'entertainment'],
          icons: [
            { src: '/icons/icon-64.png', sizes: '64x64', type: 'image/png' },
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          shortcuts: [
            { name: 'Home feed', short_name: 'Home', url: '/', icons: [{ src: '/icons/shortcut-home.png', sizes: '96x96', type: 'image/png' }] },
            { name: 'Shop', short_name: 'Shop', url: '/shop', icons: [{ src: '/icons/shortcut-shop.png', sizes: '96x96', type: 'image/png' }] },
            { name: 'Create', short_name: 'Create', url: '/upload', icons: [{ src: '/icons/shortcut-upload.png', sizes: '96x96', type: 'image/png' }] },
            { name: 'Messages', short_name: 'Messages', url: '/messages', icons: [{ src: '/icons/shortcut-messages.png', sizes: '96x96', type: 'image/png' }] },
          ],
          // Play Store listing lets Chrome offer the native app instead of the PWA on Android.
          related_applications: [{ platform: 'play', id: 'com.ezyify.app', url: 'https://play.google.com/store/apps/details?id=com.ezyify.app' }],
          prefer_related_applications: false,
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          // Admin/seller/launch dashboards and recharts are rarely visited on mobile — fetch on demand instead of precaching ~2 MiB.
          globIgnores: ['**/charts-*.js', '**/*Dashboard*.js', '**/*Launch*.js', '**/*Center*.js', '**/*Hub*.js', '**/*Validation*.js', '**/*Verification*.js', '**/*Playground*.js', '**/*Queue*.js', '**/*Monitor*.js', '**/*Panel*.js', '**/og-image.png'],
          // Fonts + the largest chunks push the shell past the default 2 MiB per-file cap.
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: '/index.html',
          // Private surfaces always go to the network so a shared device never serves someone else's shell from cache.
          navigateFallbackDenylist: [/^\/api\//, /^\/v1\//, /\.well-known/, ...PRIVATE_PREFIXES.map(p => new RegExp(`^${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|$)`))],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
          runtimeCaching: [
            {
              // Catalog reads: fast repeat visits, always revalidated. Auth/cart/wallet are never cached.
              urlPattern: ({ url, request }) =>
                request.method === 'GET' && apiOrigin !== null && url.origin === apiOrigin && /\/(products|categories|feed|posts|search)(\/|\?|$)/.test(url.pathname),
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'api-catalog', expiration: { maxEntries: 120, maxAgeSeconds: 5 * 60 }, cacheableResponse: { statuses: [200] } },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: { cacheName: 'images', expiration: { maxEntries: 300, maxAgeSeconds: 14 * 24 * 60 * 60, purgeOnQuotaError: true }, cacheableResponse: { statuses: [0, 200] } },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src/app') },
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    server: { port: 5173, host: true },
    build: {
      target: 'es2020',
      sourcemap: env.VITE_SENTRY_DSN ? 'hidden' : false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router'],
            radix: [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
            ],
            motion: ['motion'],
            charts: ['recharts'],
          },
        },
      },
    },
  };
});
