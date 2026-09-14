import { memo, useId } from 'react';

export type BadgeVariant = 'user' | 'seller';
export type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';

interface VerifiedBadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const SIZE_PX: Record<BadgeSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

// ─── Shape data ───────────────────────────────────────────────────────────────
//
// Scalloped rosette — 10 bumps, computed via smooth quadratic Bézier midpoints.
// White backing (R=11.6, r=9.6) sits behind the blue badge (R=10.5, r=8.5),
// creating a ~1px visible border that ensures contrast on any background.
//
const WHITE_ROSETTE =
  'M 10.52,1.63 Q 12.00,0.40 13.48,1.63 Q 14.97,2.87 16.89,2.74' +
  ' Q 18.82,2.62 19.29,4.49 Q 19.77,6.36 21.40,7.39 Q 23.03,8.42 22.32,10.21' +
  ' Q 21.60,12.00 22.32,13.79 Q 23.03,15.58 21.40,16.61 Q 19.77,17.64 19.29,19.51' +
  ' Q 18.82,21.38 16.89,21.26 Q 14.97,21.13 13.48,22.37 Q 12.00,23.60 10.52,22.37' +
  ' Q 9.03,21.13 7.11,21.26 Q 5.18,21.38 4.71,19.51 Q 4.23,17.64 2.60,16.61' +
  ' Q 0.97,15.58 1.68,13.79 Q 2.40,12.00 1.68,10.21 Q 0.97,8.42 2.60,7.39' +
  ' Q 4.23,6.36 4.71,4.49 Q 5.18,2.62 7.11,2.74 Q 9.03,2.87 10.52,1.63 Z';

const BLUE_ROSETTE =
  'M 10.69,2.71 Q 12.00,1.50 13.31,2.71 Q 14.63,3.92 16.40,3.71' +
  ' Q 18.17,3.51 18.52,5.25 Q 18.88,7.00 20.43,7.88 Q 21.99,8.76 21.24,10.38' +
  ' Q 20.50,12.00 21.24,13.62 Q 21.99,15.24 20.43,16.12 Q 18.88,17.00 18.52,18.75' +
  ' Q 18.17,20.49 16.40,20.29 Q 14.63,20.08 13.31,21.29 Q 12.00,22.50 10.69,21.29' +
  ' Q 9.37,20.08 7.60,20.29 Q 5.83,20.49 5.48,18.75 Q 5.12,17.00 3.57,16.12' +
  ' Q 2.01,15.24 2.76,13.62 Q 3.50,12.00 2.76,10.38 Q 2.01,8.76 3.57,7.88' +
  ' Q 5.12,7.00 5.48,5.25 Q 5.83,3.51 7.60,3.71 Q 9.37,3.92 10.69,2.71 Z';

// ─── Unified Verification Badge ───────────────────────────────────────────────
//
//  USER:    scalloped blue rosette  +  white checkmark
//  SELLER:  same badge              +  small orange commerce dot (bottom-right)
//
//  Design principles:
//  • One badge system — seller is an enhanced user badge, not a different shape
//  • Blue rosette = primary verification symbol across the entire platform
//  • Orange dot = commerce identity marker; never competes with the badge
//  • White backing rosette ensures visibility on dark, colored, or image bgs
//  • 3D depth via radial gradient (lighter top-left) + subtle highlight overlay
//
export const VerifiedBadge = memo(function VerifiedBadge({
  variant = 'user',
  size = 'md',
  className = '',
}: VerifiedBadgeProps) {
  // Stable unique ID per instance — prevents gradient ID collisions when
  // many badges render simultaneously on the same page.
  const uid = useId().replace(/:/g, '');

  const px = SIZE_PX[size];
  const isSeller = variant === 'seller';

  // Gradient / filter IDs
  const fillId   = `vb-f-${uid}`;  // main badge fill
  const hlId     = `vb-h-${uid}`;  // top-left highlight overlay
  const glowId   = `vb-g-${uid}`;  // drop shadow filter
  const dotFillId = `vb-d-${uid}`; // orange dot fill (seller)
  const dotGlowId = `vb-e-${uid}`; // orange dot shadow (seller)

  // Checkmark stroke scales with pixel size for crisp rendering at every size
  const strokeW = px <= 14 ? 2 : px <= 16 ? 2.1 : px <= 20 ? 2.3 : 2.5;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-flex flex-shrink-0 ${className}`}
      aria-label={isSeller ? 'Verified seller' : 'Verified user'}
      role="img"
    >
      <defs>
        {/* ── Blue badge gradient ──────────────────────────────────────────
             Radial gradient centered top-left creates a 3D dimensional feel.
             From bright sky-blue at the source to rich Ezyify brand blue.   */}
        <radialGradient id={fillId} cx="30%" cy="22%" r="75%">
          <stop offset="0%"   stopColor="#6b9cf8" />
          <stop offset="45%"  stopColor="#4f6ef7" />
          <stop offset="100%" stopColor="#3350cc" />
        </radialGradient>

        {/* ── Top-left highlight overlay ───────────────────────────────────
             Simulates light reflection for a premium glossy depth effect.   */}
        <radialGradient id={hlId} cx="28%" cy="18%" r="55%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
          <stop offset="100%" stopColor="white" stopOpacity="0"    />
        </radialGradient>

        {/* ── Badge drop shadow ────────────────────────────────────────────
             Subtle blue-tinted shadow lifts the badge off any background.   */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0" dy="0.8"
            stdDeviation="0.9"
            floodColor="#2e4ac0"
            floodOpacity="0.35"
          />
        </filter>

        {/* ── Orange dot fill (seller only) ───────────────────────────────
             Radial gradient gives the dot subtle 3D depth.                 */}
        {isSeller && (
          <radialGradient id={dotFillId} cx="35%" cy="28%" r="68%">
            <stop offset="0%"   stopColor="#fdba74" />
            <stop offset="55%"  stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        )}

        {/* ── Orange dot glow filter (seller only) ────────────────────────  */}
        {isSeller && (
          <filter id={dotGlowId} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0" dy="0.3"
              stdDeviation="0.7"
              floodColor="#c2410c"
              floodOpacity="0.35"
            />
          </filter>
        )}
      </defs>

      {/* ── 1. White backing rosette ─────────────────────────────────────────
           Slightly larger than the badge (R=11.6 vs R=10.5). Creates a clean
           ~1px white border that ensures visibility on any background color. */}
      <path d={WHITE_ROSETTE} fill="white" />

      {/* ── 2. Blue rosette badge ────────────────────────────────────────────
           The primary verification shape. Consistent across user and seller.
           Scalloped 10-bump rosette — premium, original, globally readable.  */}
      <path
        d={BLUE_ROSETTE}
        fill={`url(#${fillId})`}
        filter={`url(#${glowId})`}
      />

      {/* ── 3. Highlight overlay ─────────────────────────────────────────────
           Radial white gradient from top-left creates the glossy depth effect
           seen in premium badge designs. Rendered over the blue fill.        */}
      <path d={BLUE_ROSETTE} fill={`url(#${hlId})`} />

      {/* ── 4. White checkmark ───────────────────────────────────────────────
           Bold, clean, rounded-cap stroke. Universal verification symbol.
           Stroke weight is proportional to the rendered pixel size.          */}
      <path
        d="M7.5 12.5L10.5 15.5L16.5 8.5"
        stroke="white"
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── 5. Orange commerce dot (seller only) ────────────────────────────
           Positioned at bottom-right (17.5, 17.5) — inside the badge body.
           White separator ring (r=3.5) cleanly isolates dot from blue fill.
           Orange dot (r=2.5) with radial gradient for premium depth.
           This is a secondary identity signal. The blue badge remains primary. */}
      {isSeller && (
        <>
          <circle cx="17.5" cy="17.5" r="3.5" fill="white" />
          <circle
            cx="17.5"
            cy="17.5"
            r="2.5"
            fill={`url(#${dotFillId})`}
            filter={`url(#${dotGlowId})`}
          />
        </>
      )}
    </svg>
  );
});
