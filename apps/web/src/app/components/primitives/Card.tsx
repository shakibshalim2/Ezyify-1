import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

export const cardVariants = cva('rounded-card text-card-foreground transition-[box-shadow,border-color,transform]', {
  variants: {
    variant: {
      default: 'border border-border bg-card',
      elevated: 'bg-background-elevated shadow-md ring-1 ring-border/50',
      featured: 'border border-primary/30 bg-gradient-to-br from-primary-subtle to-card shadow-brand',
      ghost: 'bg-transparent',
      outline: 'border border-border-strong bg-transparent',
    },
    padding: { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' },
    interactive: {
      true: 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md tap-highlight-none',
      false: '',
    },
  },
  defaultVariants: { variant: 'default', padding: 'md', interactive: false },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding, interactive }), className)} {...props} />
  ),
);
Card.displayName = 'Card';

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-3 flex items-start justify-between gap-3', className)} {...props} />;
}
export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-display text-lg font-semibold leading-tight', className)} {...props}>
      {children}
    </h3>
  );
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-foreground-secondary', className)} {...props} />;
}
