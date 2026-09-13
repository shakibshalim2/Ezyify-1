import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { CreditCard, Save } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { toast } from 'sonner';

export default function PayoutSettingsPage() {
  const reduce = useReducedMotion();
  const [isSaving, setIsSaving] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    routingNumber: '',
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Payout settings saved');
    }, 1000);
  };

  return (
    <SellerLayout>
      <SEO title="Payout Settings — Ezyify Seller" description="Configure your payout method." />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Payout Settings</h1>
          <p className="text-sm text-foreground-secondary mt-1">Configure how you receive payouts</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
              <CreditCard className="size-5" /> Bank Account
            </h2>
            <div className="space-y-4">
              <Field
                label="Account Holder Name"
                placeholder="John Doe"
                value={bankInfo.accountHolder}
                onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
              />
              <Field
                label="Account Number"
                placeholder="1234567890"
                value={bankInfo.accountNumber}
                onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
              />
              <Field
                label="Bank Name"
                placeholder="ABC Bank"
                value={bankInfo.bankName}
                onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
              />
              <Field
                label="Routing Number"
                placeholder="021000021"
                value={bankInfo.routingNumber}
                onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value })}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Button
            variant="gradient"
            size="lg"
            fullWidth
            loading={isSaving}
            onClick={handleSave}
            leftIcon={<Save className="size-5" />}
            className="shadow-brand"
          >
            Save Payout Method
          </Button>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
