import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Textarea } from '../../components/ui/textarea';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { fadeUp, staggerContainer } from '../../lib/motion';

const refundReasons = [
  { id: 'defective', label: 'Defective or damaged product' },
  { id: 'wrong', label: 'Wrong item received' },
  { id: 'description', label: 'Product not as described' },
  { id: 'quality', label: 'Poor quality' },
  { id: 'size', label: 'Wrong size/fit' },
  { id: 'other', label: 'Other reason' }
];

export default function RefundRequestPage() {
  const reduce = useReducedMotion();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-12345';
  const navigate = useNavigate();
  const [step, setStep] = useState<'select-items' | 'reason' | 'evidence' | 'review'>(
    'select-items'
  );
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const mockOrder = {
    id: orderId,
    items: [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
        price: 79.99,
        quantity: 1
      },
      {
        id: '2',
        name: 'Phone Case',
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200',
        price: 15.99,
        quantity: 2
      }
    ],
    orderDate: '2026-01-08',
    deliveredDate: '2026-01-10',
    refundEligible: true,
    refundDeadline: '2026-01-17'
  };

  const handleSubmitRefund = () => {
    if (!selectedReason || !description || !agreedToTerms) {
      toast.error('Please complete all required fields');
      return;
    }
    const refundId = `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    navigate(`/orders/refund-status/${refundId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Request Refund — Ezyify" description="Submit a refund request for your Ezyify order." />

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
            <Link to={orderId ? `/user/order-tracking/${orderId}` : '/user/orders'}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-semibold text-foreground">Request Refund</h1>
            <p className="text-xs text-foreground-secondary">Order #{mockOrder.id}</p>
          </div>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div variants={fadeUp} className="flex gap-2">
          {(['select-items', 'reason', 'evidence', 'review'] as const).map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  ['select-items', 'reason', 'evidence', 'review'].indexOf(step) >= idx
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground'
                }`}
              >
                {['select-items', 'reason', 'evidence', 'review'].indexOf(step) > idx ? (
                  <CheckCircle className="size-5" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < 3 && <div className="h-0.5 w-8 bg-border" />}
            </div>
          ))}
        </motion.div>

        {/* Eligibility Alert */}
        {mockOrder.refundEligible ? (
          <motion.div variants={fadeUp}>
            <Card variant="ghost" className="bg-success-subtle border border-success/20 p-4">
              <div className="flex gap-3">
                <CheckCircle className="size-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-success">This order is eligible for refund</p>
                  <p className="text-xs text-success/70">Request before {mockOrder.refundDeadline}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp}>
            <Card variant="ghost" className="bg-error-subtle border border-error/20 p-4">
              <div className="flex gap-3">
                <AlertCircle className="size-5 text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-error">Refund period expired</p>
                  <p className="text-xs text-error/70">This order is no longer eligible for refund</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Escrow Protection Notice */}
        <motion.div variants={fadeUp}>
          <Card variant="ghost" className="bg-info-subtle border border-info/20 p-4">
            <div className="flex gap-3">
              <Shield className="size-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-info">Buyer Protection Active</p>
                <p className="text-xs text-info/70">
                  Your payment is held securely in escrow. Submitting a refund request will freeze the escrow until resolved.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Step Content */}
        {step === 'select-items' && (
          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Select Items to Refund</h3>
            <Card>
              <div className="p-4 space-y-3">
                {mockOrder.items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-card-hover cursor-pointer transition-colors border border-border"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="size-4 rounded"
                    />
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="size-12 rounded-lg object-cover bg-card flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-foreground-secondary">
                        Qty: {item.quantity} • ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
            <Button
              variant="gradient"
              fullWidth
              onClick={() => setStep('reason')}
              className="shadow-brand"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 'reason' && (
          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">What's the issue?</h3>
            <Card>
              <div className="p-4 space-y-2">
                {refundReasons.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedReason === reason.id
                        ? 'border-primary bg-primary-subtle'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="size-4"
                    />
                    <span className="text-sm font-medium text-foreground">{reason.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Describe the issue</label>
              <Textarea
                placeholder="Please provide detailed information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setStep('select-items')}
              >
                Back
              </Button>
              <Button
                variant="gradient"
                fullWidth
                disabled={!selectedReason || !description}
                onClick={() => setStep('evidence')}
                className="shadow-brand"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'evidence' && (
          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Add Evidence (Optional)</h3>
            <Card variant="ghost" className="border-2 border-dashed border-border p-6 text-center space-y-2">
              <Upload className="size-8 text-primary-subtle mx-auto" />
              <p className="text-sm font-medium text-foreground">Upload photos or videos</p>
              <p className="text-xs text-foreground-secondary">
                PNG, JPG, or MP4 up to 10MB each
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.info('File upload coming soon')}
              >
                Choose Files
              </Button>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setStep('reason')}
              >
                Back
              </Button>
              <Button
                variant="gradient"
                fullWidth
                onClick={() => setStep('review')}
                className="shadow-brand"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Review & Submit</h3>

            <Card>
              <div className="p-4 space-y-4">
                <div className="border-b border-border pb-4">
                  <p className="text-xs font-semibold text-foreground-secondary mb-2">REASON</p>
                  <p className="text-sm text-foreground">
                    {refundReasons.find(r => r.id === selectedReason)?.label}
                  </p>
                </div>

                <div className="border-b border-border pb-4">
                  <p className="text-xs font-semibold text-foreground-secondary mb-2">DETAILS</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{description}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground-secondary mb-2">REFUND AMOUNT</p>
                  <p className="text-2xl font-display font-bold text-accent-brand">
                    ${mockOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-card transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="size-4 mt-1 flex-shrink-0"
              />
              <span className="text-xs text-foreground-secondary">
                I confirm that all information is accurate and agree to the refund policy. False claims may result in account suspension.
              </span>
            </label>

            <div className="flex gap-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setStep('reason')}
              >
                Back
              </Button>
              <Button
                variant="gradient"
                fullWidth
                disabled={!agreedToTerms}
                onClick={handleSubmitRefund}
                className="shadow-brand"
              >
                Submit Request
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
