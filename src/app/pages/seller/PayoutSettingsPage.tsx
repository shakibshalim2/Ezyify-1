import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { ArrowLeft, Building2, CreditCard, Plus, Trash2, Edit, CheckCircle2, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { SellerLayout } from '../../components/SellerLayout';

interface PaymentMethod {
  id: string;
  type: 'bank' | 'paypal' | 'stripe';
  name: string;
  details: string;
  accountNumber: string;
  isDefault: boolean;
  verified: boolean;
  addedDate: string;
  lastUsed?: string;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'bank',
    name: 'ABC Bank',
    details: 'Savings Account',
    accountNumber: '1234567890',
    isDefault: true,
    verified: true,
    addedDate: '2025-12-01',
    lastUsed: '2026-01-08'
  },
  {
    id: '2',
    type: 'paypal',
    name: 'PayPal',
    details: 'Business Account',
    accountNumber: 'seller@example.com',
    isDefault: false,
    verified: true,
    addedDate: '2025-11-15',
    lastUsed: '2026-01-05'
  }
];

export default function PayoutSettingsPage() {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState<string | null>(null);
  const [newMethod, setNewMethod] = useState({
    type: 'bank',
    name: '',
    details: '',
    accountNumber: '',
    accountHolderName: ''
  });

  // Security & Fraud Prevention Variables
  const isKYCVerified = true;
  const kycVerificationDate = '2025-12-01';
  const maxPaymentMethods = 5;
  const requiresTwoFactorAuth = true;
  const twoFactorEnabled = true;

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(m => ({ ...m, isDefault: m.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault) {
      toast.error('Cannot delete default payment method. Please set another method as default first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${method?.name}? This action cannot be undone.`)) {
      setPaymentMethods(methods => methods.filter(m => m.id !== id));
      toast.success('Payment method removed');
    }
  };

  const handleAddMethod = () => {
    if (!isKYCVerified) {
      toast.error('Please complete KYC verification before adding payment methods.');
      return;
    }
    if (paymentMethods.length >= maxPaymentMethods) {
      toast.error(`Maximum ${maxPaymentMethods} payment methods allowed.`);
      return;
    }
    // Add new payment method logic here
    setIsAddingMethod(false);
    setNewMethod({
      type: 'bank',
      name: '',
      details: '',
      accountNumber: '',
      accountHolderName: ''
    });
  };

  const getMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'bank':
        return <Building2 className="w-5 h-5 text-info" />;
      case 'paypal':
      case 'stripe':
        return <CreditCard className="w-5 h-5 text-primary" />;
    }
  };

  const toggleAccountVisibility = (id: string) => {
    setShowAccountNumber(showAccountNumber === id ? null : id);
  };

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <SEO title="Payout Settings — Ezyify Seller" description="Manage your payment methods and payout preferences on Ezyify." />
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-foreground">Payout Settings</h1>
          <p className="text-muted-foreground">Manage your payment methods and payout preferences</p>
        </div>

        {/* KYC & Security Status Alerts */}
        {!isKYCVerified ? (
          <Alert variant="destructive" className="mb-6">
            <Shield className="w-4 h-4" />
            <AlertDescription>
              <strong>KYC Verification Required:</strong> Complete identity verification to add payment methods and receive payouts.
              <Link to="/seller/kyc-verification" className="ml-2 underline">
                Verify Now
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-success/30 bg-success/5">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <AlertDescription className="text-success">
              <strong>✓ KYC Verified</strong> since {kycVerificationDate}. You can add and manage payment methods.
              <Link to="/seller/kyc-verification" className="ml-2 text-success hover:underline">
                View Details
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {requiresTwoFactorAuth && !twoFactorEnabled && (
          <Alert className="mb-6 border-yellow-200 bg-warning/5">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <AlertDescription className="text-warning">
              <strong>Security Recommendation:</strong> Enable Two-Factor Authentication for enhanced account security when managing payouts.
              <Link to="/settings/security" className="ml-2 text-warning hover:underline">
                Enable 2FA
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <Card className="mb-6 border-info/30 bg-info/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-info mb-1">Fraud Prevention & Security</h3>
                <ul className="text-sm text-info space-y-1">
                  <li>• All payment method changes are logged for security</li>
                  <li>• Account holder name must match your KYC verified name</li>
                  <li>• New payment methods require 24-hour verification period</li>
                  <li>• Suspicious changes may trigger manual review</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods List */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2>Payment Methods ({paymentMethods.length}/{maxPaymentMethods})</h2>
              <Dialog open={isAddingMethod} onOpenChange={setIsAddingMethod}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={!isKYCVerified || paymentMethods.length >= maxPaymentMethods}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Method
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                    <DialogDescription>
                      New payment methods require 24-48 hours for verification before first use
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    
                    <div className="space-y-2">
                      <Label>Method Type</Label>
                      <Select value={newMethod.type} onValueChange={(value) => setNewMethod({...newMethod, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="stripe">Stripe Connect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Holder Name *</Label>
                      <Input 
                        placeholder="Must match KYC name"
                        value={newMethod.accountHolderName}
                        onChange={(e) => setNewMethod({...newMethod, accountHolderName: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">Must match your verified KYC name</p>
                    </div>

                    {newMethod.type === 'bank' && (
                      <>
                        <div className="space-y-2">
                          <Label>Bank Name *</Label>
                          <Input 
                            placeholder="e.g. Chase Bank"
                            value={newMethod.name}
                            onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Number *</Label>
                          <Input 
                            type="password"
                            placeholder="Enter account number"
                            value={newMethod.accountNumber}
                            onChange={(e) => setNewMethod({...newMethod, accountNumber: e.target.value})}
                          />
                        </div>
                      </>
                    )}

                    {newMethod.type === 'paypal' && (
                      <div className="space-y-2">
                        <Label>PayPal Email *</Label>
                        <Input 
                          type="email"
                          placeholder="your@email.com"
                          value={newMethod.accountNumber}
                          onChange={(e) => setNewMethod({...newMethod, accountNumber: e.target.value})}
                        />
                      </div>
                    )}

                    <Button onClick={handleAddMethod} className="w-full">
                      Add & Verify Payment Method
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                <Button onClick={() => setIsAddingMethod(true)} disabled={!isKYCVerified}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Method
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-start gap-4 p-4 border border-border rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {getMethodIcon(method.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium">{method.name}</p>
                        {method.isDefault && (
                          <Badge variant="default" className="text-xs">Default</Badge>
                        )}
                        {method.verified && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-success" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.details}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {showAccountNumber === method.id
                            ? method.accountNumber
                            : method.type === 'bank' 
                              ? `****${method.accountNumber.slice(-4)}`
                              : method.accountNumber.includes('@')
                                ? method.accountNumber.replace(/(.{3})(.*)(@.*)/, '$1****$3')
                                : method.accountNumber
                          }
                        </p>
                        <button
                          onClick={() => toggleAccountVisibility(method.id)}
                          className="text-primary hover:text-primary dark:hover:text-primary"
                        >
                          {showAccountNumber === method.id ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Added: {method.addedDate}</span>
                        {method.lastUsed && <span>Last used: {method.lastUsed}</span>}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-11 w-11">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11"
                        onClick={() => handleDelete(method.id)}
                        disabled={method.isDefault}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="mb-4">Important Information</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Shield className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                <span>All payment methods must be verified before use</span>
              </li>
              <li className="flex gap-2">
                <Shield className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                <span>Account holder name must match your KYC verified name</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>You can set one default payment method for automatic withdrawals</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Bank transfers take 1-3 business days, mobile wallets are instant</span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <span>For security, you cannot delete your default payment method</span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <span>Maximum {maxPaymentMethods} payment methods allowed per account</span>
              </li>
              <li className="flex gap-2">
                <Shield className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                <span>New methods have 24-hour verification period before first use</span>
              </li>
              <li className="flex gap-2">
                <Shield className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                <span>All changes are logged and monitored for fraud prevention</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}