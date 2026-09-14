// k6 smoke test — feed + product endpoints must stay fast under light concurrency.
//   k6 run apps/api/test/load/smoke.js            (API_BASE defaults to http://localhost:4000/v1)
//   k6 run -e API_BASE=https://api.ezyify.app/v1 apps/api/test/load/smoke.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.API_BASE || 'http://localhost:4000/v1';

export const options = {
  scenarios: {
    browse: { executor: 'constant-vus', vus: 10, duration: '30s' },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{endpoint:feed}': ['p(95)<300'],
    'http_req_duration{endpoint:products}': ['p(95)<300'],
    'http_req_duration{endpoint:product}': ['p(95)<200'],
  },
};

export default function () {
  const feed = http.get(`${BASE}/feed?pageSize=20`, { tags: { endpoint: 'feed' } });
  check(feed, { 'feed 200': r => r.status === 200, 'feed enveloped': r => r.json('success') === true });

  const products = http.get(`${BASE}/products?pageSize=20&sort=popular`, { tags: { endpoint: 'products' } });
  check(products, { 'products 200': r => r.status === 200 });

  const first = products.json('data.items.0.id');
  if (first) {
    const product = http.get(`${BASE}/products/${first}`, { tags: { endpoint: 'product' } });
    check(product, { 'product 200': r => r.status === 200 });
  }
  sleep(0.5);
}
