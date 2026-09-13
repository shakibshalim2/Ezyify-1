import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { Wallet, DollarSign, AlertCircle } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { toast } from 'sonner';

export default function WithdrawPage() {
  const reduce = useReducedMotion();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const balance = 1200;
  const fee = amount ? Math.round(parseFloat(amount) * 0.02) : 0;
  const net = amount ? Math.round(parseFloat(amount) - fee) : 0;

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (parseFloat(amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Withdrawal request submitted');
      setAmount('');
    }, 1500);
  };

  return (
    <SellerLayout>
      <SEO title="Withdraw — Ezyify Seller" description="Withdraw your earnings from Ezyify." />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Withdraw Earnings</h1>
          <p className="text-sm text-foreground-secondary mt-1">Transfer your earnings to your account</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="featured" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Available Balance</p>
                <p className="font-display font-bold text-4xl text-foreground mt-2">${balance}</p>
              </div>
              <Wallet className="size-12 text-primary/30" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Withdrawal Details</h2>
            <div className="space-y-4">
              <Field
                label="Withdrawal Amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                leftIcon={<DollarSign className="size-5" />}
              />

              {amount && (
                <div className="space-y-2 p-4 bg-background-elevated rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Amount</span>
                    <span className="font-semibold text-foreground">${amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Fee (2%)</span>
                    <span className="font-semibold text-foreground">${fee}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold text-foreground">You'll receive</span>
                    <span className="font-display font-bold text-lg text-primary">${net}</span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-info-subtle rounded-lg flex gap-3">
                <AlertCircle className="size-5 text-info flex-shrink-0 mt-0.5" />
                <p className="text-xs text-info">Withdrawals are processed within 2-3 business days</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Button
            variant="gradient"
            size="lg"
            fullWidth
            loading={isProcessing}
            onClick={handleWithdraw}
            className="shadow-brand"
          >
            Request Withdrawal
          </Button>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
