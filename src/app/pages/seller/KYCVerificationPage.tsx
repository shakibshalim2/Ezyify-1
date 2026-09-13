import { SEO } from '../../components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useState } from 'react';
import { SellerLayout } from '../../components/SellerLayout';

export default function KYCVerificationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'reviewing' | 'verified' | 'rejected'>('pending');

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Business Details', icon: Building },
    { number: 3, title: 'Documents', icon: FileText },
    { number: 4, title: 'Payment Info', icon: CreditCard }
  ];

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Seller Verification — Ezyify" description="Complete your identity and seller verification on Ezyify." />
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold md:text-3xl text-foreground">Seller Verification (KYC)</h1>
              <p className="text-sm text-muted-foreground">Complete verification to start selling on Ezyify</p>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {verificationStatus === 'reviewing' && (
          <Alert className="mb-6">
            <AlertTriangle className="w-5 h-5" />
            <AlertDescription>
              Your verification is under review. This typically takes 24-48 hours. We'll email you once it's complete.
            </AlertDescription>
          </Alert>
        )}

        {verificationStatus === 'verified' && (
          <Alert className="mb-6">
            <CheckCircle className="w-5 h-5" />
            <AlertDescription>
              ✓ Your account is verified! You can now start listing products on Ezyify.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors
                        ${isCompleted ? 'bg-primary text-primary-foreground' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                      `}
                    >
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <p className="text-xs text-center font-medium">{step.title}</p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-primary' : 'bg-border'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Tabs */}
        <Tabs value={`step${currentStep}`} className="mb-6">
          <TabsList className="hidden">
            {steps.map(step => (
              <TabsTrigger key={step.number} value={`step${step.number}`} />
            ))}
          </TabsList>

          {/* Step 1: Personal Information */}
          <TabsContent value="step1">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Provide your personal details for identity verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input id="dob" type="date" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input id="address" placeholder="123 Main Street" required />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="San Francisco" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input id="state" placeholder="CA" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code *</Label>
                    <Input id="zip" placeholder="94102" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={() => setCurrentStep(2)} className="w-full">
                  Continue to Business Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Business Details */}
          <TabsContent value="step2">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Tell us about your business (or select individual seller)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sellerType">Seller Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seller type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Seller</SelectItem>
                      <SelectItem value="business">Business/Company</SelectItem>
                      <SelectItem value="brand">Brand/Manufacturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input id="storeName" placeholder="My Awesome Store" required />
                  <p className="text-xs text-muted-foreground">This will be your public store name on Ezyify</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Legal Business Name</Label>
                  <Input id="businessName" placeholder="Acme Inc." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN (if applicable)</Label>
                  <Input id="taxId" placeholder="12-3456789" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input id="website" type="url" placeholder="https://example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Primary Product Category *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                      <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="home">Home & Living</SelectItem>
                      <SelectItem value="sports">Sports & Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="flex-1">
                    Continue to Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Document Upload */}
          <TabsContent value="step3">
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification Documents</CardTitle>
                <CardDescription>
                  Upload required documents to verify your identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Shield className="w-5 h-5" />
                  <AlertDescription>
                    All documents are encrypted and stored securely. We only use them for verification purposes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <h4 className="font-semibold mb-1">Government-Issued ID *</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload passport, driver's license, or national ID card (front and back)
                      </p>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <h4 className="font-semibold mb-1">Proof of Address *</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Utility bill, bank statement, or lease agreement (less than 3 months old)
                      </p>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <h4 className="font-semibold mb-1">Business Documents (if applicable)</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Business license, certificate of incorporation, or tax registration
                      </p>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm">
                    <strong>Accepted formats:</strong> JPG, PNG, PDF (max 10MB per file)<br />
                    <strong>Processing time:</strong> 24-48 hours after submission
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} className="flex-1">
                    Continue to Payment Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Payment Information */}
          <TabsContent value="step4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Set up how you want to receive seller payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payoutMethod">Payout Method *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer (ACH)</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="wire">Wire Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name *</Label>
                  <Input id="accountName" placeholder="John Doe" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input id="bankName" placeholder="Chase Bank" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input id="accountNumber" type="password" placeholder="••••••••" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number *</Label>
                  <Input id="routingNumber" placeholder="123456789" required />
                </div>

                <Alert className="border-warning/30 bg-warning/8">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <AlertDescription>
                    Payouts are processed monthly on the 15th. Minimum payout threshold is $50.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setVerificationStatus('reviewing')} className="flex-1">
                    Submit for Verification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="bg-muted">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Why do we need this information?</h3>
            <ul className="text-sm text-foreground space-y-1 ml-4">
              <li>• <strong>Security:</strong> Protect buyers from fraud and fake sellers</li>
              <li>• <strong>Compliance:</strong> Meet legal requirements for financial transactions</li>
              <li>• <strong>Trust:</strong> Build confidence in the Ezyify marketplace</li>
              <li>• <strong>Payment:</strong> Process your seller payouts accurately</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}