import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { useParams, Link } from 'react-router';
import { Progress } from '../../components/ui/progress';
import { Truck, MapPin, Package, CheckCircle, Phone, MessageCircle, Shield, Clock, Info, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Label } from '../../components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';

interface SellerOrderGroup {
  sellerId: string;
  sellerName: string;
  sellerUsername: string;
  sellerAvatar: string;
  status: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  escrowAmount: number;
  escrowStatus: 'held' | 'released' | 'disputed';
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  trackingEvents: Array<{
    title: string;
    location: string;
    timestamp: string;
    icon: React.ReactNode;
    active: boolean;
  }>;
}

export default function MultiSellerOrderTrackingPage() {
  const { orderId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(0);
  const [confirmDialogs, setConfirmDialogs] = useState<{[key: string]: boolean}>({});
  const [confirmedSellers, setConfirmedSellers] = useState<{[key: string]: boolean}>({});
  const [productConditions, setProductConditions] = useState<{[key: string]: 'good' | 'damaged' | ''}>({});
  const [orderData, setOrderData] = useState<any>(null);

  // Load order tracking data progressively
  useEffect(() => {
    const loadTrackingData = () => {
      // Mock data with multiple sellers
      const data = {
        orderId: orderId || 'EZY' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        orderDate: 'Jan 3, 2026',
        deliveryAddress: '123 Main Street, San Francisco, CA 94102',
        phone: '+1 (555) 123-4567',
        totalAmount: 159.97,
        sellerGroups: [
          {
            sellerId: 'seller1',
            sellerName: 'TechStore Official',
            sellerUsername: 'techstore',
            sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            status: 'delivered',
            trackingNumber: '1234567890123',
            carrier: 'FedEx',
            estimatedDelivery: 'Jan 5, 2026',
            actualDelivery: 'Jan 5, 2026, 2:30 PM',
            escrowAmount: 79.99,
            escrowStatus: 'held' as const,
            items: [
              {
                id: '1',
                name: 'Wireless Bluetooth Headphones',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
                quantity: 1,
                price: 79.99
              }
            ],
            trackingEvents: [
              {
                title: 'Delivered',
                location: 'San Francisco, CA',
                timestamp: 'Jan 5, 2026, 2:30 PM',
                icon: <CheckCircle className="w-5 h-5" />,
                active: true
              },
              {
                title: 'Out for Delivery',
                location: 'San Francisco, CA',
                timestamp: 'Jan 5, 2026, 8:30 AM',
                icon: <Truck className="w-5 h-5" />,
                active: false
              },
              {
                title: 'In Transit',
                location: 'Oakland Distribution Center, CA',
                timestamp: 'Jan 4, 2026, 11:45 PM',
                icon: <MapPin className="w-5 h-5" />,
                active: false
              },
              {
                title: 'Shipped',
                location: 'Seller Location',
                timestamp: 'Jan 3, 2026, 2:00 PM',
                icon: <Package className="w-5 h-5" />,
                active: false
              }
            ]
          },
          {
            sellerId: 'seller2',
            sellerName: 'Fashion Hub',
            sellerUsername: 'fashionhub',
            sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
            status: 'in_transit',
            trackingNumber: '9876543210987',
            carrier: 'UPS',
            estimatedDelivery: 'Jan 6, 2026',
            escrowAmount: 31.98,
            escrowStatus: 'held' as const,
            items: [
              {
                id: '2',
                name: 'Phone Case - Clear',
                image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200',
                quantity: 2,
                price: 15.99
              }
            ],
            trackingEvents: [
              {
                title: 'In Transit',
                location: 'Oakland Distribution Center, CA',
                timestamp: 'Jan 5, 2026, 10:00 AM',
                icon: <MapPin className="w-5 h-5" />,
                active: true
              },
              {
                title: 'Departed Facility',
                location: 'Los Angeles, CA',
                timestamp: 'Jan 4, 2026, 3:20 PM',
                icon: <MapPin className="w-5 h-5" />,
                active: false
              },
              {
                title: 'Shipped',
                location: 'Seller Location',
                timestamp: 'Jan 3, 2026, 3:00 PM',
                icon: <Package className="w-5 h-5" />,
                active: false
              }
            ]
          },
          {
            sellerId: 'seller3',
            sellerName: 'HomeGoods Depot',
            sellerUsername: 'homegoods',
            sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            status: 'delivered',
            trackingNumber: '5551234567890',
            carrier: 'DHL',
            estimatedDelivery: 'Jan 5, 2026',
            actualDelivery: 'Jan 5, 2026, 1:15 PM',
            escrowAmount: 48.00,
            escrowStatus: 'held' as const,
            items: [
              {
                id: '3',
                name: 'LED Desk Lamp',
                image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200',
                quantity: 1,
                price: 48.00
              }
            ],
            trackingEvents: [
              {
                title: 'Delivered',
                location: 'San Francisco, CA',
                timestamp: 'Jan 5, 2026, 1:15 PM',
                icon: <CheckCircle className="w-5 h-5" />,
                active: true
              },
              {
                title: 'Out for Delivery',
                location: 'San Francisco, CA',
                timestamp: 'Jan 5, 2026, 7:00 AM',
                icon: <Truck className="w-5 h-5" />,
                active: false
              },
              {
                title: 'Shipped',
                location: 'Seller Location',
                timestamp: 'Jan 3, 2026, 1:00 PM',
                icon: <Package className="w-5 h-5" />,
                active: false
              }
            ]
          }
        ]
      };

      setOrderData(data);
      setIsLoading(false);
    };

    loadTrackingData();
  }, [orderId]);

  const getStatusBadge = (status: string) => {
    const statusConfig: {[key: string]: {label: string, color: string}} = {
      'delivered': { label: 'Delivered', color: 'bg-success/10 text-success' },
      'in_transit': { label: 'In Transit', color: 'bg-info/10 text-info' },
      'shipped': { label: 'Shipped', color: 'bg-primary/10 text-primary' },
      'processing': { label: 'Processing', color: 'bg-warning/10 text-warning' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'bg-muted text-foreground' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getEscrowBadge = (status: string) => {
    const statusConfig: {[key: string]: {label: string, color: string}} = {
      'held': { label: 'Held in Escrow', color: 'bg-info/10 text-info' },
      'released': { label: 'Released', color: 'bg-success/10 text-success' },
      'disputed': { label: 'Under Dispute', color: 'bg-error/10 text-error' }
    };
    
    const config = statusConfig[status];
    return <Badge className={config.color}><Shield className="w-3 h-3 mr-1" />{config.label}</Badge>;
  };

  const handleConfirmDelivery = (sellerId: string, condition: 'good' | 'damaged') => {
    if (condition === 'damaged') {
      toast.info('Moving to dispute resolution. Our team will contact you within 24 hours.');
      setConfirmDialogs({...confirmDialogs, [sellerId]: false});
    } else {
      setConfirmedSellers({...confirmedSellers, [sellerId]: true});
      setConfirmDialogs({...confirmDialogs, [sellerId]: false});
    }
  };

  const totalDelivered = orderData ? orderData.sellerGroups.filter(g => g.status === 'delivered').length : 0;
  const totalSellers = orderData ? orderData.sellerGroups.length : 0;
  const overallProgress = totalSellers > 0 ? (totalDelivered / totalSellers) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-8">
      <SEO title="Track Orders — Ezyify" description="Track orders from multiple sellers on Ezyify." />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-foreground">Track Your Multi-Seller Order</h1>
        <p className="text-muted-foreground">Order ID: {orderData ? orderData.orderId : 'Loading...'}</p>
        <Badge className="mt-2 bg-primary/10 text-primary">
          <Store className="w-3 h-3 mr-1" />
          {totalSellers} Sellers
        </Badge>
      </div>

      {/* Overall Progress Card */}
      <Card className="mb-6 text-white border-0" style={{ background: "var(--brand-gradient)" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 mb-1">Overall Order Progress</p>
              <p className="text-2xl font-bold">{totalDelivered} of {totalSellers} packages delivered</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
          </div>
          <Progress value={overallProgress} className="h-2 bg-white/20 mb-4" />
          
          {/* Escrow Summary */}
          <div className="flex items-center gap-2 text-white/90 text-sm bg-white/10 rounded-2xl p-3">
            <Shield className="w-4 h-4" />
            <span>₹{orderData ? orderData.totalAmount.toFixed(2) : '0.00'} total - Payments held securely in escrow per seller</span>
          </div>
        </CardContent>
      </Card>

      {/* Seller Tabs */}
      <Tabs value={selectedSeller.toString()} onValueChange={(v) => setSelectedSeller(parseInt(v))}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          {orderData ? orderData.sellerGroups.map((seller, index) => (
            <TabsTrigger key={seller.sellerId} value={index.toString()} className="flex items-center gap-2">
              <img
                      loading="lazy" src={seller.sellerAvatar} alt={seller.sellerName} className="w-5 h-5 rounded-full object-cover" />
              <span className="hidden sm:inline">{seller.sellerName.split(' ')[0]}</span>
              {getStatusBadge(seller.status)}
            </TabsTrigger>
          )) : (
            <Skeleton className="w-full h-10 col-span-3" />
          )}
        </TabsList>

        {orderData ? orderData.sellerGroups.map((seller, index) => (
          <TabsContent key={seller.sellerId} value={index.toString()}>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left - Tracking Timeline */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Status Card */}
                <Card
                  className="border-0 text-white"
                  style={{ background: seller.status === 'delivered' ? 'linear-gradient(135deg,#10b981,#059669)' : 'var(--brand-gradient)' }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        {seller.status === 'delivered' ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <Truck className="w-8 h-8" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80 mb-1">
                          {seller.status === 'delivered' ? 'Package delivered!' : 'Package on the way!'}
                        </p>
                        <p className="text-sm text-white/90">
                          {seller.status === 'delivered' 
                            ? `Delivered: ${seller.actualDelivery}`
                            : `Estimated: ${seller.estimatedDelivery}`
                          }
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={seller.status === 'delivered' ? 100 : 60} 
                      className="h-2 bg-white/20 mb-4" 
                    />
                    
                    {/* Escrow Status */}
                    <div className="flex items-center justify-between gap-2 text-white/90 text-sm bg-white/10 rounded-2xl p-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>₹{seller.escrowAmount.toFixed(2)} held in escrow</span>
                      </div>
                      {getEscrowBadge(seller.escrowStatus)}
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tracking History - {seller.carrier}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Tracking #: <code className="bg-muted px-2 py-0.5 rounded">{seller.trackingNumber}</code>
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {seller.trackingEvents.map((event, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`
                                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                ${event.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}
                              `}
                            >
                              {event.icon}
                            </div>
                            {idx < seller.trackingEvents.length - 1 && (
                              <div className={`w-0.5 flex-1 my-2 ${event.active ? 'bg-success/40' : 'bg-border'}`} style={{ minHeight: '40px' }}></div>
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <h4 className={`font-semibold ${event.active ? 'text-success' : 'text-foreground'}`}>
                              {event.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                            <p className="text-xs text-muted-foreground mt-1">{event.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items for this Seller */}
                <Card>
                  <CardHeader>
                    <CardTitle>Items from {seller.sellerName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {seller.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <img
                      loading="lazy"
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-2xl object-cover bg-muted"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium mb-1 text-foreground">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            <p className="text-sm font-bold text-primary">₹{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t">
                        <p className="text-sm font-semibold text-foreground">
                          Subtotal: ₹{seller.escrowAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right - Seller Details & Actions */}
              <div className="space-y-6">
                {/* Seller Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Seller Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                      loading="lazy"
                        src={seller.sellerAvatar}
                        alt={seller.sellerName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{seller.sellerName}</p>
                        <p className="text-sm text-muted-foreground">@{seller.sellerUsername}</p>
                      </div>
                    </div>
                    <Link to={`/seller/${seller.sellerUsername}`}>
                      <Button variant="outline" size="sm" className="w-full mb-2">
                        <Store className="w-4 h-4 mr-2" />
                        Visit Store
                      </Button>
                    </Link>
                    <Link to={`/user/order-tracking/${orderId}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Package className="w-4 h-4 mr-2" />
                        View Order Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Delivery Confirmation */}
                {seller.status === 'delivered' && !confirmedSellers[seller.sellerId] && (
                  <Card className="border-2 border-primary">
                    <CardContent className="py-6">
                      <h3 className="font-semibold mb-3 text-foreground">Confirm Delivery</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Package delivered on {seller.actualDelivery}. Please confirm receipt.
                      </p>
                      
                      <Alert className="bg-accent border-border mb-4">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-muted-foreground text-xs">
                          ₹{seller.escrowAmount.toFixed(2)} held in escrow for this seller
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-success hover:bg-success/90"
                          onClick={() => setConfirmDialogs({...confirmDialogs, [seller.sellerId]: true})}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Delivery
                        </Button>
                        
                        <Link to={`/orders/refund-request?orderId=${orderId}&sellerId=${seller.sellerId}`} className="block">
                          <Button variant="outline" className="w-full border-error/30 text-error hover:bg-error/5">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Report Issue
                          </Button>
                        </Link>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        Confirming releases payment to this seller only
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Confirmed State */}
                {confirmedSellers[seller.sellerId] && (
                  <Card className="border-2 border-success/30 bg-success/5">
                    <CardContent className="py-6">
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                        <h3 className="font-semibold text-success mb-1">Delivery Confirmed</h3>
                        <p className="text-sm text-success">
                          Payment released to {seller.sellerName}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Shipping Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Carrier</p>
                      <p className="font-medium text-foreground">{seller.carrier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      {getStatusBadge(seller.status)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Escrow Status</p>
                      {getEscrowBadge(seller.escrowStatus)}
                    </div>
                  </CardContent>
                </Card>

                {/* Support */}
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground mb-3">
                      Issues with this package? Contact support.
                    </p>
                    <Button variant="outline" size="sm" className="w-full mb-2">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat with Support
                    </Button>
                    <Link to={`/orders/dispute?orderId=${orderId}&sellerId=${seller.sellerId}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        File Dispute
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialogs[seller.sellerId] && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Confirm Delivery from {seller.sellerName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-foreground">
                      Have you received your items? Please indicate the product condition.
                    </p>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Product Condition</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setProductConditions({...productConditions, [seller.sellerId]: 'good'})}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            productConditions[seller.sellerId] === 'good'
                              ? 'border-success bg-success/8'
                              : 'border-border hover:border-success/40'
                          }`}
                        >
                          <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                            productConditions[seller.sellerId] === 'good' ? 'text-success' : 'text-muted-foreground'
                          }`} />
                          <p className={`text-sm font-medium ${
                            productConditions[seller.sellerId] === 'good' ? 'text-success' : 'text-foreground'
                          }`}>
                            Good Condition
                          </p>
                        </button>
                        
                        <button
                          onClick={() => setProductConditions({...productConditions, [seller.sellerId]: 'damaged'})}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            productConditions[seller.sellerId] === 'damaged'
                              ? 'border-error bg-error/8'
                              : 'border-border hover:border-error/40'
                          }`}
                        >
                          <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${
                            productConditions[seller.sellerId] === 'damaged' ? 'text-error' : 'text-muted-foreground'
                          }`} />
                          <p className={`text-sm font-medium ${
                            productConditions[seller.sellerId] === 'damaged' ? 'text-error' : 'text-foreground'
                          }`}>
                            Damaged/Issues
                          </p>
                        </button>
                      </div>
                    </div>

                    {productConditions[seller.sellerId] === 'damaged' && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          This will create a dispute. ₹{seller.escrowAmount.toFixed(2)} will remain in escrow.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {productConditions[seller.sellerId] === 'good' && (
                      <Alert className="bg-success/8 border-success/20">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <AlertDescription className="text-xs text-success">
                          ₹{seller.escrowAmount.toFixed(2)} will be released to {seller.sellerName}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setConfirmDialogs({...confirmDialogs, [seller.sellerId]: false});
                          setProductConditions({...productConditions, [seller.sellerId]: ''});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-success hover:bg-success/90"
                        disabled={!productConditions[seller.sellerId]}
                        onClick={() => handleConfirmDelivery(seller.sellerId, productConditions[seller.sellerId] as 'good' | 'damaged')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {productConditions[seller.sellerId] === 'damaged' ? 'Report Issue' : 'Confirm'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        )) : null}
      </Tabs>

      {/* Delivery Address Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Delivery Address (All Packages)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground mb-2">{orderData ? orderData.deliveryAddress : 'Loading...'}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{orderData ? orderData.phone : 'Loading...'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}