import { Truck, RotateCcw } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { fadeUp } from '../../lib/motion';

interface InfoRowsProps {
  deliveryDays?: string;
  returnDays?: number;
}

export function InfoRows({ deliveryDays = '3-7 business days', returnDays = 30 }: InfoRowsProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: 0.2 }}
      className="space-y-2.5"
    >
      {/* Delivery */}
      <div className="flex items-center gap-3 text-sm">
        <Truck className="size-5 text-foreground-secondary flex-shrink-0" />
        <div>
          <p className="font-semibold text-foreground">Delivery</p>
          <p className="text-foreground-secondary text-xs">Estimated {deliveryDays}</p>
        </div>
      </div>

      {/* Returns */}
      <div className="flex items-center gap-3 text-sm">
        <RotateCcw className="size-5 text-foreground-secondary flex-shrink-0" />
        <div>
          <p className="font-semibold text-foreground">Returns</p>
          <p className="text-foreground-secondary text-xs">Free returns within {returnDays} days</p>
        </div>
      </div>
    </motion.div>
  );
}
