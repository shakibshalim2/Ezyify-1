import { motion, useReducedMotion } from 'motion/react';

/**
 * Brand-native onboarding scenes drawn as SVG so they scale, theme and animate
 * without shipping bitmaps. Each is built from floating "cards" that gently drift.
 */

const float = (delay: number, distance = 10) => ({
  animate: { y: [0, -distance, 0] },
  transition: { duration: 4.5, delay, repeat: Infinity, ease: 'easeInOut' as const },
});

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <g>
      <rect x="110" y="30" width="140" height="280" rx="26" fill="var(--background-elevated)" stroke="var(--border-strong)" strokeWidth="2" />
      <rect x="150" y="42" width="60" height="8" rx="4" fill="var(--border)" />
      {children}
    </g>
  );
}

export function DiscoverScene() {
  const reduce = useReducedMotion();
  const F = (d: number, dist?: number) => (reduce ? {} : float(d, dist));
  return (
    <svg viewBox="0 0 360 340" className="h-full w-full" role="img" aria-label="Discover trending products and creators">
      <defs>
        <linearGradient id="dg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--blue-400)" />
          <stop offset="1" stopColor="var(--blue-700)" />
        </linearGradient>
        <linearGradient id="dg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--orange-300)" />
          <stop offset="1" stopColor="var(--orange-600)" />
        </linearGradient>
      </defs>
      <circle cx="180" cy="180" r="150" fill="var(--primary-subtle)" />
      <Phone>
        <rect x="124" y="64" width="112" height="120" rx="14" fill="url(#dg1)" />
        <circle cx="146" cy="86" r="10" fill="#fff" opacity="0.9" />
        <rect x="162" y="80" width="50" height="6" rx="3" fill="#fff" opacity="0.8" />
        <rect x="162" y="92" width="34" height="5" rx="2.5" fill="#fff" opacity="0.5" />
        <path d="M180 150 l-9 -9 a6 6 0 0 1 9 -8 a6 6 0 0 1 9 8 z" fill="#fff" />
        <rect x="124" y="194" width="52" height="60" rx="10" fill="var(--muted)" />
        <rect x="184" y="194" width="52" height="60" rx="10" fill="var(--muted)" />
        <rect x="124" y="262" width="112" height="36" rx="10" fill="var(--muted)" />
      </Phone>
      <motion.g {...F(0)}>
        <rect x="24" y="70" width="96" height="64" rx="14" fill="var(--card)" stroke="var(--border)" />
        <rect x="34" y="80" width="30" height="30" rx="8" fill="url(#dg2)" />
        <rect x="72" y="84" width="40" height="6" rx="3" fill="var(--foreground-tertiary)" />
        <rect x="72" y="96" width="26" height="6" rx="3" fill="var(--primary)" />
        <rect x="34" y="118" width="70" height="6" rx="3" fill="var(--border-strong)" />
      </motion.g>
      <motion.g {...F(0.8, 8)}>
        <rect x="236" y="120" width="104" height="72" rx="14" fill="var(--card)" stroke="var(--border)" />
        <circle cx="258" cy="144" r="12" fill="url(#dg1)" />
        <rect x="276" y="138" width="50" height="6" rx="3" fill="var(--foreground-tertiary)" />
        <rect x="276" y="150" width="30" height="5" rx="2.5" fill="var(--border-strong)" />
        <rect x="248" y="168" width="80" height="14" rx="7" fill="var(--primary)" />
        <rect x="270" y="172" width="36" height="6" rx="3" fill="#fff" />
      </motion.g>
      <motion.g {...F(1.4, 12)}>
        <rect x="40" y="220" width="84" height="84" rx="16" fill="url(#dg2)" />
        <path d="M82 246 l6 12 13 2 -9.5 9 2.5 13 -12 -6.5 -12 6.5 2.5 -13 -9.5 -9 13 -2z" fill="#fff" />
      </motion.g>
      <motion.g {...F(0.4, 6)}>
        <circle cx="290" cy="60" r="22" fill="var(--card)" stroke="var(--border)" />
        <path d="M290 50 l-9 -3 v16 l9 -3 9 3 v-16z" fill="var(--primary)" opacity="0" />
        <circle cx="290" cy="60" r="8" fill="var(--orange-500)" />
      </motion.g>
    </svg>
  );
}

export function ShopSafeScene() {
  const reduce = useReducedMotion();
  const F = (d: number, dist?: number) => (reduce ? {} : float(d, dist));
  return (
    <svg viewBox="0 0 360 340" className="h-full w-full" role="img" aria-label="Shop with escrow protection">
      <defs>
        <linearGradient id="sg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--blue-400)" />
          <stop offset="1" stopColor="var(--blue-700)" />
        </linearGradient>
      </defs>
      <circle cx="180" cy="180" r="150" fill="var(--accent-brand-subtle)" />
      {/* shield */}
      <motion.g {...F(0, 6)}>
        <path d="M180 60 l84 30 v70 c0 56 -38 96 -84 116 c-46 -20 -84 -60 -84 -116 v-70z" fill="url(#sg1)" />
        <path d="M180 78 l66 24 v58 c0 45 -30 78 -66 95 c-36 -17 -66 -50 -66 -95 v-58z" fill="#fff" opacity="0.12" />
        <path d="M150 178 l20 20 42 -46" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.g>
      {/* order card */}
      <motion.g {...F(0.9, 10)}>
        <rect x="18" y="200" width="122" height="78" rx="14" fill="var(--card)" stroke="var(--border)" />
        <rect x="30" y="212" width="34" height="34" rx="8" fill="var(--muted)" />
        <rect x="72" y="216" width="56" height="6" rx="3" fill="var(--foreground-tertiary)" />
        <rect x="72" y="228" width="36" height="6" rx="3" fill="var(--border-strong)" />
        <rect x="30" y="256" width="60" height="12" rx="6" fill="var(--success-subtle)" />
        <rect x="36" y="260" width="48" height="4" rx="2" fill="var(--success)" />
      </motion.g>
      {/* wallet card */}
      <motion.g {...F(1.6, 8)}>
        <rect x="228" y="188" width="114" height="72" rx="14" fill="var(--orange-500)" />
        <rect x="240" y="200" width="60" height="7" rx="3.5" fill="#fff" opacity="0.7" />
        <rect x="240" y="218" width="90" height="10" rx="5" fill="#fff" />
        <circle cx="318" cy="244" r="8" fill="#fff" opacity="0.6" />
        <circle cx="306" cy="244" r="8" fill="#fff" opacity="0.9" />
      </motion.g>
      {/* lock */}
      <motion.g {...F(0.4, 5)}>
        <rect x="262" y="76" width="56" height="44" rx="10" fill="var(--card)" stroke="var(--border)" />
        <path d="M276 76 v-10 a14 14 0 0 1 28 0 v10" stroke="var(--primary)" strokeWidth="6" fill="none" />
        <circle cx="290" cy="98" r="6" fill="var(--primary)" />
      </motion.g>
    </svg>
  );
}

export function GoLiveScene() {
  const reduce = useReducedMotion();
  const F = (d: number, dist?: number) => (reduce ? {} : float(d, dist));
  return (
    <svg viewBox="0 0 360 340" className="h-full w-full" role="img" aria-label="Go live and earn">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--violet-500)" />
          <stop offset="1" stopColor="var(--blue-600)" />
        </linearGradient>
      </defs>
      <circle cx="180" cy="180" r="150" fill="var(--primary-subtle)" />
      <Phone>
        <rect x="124" y="64" width="112" height="234" rx="14" fill="url(#lg1)" />
        <circle cx="180" cy="150" r="34" fill="#fff" opacity="0.15" />
        <circle cx="180" cy="150" r="22" fill="#fff" opacity="0.9" />
        <circle cx="180" cy="142" r="8" fill="url(#lg1)" />
        <path d="M166 166 a14 10 0 0 1 28 0z" fill="url(#lg1)" />
        <rect x="134" y="74" width="40" height="16" rx="8" fill="var(--error)" />
        <circle cx="144" cy="82" r="3" fill="#fff" />
        <rect x="152" y="79" width="16" height="6" rx="3" fill="#fff" />
        <rect x="134" y="270" width="92" height="18" rx="9" fill="#fff" opacity="0.2" />
        <rect x="142" y="276" width="50" height="6" rx="3" fill="#fff" opacity="0.8" />
      </Phone>
      {/* hearts */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d="M0 6 l-5 -5 a3.5 3.5 0 0 1 5 -4 a3.5 3.5 0 0 1 5 4z"
          fill={i === 1 ? 'var(--orange-500)' : 'var(--error)'}
          transform={`translate(${222 + i * 14} ${210 - i * 6}) scale(${1.4 + i * 0.2})`}
          initial={{ opacity: 0, y: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0], y: [0, -70] }}
          transition={{ duration: 2.6, delay: i * 0.7, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
      {/* viewers */}
      <motion.g {...F(0.6, 8)}>
        <rect x="18" y="80" width="96" height="40" rx="20" fill="var(--card)" stroke="var(--border)" />
        <circle cx="40" cy="100" r="12" fill="var(--blue-300)" />
        <circle cx="56" cy="100" r="12" fill="var(--orange-300)" stroke="var(--card)" strokeWidth="2" />
        <circle cx="72" cy="100" r="12" fill="var(--violet-500)" stroke="var(--card)" strokeWidth="2" />
        <rect x="88" y="96" width="18" height="8" rx="4" fill="var(--foreground-tertiary)" />
      </motion.g>
      {/* earnings */}
      <motion.g {...F(1.2, 10)}>
        <rect x="236" y="250" width="106" height="60" rx="14" fill="var(--card)" stroke="var(--border)" />
        <rect x="248" y="262" width="40" height="6" rx="3" fill="var(--foreground-tertiary)" />
        <rect x="248" y="276" width="70" height="12" rx="6" fill="var(--success)" />
        <path d="M296 262 l8 -8 8 8" stroke="var(--success)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </motion.g>
      <motion.g {...F(0.2, 6)}>
        <rect x="30" y="220" width="70" height="70" rx="16" fill="var(--orange-500)" />
        <path d="M58 240 v30 l24 -15z" fill="#fff" />
      </motion.g>
    </svg>
  );
}
