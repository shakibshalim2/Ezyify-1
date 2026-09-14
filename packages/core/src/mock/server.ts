import type { Address, Cart, CartItem, Comment, Conversation, Message, Notification, Order, Post, UserProfile } from '../schemas/index.js';
import * as fx from './fixtures.js';

/**
 * In-process mock of apps/api for demo / QA / offline builds and web tests.
 * `createMockFetch()` returns a `fetch`-compatible function that the shared ApiClient can use
 * unchanged, so screens are wired exactly as they are against the real backend.
 * State is in memory (cart, likes, follows, orders, messages) and resets on reload.
 */
export interface MockServerOptions {
  /** Simulated network latency in ms (0 in tests). */
  latencyMs?: number;
  /** Prefix stripped from request paths, e.g. `/v1`. Any `/v1` or `/api/v1` prefix is also tolerated. */
  basePath?: string;
  now?: () => number;
}

type Json = Record<string, unknown> | unknown[] | null;
type Handler = (ctx: Ctx) => Json | Promise<Json>;
interface Ctx {
  params: Record<string, string>;
  query: URLSearchParams;
  body: Record<string, unknown>;
  headers: Headers;
  user: fx.SeedUser | null;
  status: (code: number) => void;
}

export class MockApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string>,
  ) {
    super(message);
  }
}
const unauthorized = () => new MockApiError(401, 'UNAUTHORIZED', 'Sign in to continue');
const notFound = (what: string) => new MockApiError(404, 'NOT_FOUND', `${what} not found`);
const validation = (details: Record<string, string>) => new MockApiError(422, 'VALIDATION_ERROR', Object.values(details)[0] ?? 'Invalid input', details);

const PASSWORD = 'Password1';
const OTP_INVALID = '000000';

export function createMockState() {
  const users = fx.users.map(u => ({ ...u }));
  const passwords = new Map(users.map(u => [u.id, PASSWORD]));
  const sessions = new Map<string, string>(); // accessToken → userId
  const refreshTokens = new Map<string, string>(); // refreshToken → userId
  const revoked = new Set<string>();
  const pendingOtp = new Map<string, string>(); // userId → purpose
  const posts: Post[] = [...fx.posts, ...fx.loops, ...fx.stories].map(p => ({ ...p, engagement: { ...p.engagement } }));
  const likes = new Map<string, Set<string>>(); // userId → postIds
  const saves = new Map<string, Set<string>>();
  const follows = new Map<string, Set<string>>([['u_buyer', new Set(fx.buyerFollows)]]);
  const blocks = new Map<string, Set<string>>();
  const carts = new Map<string, { lines: { productId: string; variantId: string | null; quantity: number }[]; coupon: string | null }>();
  const orders: Order[] = fx.orders.map(o => ({ ...o }));
  const addresses = new Map<string, Address[]>([['u_buyer', fx.addresses.map(a => ({ ...a }))]]);
  const wallets = new Map<string, { balance: number; pending: number }>([['u_buyer', { balance: fx.wallet.balance.amount, pending: fx.wallet.pending.amount }]]);
  const transactions = new Map<string, typeof fx.transactions>([['u_buyer', [...fx.transactions]]]);
  const conversations = new Map<string, Conversation[]>([['u_buyer', fx.conversations.map(c => ({ ...c }))]]);
  const messages: Record<string, Message[]> = Object.fromEntries(Object.entries(fx.messages).map(([k, v]) => [k, [...v]]));
  const notifications = new Map<string, Notification[]>([['u_buyer', fx.notifications.map(n => ({ ...n }))]]);
  const comments = new Map<string, Comment[]>();
  const uploads = new Map<string, { contentType: string; sizeBytes: number }>();
  return { users, passwords, sessions, refreshTokens, revoked, pendingOtp, posts, likes, saves, follows, blocks, carts, orders, addresses, wallets, transactions, conversations, messages, notifications, comments, uploads, counter: 1000 };
}
export type MockState = ReturnType<typeof createMockState>;

export function createMockFetch(options: MockServerOptions = {}, state: MockState = createMockState()): typeof fetch & { state: MockState } {
  const latency = options.latencyMs ?? 250;
  const now = options.now ?? Date.now;
  // Random suffix: two independent states must never mint the same token string (see refresh-after-reset test).
  const nextId = (p: string) => `${p}_${(state.counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const set = <K>(m: Map<K, Set<string>>, k: K) => m.get(k) ?? (m.set(k, new Set()), m.get(k)!);
  const iso = () => new Date(now()).toISOString();
  const money = (amount: number) => ({ amount, currency: 'USD' as const });
  const requireUser = (c: Ctx) => {
    if (!c.user) throw unauthorized();
    return c.user;
  };

  const viewerPost = (p: Post, viewer: fx.SeedUser | null): Post => ({
    ...p,
    engagement: { ...p.engagement, isLiked: !!viewer && set(state.likes, viewer.id).has(p.id), isSaved: !!viewer && set(state.saves, viewer.id).has(p.id) },
  });
  const visiblePosts = (viewer: fx.SeedUser | null, kind?: string) =>
    state.posts
      .filter(p => (kind ? p.kind === kind : p.kind !== 'story'))
      .filter(p => !viewer || !set(state.blocks, viewer.id).has(p.author.id))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .map(p => viewerPost(p, viewer));
  const paginate = <T>(items: T[], q: URLSearchParams) => {
    const page = Math.max(1, Number(q.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q.get('pageSize') ?? 20)));
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), pagination: { page, pageSize, total: items.length, hasMore: start + pageSize < items.length } };
  };
  const session = (user: fx.SeedUser, native: boolean) => {
    const accessToken = `mock.${user.id}.${nextId('at')}`;
    // User id is embedded so a refresh token still resolves after the in-memory state resets (app restart in demo mode).
    const refreshToken = `mockrt.${user.id}.${nextId('rt')}`;
    state.sessions.set(accessToken, user.id);
    state.refreshTokens.set(refreshToken, user.id);
    return { accessToken, expiresIn: 900, user: fx.summary(user), ...(native ? { refreshToken } : {}) };
  };
  const profileOf = (target: fx.SeedUser, viewer: fx.SeedUser | null): UserProfile => {
    const base = fx.profile(target);
    const followers = base.followers + [...state.follows.values()].filter(s => s.has(target.id)).length - (fx.buyerFollows.includes(target.id) ? 1 : 0);
    return { ...base, name: target.name, username: target.username, bio: target.bio, location: target.location, avatarUrl: target.avatarUrl, followers: Math.max(0, followers), following: set(state.follows, target.id).size || base.following, isFollowing: !!viewer && set(state.follows, viewer.id).has(target.id) };
  };
  const cartOf = (userId: string): Cart => {
    const c = state.carts.get(userId) ?? { lines: [], coupon: null };
    const items: CartItem[] = c.lines.flatMap(l => {
      const p = fx.findProduct(l.productId);
      return p ? [{ productId: p.id, variantId: l.variantId, quantity: l.quantity, product: fx.productSummary(p) }] : [];
    });
    const subtotal = items.reduce((n, i) => n + i.product.price.amount * i.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 5000 ? 0 : 499;
    const discount = c.coupon === 'WELCOME10' ? Math.round(subtotal * 0.1) : 0;
    return { items, subtotal: money(subtotal), shipping: money(shipping), discount: money(discount), total: money(subtotal + shipping - discount), couponCode: c.coupon };
  };
  const convosOf = (userId: string) => state.conversations.get(userId) ?? (state.conversations.set(userId, []), state.conversations.get(userId)!);

  const routes: [string, string, Handler][] = [
    // ---- auth
    ['POST', '/auth/signup', c => {
      const email = String(c.body.email ?? '').toLowerCase();
      if (state.users.some(u => u.email === email)) throw new MockApiError(409, 'CONFLICT', 'An account with that email already exists');
      const name = String(c.body.name ?? 'New user');
      const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').slice(0, 20) || 'user';
      const username = state.users.some(u => u.username === base) ? `${base}${state.counter}` : base;
      const user: fx.SeedUser = { id: nextId('u'), email, username, name, avatarUrl: null, verified: false, role: 'user', bio: null, location: null };
      state.users.push(user);
      state.passwords.set(user.id, String(c.body.password ?? ''));
      state.pendingOtp.set(user.id, 'verify');
      state.wallets.set(user.id, { balance: 0, pending: 0 });
      c.status(201);
      return { userId: user.id, email, name, requiresOTP: true, otpSentTo: 'email' };
    }],
    ['POST', '/auth/verify-otp', c => {
      const user = state.users.find(u => u.id === c.body.userId);
      if (!user || !state.pendingOtp.has(user.id)) throw validation({ otp: 'Code expired — request a new one' });
      if (c.body.otp === OTP_INVALID) throw validation({ otp: 'That code is not valid' });
      state.pendingOtp.delete(user.id);
      return session(user, c.headers.get('x-client') === 'native');
    }],
    ['POST', '/auth/login', c => {
      const id = String(c.body.identifier ?? '').trim().toLowerCase();
      const user = state.users.find(u => u.email === id || u.username === id);
      if (!user || state.passwords.get(user.id) !== c.body.password) throw new MockApiError(401, 'UNAUTHORIZED', 'Incorrect email/phone or password');
      return session(user, c.headers.get('x-client') === 'native');
    }],
    ['POST', '/auth/refresh', c => {
      const rt = typeof c.body.refreshToken === 'string' ? c.body.refreshToken : null;
      const userId = rt ? (state.refreshTokens.get(rt) ?? (state.revoked.has(rt) ? null : rt.split('.')[1])) : null;
      if (!rt || !userId || !state.users.some(u => u.id === userId)) throw new MockApiError(401, 'UNAUTHORIZED', 'Session expired');
      state.revoked.add(rt);
      state.refreshTokens.delete(rt);
      const user = state.users.find(u => u.id === userId)!;
      const s = session(user, true);
      return c.headers.get('x-client') === 'native' ? { accessToken: s.accessToken, expiresIn: s.expiresIn, refreshToken: s.refreshToken } : { accessToken: s.accessToken, expiresIn: s.expiresIn };
    }],
    ['POST', '/auth/logout', c => {
      if (typeof c.body.refreshToken === 'string') {
        state.refreshTokens.delete(c.body.refreshToken);
        state.revoked.add(c.body.refreshToken);
      }
      const auth = c.headers.get('authorization')?.replace(/^Bearer /, '');
      if (auth) state.sessions.delete(auth);
      return { ok: true };
    }],
    ['POST', '/auth/logout-all', c => {
      const u = requireUser(c);
      for (const [k, v] of state.sessions) if (v === u.id) state.sessions.delete(k);
      for (const [k, v] of state.refreshTokens) {
        if (v !== u.id) continue;
        state.refreshTokens.delete(k);
        state.revoked.add(k);
      }
      return { ok: true };
    }],
    ['GET', '/auth/sessions', c => {
      const u = requireUser(c);
      return [...state.refreshTokens.entries()].filter(([, v]) => v === u.id).map(([k], i) => ({ id: k, userAgent: i === 0 ? 'Ezyify Android' : 'Chrome on Mac', ip: '127.0.0.1', createdAt: iso(), expiresAt: new Date(now() + 7 * 86_400_000).toISOString(), current: i === 0 }));
    }],
    ['DELETE', '/auth/sessions/:id', c => {
      requireUser(c);
      state.refreshTokens.delete(c.params.id);
      state.revoked.add(c.params.id);
      return { ok: true };
    }],
    ['POST', '/auth/forgot-password', () => ({ ok: true })],
    ['POST', '/auth/reset-password', () => ({ ok: true })],

    // ---- users
    ['GET', '/users/me', c => profileOf(requireUser(c), c.user)],
    ['PATCH', '/users/me', c => {
      const u = requireUser(c);
      if (typeof c.body.username === 'string' && state.users.some(x => x.username === c.body.username && x.id !== u.id)) throw new MockApiError(409, 'CONFLICT', 'That username is taken');
      for (const k of ['name', 'username', 'bio', 'location', 'avatarUrl', 'coverUrl'] as const) if (k in c.body) (u as unknown as Record<string, unknown>)[k] = c.body[k];
      return profileOf(u, u);
    }],
    ['GET', '/users/me/blocked', c => [...set(state.blocks, requireUser(c).id)].map(id => fx.byId(id)).filter(Boolean).map(u => ({ id: u!.id, username: u!.username, name: u!.name, avatarUrl: u!.avatarUrl }))],
    ['GET', '/users/:username', c => {
      const t = state.users.find(u => u.username === c.params.username);
      if (!t) throw notFound('User');
      return profileOf(t, c.user);
    }],
    ['GET', '/users/:username/followers', c => {
      const t = state.users.find(u => u.username === c.params.username);
      if (!t) throw notFound('User');
      return state.users.filter(u => set(state.follows, u.id).has(t.id)).map(fx.summary);
    }],
    ['GET', '/users/:username/following', c => {
      const t = state.users.find(u => u.username === c.params.username);
      if (!t) throw notFound('User');
      return [...set(state.follows, t.id)].map(id => state.users.find(u => u.id === id)).filter(Boolean).map(u => fx.summary(u!));
    }],
    ['POST', '/users/:username/follow', c => {
      const t = state.users.find(u => u.username === c.params.username);
      if (!t) throw notFound('User');
      set(state.follows, requireUser(c).id).add(t.id);
      return { ok: true };
    }],
    ['DELETE', '/users/:username/follow', c => {
      const t = state.users.find(u => u.username === c.params.username);
      if (t) set(state.follows, requireUser(c).id).delete(t.id);
      return { ok: true };
    }],
    ['POST', '/users/:id/block', c => {
      const u = requireUser(c);
      set(state.blocks, u.id).add(c.params.id);
      set(state.follows, u.id).delete(c.params.id);
      return { ok: true };
    }],
    ['DELETE', '/users/:id/block', c => {
      set(state.blocks, requireUser(c).id).delete(c.params.id);
      return { ok: true };
    }],

    // ---- catalog
    ['GET', '/products', c => {
      let list = fx.products.map(fx.productSummary);
      const cat = c.query.get('category');
      const q = c.query.get('q')?.toLowerCase();
      if (cat) list = list.filter(p => fx.findProduct(p.id)!.category === cat);
      if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || fx.findProduct(p.id)!.tags.some(t => t.includes(q)));
      const sort = c.query.get('sort');
      if (sort === 'price_asc') list.sort((a, b) => a.price.amount - b.price.amount);
      if (sort === 'price_desc') list.sort((a, b) => b.price.amount - a.price.amount);
      if (sort === 'newest') list.reverse();
      if (sort === 'popular' || !sort) list.sort((a, b) => b.reviewCount - a.reviewCount);
      return paginate(list, c.query);
    }],
    ['GET', '/products/:id', c => {
      const p = fx.findProduct(c.params.id);
      if (!p) throw notFound('Product');
      return p;
    }],
    ['GET', '/categories', () => fx.categories],
    ['GET', '/search', c => {
      const q = (c.query.get('q') ?? '').toLowerCase();
      return paginate(fx.products.filter(p => p.name.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)) || p.category.includes(q)).map(fx.productSummary), c.query);
    }],

    // ---- cart
    ['GET', '/cart', c => cartOf(requireUser(c).id)],
    ['POST', '/cart/items', c => {
      const u = requireUser(c);
      const p = fx.findProduct(String(c.body.productId));
      if (!p) throw notFound('Product');
      const cart = state.carts.get(u.id) ?? { lines: [], coupon: null };
      const variantId = typeof c.body.variantId === 'string' ? c.body.variantId : null;
      const qty = Number(c.body.quantity ?? 1);
      const line = cart.lines.find(l => l.productId === p.id && l.variantId === variantId);
      if (line) line.quantity = Math.min(99, line.quantity + qty);
      else cart.lines.push({ productId: p.id, variantId, quantity: qty });
      state.carts.set(u.id, cart);
      return cartOf(u.id);
    }],
    ['PATCH', '/cart/items/:productId', c => {
      const u = requireUser(c);
      const cart = state.carts.get(u.id) ?? { lines: [], coupon: null };
      const qty = Number(c.body.quantity);
      cart.lines = qty <= 0 ? cart.lines.filter(l => l.productId !== c.params.productId) : cart.lines.map(l => (l.productId === c.params.productId ? { ...l, quantity: qty } : l));
      state.carts.set(u.id, cart);
      return cartOf(u.id);
    }],
    ['DELETE', '/cart/items/:productId', c => {
      const u = requireUser(c);
      const cart = state.carts.get(u.id) ?? { lines: [], coupon: null };
      cart.lines = cart.lines.filter(l => l.productId !== c.params.productId);
      state.carts.set(u.id, cart);
      return cartOf(u.id);
    }],
    ['POST', '/cart/coupon', c => {
      const u = requireUser(c);
      const code = String(c.body.code ?? '').toUpperCase();
      if (code !== 'WELCOME10') throw validation({ code: 'That code is not valid' });
      const cart = state.carts.get(u.id) ?? { lines: [], coupon: null };
      cart.coupon = code;
      state.carts.set(u.id, cart);
      return cartOf(u.id);
    }],

    // ---- addresses
    ['GET', '/addresses', c => state.addresses.get(requireUser(c).id) ?? []],
    ['POST', '/addresses', c => {
      const u = requireUser(c);
      const list = state.addresses.get(u.id) ?? [];
      const a: Address = { id: nextId('addr'), label: String(c.body.label), recipient: String(c.body.recipient), phone: String(c.body.phone), line1: String(c.body.line1), line2: (c.body.line2 as string) ?? null, city: String(c.body.city), region: (c.body.region as string) ?? null, postal: String(c.body.postal), country: String(c.body.country).toUpperCase(), isDefault: !!c.body.isDefault || list.length === 0 };
      if (a.isDefault) list.forEach(x => (x.isDefault = false));
      list.push(a);
      state.addresses.set(u.id, list);
      c.status(201);
      return a;
    }],
    ['DELETE', '/addresses/:id', c => {
      const u = requireUser(c);
      state.addresses.set(u.id, (state.addresses.get(u.id) ?? []).filter(a => a.id !== c.params.id));
      return { ok: true };
    }],

    // ---- orders + escrow
    ['POST', '/checkout', c => {
      const u = requireUser(c);
      const idem = c.headers.get('idempotency-key');
      if (idem) {
        const prior = state.orders.filter(o => o.id.startsWith(`${idem}:`));
        if (prior.length) return prior;
      }
      const address = (state.addresses.get(u.id) ?? []).find(a => a.id === c.body.addressId);
      if (!address) throw notFound('Address');
      const cart = cartOf(u.id);
      if (!cart.items.length) throw validation({ cart: 'Your cart is empty' });
      const bySeller = new Map<string, CartItem[]>();
      for (const it of cart.items) bySeller.set(it.product.seller.username, [...(bySeller.get(it.product.seller.username) ?? []), it]);
      const paidNow = c.body.paymentMethod === 'wallet';
      const wallet = state.wallets.get(u.id) ?? { balance: 0, pending: 0 };
      if (paidNow && wallet.balance < cart.total.amount) throw validation({ payment: 'Insufficient wallet balance' });
      const created: Order[] = [];
      let n = 0;
      for (const [sellerName, items] of bySeller) {
        const subtotal = items.reduce((s, i) => s + i.product.price.amount * i.quantity, 0);
        const shipping = n === 0 ? cart.shipping.amount : 0;
        const discount = n === 0 ? cart.discount.amount : 0;
        const order: Order = {
          id: idem ? `${idem}:${n}` : nextId('o'),
          orderNumber: `EZ-${10500 + state.counter}`,
          status: paidNow ? 'paid' : 'pending_payment',
          escrow: { status: 'held', autoReleaseAt: new Date(now() + 7 * 86_400_000).toISOString() },
          seller: fx.summary(fx.byUsername(sellerName)!),
          items: items.map(i => ({ id: nextId('oi'), productId: i.productId, name: i.product.name, imageUrl: i.product.imageUrl, variant: i.variantId ? (fx.findProduct(i.productId)?.variants.find(v => v.id === i.variantId)?.name ?? null) : null, quantity: i.quantity, unitPrice: i.product.price })),
          subtotal: money(subtotal),
          shipping: money(shipping),
          total: money(subtotal + shipping - discount),
          tracking: null,
          placedAt: iso(),
          deliveredAt: null,
        };
        created.push(order);
        n++;
      }
      if (paidNow) {
        wallet.balance -= cart.total.amount;
        state.wallets.set(u.id, wallet);
        const tx = state.transactions.get(u.id) ?? [];
        tx.unshift({ id: nextId('t'), type: 'purchase', direction: 'out', amount: money(cart.total.amount), status: 'completed', description: `Order payment · ${created.map(o => o.orderNumber).join(', ')}`, createdAt: iso() });
        state.transactions.set(u.id, tx);
      }
      state.orders.unshift(...created);
      state.carts.set(u.id, { lines: [], coupon: null });
      const notes = state.notifications.get(u.id) ?? [];
      notes.unshift({ id: nextId('n'), type: 'order', actor: null, message: `Order ${created[0].orderNumber} confirmed. Your payment is held in escrow until delivery.`, href: `/orders/${created[0].id}`, thumbnailUrl: created[0].items[0].imageUrl, read: false, createdAt: iso() });
      state.notifications.set(u.id, notes);
      c.status(201);
      return created;
    }],
    ['GET', '/orders', c => {
      requireUser(c);
      const status = c.query.get('status');
      return paginate(status ? state.orders.filter(o => o.status === status) : state.orders, c.query);
    }],
    ['GET', '/orders/:id', c => {
      requireUser(c);
      const o = state.orders.find(x => x.id === c.params.id);
      if (!o) throw notFound('Order');
      return o;
    }],
    ['GET', '/orders/:id/timeline', c => {
      requireUser(c);
      const o = state.orders.find(x => x.id === c.params.id);
      if (!o) throw notFound('Order');
      const steps: Order['status'][] = ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'];
      const idx = steps.indexOf(o.status);
      const t0 = +new Date(o.placedAt);
      const events = steps.slice(0, Math.max(1, idx + 1)).map((s, i) => ({ status: s, at: new Date(t0 + i * 6 * 3600_000).toISOString(), note: i === 0 ? 'Payment held in escrow' : null }));
      if (idx < 0) events.push({ status: o.status, at: iso(), note: null });
      return events;
    }],
    ['POST', '/orders/:id/confirm-delivery', c => {
      const u = requireUser(c);
      const o = state.orders.find(x => x.id === c.params.id);
      if (!o) throw notFound('Order');
      if (!['delivered', 'out_for_delivery', 'shipped'].includes(o.status)) throw new MockApiError(409, 'CONFLICT', `Cannot confirm an order that is ${o.status}`);
      o.status = 'completed';
      o.escrow = { status: 'released', autoReleaseAt: null };
      o.deliveredAt = iso();
      const notes = state.notifications.get(u.id) ?? [];
      notes.unshift({ id: nextId('n'), type: 'system', actor: null, message: `Escrow released for order ${o.orderNumber}. Thanks for confirming delivery!`, href: `/orders/${o.id}`, thumbnailUrl: null, read: false, createdAt: iso() });
      state.notifications.set(u.id, notes);
      return o;
    }],
    ['POST', '/orders/:id/refund', c => {
      requireUser(c);
      const o = state.orders.find(x => x.id === c.params.id);
      if (!o) throw notFound('Order');
      if (o.escrow.status !== 'held') throw new MockApiError(409, 'CONFLICT', 'Escrow already settled');
      o.status = 'refund_requested';
      o.escrow = { status: 'disputed', autoReleaseAt: null };
      return o;
    }],
    ['POST', '/orders/:id/cancel', c => {
      const u = requireUser(c);
      const o = state.orders.find(x => x.id === c.params.id);
      if (!o) throw notFound('Order');
      if (!['pending_payment', 'paid', 'processing'].includes(o.status)) throw new MockApiError(409, 'CONFLICT', `Cannot cancel an order that is ${o.status}`);
      const refund = o.status !== 'pending_payment';
      o.status = 'cancelled';
      o.escrow = { status: refund ? 'refunded' : 'released', autoReleaseAt: null };
      if (refund) {
        const w = state.wallets.get(u.id) ?? { balance: 0, pending: 0 };
        w.balance += o.total.amount;
        state.wallets.set(u.id, w);
        const tx = state.transactions.get(u.id) ?? [];
        tx.unshift({ id: nextId('t'), type: 'refund', direction: 'in', amount: o.total, status: 'completed', description: `Refund · ${o.orderNumber}`, createdAt: iso() });
        state.transactions.set(u.id, tx);
      }
      return o;
    }],

    // ---- wallet
    ['GET', '/wallet', c => {
      const w = state.wallets.get(requireUser(c).id) ?? { balance: 0, pending: 0 };
      return { balance: money(w.balance), pending: money(w.pending), currency: 'USD' };
    }],
    ['GET', '/wallet/transactions', c => paginate(state.transactions.get(requireUser(c).id) ?? [], c.query)],
    ['POST', '/wallet/topup', c => {
      const u = requireUser(c);
      const amount = Number(c.body.amount);
      if (!(amount > 0)) throw validation({ amount: 'Enter an amount' });
      const w = state.wallets.get(u.id) ?? { balance: 0, pending: 0 };
      w.balance += amount;
      state.wallets.set(u.id, w);
      const tx = state.transactions.get(u.id) ?? [];
      tx.unshift({ id: nextId('t'), type: 'topup', direction: 'in', amount: money(amount), status: 'completed', description: `Top up · ${String(c.body.method ?? 'card')}`, createdAt: iso() });
      state.transactions.set(u.id, tx);
      return { balance: money(w.balance), pending: money(w.pending), currency: 'USD' };
    }],
    ['POST', '/wallet/withdraw', c => {
      const u = requireUser(c);
      const amount = Number(c.body.amount);
      const w = state.wallets.get(u.id) ?? { balance: 0, pending: 0 };
      if (!(amount > 0) || amount > w.balance) throw validation({ amount: 'Amount exceeds your available balance' });
      w.balance -= amount;
      w.pending += amount;
      state.wallets.set(u.id, w);
      const t = { id: nextId('t'), type: 'withdrawal' as const, direction: 'out' as const, amount: money(amount), status: 'pending' as const, description: 'Withdrawal · bank account', createdAt: iso() };
      const tx = state.transactions.get(u.id) ?? [];
      tx.unshift(t);
      state.transactions.set(u.id, tx);
      return t;
    }],

    // ---- feed
    ['GET', '/feed', c => {
      let list = visiblePosts(c.user, c.query.get('kind') ?? undefined);
      const author = c.query.get('author');
      const tag = c.query.get('hashtag')?.replace(/^#/, '').toLowerCase();
      if (author) list = list.filter(p => p.author.username === author);
      if (tag) list = list.filter(p => p.hashtags.some(h => h.toLowerCase() === tag));
      return paginate(list, c.query);
    }],
    ['GET', '/loops', c => {
      let list = visiblePosts(c.user, 'loop');
      const author = c.query.get('author');
      if (author) list = list.filter(p => p.author.username === author);
      return paginate(list, c.query);
    }],
    ['GET', '/stories', c => visiblePosts(c.user, 'story').filter(p => now() - +new Date(p.createdAt) < 24 * 3600_000)],
    ['GET', '/posts/:id', c => {
      const p = state.posts.find(x => x.id === c.params.id);
      if (!p) throw notFound('Post');
      return viewerPost(p, c.user);
    }],
    ['POST', '/posts', c => {
      const u = requireUser(c);
      const kind = (c.body.kind as Post['kind']) ?? 'post';
      const post: Post = {
        id: nextId(kind),
        kind,
        author: fx.summary(u),
        caption: String(c.body.caption ?? ''),
        hashtags: ((c.body.hashtags as string[]) ?? []).map(h => h.replace(/^#/, '')),
        media: c.body.media as Post['media'],
        taggedProductIds: (c.body.taggedProductIds as string[]) ?? [],
        engagement: { likes: 0, comments: 0, shares: 0, saves: 0, ...(kind === 'loop' ? { views: 0 } : {}), isLiked: false, isSaved: false },
        location: (c.body.location as string | null) ?? null,
        createdAt: iso(),
      };
      state.posts.unshift(post);
      c.status(201);
      return post;
    }],
    ['DELETE', '/posts/:id', c => {
      const u = requireUser(c);
      const i = state.posts.findIndex(p => p.id === c.params.id);
      if (i < 0) throw notFound('Post');
      if (state.posts[i].author.id !== u.id) throw new MockApiError(403, 'FORBIDDEN', 'Not your post');
      state.posts.splice(i, 1);
      return { ok: true };
    }],
    ['POST', '/posts/:id/like', c => {
      const p = state.posts.find(x => x.id === c.params.id);
      if (!p) throw notFound('Post');
      const s = set(state.likes, requireUser(c).id);
      if (!s.has(p.id)) {
        s.add(p.id);
        p.engagement.likes++;
      }
      return { ok: true };
    }],
    ['DELETE', '/posts/:id/like', c => {
      const p = state.posts.find(x => x.id === c.params.id);
      const s = set(state.likes, requireUser(c).id);
      if (p && s.delete(p.id)) p.engagement.likes = Math.max(0, p.engagement.likes - 1);
      return { ok: true };
    }],
    ['POST', '/posts/:id/save', c => {
      const p = state.posts.find(x => x.id === c.params.id);
      if (!p) throw notFound('Post');
      const s = set(state.saves, requireUser(c).id);
      if (!s.has(p.id)) {
        s.add(p.id);
        p.engagement.saves++;
      }
      return { ok: true };
    }],
    ['DELETE', '/posts/:id/save', c => {
      const p = state.posts.find(x => x.id === c.params.id);
      const s = set(state.saves, requireUser(c).id);
      if (p && s.delete(p.id)) p.engagement.saves = Math.max(0, p.engagement.saves - 1);
      return { ok: true };
    }],
    ['GET', '/posts/:id/comments', c => {
      if (!state.posts.some(p => p.id === c.params.id)) throw notFound('Post');
      const list = state.comments.get(c.params.id) ?? (state.comments.set(c.params.id, fx.comments(c.params.id)), state.comments.get(c.params.id)!);
      return paginate(list, c.query);
    }],
    ['POST', '/posts/:id/comments', c => {
      const u = requireUser(c);
      const p = state.posts.find(x => x.id === c.params.id);
      if (!p) throw notFound('Post');
      const list = state.comments.get(p.id) ?? (state.comments.set(p.id, fx.comments(p.id)), state.comments.get(p.id)!);
      const comment: Comment = { id: nextId('c'), author: fx.summary(u), text: String(c.body.text ?? ''), likes: 0, createdAt: iso() };
      list.unshift(comment);
      p.engagement.comments++;
      c.status(201);
      return comment;
    }],

    // ---- messaging
    ['GET', '/conversations', c => convosOf(requireUser(c).id)],
    ['POST', '/conversations', c => {
      const u = requireUser(c);
      const other = state.users.find(x => x.username === c.body.username);
      if (!other) throw notFound('User');
      if (other.id === u.id) throw validation({ username: "You can't message yourself" });
      const list = convosOf(u.id);
      const existing = list.find(cv => cv.participants[0].id === other.id);
      if (existing) return { id: existing.id };
      const convo: Conversation = { id: nextId('c'), participants: [fx.summary(other)], lastMessage: null, unreadCount: 0 };
      list.unshift(convo);
      state.messages[convo.id] = [];
      c.status(201);
      return { id: convo.id };
    }],
    ['GET', '/conversations/:id/messages', c => {
      const u = requireUser(c);
      const convo = convosOf(u.id).find(cv => cv.id === c.params.id);
      if (!convo) throw notFound('Conversation');
      convo.unreadCount = 0;
      const list = [...(state.messages[convo.id] ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      return paginate(list, c.query);
    }],
    ['POST', '/conversations/:id/messages', c => {
      const u = requireUser(c);
      const convo = convosOf(u.id).find(cv => cv.id === c.params.id);
      if (!convo) throw notFound('Conversation');
      const text = typeof c.body.text === 'string' ? c.body.text : null;
      const productId = typeof c.body.productId === 'string' ? c.body.productId : null;
      const mediaUrl = typeof c.body.mediaUrl === 'string' ? c.body.mediaUrl : null;
      if (!text && !productId && !mediaUrl) throw validation({ text: 'Message is empty' });
      const msg: Message = { id: nextId('m'), conversationId: convo.id, senderId: u.id, text, media: mediaUrl ? { type: 'image', url: mediaUrl, thumbnailUrl: null, width: null, height: null, durationMs: null } : null, productId, status: 'sent', createdAt: iso() };
      (state.messages[convo.id] ??= []).push(msg);
      convo.lastMessage = { text: text ?? (productId ? 'Shared a product' : 'Sent a photo'), at: msg.createdAt, fromMe: true };
      // Demo: the other party replies after a moment so chat feels alive.
      setTimeout(() => {
        const reply: Message = { id: nextId('m'), conversationId: convo.id, senderId: convo.participants[0].id, text: 'Got it — let me check and get back to you 🙌', media: null, productId: null, status: 'delivered', createdAt: iso() };
        (state.messages[convo.id] ??= []).push(reply);
        convo.lastMessage = { text: reply.text!, at: reply.createdAt, fromMe: false };
        msg.status = 'read';
      }, 1500);
      c.status(201);
      return msg;
    }],

    // ---- notifications & devices
    ['GET', '/notifications', c => paginate(state.notifications.get(requireUser(c).id) ?? [], c.query)],
    ['GET', '/notifications/unread-count', c => ({ count: (state.notifications.get(requireUser(c).id) ?? []).filter(n => !n.read).length })],
    ['POST', '/notifications/read-all', c => {
      (state.notifications.get(requireUser(c).id) ?? []).forEach(n => (n.read = true));
      return { ok: true };
    }],
    ['POST', '/notifications/:id/read', c => {
      const n = (state.notifications.get(requireUser(c).id) ?? []).find(x => x.id === c.params.id);
      if (n) n.read = true;
      return { ok: true };
    }],
    ['POST', '/devices', c => (requireUser(c), { ok: true })],
    ['DELETE', '/devices/:token', () => ({ ok: true })],

    // ---- uploads (no bucket: returns a data-less URL the app can render via the picked local file)
    ['POST', '/uploads/sign', c => {
      const u = requireUser(c);
      const key = `u/${u.id.replace(/[^a-z0-9]/g, '')}/${String(c.body.purpose)}/${crypto.randomUUID()}.${String(c.body.contentType).split('/')[1]?.replace('jpeg', 'jpg').replace('quicktime', 'mov')}`;
      state.uploads.set(key, { contentType: String(c.body.contentType), sizeBytes: Number(c.body.sizeBytes) });
      return { key, url: `https://mock-bucket.ezyify.app/${key}`, method: 'PUT', headers: { 'Content-Type': String(c.body.contentType) }, expiresInSeconds: 300, publicUrl: `https://mock-bucket.ezyify.app/${key}` };
    }],
    ['POST', '/uploads/finalize', c => {
      requireUser(c);
      const up = state.uploads.get(String(c.body.key));
      if (!up) throw notFound('Upload');
      return { key: c.body.key, url: `https://mock-bucket.ezyify.app/${String(c.body.key)}`, contentType: up.contentType, kind: up.contentType.startsWith('video') ? 'video' : 'image', sizeBytes: up.sizeBytes };
    }],

    // ---- account & moderation
    ['POST', '/account/delete', c => {
      const u = requireUser(c);
      if (typeof c.body.password === 'string' && state.passwords.get(u.id) !== c.body.password) throw new MockApiError(401, 'UNAUTHORIZED', 'Incorrect password');
      for (const [k, v] of state.sessions) if (v === u.id) state.sessions.delete(k);
      return { ok: true };
    }],
    ['POST', '/account/restore', c => (requireUser(c), { ok: true })],
    ['POST', '/account/export', c => (requireUser(c), { ok: true })],
    ['POST', '/reports', c => (requireUser(c), c.status(201), { ok: true, id: nextId('rep') })],
    ['GET', '/health', () => ({ status: 'ok', mode: 'mock' })],
  ];

  const compiled = routes.map(([method, pattern, handler]) => {
    const keys: string[] = [];
    const re = new RegExp('^' + pattern.replace(/\//g, '\\/').replace(/:(\w+)/g, (_m, k: string) => (keys.push(k), '([^/]+)')) + '$');
    return { method, re, keys, handler };
  });

  const mockBucket = /^https:\/\/mock-bucket\.ezyify\.app\//;

  const mockFetch = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://mock.local');
    const method = (init.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();
    if (latency) await new Promise(r => setTimeout(r, latency));
    if (mockBucket.test(url.href)) return new Response(null, { status: 200 });

    let path = url.pathname;
    if (options.basePath && path.startsWith(options.basePath)) path = path.slice(options.basePath.length);
    path = path.replace(/^\/api/, '').replace(/^\/v\d+/, '').replace(/\/$/, '') || '/';

    const headers = new Headers(init.headers ?? (typeof input === 'object' && 'headers' in input ? input.headers : undefined));
    const token = headers.get('authorization')?.replace(/^Bearer /, '');
    const userId = token ? state.sessions.get(token) : undefined;
    const user = userId ? (state.users.find(u => u.id === userId) ?? null) : null;
    if (token && !userId) return envelopeError(401, 'UNAUTHORIZED', 'Session expired');

    let body: Record<string, unknown> = {};
    if (init.body) {
      try {
        body = JSON.parse(String(init.body)) as Record<string, unknown>;
      } catch {
        body = {};
      }
    }

    for (const r of compiled) {
      if (r.method !== method) continue;
      const m = r.re.exec(path);
      if (!m) continue;
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      let status = 200;
      try {
        const data = await r.handler({ params, query: url.searchParams, body, headers, user, status: s => (status = s) });
        return new Response(JSON.stringify({ success: true, data }), { status, headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        if (e instanceof MockApiError) return envelopeError(e.status, e.code, e.message, e.details);
        return envelopeError(500, 'SERVER_ERROR', e instanceof Error ? e.message : 'Mock server error');
      }
    }
    return envelopeError(404, 'NOT_FOUND', `No mock route for ${method} ${path}`);
  }) as typeof fetch & { state: MockState };
  mockFetch.state = state;
  return mockFetch;
}

function envelopeError(status: number, code: string, message: string, details?: Record<string, string>) {
  return new Response(JSON.stringify({ success: false, error: { code, message, ...(details ? { details } : {}) } }), { status, headers: { 'Content-Type': 'application/json' } });
}

/** Demo credentials surfaced on the login screen in mock mode. */
export const MOCK_CREDENTIALS = { email: 'buyer@ezyify.test', password: PASSWORD, seller: 'jules@ezyify.test', creator: 'maya@ezyify.test' } as const;
