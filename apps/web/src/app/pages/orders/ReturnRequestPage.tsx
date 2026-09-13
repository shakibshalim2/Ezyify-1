import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { fadeUp, staggerContainer } from '../../lib/motion';

export default function ReturnRequestPage() {
  const reduce = useReducedMotion();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'review'>('info');
  const [reason, setReason] = useState('');
  const [address, setAddress] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (!reason || !address || !agreed) {
      toast.error('Please complete all fields');
      return;
    }
    const returnId = `RET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    toast.success('Return request submitted');
    navigate(`/user/orders`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Request Return — Ezyify" description="Submit a return request for your order." />

      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05, 0)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back" asChild>
            <Link to="/user/orders">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="font-display text-xl font-semibold text-foreground">Request Return</h1>
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2">
          {(['info', 'review'] as const).map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`size-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  ['info', 'review'].indexOf(step) >= idx
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                {['info', 'review'].indexOf(step) > idx ? <CheckCircle className="size-5" /> : idx + 1}
              </div>
              {idx < 1 && <div className="h-0.5 w-8 bg-border" />}
            </div>
          ))}
        </motion.div>

        {step === 'info' && (
          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Return Details</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason for Return</label>
              <Textarea
                placeholder="Why are you returning this item?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Return Address</label>
              <Textarea
                placeholder="Where should we send the return label?"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              variant="gradient"
              fullWidth
              disabled={!reason || !address}
              onClick={() => setStep('review')}
              className="shadow-brand"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div variants={fadeUp} className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Review & Submit</h3>

            <Card>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-foreground-secondary mb-2">REASON</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{reason}</p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold text-foreground-secondary mb-2">RETURN ADDRESS</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{address}</p>
                </div>
              </div>
            </Card>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-card cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="size-4 mt-1 flex-shrink-0"
              />
              <span className="text-xs text-foreground-secondary">
                I agree to return the item in original condition and accept the return policy terms.
              </span>
            </label>

            <div className="flex gap-2">
              <Button variant="outline" fullWidth onClick={() => setStep('info')}>
                Back
              </Button>
              <Button
                variant="gradient"
                fullWidth
                disabled={!agreed}
                onClick={handleSubmit}
                className="shadow-brand"
              >
                Submit Return
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
