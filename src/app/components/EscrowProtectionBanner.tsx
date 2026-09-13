import { memo } from 'react';
import { Card } from './ui/card';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Shield, Lock, CheckCircle, Clock, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';

interface EscrowProtectionBannerProps {
  amount?: number;
  variant?: 'product' | 'cart' | 'checkout' | 'tracking';
  daysRemaining?: number;
  multiSellerBreakdown?: Array<{
    sellerId: string;
    sellerName: string;
    amount: number;
  }>;
}

export const EscrowProtectionBanner = memo(function EscrowProtectionBanner({
  amount,
  variant = 'product',
  daysRemaining,
  multiSellerBreakdown
}: EscrowProtectionBannerProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (variant === 'product') {
    return (
      <>
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-success/30 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-success mb-1">
                100% Buyer Protection
              </h3>
              <p className="text-sm text-success mb-3">
                {amount
                  ? `Your $${amount.toFixed(2)} is held safely in escrow until you confirm delivery`
                  : 'Your payment is held safely in escrow until you confirm delivery'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Money held securely</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Released after delivery</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Full refund if issues</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(true)}
                className="text-xs text-success underline mt-2 hover:text-success"
              >
                How does escrow protection work?
              </button>
            </div>
          </div>
        </Card>
        <EscrowDetailsDialog open={showDetails} onOpenChange={setShowDetails} />
      </>
    );
  }

  if (variant === 'cart') {
    return (
      <>
        <Card className="bg-info/5 border-info/30 p-4 mb-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-info flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-info mb-2">
                Your Money is Protected
              </h4>
              <p className="text-sm text-info mb-3">
                {amount
                  ? `Your $${amount.toFixed(2)} will be held in secure escrow and only released when you confirm delivery.`
                  : 'Your payment will be held in secure escrow and only released when you confirm delivery.'}
              </p>

              {multiSellerBreakdown && multiSellerBreakdown.length > 1 && (
                <div className="bg-card rounded-2xl p-3 mt-3 border border-border">
                  <p className="text-xs font-medium text-info mb-2">
                    Multi-Seller Order Protection:
                  </p>
                  <ul className="space-y-1.5">
                    {multiSellerBreakdown.map((seller) => (
                      <li
                        key={seller.sellerId}
                        className="flex items-center justify-between text-sm text-info"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" />
                          {seller.sellerName}
                        </span>
                        <span className="font-medium">${seller.amount.toFixed(2)} held separately</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-info mt-2">
                    Each seller's payment is held separately and released only when you confirm their delivery.
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowDetails(true)}
                className="text-xs text-info underline mt-2 hover:text-info dark:hover:text-info"
              >
                Learn more about buyer protection
              </button>
            </div>
          </div>
        </Card>
        <EscrowDetailsDialog open={showDetails} onOpenChange={setShowDetails} />
      </>
    );
  }

  if (variant === 'checkout') {
    return (
      <>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">100% Secure Checkout</h2>
              <p className="text-white/80">
                {amount
                  ? `Your $${amount.toFixed(2)} will be held in escrow until you confirm delivery. Money released to seller only after your approval.`
                  : 'Your payment will be held in escrow until you confirm delivery. Money released to seller only after your approval.'}
              </p>
              <button
                onClick={() => setShowDetails(true)}
                className="text-xs text-white underline mt-2 hover:text-white"
              >
                How it works →
              </button>
            </div>
          </div>
        </Card>
        <EscrowDetailsDialog open={showDetails} onOpenChange={setShowDetails} />
      </>
    );
  }

  if (variant === 'tracking') {
    return (
      <>
        <Card className="bg-warning-subtle border-warning/30 p-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-semibold text-foreground leading-tight">Escrow protection active</h4>
                <p className="text-sm text-foreground-secondary mt-0.5">
                  {amount
                    ? `$${amount.toFixed(2)} held safely until you confirm delivery`
                    : 'Payment held safely until you confirm delivery'}
                </p>
              </div>
            </div>
            {daysRemaining !== undefined && (
              <div className="text-right shrink-0">
                <p className="text-[11px] text-foreground-secondary">Auto‑release in</p>
                <p className="font-display text-xl font-bold tabular-nums text-warning">
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                </p>
              </div>
            )}
          </div>
          <p className="mt-3 pt-3 border-t border-warning/20 text-sm text-foreground-secondary flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-warning" />
            <span>Confirm delivery to release payment to the seller. Unconfirmed orders auto‑release after {daysRemaining || 7} days.</span>
          </p>
          <button
            onClick={() => setShowDetails(true)}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline mt-2"
          >
            Learn about escrow protection
          </button>
        </Card>
        <EscrowDetailsDialog open={showDetails} onOpenChange={setShowDetails} />
      </>
    );
  }

  return null;
});

function EscrowDetailsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            How Escrow Protection Works
          </DialogTitle>
          <DialogDescription>
            Learn how EZYIFY's escrow system protects both buyers and sellers during transactions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              EZYIFY's escrow system protects both buyers and sellers by holding payments securely until transactions are successfully completed.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-semibold text-primary">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">You Place an Order</h4>
                <p className="text-sm text-muted-foreground">
                  When you complete checkout, your payment is securely held in our escrow account—not sent to the seller yet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-semibold text-primary">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Seller Ships Your Order</h4>
                <p className="text-sm text-muted-foreground">
                  The seller is notified and ships your order. You can track delivery in real-time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-semibold text-primary">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">You Receive & Inspect</h4>
                <p className="text-sm text-muted-foreground">
                  You have 7 days after delivery to inspect your order and confirm it matches the description.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-semibold text-primary">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Payment Released or Refunded</h4>
                <p className="text-sm text-muted-foreground">
                  If everything is good, confirm delivery and payment is released to the seller. If there's an issue, open a dispute for a full refund.
                </p>
              </div>
            </div>
          </div>

          <Card className="bg-accent p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Your Protection Includes:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Full refund</strong> if item is not as described</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Full refund</strong> if item doesn't arrive</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Full refund</strong> if item is damaged during shipping</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Commission protection:</strong> Platform fees are only charged on successful transactions</span>
              </li>
            </ul>
          </Card>

          <div className="bg-info/5 border border-info/30 rounded-2xl p-4">
            <h4 className="font-semibold text-info mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Multi-Seller Orders
            </h4>
            <p className="text-sm text-info">
              If your order contains items from multiple sellers, each seller's payment is held separately in escrow. You can confirm delivery for each seller independently.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> If you don't confirm delivery within 7 days, payment will be automatically released to protect sellers from indefinite holds. Make sure to inspect your order promptly!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
