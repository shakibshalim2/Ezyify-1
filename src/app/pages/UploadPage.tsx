import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, Video, Tag, MapPin, Globe, Users, Lock, Edit3,
  CheckCircle2, X, Camera, Sparkles, Hash, Smile,
  Clock, Save, UserPlus, Share2, TrendingUp, ShoppingBag,
  Search, ChevronRight, Zap, Store, Star, ArrowRight, ArrowLeft,
  ChevronDown, ChevronUp, ImageIcon, Trophy, Home, Plus,
  RefreshCw, Link2, ShoppingCart, Music, Mic, WifiOff,
  AlertCircle, RotateCcw, Eye, Bell, ExternalLink,
  Radio, Repeat2, Layers,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { UploadProgress, ProcessingState } from '../components/LoadingStates';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { MediaEditor, type EditedMediaData } from '../components/creator/MediaEditor';
import { SEO, SEOConfigs } from '../components/SEO';

// ─── Constants ─────────────────────────────────────────────────────────────────

const CAPTION_MAX = 2200;

const MOCK_PRODUCTS = [
  { id: '1', name: 'Wireless Headphones', price: 45.00, originalPrice: 79.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', store: 'TechStore', storeSlug: 'techstore' },
  { id: '2', name: 'Smart Watch',         price: 89.00, originalPrice: 149.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', store: 'TechStore', storeSlug: 'techstore' },
  { id: '3', name: 'Phone Case',          price: 8.90,  originalPrice: null,   image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200&h=200&fit=crop', store: 'Accessories', storeSlug: 'accessories' },
  { id: '4', name: 'Laptop Stand',        price: 23.40, originalPrice: 39.99,  image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop', store: 'WorkSpace', storeSlug: 'workspace' },
  { id: '5', name: 'Leather Backpack',    price: 89.99, originalPrice: 149.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop', store: 'Fashion Hub', storeSlug: 'fashionhub' },
  { id: '6', name: 'Water Bottle',        price: 6.70,  originalPrice: null,   image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop', store: 'Sports', storeSlug: 'sports' },
];

const EMOJI_LIST = [
  '😊','😍','🔥','✨','💫','🎉','❤️','💕','🙌','👏',
  '😂','🤩','💯','🌟','🎯','👀','💪','🚀','🌈','🎊',
  '😎','🤗','💝','🌸','🍀','🎵','📸','🎬','🛍️','💎',
];

const CATEGORIES = [
  { id: 'personal',    label: 'Personal',    emoji: '👤' },
  { id: 'fashion',     label: 'Fashion',     emoji: '👗' },
  { id: 'beauty',      label: 'Beauty',      emoji: '💄' },
  { id: 'food',        label: 'Food',        emoji: '🍽️' },
  { id: 'electronics', label: 'Electronics', emoji: '📱' },
  { id: 'travel',      label: 'Travel',      emoji: '✈️' },
  { id: 'fitness',     label: 'Fitness',     emoji: '💪' },
  { id: 'education',   label: 'Education',   emoji: '📚' },
  { id: 'realestate',  label: 'Real Estate', emoji: '🏠' },
  { id: 'grocery',     label: 'Grocery',     emoji: '🛒' },
  { id: 'other',       label: 'Other',       emoji: '✨' },
];

const LIVE_CATEGORY_IDS = ['personal', 'fashion', 'beauty', 'food', 'electronics', 'fitness', 'travel', 'education', 'other'];

const QUICK_LOCATIONS = [
  'New York', 'London', 'Dubai', 'Tokyo', 'Paris', 'Los Angeles',
  'Sydney', 'Singapore', 'Toronto', 'Miami', 'Berlin', 'Barcelona',
];

const HASHTAGS: Record<string, string[]> = {
  photo:       ['#photography', '#instagood', '#photooftheday', '#beautiful', '#style', '#art'],
  loop:        ['#loop', '#shortsvideo', '#fyp', '#viral', '#trending', '#reels'],
  story:       ['#story', '#dailylife', '#lifestyle', '#moments', '#memories', '#vibes'],
  live:        ['#live', '#livestream', '#goeazy', '#liveshow', '#watchlive', '#liveshopping'],
  personal:    ['#lifestyle', '#dailylife', '#mood', '#vibes', '#moments'],
  fashion:     ['#fashion', '#ootd', '#style', '#outfit', '#fashionista'],
  beauty:      ['#beauty', '#skincare', '#makeup', '#glowup', '#selfcare'],
  food:        ['#foodie', '#food', '#yummy', '#delicious', '#foodphotography'],
  electronics: ['#tech', '#gadgets', '#technology', '#innovation', '#techreview'],
  travel:      ['#travel', '#wanderlust', '#adventure', '#explore', '#travelphotography'],
  fitness:     ['#fitness', '#workout', '#gym', '#healthy', '#fitlife'],
  education:   ['#education', '#learning', '#knowledge', '#tips', '#howto'],
  realestate:  ['#realestate', '#property', '#home', '#investment', '#dreamhome'],
  grocery:     ['#grocery', '#shopping', '#deals', '#fresh', '#organic'],
  other:       ['#trending', '#viral', '#explore', '#content', '#share'],
};

// AI caption pools per template style × category
const AI_CAPTION_POOLS: Record<string, Record<string, string[]>> = {
  viral: {
    personal:    [`🚨 Stop scrolling. This one actually matters. What's one thing you do every day that makes you feel alive? Drop it below 👇`, `Nobody talks about this but real happiness is in the mundane. Here's my proof 👇 What's yours?`],
    fashion:     [`They said this wouldn't work. Wore it anyway. Now they're asking where I got it 🔥 Details in bio`, `The outfit that made three strangers compliment me in one day. Here's the breakdown 👇`],
    beauty:      [`I've tried 47 products for this. This is the ONLY one that actually delivered. Saving you the research 🙏`, `POV: you finally found the one product that changed everything. Tag someone who needs this!`],
    food:        [`Made this at 11PM on a Tuesday and it was the best decision of my life. Recipe thread 🧵👇`, `Chef's secret: it's not the ingredients. It's THIS one technique. Watch to the end 🔥`],
    electronics: [`This gadget has been sitting in my cart for 3 months. Finally bought it. Here's my honest review after 7 days 🔥`, `The tech everyone is sleeping on in 2025. This is your sign to get it before the price goes up 📈`],
    travel:      [`I almost didn't book this trip. Best mistake I never made. 📍 Drop a ❤️ if you've been here`, `No tourist traps. No influencer spots. Just this. 🌍 Real travel hits different`],
    fitness:     [`30 days ago I couldn't do 5. Today I did 30. If you're a beginner — READ THIS 💪`, `The workout nobody is talking about that completely changed my physique in 8 weeks`],
    other:       [`I wasn't going to post this. Then I thought — someone needs to see this today 🌟`, `Stop what you're doing. Watch this. Thank me later 🔥`],
  },
  professional: {
    personal:    [`Proud to share this milestone. Every journey begins with a single step — here's mine. 💼`, `Reflecting on the process that got me here. Growth isn't linear, but it's always worth it.`],
    fashion:     [`Curating a wardrobe that reflects professional excellence. Every piece tells a story of intentional style.`, `Style note: investment pieces that transcend seasons. Quality over quantity, always.`],
    beauty:      [`Evidence-based skincare. This formulation has delivered measurable results over 12 weeks. Breakdown in the caption.`, `Professional skin care doesn't have to be complicated. Here's my distilled routine.`],
    food:        [`Recipe development update: after 12 test batches, this version is now production-ready. Notes below.`, `Culinary fundamentals that make the difference between good and exceptional. Technique matters.`],
    electronics: [`Full review after 30 days of daily use. Performance metrics, build quality, and value assessment below.`, `Technology assessment: what the specs don't tell you. Practical performance review inside.`],
    travel:      [`A curated guide to the locations that consistently deliver on their promise. No paid placements.`, `Travel done right: research, timing, and the right expectations. Here's the framework.`],
    fitness:     [`Training methodology update. 12-week data reviewed. Key performance indicators and adjustments noted.`, `Evidence-based training principles that survive the test of time. No gimmicks, no shortcuts.`],
    other:       [`Sharing this because the data speaks for itself. Full breakdown in the caption.`, `This work represents months of refinement. Here's what the process looked like.`],
  },
  promotional: {
    personal:    [`🎁 Something special is coming. Follow to be the first to know — you won't want to miss this.`, `💥 Limited availability. Once it's gone, it's gone. Tap the link in bio before it sells out!`],
    fashion:     [`🛍️ Shop this exact look — all links in bio! Use code STYLE15 for 15% off today only.`, `💥 Flash deal on this entire outfit. 24 hours only. Tap bio link to shop — already 200+ sold this week!`],
    beauty:      [`✨ This product is selling out FAST — grab yours before it's gone! Link in bio 🔗`, `🎊 HUGE sale — up to 40% off my entire routine. These prices won't last. Bio link!`],
    food:        [`🍽️ Order this exact meal from our menu — link in bio! Free delivery this weekend only.`, `🔥 Limited batch available. Pre-order closes in 48h. Link in bio — we sold out last time in 6 hours!`],
    electronics: [`⚡ Flash deal: 25% off this exact setup today only. Link in bio — affiliate code TECH25.`, `📦 Just restocked. Previous batch sold out in 72 hours. Grab yours now — link in bio!`],
    travel:      [`✈️ Package deal LIVE: flights + hotel, this destination, limited seats. Book via bio link!`, `🌍 Exclusive rate for followers only — 30% off bookings made this week. Link in bio!`],
    fitness:     [`💪 My full program is NOW LIVE. First 50 sign-ups get a bonus session included. Link in bio!`, `🔥 Equipment I use daily — 20% off with my code. Bio link for the full kit.`],
    other:       [`🚀 Launching now — limited founding offer for the first 100 people. Don't miss this. Bio link!`, `💎 Exclusive drop — only available for followers. Link in bio, ends tonight at midnight.`],
  },
  casual: {
    personal:    [`honestly? best day I've had in a while 😌✨ who else needed this vibe today?`, `not me crying at a random Tuesday 😂 anyways drop a ❤️ if you feel this`],
    fashion:     [`okay but this outfit was NOT planned and it turned out to be my fave 😭✨ details below babes`, `me: I have enough clothes. also me: 👀 anyway here's today's look haha`],
    beauty:      [`I don't do full glam often but when I do 💄✨ this look took me 20 minutes btw`, `okay I've been sleeping on this product and now I'm obsessed 😭 you need this`],
    food:        [`accidentally made the best thing I've ever eaten and I'm still thinking about it 😍🍽️`, `5 ingredients, 20 minutes, zero regrets 😂 someone make this with me`],
    electronics: [`I was NOT expecting to like this so much lmao 😭 full thoughts below`, `okay okay okay this thing is actually insane 🤯 don't @ me I'm obsessed`],
    travel:      [`I came, I saw, I never wanted to leave 😭✈️ drop a 📍 if you've been here!`, `the universe said 'go' and I said 'ok' 🌍 best decision of my whole entire life`],
    fitness:     [`day ___ of pretending I know what I'm doing 😂💪 nah but actually getting there`, `the only therapy I need is this 😌🏋️ who else uses the gym as free therapy lol`],
    other:       [`no notes, no captions, just vibes ✨😊`, `sometimes you just have to post it and let the algorithm decide 🤷 drop a ❤️`],
  },
  storytelling: {
    personal:    [`A year ago I was in a completely different place. Not better, not worse — just different. Here's what changed 👇`, `I almost gave up on this three separate times. What kept me going was one conversation I'll never forget.`],
    fashion:     [`This piece has a story. I found it at a tiny market on a rainy afternoon when I was feeling lost. It became my lucky charm.`, `My grandmother taught me that clothes carry memory. This outfit was hers first. Wearing it is my way of keeping her close.`],
    beauty:      [`My skin journey started at 16, when I finally stopped listening to what beauty ads were telling me I needed to fix.`, `I used to spend 2 hours getting ready. Now it's 15 minutes. This is the story of how I found what actually works.`],
    food:        [`This recipe was passed down through three generations without ever being written down. I'm writing it down now so we never lose it.`, `The first time I cooked this, I was 8. Standing on a step stool. My mom guiding my hands. Twenty years later, it tastes exactly the same.`],
    electronics: [`Six months ago my setup was a laptop on a kitchen table. I built this slowly. Here's the story of every piece.`, `I'm not a tech person. I'm a person who finally found the right tools. Here's what changed everything.`],
    travel:      [`I booked this trip with 72 hours notice, a half-packed bag, and no plan. What happened next I couldn't have scripted.`, `Some places change you. Not with anything dramatic — just quietly, slowly, over three days. This was one of those places.`],
    fitness:     [`I used to be the person in the back row, praying no one would look at me. Now I walk in like I own the place. Here's the full story.`, `The moment I stopped working out to look different and started working out to feel different — everything shifted.`],
    other:       [`I've been sitting on this for weeks, not sure if I should share it. Then I realized: someone out there needs to hear this.`, `Every great thing in my life started as a small, uncertain decision. This was one of those decisions.`],
  },
};

function getAiCaption(template: string, category: string): string {
  const pool = AI_CAPTION_POOLS[template]?.[category] ?? AI_CAPTION_POOLS[template]?.other ?? AI_CAPTION_POOLS.casual.other;
  return pool[Math.floor(Math.random() * pool.length)];
}

const AI_TEMPLATES = [
  { id: 'viral',        label: 'Viral Hook',   desc: 'Stops the scroll',     emoji: '🔥', color: 'from-orange-500 to-red-500' },
  { id: 'professional', label: 'Professional', desc: 'Brand authority',       emoji: '💼', color: 'from-slate-600 to-slate-800' },
  { id: 'promotional',  label: 'Promotional',  desc: 'Drive sales & clicks',  emoji: '🛍️', color: 'from-primary to-purple-600' },
  { id: 'casual',       label: 'Casual',       desc: 'Relatable & fun',       emoji: '😊', color: 'from-pink-500 to-rose-400' },
  { id: 'storytelling', label: 'Storytelling', desc: 'Deep connection',       emoji: '📖', color: 'from-teal-500 to-cyan-500' },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type ContentType = 'photo' | 'loop' | 'story' | 'live';
type CreateAs = 'personal' | 'store';
type AudienceType = 'public' | 'followers' | 'close-friends' | 'store-followers' | 'selected';
type PublishMode = 'now' | 'schedule' | 'draft';
type UploadStateType = 'idle' | 'uploading' | 'processing' | 'success' | 'error';
type Step = 1 | 2 | 3 | 4;

const CONTENT_TYPES: {
  type: ContentType; label: string; icon: React.ReactNode; tagline: string;
  bestFor: string; accept: string; gradient: string; lightBg: string; ratio: string;
  isLiveType?: boolean;
}[] = [
  {
    type: 'photo', label: 'Photo', tagline: 'Share a moment',
    bestFor: 'Products, portraits, outfits, lifestyle',
    icon: <Camera className="w-6 h-6" />,
    accept: 'image/*', gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-500/8 border-blue-500/20', ratio: 'Square · 4:5 · 1:1',
  },
  {
    type: 'loop', label: 'Loop', tagline: 'Short video',
    bestFor: 'Trends, quick tips, behind-the-scenes',
    icon: <Repeat2 className="w-6 h-6" />,
    accept: 'video/*', gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-500/8 border-violet-500/20', ratio: '9:16 vertical',
  },
  {
    type: 'story', label: 'Story', tagline: 'Disappears in 24h',
    bestFor: 'Daily updates, polls, exclusive drops',
    icon: <Layers className="w-6 h-6" />,
    accept: 'image/*,video/*', gradient: 'from-pink-500 to-rose-500',
    lightBg: 'bg-pink-500/8 border-pink-500/20', ratio: '9:16 full screen',
  },
  {
    type: 'live', label: 'Live', tagline: 'Broadcast now',
    bestFor: 'Product launches, Q&A, live shopping',
    icon: <Radio className="w-6 h-6" />,
    accept: '', gradient: 'from-red-500 to-rose-600',
    lightBg: 'bg-red-500/8 border-red-500/20', ratio: 'Real-time stream',
    isLiveType: true,
  },
];

const AUDIENCE_OPTIONS: {
  value: AudienceType; label: string; desc: string; icon: React.ReactNode; storeOnly?: boolean;
}[] = [
  { value: 'public',          label: 'Public',          desc: 'Everyone can see this post',    icon: <Globe className="w-4 h-4" /> },
  { value: 'followers',       label: 'Followers',       desc: 'Only your followers',            icon: <Users className="w-4 h-4" /> },
  { value: 'close-friends',   label: 'Close Friends',   desc: 'Your close friends list',        icon: <Star className="w-4 h-4" /> },
  { value: 'store-followers', label: 'Store Followers', desc: 'Followers of your store',        icon: <Store className="w-4 h-4" />, storeOnly: true },
  { value: 'selected',        label: 'Selected Only',   desc: 'Choose specific people',         icon: <Lock className="w-4 h-4" /> },
];

const STEP_META: Record<Step, { label: string; hint: string }> = {
  1: { label: 'Format',  hint: 'Choose what to create' },
  2: { label: 'Upload',  hint: 'Add your photo or video' },
  3: { label: 'Details', hint: 'Caption, products & location' },
  4: { label: 'Publish', hint: 'Audience & publish settings' },
};

const STEP_META_LIVE: Record<Step, { label: string; hint: string }> = {
  1: { label: 'Format',   hint: 'Choose what to create' },
  2: { label: 'Setup',    hint: 'Configure your broadcast' },
  3: { label: 'Audience', hint: 'Who can watch your live' },
  4: { label: 'Go Live',  hint: 'Start your broadcast' },
};

const TRENDING_SOUNDS = [
  { id: 't1',   name: 'Trending Beat #1', artist: 'Various Artists', duration: '0:15' },
  { id: 't2',   name: 'Viral Audio 2025', artist: 'Remix Pack',       duration: '0:30' },
  { id: 't3',   name: 'Lo-fi Chill',      artist: 'Ambient Lab',      duration: '1:00' },
  { id: 'orig', name: 'Original Audio',   artist: 'My Recording',     duration: '–' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function discountPct(price: number, orig: number | null) {
  if (!orig) return null;
  const d = Math.round((1 - price / orig) * 100);
  return d >= 5 ? d : null;
}

function fmt(price: number) {
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function CharacterArc({ value, max }: { value: number; max: number }) {
  const pct = Math.min(value / max, 1);
  const r = 13;
  const circ = 2 * Math.PI * r;
  const fill = circ * pct;
  const color = pct > 0.9 ? 'var(--color-error,#ef4444)' : pct > 0.75 ? 'var(--color-warning,#f59e0b)' : 'var(--color-primary,#6366f1)';
  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0" title={`${max - value} characters remaining`}>
      <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90 absolute inset-0" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-border/40" />
        <circle
          cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.15s ease, stroke 0.15s ease' }}
        />
      </svg>
      <span className="relative z-10 text-[9px] font-bold tabular-nums leading-none" style={{ color }}>
        {pct > 0.75 ? (max - value) : ''}
      </span>
    </div>
  );
}

function StepBar({ step, setStep, canGoTo, meta }: {
  step: Step; setStep: (s: Step) => void; canGoTo: (s: Step) => boolean;
  meta: Record<Step, { label: string; hint: string }>;
}) {
  const pct = ((step - 1) / 3) * 100;
  return (
    <div className="w-full select-none" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
      <div className="relative h-1 bg-border/25 rounded-full overflow-hidden mb-3">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: 'var(--brand-gradient)' }}
        />
      </div>
      <div className="flex justify-between">
        {([1, 2, 3, 4] as Step[]).map(n => {
          const done = step > n;
          const current = step === n;
          const clickable = done && canGoTo(n);
          return (
            <button
              key={n} type="button"
              onClick={() => clickable && setStep(n)}
              disabled={!clickable && !current}
              aria-label={`Step ${n}: ${meta[n].label}${done ? ' — completed' : current ? ' — current' : ''}`}
              className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
              style={{ cursor: clickable ? 'pointer' : 'default' }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${
                done    ? 'bg-primary text-white' :
                current ? 'text-white shadow-lg scale-110' :
                          'bg-border/35 text-muted-foreground/35 scale-90'
              }`} style={current ? { background: 'var(--brand-gradient)' } : {}}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={`hidden sm:block text-[10px] font-medium leading-tight max-w-[56px] text-center transition-colors ${
                current ? 'text-primary' : done ? 'text-foreground/50' : 'text-muted-foreground/30'
              }`}>{meta[n].label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PostStrength({ hasMedia, caption, products, location }: {
  hasMedia: boolean; caption: string; products: string[]; location: string;
}) {
  const items = [
    { label: 'Media',    done: hasMedia,            pts: 40, tip: 'Add a photo or video' },
    { label: 'Caption',  done: caption.length > 15, pts: 30, tip: 'Write a caption (15+ chars)' },
    { label: 'Products', done: products.length > 0, pts: 20, tip: 'Tag at least one product' },
    { label: 'Location', done: location.length > 0, pts: 10, tip: 'Add your location' },
  ];
  const score = items.reduce((s, i) => s + (i.done ? i.pts : 0), 0);
  const level =
    score >= 90 ? { text: 'Excellent', colorCss: 'var(--color-success,#059669)', barClass: 'bg-[color:var(--color-success)]' } :
    score >= 60 ? { text: 'Good',      colorCss: 'var(--color-primary)',          barClass: 'bg-primary' } :
    score >= 30 ? { text: 'Fair',      colorCss: 'var(--color-warning,#d97706)',  barClass: 'bg-[color:var(--color-warning)]' } :
                  { text: 'Weak',      colorCss: 'var(--color-error,#dc2626)',    barClass: 'bg-[color:var(--color-error)]' };
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-muted-foreground/60" aria-hidden />
          <span className="text-[12px] font-semibold text-foreground">Post Strength</span>
        </div>
        <span className="text-[12px] font-bold" style={{ color: level.colorCss }}>{level.text} · {score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-border/30 overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all duration-700 ${level.barClass}`} style={{ width: `${score}%` }} />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {items.map(i => (
          <div key={i.label} title={i.done ? `✓ ${i.label}` : i.tip}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
              i.done ? 'bg-primary/8 border-primary/20 text-primary' : 'bg-muted/25 border-border/35 text-muted-foreground/45'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${i.done ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
            {i.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShoppableStrip({ products, onProductClick }: {
  products: typeof MOCK_PRODUCTS; onProductClick: (id: string) => void;
}) {
  if (!products.length) return null;
  return (
    <div className="px-3.5 py-3 border-t border-border/40">
      <div className="flex items-center gap-1.5 mb-2.5">
        <ShoppingCart className="w-3 h-3 text-primary" aria-hidden />
        <span className="text-[10px] font-semibold text-primary">Shoppable Post</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {products.map(p => {
          const disc = discountPct(p.price, p.originalPrice);
          return (
            <button key={p.id} type="button" onClick={() => onProductClick(p.id)}
              className="flex-shrink-0 w-28 rounded-xl border border-border/55 bg-background overflow-hidden text-left hover:border-primary/40 transition-all active:scale-[0.97]"
            >
              <div className="aspect-square overflow-hidden relative">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                {disc && (
                  <span className="absolute top-1 left-1 bg-[color:var(--color-error)] text-white px-1.5 py-0.5 rounded text-[8px] font-bold">-{disc}%</span>
                )}
              </div>
              <div className="p-1.5">
                <p className="text-[10px] font-medium text-foreground leading-tight line-clamp-1 mb-1">{p.name}</p>
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-[10px] font-bold text-primary">{fmt(p.price)}</span>
                  {p.originalPrice && (
                    <span className="text-[9px] text-muted-foreground/45 line-through">{fmt(p.originalPrice)}</span>
                  )}
                </div>
                <div
                  className="w-full text-center text-[9px] font-bold text-white rounded-lg py-1"
                  style={{ background: 'var(--brand-gradient)' }}
                >
                  Buy Now
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CollaboratorModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const submit = () => {
    if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email address'); return; }
    setSent(true);
    setTimeout(() => { toast.success(`Invite sent to ${email}`); onClose(); }, 600);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal aria-label="Add collaborator">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" aria-hidden />
            <h3 className="text-[14px] font-bold text-foreground">Add Collaborator</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-11 h-11 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Invite a creator or team member to collaborate on this post. They'll be tagged as a co-creator.
          </p>
          <div>
            <Label htmlFor="collab-email" className="text-[12px] font-medium">Email or @username</Label>
            <Input
              id="collab-email"
              placeholder="name@example.com or @username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              className="mt-1.5 text-sm"
              autoFocus
              disabled={sent}
            />
          </div>
          <div className="flex gap-2.5">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 text-sm">Cancel</Button>
            <button
              type="button" onClick={submit} disabled={sent}
              className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-white disabled:opacity-60 transition-all active:scale-[0.97]"
              style={{ background: 'var(--brand-gradient)' }}
            >
              {sent ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfflineBanner() {
  return (
    <div className="fixed lg:!top-16 left-0 right-0 z-40 bg-[color:var(--color-warning)] text-white px-4 py-2.5 flex items-center justify-center gap-2 animate-slide-down" role="alert" style={{ top: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
      <WifiOff className="w-4 h-4 shrink-0" />
      <span className="text-[12px] font-semibold">No internet connection — changes will be saved locally</span>
    </div>
  );
}

function SuccessScreen({ publishMode, scheduleDate, navigate, resetAll, postId }: {
  publishMode: PublishMode; scheduleDate: string; postId: string;
  navigate: ReturnType<typeof useNavigate>; resetAll: () => void;
}) {
  const isScheduled = publishMode === 'schedule';
  const isDraft     = publishMode === 'draft';
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Check out my post on EZYIFY!', url: `${window.location.origin}/post/${postId}` }).catch(() => {});
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6 animate-scale-in">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full opacity-20 animate-ping" style={{ background: 'var(--brand-gradient)' }} />
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl" style={{ background: 'var(--brand-gradient)' }}>
            <CheckCircle2 className="w-11 h-11 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isDraft ? 'Draft Saved!' : isScheduled ? 'Post Scheduled!' : '🎉 Post Published!'}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isDraft
              ? 'Your draft has been saved. Come back anytime to finish and publish.'
              : isScheduled
              ? `Your post will go live on ${scheduleDate ? new Date(scheduleDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'the scheduled time'}.`
              : 'Your content is now live — share it to maximize reach!'}
          </p>
        </div>
        {!isDraft && (
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Reach', value: isScheduled ? '—' : '0', icon: '👁️' },
              { label: 'Views', value: isScheduled ? '—' : '0', icon: '📊' },
              { label: 'Likes', value: '0',                      icon: '❤️' },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                <span className="text-xl">{s.icon}</span>
                <p className="text-lg font-bold text-foreground mt-1">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2.5">
          {!isDraft && !isScheduled && (
            <div className="flex gap-2">
              <button onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border bg-card text-[12px] font-semibold text-foreground hover:bg-muted/40 transition-all"
              >
                <Link2 className="w-3.5 h-3.5" />{copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border bg-card text-[12px] font-semibold text-foreground hover:bg-muted/40 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />Share
              </button>
            </div>
          )}
          {!isDraft && (
            <button onClick={() => navigate(`/post/${postId}`)}
              className="w-full h-11 rounded-xl border border-primary/25 bg-primary/8 text-[13px] font-semibold text-primary flex items-center justify-center gap-2 hover:bg-primary/12 transition-all"
            >
              <Eye className="w-4 h-4" />View Post
            </button>
          )}
          <button onClick={() => navigate('/')}
            className="w-full h-12 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <Home className="w-4 h-4" />Back to Feed
          </button>
          <button onClick={resetAll}
            className="w-full h-11 rounded-xl text-[13px] font-semibold text-foreground flex items-center justify-center gap-2 border border-border hover:bg-muted/40 transition-all"
          >
            <Plus className="w-4 h-4" />Create Another Post
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadErrorScreen({ filename, onRetry, onDiscard }: {
  filename?: string; onRetry: () => void; onDiscard: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-[color:var(--color-error)]/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-[color:var(--color-error)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Upload Failed</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {filename
              ? `We couldn't upload "${filename}". Please check your connection and try again.`
              : 'Something went wrong during upload. Please try again.'}
          </p>
        </div>
        <div className="space-y-2.5">
          <button onClick={onRetry}
            className="w-full h-12 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <RotateCcw className="w-4 h-4" />Try Again
          </button>
          <button onClick={onDiscard}
            className="w-full h-11 rounded-xl text-[13px] font-semibold text-muted-foreground border border-border hover:bg-muted/40 flex items-center justify-center gap-2 transition-all"
          >
            <X className="w-4 h-4" />Discard &amp; Start Over
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function UploadPage() {
  const navigate = useNavigate();

  // Core
  const [step, setStep]               = useState<Step>(1);
  const [createAs, setCreateAs]       = useState<CreateAs>('personal');
  const [contentType, setContentType] = useState<ContentType>('photo');
  const [category, setCategory]       = useState('personal');

  // Media
  const [uploadState, setUploadState]       = useState<UploadStateType>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile]     = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]         = useState('');
  const [isEditing, setIsEditing]           = useState(false);
  const [editedData, setEditedData]         = useState<EditedMediaData | null>(null);
  const [isDragOver, setIsDragOver]         = useState(false);
  const [fileInfo, setFileInfo]             = useState<{ name: string; size: string } | null>(null);

  // Caption
  const [caption, setCaption]                       = useState('');
  const [location, setLocation]                     = useState('');
  const [showHashtags, setShowHashtags]             = useState(false);
  const [showEmoji, setShowEmoji]                   = useState(false);
  const [showAiPanel, setShowAiPanel]               = useState(false);
  const [aiLoading, setAiLoading]                   = useState(false);
  const [aiTemplate, setAiTemplate]                 = useState<string | null>(null);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);

  // Products
  const [taggedProducts, setTaggedProducts]   = useState<string[]>([]);
  const [productSearch, setProductSearch]     = useState('');
  const [showProductGrid, setShowProductGrid] = useState(false);

  // Content-type specific
  const [storyHighlight, setStoryHighlight]   = useState(false);
  const [storyAutoDelete, setStoryAutoDelete] = useState(true);
  const [selectedSound, setSelectedSound]     = useState<string | null>(null);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  // Live
  const [liveTitle, setLiveTitle]               = useState('');
  const [liveCategory, setLiveCategory]         = useState('personal');
  const [liveScheduled, setLiveScheduled]       = useState(false);
  const [liveScheduleDate, setLiveScheduleDate] = useState('');

  // Publish
  const [audience, setAudience]                 = useState<AudienceType>('public');
  const [publishMode, setPublishMode]           = useState<PublishMode>('now');
  const [scheduleDate, setScheduleDate]         = useState('');
  const [allowComments, setAllowComments]       = useState(true);
  const [allowSharing, setAllowSharing]         = useState(true);
  const [trackPerformance, setTrackPerformance] = useState(false);
  const [promoteLater, setPromoteLater]         = useState(false);
  const [enableShopping, setEnableShopping]     = useState(false);
  const [crossPost, setCrossPost]               = useState(false);

  // UX
  const [hasUnsaved, setHasUnsaved]           = useState(false);
  const [stepErrors, setStepErrors]           = useState<Partial<Record<Step, string>>>({});
  const [isOnline, setIsOnline]               = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [publishedPostId, setPublishedPostId] = useState('');

  const captionRef         = useRef<HTMLTextAreaElement>(null);
  const fileRef            = useRef<HTMLInputElement>(null);
  const contentRef         = useRef<HTMLDivElement>(null);
  const saveDraftSilentRef = useRef<() => void>(() => {});

  // Derived
  const isStore        = createAs === 'store';
  const isVideoType    = contentType === 'loop';
  const isLoop         = contentType === 'loop';
  const isStory        = contentType === 'story';
  const isLive         = contentType === 'live';
  const activeStepMeta = isLive ? STEP_META_LIVE : STEP_META;
  const currentCT      = CONTENT_TYPES.find(c => c.type === contentType)!;
  const selectedProducts = MOCK_PRODUCTS.filter(p => taggedProducts.includes(p.id));
  const filteredProducts = MOCK_PRODUCTS.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );
  const hashtagPool = [...new Set([
    ...(HASHTAGS[category] ?? []),
    ...(HASHTAGS[contentType] ?? []),
  ])].slice(0, 12);

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ezyify_post_draft');
      if (!raw) return;
      const d = JSON.parse(raw);
      if (Date.now() - d.timestamp < 86400000) {
        if (d.caption)        setCaption(d.caption);
        if (d.location)       setLocation(d.location);
        if (d.taggedProducts) setTaggedProducts(d.taggedProducts);
        if (d.caption || d.location)
          toast('Draft restored', { description: 'Your previous session was loaded.' });
      }
    } catch {}
  }, []);

  useEffect(() => {
    const goOnline  = () => { setIsOnline(true);  toast.success('Back online!'); };
    const goOffline = () => { setIsOnline(false); saveDraftSilentRef.current(); };
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (hasUnsaved) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [hasUnsaved]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (step === 4) handlePublish();
        else goNext();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // ── File handling ────────────────────────────────────────────────────────────

  const clearFileInput = () => { if (fileRef.current) fileRef.current.value = ''; };

  const processFile = useCallback((file: File) => {
    clearFileInput();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setHasUnsaved(true);
    setFileInfo({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
    setStepErrors(e => ({ ...e, 2: undefined }));
    setTimeout(() => setStep(3), 150);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const removeFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null); setPreviewUrl(''); setEditedData(null); setFileInfo(null);
    clearFileInput();
  };

  // ── Caption helpers ──────────────────────────────────────────────────────────

  const insertEmoji = (emoji: string) => {
    const ta = captionRef.current;
    if (!ta) { setCaption(c => c + emoji); return; }
    const s = ta.selectionStart ?? caption.length;
    setCaption(caption.slice(0, s) + emoji + caption.slice(s));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + emoji.length, s + emoji.length); }, 0);
    setHasUnsaved(true);
  };

  const addHashtag = (tag: string) => {
    setCaption(c => (c.endsWith(' ') || c === '' ? c : c + ' ') + tag + ' ');
    setHasUnsaved(true);
  };

  const handleGenerateCaption = (templateId: string) => {
    setAiTemplate(templateId);
    setAiLoading(true);
    setShowAiPanel(false);
    setTimeout(() => {
      const text = getAiCaption(templateId, category);
      setCaption(text);
      setAiLoading(false);
      setHasUnsaved(true);
      toast.success(`${AI_TEMPLATES.find(t => t.id === templateId)?.label} caption generated!`);
    }, 1000);
  };

  // ── Draft ────────────────────────────────────────────────────────────────────

  const saveDraftSilent = () => {
    try {
      localStorage.setItem('ezyify_post_draft', JSON.stringify({
        caption, location, taggedProducts, timestamp: Date.now(),
      }));
    } catch {}
  };
  // Keep ref current so the stable offline listener always saves fresh state
  saveDraftSilentRef.current = saveDraftSilent;

  const saveDraft = () => {
    saveDraftSilent();
    toast.success('Draft saved');
    setHasUnsaved(false);
  };

  // ── Publish ──────────────────────────────────────────────────────────────────

  const handlePublish = () => {
    if (isLive) {
      if (!liveTitle.trim()) { toast.error('Please add a title for your broadcast'); setStep(2); return; }
      if (liveScheduled && !liveScheduleDate) { toast.error('Please set a schedule date'); return; }
      if (liveScheduled && new Date(liveScheduleDate) <= new Date()) { toast.error('Scheduled time must be in the future'); return; }
      if (!isOnline) { toast.error('No internet connection — cannot go live'); return; }
      navigate(`/live/live-${Date.now()}`);
      return;
    }
    if (!selectedFile && publishMode !== 'draft') {
      setStepErrors(e => ({ ...e, 2: 'Please upload media before publishing.' }));
      toast.error('Please add media first');
      setStep(2);
      return;
    }
    if (publishMode === 'schedule') {
      if (!scheduleDate) { toast.error('Please choose a schedule date and time'); return; }
      if (new Date(scheduleDate) <= new Date()) { toast.error('Scheduled time must be in the future'); return; }
    }
    if (publishMode === 'draft') { saveDraft(); setUploadState('success'); setPublishedPostId('draft'); return; }
    if (!isOnline) { toast.error('No internet connection — draft saved locally'); saveDraftSilent(); return; }

    const mockPostId = `post-${Date.now()}`;
    setPublishedPostId(mockPostId);
    setUploadState('uploading');
    setUploadProgress(0);
    setHasUnsaved(false);

    const iv = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + 8 + Math.random() * 4;
        if (next >= 100) {
          clearInterval(iv);
          setUploadState('processing');
          setTimeout(() => {
            localStorage.removeItem('ezyify_post_draft');
            setUploadState('success');
          }, 1600);
          return 100;
        }
        return next;
      });
    }, 140);
  };

  const retryUpload = () => { setUploadState('idle'); setUploadProgress(0); };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const goNext = () => {
    if (step === 2 && !isLive && !selectedFile) {
      setStepErrors(e => ({ ...e, 2: 'Please upload media before continuing.' }));
      toast.error('Please add your media first');
      return;
    }
    if (step === 2 && isLive && !liveTitle.trim()) {
      toast.error('Please add a title for your live broadcast');
      return;
    }
    setStepErrors(e => ({ ...e, [step]: undefined }));
    if (step < 4) setStep(s => (s + 1) as Step);
  };

  const goBack = () => { if (step > 1) setStep(s => (s - 1) as Step); };
  const canGoTo = (s: Step) => step > s;
  const setStepSafe = (s: Step) => { if (canGoTo(s)) setStep(s); };

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadState('idle'); setSelectedFile(null); setPreviewUrl('');
    setCaption(''); setTaggedProducts([]); setUploadProgress(0);
    setEditedData(null); setPublishMode('now'); setScheduleDate('');
    setFileInfo(null); setStep(1); setHasUnsaved(false); setLocation('');
    setStepErrors({}); setAiTemplate(null); setSelectedSound(null);
    setPublishedPostId(''); clearFileInput();
    setLiveTitle(''); setLiveCategory('personal'); setLiveScheduled(false); setLiveScheduleDate('');
  };

  // ── Terminal screens ─────────────────────────────────────────────────────────

  if (isEditing && previewUrl) {
    return (
      <MediaEditor
        mediaUrl={previewUrl}
        mediaType={isVideoType ? 'video' : 'image'}
        onDone={data => { setEditedData(data); setIsEditing(false); }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }
  if (uploadState === 'error') {
    return <UploadErrorScreen filename={selectedFile?.name} onRetry={retryUpload} onDiscard={resetAll} />;
  }
  if (uploadState === 'success') {
    return <SuccessScreen publishMode={publishMode} scheduleDate={scheduleDate} navigate={navigate} resetAll={resetAll} postId={publishedPostId} />;
  }
  if (uploadState === 'processing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full"><ProcessingState message="Processing your content…" /></div>
      </div>
    );
  }
  if (uploadState === 'uploading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full"><UploadProgress progress={Math.min(uploadProgress, 100)} filename={selectedFile?.name} /></div>
      </div>
    );
  }

  // ── Step 1 ───────────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-5">
      <p className="text-center text-sm text-muted-foreground">
        Pick a format and category — unlocks AI captions &amp; smart hashtags
      </p>
      <div className="grid grid-cols-2 gap-3">
        {CONTENT_TYPES.map(({ type, label, tagline, bestFor, ratio, icon, gradient, lightBg }) => {
          const selected = contentType === type;
          return (
            <button
              key={type} type="button"
              onClick={() => setContentType(type)}
              aria-pressed={selected}
              className={`relative flex flex-col text-left p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.97] overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                selected ? `border-primary ${lightBg}` : 'border-border/50 bg-card hover:border-border hover:bg-muted/20'
              }`}
            >
              {selected && <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${gradient}`} aria-hidden />}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 transition-all bg-gradient-to-br ${gradient} ${
                selected ? 'shadow-lg scale-105' : 'opacity-75 group-hover:opacity-100 group-hover:scale-105'
              }`} aria-hidden>{icon}</div>
              <p className={`font-bold text-[14px] leading-tight mb-0.5 ${selected ? 'text-primary' : 'text-foreground'}`}>{label}</p>
              <p className="text-[11px] text-muted-foreground mb-1.5 leading-tight">{tagline}</p>
              <p className={`text-[10px] ${selected ? 'text-primary/65' : 'text-muted-foreground/45'}`}>{bestFor}</p>
              <p className={`text-[9px] mt-1.5 font-medium uppercase tracking-wide ${selected ? 'text-primary/50' : 'text-muted-foreground/30'}`}>{ratio}</p>
              {selected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden />
          <p className="text-[12px] font-semibold text-foreground">What's this about?</p>
          <span className="ml-auto text-[10px] text-muted-foreground/50">Unlocks AI captions</span>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Content category">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id} type="button"
              onClick={() => setCategory(cat.id)}
              aria-pressed={category === cat.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all duration-150 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                category === cat.id
                  ? 'bg-primary/8 border-primary/25 text-primary shadow-sm'
                  : 'bg-muted/30 border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <span aria-hidden>{cat.emoji}</span>{cat.label}
            </button>
          ))}
        </div>
      </div>

      {isStore && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-primary/5 border border-primary/15">
          <Store className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden />
          <div>
            <p className="text-[12px] font-semibold text-foreground">Store Mode Active</p>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">Tag products, enable in-post shopping, and track sales analytics from this post.</p>
          </div>
        </div>
      )}
    </div>
  );

  // ── Live Setup (Step 2 for Live) ─────────────────────────────────────────────

  const renderLiveSetup = () => (
    <div className="space-y-4">
      {/* Camera preview stub */}
      <div className="relative aspect-[9/14] max-h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-700/50 flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
          <p className="text-sm font-medium text-zinc-500">Camera preview will appear here</p>
          <p className="text-xs text-zinc-600 mt-1">Your live will start when you tap Go Live</p>
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" aria-hidden />LIVE
        </div>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold border border-white/20">HD</span>
      </div>

      {/* Title */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="live-title" className="text-[13px] font-semibold">
              Broadcast Title <span className="text-[color:var(--color-error)]">*</span>
            </Label>
            <span className="text-[10px] text-muted-foreground/50">{liveTitle.length}/80</span>
          </div>
          <Input
            id="live-title"
            placeholder="What's your live about?"
            value={liveTitle}
            onChange={e => setLiveTitle(e.target.value.slice(0, 80))}
            className="text-sm"
            autoFocus
          />
          {!liveTitle.trim() && (
            <p className="mt-1.5 text-[11px] text-muted-foreground/60">Give your broadcast a catchy title so viewers know what to expect</p>
          )}
        </CardContent>
      </Card>

      {/* Category */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <p className="text-[13px] font-semibold text-foreground mb-3">Category</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Live category">
            {CATEGORIES.filter(c => LIVE_CATEGORY_IDS.includes(c.id)).map(cat => (
              <button
                key={cat.id} type="button"
                onClick={() => setLiveCategory(cat.id)}
                aria-pressed={liveCategory === cat.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all duration-150 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  liveCategory === cat.id
                    ? 'bg-primary/8 border-primary/25 text-primary shadow-sm'
                    : 'bg-muted/30 border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                <span aria-hidden>{cat.emoji}</span>{cat.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-foreground">Schedule for Later</p>
              <p className="text-[11px] text-muted-foreground/65 mt-0.5">Set a future date for your broadcast</p>
            </div>
            <Switch checked={liveScheduled} onCheckedChange={setLiveScheduled} aria-label="Schedule live broadcast" />
          </div>
          {liveScheduled && (
            <div className="mt-3 animate-slide-up">
              <Label htmlFor="live-schedule-date" className="text-[11px] font-medium text-muted-foreground">Date &amp; Time</Label>
              <Input
                id="live-schedule-date" type="datetime-local"
                value={liveScheduleDate}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                onChange={e => setLiveScheduleDate(e.target.value)}
                className="mt-1.5 text-sm"
              />
              {liveScheduleDate && new Date(liveScheduleDate) <= new Date() && (
                <p className="mt-1.5 text-[11px] text-[color:var(--color-error)] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />Scheduled time must be in the future
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: '📡', tip: 'Stable Wi-Fi or 4G+ recommended for smooth streaming' },
          { icon: '💡', tip: 'Good lighting makes a huge difference for viewers' },
          { icon: '🎤', tip: 'Test your audio before going live for best results' },
          { icon: '⏱️', tip: 'Lives 10–30 min tend to get the most engagement' },
        ].map(({ icon, tip }) => (
          <div key={tip} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/25 border border-border/35">
            <span className="text-base leading-none shrink-0 mt-0.5" aria-hidden>{icon}</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Step 2 ───────────────────────────────────────────────────────────────────

  const renderStep2 = () => {
    if (isLive) return renderLiveSetup();
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          {isVideoType ? 'MP4 or MOV · up to 100 MB' : 'PNG, JPG, GIF or WEBP · up to 10 MB'}
        </p>

        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-sm bg-black">
              {isVideoType
                ? <video src={previewUrl} controls className="w-full max-h-[460px] object-contain rounded-2xl" />
                : <img src={previewUrl} alt="Media preview" className="w-full max-h-[460px] object-contain rounded-2xl" />}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${currentCT.gradient} pointer-events-auto`}>
                  {React.cloneElement(currentCT.icon as React.ReactElement, { className: 'w-2.5 h-2.5' })}
                  {currentCT.label}
                </span>
                <div className="flex gap-2 pointer-events-auto">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-[11px] font-semibold hover:bg-black/75 transition-colors"
                    aria-label="Edit media"
                  >
                    <Edit3 className="w-3 h-3" />{editedData ? 'Re-edit' : 'Edit'}
                  </button>
                  <button onClick={removeFile} className="w-11 h-11 rounded-full bg-black/55 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/75 transition-colors" aria-label="Remove media">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {fileInfo && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[color:var(--color-success)]/5 border border-[color:var(--color-success)]/20">
                <div className="w-8 h-8 rounded-lg bg-[color:var(--color-success)]/15 flex items-center justify-center shrink-0">
                  {isVideoType ? <Video className="w-4 h-4 text-[color:var(--color-success)]" /> : <ImageIcon className="w-4 h-4 text-[color:var(--color-success)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-foreground truncate">{fileInfo.name}</p>
                  <p className="text-[10px] text-muted-foreground">{fileInfo.size}</p>
                </div>
                {editedData && <Badge variant="secondary" className="text-[10px] shrink-0">Edited</Badge>}
                <CheckCircle2 className="w-4 h-4 text-[color:var(--color-success)] shrink-0" />
              </div>
            )}

            <label className="block cursor-pointer">
              <input ref={fileRef} type="file" accept={currentCT.accept} onChange={handleFileSelect} onClick={clearFileInput} className="hidden" aria-label="Change media" />
              <div className="flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-border/60 bg-card text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/25 transition-all">
                <RefreshCw className="w-3.5 h-3.5" aria-hidden />Change media
              </div>
            </label>

            {/* Loop: sound picker */}
            {isLoop && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <button type="button" onClick={() => setShowSoundPicker(s => !s)} aria-expanded={showSoundPicker}
                  className="w-full flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                >
                  <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4 text-violet-500" aria-hidden />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[12px] font-semibold text-foreground">
                      {selectedSound ? TRENDING_SOUNDS.find(s => s.id === selectedSound)?.name : 'Add Sound'}
                    </p>
                    <p className="text-[10px] text-muted-foreground/65">
                      {selectedSound ? 'Tap to change' : 'Trending or original audio'}
                    </p>
                  </div>
                  {showSoundPicker ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {showSoundPicker && (
                  <div className="mt-3 space-y-1.5 animate-slide-up">
                    {TRENDING_SOUNDS.map(s => (
                      <button key={s.id} type="button"
                        onClick={() => { setSelectedSound(s.id); setShowSoundPicker(false); toast.success(`Sound selected: ${s.name}`); }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          selectedSound === s.id ? 'border-violet-500/25 bg-violet-500/8' : 'border-border/50 hover:border-border bg-muted/20'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                          {s.id === 'orig' ? <Mic className="w-3.5 h-3.5 text-violet-500" /> : <Music className="w-3.5 h-3.5 text-violet-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-foreground truncate">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground/65">{s.artist}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/55 shrink-0">{s.duration}</span>
                        {selectedSound === s.id && <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Story: specific options */}
            {isStory && (
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <p className="text-[12px] font-semibold text-foreground">Story Settings</p>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-foreground">Auto-delete after 24h</p>
                    <p className="text-[10px] text-muted-foreground/65">Story disappears automatically</p>
                  </div>
                  <Switch checked={storyAutoDelete} onCheckedChange={setStoryAutoDelete} aria-label="Auto-delete after 24h" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-foreground">Save to Highlights</p>
                    <p className="text-[10px] text-muted-foreground/65">Keep on your profile permanently</p>
                  </div>
                  <Switch checked={storyHighlight} onCheckedChange={v => { setStoryHighlight(v); if (v) setStoryAutoDelete(false); }} aria-label="Save to highlights" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              className={`block cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
                isDragOver ? 'border-primary bg-primary/5 scale-[1.015]' : 'border-border hover:border-primary/50 hover:bg-muted/15'
              }`}
            >
              <input ref={fileRef} type="file" accept={currentCT.accept} onChange={handleFileSelect} onClick={clearFileInput} className="hidden" aria-label={`Upload ${contentType}`} />
              <div className="flex flex-col items-center py-14 px-8 text-center">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 transition-all duration-300 ${isDragOver ? 'scale-110 bg-primary/15' : 'bg-muted/50'}`}>
                  <Upload className={`w-8 h-8 transition-all duration-300 ${isDragOver ? 'text-primary -translate-y-1.5' : 'text-muted-foreground'}`} aria-hidden />
                </div>
                <p className="font-semibold text-foreground mb-1.5">{isDragOver ? 'Drop it here!' : 'Click to upload or drag & drop'}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {isVideoType ? 'MP4, MOV · max 100 MB' : 'JPG, PNG, GIF, WEBP · max 10 MB'}
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/50 text-[11px] text-muted-foreground font-medium mb-5">
                  <span aria-hidden>📐</span>Ideal: {currentCT.ratio}
                </span>
                <div className="flex gap-2 flex-wrap justify-center mb-6">
                  {(isVideoType ? ['MP4', 'MOV', 'AVI'] : ['JPG', 'PNG', 'GIF', 'WEBP']).map(f => (
                    <span key={f} className="px-2.5 py-1 rounded-lg bg-muted border border-border/50 text-[11px] text-muted-foreground font-medium">{f}</span>
                  ))}
                </div>
                <Button type="button" variant="outline" className="h-10 px-6" tabIndex={-1}>Browse Files</Button>
              </div>
            </label>
            {stepErrors[2] && (
              <p className="mt-2.5 text-center text-[12px] text-[color:var(--color-error)] font-medium flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden />{stepErrors[2]}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {(isVideoType ? [
            { icon: '⏱️', tip: 'Keep Loops under 60 s for best reach' },
            { icon: '📱', tip: 'Vertical 9:16 recommended for full-screen' },
          ] : [
            { icon: '🌅', tip: 'High-contrast images perform better' },
            { icon: '📐', tip: `${isStory ? '9:16 portrait' : 'Square or 4:5 portrait'} works best` },
          ]).map(({ icon, tip }) => (
            <div key={tip} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/25 border border-border/35">
              <span className="text-base leading-none shrink-0 mt-0.5" aria-hidden>{icon}</span>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Step 3 ───────────────────────────────────────────────────────────────────

  const renderStep3 = () => {
    if (isLive) {
      return (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">Choose who can watch your live broadcast</p>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-[13px] font-semibold text-foreground mb-3">Live Audience</p>
              <div className="space-y-2" role="radiogroup" aria-label="Select audience">
                {AUDIENCE_OPTIONS.filter(o => !o.storeOnly || isStore).map(opt => (
                  <button key={opt.value} type="button" role="radio" aria-checked={audience === opt.value}
                    onClick={() => setAudience(opt.value)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all active:scale-[0.98] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      audience === opt.value ? 'border-primary bg-primary/5' : 'border-border/45 bg-card hover:border-border'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${audience === opt.value ? 'text-white' : 'bg-muted/55 text-muted-foreground'}`}
                      style={audience === opt.value ? { background: 'var(--brand-gradient)' } : {}} aria-hidden>{opt.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold ${audience === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground/65">{opt.desc}</p>
                    </div>
                    {audience === opt.value && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-[13px] font-semibold text-foreground mb-3">Interaction</p>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-foreground">Live Chat</p>
                    <p className="text-[10px] text-muted-foreground/65 mt-0.5">Let viewers send messages during your broadcast</p>
                  </div>
                  <Switch checked={allowComments} onCheckedChange={setAllowComments} aria-label="Allow live chat" />
                </div>
                <div className="h-px bg-border/30" />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-foreground">Allow Sharing</p>
                    <p className="text-[10px] text-muted-foreground/65 mt-0.5">Let others share your broadcast</p>
                  </div>
                  <Switch checked={allowSharing} onCheckedChange={setAllowSharing} aria-label="Allow sharing" />
                </div>
                {isStore && (
                  <>
                    <div className="h-px bg-border/30" />
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[12px] font-medium text-foreground">Live Shopping</p>
                        <p className="text-[10px] text-muted-foreground/65 mt-0.5">Showcase &amp; sell products in real-time</p>
                      </div>
                      <Switch checked={enableShopping} onCheckedChange={setEnableShopping} aria-label="Enable live shopping" />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">Write a caption, tag products, and add your location</p>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="caption-input" className="text-[13px] font-semibold">Caption</Label>
              <CharacterArc value={caption.length} max={CAPTION_MAX} />
            </div>

            <textarea
              id="caption-input" ref={captionRef}
              placeholder="Write a caption… tell your story 🌟"
              value={caption}
              onChange={e => { setCaption(e.target.value); setHasUnsaved(true); }}
              maxLength={CAPTION_MAX} rows={4} disabled={aiLoading}
              aria-label="Post caption"
              className={`w-full resize-none placeholder:text-muted-foreground rounded-xl border border-border bg-input-background px-3.5 py-3 text-sm transition-all outline-none hover:border-border-strong focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 ${aiLoading ? 'opacity-50 cursor-wait' : ''}`}
            />

            {/* Toolbar */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              <button
                type="button"
                onClick={() => { setShowAiPanel(s => !s); setShowHashtags(false); setShowEmoji(false); }}
                disabled={aiLoading}
                aria-expanded={showAiPanel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-[11px] font-semibold text-primary hover:bg-primary/14 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {aiLoading
                  ? <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" aria-hidden />
                  : <Sparkles className="w-3 h-3" aria-hidden />}
                {aiLoading ? 'Writing…' : 'AI Caption'}
              </button>

              <button
                type="button"
                onClick={() => { setShowHashtags(h => !h); setShowEmoji(false); setShowAiPanel(false); }}
                aria-expanded={showHashtags}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  showHashtags ? 'bg-primary/8 border-primary/25 text-primary' : 'bg-muted/40 border-border/55 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Hash className="w-3 h-3" aria-hidden />#Tags
              </button>

              <button
                type="button"
                onClick={() => { setShowEmoji(e => !e); setShowHashtags(false); setShowAiPanel(false); }}
                aria-expanded={showEmoji}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  showEmoji ? 'bg-primary/8 border-primary/25 text-primary' : 'bg-muted/40 border-border/55 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smile className="w-3 h-3" aria-hidden />Emoji
              </button>

              {aiTemplate && !aiLoading && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/20 text-[10px] font-semibold text-primary ml-auto">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {AI_TEMPLATES.find(t => t.id === aiTemplate)?.label}
                </span>
              )}
            </div>

            {/* AI Template picker */}
            {showAiPanel && (
              <div className="mt-3 rounded-xl border border-border/50 bg-muted/15 p-3 animate-slide-up">
                <p className="text-[11px] font-semibold text-foreground mb-2.5">Choose a caption style</p>
                <div className="space-y-1.5">
                  {AI_TEMPLATES.map(t => (
                    <button key={t.id} type="button"
                      onClick={() => handleGenerateCaption(t.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left hover:border-primary/30 hover:bg-primary/5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        aiTemplate === t.id ? 'border-primary/30 bg-primary/8' : 'border-border/50 bg-card'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 bg-gradient-to-br ${t.color}`}>
                        <span className="text-base leading-none">{t.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-semibold text-foreground">{t.label}</p>
                        <p className="text-[10px] text-muted-foreground/70">{t.desc}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" aria-hidden />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtag panel */}
            {showHashtags && (
              <div className="mt-3 p-3 rounded-xl border border-border/40 bg-muted/20 animate-slide-up">
                <p className="text-[10px] text-muted-foreground/55 mb-2 font-medium">Tap to add to caption</p>
                <div className="flex flex-wrap gap-1.5">
                  {hashtagPool.map(tag => (
                    <button key={tag} type="button" onClick={() => addHashtag(tag)}
                      className="px-2.5 py-1 rounded-full bg-card border border-border/55 text-[11px] font-medium text-primary hover:bg-primary/8 hover:border-primary/25 transition-all active:scale-[0.93]"
                    >{tag}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Emoji panel */}
            {showEmoji && (
              <div className="mt-3 p-3 rounded-xl border border-border/40 bg-muted/20 animate-slide-up">
                <div className="grid grid-cols-10 gap-0.5" role="group" aria-label="Emoji picker">
                  {EMOJI_LIST.map(emoji => (
                    <button key={emoji} type="button" onClick={() => insertEmoji(emoji)}
                      aria-label={emoji}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-muted/70 transition-colors active:scale-90"
                    >{emoji}</button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="location-input" className="text-[13px] font-semibold">Location</Label>
            <div className="relative mt-2">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                id="location-input"
                placeholder="Add a location…"
                value={location}
                onFocus={() => setShowLocSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocSuggestions(false), 150)}
                onChange={e => { setLocation(e.target.value); setHasUnsaved(true); }}
                className="pl-9 pr-9 text-sm" autoComplete="off"
              />
              {location && (
                <button type="button" onClick={() => { setLocation(''); setHasUnsaved(true); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground" aria-label="Clear location">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {showLocSuggestions && !location && (
              <div className="mt-2 flex gap-1.5 flex-wrap animate-slide-up">
                {QUICK_LOCATIONS.slice(0, 8).map(loc => (
                  <button key={loc} type="button"
                    onMouseDown={() => { setLocation(loc); setShowLocSuggestions(false); setHasUnsaved(true); }}
                    className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/55 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-all"
                  >📍 {loc}</button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product tagging */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <button type="button" onClick={() => setShowProductGrid(g => !g)} aria-expanded={showProductGrid}
              className="w-full flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              <Tag className="w-4 h-4 text-muted-foreground" aria-hidden />
              <span className="text-[13px] font-semibold text-foreground flex-1 text-left">Tag Products</span>
              {taggedProducts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{taggedProducts.length}</span>
              )}
              {showProductGrid ? <ChevronUp className="w-4 h-4 text-muted-foreground" aria-hidden /> : <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden />}
            </button>

            {!showProductGrid && selectedProducts.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {selectedProducts.map(p => {
                  const disc = discountPct(p.price, p.originalPrice);
                  return (
                    <div key={p.id} className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl bg-muted/45 border border-border/55">
                      <img src={p.image} alt={p.name} className="w-6 h-6 rounded-lg object-cover shrink-0" loading="lazy" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate max-w-[72px]">{p.name}</p>
                        <p className="text-[10px] text-primary font-bold">{fmt(p.price)}</p>
                      </div>
                      {disc && <span className="text-[9px] font-bold text-[color:var(--color-error)]">-{disc}%</span>}
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setTaggedProducts(t => t.filter(id => id !== p.id)); }}
                        aria-label={`Remove ${p.name}`}
                        className="text-muted-foreground/35 hover:text-foreground ml-0.5 shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {showProductGrid && (
              <div className="mt-4 space-y-3 animate-slide-up">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <Input placeholder="Search products…" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                      className="pl-9 pr-9 text-sm" aria-label="Search products" />
                    {productSearch && (
                      <button type="button" onClick={() => setProductSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground" aria-label="Clear search">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {taggedProducts.length > 0 && (
                    <button type="button" onClick={() => setTaggedProducts([])}
                      className="px-3 py-2 rounded-xl border border-border/55 bg-card text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all whitespace-nowrap">
                      Clear all
                    </button>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-muted-foreground/25" aria-hidden />
                    <p className="text-sm font-medium text-muted-foreground/60">No products found</p>
                    <button type="button" onClick={() => setProductSearch('')}
                      className="text-[12px] text-primary hover:underline mt-1">Clear search</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground/55">{filteredProducts.length} products</p>
                      <button type="button"
                        onClick={() => {
                          const allIds = filteredProducts.map(p => p.id);
                          const allTagged = allIds.every(id => taggedProducts.includes(id));
                          setTaggedProducts(allTagged ? taggedProducts.filter(id => !allIds.includes(id)) : [...new Set([...taggedProducts, ...allIds])]);
                        }}
                        className="text-[11px] font-medium text-primary hover:underline">
                        {filteredProducts.every(p => taggedProducts.includes(p.id)) ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Select products to tag">
                      {filteredProducts.map(product => {
                        const tagged = taggedProducts.includes(product.id);
                        const disc = discountPct(product.price, product.originalPrice);
                        return (
                          <button key={product.id} type="button"
                            onClick={() => setTaggedProducts(t => tagged ? t.filter(id => id !== product.id) : [...t, product.id])}
                            aria-pressed={tagged}
                            aria-label={`${tagged ? 'Remove' : 'Tag'} ${product.name} — ${fmt(product.price)}`}
                            className={`relative rounded-xl overflow-hidden transition-all duration-150 active:scale-[0.93] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              tagged ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : 'hover:ring-1 ring-border/60'
                            }`}
                          >
                            <div className="aspect-square bg-muted/25 overflow-hidden">
                              <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                            </div>
                            {disc && (
                              <span className="absolute top-1.5 left-1.5 bg-[color:var(--color-error)] text-white px-1.5 py-0.5 rounded-md text-[8px] font-bold">-{disc}%</span>
                            )}
                            {tagged && (
                              <div className="absolute inset-0 bg-primary/22 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 px-2 pb-1.5 pt-5 bg-gradient-to-t from-black/75">
                              <p className="text-white text-[10px] font-bold leading-tight truncate">{product.name}</p>
                              <div className="flex items-center gap-1">
                                <p className="text-white/90 text-[9px] font-semibold">{fmt(product.price)}</p>
                                {product.originalPrice && <p className="text-white/45 text-[8px] line-through">{fmt(product.originalPrice)}</p>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {isStore && (
                  <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
                    <ShoppingCart className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">Shoppable Post</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">Customers can browse &amp; buy tagged products directly from your post.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <PostStrength hasMedia={!!selectedFile} caption={caption} products={taggedProducts} location={location} />
      </div>
    );
  };

  // ── Live Go Live (Step 4 for Live) ───────────────────────────────────────────

  const renderLiveGoLive = () => (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        {liveScheduled ? 'Review and schedule your broadcast' : 'Review your setup and start broadcasting'}
      </p>

      {/* Broadcast summary */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-foreground">Broadcast Summary</p>
            <button type="button" onClick={() => setStep(2)} className="text-[11px] text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Edit</button>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/45">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-red-500" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{liveTitle || 'Untitled Broadcast'}</p>
              <p className="text-[11px] text-muted-foreground/65">
                {CATEGORIES.find(c => c.id === liveCategory)?.emoji}{' '}
                {CATEGORIES.find(c => c.id === liveCategory)?.label} · {AUDIENCE_OPTIONS.find(o => o.value === audience)?.label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Audience', value: AUDIENCE_OPTIONS.find(o => o.value === audience)?.label ?? 'Public', icon: <Users className="w-4 h-4" /> },
          { label: 'Timing', value: liveScheduled ? (liveScheduleDate ? new Date(liveScheduleDate).toLocaleDateString() : 'Scheduled') : 'Go Live Now', icon: <Clock className="w-4 h-4" /> },
          { label: 'Live Chat', value: allowComments ? 'Enabled' : 'Disabled', icon: <Sparkles className="w-4 h-4" /> },
          { label: 'Shopping', value: enableShopping ? 'Enabled' : 'Disabled', icon: <ShoppingBag className="w-4 h-4" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/45">
            <div className="w-8 h-8 rounded-lg bg-muted/55 flex items-center justify-center text-muted-foreground shrink-0" aria-hidden>{icon}</div>
            <div>
              <p className="text-[10px] text-muted-foreground/60">{label}</p>
              <p className="text-[12px] font-semibold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Connection status */}
      <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${isOnline ? 'bg-[color:var(--color-success)]/5 border-[color:var(--color-success)]/20' : 'bg-[color:var(--color-error)]/5 border-[color:var(--color-error)]/20'}`}>
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? 'bg-[color:var(--color-success)] animate-pulse' : 'bg-[color:var(--color-error)]'}`} />
        <div>
          <p className={`text-[12px] font-semibold ${isOnline ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-error)]'}`}>
            {isOnline ? 'Connection Ready' : 'No Connection'}
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            {isOnline ? 'Your connection looks good — you can go live!' : 'Check your internet connection before going live.'}
          </p>
        </div>
      </div>

      {isStore && enableShopping && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-primary/5 border border-primary/15">
          <ShoppingBag className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-[12px] font-semibold text-foreground">Live Shopping Enabled</p>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">You can showcase and sell products during your broadcast. Viewers can add to cart without leaving.</p>
          </div>
        </div>
      )}
    </div>
  );

  // ── Step 4 ───────────────────────────────────────────────────────────────────

  const renderStep4 = () => {
    if (isLive) return renderLiveGoLive();
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">Choose your audience and set when to publish</p>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            {/* Audience */}
            <Card>
              <CardContent className="p-4 sm:p-5">
                <p className="text-[13px] font-semibold text-foreground mb-3">Audience</p>
                <div className="space-y-2" role="radiogroup" aria-label="Select audience">
                  {AUDIENCE_OPTIONS.filter(o => !o.storeOnly || isStore).map(opt => (
                    <button key={opt.value} type="button" role="radio" aria-checked={audience === opt.value}
                      onClick={() => setAudience(opt.value)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all active:scale-[0.98] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        audience === opt.value ? 'border-primary bg-primary/5' : 'border-border/45 bg-card hover:border-border'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${audience === opt.value ? 'text-white' : 'bg-muted/55 text-muted-foreground'}`}
                        style={audience === opt.value ? { background: 'var(--brand-gradient)' } : {}} aria-hidden>{opt.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-semibold ${audience === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground/65">{opt.desc}</p>
                      </div>
                      {audience === opt.value && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden />}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interaction */}
            <Card>
              <CardContent className="p-4 sm:p-5">
                <p className="text-[13px] font-semibold text-foreground mb-3">Interaction</p>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div><p className="text-[12px] font-medium text-foreground">Allow Comments</p><p className="text-[10px] text-muted-foreground/65 mt-0.5">Let others comment on your post</p></div>
                    <Switch checked={allowComments} onCheckedChange={setAllowComments} aria-label="Allow comments" />
                  </div>
                  <div className="h-px bg-border/30" />
                  <div className="flex items-center justify-between gap-4">
                    <div><p className="text-[12px] font-medium text-foreground">Allow Sharing</p><p className="text-[10px] text-muted-foreground/65 mt-0.5">Let others share your post</p></div>
                    <Switch checked={allowSharing} onCheckedChange={setAllowSharing} aria-label="Allow sharing" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardContent className="p-4 sm:p-5">
                <p className="text-[13px] font-semibold text-foreground mb-3">Options</p>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <TrendingUp className="w-4 h-4 text-muted-foreground/60 shrink-0" aria-hidden />
                      <div><p className="text-[12px] font-medium text-foreground">Track Performance</p><p className="text-[10px] text-muted-foreground/65">View reach &amp; engagement stats</p></div>
                    </div>
                    <Switch checked={trackPerformance} onCheckedChange={setTrackPerformance} aria-label="Track performance" />
                  </div>
                  <div className="h-px bg-border/30" />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Zap className="w-4 h-4 text-muted-foreground/60 shrink-0" aria-hidden />
                      <div><p className="text-[12px] font-medium text-foreground">Promote Later</p><p className="text-[10px] text-muted-foreground/65">Boost this post after publishing</p></div>
                    </div>
                    <Switch checked={promoteLater} onCheckedChange={setPromoteLater} aria-label="Promote later" />
                  </div>
                  {isStore && (
                    <>
                      <div className="h-px bg-border/30" />
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground/60 shrink-0" aria-hidden />
                          <div><p className="text-[12px] font-medium text-foreground">Enable Shopping</p><p className="text-[10px] text-muted-foreground/65">Allow in-post checkout</p></div>
                        </div>
                        <Switch checked={enableShopping} onCheckedChange={setEnableShopping} aria-label="Enable shopping" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Collaboration */}
            {isStore && (
              <Card>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="w-4 h-4 text-muted-foreground/60" aria-hidden />
                    <span className="text-[13px] font-semibold text-foreground">Collaboration</span>
                    <Badge variant="secondary" className="text-[10px] ml-auto">Store only</Badge>
                  </div>
                  <div className="space-y-2">
                    <button type="button" onClick={() => setShowCollabModal(true)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/60 hover:border-primary/35 hover:bg-primary/3 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="w-9 h-9 rounded-xl bg-muted/55 flex items-center justify-center shrink-0"><UserPlus className="w-4 h-4 text-muted-foreground" aria-hidden /></div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">Add Collaborator</p>
                        <p className="text-[11px] text-muted-foreground/65">Invite a creator or team member</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/35 ml-auto shrink-0" aria-hidden />
                    </button>
                    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/25 border border-border/45">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-muted/55 flex items-center justify-center shrink-0"><Share2 className="w-4 h-4 text-muted-foreground" aria-hidden /></div>
                        <div><p className="text-[13px] font-medium text-foreground">Cross Post</p><p className="text-[11px] text-muted-foreground/65">Also share to personal profile</p></div>
                      </div>
                      <Switch checked={crossPost} onCheckedChange={setCrossPost} aria-label="Cross post to personal profile" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <PostStrength hasMedia={!!selectedFile} caption={caption} products={taggedProducts} location={location} />

            {/* Live preview */}
            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-foreground">Live Preview</p>
                  <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-success)] animate-pulse" />Updates live
                  </span>
                </div>
                <div className="bg-background border border-border/55 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2.5 px-3.5 pt-3.5 pb-3">
                    <img src="https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?w=100" alt="Your profile" className="w-9 h-9 rounded-full object-cover ring-2 ring-border/55 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[12px] font-semibold text-foreground">You</span>
                        {isStore && <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">Store</Badge>}
                      </div>
                      <p className="text-[10px] text-muted-foreground/55 mt-px">
                        Just now · {audience === 'public' ? '🌍 Public' : audience === 'followers' ? '👥 Followers' : audience === 'close-friends' ? '⭐ Close Friends' : '🔒 Limited'}
                      </p>
                    </div>
                  </div>
                  <div className={`relative w-full bg-muted/25 overflow-hidden ${contentType === 'story' ? 'aspect-[9/16] max-h-64' : 'aspect-square'}`}>
                    {previewUrl ? (
                      isVideoType
                        ? <video src={previewUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                        : <img src={previewUrl} alt="Post preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-muted-foreground/22">
                          <ImageIcon className="w-10 h-10 mx-auto mb-1.5" aria-hidden />
                          <p className="text-xs font-medium">No media yet</p>
                          <button type="button" onClick={() => setStep(2)} className="text-[11px] text-primary hover:underline mt-0.5">Go to Step 2 →</button>
                        </div>
                      </div>
                    )}
                    {contentType === 'loop' && previewUrl && (
                      <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
                        <Zap className="w-2.5 h-2.5" aria-hidden />Loop
                      </span>
                    )}
                    {taggedProducts.length > 0 && (
                      <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-sm text-[10px] font-bold text-white">
                        <ShoppingBag className="w-2.5 h-2.5" aria-hidden />{taggedProducts.length}
                      </span>
                    )}
                    {selectedSound && isLoop && (
                      <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-sm text-[10px] text-white">
                        <Music className="w-2.5 h-2.5" aria-hidden />
                        {TRENDING_SOUNDS.find(s => s.id === selectedSound)?.name.slice(0, 12)}…
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 px-3.5 py-2.5 border-b border-border/35">
                    {[{ ic: '❤️', l: 'Like' }, { ic: '💬', l: 'Comment' }, { ic: '↗️', l: 'Share' }, { ic: '🔖', l: 'Save' }].map(a => (
                      <button key={a.l} type="button" aria-label={a.l} className="text-muted-foreground/35 hover:text-muted-foreground transition-colors">
                        <span className="text-[18px]">{a.ic}</span>
                      </button>
                    ))}
                  </div>
                  <div className="px-3.5 py-3">
                    {caption ? (
                      <p className="text-[12px] text-foreground/85 line-clamp-3 leading-relaxed mb-1.5">{caption}</p>
                    ) : (
                      <button type="button" onClick={() => setStep(3)} className="text-[11px] text-muted-foreground/35 italic mb-1.5 hover:text-primary transition-colors">
                        No caption yet — tap to add →
                      </button>
                    )}
                    {location && (
                      <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mb-1.5">
                        <MapPin className="w-2.5 h-2.5" aria-hidden />{location}
                      </p>
                    )}
                  </div>
                  {isStore && selectedProducts.length > 0 && (
                    <ShoppableStrip products={selectedProducts} onProductClick={id => navigate(`/product/${id}`)} />
                  )}
                  {!isStore && selectedProducts.length > 0 && (
                    <div className="px-3.5 pb-3 flex gap-1.5 flex-wrap">
                      {selectedProducts.slice(0, 3).map(p => (
                        <button key={p.id} type="button" onClick={() => navigate(`/product/${p.id}`)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/8 text-[9px] font-semibold text-primary hover:bg-primary/15 transition-colors">
                          <ShoppingBag className="w-2.5 h-2.5" aria-hidden />{p.name} · {fmt(p.price)}
                          <ExternalLink className="w-2 h-2 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Publish mode */}
            <Card>
              <CardContent className="p-4 sm:p-5">
                <p className="text-[13px] font-semibold text-foreground mb-3">When to Publish?</p>
                <div className="space-y-2" role="radiogroup" aria-label="Publish timing">
                  {([
                    { value: 'now'      as PublishMode, label: 'Publish Now',   desc: 'Go live immediately',      icon: <CheckCircle2 className="w-4 h-4" /> },
                    { value: 'schedule' as PublishMode, label: 'Schedule',      desc: 'Set a future date & time', icon: <Clock className="w-4 h-4" /> },
                    { value: 'draft'    as PublishMode, label: 'Save as Draft', desc: 'Finish later',             icon: <Save className="w-4 h-4" /> },
                  ]).map(opt => (
                    <button key={opt.value} type="button" role="radio" aria-checked={publishMode === opt.value}
                      onClick={() => setPublishMode(opt.value)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        publishMode === opt.value ? 'border-primary bg-primary/5' : 'border-border/45 bg-card hover:border-border'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${publishMode === opt.value ? 'text-white' : 'bg-muted/55 text-muted-foreground'}`}
                        style={publishMode === opt.value ? { background: 'var(--brand-gradient)' } : {}} aria-hidden>{opt.icon}</div>
                      <div className="flex-1">
                        <p className={`text-[12px] font-semibold ${publishMode === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground/65">{opt.desc}</p>
                      </div>
                      {publishMode === opt.value && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden />}
                    </button>
                  ))}
                </div>
                {publishMode === 'schedule' && (
                  <div className="mt-3 animate-slide-up">
                    <Label htmlFor="schedule-date" className="text-[11px] font-medium text-muted-foreground">Date &amp; Time</Label>
                    <Input
                      id="schedule-date" type="datetime-local"
                      value={scheduleDate}
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                      onChange={e => setScheduleDate(e.target.value)}
                      className="mt-1.5 text-sm" aria-required
                    />
                    {scheduleDate && new Date(scheduleDate) <= new Date() && (
                      <p className="mt-1.5 text-[11px] text-[color:var(--color-error)] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />Scheduled time must be in the future
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/18">
              <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="text-[12px] font-semibold text-foreground">Best time to post</p>
                <p className="text-[11px] text-muted-foreground/75 mt-0.5 leading-relaxed">
                  Your audience is most active <strong className="text-foreground">6–9 PM weekdays</strong>. Scheduling in this window can boost reach up to 3×.
                </p>
              </div>
            </div>

            <p className="hidden lg:block text-center text-[10px] text-muted-foreground/35 select-none">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 font-mono text-[10px]">⌘ Enter</kbd> to publish
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ── Shell ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO {...SEOConfigs.upload} />

      {!isOnline && <OfflineBanner />}
      {showCollabModal && <CollaboratorModal onClose={() => setShowCollabModal(false)} />}

      {/* Sticky top bar — below nav (3rem mobile / 4rem desktop) + optional 2.75rem offline banner */}
      <div className={`sticky z-10 bg-card/95 backdrop-blur-sm border-b border-border ${!isOnline ? 'lg:!top-[6.75rem]' : 'lg:!top-16'}`} style={{ top: !isOnline ? 'calc(8.25rem + env(safe-area-inset-top, 0px))' : 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex bg-muted/45 border border-border/45 rounded-full p-0.5 shrink-0" role="group" aria-label="Create as">
              {(['personal', 'store'] as const).map(mode => (
                <button key={mode} type="button" onClick={() => setCreateAs(mode)} aria-pressed={createAs === mode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    createAs === mode ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={createAs === mode ? { background: 'var(--brand-gradient)' } : {}}
                >
                  {mode === 'personal' ? <><Users className="w-3 h-3" aria-hidden />Personal</> : <><Store className="w-3 h-3" aria-hidden />Store</>}
                </button>
              ))}
            </div>
            <span className="hidden sm:inline-flex items-center text-[11px] text-muted-foreground/55 flex-1 truncate select-none">{activeStepMeta[step].hint}</span>
            {step >= 3 && !isLive && (
              <button type="button" onClick={saveDraft} disabled={!caption && !selectedFile}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border/55 bg-card text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/45 transition-all disabled:opacity-35 disabled:cursor-not-allowed shrink-0 ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Save draft"
              >
                <Save className="w-3 h-3" aria-hidden /><span className="hidden sm:inline">Save Draft</span>
              </button>
            )}
          </div>
          <StepBar step={step} setStep={setStepSafe} canGoTo={canGoTo} meta={activeStepMeta} />
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-5 pb-32 scroll-mt-28">
        <div key={step} className="animate-feed-in">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>

      {/* Bottom nav bar — z-[60] sits above the mobile bottom nav (z-50) */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-card/96 backdrop-blur-sm border-t border-border safe-area-pb">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={goBack} disabled={step === 1}
              aria-label="Go to previous step"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/55 bg-card text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/45 transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden /><span className="hidden xs:inline">Back</span>
            </button>

            <div className="flex-1 text-center sm:hidden select-none" aria-live="polite">
              <p className="text-[11px] text-muted-foreground leading-tight">
                <span className="font-semibold text-foreground">{activeStepMeta[step].label}</span>
                <span className="text-muted-foreground/45"> · {step}/4</span>
              </p>
            </div>

            <div className="hidden sm:flex flex-1 items-center justify-center">
              <span className="text-[11px] text-muted-foreground/40 select-none">{activeStepMeta[step].hint}</span>
            </div>

            {step < 4 ? (
              <button type="button" onClick={goNext}
                aria-label={step === 3 ? 'Review and publish' : `Go to step ${step + 1}`}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0"
                style={{ background: 'var(--brand-gradient)' }}
              >
                {step === 3 ? 'Review' : 'Next'}<ArrowRight className="w-4 h-4" aria-hidden />
              </button>
            ) : isLive ? (
              <button type="button" onClick={handlePublish}
                disabled={!liveTitle.trim() || !isOnline}
                aria-label={liveScheduled ? 'Schedule live broadcast' : 'Go live now'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 shrink-0 bg-red-600 hover:bg-red-700"
              >
                <Radio className="w-4 h-4 animate-pulse" aria-hidden />
                {liveScheduled ? 'Schedule Live' : 'Go Live'}
              </button>
            ) : (
              <button type="button" onClick={handlePublish}
                disabled={(!selectedFile && publishMode !== 'draft') || (publishMode === 'schedule' && !!scheduleDate && new Date(scheduleDate) <= new Date())}
                aria-label={publishMode === 'schedule' ? 'Schedule post' : publishMode === 'draft' ? 'Save draft' : 'Publish post now'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0"
                style={{ background: 'var(--brand-gradient)' }}
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden />
                {publishMode === 'schedule' ? 'Schedule' : publishMode === 'draft' ? 'Save Draft' : 'Publish Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
