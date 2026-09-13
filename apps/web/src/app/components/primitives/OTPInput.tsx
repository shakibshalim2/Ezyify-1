import * as React from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { cn } from '../ui/utils';
import { shake } from '../../lib/motion';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Six-box OTP input driven by a single hidden state string. Supports typing, backspace,
 * arrow navigation, paste of the whole code, and the Android/iOS `one-time-code` autofill.
 * Boxes are 48px so they meet the 44px minimum touch-target guideline.
 */
export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
  disabled = false,
  autoFocus = true,
  className,
  'aria-label': ariaLabel = 'Verification code',
}: OTPInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const controls = useAnimationControls();
  const digits = React.useMemo(
    () => Array.from({ length }, (_, i) => value[i] ?? ''),
    [value, length],
  );

  React.useEffect(() => {
    if (error) void controls.start('shake');
  }, [error, controls]);

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const focusIndex = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    if (raw.length > 1) {
      // Paste or autofill landed in one box: spread across the boxes.
      const merged = (value.slice(0, i) + raw).slice(0, length);
      commit(merged);
      focusIndex(merged.length >= length ? length - 1 : merged.length);
      return;
    }
    const arr = digits.slice();
    arr[i] = raw;
    const merged = arr.join('');
    commit(merged);
    if (i < length - 1) focusIndex(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const arr = digits.slice();
      if (arr[i]) {
        arr[i] = '';
        commit(arr.join(''));
      } else if (i > 0) {
        arr[i - 1] = '';
        commit(arr.join(''));
        focusIndex(i - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusIndex(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusIndex(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    commit(text);
    focusIndex(Math.min(text.replace(/\D/g, '').length, length - 1));
  };

  return (
    <motion.div
      variants={shake}
      animate={controls}
      initial="idle"
      role="group"
      aria-label={ariaLabel}
      className={cn('flex items-center justify-between gap-2', className)}
    >
      {digits.map((d, i) => {
        const filled = d !== '';
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={length}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={error || undefined}
            className={cn(
              'size-12 sm:size-14 rounded-xl border bg-input-background text-center font-display text-2xl font-semibold text-foreground caret-primary',
              'outline-none transition-[border-color,box-shadow,transform,background-color] duration-(--duration-fast)',
              'border-border focus:border-primary focus:bg-background-elevated focus:shadow-[0_0_0_4px_var(--primary-subtle)] focus:scale-[1.04]',
              filled && !error && 'border-primary/60',
              error && 'border-error text-error focus:border-error focus:shadow-[0_0_0_4px_var(--error-subtle)]',
              disabled && 'opacity-60',
            )}
          />
        );
      })}
    </motion.div>
  );
}
