import type {
  Address,
  Category,
  Conversation,
  Message,
  LiveSession,
  Notification,
  Order,
  Post,
  ProductDetail,
  ProductSummary,
  Transaction,
  UserProfile,
  UserSummary,
} from '../schemas/index.js';

/**
 * Demo fixtures shared by the in-process mock server, mobile QA builds and web MSW.
 * Ids and credentials mirror `apps/api/prisma/seed.ts` (password `Password1` for every user)
 * so a screen that works against the mock behaves the same against a seeded API.
 */
export const img = (id: string, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80`;
export const usd = (major: number) => ({ amount: Math.round(major * 100), currency: 'USD' as const });
export const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const ahead = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

export interface SeedUser extends UserSummary {
  email: string;
  bio: string | null;
  location: string | null;
}

export const users: SeedUser[] = [
  { id: 'u_maya', email: 'maya@ezyify.test', username: 'fashionista_maya', name: 'Maya Chen', avatarUrl: img('photo-1507611268508-bf74edce9029', 200), verified: true, role: 'creator', bio: 'Styling everyday pieces ✨ Jakarta → Seoul', location: 'Jakarta' },
  { id: 'u_alex', email: 'alex@ezyify.test', username: 'tech_reviews_pro', name: 'Alex Rivera', avatarUrl: img('photo-1506794778202-cad84cf45f1d', 200), verified: true, role: 'creator', bio: 'Honest gadget reviews. No hype.', location: 'Austin' },
  { id: 'u_sara', email: 'sara@ezyify.test', username: 'glow.with.sara', name: 'Sara Kim', avatarUrl: img('photo-1534528741775-53994a69daeb', 200), verified: false, role: 'creator', bio: 'Skincare that actually works 🧴', location: 'Seoul' },
  { id: 'u_jules', email: 'jules@ezyify.test', username: 'homebyjules', name: 'Jules Park', avatarUrl: img('photo-1488716820095-cbe80883c496', 200), verified: true, role: 'seller', bio: 'Minimal home & workspace goods', location: 'Singapore' },
  { id: 'u_dan', email: 'dan@ezyify.test', username: 'fitwithdan', name: 'Dan Okafor', avatarUrl: img('photo-1507003211169-0a1dd7228f2d', 200), verified: false, role: 'creator', bio: 'Coach · mobility · mindset', location: 'Lagos' },
  { id: 'u_noor', email: 'noor@ezyify.test', username: 'noor.travels', name: 'Noor Haddad', avatarUrl: img('photo-1517841905240-472988babdf9', 200), verified: true, role: 'creator', bio: 'Carry-on only. 41 countries.', location: 'Lisbon' },
  { id: 'u_techstore', email: 'techstore@ezyify.test', username: 'techstore', name: 'TechStore', avatarUrl: img('photo-1556155092-490a1ba16284', 200), verified: true, role: 'seller', bio: 'Official electronics retailer', location: 'Jakarta' },
  { id: 'u_fashionhub', email: 'fashion@ezyify.test', username: 'fashion', name: 'Fashion Hub', avatarUrl: img('photo-1483985988355-763728e1935b', 200), verified: true, role: 'seller', bio: 'Curated everyday fashion', location: 'Bangkok' },
  { id: 'u_glowcare', email: 'glowcare@ezyify.test', username: 'glowcare', name: 'GlowCare', avatarUrl: img('photo-1596462502278-27bfdc403348', 200), verified: true, role: 'seller', bio: 'Clean beauty, dermatologist tested', location: 'Seoul' },
  { id: 'u_workspace', email: 'workspace@ezyify.test', username: 'workspace', name: 'WorkSpace', avatarUrl: img('photo-1497366216548-37526070297c', 200), verified: false, role: 'seller', bio: 'Desk gear for makers', location: 'Berlin' },
  { id: 'u_fit', email: 'fit@ezyify.test', username: 'fit', name: 'FitLife', avatarUrl: img('photo-1517836357463-d25dfeac3438', 200), verified: false, role: 'seller', bio: 'Sustainable fitness gear', location: 'Denver' },
  { id: 'u_buyer', email: 'buyer@ezyify.test', username: 'buyer', name: 'Test Buyer', avatarUrl: img('photo-1500648767791-00dcc994a43e', 200), verified: false, role: 'user', bio: null, location: null },
];

export const summary = (u: SeedUser): UserSummary => ({ id: u.id, username: u.username, name: u.name, avatarUrl: u.avatarUrl, verified: u.verified, role: u.role });
export const byUsername = (username: string) => users.find(u => u.username === username);
export const byId = (id: string) => users.find(u => u.id === id);
const sellerOf = (username: string) => {
  const u = byUsername(username)!;
  return { id: u.id, username: u.username, name: u.name, verified: u.verified };
};

export const categories: Category[] = [
  { id: 'cat_fashion', slug: 'fashion', name: 'Fashion', imageUrl: img('photo-1483985988355-763728e1935b', 400), productCount: 2 },
  { id: 'cat_beauty', slug: 'beauty', name: 'Beauty', imageUrl: img('photo-1596462502278-27bfdc403348', 400), productCount: 1 },
  { id: 'cat_tech', slug: 'tech', name: 'Tech', imageUrl: img('photo-1498049794561-7780e7231661', 400), productCount: 3 },
  { id: 'cat_home', slug: 'home', name: 'Home', imageUrl: img('photo-1513694203232-719a280e022f', 400), productCount: 1 },
  { id: 'cat_fitness', slug: 'fitness', name: 'Fitness', imageUrl: img('photo-1517836357463-d25dfeac3438', 400), productCount: 1 },
  { id: 'cat_food', slug: 'food', name: 'Food', imageUrl: img('photo-1504674900247-0877df9cc836', 400), productCount: 0 },
];

type Seed = Omit<ProductSummary, 'seller'> & { seller: string; category: string; description: string; images: string[]; tags: string[]; soldCount: number; variants?: ProductDetail['variants'] };
const seeds: Seed[] = [
  { id: 'prod-001', slug: 'wireless-headphones', name: 'Wireless Noise-Cancelling Headphones', imageUrl: img('photo-1505740420928-5e560c06d30e'), price: usd(79.99), compareAtPrice: usd(129.99), rating: 4.8, reviewCount: 2847, seller: 'techstore', badge: 'bestseller', inStock: true, category: 'tech', description: '40 h battery, hybrid ANC, multipoint Bluetooth 5.3 and a foldable frame. Ships with a hard case and USB‑C cable.', images: [img('photo-1505740420928-5e560c06d30e', 1080), img('photo-1484704849700-f032a568e944', 1080), img('photo-1546435770-a3e426bf472b', 1080)], tags: ['audio', 'anc', 'bluetooth'], soldCount: 12800 },
  { id: 'prod-002', slug: 'smart-watch', name: 'Smart Watch Series 7', imageUrl: img('photo-1523275335684-37898b6baf30'), price: usd(199.99), compareAtPrice: usd(299.99), rating: 4.7, reviewCount: 1923, seller: 'techstore', badge: 'new', inStock: true, category: 'tech', description: 'Always‑on AMOLED, ECG + SpO₂, 7‑day battery and 5 ATM water resistance.', images: [img('photo-1523275335684-37898b6baf30', 1080), img('photo-1579586337278-3befd40fd17a', 1080)], tags: ['wearable', 'health'], soldCount: 6400, variants: [{ id: 'var_watch_black', name: 'Midnight Black', options: { Color: 'Black' }, price: usd(199.99), stock: 40, imageUrl: null }, { id: 'var_watch_silver', name: 'Silver', options: { Color: 'Silver' }, price: usd(209.99), stock: 12, imageUrl: null }] },
  { id: 'prod-003', slug: 'laptop-stand', name: 'Aluminium Laptop Stand', imageUrl: img('photo-1527864550417-7fd91fc51a46'), price: usd(45.99), compareAtPrice: usd(69.99), rating: 4.6, reviewCount: 567, seller: 'workspace', badge: null, inStock: true, category: 'tech', description: 'CNC‑milled aluminium, 6 height steps, fits 11–17" laptops. Keeps your machine 8 °C cooler.', images: [img('photo-1527864550417-7fd91fc51a46', 1080), img('photo-1498049794561-7780e7231661', 1080)], tags: ['desk', 'ergonomics'], soldCount: 2100 },
  { id: 'prod-004', slug: 'leather-backpack', name: 'Leather Everyday Backpack', imageUrl: img('photo-1553062407-98eeb64c6a62'), price: usd(89.99), compareAtPrice: usd(149.99), rating: 4.9, reviewCount: 1456, seller: 'fashion', badge: 'sale', inStock: true, category: 'fashion', description: 'Full‑grain leather, 15" laptop sleeve, hidden back pocket and YKK zips. Ages beautifully.', images: [img('photo-1553062407-98eeb64c6a62', 1080), img('photo-1548036328-c9fa89d128fa', 1080), img('photo-1491637639811-60e2756cc1c7', 1080)], tags: ['bag', 'leather', 'work'], soldCount: 5300, variants: [{ id: 'var_backpack_midnight', name: 'Midnight / M', options: { Color: 'Midnight', Size: 'M' }, price: usd(89.99), stock: 20, imageUrl: null }, { id: 'var_backpack_sand', name: 'Sand / M', options: { Color: 'Sand', Size: 'M' }, price: usd(89.99), stock: 15, imageUrl: null }] },
  { id: 'prod-005', slug: 'minimalist-watch', name: 'Minimalist Watch', imageUrl: img('photo-1524592094714-0f0654e20314'), price: usd(129.99), compareAtPrice: usd(199.99), rating: 4.7, reviewCount: 892, seller: 'fashion', badge: null, inStock: true, category: 'fashion', description: 'Sapphire glass, Japanese quartz, 38 mm case and an interchangeable Italian leather strap.', images: [img('photo-1524592094714-0f0654e20314', 1080), img('photo-1522312346375-d1a52e2b99b3', 1080)], tags: ['watch', 'minimal'], soldCount: 3100 },
  { id: 'prod-006', slug: 'vitamin-c-serum', name: 'Vitamin C Brightening Serum', imageUrl: img('photo-1620916566398-39f1143ab7be'), price: usd(34.99), compareAtPrice: usd(59.99), rating: 4.9, reviewCount: 2145, seller: 'glowcare', badge: 'bestseller', inStock: true, category: 'beauty', description: '15 % L‑ascorbic acid with ferulic acid and hyaluronic acid. Fragrance‑free, dermatologist tested.', images: [img('photo-1620916566398-39f1143ab7be', 1080), img('photo-1556228720-195a672e8a03', 1080)], tags: ['skincare', 'serum'], soldCount: 9800 },
  { id: 'prod-007', slug: 'yoga-mat', name: 'Eco Yoga Mat', imageUrl: img('photo-1601925260368-ae2f83cf8b7f'), price: usd(34.99), compareAtPrice: usd(54.99), rating: 4.9, reviewCount: 1567, seller: 'fit', badge: null, inStock: true, category: 'fitness', description: 'Natural rubber + cork top, 5 mm, non‑slip even when sweaty. Plastic‑free packaging.', images: [img('photo-1601925260368-ae2f83cf8b7f', 1080), img('photo-1544367567-0f2fcb009e0b', 1080)], tags: ['yoga', 'eco'], soldCount: 4200 },
  { id: 'prod-008', slug: 'led-table-lamp', name: 'LED Table Lamp', imageUrl: img('photo-1507473885765-e6ed057f782c'), price: usd(54.99), compareAtPrice: usd(89.99), rating: 4.5, reviewCount: 640, seller: 'workspace', badge: 'limited', inStock: true, category: 'home', description: 'Dimmable 2700–6000 K, touch controls, USB‑C charging port and a 50 000 h LED panel.', images: [img('photo-1507473885765-e6ed057f782c', 1080), img('photo-1513694203232-719a280e022f', 1080)], tags: ['lighting', 'desk'], soldCount: 1900 },
];

export const products: ProductDetail[] = seeds.map(s => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  imageUrl: s.imageUrl,
  price: s.price,
  compareAtPrice: s.compareAtPrice,
  rating: s.rating,
  reviewCount: s.reviewCount,
  seller: sellerOf(s.seller),
  badge: s.badge,
  inStock: s.inStock,
  description: s.description,
  images: s.images,
  category: s.category,
  tags: s.tags,
  variants: s.variants ?? [],
  shipping: { freeOver: usd(50), etaDays: [3, 5] },
  escrowProtected: true,
  soldCount: s.soldCount,
  createdAt: ago(24 * 30),
}));
export const productSummary = (p: ProductDetail): ProductSummary => ({ id: p.id, slug: p.slug, name: p.name, imageUrl: p.imageUrl, price: p.price, compareAtPrice: p.compareAtPrice, rating: p.rating, reviewCount: p.reviewCount, seller: p.seller, badge: p.badge, inStock: p.inStock });
export const findProduct = (id: string | undefined) => products.find(p => p.id === id || p.slug === id);

/** Live shopping fixtures mirror the seeded API sessions so mock-mode screens never need hard-coded streams. */
export const liveSessions: LiveSession[] = [
  { id: 'live-001', room: 'live-001', title: 'The ANC audio event — live demos', host: summary(byUsername('techstore')!), status: 'live', category: 'tech', coverUrl: products[0].imageUrl, productIds: ['prod-001', 'prod-002'], pinnedProductId: 'prod-001', viewers: 1240, peakViewers: 1240, likes: 842, scheduledFor: null, startedAt: ago(0.5), endedAt: null, createdAt: ago(0.5) },
  { id: 'live-002', room: 'live-002', title: 'Weekend capsule wardrobe edit', host: summary(byUsername('fashion')!), status: 'live', category: 'fashion', coverUrl: products[3].imageUrl, productIds: ['prod-004', 'prod-005'], pinnedProductId: 'prod-004', viewers: 760, peakViewers: 760, likes: 516, scheduledFor: null, startedAt: ago(1), endedAt: null, createdAt: ago(1) },
  { id: 'live-003', room: 'live-003', title: 'Glass-skin routine, step by step', host: summary(byUsername('glow.with.sara')!), status: 'live', category: 'beauty', coverUrl: products[5].imageUrl, productIds: ['prod-006'], pinnedProductId: 'prod-006', viewers: 1980, peakViewers: 1980, likes: 1299, scheduledFor: null, startedAt: ago(0.25), endedAt: null, createdAt: ago(0.25) },
  { id: 'live-004', room: 'live-004', title: 'Derm-approved evening skincare', host: summary(byUsername('glowcare')!), status: 'scheduled', category: 'beauty', coverUrl: products[5].imageUrl, productIds: ['prod-006'], pinnedProductId: null, viewers: 0, peakViewers: 0, likes: 0, scheduledFor: ahead(1), startedAt: null, endedAt: null, createdAt: ago(2) },
  { id: 'live-005', room: 'live-005', title: 'Back-to-school desk setup', host: summary(byUsername('techstore')!), status: 'scheduled', category: 'tech', coverUrl: products[2].imageUrl, productIds: ['prod-003'], pinnedProductId: null, viewers: 0, peakViewers: 0, likes: 0, scheduledFor: ahead(2), startedAt: null, endedAt: null, createdAt: ago(1) },
];

const media = (id: string, type: 'image' | 'video' = 'image') => ({ type, url: img(id, 1080), thumbnailUrl: img(id, 400), width: 1080, height: 1350, durationMs: type === 'video' ? 15000 : null });
const u = (username: string) => summary(byUsername(username)!);
const eng = (likes: number, comments: number, shares: number, saves: number, views?: number) => ({ likes, comments, shares, saves, ...(views ? { views } : {}), isLiked: false, isSaved: false });

export const posts: Post[] = [
  { id: 'post-001', kind: 'post', author: u('fashionista_maya'), caption: 'Just got these amazing wireless headphones! The sound quality is incredible and they are so comfortable. Perfect for my daily commute', hashtags: ['TechReview', 'MusicLovers'], media: [media('photo-1505740420928-5e560c06d30e'), media('photo-1484704849700-f032a568e944')], taggedProductIds: ['prod-001'], engagement: eng(12453, 342, 89, 1200), location: 'Jakarta', createdAt: ago(2) },
  { id: 'post-002', kind: 'post', author: u('tech_reviews_pro'), caption: 'Unboxing the new Smart Watch Series 7! This thing is AMAZING. Full review coming soon!', hashtags: ['Unboxing', 'Wearables'], media: [media('photo-1694077743594-7b82dacafaf2')], taggedProductIds: ['prod-002'], engagement: eng(8934, 210, 45, 640), location: null, createdAt: ago(5) },
  { id: 'post-003', kind: 'post', author: u('glow.with.sara'), caption: 'My skincare routine essentials! This Vitamin C serum has transformed my skin in just 2 weeks. Highly recommend!', hashtags: ['Skincare', 'GlowUp'], media: [media('photo-1620916566398-39f1143ab7be'), media('photo-1556228720-195a672e8a03')], taggedProductIds: ['prod-006'], engagement: eng(15672, 512, 130, 2300), location: 'Seoul', createdAt: ago(9) },
  { id: 'post-004', kind: 'post', author: u('homebyjules'), caption: 'Transformed my workspace with these minimal pieces! The lamp is perfect for late-night work sessions', hashtags: ['Workspace', 'Minimal'], media: [media('photo-1507473885765-e6ed057f782c'), media('photo-1527864550417-7fd91fc51a46')], taggedProductIds: ['prod-008', 'prod-003'], engagement: eng(6234, 98, 20, 480), location: 'Singapore', createdAt: ago(14) },
  { id: 'post-005', kind: 'post', author: u('fitwithdan'), caption: 'Morning flow with the new eco mat. Grip is unreal, even in a hot room.', hashtags: ['Yoga', 'Fitness'], media: [media('photo-1601925260368-ae2f83cf8b7f')], taggedProductIds: ['prod-007'], engagement: eng(4310, 64, 12, 300), location: null, createdAt: ago(26) },
  { id: 'post-006', kind: 'post', author: u('noor.travels'), caption: 'Ten days, one backpack. Lisbon light hits different in September.', hashtags: ['Travel', 'CarryOn'], media: [media('photo-1488646953014-85cb44e25828'), media('photo-1548036328-c9fa89d128fa')], taggedProductIds: ['prod-004'], engagement: eng(9870, 154, 60, 1100), location: 'Lisbon', createdAt: ago(31) },
];

export const loops: Post[] = [
  { id: 'loop-001', kind: 'loop', author: u('fashionista_maya'), caption: 'Three ways to style the leather backpack', hashtags: ['OOTD', 'Fashion'], media: [media('photo-1553062407-98eeb64c6a62', 'video')], taggedProductIds: ['prod-004'], engagement: eng(45200, 1200, 890, 5600, 512000), location: null, createdAt: ago(3) },
  { id: 'loop-002', kind: 'loop', author: u('noor.travels'), caption: 'Packing light for 10 days — everything fits', hashtags: ['Travel', 'Minimal'], media: [media('photo-1488646953014-85cb44e25828', 'video')], taggedProductIds: ['prod-004', 'prod-005'], engagement: eng(23100, 640, 410, 3300, 280000), location: 'Lisbon', createdAt: ago(7) },
  { id: 'loop-003', kind: 'loop', author: u('glow.with.sara'), caption: 'Glass-skin routine in 60 seconds', hashtags: ['Skincare'], media: [media('photo-1596462502278-27bfdc403348', 'video')], taggedProductIds: ['prod-006'], engagement: eng(88700, 2400, 1900, 12000, 1_200_000), location: null, createdAt: ago(11) },
  { id: 'loop-004', kind: 'loop', author: u('tech_reviews_pro'), caption: 'Desk setup tour — every product linked', hashtags: ['Setup', 'Tech'], media: [media('photo-1498049794561-7780e7231661', 'video')], taggedProductIds: ['prod-003', 'prod-008', 'prod-001'], engagement: eng(31000, 800, 520, 4100, 390000), location: null, createdAt: ago(20) },
];

export const stories: Post[] = [
  { id: 'story-u_maya', kind: 'story', author: u('fashionista_maya'), caption: '', hashtags: [], media: [media('photo-1483985988355-763728e1935b')], taggedProductIds: ['prod-004'], engagement: eng(0, 0, 0, 0), location: null, createdAt: ago(1) },
  { id: 'story-u_alex', kind: 'story', author: u('tech_reviews_pro'), caption: 'Going live at 8pm', hashtags: [], media: [media('photo-1498049794561-7780e7231661')], taggedProductIds: [], engagement: eng(0, 0, 0, 0), location: null, createdAt: ago(2) },
  { id: 'story-u_sara', kind: 'story', author: u('glow.with.sara'), caption: '', hashtags: [], media: [media('photo-1556228720-195a672e8a03')], taggedProductIds: ['prod-006'], engagement: eng(0, 0, 0, 0), location: null, createdAt: ago(4) },
  { id: 'story-u_jules', kind: 'story', author: u('homebyjules'), caption: 'New drop', hashtags: [], media: [media('photo-1513694203232-719a280e022f')], taggedProductIds: ['prod-008'], engagement: eng(0, 0, 0, 0), location: null, createdAt: ago(6) },
  { id: 'story-u_dan', kind: 'story', author: u('fitwithdan'), caption: '', hashtags: [], media: [media('photo-1544367567-0f2fcb009e0b')], taggedProductIds: [], engagement: eng(0, 0, 0, 0), location: null, createdAt: ago(9) },
  { id: 'story-u_noor', kind: 'story', author: u('noor.travels'), caption: '', hashtags: [], media: [media('photo-1548036328-c9fa89d128fa')], taggedProductIds: [], engagement: eng(0, 0, 0, 0), location: null, createdAt: ago(12) },
];

/** Followed by the demo buyer at first launch (mirrors the API seed). */
export const buyerFollows = ['u_maya', 'u_alex', 'u_sara'];

export const profile = (user: SeedUser, isFollowing?: boolean): UserProfile => ({
  ...summary(user),
  bio: user.bio,
  coverUrl: user.role === 'user' ? null : img('photo-1557682250-33bd709cbe85', 1080),
  website: user.role === 'seller' ? `https://ezyify.app/store/${user.username}` : null,
  location: user.location,
  followers: user.role === 'user' ? 12 : 1200 + user.id.length * 3713,
  following: user.role === 'user' ? buyerFollows.length : 180 + user.id.length * 7,
  posts: [...posts, ...loops].filter(p => p.author.id === user.id).length,
  ...(isFollowing === undefined ? {} : { isFollowing }),
  createdAt: ago(24 * 400),
});

export const conversations: Conversation[] = [
  { id: 'c_buyer_maya', participants: [u('fashionista_maya')], lastMessage: { text: 'Yes! The medium fits true to size 😊', at: ago(0.2), fromMe: false }, unreadCount: 2 },
  { id: 'c_buyer_jules', participants: [u('homebyjules')], lastMessage: { text: 'Your order has shipped — tracking inside', at: ago(3), fromMe: false }, unreadCount: 0 },
  { id: 'c_buyer_alex', participants: [u('tech_reviews_pro')], lastMessage: { text: 'Thanks for the review!', at: ago(30), fromMe: true }, unreadCount: 0 },
  { id: 'c_buyer_noor', participants: [u('noor.travels')], lastMessage: { text: 'Is the backpack still 40% off?', at: ago(50), fromMe: true }, unreadCount: 0 },
];

export const messages: Record<string, Message[]> = {
  c_buyer_maya: [
    { id: 'm1', conversationId: 'c_buyer_maya', senderId: 'u_buyer', text: 'Hi Maya! Does the backpack run small?', media: null, productId: null, status: 'read', createdAt: ago(1) },
    { id: 'm2', conversationId: 'c_buyer_maya', senderId: 'u_maya', text: 'Hey! Not at all — I wear a medium in most brands.', media: null, productId: null, status: 'read', createdAt: ago(0.8) },
    { id: 'm3', conversationId: 'c_buyer_maya', senderId: 'u_maya', text: null, media: null, productId: 'prod-004', status: 'read', createdAt: ago(0.7) },
    { id: 'm4', conversationId: 'c_buyer_maya', senderId: 'u_buyer', text: 'Perfect, ordering now 🙌', media: null, productId: null, status: 'read', createdAt: ago(0.3) },
    { id: 'm5', conversationId: 'c_buyer_maya', senderId: 'u_maya', text: 'Yes! The medium fits true to size 😊', media: null, productId: null, status: 'delivered', createdAt: ago(0.2) },
  ],
  c_buyer_jules: [
    { id: 'm6', conversationId: 'c_buyer_jules', senderId: 'u_jules', text: 'Your order has shipped — tracking inside', media: null, productId: null, status: 'read', createdAt: ago(3) },
  ],
  c_buyer_alex: [
    { id: 'm7', conversationId: 'c_buyer_alex', senderId: 'u_alex', text: 'Glad the headphones worked out!', media: null, productId: 'prod-001', status: 'read', createdAt: ago(31) },
    { id: 'm8', conversationId: 'c_buyer_alex', senderId: 'u_buyer', text: 'Thanks for the review!', media: null, productId: null, status: 'read', createdAt: ago(30) },
  ],
  c_buyer_noor: [
    { id: 'm9', conversationId: 'c_buyer_noor', senderId: 'u_buyer', text: 'Is the backpack still 40% off?', media: null, productId: null, status: 'delivered', createdAt: ago(50) },
  ],
};

export const transactions: Transaction[] = [
  { id: 't1', type: 'purchase', direction: 'out', amount: usd(89.99), status: 'completed', description: 'Leather Everyday Backpack · Fashion Hub', createdAt: ago(4) },
  { id: 't2', type: 'commission', direction: 'in', amount: usd(12.4), status: 'completed', description: 'Affiliate commission · Vitamin C Serum', createdAt: ago(20) },
  { id: 't3', type: 'topup', direction: 'in', amount: usd(200), status: 'completed', description: 'Top up · Visa •••• 4242', createdAt: ago(48) },
  { id: 't4', type: 'refund', direction: 'in', amount: usd(45.99), status: 'pending', description: 'Refund · Laptop Stand', createdAt: ago(70) },
  { id: 't5', type: 'purchase', direction: 'out', amount: usd(79.99), status: 'completed', description: 'Wireless Headphones · TechStore', createdAt: ago(96) },
  { id: 't6', type: 'topup', direction: 'in', amount: usd(300), status: 'completed', description: 'Top up · Bank transfer', createdAt: ago(200) },
];
export const wallet = { balance: usd(500), pending: usd(45.99), currency: 'USD' as const };

const orderItem = (p: ProductDetail, quantity: number, variant: string | null = null) => ({ id: `${p.id}-item`, productId: p.id, name: p.name, imageUrl: p.imageUrl, variant, quantity, unitPrice: p.price });
const seller = (username: string) => u(username);
const buyerBits = { buyer: summary(byUsername('buyer')!), shippingTo: { recipient: 'Test Buyer', city: 'Jakarta', region: 'DKI Jakarta', country: 'ID' }, paymentMethod: 'wallet' as const, note: null };
export const orders: Order[] = [
  { id: 'o1', orderNumber: 'EZ-10422', status: 'out_for_delivery', escrow: { status: 'held', autoReleaseAt: ahead(6) }, seller: seller('fashion'), ...buyerBits, items: [orderItem(products[3], 1, 'Midnight / M')], subtotal: usd(89.99), shipping: usd(0), total: usd(89.99), tracking: { carrier: 'J&T Express', number: 'JT8842019921', url: null }, placedAt: ago(52), deliveredAt: null },
  { id: 'o2', orderNumber: 'EZ-10391', status: 'processing', escrow: { status: 'held', autoReleaseAt: ahead(7) }, seller: seller('techstore'), ...buyerBits, items: [orderItem(products[0], 1)], subtotal: usd(79.99), shipping: usd(0), total: usd(79.99), tracking: null, placedAt: ago(20), deliveredAt: null },
  { id: 'o3', orderNumber: 'EZ-10240', status: 'completed', escrow: { status: 'released', autoReleaseAt: null }, seller: seller('glowcare'), ...buyerBits, items: [orderItem(products[5], 2)], subtotal: usd(69.98), shipping: usd(0), total: usd(69.98), tracking: { carrier: 'DHL', number: 'DHL77120931', url: null }, placedAt: ago(24 * 12), deliveredAt: ago(24 * 8) },
  { id: 'o4', orderNumber: 'EZ-10188', status: 'refund_requested', escrow: { status: 'disputed', autoReleaseAt: null }, seller: seller('workspace'), ...buyerBits, items: [orderItem(products[2], 1)], subtotal: usd(45.99), shipping: usd(4.99), total: usd(50.98), tracking: null, placedAt: ago(24 * 18), deliveredAt: ago(24 * 14) },
];

export const addresses: Address[] = [
  { id: 'addr_home', label: 'Home', recipient: 'Test Buyer', phone: '+62 812 3456 7890', line1: 'Jl. Sudirman No. 12', line2: 'Apt 8B', city: 'Jakarta', region: 'DKI Jakarta', postal: '10220', country: 'ID', isDefault: true },
  { id: 'addr_office', label: 'Office', recipient: 'Test Buyer', phone: '+62 812 3456 7890', line1: 'Menara Astra, Level 21', line2: null, city: 'Jakarta', region: 'DKI Jakarta', postal: '10220', country: 'ID', isDefault: false },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'order', actor: null, message: 'Your Leather Everyday Backpack is out for delivery.', href: '/orders', thumbnailUrl: products[3].imageUrl, read: false, createdAt: ago(0.5) },
  { id: 'n2', type: 'like', actor: u('fashionista_maya'), message: 'liked your post.', href: '/post/post-001', thumbnailUrl: null, read: false, createdAt: ago(2) },
  { id: 'n3', type: 'follow', actor: u('noor.travels'), message: 'started following you.', href: '/profile/noor.travels', thumbnailUrl: null, read: true, createdAt: ago(6) },
  { id: 'n4', type: 'live', actor: u('tech_reviews_pro'), message: 'is live: Desk setup Q&A.', href: '/live', thumbnailUrl: null, read: true, createdAt: ago(9) },
  { id: 'n5', type: 'comment', actor: u('glow.with.sara'), message: 'commented: "Which shade did you get?"', href: '/post/post-003', thumbnailUrl: null, read: true, createdAt: ago(20) },
  { id: 'n6', type: 'system', actor: null, message: 'Escrow released for order EZ-10240. Thanks for confirming delivery!', href: '/orders', thumbnailUrl: null, read: true, createdAt: ago(24 * 8) },
];

export const comments = (postId: string) => {
  const base = [
    { id: `${postId}-c1`, author: u('glow.with.sara'), text: 'Which shade did you get? 😍', likes: 24, createdAt: ago(1.5) },
    { id: `${postId}-c2`, author: u('tech_reviews_pro'), text: 'Solid pick. Battery is the real deal.', likes: 11, createdAt: ago(3) },
    { id: `${postId}-c3`, author: u('noor.travels'), text: 'Adding to cart right now', likes: 4, createdAt: ago(7) },
  ];
  return base;
};
