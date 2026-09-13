import { SEO } from '../../components/SEO';
import { Shield, ShoppingCart, Truck, CheckCircle, RefreshCw, AlertCircle, Lock, Wallet, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Link } from 'react-router';

export default function PaymentGuide() {
  const paymentSteps = [
    {
      step: 1,
      title: 'Place Your Order',
      icon: <ShoppingCart className="w-8 h-8" />,
      description: 'Select your products and checkout using digital wallet',
      details: [
        'Only digital payment methods accepted',
        'No cash on delivery (COD)',
        'Payment is instantly processed'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      step: 2,
      title: 'Payment Held in Escrow',
      icon: <Shield className="w-8 h-8" />,
      description: 'Your payment is securely held until delivery is confirmed',
      details: [
        'Seller cannot access funds yet',
        'Full buyer protection active',
        'Visible escrow status on all pages'
      ],
      color: 'from-purple-500 to-purple-600',
      highlight: true
    },
    {
      step: 3,
      title: 'Seller Ships Order',
      icon: <Truck className="w-8 h-8" />,
      description: 'Seller prepares and ships your order with tracking',
      details: [
        'Tracking number provided',
        'Payment still in escrow',
        'You can track shipment progress'
      ],
      color: 'from-orange-500 to-orange-600'
    },
    {
      step: 4,
      title: 'Delivery & Confirmation',
      icon: <CheckCircle className="w-8 h-8" />,
      description: 'You receive the package and confirm delivery',
      details: [
        'Check product condition',
        'Choose: Good Condition or Damaged',
        'Only YOU can confirm delivery'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      step: 5,
      title: 'Escrow Released',
      icon: <Wallet className="w-8 h-8" />,
      description: 'Payment released to seller after your confirmation',
      details: [
        'Seller receives payment',
        'Platform commission deducted',
        'Transaction complete'
      ],
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const protectionFeatures = [
    {
      icon: <Shield className="w-6 h-6 text-info" />,
      title: 'Escrow Protection',
      description: 'Your money is held safely until you confirm delivery in good condition'
    },
    {
      icon: <Lock className="w-6 h-6 text-primary" />,
      title: 'No COD Fraud',
      description: 'Digital-only payments eliminate cash-related fraud and disputes'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-success" />,
      title: 'Buyer Control',
      description: 'Only buyers can confirm delivery - sellers cannot auto-release funds'
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-warning" />,
      title: 'Easy Refunds',
      description: 'Request refunds for damaged/incorrect items - payment stays in escrow'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Payment Guide — Ezyify" description="Complete guide to payments, escrow protection, and transactions on Ezyify." />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-foreground mb-4">How Ezyify Payment Works</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Understanding our escrow-based payment system that protects buyers and ensures trust
          </p>
        </div>

        {/* Key Protection Alert */}
        <Alert className="mb-12 border-2 border-primary bg-primary/10">
          <Shield className="w-5 h-5 text-primary" />
          <AlertDescription className="text-foreground">
            <strong className="text-lg">🛡️ Your Protection First:</strong> Ezyify uses an escrow-based payment system. 
            Your money is held securely and only released to the seller AFTER you confirm receiving your order in good condition. 
            This ensures maximum buyer protection.
          </AlertDescription>
        </Alert>

        {/* Payment Flow Steps */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Payment Journey (Step-by-Step)</h2>
          <div className="space-y-6">
            {paymentSteps.map((step, index) => (
              <div key={step.step} className="relative">
                <Card className={`${step.highlight ? 'border-2 border-primary shadow-lg' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Step Number & Icon */}
                      <div className={`flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br ${step.color} text-white flex flex-col items-center justify-center`}>
                        {step.icon}
                        <span className="text-xs mt-1 font-bold">Step {step.step}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-foreground flex items-center gap-2">
                          {step.title}
                          {step.highlight && (
                            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                              KEY PROTECTION
                            </span>
                          )}
                        </h3>
                        <p className="text-muted-foreground mb-4">{step.description}</p>
                        
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                              <span className="text-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connecting Arrow */}
                {index < paymentSteps.length - 1 && (
                  <div className="flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-border to-primary"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* What If Scenarios */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">What If...? (Common Scenarios)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Scenario 1: Good Condition */}
            <Card className="border-2 border-success/30 bg-success/8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-6 h-6 text-success" />
                  Product Arrived in Good Condition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-foreground">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Click "Confirm Delivery Received"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Select "Good Condition"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Payment <strong>immediately released</strong> to seller</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">4.</span>
                    <span>Leave a review (optional)</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Scenario 2: Damaged Product */}
            <Card className="border-2 border-error/30 bg-error/8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-error">
                  <AlertCircle className="w-6 h-6 text-error" />
                  Product Damaged or Incorrect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-foreground">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Click "Request Refund" or select "Damaged"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Escrow <strong>freezes</strong> - seller cannot get payment</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Upload photos and describe issue</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">4.</span>
                    <span>Our team reviews within 3-5 business days</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">5.</span>
                    <span>If approved, refund to <strong>Ezyify Wallet</strong></span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Scenario 3: Never Received */}
            <Card className="border-2 border-warning/30 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning dark:text-orange-100">
                  <AlertCircle className="w-6 h-6 text-warning" />
                  Order Never Arrived
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-foreground">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Don't confirm delivery (obviously!)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Escrow <strong>remains locked</strong> - seller gets nothing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>Click "Request Refund"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">4.</span>
                    <span>Select reason: "Order not received"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">5.</span>
                    <span>Full refund processed to your wallet</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Scenario 4: Changed Mind */}
            <Card className="border-2 border-info/30 bg-info/8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-info">
                  <RefreshCw className="w-6 h-6 text-info" />
                  Changed Your Mind
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-foreground">
                  <li className="flex gap-2">
                    <span className="font-bold">1.</span>
                    <span>Request refund before/after delivery</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">2.</span>
                    <span>Select reason: "Changed mind"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">3.</span>
                    <span>May be subject to seller's return policy</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">4.</span>
                    <span>Possible restocking fee (check product page)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold">5.</span>
                    <span>Return shipping cost may apply</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Protection Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Why Our Payment System is Safe</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {protectionFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Refund Policy Quick Info */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-primary/30">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">💰 Where Do Refunds Go?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Wallet className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Ezyify Wallet Only</h3>
                  <p className="text-muted-foreground mb-3">
                    All approved refunds are credited to your <strong>Ezyify Wallet</strong>, not your original payment method. 
                    This ensures faster processing (3-5 business days) and prevents payment gateway fraud.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2 text-foreground">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span>Use wallet balance for future purchases instantly</span>
                    </li>
                    <li className="flex gap-2 text-foreground">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span>Withdraw to your bank account anytime (minimum $5.00)</span>
                    </li>
                    <li className="flex gap-2 text-foreground">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span>No refund processing fees</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to="/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-info/30">
              <CardContent className="p-6 text-center">
                <Package className="w-8 h-8 text-info mx-auto mb-3" />
                <h3 className="font-bold mb-2 text-foreground">View My Orders</h3>
                <p className="text-sm text-muted-foreground">Track orders and confirm delivery</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/wallet">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6 text-center">
                <Wallet className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2 text-foreground">My Wallet</h3>
                <p className="text-sm text-muted-foreground">Check balance and withdraw funds</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/help">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-success mx-auto mb-3" />
                <h3 className="font-bold mb-2 text-foreground">Help Center</h3>
                <p className="text-sm text-muted-foreground">Get support and FAQs</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Bottom CTA */}
        <Alert className="border-2 border-primary bg-primary/5">
          <Shield className="w-5 h-5 text-primary" />
          <AlertDescription>
            <p className="text-foreground mb-2">
              <strong>Remember:</strong> Your protection is our priority. If you have ANY concerns about your order, 
              don't confirm delivery. Instead, request a refund and our team will assist you.
            </p>
            <Link to="/help" className="text-primary hover:underline font-medium">
              Contact Support →
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}