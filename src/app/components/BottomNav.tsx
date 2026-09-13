import { Link, useLocation } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Home, Plus, ShoppingBag, User, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from './ui/utils';
import { springSnappy } from '../lib/motion';

interface Tab {
  name: string;
  path: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
}

const TABS: Tab[] = [
  { name: 'Home', path: '/', icon: Home, match: (p) => p === '/' },
  { name: 'Loops', path: '/loops', icon: Video },
  { name: 'Create', path: '/upload', icon: Plus },
  { name: 'Shop', path: '/shop', icon: ShoppingBag, match: (p) => p.startsWith('/shop') || p.startsWith('/product') || p.startsWith('/categories') },
  { name: 'Profile', path: '/profile/me', icon: User, match: (p) => p.startsWith('/profile') },
];

/**
 * Mobile tab bar: 64px + safe area, 5 tabs with a raised centre Create button and a
 * spring-animated active pill shared between tabs. Hidden on lg+ where the top nav has links.
 */
export function BottomNav() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur-2xl lg:hidden"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="mx-auto flex h-16 max-w-md items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isCreate = tab.name === 'Create';
          const active = tab.match ? tab.match(pathname) : pathname.startsWith(tab.path);

          if (isCreate) {
            return (
              <li key={tab.path} className="flex flex-1 items-center justify-center">
                <Link
                  to={tab.path}
                  aria-label="Create"
                  className="group relative -mt-6 flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand-lg tap-highlight-none transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span aria-hidden className="absolute inset-0 rounded-2xl ring-4 ring-background" />
                  <Plus className="relative size-7" strokeWidth={2.5} />
                </Link>
              </li>
            );
          }

          return (
            <li key={tab.path} className="flex flex-1">
              <Link
                to={tab.path}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-center justify-center gap-1 tap-highlight-none outline-none transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-ring rounded-xl',
                  active ? 'text-primary' : 'text-foreground-tertiary hover:text-foreground-secondary',
                )}
              >
                <span className="relative flex h-8 w-14 items-center justify-center">
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : 'bottom-nav-pill'}
                      transition={springSnappy}
                      className="absolute inset-0 rounded-full bg-primary-subtle"
                    />
                  )}
                  <Icon className="relative size-[22px]" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className={cn('text-[11px] leading-none', active ? 'font-semibold' : 'font-medium')}>
                  {tab.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
