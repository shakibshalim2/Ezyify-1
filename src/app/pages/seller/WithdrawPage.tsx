import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, DollarSign, Building2, CreditCard, AlertCircle, CheckCircle2, Shield, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { SellerLayout } from '../../components/SellerLayout';

interface WithdrawalHistory {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'under_review';
  reviewReason?: string;
}

const mockWithdrawals: WithdrawalHistory[] = [
  {
    id: 'WD-001',
    amount: 150.00,
    method: 'Bank Transfer - ABC Bank ***1234',
    date: '2026-01-08',
    status: 'completed'
  },
  {
    id: 'WD-002',
    amount: 85.00,
    method: 'PayPal - seller@example.com',
    date: '2026-01-05',
    status: 'processing'
  },
  {
    id: 'WD-003',
    amount: 120.00,
    method: 'Bank Transfer - ABC Bank ***1234',
    date: '2026-01-01',
    status: 'completed'
  }
];

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const availableBalance = 363.00;
  const minimumWithdrawal = 5.00;
  const processingFee = 0.50;
  
  // Fraud Prevention & Escrow Safety Limits
  const dailyWithdrawalLimit = 500.00;
  const todayWithdrawn = 0.00;
  const remainingDailyLimit = dailyWithdrawalLimit - todayWithdrawn;
  const weeklyWithdrawalLimit = 2000.00;
  const weeklyWithdrawn = 235.00;
  const remainingWeeklyLimit = weeklyWithdrawalLimit - weeklyWithdrawn;
  const isKYCVerified = true;
  const accountAge = 45; // days
  const minimumAccountAge = 7; // days required
  const recentOrdersInEscrow = 3;
  const escrowHoldDays = 7; // Days after delivery confirmation

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount >= minimumWithdrawal && withdrawAmount <= availableBalance) {
      setShowConfirmation(true);
    }
  };

  const getStatusBadge = (status: WithdrawalHistory['status']) => {
    const config = {
      completed: { variant: 'default' as const, icon: CheckCircle2, color: 'text-success' },
      pending: { variant: 'secondary' as const, icon: AlertCircle, color: 'text-warning' },
      processing: { variant: 'outline' as const, icon: AlertCircle, color: 'text-info' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-error' },
      under_review: { variant: 'secondary' as const, icon: Shield, color: 'text-warning' }
    };

    const { variant, icon: Icon, color } = config[status];
    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <Badge variant={variant}>{status.replace('_', ' ')}</Badge>
      </div>
    );
  };

  // Check if withdrawal is allowed
  const canWithdraw = isKYCVerified && accountAge >= minimumAccountAge;
  const withdrawalBlocked = !canWithdraw;

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Withdraw Earnings — Ezyify Seller" description="Withdraw your earnings from your Ezyify seller wallet." />
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-1 sm:mb-2 font-semibold text-foreground">Withdraw Funds</h1>
          <p className="text-sm text-muted-foreground">Request a withdrawal from your available balance</p>
        </div>

        {/* Security & Fraud Prevention Alerts */}
        {!isKYCVerified && (
          <Alert variant="destructive" className="mb-6">
            <Shield className="w-4 h-4" />
            <AlertDescription>
              <strong>KYC Verification Required:</strong> Complete identity verification before withdrawing funds.
              <Link to="/seller/kyc-verification" className="ml-2 underline">
                Verify Now
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {accountAge < minimumAccountAge && (
          <Alert variant="destructive" className="mb-6">
            <Clock className="w-4 h-4" />
            <AlertDescription>
              <strong>New Account Hold:</strong> Your account must be at least {minimumAccountAge} days old to withdraw. 
              Current age: {accountAge} days. Eligible in {minimumAccountAge - accountAge} days.
            </AlertDescription>
          </Alert>
        )}

        {recentOrdersInEscrow > 0 && (
          <Alert className="mb-6 border-info/30 bg-info/5">
            <AlertCircle className="w-4 h-4 text-info" />
            <AlertDescription className="text-info">
              <strong>Escrow Notice:</strong> {recentOrdersInEscrow} recent orders are in escrow. Funds will be released {escrowHoldDays} days after delivery confirmation or upon buyer confirmation.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            {/* Balance Card */}
            <Card className="mb-6 text-white" style={{ background: "var(--brand-gradient)" }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-6 h-6" />
                  <p className="text-white/80">Available Balance</p>
                </div>
                <h1 className="text-4xl text-white mb-1">${availableBalance.toLocaleString()}</h1>
                <p className="text-white/80 text-sm">Released from escrow after delivery confirmation</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" />
                    <span className="text-white/90">Protected by Ezyify Escrow System</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Limits Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Withdrawal Limits (Fraud Prevention)</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Daily Limit</span>
                      <span className="font-medium">
                        ${todayWithdrawn.toLocaleString()} / ${dailyWithdrawalLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div 
                        className="bg-success h-2 rounded-full"
                        style={{ width: `${(todayWithdrawn / dailyWithdrawalLimit) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-success mt-1">
                      ${remainingDailyLimit.toLocaleString()} remaining today
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Weekly Limit</span>
                      <span className="font-medium">
                        ${weeklyWithdrawn.toLocaleString()} / ${weeklyWithdrawalLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div 
                        className="bg-info h-2 rounded-full"
                        style={{ width: `${(weeklyWithdrawn / weeklyWithdrawalLimit) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-info mt-1">
                      ${remainingWeeklyLimit.toLocaleString()} remaining this week
                    </p>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Limits reset automatically and may be increased with account history
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal Form */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-6">Withdrawal Details</h2>

                <div className="space-y-6">
                  {/* Amount */}
                  <div>
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1"
                      disabled={withdrawalBlocked}
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Minimum: ${minimumWithdrawal.toLocaleString()}
                      </p>
                      <button
                        onClick={() => setAmount(Math.min(availableBalance, remainingDailyLimit).toString())}
                        className="text-xs text-primary hover:underline"
                        disabled={withdrawalBlocked}
                      >
                        Max Allowed Today
                      </button>
                    </div>
                  </div>

                  {/* Quick Amount Selection */}
                  <div>
                    <Label>Quick Select</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[50, 100, 200, 300].map((quickAmount) => (
                        <Button
                          key={quickAmount}
                          variant="outline"
                          size="sm"
                          onClick={() => setAmount(quickAmount.toString())}
                          disabled={quickAmount > availableBalance || quickAmount > remainingDailyLimit || withdrawalBlocked}
                        >
                          ${quickAmount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Withdrawal Method */}
                  <div>
                    <Label>Withdrawal Method</Label>
                    <RadioGroup value={withdrawMethod} onValueChange={setWithdrawMethod} className="mt-3 space-y-3" disabled={withdrawalBlocked}>
                      <div className="flex items-center space-x-3 p-4 border border-border rounded-xl hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="bank" id="bank" disabled={withdrawalBlocked} />
                        <label htmlFor="bank" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Bank Transfer</p>
                              <p className="text-sm text-muted-foreground">ABC Bank - ****1234 ✓ Verified</p>
                              <p className="text-xs text-muted-foreground">Processing time: 1-3 business days</p>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-border rounded-xl hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="paypal" id="paypal" disabled={withdrawalBlocked} />
                        <label htmlFor="paypal" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">PayPal</p>
                              <p className="text-sm text-muted-foreground">seller@example.com ✓ Verified</p>
                              <p className="text-xs text-muted-foreground">Processing time: Instant</p>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 border border-border rounded-xl hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="stripe" id="stripe" disabled={withdrawalBlocked} />
                        <label htmlFor="stripe" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Stripe</p>
                              <p className="text-sm text-muted-foreground">Connected Account ✓ Verified</p>
                              <p className="text-xs text-muted-foreground">Processing time: 1-2 business days</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>

                    <Link to="/seller/payout-settings" className="text-sm text-primary hover:underline mt-2 inline-block">
                      Manage payment methods
                    </Link>
                  </div>

                  {/* Summary */}
                  {amount && parseFloat(amount) >= minimumWithdrawal && (
                    <div className="bg-muted rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Withdrawal Amount</span>
                        <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Processing Fee</span>
                        <span className="font-medium">${processingFee}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium">You will receive</span>
                        <span className="font-bold text-lg">
                          ${(parseFloat(amount) - processingFee).toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-info">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Estimated arrival: {withdrawMethod === 'paypal' ? 'Instant' : '1-3 business days'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={
                      withdrawalBlocked ||
                      !amount || 
                      parseFloat(amount) < minimumWithdrawal || 
                      parseFloat(amount) > availableBalance ||
                      parseFloat(amount) > remainingDailyLimit
                    }
                  >
                    {withdrawalBlocked ? 'Verification Required' : `Withdraw $${amount ? parseFloat(amount).toLocaleString() : '0'}`}
                  </Button>

                  {/* Alerts */}
                  {amount && parseFloat(amount) < minimumWithdrawal && (
                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Minimum withdrawal amount is ${minimumWithdrawal.toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}

                  {amount && parseFloat(amount) > availableBalance && (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Insufficient balance. Maximum withdrawal: ${availableBalance.toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}

                  {amount && parseFloat(amount) > remainingDailyLimit && parseFloat(amount) <= availableBalance && (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        <strong>Daily limit exceeded.</strong> You can withdraw up to ${remainingDailyLimit.toLocaleString()} today. 
                        Limit resets tomorrow at midnight.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal History */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Recent Withdrawals</h3>
                <div className="space-y-4">
                  {mockWithdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="pb-4 border-b last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium">${withdrawal.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground mt-1">{withdrawal.method}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">{withdrawal.date}</p>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      {withdrawal.reviewReason && (
                        <p className="text-xs text-warning mt-2">
                          <Shield className="w-3 h-3 inline mr-1" />
                          {withdrawal.reviewReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="mb-3">Withdrawal Information</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Minimum withdrawal: ${minimumWithdrawal.toLocaleString()}</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Processing fee: ${processingFee}</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Bank transfers take 1-3 business days</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Mobile wallets are instant</span>
                  </li>
                  <li className="flex gap-2">
                    <Shield className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                    <span>Funds held in escrow for {escrowHoldDays} days after delivery</span>
                  </li>
                  <li className="flex gap-2">
                    <Shield className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                    <span>KYC verification required for all withdrawals</span>
                  </li>
                  <li className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>Unusual patterns may trigger security review</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}