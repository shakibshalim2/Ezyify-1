import type { Conversation, Message, Post, ProductSummary, Transaction, UserSummary } from '@ezyify/core';

/** Mirrors apps/web mock catalogue; shapes conform to @ezyify/core schemas until the API is live. */
const img = (id: string, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80`;

export const users: UserSummary[] = [
  { id: 'u1', username: 'fashionista_maya', name: 'Maya Chen', avatarUrl: img('photo-1507611268508-bf74edce9029', 200), verified: true, role: 'creator' },
  { id: 'u2', username: 'tech_reviews_pro', name: 'Alex Rivera', avatarUrl: img('photo-1506794778202-cad84cf45f1d', 200), verified: true, role: 'creator' },
  { id: 'u3', username: 'glow.with.sara', name: 'Sara Kim', avatarUrl: img('photo-1534528741775-53994a69daeb', 200), verified: false, role: 'creator' },
  { id: 'u4', username: 'homebyjules', name: 'Jules Park', avatarUrl: img('photo-1488716820095-cbe80883c496', 200), verified: true, role: 'seller' },
  { id: 'u5', username: 'fitwithdan', name: 'Dan Okafor', avatarUrl: img('photo-1507003211169-0a1dd7228f2d', 200), verified: false, role: 'creator' },
  { id: 'u6', username: 'noor.travels', name: 'Noor Haddad', avatarUrl: img('photo-1517841905240-472988babdf9', 200), verified: true, role: 'creator' },
];

export const me: UserSummary = { id: 'me', username: 'you', name: 'Your Name', avatarUrl: img('photo-1500648767791-00dcc994a43e', 200), verified: false, role: 'user' };

const seller = (id: string, username: string, name: string, verified = true) => ({ id, username, name, verified });
const usd = (major: number) => ({ amount: Math.round(major * 100), currency: 'USD' as const });

export const products: ProductSummary[] = [
  { id: 'prod-001', slug: 'wireless-headphones', name: 'Wireless Noise-Cancelling Headphones', imageUrl: img('photo-1505740420928-5e560c06d30e'), price: usd(79.99), compareAtPrice: usd(129.99), rating: 4.8, reviewCount: 2847, seller: seller('s1', 'techstore', 'TechStore'), badge: 'bestseller', inStock: true },
  { id: 'prod-002', slug: 'smart-watch', name: 'Smart Watch Series 7', imageUrl: img('photo-1523275335684-37898b6baf30'), price: usd(199.99), compareAtPrice: usd(299.99), rating: 4.7, reviewCount: 1923, seller: seller('s1', 'techstore', 'TechStore'), badge: 'new', inStock: true },
  { id: 'prod-003', slug: 'laptop-stand', name: 'Aluminium Laptop Stand', imageUrl: img('photo-1527864550417-7fd91fc51a46'), price: usd(45.99), compareAtPrice: usd(69.99), rating: 4.6, reviewCount: 567, seller: seller('s2', 'workspace', 'WorkSpace', false), badge: null, inStock: true },
  { id: 'prod-004', slug: 'leather-backpack', name: 'Leather Everyday Backpack', imageUrl: img('photo-1553062407-98eeb64c6a62'), price: usd(89.99), compareAtPrice: usd(149.99), rating: 4.9, reviewCount: 1456, seller: seller('s3', 'fashion', 'Fashion Hub'), badge: 'sale', inStock: true },
  { id: 'prod-005', slug: 'minimalist-watch', name: 'Minimalist Watch', imageUrl: img('photo-1524592094714-0f0654e20314'), price: usd(129.99), compareAtPrice: usd(199.99), rating: 4.7, reviewCount: 892, seller: seller('s3', 'fashion', 'Fashion Hub'), badge: null, inStock: true },
  { id: 'prod-006', slug: 'vitamin-c-serum', name: 'Vitamin C Brightening Serum', imageUrl: img('photo-1620916566398-39f1143ab7be'), price: usd(34.99), compareAtPrice: usd(59.99), rating: 4.9, reviewCount: 2145, seller: seller('s4', 'glowcare', 'GlowCare'), badge: 'bestseller', inStock: true },
  { id: 'prod-007', slug: 'yoga-mat', name: 'Eco Yoga Mat', imageUrl: img('photo-1601925260368-ae2f83cf8b7f'), price: usd(34.99), compareAtPrice: usd(54.99), rating: 4.9, reviewCount: 1567, seller: seller('s5', 'fit', 'FitLife', false), badge: null, inStock: true },
  { id: 'prod-008', slug: 'led-table-lamp', name: 'LED Table Lamp', imageUrl: img('photo-1507473885765-e6ed057f782c'), price: usd(54.99), compareAtPrice: usd(89.99), rating: 4.5, reviewCount: 640, seller: seller('s2', 'workspace', 'WorkSpace', false), badge: 'limited', inStock: true },
];

export const categories = [
  { id: 'fashion', name: 'Fashion', icon: 'shirt-outline', imageUrl: img('photo-1483985988355-763728e1935b', 400) },
  { id: 'beauty', name: 'Beauty', icon: 'sparkles-outline', imageUrl: img('photo-1596462502278-27bfdc403348', 400) },
  { id: 'tech', name: 'Tech', icon: 'phone-portrait-outline', imageUrl: img('photo-1498049794561-7780e7231661', 400) },
  { id: 'home', name: 'Home', icon: 'home-outline', imageUrl: img('photo-1513694203232-719a280e022f', 400) },
  { id: 'fitness', name: 'Fitness', icon: 'barbell-outline', imageUrl: img('photo-1517836357463-d25dfeac3438', 400) },
  { id: 'food', name: 'Food', icon: 'restaurant-outline', imageUrl: img('photo-1504674900247-0877df9cc836', 400) },
] as const;

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const media = (id: string, type: 'image' | 'video' = 'image') => ({ type, url: img(id, 1080), thumbnailUrl: img(id, 400), width: 1080, height: 1350, durationMs: type === 'video' ? 15000 : null });

export const posts: Post[] = [
  { id: 'post-001', kind: 'post', author: users[0], caption: 'Just got these amazing wireless headphones! The sound quality is incredible and they are so comfortable. Perfect for my daily commute', hashtags: ['TechReview', 'MusicLovers'], media: [media('photo-1505740420928-5e560c06d30e'), media('photo-1484704849700-f032a568e944')], taggedProductIds: ['prod-001'], engagement: { likes: 12453, comments: 342, shares: 89, saves: 1200, isLiked: false, isSaved: false }, location: 'Jakarta', createdAt: ago(2) },
  { id: 'post-002', kind: 'post', author: users[1], caption: 'Unboxing the new Smart Watch Series 7! This thing is AMAZING. Full review coming soon!', hashtags: ['Unboxing', 'Wearables'], media: [media('photo-1694077743594-7b82dacafaf2')], taggedProductIds: ['prod-002'], engagement: { likes: 8934, comments: 210, shares: 45, saves: 640, isLiked: true, isSaved: false }, location: null, createdAt: ago(5) },
  { id: 'post-003', kind: 'post', author: users[2], caption: 'My skincare routine essentials! This Vitamin C serum has transformed my skin in just 2 weeks. Highly recommend!', hashtags: ['Skincare', 'GlowUp'], media: [media('photo-1620916566398-39f1143ab7be'), media('photo-1556228720-195a672e8a03')], taggedProductIds: ['prod-006'], engagement: { likes: 15672, comments: 512, shares: 130, saves: 2300, isLiked: false, isSaved: true }, location: 'Seoul', createdAt: ago(9) },
  { id: 'post-004', kind: 'post', author: users[3], caption: 'Transformed my workspace with these minimal pieces! The lamp is perfect for late-night work sessions', hashtags: ['Workspace', 'Minimal'], media: [media('photo-1507473885765-e6ed057f782c'), media('photo-1527864550417-7fd91fc51a46')], taggedProductIds: ['prod-008', 'prod-003'], engagement: { likes: 6234, comments: 98, shares: 20, saves: 480, isLiked: false, isSaved: false }, location: 'Singapore', createdAt: ago(14) },
  { id: 'post-005', kind: 'post', author: users[4], caption: 'Morning flow with the new eco mat. Grip is unreal, even in a hot room.', hashtags: ['Yoga', 'Fitness'], media: [media('photo-1601925260368-ae2f83cf8b7f')], taggedProductIds: ['prod-007'], engagement: { likes: 4310, comments: 64, shares: 12, saves: 300, isLiked: false, isSaved: false }, location: null, createdAt: ago(26) },
];

export const loops: Post[] = [
  { id: 'loop-001', kind: 'loop', author: users[0], caption: 'Three ways to style the leather backpack', hashtags: ['OOTD', 'Fashion'], media: [media('photo-1553062407-98eeb64c6a62', 'video')], taggedProductIds: ['prod-004'], engagement: { likes: 45200, comments: 1200, shares: 890, saves: 5600, views: 512000, isLiked: false, isSaved: false }, location: null, createdAt: ago(3) },
  { id: 'loop-002', kind: 'loop', author: users[5], caption: 'Packing light for 10 days — everything fits', hashtags: ['Travel', 'Minimal'], media: [media('photo-1488646953014-85cb44e25828', 'video')], taggedProductIds: ['prod-004', 'prod-005'], engagement: { likes: 23100, comments: 640, shares: 410, saves: 3300, views: 280000, isLiked: false, isSaved: false }, location: 'Lisbon', createdAt: ago(7) },
  { id: 'loop-003', kind: 'loop', author: users[2], caption: 'Glass-skin routine in 60 seconds', hashtags: ['Skincare'], media: [media('photo-1596462502278-27bfdc403348', 'video')], taggedProductIds: ['prod-006'], engagement: { likes: 88700, comments: 2400, shares: 1900, saves: 12000, views: 1_200_000, isLiked: false, isSaved: false }, location: null, createdAt: ago(11) },
  { id: 'loop-004', kind: 'loop', author: users[1], caption: 'Desk setup tour — every product linked', hashtags: ['Setup', 'Tech'], media: [media('photo-1498049794561-7780e7231661', 'video')], taggedProductIds: ['prod-003', 'prod-008', 'prod-001'], engagement: { likes: 31000, comments: 800, shares: 520, saves: 4100, views: 390000, isLiked: false, isSaved: false }, location: null, createdAt: ago(20) },
];

export const stories = users.map((u, i) => ({ id: `story-${u.id}`, user: u, seen: i > 3, live: i === 1 }));

export const conversations: Conversation[] = [
  { id: 'c1', participants: [users[0]], lastMessage: { text: 'Yes! The medium fits true to size 😊', at: ago(0.2), fromMe: false }, unreadCount: 2 },
  { id: 'c2', participants: [users[3]], lastMessage: { text: 'Your order has shipped — tracking inside', at: ago(3), fromMe: false }, unreadCount: 0 },
  { id: 'c3', participants: [users[1]], lastMessage: { text: 'Thanks for the review!', at: ago(30), fromMe: true }, unreadCount: 0 },
  { id: 'c4', participants: [users[5]], lastMessage: { text: 'Is the backpack still 40% off?', at: ago(50), fromMe: true }, unreadCount: 0 },
];

export const messages: Record<string, Message[]> = {
  c1: [
    { id: 'm1', conversationId: 'c1', senderId: 'me', text: 'Hi Maya! Does the backpack run small?', media: null, productId: null, status: 'read', createdAt: ago(1) },
    { id: 'm2', conversationId: 'c1', senderId: 'u1', text: 'Hey! Not at all — I wear a medium in most brands.', media: null, productId: null, status: 'read', createdAt: ago(0.8) },
    { id: 'm3', conversationId: 'c1', senderId: 'u1', text: null, media: null, productId: 'prod-004', status: 'read', createdAt: ago(0.7) },
    { id: 'm4', conversationId: 'c1', senderId: 'me', text: 'Perfect, ordering now 🙌', media: null, productId: null, status: 'read', createdAt: ago(0.3) },
    { id: 'm5', conversationId: 'c1', senderId: 'u1', text: 'Yes! The medium fits true to size 😊', media: null, productId: null, status: 'delivered', createdAt: ago(0.2) },
  ],
};

export const transactions: Transaction[] = [
  { id: 't1', type: 'purchase', direction: 'out', amount: usd(89.99), status: 'completed', description: 'Leather Everyday Backpack · Fashion Hub', createdAt: ago(4) },
  { id: 't2', type: 'commission', direction: 'in', amount: usd(12.4), status: 'completed', description: 'Affiliate commission · Vitamin C Serum', createdAt: ago(20) },
  { id: 't3', type: 'topup', direction: 'in', amount: usd(200), status: 'completed', description: 'Top up · Visa •••• 4242', createdAt: ago(48) },
  { id: 't4', type: 'refund', direction: 'in', amount: usd(45.99), status: 'pending', description: 'Refund · Laptop Stand', createdAt: ago(70) },
];

export const wallet = { balance: usd(276.41), pending: usd(45.99), currency: 'USD' as const };

export const findProduct = (id: string | undefined) => products.find(p => p.id === id);
export const findUser = (id: string) => (id === 'me' ? me : users.find(u => u.id === id));
