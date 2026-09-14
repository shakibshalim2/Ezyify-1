import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { CheckCircle, Clock, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { fadeUp, staggerContainer } from '../../lib/motion';

interface Refund {
  id: string;
  orderId: string;
  amount: number;
  status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'completed';
  reason: string;
  requestDate: string;
  resolvedDate?: string;
}

const mockRefunds: Refund[] = [
  {
    id: 'REF-ABC123DEF',
    orderId: 'EZY-12345678',
    amount: 79.99,
    status: 'completed',
    reason: 'Product not as described',
    requestDate: 'Jan 10, 2026',
    resolvedDate: 'Jan 13, 2026'
  },
  {
    id: 'REF-GHI456JKL',
    orderId: 'EZY-12345679',
    amount: 45.50,
    status: 'under-review',
    reason: 'Damaged item',
    requestDate: 'Jan 12, 2026'
  }
];

function RefundHistorySkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6">
        <Skeleton className="h-10 w-40" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RefundHistoryPage() {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [refunds, setRefunds] = useState<Refund[]>([]);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => {
        setRefunds(mockRefunds);
        setIsLoading(false);
      }, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => {
        setRefunds(mockRefunds);
        setIsLoading(false);
      }, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  const getStatusIcon = (status: Refund['status']) => {
    switch (status) {
      case 'submitted':
      case 'under-review':
        return <Clock className="size-5" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="size-5" />;
      case 'rejected':
        return <XCircle className="size-5" />;
    }
  };

  const getStatusColor = (status: Refund['status']) => {
    switch (status) {
      case 'submitted':
      case 'under-review':
        return 'bg-warning-subtle text-warning';
      case 'approved':
      case 'completed':
        return 'bg-success-subtle text-success';
      case 'rejected':
        return 'bg-error-subtle text-error';
    }
  };

  const getStatusLabel = (status: Refund['status']) => {
    return {
      submitted: 'Submitted',
      'under-review': 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed'
    }[status];
  };

  if (isLoading) {
    return <RefundHistorySkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Refund History - Ezyify" description="View your refund request history" />

      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05, 0)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-foreground">Refund History</h1>
          <p className="text-sm text-foreground-secondary">Track your refund requests and their status</p>
        </motion.div>

        {/* Refunds List */}
        {refunds.length === 0 ? (
          <motion.div variants={fadeUp}>
            <Card variant="ghost" className="py-12 text-center">
              <p className="text-foreground-secondary">No refund requests yet</p>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} className="space-y-4">
            {refunds.map((refund) => (
              <motion.div key={refund.id} variants={fadeUp}>
                <Card variant="elevated" interactive>
                  <Link to={`/orders/refund-status/${refund.id}`} className="block p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold text-foreground">#{refund.id}</h3>
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(refund.status)}`}>
                            {getStatusIcon(refund.status)}
                            {getStatusLabel(refund.status)}
                          </div>
                        </div>
                        <p className="text-xs text-foreground-secondary">Order: {refund.orderId}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display font-bold text-lg text-accent-brand tabular-nums">
                          ${refund.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <p className="text-xs text-foreground-secondary">{refund.reason}</p>
                      <div className="flex items-center justify-between text-xs text-foreground-tertiary">
                        <span>Requested: {refund.requestDate}</span>
                        {refund.resolvedDate && <span>Resolved: {refund.resolvedDate}</span>}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      rightIcon={<ArrowRight className="size-3" />}
                    >
                      View Details
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
