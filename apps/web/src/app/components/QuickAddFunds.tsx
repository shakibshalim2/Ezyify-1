import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Plus,
  Shield,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface QuickAddFundsProps {
  suggestedAmount: number;
  onSuccess: (amount: number, method: string) => void;
  onCancel?: () => void;
  minAmount?: number;
  maxAmount?: number;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'Google Pay, PhonePe, Paytm',
    icon: Smartphone,
    badge: 'Instant',
    processingTime: 'Instant',
    recommended: true
  },
  {
    id: 'card',
    name: 'Debit/Credit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
    badge: 'Secure',
    processingTime: 'Instant'
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    description: 'All major banks',
    icon: Building2,
    badge: 'Trusted',
    processingTime: '1-2 minutes'
  }
];

export function QuickAddFunds({
  suggestedAmount,
  onSuccess,
  onCancel,
  minAmount = 100,
  maxAmount = 50000
}: QuickAddFundsProps) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [amount, setAmount] = useState(Math.ceil(suggestedAmount / 100) * 100);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleQuickAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
    setError('');
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setCustomAmount(value);
    setAmount(numValue);
    
    if (numValue < minAmount) {
      setError(`Minimum amount is ₹${minAmount}`);
    } else if (numValue > maxAmount) {
      setError(`Maximum amount is ₹${maxAmount}`);
    } else {
      setError('');
    }
  };

  const handleAddFunds = async () => {
    if (amount < minAmount || amount > maxAmount) {
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(amount, selectedMethod);
    }, 1500);
  };

  const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  return (
    <div className="space-y-6">
      {/* Security Banner */}
      <Alert className="border-success/30 bg-success/5">
        <Shield className="w-4 h-4 text-success" />
        <AlertDescription className="text-success">
          <span className="font-medium">100% Secure Payment</span>
          <span className="text-success"> · Encrypted · PCI DSS Compliant</span>
        </AlertDescription>
      </Alert>

      {/* Amount Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Select Amount</Label>
        
        {/* Quick Amounts */}
        <div className="grid grid-cols-2 gap-3">
          {QUICK_AMOUNTS.map((quickAmount) => (
            <Button
              key={quickAmount}
              type="button"
              variant={amount === quickAmount && !customAmount ? "default" : "outline"}
              className="h-14 flex flex-col items-center justify-center"
              onClick={() => handleQuickAmountSelect(quickAmount)}
            >
              <span className="text-lg font-bold">₹{quickAmount.toLocaleString()}</span>
              {quickAmount === Math.ceil(suggestedAmount / 100) * 100 && (
                <Badge variant="secondary" className="text-xs mt-1">Suggested</Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="relative">
          <Label htmlFor="custom-amount" className="text-sm text-muted-foreground">
            Or enter custom amount
          </Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              ₹
            </span>
            <Input
              id="custom-amount"
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="pl-8 h-12 text-lg"
              min={minAmount}
              max={maxAmount}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Min: ₹{minAmount.toLocaleString()} · Max: ₹{maxAmount.toLocaleString()}
          </p>
          {error && (
            <p className="text-xs text-error mt-1">{error}</p>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Payment Method</Label>
        
        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.id}
                className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold">{method.name}</span>
                    {method.badge && (
                      <Badge variant={method.recommended ? "default" : "secondary"} className="text-xs">
                        {method.badge}
                      </Badge>
                    )}
                    {method.recommended && (
                      <Badge variant="default" className="text-xs bg-success">
                        <Zap className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Processing: {method.processingTime}
                  </p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Summary */}
      <div className="bg-muted p-4 rounded-xl space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Adding to Wallet</span>
          <span className="font-semibold">₹{amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Processing Fee</span>
          <span className="font-semibold text-success">Free</span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex justify-between">
          <span className="font-semibold">Total Amount</span>
          <span className="text-xl font-bold text-primary">₹{amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>Instant wallet top-up</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>No hidden charges</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>Funds protected by escrow</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddFunds}
          disabled={!amount || amount < minAmount || amount > maxAmount || isProcessing}
          className="flex-1 h-12"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Add ₹{amount.toLocaleString()}
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="h-12"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Trust Signals */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Protected by 256-bit SSL encryption · Verified by Visa & Mastercard
        </p>
      </div>
    </div>
  );
}
