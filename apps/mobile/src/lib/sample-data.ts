import type { ProductSummary } from '@ezyify/core';

/** Placeholder catalogue until the API is live; shapes are validated against @ezyify/core schemas. */
export const sampleProducts: ProductSummary[] = [
  { id: 'p1', slug: 'wireless-headphones', name: 'Wireless Noise-Cancelling Headphones', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', price: { amount: 19999, currency: 'USD' }, compareAtPrice: { amount: 29999, currency: 'USD' }, rating: 4.8, reviewCount: 1240, seller: { id: 's1', username: 'techstore', name: 'TechStore', verified: true }, badge: 'bestseller', inStock: true },
  { id: 'p2', slug: 'smart-watch', name: 'Smart Watch Series 5', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', price: { amount: 19999, currency: 'USD' }, compareAtPrice: null, rating: 4.6, reviewCount: 860, seller: { id: 's1', username: 'techstore', name: 'TechStore', verified: true }, badge: 'new', inStock: true },
  { id: 'p3', slug: 'minimal-backpack', name: 'Minimal Everyday Backpack', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', price: { amount: 5900, currency: 'USD' }, compareAtPrice: { amount: 8900, currency: 'USD' }, rating: 4.7, reviewCount: 402, seller: { id: 's2', username: 'urbanco', name: 'Urban Co.', verified: false }, badge: 'sale', inStock: true },
  { id: 'p4', slug: 'skincare-set', name: 'Hydrating Skincare Set', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800', price: { amount: 4500, currency: 'USD' }, compareAtPrice: null, rating: 4.9, reviewCount: 2210, seller: { id: 's3', username: 'glowlab', name: 'Glow Lab', verified: true }, badge: null, inStock: true },
];
