import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreVertical,
  Download,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { SellerLayout } from '../../components/SellerLayout';
import { mockProducts } from '../../data/enhanced-mock-data';

// Order type definition
interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
  };
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  shippingAddress: string;
  createdAt: string;
}

// Mock Orders Data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-1001',
    customer: {
      name: 'Ahmed Hassan',
      email: 'ahmed@email.com',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    products: [{ productId: '1', quantity: 1 }, { productId: '2', quantity: 2 }],
    total: 157.50,
    status: 'pending',
    paymentStatus: 'paid',
    shippingAddress: 'New York, USA',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-1002',
    customer: {
      name: 'Sarah Ahmed',
      email: 'sarah@email.com',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    products: [{ productId: '3', quantity: 1 }],
    total: 32.00,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: 'Los Angeles, USA',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-1003',
    customer: {
      name: 'Mike Johnson',
      email: 'mike@email.com',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    products: [{ productId: '4', quantity: 1 }, { productId: '5', quantity: 1 }],
    total: 89.00,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: 'Chicago, USA',
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-1004',
    customer: {
      name: 'Emma Williams',
      email: 'emma@email.com',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    products: [{ productId: '1', quantity: 2 }],
    total: 90.00,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: 'Houston, USA',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-1005',
    customer: {
      name: 'John Smith',
      email: 'john@email.com',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    products: [{ productId: '6', quantity: 1 }],
    total: 125.00,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: 'Phoenix, USA',
    createdAt: '2024-01-11'
  }
];

export default function OrderManagement() {

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    processing: mockOrders.filter(o => o.status === 'processing').length,
    shipped: mockOrders.filter(o => o.status === 'shipped').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length,
    cancelled: mockOrders.filter(o => o.status === 'cancelled').length,
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === 'all' || order.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-warning/10 text-warning', icon: Clock },
      processing: { color: 'bg-info/10 text-info', icon: Package },
      shipped: { color: 'bg-primary/10 text-primary', icon: Truck },
      delivered: { color: 'bg-success/10 text-success', icon: CheckCircle },
      cancelled: { color: 'bg-error/10 text-error', icon: XCircle },
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalRevenue = mockOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <SellerLayout>
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Order Management — Ezyify Seller" description="Manage all orders in your Ezyify seller store." />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="mb-1 sm:mb-2 text-foreground text-xl sm:text-2xl lg:text-3xl">Order Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Process and fulfill customer orders</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Package className="w-7 h-7 sm:w-8 sm:h-8 text-info bg-info/10 p-1.5 sm:p-2 rounded-xl" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-xl sm:text-2xl text-foreground font-semibold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-warning bg-amber-500/10 p-1.5 sm:p-2 rounded-xl" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl sm:text-2xl text-foreground font-semibold">{stats.pending + stats.processing}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Truck className="w-7 h-7 sm:w-8 sm:h-8 text-primary bg-primary/10 p-1.5 sm:p-2 rounded-xl" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Shipped</p>
                  <p className="text-xl sm:text-2xl text-foreground font-semibold">{stats.shipped}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-success bg-success/10 p-1.5 sm:p-2 rounded-xl" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Revenue</p>
                  <p className="text-xl sm:text-2xl text-foreground font-semibold">${Math.round(totalRevenue).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order number or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-3 sm:px-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full grid grid-cols-5 h-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">All</span>
                  <span className="sm:hidden">All</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden">⏳</span>
                </TabsTrigger>
                <TabsTrigger value="processing" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Processing</span>
                  <span className="sm:hidden">🔄</span>
                </TabsTrigger>
                <TabsTrigger value="shipped" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Shipped</span>
                  <span className="sm:hidden">🚚</span>
                </TabsTrigger>
                <TabsTrigger value="delivered" className="text-xs sm:text-sm px-2 py-2">
                  <span className="hidden sm:inline">Delivered</span>
                  <span className="sm:hidden">✓</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-4 sm:mt-6">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div>
                              <Link to={`/seller/order-detail/${order.id}`} className="font-medium hover:text-primary">
                                {order.orderNumber}
                              </Link>
                              <p className="text-xs text-muted-foreground">{order.shippingAddress}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={order.customer.avatar} />
                                <AvatarFallback>{order.customer.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{order.customer.name}</p>
                                <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {order.products.slice(0, 3).map((p, idx) => {
                                const product = mockProducts.find(mp => mp.id === p.productId);
                                return product ? (
                                  <img
                      loading="lazy"
                                    key={idx}
                                    src={product.image}
                                    alt=""
                                    className="w-8 h-8 rounded object-cover bg-muted"
                                  />
                                ) : null;
                              })}
                              {order.products.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{order.products.length - 3}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${order.total.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.paymentStatus === 'paid' ? 'default' :
                              order.paymentStatus === 'pending' ? 'secondary' :
                              'destructive'
                            }>
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {order.createdAt}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/seller/order-detail/${order.id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Message Customer
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Truck className="w-4 h-4 mr-2" />
                                  Update Status
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="space-y-3">
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <Link to={`/seller/order-detail/${order.id}`} className="font-medium text-sm hover:text-primary block truncate">
                                {order.orderNumber}
                              </Link>
                              <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(order.status)}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-11 w-11 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link to={`/seller/order-detail/${order.id}`}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Truck className="w-4 h-4 mr-2" />
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={order.customer.avatar} />
                              <AvatarFallback>{order.customer.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{order.customer.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{order.shippingAddress}</p>
                            </div>
                          </div>

                          {/* Products & Total */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                              {order.products.slice(0, 3).map((p, idx) => {
                                const product = mockProducts.find(mp => mp.id === p.productId);
                                return product ? (
                                  <img
                      loading="lazy"
                                    key={idx}
                                    src={product.image}
                                    alt=""
                                    className="w-8 h-8 rounded object-cover bg-muted"
                                  />
                                ) : null;
                              })}
                              {order.products.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{order.products.length - 3}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">${order.total.toLocaleString()}</p>
                              <Badge variant={
                                order.paymentStatus === 'paid' ? 'default' :
                                order.paymentStatus === 'pending' ? 'secondary' :
                                'destructive'
                              } className="text-xs mt-1">
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6 sm:mt-8 bg-primary/5 border-primary/20">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">⚡ Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Button variant="outline" className="justify-start text-sm">
                <Package className="w-4 h-4 mr-2" />
                <span className="truncate">Process Pending Orders</span>
              </Button>
              <Button variant="outline" className="justify-start text-sm">
                <Truck className="w-4 h-4 mr-2" />
                <span className="truncate">Update Tracking Info</span>
              </Button>
              <Button variant="outline" className="justify-start text-sm">
                <Download className="w-4 h-4 mr-2" />
                <span className="truncate">Download Shipping Labels</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}