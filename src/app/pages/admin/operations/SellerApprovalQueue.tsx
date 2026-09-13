import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, CheckCircle, XCircle, Clock, Eye, Shield, TrendingUp, Users, Store, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';

// Skeleton Component
function SellerApprovalSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-96 mb-2" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>

        {/* Stats Skeleton */}
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

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        {/* Application Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SellerApprovalQueue() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [reviewDialog, setReviewDialog] = useState<{open: boolean, seller: SellerApplication | null}>({
    open: false,
    seller: null
  });
  const [reviewNote, setReviewNote] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | ''>('');

  const stats = {
    pending: 23,
    reviewing: 8,
    approved: 145,
    rejected: 12,
    avgReviewTime: '2.5 days'
  };

  const applications: SellerApplication[] = [
    {
      id: 'app1',
      businessName: 'TechGear Pro',
      ownerName: 'Mike Johnson',
      email: 'mike@techgear.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      category: 'Electronics',
      appliedDate: '2 days ago',
      status: 'pending',
      documents: {
        businessLicense: { uploaded: true, url: '#' },
        taxId: { uploaded: true, url: '#' },
        idProof: { uploaded: true, url: '#' },
        addressProof: { uploaded: true, url: '#' }
      },
      businessDetails: {
        type: 'LLC',
        address: '123 Tech Street, San Francisco, CA 94102',
        website: 'https://techgear.com',
        expectedRevenue: '₹100k - ₹500k/month'
      }
    },
    {
      id: 'app2',
      businessName: 'Fashion Boutique',
      ownerName: 'Sarah Williams',
      email: 'sarah@fashionboutique.com',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      category: 'Fashion',
      appliedDate: '5 days ago',
      status: 'pending',
      documents: {
        businessLicense: { uploaded: true, url: '#' },
        taxId: { uploaded: true, url: '#' },
        idProof: { uploaded: true, url: '#' },
        addressProof: { uploaded: false }
      },
      businessDetails: {
        type: 'Sole Proprietor',
        address: '456 Fashion Ave, New York, NY 10001',
        expectedRevenue: '₹50k - ₹100k/month'
      }
    },
    {
      id: 'app3',
      businessName: 'Home Decor Plus',
      ownerName: 'Emma Davis',
      email: 'emma@homedecor.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      category: 'Home & Garden',
      appliedDate: '1 day ago',
      status: 'reviewing',
      documents: {
        businessLicense: { uploaded: true, url: '#' },
        taxId: { uploaded: true, url: '#' },
        idProof: { uploaded: true, url: '#' },
        addressProof: { uploaded: true, url: '#' }
      },
      businessDetails: {
        type: 'Corporation',
        address: '789 Decor Lane, Los Angeles, CA 90001',
        website: 'https://homedecorplus.com',
        expectedRevenue: '₹500k - ₹1M/month'
      }
    }
  ];

  const handleReview = (seller: SellerApplication) => {
    setReviewDialog({ open: true, seller });
    setReviewNote('');
    setActionType('');
  };

  const confirmAction = () => {
    toast.success(`Seller ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
    setReviewDialog({ open: false, seller: null });
    setReviewNote('');
    setActionType('');
  };

  const getStatusBadge = (status: string) => {
    const config: {[key: string]: {label: string, color: string, icon: React.ReactNode}} = {
      'pending': { label: 'Pending', color: 'bg-warning/10 text-warning', icon: <Clock className="w-3 h-3 mr-1" /> },
      'reviewing': { label: 'Reviewing', color: 'bg-info/10 text-info', icon: <Eye className="w-3 h-3 mr-1" /> },
      'approved': { label: 'Approved', color: 'bg-success/10 text-success', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      'rejected': { label: 'Rejected', color: 'bg-error/10 text-error', icon: <XCircle className="w-3 h-3 mr-1" /> }
    };
    const item = config[status];
    return <Badge className={`${item.color} flex items-center w-fit`}>{item.icon}{item.label}</Badge>;
  };

  const getDocumentStatus = (docs: SellerApplication['documents']) => {
    const total = 4;
    const uploaded = Object.values(docs).filter(d => d.uploaded).length;
    return { uploaded, total, complete: uploaded === total };
  };

  const filteredApplications = applications.filter(app => {
    if (selectedTab === 'all') return true;
    return app.status === selectedTab;
  });

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <SellerApprovalSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="mb-6">
        <h1 className="text-foreground mb-2">Seller Approval Queue</h1>
        <p className="text-muted-foreground">Review and approve seller applications for the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reviewing</p>
                <p className="text-2xl font-bold text-info">{stats.reviewing}</p>
              </div>
              <Eye className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-success">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-error">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Review</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgReviewTime}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Seller Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="reviewing">Reviewing ({stats.reviewing})</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab}>
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const docStatus = getDocumentStatus(app.documents);
                  return (
                    <Card key={app.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={app.avatar} alt={app.ownerName} />
                            <AvatarFallback>{app.ownerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusBadge(app.status)}
                                  <Badge className="bg-primary/10 text-primary">
                                    {app.category}
                                  </Badge>
                                  {docStatus.complete ? (
                                    <Badge className="bg-success/10 text-success">
                                      <FileText className="w-3 h-3 mr-1" />
                                      All docs uploaded
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-warning/10 text-warning">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      {docStatus.uploaded}/{docStatus.total} docs
                                    </Badge>
                                  )}
                                </div>
                                
                                <h3 className="font-semibold text-foreground mb-1">{app.businessName}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Owner: {app.ownerName} • {app.businessDetails.type}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                  <div>
                                    <p className="text-muted-foreground">Email</p>
                                    <p className="text-foreground">{app.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Phone</p>
                                    <p className="text-foreground">{app.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Expected Revenue</p>
                                    <p className="text-foreground">{app.businessDetails.expectedRevenue}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Applied</p>
                                    <p className="text-foreground">{app.appliedDate}</p>
                                  </div>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                  {app.businessDetails.address}
                                </p>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleReview(app)}
                                  className="bg-info hover:bg-info/90"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Review
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-success hover:bg-success/5"
                                  onClick={() => {
                                    setReviewDialog({ open: true, seller: app });
                                    setActionType('approve');
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-error hover:bg-error/5"
                                  onClick={() => {
                                    setReviewDialog({ open: true, seller: app });
                                    setActionType('reject');
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({...reviewDialog, open})}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Seller Application</DialogTitle>
            <DialogDescription>
              Review all details and documents before approval
            </DialogDescription>
          </DialogHeader>
          
          {reviewDialog.seller && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {/* Seller Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={reviewDialog.seller.avatar} alt={reviewDialog.seller.ownerName} />
                  <AvatarFallback>{reviewDialog.seller.ownerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{reviewDialog.seller.businessName}</h3>
                  <p className="text-sm text-muted-foreground">Owner: {reviewDialog.seller.ownerName}</p>
                  <p className="text-sm text-muted-foreground">{reviewDialog.seller.email}</p>
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Business Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <p className="text-muted-foreground mb-1">Business Type</p>
                    <p className="text-foreground font-medium">{reviewDialog.seller.businessDetails.type}</p>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <p className="text-muted-foreground mb-1">Category</p>
                    <p className="text-foreground font-medium">{reviewDialog.seller.category}</p>
                  </div>
                  <div className="p-3 bg-muted rounded col-span-2">
                    <p className="text-muted-foreground mb-1">Address</p>
                    <p className="text-foreground font-medium">{reviewDialog.seller.businessDetails.address}</p>
                  </div>
                  {reviewDialog.seller.businessDetails.website && (
                    <div className="p-3 bg-muted rounded col-span-2">
                      <p className="text-muted-foreground mb-1">Website</p>
                      <a 
                        href={reviewDialog.seller.businessDetails.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-info hover:underline"
                      >
                        {reviewDialog.seller.businessDetails.website}
                      </a>
                    </div>
                  )}
                  <div className="p-3 bg-muted rounded col-span-2">
                    <p className="text-muted-foreground mb-1">Expected Monthly Revenue</p>
                    <p className="text-foreground font-medium">{reviewDialog.seller.businessDetails.expectedRevenue}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Uploaded Documents</h4>
                <div className="space-y-2">
                  {Object.entries(reviewDialog.seller.documents).map(([key, doc]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        {doc.uploaded ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-error" />
                        )}
                        <span className="text-sm text-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      {doc.uploaded && doc.url && (
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Selection */}
              {!actionType && (
                <div className="p-4 bg-info/8 rounded-xl">
                  <p className="text-sm text-info">
                    Select an action below to proceed with the review.
                  </p>
                </div>
              )}

              {actionType && (
                <div className="space-y-2">
                  <Label htmlFor="note">Review Note (Required)</Label>
                  <Textarea
                    id="note"
                    placeholder={
                      actionType === 'approve' 
                        ? 'Provide approval notes...' 
                        : 'Provide rejection reason...'
                    }
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setReviewDialog({ open: false, seller: null });
                setActionType('');
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            {!actionType && (
              <>
                <Button 
                  onClick={() => setActionType('reject')}
                  className="w-full sm:w-auto bg-error hover:bg-error"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
                <Button 
                  onClick={() => setActionType('approve')}
                  className="w-full sm:w-auto bg-success hover:bg-success/90"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Seller
                </Button>
              </>
            )}
            {actionType && (
              <Button 
                onClick={confirmAction}
                disabled={!reviewNote.trim()}
                className={`w-full sm:w-auto ${
                  actionType === 'approve' 
                    ? 'bg-success hover:bg-success/90' 
                    : 'bg-error hover:bg-error'
                }`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}