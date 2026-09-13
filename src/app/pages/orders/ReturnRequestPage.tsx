import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Package, Truck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Checkbox } from '../../components/ui/checkbox';

const returnReasons = [
  { id: 'wrong-item', label: 'Wrong item received' },
  { id: 'defective', label: 'Defective or damaged' },
  { id: 'size', label: 'Size/fit issue' },
  { id: 'quality', label: 'Quality not as expected' },
  { id: 'changed-mind', label: 'Changed my mind' },
  { id: 'other', label: 'Other reason' }
];

export default function ReturnRequestPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [returnMethod, setReturnMethod] = useState('pickup');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const orderDetails = {
    orderId: 'ORD-2024-1234',
    orderDate: '2026-01-10',
    deliveryDate: '2026-01-15',
    product: {
      id: '1',
      name: 'Premium Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      price: 45.00,
      quantity: 1
    },
    returnEligible: true,
    returnDeadline: '2026-01-24',
    address: '123 Main Street, New York, NY 10001, USA'
  };

  const handleSubmitReturn = () => {
    if (!selectedReason || !description || !agreedToTerms) {
      return;
    }
    toast.success('Return request submitted successfully. We will review it within 24–48 hours.');
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Request Return — Ezyify" description="Submit a return request for your Ezyify order." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to={`/orders/${orderId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-foreground">Return Request</h1>
            <p className="text-muted-foreground">Order #{orderDetails.orderId}</p>
          </div>
        </div>

        {/* Eligibility Alert */}
        {orderDetails.returnEligible ? (
          <Alert className="mb-6 border-primary/30 bg-primary/10">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <AlertDescription className="text-foreground">
              This order is eligible for return. Request before {orderDetails.returnDeadline}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              This order is not eligible for return. Return period has expired.
            </AlertDescription>
          </Alert>
        )}

        {/* Product Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-4">Product to Return</h2>
            <div className="flex items-start gap-4">
              <img
                      loading="lazy"
                src={orderDetails.product.image}
                alt={orderDetails.product.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <p className="font-medium mb-1">{orderDetails.product.name}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  ${orderDetails.product.price.toLocaleString()} × {orderDetails.product.quantity}
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Ordered: {orderDetails.orderDate}</span>
                  <span>Delivered: {orderDetails.deliveryDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="mb-6">Return Details</h2>

            <div className="space-y-6">
              {/* Reason Selection */}
              <div>
                <Label className="mb-3 block">Reason for Return *</Label>
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                  <div className="space-y-2">
                    {returnReasons.map((reason) => (
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
                <Label htmlFor="description">Additional Details *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide more details about why you're returning this item..."
                  rows={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Photo Upload */}
              <div>
                <Label>Upload Product Photos (Recommended)</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-2xl p-6 text-center hover:bg-muted cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Click to upload photos of the product</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each (Max 5 photos)</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Photos help us process your return faster
                </p>
              </div>

              {/* Return Method */}
              <div>
                <Label className="mb-3 block">Return Method</Label>
                <RadioGroup value={returnMethod} onValueChange={setReturnMethod}>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 border border-border rounded-xl hover:bg-muted">
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="w-5 h-5 text-primary" />
                          <span className="font-medium">Free Pickup</span>
                          <Badge className="bg-primary/20 text-primary text-xs">Recommended</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          We'll pick up the product from your address within 2-3 business days
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Address: {orderDetails.address}
                        </p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border border-border rounded-xl hover:bg-muted">
                      <RadioGroupItem value="drop-off" id="drop-off" className="mt-1" />
                      <Label htmlFor="drop-off" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-5 h-5 text-primary" />
                          <span className="font-medium">Drop-off Point</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Drop off the product at your nearest Ezyify collection point
                        </p>
                        <button className="text-xs text-primary hover:underline mt-1">
                          Find nearest drop-off point
                        </button>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Refund Information */}
              <div className="bg-primary/10 p-4 rounded-xl">
                <h3 className="text-sm font-medium mb-2">Refund Processing</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Product will be inspected upon receipt</li>
                  <li>• Refund will be processed within 5-7 business days after inspection</li>
                  <li>• Amount will be credited to your Ezyify Wallet</li>
                </ul>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-xl">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I confirm that the product is in original condition with all tags and packaging intact.
                  I understand that damaged or used products may not be eligible for full refund. I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    return policy terms
                  </Link>
                  .
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                onClick={handleSubmitReturn}
                disabled={!selectedReason || !description || !agreedToTerms || !orderDetails.returnEligible}
              >
                Submit Return Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Return Policy Info */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4">Return Policy</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Returns accepted within 14 days of delivery</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Products must be unused and in original packaging</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Free pickup service available for all returns</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Refunds processed within 5-7 business days after inspection</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Need help?{' '}
                  <Link to="/help" className="text-primary hover:underline">Contact support</Link>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-block px-2 py-0.5 rounded-full ${className}`}>{children}</span>;
}