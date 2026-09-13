import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Checkbox } from '../../components/ui/checkbox';

const refundReasons = [
  { id: 'defective', label: 'Defective or damaged product' },
  { id: 'wrong', label: 'Wrong item received' },
  { id: 'description', label: 'Product not as described' },
  { id: 'quality', label: 'Poor quality' },
  { id: 'size', label: 'Wrong size/fit' },
  { id: 'other', label: 'Other reason' }
];

export default function RefundRequestPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || undefined;
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const mockOrder = {
    id: orderId || 'ORD-12345',
    product: {
      name: 'Premium Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      price: 4500
    },
    orderDate: '2026-01-08',
    deliveredDate: '2026-01-10',
    refundEligible: true,
    refundDeadline: '2026-01-17'
  };

  const handleSubmitRefund = () => {
    if (!selectedReason || !description || !agreedToTerms) {
      toast.error('Please select a reason, describe the issue, and accept the terms');
      return;
    }
    // Generate refund ID and navigate to status page
    const refundId = `REF-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    navigate(`/orders/refund-status/${refundId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Request Refund — Ezyify" description="Submit a refund request for your Ezyify order." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to={orderId ? `/order/${orderId}` : '/orders'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-foreground">Request Refund</h1>
            <p className="text-muted-foreground">Order #{mockOrder.id}</p>
          </div>
        </div>

        {/* Eligibility Alert */}
        {mockOrder.refundEligible ? (
          <Alert className="mb-6 border-primary/30 bg-primary/10">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <AlertDescription className="text-foreground">
              This order is eligible for refund. Request before {mockOrder.refundDeadline}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              This order is not eligible for refund. Refund period has expired.
            </AlertDescription>
          </Alert>
        )}

        {/* Escrow Protection Notice */}
        <Alert className="mb-6 border-primary/30 bg-primary/10">
          <Shield className="w-4 h-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Buyer Protection Active:</strong> Your payment is held securely in escrow. Submitting a refund request will freeze the escrow until the issue is resolved. Funds will not be released to the seller during this period.
          </AlertDescription>
        </Alert>

        {/* Product Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4">Order Details</h2>
            <div className="flex items-start gap-4">
              <img
                      loading="lazy"
                src={mockOrder.product.image}
                alt={mockOrder.product.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-medium mb-1">{mockOrder.product.name}</p>
                <p className="text-sm text-muted-foreground mb-2">${mockOrder.product.price.toLocaleString()}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Ordered: {mockOrder.orderDate}</span>
                  <span>Delivered: {mockOrder.deliveredDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-6">Refund Information</h2>

            <div className="space-y-6">
              {/* Reason Selection */}
              <div>
                <Label className="mb-3 block">Reason for Refund *</Label>
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                  <div className="space-y-2">
                    {refundReasons.map((reason) => (
                      <div key={reason.id} className="flex items-center space-x-3 p-3 border border-border rounded-xl hover:bg-muted">
                        <RadioGroupItem value={reason.id} id={reason.id} />
                        <Label htmlFor={reason.id} className="flex-1 cursor-pointer">
                          {reason.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  rows={6}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Photo Upload */}
              <div>
                <Label>Upload Photos (Optional)</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-2xl p-6 text-center hover:bg-muted cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Click to upload photos</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each (Max 5 photos)</p>
                </div>
              </div>

              {/* Refund Method */}
              <div className="bg-primary/10 p-4 rounded-xl">
                <h3 className="text-sm font-medium mb-2">Refund Processing</h3>
                <p className="text-sm text-muted-foreground">
                  After approval, refund will be credited to your Ezyify Wallet within 3-5 business days.
                  You can then withdraw to your bank account or use it for future purchases.
                </p>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-xl">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I confirm that all information provided is accurate and I understand that false claims
                  may result in account suspension. I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    refund policy terms
                  </Link>
                  .
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                onClick={handleSubmitRefund}
                disabled={!selectedReason || !description || !agreedToTerms || !mockOrder.refundEligible}
              >
                Submit Refund Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Refund Policy Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4">Refund Policy</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Refund requests must be submitted within 7 days of delivery</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Products must be in original condition (unless defective)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Refunds are processed within 3-5 business days after approval</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Amount will be credited to your Ezyify Wallet</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>For questions, contact our{' '}
                  <Link to="/help" className="text-primary hover:underline">support team</Link>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}