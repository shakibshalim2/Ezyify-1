import { cn } from '../ui/utils';

/** Shimmering placeholder; respects reduced motion via the global keyframe guard. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative overflow-hidden rounded-lg bg-muted',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-[skeleton-shimmer_1.6s_ease-in-out_infinite]',
        'after:bg-gradient-to-r after:from-transparent after:via-foreground/8 after:to-transparent',
        className,
      )}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
