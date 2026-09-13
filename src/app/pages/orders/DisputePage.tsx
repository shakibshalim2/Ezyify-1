import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, Upload, AlertTriangle, FileText, MessageSquare, Package, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Checkbox } from '../../components/ui/checkbox';
import { Skeleton } from '../../components/ui/skeleton';

const disputeTypes = [
  { id: 'not-received', label: 'Order not received', description: 'Product was never delivered' },
  { id: 'wrong-item', label: 'Wrong item received', description: 'Received a different product' },
  { id: 'damaged', label: 'Damaged product', description: 'Product arrived damaged or defective' },
  { id: 'counterfeit', label: 'Counterfeit product', description: 'Product appears to be fake or counterfeit' },
  { id: 'incomplete', label: 'Incomplete order', description: 'Missing items from order' },
  { id: 'seller-issue', label: 'Seller not responding', description: 'Seller is unresponsive to messages' },
  { id: 'other', label: 'Other issue', description: 'Report a different problem' }
];

export default function DisputePage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || undefined;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [contactedSeller, setContactedSeller] = useState(false);

  useEffect(() => {
    const loadData = () => setIsLoading(false);
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadData(), { timeout: 100 });
    } else {
      setTimeout(loadData, 0);
    }
  }, []);

  const mockOrder = {
    id: orderId || 'ORD-12345',
    seller: {
      name: 'TechStore BD',
      username: 'techstore_bd'
    },
    product: {
      name: 'Premium Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      price: 4500
    },
    orderDate: '2026-01-08',
    status: 'delivered',
    deliveredDate: '2026-01-10'
  };

  const handleSubmitDispute = () => {
    if (!disputeType || !description || !agreedToTerms) {
      return;
    }
    toast.success('Dispute submitted successfully. Our team will review it within 1–3 business days.');
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Report an Issue — Ezyify" description="Report an issue with your Ezyify order. Our team will resolve it within 1–3 business days." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-foreground">Report an Issue</h1>
            <p className="text-muted-foreground">Order #{mockOrder.id}</p>
          </div>
        </div>

        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full mb-6" />
            <Card className="mb-6">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="flex items-start gap-4">
                  <Skeleton className="w-20 h-20 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-64 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {[1, 2].map((i) => (
              <Card key={i} className="mb-6">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <Skeleton className="h-10 w-full mb-3" />
                  <Skeleton className="h-10 w-full mb-3" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {/* Important Notice */}
            <Alert className="mb-6 border-destructive/30 bg-destructive/10">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <AlertDescription className="text-foreground">
                Before opening a dispute, we recommend{' '}
                <Link to="/messages" className="underline font-medium">
                  contacting the seller
                </Link>
                {' '}to resolve the issue directly.
              </AlertDescription>
            </Alert>

            {/* Escrow Protection During Dispute */}
            <Alert className="mb-6 border-primary/30 bg-primary/10">
              <Shield className="w-4 h-4 text-primary" />
              <AlertDescription className="text-foreground">
                <strong>Payment Protection:</strong> Your payment is currently held in escrow. Opening a dispute will freeze the funds until the issue is resolved. Neither you nor the seller will have access to the money during the investigation.
              </AlertDescription>
            </Alert>

            {/* Order Info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-4">Order Information</h2>
                <div className="flex items-start gap-4 mb-4">
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
                      {mockOrder.deliveredDate && <span>Delivered: {mockOrder.deliveredDate}</span>}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Seller:{' '}
                    <Link to={`/seller/${mockOrder.seller.username}`} className="text-primary hover:underline">
                      {mockOrder.seller.name}
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dispute Form */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-6">Dispute Details</h2>

                <div className="space-y-6">
                  {/* Have you contacted seller? */}
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
                    <Checkbox
                      id="contacted"
                      checked={contactedSeller}
                      onCheckedChange={(checked) => setContactedSeller(checked as boolean)}
                    />
                    <Label htmlFor="contacted" className="text-sm cursor-pointer">
                      I have attempted to contact the seller to resolve this issue
                    </Label>
                  </div>

                  {/* Dispute Type */}
                  <div>
                    <Label className="mb-3 block">What is the issue? *</Label>
                    <RadioGroup value={disputeType} onValueChange={setDisputeType}>
                      <div className="space-y-2">
                        {disputeTypes.map((type) => (
                          <div key={type.id} className="flex items-start space-x-3 p-4 border border-border rounded-xl hover:bg-muted">
                            <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                            <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                              <p className="font-medium">{type.label}</p>
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Detailed Explanation *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please provide a detailed explanation of the issue, including any communication with the seller..."
                      rows={7}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {description.length}/1000 characters
                    </p>
                  </div>

                  {/* Evidence Upload */}
                  <div>
                    <Label>Upload Evidence *</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Please provide photos, screenshots, or documents to support your claim
                    </p>
                    <div className="mt-2 border-2 border-dashed border-border rounded-2xl p-6 text-center hover:bg-muted cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">Click to upload evidence</p>
                      <p className="text-xs text-muted-foreground">Photos, screenshots, PDFs up to 10MB each (Max 10 files)</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Strong evidence helps us resolve disputes faster
                    </p>
                  </div>

                  {/* Resolution Expectation */}
                  <div className="bg-primary/10 p-4 rounded-xl">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Dispute Resolution Process
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Our team will review your dispute within 24-48 hours</li>
                      <li>• We may contact you and the seller for additional information</li>
                      <li>• Resolution typically takes 3-7 business days</li>
                      <li>• You'll receive updates via notifications and email</li>
                      <li>• Funds are held in Ezyify Wallet until resolution</li>
                    </ul>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3 p-4 border rounded-xl">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I confirm that all information provided is accurate and truthful. I understand that submitting
                      false claims may result in account suspension. I agree to cooperate with Ezyify's investigation
                      and abide by the final resolution decision.
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    className="w-full"
                    onClick={handleSubmitDispute}
                    disabled={!disputeType || !description || !agreedToTerms}
                  >
                    Submit Dispute
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Options */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Before You Proceed</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Contact the Seller</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Most issues can be resolved quickly by messaging the seller directly
                      </p>
                      <Link to={`/messages/${mockOrder.seller.username}`}>
                        <Button variant="outline" size="sm">Message Seller</Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Package className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Request Return or Refund</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        If the product is defective or not as described, you can request a return
                      </p>
                      <div className="flex gap-2">
                        <Link to="/orders/return-request">
                          <Button variant="outline" size="sm">Request Return</Button>
                        </Link>
                        <Link to="/orders/refund-request">
                          <Button variant="outline" size="sm">Request Refund</Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Get Help</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Our support team is here to help with any questions or concerns
                      </p>
                      <Link to="/help">
                        <Button variant="outline" size="sm">Contact Support</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}