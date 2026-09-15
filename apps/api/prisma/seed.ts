import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

/**
 * Dev/test fixtures mirroring apps/mobile/src/lib/mock.ts so the clients render identically against the real API.
 * Idempotent: re-running upserts by stable ids. Test credentials: password `Password1` for every seeded user.
 */
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const img = (id: string, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80`;

export async function seed() {
  // Transactional state is wiped so repeated seeds (tests, dev resets) start from the same balances and empty carts.
  await prisma.$transaction([
    prisma.liveViewer.deleteMany(), prisma.liveSession.deleteMany(), prisma.review.deleteMany(), prisma.payoutMethod.deleteMany(),
    prisma.cartItem.deleteMany(), prisma.order.deleteMany(), prisma.transaction.deleteMany(), prisma.refreshSession.deleteMany(),
    prisma.otpCode.deleteMany(), prisma.report.deleteMany(), prisma.block.deleteMany(), prisma.device.deleteMany(), prisma.webhookEvent.deleteMany(),
    prisma.auditLog.deleteMany(), prisma.notification.deleteMany(), prisma.like.deleteMany(), prisma.save.deleteMany(),
  ]);
  const passwordHash = await argon2.hash('Password1', { type: argon2.argon2id });

  const users = [
    { id: 'u_maya', email: 'maya@ezyify.test', username: 'fashionista_maya', name: 'Maya Chen', avatarUrl: img('photo-1507611268508-bf74edce9029', 200), verified: true, role: 'creator' as const },
    { id: 'u_alex', email: 'alex@ezyify.test', username: 'tech_reviews_pro', name: 'Alex Rivera', avatarUrl: img('photo-1506794778202-cad84cf45f1d', 200), verified: true, role: 'creator' as const },
    { id: 'u_sara', email: 'sara@ezyify.test', username: 'glow.with.sara', name: 'Sara Kim', avatarUrl: img('photo-1534528741775-53994a69daeb', 200), verified: false, role: 'creator' as const },
    { id: 'u_jules', email: 'jules@ezyify.test', username: 'homebyjules', name: 'Jules Park', avatarUrl: img('photo-1488716820095-cbe80883c496', 200), verified: true, role: 'seller' as const },
    { id: 'u_techstore', email: 'techstore@ezyify.test', username: 'techstore', name: 'TechStore', avatarUrl: img('photo-1556155092-490a1ba16284', 200), verified: true, role: 'seller' as const },
    { id: 'u_fashionhub', email: 'fashion@ezyify.test', username: 'fashion', name: 'Fashion Hub', avatarUrl: img('photo-1483985988355-763728e1935b', 200), verified: true, role: 'seller' as const },
    { id: 'u_glowcare', email: 'glowcare@ezyify.test', username: 'glowcare', name: 'GlowCare', avatarUrl: img('photo-1596462502278-27bfdc403348', 200), verified: true, role: 'seller' as const },
    { id: 'u_buyer', email: 'buyer@ezyify.test', username: 'buyer', name: 'Test Buyer', avatarUrl: img('photo-1500648767791-00dcc994a43e', 200), verified: false, role: 'user' as const },
    { id: 'u_admin', email: 'admin@ezyify.test', username: 'admin', name: 'Ezyify Admin', avatarUrl: null, verified: true, role: 'admin' as const },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { id: u.id }, create: { ...u, passwordHash, emailVerified: true, wallet: { create: { balance: u.id === 'u_buyer' ? 50_000 : 0 } }, cart: { create: {} } }, update: { ...u, failedLogins: 0, lockedUntil: null, wallet: { upsert: { create: { balance: u.id === 'u_buyer' ? 50_000 : 0 }, update: { balance: u.id === 'u_buyer' ? 50_000 : 0, pending: 0 } } } } });
  }
  await prisma.address.upsert({ where: { id: 'addr_buyer_home' }, create: { id: 'addr_buyer_home', userId: 'u_buyer', label: 'Home', recipient: 'Test Buyer', phone: '+6281234567890', line1: 'Jl. Sudirman No. 21', city: 'Jakarta', postal: '10220', country: 'ID', isDefault: true }, update: {} });

  const categories = [
    { id: 'cat_tech', slug: 'tech', name: 'Tech', imageUrl: img('photo-1498049794561-7780e7231661', 400) },
    { id: 'cat_fashion', slug: 'fashion', name: 'Fashion', imageUrl: img('photo-1483985988355-763728e1935b', 400) },
    { id: 'cat_beauty', slug: 'beauty', name: 'Beauty', imageUrl: img('photo-1596462502278-27bfdc403348', 400) },
    { id: 'cat_home', slug: 'home', name: 'Home', imageUrl: img('photo-1513694203232-719a280e022f', 400) },
    { id: 'cat_fitness', slug: 'fitness', name: 'Fitness', imageUrl: img('photo-1517836357463-d25dfeac3438', 400) },
  ];
  for (const c of categories) await prisma.category.upsert({ where: { id: c.id }, create: c, update: c });

  const products = [
    { id: 'prod-001', slug: 'wireless-headphones', name: 'Wireless Noise-Cancelling Headphones', description: 'Crystal-clear audio with adaptive noise cancellation and 30 h battery.', sellerId: 'u_techstore', categoryId: 'cat_tech', price: 7999, compareAtPrice: 12999, images: [img('photo-1505740420928-5e560c06d30e'), img('photo-1484704849700-f032a568e944')], tags: ['headphones', 'audio'], badge: 'bestseller', stock: 234, soldCount: 1250, ratingSum: 13666, ratingCount: 2847 },
    { id: 'prod-002', slug: 'smart-watch', name: 'Smart Watch Series 7', description: 'Health monitoring, GPS and a week of battery.', sellerId: 'u_techstore', categoryId: 'cat_tech', price: 19999, compareAtPrice: 29999, images: [img('photo-1523275335684-37898b6baf30')], tags: ['wearables'], badge: 'new', stock: 120, soldCount: 890, ratingSum: 9038, ratingCount: 1923 },
    { id: 'prod-003', slug: 'laptop-stand', name: 'Aluminium Laptop Stand', description: 'Ergonomic, foldable, fits 11–17" laptops.', sellerId: 'u_jules', categoryId: 'cat_tech', price: 4599, compareAtPrice: 6999, images: [img('photo-1527864550417-7fd91fc51a46')], tags: ['desk'], badge: null, stock: 60, soldCount: 300, ratingSum: 2608, ratingCount: 567 },
    { id: 'prod-004', slug: 'leather-backpack', name: 'Leather Everyday Backpack', description: 'Full-grain leather, 15" laptop sleeve, lifetime warranty.', sellerId: 'u_fashionhub', categoryId: 'cat_fashion', price: 8999, compareAtPrice: 14999, images: [img('photo-1553062407-98eeb64c6a62')], tags: ['bags'], badge: 'sale', stock: 45, soldCount: 720, ratingSum: 7134, ratingCount: 1456 },
    { id: 'prod-005', slug: 'minimalist-watch', name: 'Minimalist Watch', description: 'Sapphire glass, Japanese movement, 5 ATM.', sellerId: 'u_fashionhub', categoryId: 'cat_fashion', price: 12999, compareAtPrice: 19999, images: [img('photo-1524592094714-0f0654e20314')], tags: ['watch'], badge: null, stock: 30, soldCount: 410, ratingSum: 4192, ratingCount: 892 },
    { id: 'prod-006', slug: 'vitamin-c-serum', name: 'Vitamin C Brightening Serum', description: '15% L-ascorbic acid with ferulic acid.', sellerId: 'u_glowcare', categoryId: 'cat_beauty', price: 3499, compareAtPrice: 5999, images: [img('photo-1620916566398-39f1143ab7be')], tags: ['skincare'], badge: 'bestseller', stock: 500, soldCount: 3100, ratingSum: 10511, ratingCount: 2145 },
    { id: 'prod-007', slug: 'yoga-mat', name: 'Eco Yoga Mat', description: 'Natural rubber, 5 mm, non-slip in hot rooms.', sellerId: 'u_jules', categoryId: 'cat_fitness', price: 3499, compareAtPrice: 5499, images: [img('photo-1601925260368-ae2f83cf8b7f')], tags: ['yoga'], badge: null, stock: 80, soldCount: 640, ratingSum: 7678, ratingCount: 1567 },
    { id: 'prod-008', slug: 'led-table-lamp', name: 'LED Table Lamp', description: 'Warm-to-cool dimmable, USB-C, touch controls.', sellerId: 'u_jules', categoryId: 'cat_home', price: 5499, compareAtPrice: 8999, images: [img('photo-1507473885765-e6ed057f782c')], tags: ['lighting'], badge: 'limited', stock: 25, soldCount: 210, ratingSum: 2880, ratingCount: 640 },
  ];
  for (const p of products) await prisma.product.upsert({ where: { id: p.id }, create: p, update: p });
  // Throw-away accounts created by the e2e suite.
  await prisma.user.deleteMany({ where: { email: { startsWith: 'new', endsWith: '@ezyify.test' }, id: { notIn: users.map(u => u.id) } } });
  await prisma.productVariant.upsert({ where: { id: 'var_backpack_midnight' }, create: { id: 'var_backpack_midnight', productId: 'prod-004', name: 'Midnight / M', options: { Color: 'Midnight', Size: 'M' }, price: 8999, stock: 20 }, update: {} });
  await prisma.productVariant.upsert({ where: { id: 'var_backpack_sand' }, create: { id: 'var_backpack_sand', productId: 'prod-004', name: 'Sand / M', options: { Color: 'Sand', Size: 'M' }, price: 8999, stock: 15 }, update: {} });

  const ago = (h: number) => new Date(Date.now() - h * 3600_000);
  const posts = [
    { id: 'post-001', kind: 'post' as const, authorId: 'u_maya', caption: 'Just got these amazing wireless headphones! The sound quality is incredible and they are so comfortable.', hashtags: ['techreview', 'musiclovers'], location: 'Jakarta', createdAt: ago(2), likeCount: 12453, commentCount: 342, shareCount: 89, saveCount: 1200, media: [img('photo-1505740420928-5e560c06d30e', 1080), img('photo-1484704849700-f032a568e944', 1080)], products: ['prod-001'] },
    { id: 'post-002', kind: 'post' as const, authorId: 'u_alex', caption: 'Unboxing the new Smart Watch Series 7! Full review coming soon!', hashtags: ['unboxing', 'wearables'], location: null, createdAt: ago(5), likeCount: 8934, commentCount: 210, shareCount: 45, saveCount: 640, media: [img('photo-1694077743594-7b82dacafaf2', 1080)], products: ['prod-002'] },
    { id: 'post-003', kind: 'post' as const, authorId: 'u_sara', caption: 'My skincare routine essentials! This Vitamin C serum transformed my skin in 2 weeks.', hashtags: ['skincare', 'glowup'], location: 'Seoul', createdAt: ago(9), likeCount: 15672, commentCount: 512, shareCount: 130, saveCount: 2300, media: [img('photo-1620916566398-39f1143ab7be', 1080)], products: ['prod-006'] },
    { id: 'post-004', kind: 'post' as const, authorId: 'u_jules', caption: 'Transformed my workspace with these minimal pieces!', hashtags: ['workspace', 'minimal'], location: 'Singapore', createdAt: ago(14), likeCount: 6234, commentCount: 98, shareCount: 20, saveCount: 480, media: [img('photo-1507473885765-e6ed057f782c', 1080), img('photo-1527864550417-7fd91fc51a46', 1080)], products: ['prod-008', 'prod-003'] },
    { id: 'loop-001', kind: 'loop' as const, authorId: 'u_maya', caption: 'Three ways to style the leather backpack', hashtags: ['ootd', 'fashion'], location: null, createdAt: ago(3), likeCount: 45200, commentCount: 1200, shareCount: 890, saveCount: 5600, viewCount: 512000, media: [img('photo-1553062407-98eeb64c6a62', 1080)], products: ['prod-004'] },
    { id: 'loop-002', kind: 'loop' as const, authorId: 'u_sara', caption: 'Glass-skin routine in 60 seconds', hashtags: ['skincare'], location: null, createdAt: ago(11), likeCount: 88700, commentCount: 2400, shareCount: 1900, saveCount: 12000, viewCount: 1_200_000, media: [img('photo-1596462502278-27bfdc403348', 1080)], products: ['prod-006'] },
    { id: 'story-maya', kind: 'story' as const, authorId: 'u_maya', caption: '', hashtags: [], location: null, createdAt: ago(1), likeCount: 0, commentCount: 0, shareCount: 0, saveCount: 0, media: [img('photo-1483985988355-763728e1935b', 1080)], products: [] },
  ];
  for (const { media, products: tagged, ...p } of posts) {
    await prisma.post.upsert({
      where: { id: p.id },
      create: {
        ...p,
        expiresAt: p.kind === 'story' ? new Date(Date.now() + 24 * 3600_000) : null,
        media: { create: media.map((url, i) => ({ type: p.kind === 'loop' ? 'video' : 'image', url, thumbnailUrl: url, width: 1080, height: 1350, durationMs: p.kind === 'loop' ? 15000 : null, position: i })) },
        products: { create: tagged.map(productId => ({ productId })) },
      },
      update: { caption: p.caption },
    });
  }

  const liveSessions = [
    { id: 'live-001', hostId: 'u_techstore', title: 'The ANC audio event — live demos', status: 'live' as const, category: 'tech', coverUrl: products[0].images[0], productIds: ['prod-001', 'prod-002'], pinnedProductId: 'prod-001', likes: 842, peakViewers: 1240, startedAt: ago(0.5) },
    { id: 'live-002', hostId: 'u_fashionhub', title: 'Weekend capsule wardrobe edit', status: 'live' as const, category: 'fashion', coverUrl: products[3].images[0], productIds: ['prod-004', 'prod-005'], pinnedProductId: 'prod-004', likes: 516, peakViewers: 760, startedAt: ago(1) },
    { id: 'live-003', hostId: 'u_sara', title: 'Glass-skin routine, step by step', status: 'live' as const, category: 'beauty', coverUrl: products[5].images[0], productIds: ['prod-006'], pinnedProductId: 'prod-006', likes: 1299, peakViewers: 1980, startedAt: ago(0.25) },
    { id: 'live-004', hostId: 'u_glowcare', title: 'Derm-approved evening skincare', status: 'scheduled' as const, category: 'beauty', coverUrl: products[5].images[0], productIds: ['prod-006'], pinnedProductId: null, likes: 0, peakViewers: 0, scheduledFor: new Date(Date.now() + 24 * 3600_000) },
    { id: 'live-005', hostId: 'u_techstore', title: 'Back-to-school desk setup', status: 'scheduled' as const, category: 'tech', coverUrl: products[2].images[0], productIds: ['prod-003'], pinnedProductId: null, likes: 0, peakViewers: 0, scheduledFor: new Date(Date.now() + 2 * 24 * 3600_000) },
    { id: 'live-006', hostId: 'u_fashionhub', title: 'A fresh take on everyday accessories', status: 'scheduled' as const, category: 'fashion', coverUrl: products[4].images[0], productIds: ['prod-005'], pinnedProductId: null, likes: 0, peakViewers: 0, scheduledFor: new Date(Date.now() + 3 * 24 * 3600_000) },
  ];
  for (const session of liveSessions) {
    await prisma.liveSession.upsert({
      where: { id: session.id },
      create: session,
      update: { ...session },
    });
  }

  const reviews = [
    { id: 'rev-001', productId: 'prod-001', userId: 'u_maya', rating: 5, text: 'ANC is genuinely class‑leading and the 30h battery is real. Shipped in a day.', createdAt: ago(24 * 3) },
    { id: 'rev-002', productId: 'prod-001', userId: 'u_alex', rating: 4, text: 'Great sound. Ear cups run a little warm on long sessions.', reply: 'Thanks Alex — the vented cushions ship free to existing buyers, DM us!', repliedAt: ago(24 * 1.5), createdAt: ago(24 * 2) },
    { id: 'rev-003', productId: 'prod-002', userId: 'u_sara', rating: 3, text: 'Strap clasp popped open twice during runs. Watch itself is fine.', createdAt: ago(20) },
    { id: 'rev-004', productId: 'prod-004', userId: 'u_jules', rating: 5, text: 'Leather smells amazing and the laptop sleeve fits my 15”.', createdAt: ago(24 * 6) },
  ];
  // Reviews are wiped above and recreated so the product aggregates (already reset by the upsert) stay in sync.
  for (const r of reviews) {
    await prisma.review.create({ data: r });
    await prisma.product.update({ where: { id: r.productId }, data: { ratingSum: { increment: r.rating }, ratingCount: { increment: 1 } } });
  }

  for (const [followerId, followingId] of [['u_buyer', 'u_maya'], ['u_buyer', 'u_alex'], ['u_buyer', 'u_sara'], ['u_maya', 'u_sara'], ['u_alex', 'u_maya']]) {
    await prisma.follow.upsert({ where: { followerId_followingId: { followerId, followingId } }, create: { followerId, followingId }, update: {} });
  }

  const convo = await prisma.conversation.upsert({ where: { id: 'c_buyer_maya' }, create: { id: 'c_buyer_maya', participants: { create: [{ userId: 'u_buyer' }, { userId: 'u_maya' }] } }, update: {} });
  if ((await prisma.message.count({ where: { conversationId: convo.id } })) === 0) {
    await prisma.message.createMany({
      data: [
        { conversationId: convo.id, senderId: 'u_buyer', text: 'Hi Maya! Does the backpack run small?', status: 'read', createdAt: ago(1) },
        { conversationId: convo.id, senderId: 'u_maya', text: 'Hey! Not at all — I wear a medium in most brands.', status: 'read', createdAt: ago(0.8) },
        { conversationId: convo.id, senderId: 'u_maya', productId: 'prod-004', status: 'read', createdAt: ago(0.7) },
        { conversationId: convo.id, senderId: 'u_maya', text: 'Yes! The medium fits true to size 😊', status: 'delivered', createdAt: ago(0.2) },
      ],
    });
  }
  return { users: users.length, products: products.length, posts: posts.length, liveSessions: liveSessions.length };
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seed()
    .then(r => console.log('seeded', r))
    .finally(() => prisma.$disconnect());
}
