import { Shield } from 'lucide-react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Card } from '../ui/card';
import { fadeUp } from '../../lib/motion';

export function EscrowCard() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: 0.15 }}
    >
      <Card className="p-4 space-y-2 border-success/30 bg-success-subtle/20">
        <div className="flex items-start gap-3">
          <Shield className="size-5 text-success flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight mb-1">
              Payment Protection
            </p>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Your payment is held in escrow until delivery is confirmed.{' '}
              <Link
                to="/payment-guide"
                className="text-primary font-medium hover:underline"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
