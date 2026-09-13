import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, MessageCircle, Package, Shield } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { fadeUp, staggerContainer } from '../../lib/motion';

type RefundStatus = 'submitted' | 'under-review' | 'approved' | 'rejected' | 'completed';

interface TimelineEvent {
  status: string;
  date: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
}

export default function RefundStatusPage() {
  const reduce = useReducedMotion();
  const { refundId } = useParams();

  const mockRefund = {
    id: refundId || 'REF-ABC123DEF',
    orderId: 'EZY-12345678',
    status: 'under-review' as RefundStatus,
    requestedAmount: 79.99,
    reason: 'Product not as described',
    requestDate: 'Jan 10, 2026',
    estimatedResolution: 'Jan 15-17, 2026',
    timeline: [
      {
        status: 'Refund Requested',
        date: 'Jan 10, 2026, 2:30 PM',
        description: 'Your refund request has been submitted successfully',
        completed: true,
        icon: <Package className="size-5" />
      },
      {
        status: 'Under Review',
        date: 'Jan 11, 2026, 10:15 AM',
        description: 'Our team is reviewing your refund request',
        completed: true,
        icon: <Clock className="size-5" />
      },
      {
        status: 'Seller Response',
        date: '',
        description: 'Waiting for seller response (if required)',
        completed: false,
        icon: <MessageCircle className="size-5" />
      },
      {
        status: 'Resolution',
        date: '',
        description: 'Final decision will be communicated',
        completed: false,
        icon: <CheckCircle className="size-5" />
      },
      {
        status: 'Refund Processed',
        date: '',
        description: 'Amount credited to your Ezyify Wallet',
        completed: false,
        icon: <CheckCircle className="size-5" />
      }
    ]
  };

  const getStatusColor = () => {
    switch (mockRefund.status) {
      case 'submitted':
        return 'bg-info-subtle text-info';
      case 'under-review':
        return 'bg-warning-subtle text-warning';
      case 'approved':
      case 'completed':
        return 'bg-success-subtle text-success';
      case 'rejected':
        return 'bg-error-subtle text-error';
    }
  };

  const getStatusLabel = () => {
    return {
      submitted: 'Submitted',
      'under-review': 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed'
    }[mockRefund.status];
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`Refund ${refundId} - Status`} description="Check the status of your refund request." />

      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05, 0)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            asChild
          >
            <Link to="/user/refund-history">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-semibold text-foreground">Refund Status</h1>
            <p className="text-xs text-foreground-secondary">ID: {mockRefund.id}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
            {getStatusLabel()}
          </div>
        </motion.div>

        {/* Escrow Protection Alert */}
        <motion.div variants={fadeUp}>
          <Card variant="ghost" className="bg-info-subtle border border-info/20 p-4">
            <div className="flex gap-3">
              <Shield className="size-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-info text-sm">Escrow Protected</p>
                <p className="text-xs text-info/70">
                  Your payment is frozen in escrow. No funds released until resolved.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Status Hero Card */}
        <motion.div variants={fadeUp}>
          <Card className="bg-brand-gradient text-white overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="size-6" />
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-sm mb-1">Refund Under Review</p>
                  <p className="font-semibold">Est. resolution: {mockRefund.estimatedResolution}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/20">
                <p className="text-sm text-white/80">Amount: <span className="font-semibold">${mockRefund.requestedAmount.toFixed(2)}</span></p>
                <p className="text-xs text-white/70 mt-1">Order: {mockRefund.orderId}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-6">
              <h3 className="font-display font-semibold text-foreground">Progress</h3>

              <div className="space-y-0">
                {mockRefund.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          event.completed
                            ? 'bg-success-subtle text-success'
                            : 'bg-card border-2 border-border text-foreground-secondary'
                        }`}
                      >
                        {event.icon}
                      </div>
                      {idx < mockRefund.timeline.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 my-2 ${
                            event.completed ? 'bg-success/40' : 'bg-border'
                          }`}
                          style={{ minHeight: '32px' }}
                        />
                      )}
                    </div>

                    <div className="flex-1 pb-6 last:pb-0">
                      <h4 className={`font-semibold text-sm ${
                        event.completed ? 'text-success' : 'text-foreground'
                      }`}>
                        {event.status}
                      </h4>
                      <p className="text-xs text-foreground-secondary mt-0.5">{event.description}</p>
                      {event.date && <p className="text-xs text-foreground-tertiary mt-1">{event.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* What Happens Next */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-3">
              <h3 className="font-display font-semibold text-foreground">What Happens Next?</h3>
              <div className="space-y-2">
                {[
                  'Our team reviews your request and evidence',
                  'Seller may be contacted for their response',
                  'Decision communicated within 3-5 business days',
                  'If approved, amount credited to your Ezyify Wallet'
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <CheckCircle className="size-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground-secondary">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<MessageCircle className="size-4" />}
            onClick={() => alert('Contact support feature coming soon')}
          >
            Contact Support
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
