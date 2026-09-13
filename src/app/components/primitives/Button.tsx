import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

export const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap select-none tap-highlight-none',
    'font-semibold transition-[transform,background-color,box-shadow,color,opacity] duration-(--duration-fast) ease-(--ease-standard)',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-brand hover:bg-primary-hover hover:shadow-brand-lg',
        gradient: 'bg-brand-gradient text-white shadow-brand hover:shadow-brand-lg hover:brightness-110',
        accent:
          'bg-accent-brand text-accent-brand-foreground shadow-orange hover:bg-accent-brand-hover',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-muted',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-muted hover:border-border-strong',
        ghost: 'text-foreground hover:bg-muted',
        link: 'text-primary underline-offset-4 hover:underline h-auto px-0',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 rounded-lg px-3 text-sm',
        md: 'h-11 rounded-xl px-4 text-sm',
        lg: 'h-12 rounded-xl px-6 text-base',
        xl: 'h-14 rounded-2xl px-8 text-base',
        icon: 'size-11 rounded-xl',
        'icon-sm': 'size-9 rounded-lg',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        data-slot="button"
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
