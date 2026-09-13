import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Package, Truck, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { SEO } from '../../components/SEO';
import { EmptyOrders } from '../../components/EmptyStates';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  items: {
    id: string;
    productId?: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusMessage: string;
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
  seller: string;
  estimatedDelivery?: string;
}

// SKELETON FOR INSTANT UI
function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
  processing: { icon: Package, color: 'text-primary', bgColor: 'bg-primary/10' },
  shipped: { icon: Truck, color: 'text-info', bgColor: 'bg-info/10' },
  delivered: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
  cancelled: { icon: XCircle, color: 'text-error', bgColor: 'bg-error/10' },
};

export default function OrdersPage() {
  // ✅ CRITICAL: ALL useState HOOKS MUST BE AT TOP - BEFORE ANY EARLY RETURNS
  // This ensures consistent hook order on every render (React Rules of Hooks)
  const [activeTab, setActiveTab] = useState('all');
  const [cancelledOrders, setCancelledOrders] = useState<Set<string>>(new Set());
  const [pageData, setPageData] = useState<{
    orders: Order[];
  } | null>(null);
  const navigate = useNavigate();

  // ✅ All useEffect hooks after useState
  useEffect(() => {
    const loadOrdersData = () => {
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'EZY12345678',
          items: [
            {
              id: '1',
              productId: 'prod-001',
              name: 'Premium Wireless Headphones',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
              price: 45.00,
              quantity: 1
            }
          ],
          total: 54.99,
          status: 'shipped',
          statusMessage: 'Your order is on the way',
          orderDate: 'Jan 2, 2024',
          deliveryDate: 'Jan 6, 2024',
          trackingNumber: 'TRK987654321',
          seller: 'TechHub Store'
        },
        {
          id: '2',
          orderNumber: 'EZY12345679',
          items: [
            {
              id: '2',
              productId: 'prod-002',
              name: 'Smart Watch Pro',
              image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
              price: 120.00,
              quantity: 1
            },
            {
              id: '3',
              productId: 'prod-003',
              name: 'Wireless Earbuds',
              image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200',
              price: 25.00,
              quantity: 1
            }
          ],
          total: 154.99,
          status: 'delivered',
          statusMessage: 'Delivered on Dec 28',
          orderDate: 'Dec 24, 2023',
          deliveryDate: 'Dec 28, 2023',
          seller: 'GadgetHub'
        },
        {
          id: '3',
          orderNumber: 'EZY12345680',
          items: [
            {
              id: '4',
              name: 'Laptop Stand',
              image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200',
              price: 18.00,
              quantity: 1
            }
          ],
          total: 27.99,
          status: 'processing',
          statusMessage: 'Your order is being prepared',
          orderDate: 'Jan 4, 2024',
          seller: 'OfficeEssentials'
        }
      ];

      setPageData({ orders: mockOrders });
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadOrdersData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadOrdersData, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!pageData) {
    return <OrdersSkeleton />;
  }

  const { orders } = pageData;

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const getStatusColor = (status: Order['status']) => {
    const config = statusConfig[status];
    return `${config.bgColor} ${config.color}`;
  };

  const getStatusProgress = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 25;
      case 'processing':
        return 50;
      case 'shipped':
        return 75;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Orders - Ezyify" description="Track and manage your orders" />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-semibold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
            {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-3 min-h-[44px] font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-foreground -mb-[2px]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-border-strong transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-foreground">Order #{order.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placed on {order.orderDate}
                      </p>
                      {/* Payment Status - Escrow Indicator */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Payment held in escrow
                        </p>
                      )}
                      {order.status === 'delivered' && (
                        <p className="text-xs text-success mt-1">
                          Awaiting delivery confirmation
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-foreground">${order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <img loading="lazy"
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-2xl object-cover bg-muted"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1 text-foreground">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          <p className="text-sm font-bold text-foreground">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Status & Actions */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        {order.status === 'shipped' && (
                          <p className="text-sm text-muted-foreground">{order.statusMessage}</p>
                        )}
                        {order.estimatedDelivery && (
                          <p className="text-sm text-muted-foreground">
                            Estimated delivery: {order.estimatedDelivery}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {order.trackingNumber && (
                          <div className="text-right mr-4">
                            <p className="text-sm text-muted-foreground">Tracking Number</p>
                            <p className="text-sm font-mono font-medium text-foreground">{order.trackingNumber}</p>
                          </div>
                        )}
                        <Link to={`/order/${order.id}`}>
                          <button className="px-4 py-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors text-foreground">
                            View Details
                          </button>
                        </Link>
                        {order.status === 'pending' && !cancelledOrders.has(order.id) && (
                          <button
                            className="px-4 py-3 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors"
                            onClick={() => {
                              if (window.confirm(`Cancel order #${order.id}? This cannot be undone.`)) {
                                setCancelledOrders(prev => new Set([...prev, order.id]));
                                toast.success(`Order #${order.id} has been cancelled`);
                              }
                            }}
                          >
                            Cancel Order
                          </button>
                        )}
                        {cancelledOrders.has(order.id) && (
                          <span className="px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm">Cancelled</span>
                        )}
                        {order.status === 'delivered' && (
                          <>
                            <Link to={`/order/${order.id}`}>
                              <button className="px-4 py-3 bg-success text-white rounded-xl hover:bg-success/90 transition-colors flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Confirm Delivery
                              </button>
                            </Link>
                            <Link to={`/orders/refund-request?orderId=${order.id}`}>
                              <button className="px-3 py-3 border border-error/30 text-error rounded-xl hover:bg-error/5 transition-colors flex items-center gap-2 text-sm">
                                Request Refund
                              </button>
                            </Link>
                            <button
                              className="px-4 py-3 text-white rounded-xl shadow-brand hover:shadow-brand-lg transition-all"
                              style={{ background: "var(--brand-gradient)" }}
                              onClick={() => navigate(`/product/${order.items[0]?.productId || order.items[0]?.id}?review=true`)}
                            >
                              Leave Review
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}