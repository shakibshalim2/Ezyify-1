import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { BrandMark } from '../../components/primitives/BrandMark';
import { cn } from '../../components/ui/utils';
import { fadeUp, springSoft, staggerContainer } from '../../lib/motion';

export const SETUP_STEPS = [
  { id: 'interests', label: 'Interests', path: '/onboarding/interests' },
  { id: 'follow', label: 'Creators', path: '/onboarding/follow-suggestions' },
  { id: 'permissions', label: 'Permissions', path: '/onboarding/permissions' },
] as const;

interface SetupLayoutProps {
  step: (typeof SETUP_STEPS)[number]['id'];
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  /** Sticky footer (primary CTA + skip). */
  footer: ReactNode;
  backTo?: string;
  onSkip?: () => void;
  className?: string;
}

/**
 * Post‑signup personalisation shell: segmented step progress at the top,
 * scrollable content, sticky safe‑area footer for the CTA.
 */
export function SetupLayout({
  step,
  title,
  subtitle,
  icon,
  children,
  footer,
  backTo,
  onSkip,
  className,
}: SetupLayoutProps) {
  const reduce = useReducedMotion();
  const index = SETUP_STEPS.findIndex((s) => s.id === step);

  return (
    <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-aurora opacity-50" />

      <header className="relative z-10 mx-auto w-full max-w-2xl px-5 pt-[calc(var(--safe-top)+0.75rem)]">
        <div className="flex h-11 items-center justify-between">
          {backTo ? (
            <Link
              to={backTo}
              aria-label="Back"
              className="-ml-2 flex size-11 items-center justify-center rounded-full text-foreground-secondary transition hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </Link>
          ) : (
            <BrandMark size={32} />
          )}
          <span className="text-xs font-medium text-foreground-tertiary">
            Step {index + 1} of {SETUP_STEPS.length}
          </span>
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="-mr-2 h-11 rounded-full px-3 text-sm font-medium text-foreground-secondary transition hover:bg-muted hover:text-foreground"
            >
              Skip
            </button>
          ) : (
            <span className="w-11" />
          )}
        </div>
        <ol className="mt-3 flex gap-1.5" aria-label="Setup progress">
          {SETUP_STEPS.map((s, i) => (
            <li key={s.id} className="flex-1">
              <span className="sr-only">
                {s.label} {i < index ? '(done)' : i === index ? '(current)' : ''}
              </span>
              <motion.span
                aria-hidden
                initial={false}
                animate={{ opacity: i <= index ? 1 : 0.3 }}
                transition={springSoft}
                className={cn('block h-1.5 rounded-full', i <= index ? 'bg-primary' : 'bg-border-strong')}
              />
            </li>
          ))}
        </ol>
      </header>

      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05, 0.05)}
        initial="hidden"
        animate="visible"
        className={cn('relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-32 pt-6', className)}
      >
        <motion.div variants={fadeUp} className="mb-6 flex flex-col items-start gap-4">
          {icon && (
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
              {icon}
            </span>
          )}
          <div className="space-y-1.5">
            <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight sm:text-3xl">{title}</h1>
            {subtitle && <p className="max-w-prose text-base text-foreground-secondary">{subtitle}</p>}
          </div>
        </motion.div>
        {children}
      </motion.main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-2xl px-5 pb-[calc(var(--safe-bottom)+1rem)] pt-3">{footer}</div>
      </footer>
    </div>
  );
}
