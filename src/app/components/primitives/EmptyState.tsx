import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../ui/utils';
import { fadeUp, staggerContainer } from '../../lib/motion';

export type EmptyKind =
  | 'feed'
  | 'cart'
  | 'wishlist'
  | 'orders'
  | 'messages'
  | 'notifications'
  | 'search'
  | 'offline'
  | 'error';

interface EmptyStateProps {
  kind?: EmptyKind;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  illustration?: ReactNode;
  compact?: boolean;
  className?: string;
}

/** Illustrated empty/error state with staggered entrance. Illustrations are brand SVGs (see below). */
export function EmptyState({
  kind = 'feed',
  title,
  description,
  action,
  secondaryAction,
  illustration,
  compact = false,
  className,
}: EmptyStateProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      role="status"
      variants={staggerContainer(reduce ? 0 : 0.07)}
      initial="hidden"
      animate="visible"
      className={cn(
        'mx-auto flex w-full max-w-sm flex-col items-center text-center',
        compact ? 'gap-3 py-8' : 'gap-4 py-14',
        className,
      )}
    >
      <motion.div variants={fadeUp} className={cn(compact ? 'w-32' : 'w-44 sm:w-52')}>
        {illustration ?? <EmptyIllustration kind={kind} />}
      </motion.div>
      <motion.div variants={fadeUp} className="space-y-1.5">
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm leading-relaxed text-foreground-secondary">{description}</p>}
      </motion.div>
      {(action || secondaryAction) && (
        <motion.div variants={fadeUp} className="flex w-full flex-col items-center gap-2 pt-1 sm:flex-row sm:justify-center">
          {action}
          {secondaryAction}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Illustrations — flat, token‑coloured, no external assets            */
/* ------------------------------------------------------------------ */

function Blob() {
  return <ellipse cx="100" cy="112" rx="88" ry="60" fill="var(--primary-subtle)" />;
}

export function EmptyIllustration({ kind }: { kind: EmptyKind }) {
  const reduce = useReducedMotion();
  const floatProps = reduce
    ? {}
    : { animate: { y: [0, -6, 0] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const } };

  const shapes: Record<EmptyKind, ReactNode> = {
    feed: (
      <>
        <rect x="52" y="52" width="96" height="112" rx="14" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="2" />
        <rect x="64" y="66" width="72" height="52" rx="8" fill="var(--primary)" opacity="0.85" />
        <circle cx="76" cy="136" r="7" fill="var(--orange-500)" />
        <rect x="90" y="132" width="42" height="7" rx="3.5" fill="var(--border-strong)" />
        <rect x="64" y="148" width="60" height="6" rx="3" fill="var(--border)" />
      </>
    ),
    cart: (
      <>
        <path d="M50 66h16l14 60h60l12-42H74" fill="none" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="86" cy="142" r="8" fill="var(--primary)" />
        <circle cx="134" cy="142" r="8" fill="var(--primary)" />
        <circle cx="132" cy="58" r="16" fill="var(--orange-500)" />
        <path d="M126 58h12M132 52v12" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      </>
    ),
    wishlist: (
      <>
        <path d="M100 150 L60 110 a24 24 0 0 1 34 -34 l6 6 6 -6 a24 24 0 0 1 34 34z" fill="var(--card)" stroke="var(--like)" strokeWidth="6" strokeLinejoin="round" />
        <path d="M78 96 a10 10 0 0 1 10 -10" stroke="var(--like)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        <circle cx="148" cy="66" r="5" fill="var(--orange-500)" />
        <circle cx="54" cy="150" r="4" fill="var(--primary)" />
      </>
    ),
    orders: (
      <>
        <path d="M56 84 L100 62 l44 22 v50 l-44 22 -44 -22z" fill="var(--card)" stroke="var(--primary)" strokeWidth="5" strokeLinejoin="round" />
        <path d="M56 84 l44 22 44 -22M100 106v50" stroke="var(--primary)" strokeWidth="5" strokeLinejoin="round" />
        <path d="M78 73 l44 22" stroke="var(--orange-500)" strokeWidth="5" strokeLinecap="round" />
      </>
    ),
    messages: (
      <>
        <rect x="46" y="62" width="88" height="60" rx="16" fill="var(--primary)" />
        <path d="M62 122 l-6 18 22 -14" fill="var(--primary)" />
        <rect x="80" y="96" width="76" height="52" rx="14" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="2" />
        <path d="M140 148 l6 16 -20 -12" fill="var(--card)" stroke="var(--border-strong)" strokeWidth="2" />
        <circle cx="104" cy="122" r="4" fill="var(--border-strong)" />
        <circle cx="118" cy="122" r="4" fill="var(--border-strong)" />
        <circle cx="132" cy="122" r="4" fill="var(--border-strong)" />
      </>
    ),
    notifications: (
      <>
        <path d="M100 56 a28 28 0 0 1 28 28 v22 l10 14 H62 l10 -14 V84 a28 28 0 0 1 28 -28z" fill="var(--card)" stroke="var(--primary)" strokeWidth="6" strokeLinejoin="round" />
        <path d="M88 130 a12 12 0 0 0 24 0" fill="var(--primary)" />
        <circle cx="128" cy="62" r="10" fill="var(--orange-500)" />
      </>
    ),
    search: (
      <>
        <circle cx="92" cy="96" r="34" fill="var(--card)" stroke="var(--primary)" strokeWidth="7" />
        <path d="M118 122 l26 26" stroke="var(--primary)" strokeWidth="9" strokeLinecap="round" />
        <path d="M80 96 h24 M92 84 v24" stroke="var(--border-strong)" strokeWidth="5" strokeLinecap="round" transform="rotate(45 92 96)" />
      </>
    ),
    offline: (
      <>
        <path d="M52 100 a68 68 0 0 1 96 0" fill="none" stroke="var(--border-strong)" strokeWidth="7" strokeLinecap="round" />
        <path d="M70 118 a42 42 0 0 1 60 0" fill="none" stroke="var(--border-strong)" strokeWidth="7" strokeLinecap="round" />
        <circle cx="100" cy="142" r="8" fill="var(--primary)" />
        <path d="M60 60 l80 80" stroke="var(--error)" strokeWidth="7" strokeLinecap="round" />
      </>
    ),
    error: (
      <>
        <path d="M100 54 l52 92 H48z" fill="var(--card)" stroke="var(--warning)" strokeWidth="6" strokeLinejoin="round" />
        <path d="M100 86 v28" stroke="var(--warning)" strokeWidth="7" strokeLinecap="round" />
        <circle cx="100" cy="130" r="5" fill="var(--warning)" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 200 180" className="h-auto w-full" aria-hidden>
      <Blob />
      <motion.g {...floatProps}>{shapes[kind]}</motion.g>
    </svg>
  );
}
