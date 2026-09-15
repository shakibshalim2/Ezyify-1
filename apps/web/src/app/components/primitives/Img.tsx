import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { cn } from '../ui/utils';

/** Token-coloured placeholder glyph shown when a remote image 404s; no network round-trip. */
const FALLBACK_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none" stroke="#8b93a1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">` +
      `<rect x="14" y="18" width="68" height="60" rx="10" opacity="0.8"/><circle cx="36" cy="40" r="7" opacity="0.8"/><path d="M14 66l20-20 14 14 12-12 22 22" opacity="0.8"/></svg>`,
  );

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Shown instead of the glyph when the source fails (e.g. an initials avatar). */
  fallbackSrc?: string;
}

/**
 * `<img>` with a graceful failure state: swaps to `fallbackSrc` or a muted glyph and keeps the box
 * from collapsing. Use for every remote product / UGC / avatar image.
 */
export function Img({ src, fallbackSrc, className, alt = '', onError, ...rest }: ImgProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (failed || !src) {
    return fallbackSrc ? (
      <img src={fallbackSrc} alt={alt} className={className} {...rest} />
    ) : (
      <span role="img" aria-label={alt || undefined} className={cn('inline-flex items-center justify-center bg-muted', className)}>
        <img src={FALLBACK_SVG} alt="" className="size-1/3 max-h-12 max-w-12 opacity-70" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={e => {
        setFailed(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
}
