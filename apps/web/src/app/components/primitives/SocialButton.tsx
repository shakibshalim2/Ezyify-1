import * as React from 'react';
import { cn } from '../ui/utils';

type Provider = 'google' | 'apple' | 'facebook';

const LABELS: Record<Provider, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
  facebook: 'Continue with Facebook',
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46a5.53 5.53 0 0 1-2.4 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3a7.2 7.2 0 0 1-10.72-3.78H1.34v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.34 14.31A7.2 7.2 0 0 1 4.96 12c0-.8.14-1.58.38-2.31V6.6H1.34A12 12 0 0 0 0 12c0 1.94.46 3.77 1.34 5.4l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.34 6.6l4 3.09A7.17 7.17 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
      <path d="M16.37 12.74c.03 2.93 2.57 3.9 2.6 3.92-.02.07-.4 1.4-1.34 2.76-.8 1.18-1.64 2.35-2.96 2.38-1.3.02-1.71-.77-3.19-.77-1.49 0-1.95.74-3.18.8-1.27.04-2.24-1.28-3.05-2.45C3.6 17 2.32 12.6 4.02 9.65a4.72 4.72 0 0 1 3.98-2.42c1.25-.02 2.43.84 3.19.84.76 0 2.2-1.04 3.7-.89.63.03 2.4.26 3.54 1.92-.09.06-2.11 1.24-2.06 3.64ZM13.9 5.6c.67-.82 1.13-1.95 1-3.09-.97.04-2.15.65-2.85 1.46-.62.72-1.17 1.88-1.02 2.98 1.08.09 2.19-.55 2.87-1.35Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3.01 1.8-4.67 4.54-4.67 1.31 0 2.68.23 2.68.23v2.96h-1.51c-1.49 0-1.96.93-1.96 1.87V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12Z"
      />
    </svg>
  );
}

const ICONS: Record<Provider, () => React.JSX.Element> = {
  google: GoogleIcon,
  apple: AppleIcon,
  facebook: FacebookIcon,
};

export interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: Provider;
  /** Icon-only compact variant for a horizontal row. */
  compact?: boolean;
}

export function SocialButton({ provider, compact = false, className, ...props }: SocialButtonProps) {
  const Icon = ICONS[provider];
  const label = LABELS[provider];
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-3 rounded-xl border border-border bg-background-elevated text-sm font-medium text-foreground tap-highlight-none',
        'transition-[background-color,border-color,transform,box-shadow] duration-(--duration-fast) ease-(--ease-standard)',
        'hover:border-border-strong hover:bg-muted hover:shadow-sm active:scale-[0.97]',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        compact ? 'w-full px-0' : 'w-full px-4',
        className,
      )}
      {...props}
    >
      <Icon />
      {!compact && <span>{label}</span>}
    </button>
  );
}
