import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { pageTransition } from '../../lib/motion';

/** Wrap a routed page to get a subtle fade/slide on mount; no-op under reduced motion. */
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" className={className}>
      {children}
    </motion.div>
  );
}
