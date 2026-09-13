import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../primitives/Button';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface HeroBannerProps {
  liveCount: number;
  featuredImage?: string;
  featuredName?: string;
}

/**
 * Home hero: brand gradient card with a floating featured product, live count and escrow
 * value prop. Sits under the stories bar and replaces the generic "gradient + text" block.
 */
export function HeroBanner({ liveCount, featuredImage, featuredName }: HeroBannerProps) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
      aria-label="Welcome"
      className="relative mx-3 mb-3 overflow-hidden rounded-card bg-brand-gradient-vivid text-white shadow-brand-lg sm:mx-0 sm:mb-4"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_100%_0%,rgba(255,255,255,0.22),transparent_60%)]" />
      <div className="relative grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_140px] sm:p-5">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
            <Sparkles className="size-3" /> Picked for you
          </span>
          <h2 className="font-display text-[1.375rem] font-bold leading-tight tracking-tight sm:text-2xl">
            Shop what your feed is talking about
          </h2>
          <p className="max-w-[26ch] text-sm text-white/85">
            Live drops, creator picks and deals — every order protected by escrow.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button asChild size="sm" className="bg-white text-[#0F66C7] shadow-none hover:bg-white/90">
              <Link to="/shop">
                Shop now <ArrowRight className="size-4" />
              </Link>
            </Button>
            {liveCount > 0 && (
              <Link
                to="/live-shopping"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <span aria-hidden className="size-2 rounded-full bg-accent-brand live-badge" />
                <Radio className="size-4" />
                <span className="tabular-nums">{liveCount}</span> live now
              </Link>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-white/75">
            <ShieldCheck className="size-3.5" /> Escrow‑protected payments
          </p>
        </div>

        {featuredImage && (
          <motion.div
            className="relative"
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-white/10 ring-4 ring-white/20 shadow-xl">
              <ImageWithFallback src={featuredImage} alt={featuredName ?? ''} className="size-full object-cover" />
            </div>
            <span className="absolute -bottom-2 -left-2 rounded-full bg-accent-brand px-2 py-0.5 text-[10px] font-bold text-accent-brand-foreground shadow-orange">
              Trending
            </span>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
