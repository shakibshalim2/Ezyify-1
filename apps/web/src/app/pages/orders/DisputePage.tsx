import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { fadeUp, staggerContainer } from '../../lib/motion';

const disputeReasons = [
  { id: 'non-delivery', label: 'Item not received' },
  { id: 'wrong-item', label: 'Wrong item received' },
  { id: 'damaged', label: 'Item damaged/defective' },
  { id: 'counterfeit', label: 'Counterfeit or not genuine' },
  { id: 'misrepresented', label: 'Significantly not as described' },
  { id: 'other', label: 'Other reason' }
];

export default function DisputePage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason || !description || !agreed) {
      toast.error('Please complete all required fields');
      return;
    }
    const disputeId = `DISP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    navigate(`/orders/dispute/${disputeId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Open Dispute — Ezyify" description="Open a dispute for your order." />

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
          <h1 className="font-display text-xl font-semibold text-foreground">Open Dispute</h1>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="ghost" className="bg-error-subtle border border-error/20 p-4">
            <div className="flex gap-3">
              <AlertCircle className="size-5 text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-error text-sm">Use this only as a last resort</p>
                <p className="text-xs text-error/70">Open a dispute when refund requests have been unsuccessful.</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <h3 className="font-display font-semibold text-foreground">What's the issue?</h3>
          <Card>
            <div className="p-4 space-y-2">
              {disputeReasons.map((reason) => (
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
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Detailed Explanation</label>
            <Textarea
              placeholder="Provide all relevant details about your dispute..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-card cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="size-4 mt-1 flex-shrink-0"
            />
            <span className="text-xs text-foreground-secondary">
              I confirm that all information is accurate and understand that false disputes may result in account suspension.
            </span>
          </label>
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2">
          <Button variant="outline" fullWidth asChild>
            <Link to="/user/orders">Cancel</Link>
          </Button>
          <Button
            variant="gradient"
            fullWidth
            disabled={!selectedReason || !description || !agreed}
            onClick={handleSubmit}
            className="shadow-brand"
          >
            Open Dispute
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
