import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../ui/utils';

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'number', label: 'One number', test: (v: string) => /\d/.test(v) },
  { id: 'symbol', label: 'One symbol', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export function passwordScore(value: string) {
  return PASSWORD_RULES.reduce((n, r) => n + (r.test(value) ? 1 : 0), 0);
}

export function isStrongPassword(value: string) {
  return passwordScore(value) === PASSWORD_RULES.length;
}

const LEVELS = [
  { label: '', color: 'bg-border' },
  { label: 'Weak', color: 'bg-error' },
  { label: 'Fair', color: 'bg-warning' },
  { label: 'Good', color: 'bg-info' },
  { label: 'Strong', color: 'bg-success' },
];

export function PasswordStrength({ value, className }: { value: string; className?: string }) {
  const score = passwordScore(value);
  const level = LEVELS[score];
  if (!value) return null;
  return (
    <div className={cn('space-y-2', className)} aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1" aria-hidden>
          {LEVELS.slice(1).map((_, i) => (
            <motion.span
              key={i}
              initial={false}
              animate={{ opacity: i < score ? 1 : 0.25 }}
              transition={{ duration: 0.2 }}
              className={cn('h-1.5 flex-1 rounded-full', i < score ? level.color : 'bg-border')}
            />
          ))}
        </div>
        <span
          className={cn(
            'w-12 text-right text-xs font-medium',
            score <= 1 && 'text-error',
            score === 2 && 'text-warning',
            score === 3 && 'text-info',
            score === 4 && 'text-success',
          )}
        >
          {level.label}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(value);
          return (
            <li
              key={rule.id}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                ok ? 'text-success' : 'text-foreground-tertiary',
              )}
            >
              <motion.span
                key={ok ? 'ok' : 'no'}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="inline-flex"
              >
                {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              </motion.span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
