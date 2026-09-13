import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertCircle, Wifi, CreditCard, Wallet, RefreshCw, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export type PaymentErrorType = 
  | 'INSUFFICIENT_FUNDS'
  | 'PAYMENT_GATEWAY_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'INVALID_PAYMENT_METHOD'
  | 'TRANSACTION_LIMIT_EXCEEDED'
  | 'SELLER_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

interface PaymentFailureModalProps {
  isOpen: boolean;
  error: PaymentErrorType;
  requiredAmount?: number;
  currentBalance?: number;
  onRetry?: () => void;
  onAddFunds?: () => void;
  onCancel: () => void;
  onContactSupport?: () => void;
}

export function PaymentFailureModal({
  isOpen,
  error,
  requiredAmount = 0,
  currentBalance = 0,
  onRetry,
  onAddFunds,
  onCancel,
  onContactSupport
}: PaymentFailureModalProps) {
  
  const getErrorConfig = () => {
    switch (error) {
      case 'INSUFFICIENT_FUNDS':
        return {
          icon: <Wallet className="w-8 h-8 text-warning" />,
          iconBg: 'bg-warning/10',
          title: 'Insufficient Wallet Balance',
          description: `You need ₹${requiredAmount.toLocaleString()} but only have ₹${currentBalance.toLocaleString()} in your wallet.`,
          primaryAction: 'Add Funds',
          primaryHandler: onAddFunds,
          showSecondary: true,
          secondaryAction: 'Cancel Order',
          tips: [
            'Add funds securely to your Ezyify wallet',
            'Your money is protected by escrow until delivery',
            'Multiple payment methods accepted'
          ]
        };
      
      case 'PAYMENT_GATEWAY_ERROR':
        return {
          icon: <CreditCard className="w-8 h-8 text-error" />,
          iconBg: 'bg-error/10',
          title: 'Payment Processing Failed',
          description: 'We couldn\'t process your payment. This could be a temporary issue with the payment gateway.',
          primaryAction: 'Retry Payment',
          primaryHandler: onRetry,
          showSecondary: true,
          secondaryAction: 'Try Different Method',
          tips: [
            'Check if your payment method is active',
            'Ensure you have sufficient balance',
            'Try again in a few moments'
          ]
        };
      
      case 'NETWORK_ERROR':
        return {
          icon: <Wifi className="w-8 h-8 text-warning" />,
          iconBg: 'bg-warning/10',
          title: 'Connection Lost',
          description: 'We lost connection to our servers. Please check your internet and try again.',
          primaryAction: 'Retry Payment',
          primaryHandler: onRetry,
          showSecondary: true,
          secondaryAction: 'Cancel',
          tips: [
            'Check your internet connection',
            'Move to an area with better signal',
            'Your cart is saved and secure'
          ]
        };
      
      case 'TIMEOUT':
        return {
          icon: <RefreshCw className="w-8 h-8 text-info" />,
          iconBg: 'bg-info/10',
          title: 'Payment Timeout',
          description: 'The payment took too long to process. Don\'t worry, no charges were made.',
          primaryAction: 'Try Again',
          primaryHandler: onRetry,
          showSecondary: true,
          secondaryAction: 'Cancel',
          tips: [
            'No duplicate charges will occur',
            'Your cart items are still reserved',
            'Complete payment within 10 minutes'
          ]
        };
      
      case 'TRANSACTION_LIMIT_EXCEEDED':
        return {
          icon: <AlertCircle className="w-8 h-8 text-primary" />,
          'iconBg': 'bg-primary/10',
          title: 'Transaction Limit Exceeded',
          description: 'This transaction exceeds your current daily limit. Please verify your account or split the order.',
          primaryAction: 'Complete Verification',
          primaryHandler: onContactSupport,
          showSecondary: true,
          secondaryAction: 'Split Order',
          tips: [
            'Verify your KYC to increase limits',
            'Daily limit resets at midnight',
            'Contact support for assistance'
          ]
        };
      
      case 'SELLER_UNAVAILABLE':
        return {
          icon: <XCircle className="w-8 h-8 text-muted-foreground" />,
          iconBg: 'bg-muted',
          title: 'Seller Temporarily Unavailable',
          description: 'The seller cannot accept orders right now. Please try again later or browse similar products.',
          primaryAction: 'Browse Similar',
          primaryHandler: onCancel,
          showSecondary: true,
          secondaryAction: 'Save for Later',
          tips: [
            'Seller will be notified',
            'Your wishlist items are saved',
            'Get notified when available'
          ]
        };
      
      default:
        return {
          icon: <AlertCircle className="w-8 h-8 text-error" />,
          iconBg: 'bg-error/10',
          title: 'Payment Failed',
          description: 'Something went wrong while processing your payment. Please try again or contact support.',
          primaryAction: 'Retry Payment',
          primaryHandler: onRetry,
          showSecondary: true,
          secondaryAction: 'Contact Support',
          tips: [
            'No charges were made',
            'Your cart is safe',
            'Support available 24/7'
          ]
        };
    }
  };

  const config = getErrorConfig();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <div className="text-center py-4">
          {/* Error Icon */}
          <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {config.icon}
          </div>
          
          {/* Title & Description */}
          <DialogHeader className="text-center space-y-2 mb-4">
            <DialogTitle className="text-2xl">{config.title}</DialogTitle>
            <p className="text-muted-foreground text-base leading-relaxed">
              {config.description}
            </p>
          </DialogHeader>
          
          {/* Insufficient Funds Breakdown */}
          {error === 'INSUFFICIENT_FUNDS' && (
            <div className="bg-muted p-4 rounded-xl mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Order Total</span>
                <span className="font-semibold">₹{requiredAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current Balance</span>
                <span className="font-semibold">₹{currentBalance.toLocaleString()}</span>
              </div>
              <div className="h-px bg-border my-3" />
              <div className="flex justify-between">
                <span className="text-sm font-medium">Amount Needed</span>
                <span className="text-xl font-bold text-primary">
                  ₹{(requiredAmount - currentBalance).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          
          {/* Helpful Tips */}
          <Alert className="mb-6 text-left">
            <AlertDescription>
              <ul className="space-y-2 text-sm">
                {config.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
          
          {/* Actions */}
          <DialogFooter className="flex-col sm:flex-col gap-3">
            {config.primaryHandler && (
              <Button 
                onClick={config.primaryHandler} 
                className="w-full"
                size="lg"
              >
                {config.primaryAction}
              </Button>
            )}
            {config.showSecondary && (
              <Button 
                variant="outline" 
                onClick={onCancel} 
                className="w-full"
                size="lg"
              >
                {config.secondaryAction || 'Cancel'}
              </Button>
            )}
            {onContactSupport && error !== 'TRANSACTION_LIMIT_EXCEEDED' && (
              <Button 
                variant="ghost" 
                onClick={onContactSupport} 
                className="w-full text-sm"
              >
                Contact Support
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}