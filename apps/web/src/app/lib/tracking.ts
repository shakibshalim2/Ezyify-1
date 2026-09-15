import type { Order } from '@ezyify/core';

/** Carrier tracking pages for the couriers sellers type most; unknown carriers fall back to the stored URL or a web search. */
const CARRIER_URLS: [RegExp, (n: string) => string][] = [
  [/j&t|jnt/i, n => `https://www.jet.co.id/track?awb=${encodeURIComponent(n)}`],
  [/jne/i, n => `https://www.jne.co.id/tracking-package?awb=${encodeURIComponent(n)}`],
  [/sicepat/i, n => `https://www.sicepat.com/checkAwb/${encodeURIComponent(n)}`],
  [/dhl/i, n => `https://www.dhl.com/track?tracking-id=${encodeURIComponent(n)}`],
  [/fedex/i, n => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`],
  [/ups/i, n => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`],
  [/usps/i, n => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(n)}`],
];
export function trackingUrl(t: NonNullable<Order['tracking']>): string {
  if (t.url) return t.url;
  const hit = CARRIER_URLS.find(([re]) => re.test(t.carrier));
  return hit ? hit[1](t.number) : `https://www.google.com/search?q=${encodeURIComponent(`${t.carrier} ${t.number}`)}`;
}
