import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Code, Copy, Check, Play, Database, Server, Zap, Shield,
  ChevronRight, ChevronDown, Terminal, FileJson, ArrowRight,
  BookOpen, GitBranch, Package, DollarSign, ShoppingBag, Users,
  Lock, AlertCircle, Info, ExternalLink, Download, Search, Filter, Rocket
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  category: string;
  authentication: boolean;
  requestBody?: any;
  responseExample: any;
  usedIn: string[];
  priority: 'critical' | 'high' | 'medium';
  status: 'not-started' | 'in-progress' | 'complete';
}

export default function APIIntegrationPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['payment']));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');

  const apiEndpoints: APIEndpoint[] = [
    // Payment & Escrow APIs (5)
    {
      id: 'process-payment',
      name: 'Process Payment',
      method: 'POST',
      path: '/api/v1/payments/process',
      description: 'Process payment and create escrow transaction',
      category: 'payment',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        orderId: 'ord_abc123',
        amount: 125.50,
        currency: 'BDT',
        paymentMethod: 'wallet',
        paymentDetails: {}
      },
      responseExample: {
        success: true,
        transactionId: 'txn_xyz789',
        escrowId: 'esc_abc456',
        status: 'held_in_escrow',
        message: 'Payment held securely in escrow until delivery is confirmed'
      },
      usedIn: ['/checkout', '/user/wallet']
    },
    {
      id: 'release-escrow',
      name: 'Release Escrow to Seller',
      method: 'POST',
      path: '/api/v1/escrow/release',
      description: 'Release escrow funds to seller after buyer confirmation',
      category: 'payment',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        orderId: 'ord_abc123',
        buyerId: 'usr_buyer_001',
        productCondition: 'good',
        confirmationImages: [],
        confirmationType: 'manual'
      },
      responseExample: {
        success: true,
        escrowReleased: true,
        sellerPayout: 106.68,
        platformCommission: 12.63,
        gatewayFee: 6.19,
        orderStatus: 'completed'
      },
      usedIn: ['/user/order-tracking/:orderId']
    },
    {
      id: 'check-escrow-status',
      name: 'Check Escrow Status',
      method: 'GET',
      path: '/api/v1/escrow/status/:orderId',
      description: 'Check current escrow status and auto-release countdown',
      category: 'payment',
      authentication: true,
      priority: 'high',
      status: 'not-started',
      responseExample: {
        orderId: 'ord_abc123',
        escrowStatus: 'locked',
        amount: 125.50,
        createdAt: '2026-01-15T10:30:00Z',
        releaseCondition: 'buyer_confirmation',
        autoReleaseDate: '2026-01-22T10:30:00Z',
        daysUntilAutoRelease: 7
      },
      usedIn: ['/orders/:orderId', '/seller/order-detail/:id']
    },
    {
      id: 'freeze-escrow',
      name: 'Freeze Escrow (Dispute)',
      method: 'POST',
      path: '/api/v1/escrow/freeze',
      description: 'Freeze escrow funds when dispute is raised',
      category: 'payment',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        orderId: 'ord_abc123',
        reason: 'product_damaged',
        reportedBy: 'buyer',
        evidence: []
      },
      responseExample: {
        success: true,
        escrowStatus: 'frozen',
        disputeId: 'disp_abc123',
        estimatedResolutionTime: '24-48 hours',
        message: 'Escrow frozen. Dispute team will contact you within 24 hours.'
      },
      usedIn: ['/orders/dispute']
    },
    {
      id: 'calculate-commission',
      name: 'Calculate Platform Commission',
      method: 'POST',
      path: '/api/v1/commission/calculate',
      description: 'Calculate platform commission for order (hidden from buyers)',
      category: 'payment',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        orderId: 'ORD-2026-001234',
        productPrice: 2500.00,
        sellerId: 'USR-67890',
        productCategory: 'electronics'
      },
      responseExample: {
        success: true,
        data: {
          orderAmount: 2500.00,
          commissionRate: 5,
          commissionAmount: 125.00,
          sellerReceives: 2375.00,
          breakdown: {
            productPrice: 2500.00,
            platformFee: 125.00,
            paymentProcessingFee: 0.00
          }
        }
      },
      usedIn: ['/seller/earnings', '/seller-dashboard']
    },

    // Order Management APIs (6)
    {
      id: 'create-order',
      name: 'Create Order',
      method: 'POST',
      path: '/api/v1/orders/create',
      description: 'Create new order from checkout',
      category: 'order',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        buyerId: 'usr_buyer_001',
        sellerId: 'usr_seller_002',
        items: [
          {
            productId: 'prd_123',
            quantity: 2,
            price: 45.00
          }
        ],
        shippingAddress: {},
        shippingMethod: 'standard',
        paymentMethod: 'wallet',
        total: 125.50
      },
      responseExample: {
        success: true,
        orderId: 'ord_abc123',
        orderNumber: 'EZY-2026-001234',
        status: 'payment_pending',
        escrowCreated: false,
        nextStep: 'process_payment'
      },
      usedIn: ['/checkout']
    },
    {
      id: 'get-order-details',
      name: 'Get Order Details',
      method: 'GET',
      path: '/api/v1/orders/:orderId',
      description: 'Retrieve complete order information with escrow status',
      category: 'order',
      authentication: true,
      priority: 'high',
      status: 'not-started',
      responseExample: {
        orderId: 'ord_abc123',
        orderNumber: 'EZY-2026-001234',
        status: 'in_transit',
        buyer: { id: 'usr_001', name: 'John Doe' },
        seller: { id: 'usr_002', name: 'Jane\'s Shop' },
        items: [],
        total: 125.50,
        escrow: {
          status: 'locked',
          amount: 125.50,
          releaseCondition: 'buyer_confirmation'
        },
        tracking: {
          carrier: 'FedEx',
          trackingNumber: '1234567890',
          status: 'in_transit',
          estimatedDelivery: '2026-01-20'
        }
      },
      usedIn: ['/orders/:orderId', '/user/order-tracking/:orderId']
    },
    {
      id: 'update-order-status',
      name: 'Update Order Status',
      method: 'PATCH',
      path: '/api/v1/orders/:orderId/status',
      description: 'Update order status (seller only for shipping)',
      category: 'order',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        status: 'shipped',
        updatedBy: 'seller',
        trackingInfo: {
          carrier: 'FedEx',
          trackingNumber: '1234567890'
        }
      },
      responseExample: {
        success: true,
        orderId: 'ord_abc123',
        newStatus: 'shipped',
        notificationSent: true
      },
      usedIn: ['/seller/orders', '/seller/order-detail/:id']
    },
    {
      id: 'get-buyer-orders',
      name: 'Get Buyer Orders',
      method: 'GET',
      path: '/api/v1/orders/buyer/:buyerId',
      description: 'Get all orders for a buyer with filtering',
      category: 'order',
      authentication: true,
      priority: 'high',
      status: 'not-started',
      responseExample: {
        orders: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 45,
          hasMore: true
        }
      },
      usedIn: ['/user/orders']
    },
    {
      id: 'get-seller-orders',
      name: 'Get Seller Orders',
      method: 'GET',
      path: '/api/v1/orders/seller/:sellerId',
      description: 'Get all orders for a seller with filtering',
      category: 'order',
      authentication: true,
      priority: 'high',
      status: 'not-started',
      responseExample: {
        orders: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 45,
          hasMore: true
        }
      },
      usedIn: ['/seller/orders']
    },
    {
      id: 'mark-delivered',
      name: 'Mark Order Delivered',
      method: 'POST',
      path: '/api/v1/orders/:orderId/delivered',
      description: 'Seller marks order as delivered with proof',
      category: 'order',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        sellerId: 'usr_seller_002',
        deliveryProof: {
          images: [],
          carrierConfirmation: 'delivered_timestamp',
          signature: 'buyer_signature.jpg'
        }
      },
      responseExample: {
        success: true,
        orderId: 'ord_abc123',
        status: 'delivered',
        awaitingBuyerConfirmation: true,
        autoReleaseDate: '2026-01-22T10:30:00Z'
      },
      usedIn: ['/seller/order-detail/:id']
    },

    // Wallet APIs (4)
    {
      id: 'wallet-balance',
      name: 'Get Wallet Balance',
      method: 'GET',
      path: '/api/v1/wallet/:userId',
      description: 'Retrieve user wallet balance with breakdown',
      category: 'wallet',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      responseExample: {
        userId: 'usr_001',
        totalBalance: 124.50,
        availableBalance: 79.20,
        pendingBalance: 45.30,
        onHoldBalance: 0,
        currency: 'BDT',
        lastUpdated: '2026-01-21T15:45:00Z'
      },
      usedIn: ['/user/wallet', '/seller/earnings']
    },
    {
      id: 'wallet-transactions',
      name: 'Get Wallet Transactions',
      method: 'GET',
      path: '/api/v1/wallet/:userId/transactions',
      description: 'Get transaction history with filtering',
      category: 'wallet',
      authentication: true,
      priority: 'high',
      status: 'not-started',
      responseExample: {
        transactions: [
          {
            id: 'txn_001',
            type: 'credit',
            amount: 45.30,
            description: 'Refund for Order #EZY-2026-001234',
            status: 'completed',
            date: '2026-01-20T10:30:00Z'
          }
        ],
        pagination: {}
      },
      usedIn: ['/user/wallet']
    },
    {
      id: 'add-funds',
      name: 'Add Funds to Wallet',
      method: 'POST',
      path: '/api/v1/wallet/add-funds',
      description: 'Add money to wallet via payment gateway',
      category: 'wallet',
      authentication: true,
      priority: 'high',
      status: 'not-started',
      requestBody: {
        userId: 'usr_001',
        amount: 100.00,
        paymentMethod: 'card',
        paymentToken: 'tok_visa_1234'
      },
      responseExample: {
        success: true,
        transactionId: 'txn_003',
        newBalance: 179.20,
        amount: 100.00
      },
      usedIn: ['/user/wallet']
    },
    {
      id: 'wallet-deduct',
      name: 'Use Wallet for Purchase',
      method: 'POST',
      path: '/api/v1/wallet/deduct',
      description: 'Deduct amount from wallet for order payment',
      category: 'wallet',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        userId: 'usr_001',
        amount: 125.50,
        orderId: 'ord_abc123',
        description: 'Order #EZY-2026-001236'
      },
      responseExample: {
        success: true,
        transactionId: 'txn_004',
        newBalance: 53.70,
        deductedAmount: 125.50
      },
      usedIn: ['/checkout']
    },

    // Refund & Dispute APIs (4)
    {
      id: 'request-refund',
      name: 'Request Refund',
      method: 'POST',
      path: '/api/v1/refunds/request',
      description: 'Submit refund request with evidence',
      category: 'refund',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        orderId: 'ord_abc123',
        buyerId: 'usr_001',
        reason: 'product_damaged',
        description: 'Product arrived broken',
        evidence: []
      },
      responseExample: {
        success: true,
        refundRequestId: 'ref_abc123',
        status: 'submitted',
        estimatedResolution: '24-48 hours',
        message: 'Your refund request has been submitted.'
      },
      usedIn: ['/orders/refund-request']
    },
    {
      id: 'get-refund-status',
      name: 'Get Refund Status',
      method: 'GET',
      path: '/api/v1/refunds/:refundRequestId',
      description: 'Check status of refund request',
      category: 'refund',
      authentication: true,
      priority: 'high',
      status: 'not-started',
      responseExample: {
        refundRequestId: 'ref_abc123',
        orderId: 'ord_abc123',
        status: 'approved',
        requestedAmount: 125.50,
        approvedAmount: 119.31,
        reason: 'Seller fault - product damaged',
        refundMethod: 'ezyify_wallet',
        timeline: []
      },
      usedIn: ['/orders/refund-status/:refundId']
    },
    {
      id: 'approve-refund',
      name: 'Approve/Reject Refund',
      method: 'POST',
      path: '/api/v1/refunds/:refundRequestId/decision',
      description: 'Admin decision on refund request',
      category: 'refund',
      authentication: true,
      priority: 'high',
      status: 'not-started',
      requestBody: {
        refundRequestId: 'ref_abc123',
        decision: 'approved',
        approvedAmount: 119.31,
        notes: 'Valid claim - seller at fault'
      },
      responseExample: {
        success: true,
        refundRequestId: 'ref_abc123',
        status: 'approved',
        refundProcessed: true,
        walletCredited: true
      },
      usedIn: ['/admin/refunds']
    },
    {
      id: 'create-dispute',
      name: 'Create Dispute',
      method: 'POST',
      path: '/api/v1/disputes/create',
      description: 'Escalate issue to dispute resolution',
      category: 'refund',
      authentication: true,
      priority: 'critical',
      status: 'not-started',
      requestBody: {
        orderId: 'ord_abc123',
        initiatedBy: 'buyer',
        reason: 'product_not_as_described',
        evidence: [],
        description: 'Product completely different from listing'
      },
      responseExample: {
        success: true,
        disputeId: 'disp_abc123',
        status: 'open',
        assignedTo: 'dispute_team',
        estimatedResolution: '3-5 business days'
      },
      usedIn: ['/orders/dispute']
    },

    // Withdrawal APIs (3)
    {
      id: 'withdraw-request',
      name: 'Seller Withdrawal Request',
      method: 'POST',
      path: '/api/v1/seller/withdraw',
      description: 'Process seller withdrawal request with KYC validation',
      category: 'withdrawal',
      authentication: true,
      priority: 'high',
      status: 'not-started',
      requestBody: {
        sellerId: 'usr_seller_002',
        amount: 5000.00,
        withdrawalMethod: 'bank_transfer',
        bankAccountId: 'ba_12345'
      },
      responseExample: {
        success: true,
        withdrawalId: 'wd_abc123',
        status: 'pending',
        amount: 5000.00,
        processingFee: 50.00,
        estimatedArrival: '2026-01-25T00:00:00Z'
      },
      usedIn: ['/seller/withdraw']
    },
    {
      id: 'withdrawal-status',
      name: 'Get Withdrawal Status',
      method: 'GET',
      path: '/api/v1/seller/withdraw/:withdrawalId',
      description: 'Check status of withdrawal request',
      category: 'withdrawal',
      authentication: true,
      priority: 'medium',
      status: 'not-started',
      responseExample: {
        withdrawalId: 'wd_abc123',
        status: 'completed',
        amount: 5000.00,
        processingFee: 50.00,
        netAmount: 4950.00,
        processedAt: '2026-01-24T10:30:00Z'
      },
      usedIn: ['/seller/withdraw']
    },
    {
      id: 'withdrawal-history',
      name: 'Get Withdrawal History',
      method: 'GET',
      path: '/api/v1/seller/withdraw/history',
      description: 'Get all withdrawal transactions for seller',
      category: 'withdrawal',
      authentication: true,
      priority: 'medium',
      status: 'not-started',
      responseExample: {
        withdrawals: [],
        totalWithdrawn: 25000.00,
        pendingWithdrawals: 5000.00,
        pagination: {}
      },
      usedIn: ['/seller/earnings', '/seller/withdraw']
    }
  ];

  const categories = [
    { id: 'payment', name: 'Payment & Escrow', icon: DollarSign, count: 5, color: 'text-success' },
    { id: 'order', name: 'Order Management', icon: ShoppingBag, count: 6, color: 'text-info' },
    { id: 'wallet', name: 'Wallet Operations', icon: DollarSign, count: 4, color: 'text-primary' },
    { id: 'refund', name: 'Refund & Disputes', icon: AlertCircle, count: 4, color: 'text-warning' },
    { id: 'withdrawal', name: 'Withdrawals', icon: Package, count: 3, color: 'text-pink-400' }
  ];

  const getMethodColor = (method: string) => {
    const colors = {
      'GET': 'bg-success',
      'POST': 'bg-primary',
      'PUT': 'bg-warning',
      'PATCH': 'bg-warning',
      'DELETE': 'bg-error'
    };
    return colors[method as keyof typeof colors] || 'bg-muted-foreground';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      'critical': <Badge variant="destructive">Critical</Badge>,
      'high': <Badge variant="default" className="bg-warning">High</Badge>,
      'medium': <Badge variant="secondary">Medium</Badge>
    };
    return badges[priority as keyof typeof badges];
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const stats = {
    total: apiEndpoints.length,
    critical: apiEndpoints.filter(e => e.priority === 'critical').length,
    complete: apiEndpoints.filter(e => e.status === 'complete').length,
    inProgress: apiEndpoints.filter(e => e.status === 'in-progress').length
  };

  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || endpoint.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 pb-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-brand-gradient">
                🔌 API Integration Playground
              </h1>
              <p className="text-muted-foreground text-lg">
                Complete API Reference for Backend Implementation
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export OpenAPI Spec
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Full Documentation
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-info/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Endpoints</p>
                    <p className="text-3xl font-bold text-info">{stats.total}</p>
                  </div>
                  <Server className="h-10 w-10 text-info" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-error/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Critical Priority</p>
                    <p className="text-3xl font-bold text-error">{stats.critical}</p>
                  </div>
                  <AlertCircle className="h-10 w-10 text-error" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-success/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Complete</p>
                    <p className="text-3xl font-bold text-success">{stats.complete}</p>
                  </div>
                  <Check className="h-10 w-10 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-yellow-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-3xl font-bold text-warning">{stats.inProgress}</p>
                  </div>
                  <Zap className="h-10 w-10 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Important Note */}
        <Alert className="mb-6 border-info/50 bg-info/5">
          <Info className="h-5 w-5" />
          <AlertTitle>Backend Integration Guide</AlertTitle>
          <AlertDescription>
            All endpoints below are documented with request/response examples. Click any endpoint to see full details, 
            code samples, and the frontend pages that consume each API. Priority markers indicate implementation urgency.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar - Categories & Endpoints */}
          <div className="lg:col-span-1 space-y-4">
            {categories.map((category) => {
              const categoryEndpoints = apiEndpoints.filter(e => e.category === category.id);
              const isExpanded = expandedCategories.has(category.id);
              const Icon = category.icon;

              return (
                <Card key={category.id} className="bg-card border-border">
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${category.color}`} />
                        <div>
                          <CardTitle className="text-base">{category.name}</CardTitle>
                          <CardDescription>{category.count} endpoints</CardDescription>
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="space-y-2">
                      {categoryEndpoints.map((endpoint) => (
                        <div
                          key={endpoint.id}
                          onClick={() => setSelectedEndpoint(endpoint)}
                          className={`p-3 rounded-2xl cursor-pointer transition-all ${
                            selectedEndpoint?.id === endpoint.id
                              ? 'bg-info/20 border border-info/50'
                              : 'bg-muted hover:bg-muted border border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`${getMethodColor(endpoint.method)} text-white`}>
                              {endpoint.method}
                            </Badge>
                            {getPriorityBadge(endpoint.priority)}
                          </div>
                          <p className="text-sm font-semibold text-white mb-1">{endpoint.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{endpoint.path}</p>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Right Content - Endpoint Details */}
          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`${getMethodColor(selectedEndpoint.method)} text-white`}>
                          {selectedEndpoint.method}
                        </Badge>
                        {getPriorityBadge(selectedEndpoint.priority)}
                        {selectedEndpoint.authentication && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Auth Required
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl mb-2">{selectedEndpoint.name}</CardTitle>
                      <code className="text-sm text-info bg-muted px-3 py-2 rounded block mb-3">
                        {selectedEndpoint.path}
                      </code>
                      <CardDescription className="text-base">
                        {selectedEndpoint.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Used In */}
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Used in Frontend Pages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEndpoint.usedIn.map((page) => (
                        <Link key={page} to={page}>
                          <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                            {page}
                            <ExternalLink className="h-3 w-3" />
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <Tabs defaultValue="request" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted">
                      <TabsTrigger value="request">Request</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                      <TabsTrigger value="code">Code Sample</TabsTrigger>
                    </TabsList>

                    {/* Request Tab */}
                    <TabsContent value="request" className="space-y-4">
                      {selectedEndpoint.requestBody ? (
                        <>
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-muted-foreground">Request Body</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(JSON.stringify(selectedEndpoint.requestBody, null, 2), 'request')}
                            >
                              {copiedCode === 'request' ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto border border-border">
                            <code className="text-sm text-success">
                              {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
                            </code>
                          </pre>
                        </>
                      ) : (
                        <Alert className="border-border">
                          <Info className="h-4 w-4" />
                          <AlertDescription>No request body required for this endpoint</AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>

                    {/* Response Tab */}
                    <TabsContent value="response" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-muted-foreground">Response Example</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(JSON.stringify(selectedEndpoint.responseExample, null, 2), 'response')}
                        >
                          {copiedCode === 'response' ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto border border-border">
                        <code className="text-sm text-info">
                          {JSON.stringify(selectedEndpoint.responseExample, null, 2)}
                        </code>
                      </pre>
                    </TabsContent>

                    {/* Code Sample Tab */}
                    <TabsContent value="code" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-muted-foreground">JavaScript/TypeScript Example</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(generateCodeSample(selectedEndpoint), 'code')}
                        >
                          {copiedCode === 'code' ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto border border-border">
                        <code className="text-sm text-warning">
                          {generateCodeSample(selectedEndpoint)}
                        </code>
                      </pre>
                    </TabsContent>
                  </Tabs>

                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <Terminal className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">Select an API Endpoint</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Choose an endpoint from the left sidebar to view detailed documentation, 
                    request/response examples, and code samples.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <Card className="mt-8 bg-card border-info/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-info">
              <Rocket className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-info flex items-center justify-center text-white font-bold">1</div>
                  <h4 className="font-semibold">Authentication</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Implement JWT-based authentication for all protected endpoints
                </p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => {
                  const authEndpoint = apiEndpoints.find(e => e.id === 'auth-login');
                  if (authEndpoint) setSelectedEndpoint(authEndpoint);
                }}>
                  View Auth APIs
                </Button>
              </div>
              <div className="p-4 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center text-white font-bold">2</div>
                  <h4 className="font-semibold">Payment Integration</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Critical: Implement escrow system first for secure transactions
                </p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => {
                  const paymentEndpoint = apiEndpoints.find(e => e.id === 'create-escrow');
                  if (paymentEndpoint) setSelectedEndpoint(paymentEndpoint);
                }}>
                  View Payment APIs
                </Button>
              </div>
              <div className="p-4 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-white font-bold">3</div>
                  <h4 className="font-semibold">Testing</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Use these examples to build comprehensive API tests
                </p>
                <Link to="/admin/pre-deployment-checker">
                  <Button size="sm" variant="outline" className="w-full">
                    Testing Checklist
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateCodeSample(endpoint: APIEndpoint): string {
  return `// ${endpoint.name}
const ${toCamelCase(endpoint.name)} = async () => {
  const response = await fetch('${endpoint.path}', {
    method: '${endpoint.method}',${endpoint.authentication ? `
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },` : `
    headers: {
      'Content-Type': 'application/json'
    },`}${endpoint.requestBody ? `
    body: JSON.stringify(${JSON.stringify(endpoint.requestBody, null, 2)})` : ''}
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    console.error('Error:', data.error);
    throw new Error(data.error);
  }
};

// Usage
try {
  const result = await ${toCamelCase(endpoint.name)}();
  // Handle success
} catch (error) {
  // Handle error
  console.error(error);
}`;
}

function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
}