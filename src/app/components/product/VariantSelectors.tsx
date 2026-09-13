import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { fadeUp, springSnappy } from '../../lib/motion';
import { cn } from '../ui/utils';

interface Variant {
  name: string;
  options: string[];
}

interface VariantSelectorsProps {
  variants: Variant[];
  selected: Record<string, string>;
  onSelect: (variantName: string, option: string) => void;
}

export function VariantSelectors({
  variants,
  selected,
  onSelect,
}: VariantSelectorsProps) {
  const reduce = useReducedMotion();

  if (!variants.length) return null;

  return (
    <motion.div
      initial={reduce ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.24 }}
      className="space-y-4"
    >
      {variants.map((variant) => (
        <div key={variant.name}>
          <label className="block text-sm font-semibold text-foreground mb-2.5">
            {variant.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option, idx) => {
              const isSelected = selected[variant.name] === option;
              return (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => onSelect(variant.name, option)}
                  aria-pressed={isSelected}
                  whileTap={reduce ? {} : { scale: 0.95 }}
                  variants={reduce ? {} : fadeUp}
                  initial={reduce ? {} : 'hidden'}
                  animate="visible"
                  transition={reduce ? {} : { delay: idx * 0.04, ...springSnappy }}
                  className={cn(
                    'px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-150',
                    'border-2 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:border-border-strong'
                  )}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
