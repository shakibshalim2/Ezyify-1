import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Filter, Scale, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Users, DollarSign, Eye, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';

// Skeleton Component
function DisputeResolutionSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-96 mb-2" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface Dispute {
  id: string;
  orderId: string;
  type: 'product_issue' | 'non_delivery' | 'wrong_item' | 'damaged' | 'refund_delay';
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  amount: number;
  buyer: {
    name: string;
    avatar: string;
    id: string;
  };
  seller: {
    name: string;
    avatar: string;
    id: string;
  };
  productName: string;
  daysSinceCreated: number;
  messagesCount: number;
  evidenceCount: number;
}

export default function DisputeResolutionDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionAction, setResolutionAction] = useState<'buyer' | 'seller' | 'partial' | ''>('');

  // Mock data
  const stats = {
    openDisputes: 23,
    underReview: 45,
    resolvedToday: 12,
    averageResolutionTime: '2.5 days',
  };

  const disputes: Dispute[] = [
    {
      id: 'DIS123456',
      orderId: 'ORD789012',
      type: 'product_issue',
      status: 'under_review',
      priority: 'high',
      createdAt: '2026-01-20T10:30:00Z',
      amount: 89.99,
      buyer: {
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        id: 'USR001',
      },
      seller: {
        name: 'TechGadgets Store',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechGadgets',
        id: 'USR002',
      },
      productName: 'Wireless Earbuds Pro',
      daysSinceCreated: 2,
      messagesCount: 4,
      evidenceCount: 2,
    },
    {
      id: 'DIS123457',
      orderId: 'ORD789013',
      type: 'non_delivery',
      status: 'open',
      priority: 'urgent',
      createdAt: '2026-01-22T08:15:00Z',
      amount: 149.99,
      buyer: {
        name: 'Michael Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
        id: 'USR003',
      },
      seller: {
        name: 'Fashion Hub',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fashion',
        id: 'USR004',
      },
      productName: 'Designer Backpack',
      daysSinceCreated: 0,
      messagesCount: 2,
      evidenceCount: 1,
    },
    {
      id: 'DIS123458',
      orderId: 'ORD789014',
      type: 'damaged',
      status: 'under_review',
      priority: 'medium',
      createdAt: '2026-01-19T14:20:00Z',
      amount: 299.99,
      buyer: {
        name: 'Emily Davis',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
        id: 'USR005',
      },
      seller: {
        name: 'Home Decor Plus',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HomeDecor',
        id: 'USR006',
      },
      productName: 'Ceramic Vase Set',
      daysSinceCreated: 3,
      messagesCount: 6,
      evidenceCount: 4,
    },
    {
      id: 'DIS123459',
      orderId: 'ORD789015',
      type: 'wrong_item',
      status: 'open',
      priority: 'medium',
      createdAt: '2026-01-21T16:45:00Z',
      amount: 59.99,
      buyer: {
        name: 'James Wilson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
        id: 'USR007',
      },
      seller: {
        name: 'Book Haven',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BookHaven',
        id: 'USR008',
      },
      productName: 'Fiction Novel Collection',
      daysSinceCreated: 1,
      messagesCount: 3,
      evidenceCount: 2,
    },
    {
      id: 'DIS123460',
      orderId: 'ORD789016',
      type: 'refund_delay',
      status: 'open',
      priority: 'low',
      createdAt: '2026-01-21T11:30:00Z',
      amount: 34.99,
      buyer: {
        name: 'Sophia Martinez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
        id: 'USR009',
      },
      seller: {
        name: 'Beauty Essentials',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beauty',
        id: 'USR010',
      },
      productName: 'Skincare Set',
      daysSinceCreated: 1,
      messagesCount: 2,
      evidenceCount: 0,
    },
  ];

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.productName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dispute.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product_issue':
        return 'Product Issue';
      case 'non_delivery':
        return 'Non-Delivery';
      case 'wrong_item':
        return 'Wrong Item';
      case 'damaged':
        return 'Damaged Item';
      case 'refund_delay':
        return 'Refund Delay';
      default:
        return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-error/10 text-error border-error/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
        return <Scale className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleResolveDispute = () => {
    if (!selectedDispute || !resolutionAction) return;

    // Close dialog and reset
    setSelectedDispute(null);
    setResolutionNote('');
    setResolutionAction('');
  };

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <DisputeResolutionSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Scale className="h-8 w-8" />
                Dispute Resolution Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and resolve buyer-seller disputes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openDisputes}</div>
              <p className="text-xs text-muted-foreground">Needs immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Scale className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.underReview}</div>
              <p className="text-xs text-muted-foreground">In investigation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedToday}</div>
              <p className="text-xs text-muted-foreground">+3 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageResolutionTime}</div>
              <p className="text-xs text-muted-foreground">Target: &lt;3 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, order, buyer, seller, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Disputes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Disputes ({filteredDisputes.length})</CardTitle>
            <CardDescription>
              Review and resolve disputes to maintain platform trust
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-mono text-sm">{dispute.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(dispute.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={dispute.buyer.avatar} />
                          <AvatarFallback>B</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{dispute.buyer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={dispute.seller.avatar} />
                          <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{dispute.seller.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {dispute.productName}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${dispute.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(dispute.priority)}>
                        {dispute.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(dispute.status)}
                        <span className="text-sm capitalize">
                          {dispute.status.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {dispute.daysSinceCreated}d
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/orders/dispute/${dispute.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setSelectedDispute(dispute)}
                            >
                              Resolve
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Resolve Dispute #{selectedDispute?.id}</DialogTitle>
                              <DialogDescription>
                                Choose the resolution action and provide a detailed explanation
                              </DialogDescription>
                            </DialogHeader>

                            {selectedDispute && (
                              <div className="space-y-4">
                                <Alert>
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    <strong>Escrow Amount:</strong> ${selectedDispute.amount.toFixed(2)} is currently locked
                                  </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Buyer</Label>
                                    <p className="font-medium">{selectedDispute.buyer.name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Seller</Label>
                                    <p className="font-medium">{selectedDispute.seller.name}</p>
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm text-muted-foreground">Product</Label>
                                  <p className="font-medium">{selectedDispute.productName}</p>
                                </div>

                                <div>
                                  <Label htmlFor="resolution-action">Resolution Action</Label>
                                  <Select value={resolutionAction} onValueChange={(value: any) => setResolutionAction(value)}>
                                    <SelectTrigger id="resolution-action">
                                      <SelectValue placeholder="Select resolution action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="buyer">
                                        Favor Buyer (Full Refund)
                                      </SelectItem>
                                      <SelectItem value="seller">
                                        Favor Seller (Release Payment)
                                      </SelectItem>
                                      <SelectItem value="partial">
                                        Partial Refund (Split Amount)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="resolution-note">Resolution Note (Required)</Label>
                                  <Textarea
                                    id="resolution-note"
                                    placeholder="Explain your decision in detail. This will be visible to both buyer and seller."
                                    value={resolutionNote}
                                    onChange={(e) => setResolutionNote(e.target.value)}
                                    className="min-h-[120px]"
                                  />
                                </div>

                                {resolutionAction && (
                                  <Alert>
                                    <AlertDescription>
                                      {resolutionAction === 'buyer' && (
                                        <>
                                          <strong>Action:</strong> ${selectedDispute.amount.toFixed(2)} will be refunded to buyer's wallet. Seller receives nothing.
                                        </>
                                      )}
                                      {resolutionAction === 'seller' && (
                                        <>
                                          <strong>Action:</strong> ${selectedDispute.amount.toFixed(2)} will be released to seller (minus commission). Buyer receives no refund.
                                        </>
                                      )}
                                      {resolutionAction === 'partial' && (
                                        <>
                                          <strong>Action:</strong> You'll need to specify the split amount. Partial refunds require manual calculation.
                                        </>
                                      )}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            )}

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedDispute(null);
                                  setResolutionNote('');
                                  setResolutionAction('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleResolveDispute}
                                disabled={!resolutionAction || !resolutionNote.trim()}
                              >
                                Confirm Resolution
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>

            {filteredDisputes.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No disputes found matching your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}