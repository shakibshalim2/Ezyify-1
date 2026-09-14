import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { CheckCircle2, Upload, User, FileText } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';

export default function KYCVerificationPage() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    idType: 'passport',
    documents: [],
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('KYC submitted for verification');
      setStep(4);
    }, 1500);
  };

  const steps = [
    { num: 1, label: 'Personal Info', icon: User },
    { num: 2, label: 'Identity Docs', icon: FileText },
    { num: 3, label: 'Review', icon: CheckCircle2 },
    { num: 4, label: 'Complete', icon: CheckCircle2 },
  ];

  return (
    <SellerLayout>
      <SEO title="KYC Verification — Ezyify Seller" description="Complete KYC verification." />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">KYC Verification</h1>
          <p className="text-sm text-foreground-secondary mt-1">Complete verification to unlock full features</p>
        </motion.div>

        {/* Progress */}
        <motion.div variants={fadeUp}>
          <div className="flex justify-between">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isCompleted = step > s.num;
              const isActive = step === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div
                    className={cn(
                      'size-10 rounded-full flex items-center justify-center mb-2 transition-colors',
                      isCompleted || isActive ? 'bg-primary text-primary-foreground' : 'bg-background-elevated text-foreground-tertiary'
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <p className={cn('text-xs font-medium', isActive ? 'text-primary' : 'text-foreground-secondary')}>
                    {s.label}
                  </p>
                  {i < steps.length - 1 && (
                    <div className={cn('w-12 h-0.5 mt-3 mb-3', isCompleted ? 'bg-primary' : 'bg-border')} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.div variants={fadeUp}>
            <Card variant="default" padding="lg">
              <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Personal Information</h2>
              <div className="space-y-4">
                <Field
                  label="Full Name"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <Field
                  label="ID Number"
                  required
                  placeholder="1234567890"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">ID Type</label>
                  <select
                    value={formData.idType}
                    onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                    className="w-full px-4 py-3 bg-background-elevated border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="passport">Passport</option>
                    <option value="license">Driver's License</option>
                    <option value="national">National ID</option>
                  </select>
                </div>
              </div>
              <Button fullWidth className="mt-6" onClick={() => setStep(2)}>
                Continue
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <motion.div variants={fadeUp}>
            <Card variant="default" padding="lg">
              <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Upload Documents</h2>
              <div className="space-y-3">
                {['ID Front', 'ID Back', 'Proof of Address'].map((doc, i) => (
                  <div
                    key={i}
                    className="border-2 border-dashed border-border rounded-card p-6 text-center hover:bg-background-elevated transition cursor-pointer"
                  >
                    <Upload className="size-8 text-foreground-tertiary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">{doc}</p>
                    <p className="text-xs text-foreground-secondary">Click to upload or drag and drop</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-6">
                <Button fullWidth variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button fullWidth onClick={() => setStep(3)}>
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <motion.div variants={fadeUp}>
            <Card variant="default" padding="lg">
              <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Review Information</h2>
              <div className="space-y-2 p-4 bg-background-elevated rounded-lg mb-6">
                <div>
                  <p className="text-xs text-foreground-secondary">Full Name</p>
                  <p className="font-medium text-foreground">{formData.fullName || 'John Doe'}</p>
                </div>
                <div className="pt-3">
                  <p className="text-xs text-foreground-secondary">ID Type</p>
                  <p className="font-medium text-foreground capitalize">{formData.idType}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button fullWidth variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  fullWidth
                  loading={isSubmitting}
                  onClick={handleSubmit}
                  className="shadow-brand"
                  variant="gradient"
                >
                  Submit
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <motion.div variants={fadeUp}>
            <Card variant="featured" padding="lg" className="text-center space-y-4">
              <CheckCircle2 className="size-16 text-success mx-auto" />
              <div>
                <h3 className="font-display font-bold text-2xl text-foreground">Verification Submitted</h3>
                <p className="text-sm text-foreground-secondary mt-2">Your KYC is under review. You'll be notified within 24 hours.</p>
              </div>
              <Button fullWidth variant="primary">Go to Dashboard</Button>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </SellerLayout>
  );
}
