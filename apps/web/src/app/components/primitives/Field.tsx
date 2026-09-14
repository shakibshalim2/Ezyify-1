import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { cn } from '../ui/utils';
import { fadeUp } from '../../lib/motion';

type Status = 'idle' | 'error' | 'success';

export interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  hint?: string;
  error?: string;
  /** `true` shows the success state without a message. */
  success?: string | boolean;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  /** Hide the visible label but keep it for screen readers. */
  hideLabel?: boolean;
  containerClassName?: string;
}

/**
 * Accessible text field: label is bound via `htmlFor`, error/hint are announced via
 * `aria-describedby`, validation state drives border colour + trailing icon, and the
 * password variant gets a built-in show/hide toggle.
 */
export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  (
    {
      id,
      label,
      hint,
      error,
      success,
      leftIcon,
      rightSlot,
      hideLabel,
      className,
      containerClassName,
      type = 'text',
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? `field-${reactId}`;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const status: Status = error ? 'error' : success ? 'success' : 'idle';
    const successMessage = typeof success === 'string' ? success : undefined;
    const message = error ?? successMessage ?? hint;

    return (
      <div className={cn('group flex flex-col gap-1.5', containerClassName)}>
        <label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium text-foreground',
            hideLabel && 'sr-only',
            disabled && 'opacity-60',
          )}
        >
          {label}
        </label>
        <div className="relative">
          {leftIcon && (
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary transition-colors',
                'group-focus-within:text-primary',
                status === 'error' && 'text-error group-focus-within:text-error',
              )}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            disabled={disabled}
            aria-invalid={status === 'error' || undefined}
            aria-describedby={error ? errorId : message ? hintId : undefined}
            className={cn(
              'peer h-12 w-full rounded-xl border bg-input-background text-base text-foreground',
              'placeholder:text-foreground-tertiary outline-none transition-[border-color,box-shadow,background-color] duration-(--duration-fast)',
              'border-border hover:border-border-strong',
              'focus:border-primary focus:bg-background-elevated focus:shadow-[0_0_0_4px_var(--primary-subtle)]',
              'disabled:cursor-not-allowed disabled:opacity-60',
              leftIcon ? 'pl-11' : 'pl-4',
              isPassword || rightSlot || status !== 'idle' ? 'pr-12' : 'pr-4',
              status === 'error' &&
                'border-error focus:border-error focus:shadow-[0_0_0_4px_var(--error-subtle)]',
              status === 'success' && 'border-success focus:border-success',
              className,
            )}
            {...props}
          />
          <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {status === 'success' && !isPassword && (
              <CheckCircle2 aria-hidden className="size-5 text-success" />
            )}
            {status === 'error' && !isPassword && (
              <AlertCircle aria-hidden className="size-5 text-error" />
            )}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="flex size-10 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            )}
            {rightSlot}
          </span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {message && (
            <motion.p
              key={`${status}-${message}`}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              id={error ? errorId : hintId}
              role={error ? 'alert' : undefined}
              className={cn(
                'flex items-start gap-1.5 text-xs leading-snug',
                status === 'error' && 'text-error',
                status === 'success' && 'text-success',
                status === 'idle' && 'text-foreground-secondary',
              )}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
Field.displayName = 'Field';
