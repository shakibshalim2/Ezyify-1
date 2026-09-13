import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Users, Gift, Heart, Share2, Send, X, ShoppingBag, VolumeX, Volume2, Pin, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Button } from '../components/primitives/Button';
import { SEO, SEOConfigs } from '../components/SEO';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { mockProducts, type Product } from '../data/enhanced-mock-data';
import { DURATION, EASE_EMPHASIZED, springSnappy } from '../lib/motion';

interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  message: string;
  isSystem: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
}

const HOST = {
  username: 'StyleMaven',
  title: 'Fashion Haul 2026 — New arrivals',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  poster: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
  startedAt: '45 min ago',
  likes: 12453,
};

const SEED_CHAT: ChatMessage[] = [
  { id: 1, user: 'Sarah123', avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=50', message: 'Love this jacket!', isSystem: false },
  { id: 2, user: 'Mike_Chen', avatar: 'https://images.unsplash.com/photo-1752859951149-7d3fc700a7ec?w=50', message: 'Does it come in blue?', isSystem: false },
  { id: 3, user: 'System', avatar: '', message: 'Emma_W just bought Premium Cotton T‑Shirt', isSystem: true },
  { id: 4, user: 'Dana', avatar: 'https://images.unsplash.com/photo-1758521541720-1809f58388c2?w=50', message: 'Escrow makes me feel safe buying live', isSystem: false },
];

const AUTO_CHAT = [
  'Is the fabric stretchy?',
  'Just ordered mine!',
  'Can you show the back?',
  'Shipping to Jakarta?',
  'This colour is gorgeous',
];

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function addToCart(product: Product) {
  let cart: { id: string; quantity: number }[] = [];
  try {
    cart = JSON.parse(localStorage.getItem('ezyify_cart') || '[]');
  } catch {
    cart = [];
  }
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ id: product.id, quantity: 1 });
  localStorage.setItem('ezyify_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
  toast.success('Added to cart');
}

function LiveSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex bg-black">
      <div className="flex-1 animate-pulse bg-gradient-to-br from-primary/20 via-black to-black" />
      <div className="hidden w-[360px] border-l border-white/10 bg-black lg:block" />
    </div>
  );
}

function ChatList({ messages, endRef, compact }: { messages: ChatMessage[]; endRef: React.Ref<HTMLDivElement>; compact?: boolean }) {
  return (
    <div className={`flex flex-col gap-2 ${compact ? 'justify-end' : ''}`}>
      {messages.map(m => (
        <motion.div
          key={m.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.fast }}
          className={`flex max-w-[92%] items-start gap-2 text-[13px] leading-snug ${compact ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : ''}`}
        >
          {m.isSystem ? (
            <span className="rounded-full bg-accent-brand/90 px-2.5 py-1 text-xs font-medium text-white">
              {m.message}
            </span>
          ) : (
            <>
              <img src={m.avatar} alt="" loading="lazy" className="mt-0.5 size-6 shrink-0 rounded-full object-cover" />
              <p className="text-white">
                <span className="mr-1.5 font-semibold text-white/80">{m.user}</span>
                {m.message}
              </p>
            </>
          )}
        </motion.div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

function ProductRow({ product, pinned, onAdd }: { product: Product; pinned?: boolean; onAdd: (p: Product) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-white/10 bg-white/5 p-2.5">
      <Link to={`/product/${product.id}`} className="size-16 shrink-0 overflow-hidden rounded-xl">
        <ImageWithFallback src={product.image} alt={product.name} loading="lazy" className="size-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        {pinned && (
          <span className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-brand">
            <Pin className="size-3" /> Pinned
          </span>
        )}
        <p className="truncate text-sm font-medium text-white">{product.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="font-display text-base font-bold tabular-nums text-white">{money(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs tabular-nums text-white/50 line-through">{money(product.originalPrice)}</span>
          )}
          <span className="ml-auto flex items-center gap-0.5 text-[11px] text-white/60">
            <Star className="size-3 fill-current text-warning" /> {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
      <Button size="sm" variant="accent" onClick={() => onAdd(product)} aria-label={`Buy ${product.name}`}>
        Buy
      </Button>
    </div>
  );
}

export default function LivePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const heartId = useRef(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [message, setMessage] = useState('');
  const [likes, setLikes] = useState(HOST.likes);
  const [viewers, setViewers] = useState(2847);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>(SEED_CHAT);
  const [sheet, setSheet] = useState<'none' | 'shop'>('none');
  const [rail, setRail] = useState<'chat' | 'shop'>('chat');

  const products = mockProducts.filter(p => p.category === 'Fashion').slice(0, 6);
  const pinned = products[0];

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setViewers(v => Math.max(100, v + Math.floor(Math.random() * 21) - 10));
      setChat(prev => [
        ...prev.slice(-30),
        {
          id: Date.now(),
          user: ['Ava', 'Ken', 'Priya', 'Leo'][Math.floor(Math.random() * 4)],
          avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${Math.random()}`,
          message: AUTO_CHAT[Math.floor(Math.random() * AUTO_CHAT.length)],
          isSystem: false,
        },
      ]);
    }, 5000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }, [chat, reduce]);

  const sendMessage = useCallback(() => {
    const text = message.trim();
    if (!text) return;
    setChat(prev => [
      ...prev,
      { id: Date.now(), user: 'You', avatar: 'https://images.unsplash.com/photo-1758521541720-1809f58388c2?w=50', message: text, isSystem: false },
    ]);
    setMessage('');
  }, [message]);

  const sendLike = useCallback(() => {
    setLikes(l => l + 1);
    const hid = ++heartId.current;
    setHearts(h => [...h.slice(-12), { id: hid, x: 20 + Math.random() * 40 }]);
    setTimeout(() => setHearts(h => h.filter(x => x.id !== hid)), 1600);
  }, []);

  const share = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/live/${id}`);
    toast.success('Link copied');
  };

  if (isLoading) return <LiveSkeleton />;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white lg:flex-row">
      <SEO {...SEOConfigs.live} />

      {/* Stage */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <ImageWithFallback src={HOST.poster} alt={HOST.title} className="absolute inset-0 size-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/0 to-black/85" />

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-2 px-3 pt-[calc(var(--safe-top)+0.75rem)]">
          <Link to={`/profile/${HOST.username}`} className="flex min-w-0 max-w-[45%] items-center gap-2 rounded-full bg-black/45 py-1 pl-1 pr-3 backdrop-blur-md">
            <img src={HOST.avatar} alt="" className="size-9 rounded-full border-2 border-white/80 object-cover" />
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-sm font-semibold leading-tight">
                <span className="truncate">{HOST.username}</span>
                <VerifiedBadge size="sm" />
              </div>
              <div className="text-[11px] text-white/70">{HOST.startedAt}</div>
            </div>
          </Link>
          <span className="live-badge inline-flex items-center gap-1.5 rounded-full bg-error px-2.5 py-1 text-[11px] font-bold tracking-wide">
            LIVE
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium tabular-nums backdrop-blur-md">
            <Users className="size-3.5" /> {viewers.toLocaleString()}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setIsMuted(m => !m)}
              className="flex size-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-md transition-colors hover:bg-black/65"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex size-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-md transition-colors hover:bg-black/65"
              aria-label="Leave live"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Floating hearts */}
        <div className="pointer-events-none absolute bottom-40 right-3 z-20 h-64 w-20">
          <AnimatePresence>
            {hearts.map(h => (
              <motion.span
                key={h.id}
                initial={{ opacity: 0, y: 0, x: h.x, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], y: -220, x: h.x + (Math.random() * 30 - 15), scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute bottom-0"
              >
                <Heart className="size-7 fill-error text-error drop-shadow" />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile: chat overlay + pinned product + composer */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 px-3 pb-[calc(var(--safe-bottom)+0.75rem)] lg:hidden">
          <div className="max-h-44 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%)]">
            <div className="flex max-h-44 flex-col justify-end overflow-y-auto scrollbar-hide">
              <ChatList messages={chat.slice(-8)} endRef={chatEndRef} compact />
            </div>
          </div>

          {pinned && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DURATION.normal, ease: EASE_EMPHASIZED }}>
              <ProductRow product={pinned} pinned onAdd={addToCart} />
            </motion.div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex h-11 flex-1 items-center rounded-full bg-black/50 pl-4 pr-1 backdrop-blur-md ring-1 ring-white/15">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Say something…"
                aria-label="Chat message"
                className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              <button onClick={sendMessage} aria-label="Send" className="flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10">
                <Send className="size-4" />
              </button>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} transition={springSnappy} onClick={sendLike} aria-label="Like" className="flex size-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md ring-1 ring-white/15">
              <Heart className="size-5" />
            </motion.button>
            <button onClick={() => toast.success('Gift sent')} aria-label="Send gift" className="flex size-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md ring-1 ring-white/15">
              <Gift className="size-5" />
            </button>
            <button onClick={share} aria-label="Share" className="flex size-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md ring-1 ring-white/15">
              <Share2 className="size-5" />
            </button>
            <button
              onClick={() => setSheet('shop')}
              aria-label="Shop this stream"
              className="relative flex size-11 items-center justify-center rounded-full bg-accent-brand text-accent-brand-foreground shadow-orange"
            >
              <ShoppingBag className="size-5" />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-accent-brand">
                {products.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop rail */}
      <aside className="hidden w-[360px] shrink-0 flex-col border-l border-white/10 bg-black lg:flex">
        <div className="border-b border-white/10 p-4">
          <h1 className="font-display text-base font-semibold leading-snug">{HOST.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
            <span className="inline-flex items-center gap-1 tabular-nums"><Heart className="size-3.5" /> {likes.toLocaleString()}</span>
            <span className="inline-flex items-center gap-1 tabular-nums"><Users className="size-3.5" /> {viewers.toLocaleString()} watching</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-white/5 p-1" role="tablist">
            {(['chat', 'shop'] as const).map(t => (
              <button
                key={t}
                role="tab"
                aria-selected={rail === t}
                onClick={() => setRail(t)}
                className={`h-9 rounded-lg text-sm font-medium capitalize transition-colors ${rail === t ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
              >
                {t === 'shop' ? `Shop (${products.length})` : 'Chat'}
              </button>
            ))}
          </div>
        </div>

        {rail === 'chat' ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <ChatList messages={chat} endRef={chatEndRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 p-3">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Say something…"
                aria-label="Chat message"
                className="h-11 min-w-0 flex-1 rounded-full bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="icon" variant="secondary" onClick={sendMessage} aria-label="Send" className="rounded-full bg-white/10 text-white hover:bg-white/20">
                <Send className="size-4" />
              </Button>
              <motion.button whileTap={{ scale: 0.9 }} transition={springSnappy} onClick={sendLike} aria-label="Like" className="flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Heart className="size-5" />
              </motion.button>
              <button onClick={share} aria-label="Share" className="flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Share2 className="size-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
            {products.map((p, i) => (
              <ProductRow key={p.id} product={p} pinned={i === 0} onAdd={addToCart} />
            ))}
          </div>
        )}
      </aside>

      {/* Mobile shop sheet */}
      <AnimatePresence>
        {sheet === 'shop' && (
          <>
            <motion.button
              aria-label="Close shop"
              className="absolute inset-0 z-30 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheet('none')}
            />
            <motion.div
              role="dialog"
              aria-label="Shop this stream"
              className="absolute inset-x-0 bottom-0 z-40 max-h-[75dvh] overflow-hidden rounded-t-sheet bg-background text-foreground lg:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: DURATION.normal, ease: EASE_EMPHASIZED }}
            >
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border-strong" />
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <h2 className="font-display text-lg font-semibold">Shop this stream</h2>
                <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={() => setSheet('none')}>
                  <X className="size-5" />
                </Button>
              </div>
              <div className="max-h-[calc(75dvh-5rem)] space-y-2 overflow-y-auto px-4 pb-[calc(var(--safe-bottom)+1rem)]">
                {products.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-card border border-border bg-card p-2.5">
                    <Link to={`/product/${p.id}`} className="size-16 shrink-0 overflow-hidden rounded-xl">
                      <ImageWithFallback src={p.image} alt={p.name} loading="lazy" className="size-full object-cover" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      {i === 0 && <span className="text-[11px] font-semibold text-accent-brand">Pinned</span>}
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <span className="font-display text-base font-bold tabular-nums">{money(p.price)}</span>
                    </div>
                    <Button size="sm" variant="accent" onClick={() => addToCart(p)}>Buy</Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
