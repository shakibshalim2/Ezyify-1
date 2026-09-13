import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, XCircle, Shield, MessageCircle, Package, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';

type RefundStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';

interface RefundTimeline {
  status: string;
  date: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
}

export default function RefundStatusPage() {
  const { refundId } = useParams();
  
  const mockRefund = {
    id: refundId || 'REF-2026-001',
    orderId: 'ORD-12345',
    status: 'under_review' as RefundStatus,
    requestedAmount: 79.99,
    approvedAmount: 0,
    reason: 'Product not as described',
    requestDate: 'Jan 10, 2026',
    lastUpdate: 'Jan 12, 2026',
    estimatedResolution: 'Jan 15-17, 2026',
    product: {
      name: 'Premium Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      price: 79.99
    },
    timeline: [
      {
        status: 'Refund Requested',
        date: 'Jan 10, 2026, 2:30 PM',
        description: 'Your refund request has been submitted successfully',
        completed: true,
        icon: <Package className="w-5 h-5" />
      },
      {
        status: 'Under Review',
        date: 'Jan 11, 2026, 10:15 AM',
        description: 'Our team is reviewing your refund request and evidence',
        completed: true,
        icon: <Clock className="w-5 h-5" />
      },
      {
        status: 'Seller Response',
        date: '',
        description: 'Waiting for seller response (if required)',
        completed: false,
        icon: <MessageCircle className="w-5 h-5" />
      },
      {
        status: 'Resolution',
        date: '',
        description: 'Final decision will be communicated',
        completed: false,
        icon: <CheckCircle2 className="w-5 h-5" />
      },
      {
        status: 'Refund Processed',
        date: '',
        description: 'Amount will be credited to your Ezyify Wallet',
        completed: false,
        icon: <RefreshCw className="w-5 h-5" />
      }
    ]
  };

  const getStatusBadge = (status: RefundStatus) => {
    const config = {
      submitted: { label: 'Submitted', variant: 'secondary' as const, color: 'text-info' },
      under_review: { label: 'Under Review', variant: 'secondary' as const, color: 'text-warning' },
      approved: { label: 'Approved', variant: 'default' as const, color: 'text-success' },
      rejected: { label: 'Rejected', variant: 'destructive' as const, color: 'text-error' },
      completed: { label: 'Completed', variant: 'default' as const, color: 'text-success' }
    };

    const { label, variant, color } = config[status];
    return (
      <Badge variant={variant} className="text-sm">
        {label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Refund Status — Ezyify" description="Check the status of your Ezyify refund request." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Refund Request Details</h1>
            <p className="text-muted-foreground">Refund ID: {mockRefund.id}</p>
          </div>
          {getStatusBadge(mockRefund.status)}
        </div>

        {/* Status Alert */}
        <Alert className="mb-6 border-primary/30 bg-primary/10">
          <Shield className="w-4 h-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Escrow Protected:</strong> Your payment remains securely held in escrow while we review your refund request. 
            Funds will not be released to the seller during this period.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Refund Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status Card */}
            <Card className="text-white border-0" style={{ background: "var(--brand-gradient)" }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 mb-1">Refund Under Review</p>
                    <p className="text-sm text-white/90">
                      Estimated resolution: {mockRefund.estimatedResolution}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-white/90 text-sm bg-white/10 rounded-2xl p-3">
                  <Shield className="w-4 h-4" />
                  <span>Payment frozen in escrow until resolved</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockRefund.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                            ${event.completed ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}
                          `}
                        >
                          {event.icon}
                        </div>
                        {index < mockRefund.timeline.length - 1 && (
                          <div 
                            className={`w-0.5 flex-1 my-2 ${event.completed ? 'bg-success/40' : 'bg-border'}`} 
                            style={{ minHeight: '40px' }}
                          ></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <h4 className={`font-semibold ${event.completed ? 'text-success' : 'text-foreground'}`}>
                          {event.status}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        {event.date && (
                          <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <img
                      loading="lazy"
                    src={mockRefund.product.image}
                    alt={mockRefund.product.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium mb-1 text-foreground">{mockRefund.product.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">${mockRefund.product.price.toLocaleString()}</p>
                    <Link to={`/orders/${mockRefund.orderId}`} className="text-sm text-primary hover:underline">
                      View Order #{mockRefund.orderId}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund Reason */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reason</p>
                  <p className="font-medium text-foreground">{mockRefund.reason}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Requested Amount</p>
                  <p className="text-2xl font-bold text-foreground">${mockRefund.requestedAmount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Refund Summary */}
          <div className="space-y-6">
            {/* Key Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Important Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Request Date</p>
                  <p className="font-medium text-foreground">{mockRefund.requestDate}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Update</p>
                  <p className="font-medium text-foreground">{mockRefund.lastUpdate}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Expected Resolution</p>
                  <p className="font-medium text-success">{mockRefund.estimatedResolution}</p>
                </div>
              </CardContent>
            </Card>

            {/* Refund Policy Info */}
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-base">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    Our team reviews your request and evidence
                  </p>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    Seller may be contacted for their response
                  </p>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    Decision communicated within 3-5 business days
                  </p>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    If approved, refund credited to your Ezyify Wallet
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Have questions? Our team is here to help
                </p>
              </CardContent>
            </Card>

            {/* Escrow Protection Notice */}
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Buyer Protection Active</p>
                    <p className="text-xs text-muted-foreground">
                      Your payment is frozen in escrow. No funds will be released until your refund request is resolved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
