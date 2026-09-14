import { cn } from '../ui/utils';

interface BrandMarkProps {
  size?: number;
  className?: string;
  /** Render the glyph only (no blue disc) for use on brand-colored surfaces. */
  bare?: boolean;
  title?: string;
}

/**
 * Vector rebuild of the Ezyify logo (three rounded bars + orange dot on a blue disc).
 * Scales crisply for splash, nav, favicons and can be animated per-path via `data-part`.
 */
export function BrandMark({ size = 40, className, bare = false, title = 'Ezyify' }: BrandMarkProps) {
  const barFill = bare ? 'currentColor' : '#FFFFFF';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      className={cn('shrink-0', className)}
    >
      {!bare && <circle cx="50" cy="50" r="50" fill="var(--blue-600, #0F66C7)" data-part="disc" />}
      <path
        data-part="bar-top"
        fill={barFill}
        d="M35.5 14H64.5A6.5 6.5 0 0 1 64.5 27H29V20.5A6.5 6.5 0 0 1 35.5 14Z"
      />
      <path
        data-part="bar-mid"
        fill="var(--orange-500, #FF6F22)"
        d="M29 33H59.5A6.5 6.5 0 0 1 59.5 46H29Z"
      />
      <path
        data-part="bar-bottom"
        fill={barFill}
        d="M29 52H64.5A6.5 6.5 0 0 1 64.5 65H35.5A6.5 6.5 0 0 1 29 58.5Z"
      />
      <circle data-part="dot" cx="50" cy="78" r="8" fill="var(--orange-500, #FF6F22)" />
    </svg>
  );
}

export function BrandWordmark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn('font-display font-bold tracking-tight text-foreground', className)}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      Ezy<span className="text-primary">ify</span>
    </span>
  );
}
