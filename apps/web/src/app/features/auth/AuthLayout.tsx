import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { BrandMark, BrandWordmark } from '../../components/primitives/BrandMark';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  backTo?: string;
  backLabel?: string;
  /** Optional hero illustration/figure displayed above the title on mobile & in the side panel on desktop. */
  hero?: ReactNode;
  className?: string;
}

/**
 * Shared shell for the auth flow. Mobile: single column, sticky footer, keyboard-safe scroll.
 * Desktop (lg+): split layout with a brand panel on the left.
 */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  backTo,
  backLabel = 'Back',
  hero,
  className,
}: AuthLayoutProps) {
  const reduce = useReducedMotion();
  return (
    <div className="relative min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-[#0F66C7] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_10%,rgba(255,255,255,0.22),transparent_60%),radial-gradient(60%_50%_at_90%_90%,rgba(255,111,34,0.35),transparent_60%)]" />
        <Link to="/" className="relative flex items-center gap-3 text-white">
          <BrandMark size={44} bare className="text-white" />
          <span className="font-display text-2xl font-bold tracking-tight">Ezyify</span>
        </Link>
        <div className="relative max-w-md space-y-6">
          {hero && <div className="w-full max-w-sm">{hero}</div>}
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-white">
            Shop. Talk. Share.
            <br />
            Live the moment.
          </h2>
          <p className="text-lg text-white/80">
            One feed for products, creators and live drops — with escrow protection on every order.
          </p>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} Ezyify</p>
      </aside>

      {/* Form column */}
      <div className="relative flex min-h-dvh flex-col lg:min-h-0">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-aurora opacity-60 lg:hidden" />

        <header className="relative z-10 flex h-14 items-center justify-between px-4 pt-[var(--safe-top)] sm:px-6">
          {backTo ? (
            <Link
              to={backTo}
              className="-ml-2 inline-flex h-11 items-center gap-1 rounded-full pl-2 pr-3 text-sm font-medium text-foreground-secondary transition hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
              {backLabel}
            </Link>
          ) : (
            <span />
          )}
          <Link to="/" className="flex items-center gap-2 lg:hidden" aria-label="Ezyify home">
            <BrandMark size={32} />
            <BrandWordmark size={20} />
          </Link>
        </header>

        <motion.main
          variants={staggerContainer(reduce ? 0 : 0.06, 0.05)}
          initial="hidden"
          animate="visible"
          className={cn(
            'relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-[calc(var(--safe-bottom)+1.5rem)] pt-4 sm:px-6 lg:justify-center lg:py-12',
            className,
          )}
        >
          {hero && (
            <motion.div variants={fadeUp} className="mx-auto mb-4 w-40 sm:w-48 lg:hidden">
              {hero}
            </motion.div>
          )}
          <motion.div variants={fadeUp} className="mb-6 space-y-1.5">
            <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight sm:text-3xl">
              {title}
            </h1>
            {subtitle && <p className="text-base text-foreground-secondary">{subtitle}</p>}
          </motion.div>
          <div className="flex-1">{children}</div>
          {footer && (
            <motion.div variants={fadeUp} className="mt-8 text-center text-sm text-foreground-secondary">
              {footer}
            </motion.div>
          )}
        </motion.main>
      </div>
    </div>
  );
}

export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-foreground-tertiary" role="separator">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
