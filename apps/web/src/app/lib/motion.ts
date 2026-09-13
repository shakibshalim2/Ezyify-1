import type { Transition, Variants } from 'motion/react';

/** Material-3 inspired motion tokens shared by every animated surface. */
export const EASE_STANDARD = [0.2, 0, 0, 1] as const;
export const EASE_EMPHASIZED = [0.05, 0.7, 0.1, 1] as const;
export const EASE_EXIT = [0.3, 0, 0.8, 0.15] as const;

export const DURATION = { fast: 0.16, normal: 0.24, slow: 0.36, slower: 0.6 } as const;

export const springSoft: Transition = { type: 'spring', stiffness: 260, damping: 26, mass: 0.9 };
export const springSnappy: Transition = { type: 'spring', stiffness: 420, damping: 30 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_EMPHASIZED } },
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASE_EXIT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.normal, ease: EASE_STANDARD } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE_EXIT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: springSoft },
  exit: { opacity: 0, scale: 0.96, transition: { duration: DURATION.fast } },
};

/** Parent variant that staggers children using the variants above. */
export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE_EMPHASIZED } },
  exit: { opacity: 0, y: -6, transition: { duration: DURATION.fast, ease: EASE_EXIT } },
};

export const shake: Variants = {
  idle: { x: 0 },
  shake: { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.45 } },
};

export const pressable = {
  whileTap: { scale: 0.97 },
  transition: springSnappy,
} as const;
