import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { springSnappy } from '../../lib/motion';

interface DescriptionSectionProps {
  description: string;
  maxHeight?: number;
}

export function DescriptionSection({
  description,
  maxHeight = 120,
}: DescriptionSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const reduce = useReducedMotion();
  const shouldCollapse = description.length > 200;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold text-foreground">About this item</h3>
      <motion.div
        animate={{ maxHeight: expanded || !shouldCollapse ? 'auto' : maxHeight }}
        transition={reduce ? {} : { duration: 0.3, type: 'spring', damping: 25 }}
        className="overflow-hidden text-sm text-foreground-secondary leading-relaxed"
      >
        <p>{description}</p>
      </motion.div>
      {shouldCollapse && (
        <motion.button
          type="button"
          onClick={() => setExpanded(!expanded)}
          whileTap={reduce ? {} : { scale: 0.95 }}
          transition={springSnappy}
          className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5"
        >
          {expanded ? 'Show less' : 'Read more'}
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="size-4" />
          </motion.span>
        </motion.button>
      )}
    </div>
  );
}
