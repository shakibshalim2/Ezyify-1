import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, Package, MapPin, User, CreditCard, Truck, Phone, Mail, Download, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { SellerLayout } from '../../components/SellerLayout';
import { mockProducts } from '../../data/enhanced-mock-data';

// Mock order detail
const mockOrder = {
  id: 'ORD-2024-1001',
  orderNumber: 'ORD-2024-1001',
  status: 'processing' as const,
  paymentStatus: 'paid' as const,
  createdAt: '2024-01-15 10:30 AM',
  updatedAt: '2024-01-15 11:45 AM',
  customer: {
    name: 'Ahmed Hassan',
    email: 'ahmed@email.com',
    phone: '+1 (555) 712-3456',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  shipping: {
    address: 'House 45, Road 12, Block C',
    area: 'Manhattan',
    city: 'New York',
    postalCode: '10001',
    country: 'USA'
  },
  items: [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      image: mockProducts[0]?.image || '',
      quantity: 2,
      price: 45.00,
      total: 90.00
    },
    {
      id: '2',
      name: 'Phone Stand',
      image: mockProducts[1]?.image || '',
      quantity: 1,
      price: 32.00,
      total: 32.00
    }
  ],
  pricing: {
    subtotal: 122.00,
    shipping: 1.00,
    tax: 0,
    discount: 0,
    total: 123.00
  },
  payment: {
    method: 'Digital Wallet',
    transactionId: 'TXN123456789',
    paidAt: '2024-01-15 10:30 AM'
  },
  timeline: [
    { status: 'Order Placed', date: '2024-01-15 10:30 AM', completed: true },
    { status: 'Payment Confirmed', date: '2024-01-15 10:31 AM', completed: true },
    { status: 'Processing', date: '2024-01-15 11:45 AM', completed: true },
    { status: 'Shipped', date: '', completed: false },
    { status: 'Delivered', date: '', completed: false }
  ]
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Order Details — Ezyify Seller" description="View and manage the details of an order in your Ezyify store." />
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link to="/seller/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="font-semibold mb-1">Order #{mockOrder.id}</h1>
              <p className="text-sm text-muted-foreground">Placed on {mockOrder.createdAt}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Invoice
              </Button>
              <Button variant="outline" onClick={() => navigate(`/messages?user=${mockOrder.customer.email}`)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button onClick={() => toast.success('Order status updated to Shipped!')}>
                <Truck className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({mockOrder.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                      loading="lazy"
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover bg-muted"
                      />
                      <div className="flex-1">
                        <Link to={`/product/${item.id}`} className="font-medium hover:text-primary">
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${mockOrder.pricing.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>${mockOrder.pricing.shipping.toLocaleString()}</span>
                  </div>
                  {mockOrder.pricing.discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount:</span>
                      <span>-${mockOrder.pricing.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="text-lg">${mockOrder.pricing.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{mockOrder.customer.name}</p>
                  <p className="text-muted-foreground">{mockOrder.shipping.address}</p>
                  <p className="text-muted-foreground">{mockOrder.shipping.area}, {mockOrder.shipping.city} {mockOrder.shipping.postalCode}</p>
                  <p className="text-muted-foreground">{mockOrder.shipping.country}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{mockOrder.customer.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrder.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.completed ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          {event.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-current" />
                          )}
                        </div>
                        {index < mockOrder.timeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${event.completed ? 'bg-success/30' : 'bg-muted'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className={`font-medium ${event.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {event.status}
                        </p>
                        {event.date && (
                          <p className="text-sm text-muted-foreground mt-1">{event.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Order Status</p>
                  <Badge className="bg-info/10 text-info">
                    <Package className="w-3 h-3 mr-1" />
                    Processing
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
                  <Badge className="bg-success/10 text-success">
                    <CreditCard className="w-3 h-3 mr-1" />
                    Paid
                  </Badge>
                  <p className="text-xs text-warning mt-1 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Held in escrow until delivery
                  </p>
                </div>
                <Separator />
                <div className="text-sm space-y-1">
                  <p className="text-muted-foreground">Last Updated:</p>
                  <p className="font-medium">{mockOrder.updatedAt}</p>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={mockOrder.customer.avatar} />
                    <AvatarFallback>{mockOrder.customer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{mockOrder.customer.name}</p>
                    <p className="text-sm text-muted-foreground">Regular Customer</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{mockOrder.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{mockOrder.customer.phone}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <Link to={`/seller/customers/${mockOrder.customer.email}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Customer Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium">{mockOrder.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium text-xs">{mockOrder.payment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid At:</span>
                  <span className="font-medium text-xs">{mockOrder.payment.paidAt}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}