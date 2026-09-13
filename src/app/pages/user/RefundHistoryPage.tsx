import { SEO } from '../../components/SEO';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Download, Eye, Filter, RefreshCw, CheckCircle, Clock, XCircle, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';

interface Refund {
  id: string;
  orderId: string;
  requestDate: string;
  completedDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  amount: number;
  reason: string;
  refundMethod: 'wallet' | 'original_payment';
  productName: string;
  productImage: string;
  sellerName: string;
  adminNote?: string;
}

export default function RefundHistoryPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [refunds, setRefunds] = useState<Refund[]>([]);

  // Load refund data progressively
  useEffect(() => {
    const loadRefundData = () => {
      // Mock data
      const refundData: Refund[] = [
        {
          id: 'REF123456',
          orderId: 'ORD789012',
          requestDate: '2026-01-20T10:30:00Z',
          completedDate: '2026-01-22T16:45:00Z',
          status: 'completed',
          amount: 89.99,
          reason: 'Product defective - left earbud not working',
          refundMethod: 'wallet',
          productName: 'Wireless Earbuds Pro',
          productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200',
          sellerName: 'TechGadgets Store',
          adminNote: 'Refund approved after buyer provided evidence of defect',
        },
        {
          id: 'REF123457',
          orderId: 'ORD789013',
          requestDate: '2026-01-18T14:20:00Z',
          status: 'processing',
          amount: 149.99,
          reason: 'Item never delivered',
          refundMethod: 'wallet',
          productName: 'Designer Backpack',
          productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
          sellerName: 'Fashion Hub',
        },
        {
          id: 'REF123458',
          orderId: 'ORD789014',
          requestDate: '2026-01-15T09:10:00Z',
          completedDate: '2026-01-16T11:30:00Z',
          status: 'rejected',
          amount: 299.99,
          reason: 'Changed my mind',
          refundMethod: 'wallet',
          productName: 'Ceramic Vase Set',
          productImage: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=200',
          sellerName: 'Home Decor Plus',
          adminNote: 'Refund rejected - product already delivered and buyer confirmed receipt',
        },
        {
          id: 'REF123459',
          orderId: 'ORD789015',
          requestDate: '2026-01-12T16:45:00Z',
          completedDate: '2026-01-14T10:20:00Z',
          status: 'completed',
          amount: 59.99,
          reason: 'Wrong item received',
          refundMethod: 'wallet',
          productName: 'Fiction Novel Collection',
          productImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200',
          sellerName: 'Book Haven',
          adminNote: 'Refund approved - seller confirmed shipping error',
        },
        {
          id: 'REF123460',
          orderId: 'ORD789016',
          requestDate: '2026-01-21T11:30:00Z',
          status: 'pending',
          amount: 34.99,
          reason: 'Damaged during shipping',
          refundMethod: 'wallet',
          productName: 'Skincare Set',
          productImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200',
          sellerName: 'Beauty Essentials',
        },
        {
          id: 'REF123461',
          orderId: 'ORD789017',
          requestDate: '2026-01-10T08:00:00Z',
          completedDate: '2026-01-11T14:30:00Z',
          status: 'completed',
          amount: 199.99,
          reason: 'Product not as described',
          refundMethod: 'wallet',
          productName: 'Smart Watch Series 5',
          productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
          sellerName: 'Wearable Tech Co',
          adminNote: 'Partial refund approved - 50% returned to buyer',
        },
      ];

      setRefunds(refundData);
      setIsLoading(false);
    };

    const timer = setTimeout(() => {
      loadRefundData();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const stats = {
    totalRefunds: refunds.length,
    totalRefunded: refunds
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + r.amount, 0),
    pending: refunds.filter((r) => r.status === 'pending').length,
    processing: refunds.filter((r) => r.status === 'processing').length,
  };

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.sellerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const refundDate = new Date(refund.requestDate);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - refundDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dateFilter === '7days' && daysDiff > 7) matchesDate = false;
      if (dateFilter === '30days' && daysDiff > 30) matchesDate = false;
      if (dateFilter === '90days' && daysDiff > 90) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'approved':
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'rejected':
        return 'bg-error/10 text-error border-error/20';
      case 'processing':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleViewRefund = (refundId: string) => {
    navigate(`/orders/refund-status/${refundId}`);
  };

  const handleDownloadReceipt = (refund: Refund) => {
    // Simulate PDF download
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Refund History — Ezyify" description="View your refund and return history on Ezyify." />
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/orders')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold">Refund History</h1>
              <p className="text-sm text-muted-foreground">
                Track all your refund requests and statuses
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRefunds}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRefunded.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">To your wallet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting admin decision</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <RefreshCw className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
              <p className="text-xs text-muted-foreground">Being processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by refund ID, order ID, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Refunds Table */}
        <Card>
          <CardHeader>
            <CardTitle>Refund Requests ({filteredRefunds.length})</CardTitle>
            <CardDescription>
              Complete history of all your refund requests
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 object-cover rounded" />
                          <div>
                            <p className="font-medium">
                              <Skeleton className="h-4 w-32" />
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Order #
                              <Skeleton className="h-4 w-20" />
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="font-semibold">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <Skeleton className="h-4 w-20" />
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-muted text-muted-foreground border-border">
                          <Clock className="h-4 w-4" />
                          <span className="ml-2 capitalize">pending</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredRefunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell className="font-mono text-sm">{refund.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                      loading="lazy"
                            src={refund.productImage}
                            alt={refund.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{refund.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              Order #{refund.orderId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{refund.sellerName}</TableCell>
                      <TableCell className="font-semibold">${refund.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(refund.requestDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(refund.status)}>
                          {getStatusIcon(refund.status)}
                          <span className="ml-2 capitalize">{refund.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRefund(refund.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {refund.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReceipt(refund)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>

            {filteredRefunds.length === 0 && (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No refunds found</p>
                <p className="text-sm text-muted-foreground">
                  You haven't requested any refunds yet, or no results match your filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">About Refunds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">All refunds go to your Ezyify Wallet</p>
                <p className="text-muted-foreground">
                  Refunded amounts are instantly available in your wallet for future purchases
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Processing Time</p>
                <p className="text-muted-foreground">
                  Most refunds are reviewed within 24-48 hours. Complex cases may take up to 5 business days
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Escrow Protection</p>
                <p className="text-muted-foreground">
                  Funds are held in escrow during dispute resolution. Neither party can access the money until resolved
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}