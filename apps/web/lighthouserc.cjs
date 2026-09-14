/** Lighthouse CI budget (MASTER_PLAN Phase 7): perf ≥ 90, a11y ≥ 95 on the production build. */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      isSinglePageApplication: true,
      url: ['http://localhost/index.html', 'http://localhost/shop', 'http://localhost/login'],
      numberOfRuns: 2,
      settings: { preset: 'desktop', skipAudits: ['uses-http2'], chromeFlags: '--no-sandbox --headless=new --disable-gpu' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
