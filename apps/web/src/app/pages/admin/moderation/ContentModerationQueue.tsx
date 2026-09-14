import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Filter, AlertTriangle, CheckCircle, XCircle, Eye, Flag, MessageSquare, Image, Video, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';

interface FlaggedContent {
  id: string;
  type: string;
  content: any;
  flaggedBy?: string | any;
  reportedBy?: string | any;
  reason: string;
  severity?: string;
  timestamp?: string;
  status: string;
  priority?: string;
  flagCount?: number;
  [key: string]: any;
}

// Skeleton Component
function ContentModerationSkeleton() {
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

        {/* Content Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Skeleton className="w-32 h-32 rounded-xl flex-shrink-0" />
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

export default function ContentModerationQueue() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [reviewDialog, setReviewDialog] = useState<{open: boolean, content: FlaggedContent | null}>({
    open: false,
    content: null
  });
  const [reviewNote, setReviewNote] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'remove' | ''>('');

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <ContentModerationSkeleton />;
  }

  // Mock flagged content
  const flaggedContent: FlaggedContent[] = [
    {
      id: 'flag1',
      type: 'post',
      content: {
        title: 'Amazing product review!',
        text: 'This is the best product ever! Check out my link...',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
      },
      reportedBy: {
        name: 'John Doe',
        username: 'johndoe',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
      },
      author: {
        name: 'Spam Account',
        username: 'spammer123',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
      },
      reason: 'Contains spam links and promotional content',
      category: 'Spam',
      flagCount: 15,
      priority: 'high',
      reportedAt: '2 hours ago',
      status: 'pending'
    },
    {
      id: 'flag2',
      type: 'product',
      content: {
        title: 'Fake Designer Watch',
        text: 'Luxury watch at 90% discount!',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400'
      },
      reportedBy: {
        name: 'Sarah Chen',
        username: 'sarahc',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
      },
      author: {
        name: 'Fake Seller',
        username: 'fakeseller',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100'
      },
      reason: 'Counterfeit product - trademark violation',
      category: 'Counterfeit',
      flagCount: 8,
      priority: 'urgent',
      reportedAt: '30 minutes ago',
      status: 'pending'
    },
    {
      id: 'flag3',
      type: 'comment',
      content: {
        text: 'This seller is a scammer! Do not buy from them!'
      },
      reportedBy: {
        name: 'Mike Wilson',
        username: 'mikew',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
      },
      author: {
        name: 'Angry Buyer',
        username: 'angrybuyer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
      },
      reason: 'Harassment and defamation',
      category: 'Harassment',
      flagCount: 3,
      priority: 'medium',
      reportedAt: '5 hours ago',
      status: 'pending'
    },
    {
      id: 'flag4',
      type: 'video',
      content: {
        title: 'Product Unboxing',
        url: 'https://example.com/video',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'
      },
      reportedBy: {
        name: 'Emma Brown',
        username: 'emmab',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
      },
      author: {
        name: 'Video Creator',
        username: 'videocreator',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100'
      },
      reason: 'Inappropriate content',
      category: 'Inappropriate',
      flagCount: 12,
      priority: 'high',
      reportedAt: '1 hour ago',
      status: 'pending'
    }
  ];

  const stats = {
    pending: 45,
    reviewing: 12,
    approvedToday: 128,
    removedToday: 23,
    avgReviewTime: '8 mins'
  };

  const getPriorityBadge = (priority: string) => {
    const config: {[key: string]: string} = {
      'low': 'bg-muted text-foreground',
      'medium': 'bg-warning/10 text-warning',
      'high': 'bg-warning/10 text-warning',
      'urgent': 'bg-error/10 text-error'
    };
    return <Badge className={config[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const config: {[key: string]: {icon: React.ReactNode, color: string}} = {
      'post': { icon: <MessageSquare className="w-3 h-3 mr-1" />, color: 'bg-info/10 text-info' },
      'comment': { icon: <MessageSquare className="w-3 h-3 mr-1" />, color: 'bg-primary/10 text-primary' },
      'product': { icon: <ShoppingBag className="w-3 h-3 mr-1" />, color: 'bg-success/10 text-success' },
      'video': { icon: <Video className="w-3 h-3 mr-1" />, color: 'bg-like/10 text-like' }
    };
    const item = config[type];
    return <Badge className={`${item.color} flex items-center w-fit`}>{item.icon}{type}</Badge>;
  };

  const handleReview = (content: FlaggedContent) => {
    setReviewDialog({ open: true, content });
    setReviewNote('');
    setActionType('');
  };

  const confirmAction = () => {
    toast.success(`Content ${actionType === 'approve' ? 'approved' : 'removed'} successfully`);
    setReviewDialog({ open: false, content: null });
    setReviewNote('');
    setActionType('');
  };

  const filteredContent = flaggedContent.filter(item => {
    if (selectedTab === 'all') return true;
    return item.status === selectedTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="mb-6">
        <h1 className="text-foreground mb-2">Content Moderation Queue</h1>
        <p className="text-muted-foreground">Review and moderate flagged content across the platform</p>
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
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold text-success">{stats.approvedToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Removed Today</p>
                <p className="text-2xl font-bold text-error">{stats.removedToday}</p>
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

      {/* Content Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Content</CardTitle>
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
                {filteredContent.map((item) => (
                  <Card key={item.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Content Preview */}
                        <div className="flex-shrink-0">
                          {item.content.image && (
                            <img 
                              src={item.content.image} 
                              alt="Content" 
                              className="w-32 h-32 rounded-xl object-cover"
                            />
                          )}
                          {!item.content.image && (
                            <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center">
                              {item.type === 'post' && <MessageSquare className="w-12 h-12 text-muted-foreground" />}
                              {item.type === 'comment' && <MessageSquare className="w-12 h-12 text-muted-foreground" />}
                              {item.type === 'product' && <ShoppingBag className="w-12 h-12 text-muted-foreground" />}
                              {item.type === 'video' && <Video className="w-12 h-12 text-muted-foreground" />}
                            </div>
                          )}
                        </div>

                        {/* Content Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getTypeBadge(item.type)}
                                {item.priority && getPriorityBadge(item.priority)}
                                <Badge className="bg-error/10 text-error">
                                  <Flag className="w-3 h-3 mr-1" />
                                  {item.flagCount} reports
                                </Badge>
                              </div>
                              
                              {item.content.title && (
                                <h3 className="font-semibold text-foreground mb-1">{item.content.title}</h3>
                              )}
                              {item.content.text && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.content.text}</p>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center gap-2">
                                  <img src={item.author.avatar} alt={item.author.name} className="w-6 h-6 rounded-full object-cover" />
                                  <span>By @{item.author.username}</span>
                                </div>
                                <span>•</span>
                                <span>{item.reportedAt}</span>
                              </div>

                              <div className="flex items-start gap-2 p-3 bg-error/5 rounded-xl">
                                <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-error">
                                    {item.category}
                                  </p>
                                  <p className="text-xs text-error">
                                    {item.reason}
                                  </p>
                                  <p className="text-xs text-error mt-1">
                                    Reported by @{item.reportedBy.username}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReview(item)}
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
                                  setReviewDialog({ open: true, content: item });
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
                                  setReviewDialog({ open: true, content: item });
                                  setActionType('remove');
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({...reviewDialog, open})}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Content</DialogTitle>
            <DialogDescription>
              Review the flagged content and take appropriate action
            </DialogDescription>
          </DialogHeader>
          
          {reviewDialog.content && (
            <div className="space-y-4 py-4">
              {/* Content Preview */}
              {reviewDialog.content.content.image && (
                <div className="w-full">
                  <img 
                    src={reviewDialog.content.content.image} 
                    alt="Content" 
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">{reviewDialog.content.content.title}</h4>
                <p className="text-sm text-muted-foreground">{reviewDialog.content.content.text}</p>
              </div>

              <div className="p-3 bg-error/5 rounded-xl">
                <p className="text-sm font-medium text-error mb-1">
                  Report Reason: {reviewDialog.content.category}
                </p>
                <p className="text-sm text-error">
                  {reviewDialog.content.reason}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action</Label>
                <Select value={actionType} onValueChange={(v) => setActionType(v as 'approve' | 'remove')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve - No violation found</SelectItem>
                    <SelectItem value="remove">Remove - Violates guidelines</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Review Note (Required)</Label>
                <Textarea
                  id="note"
                  placeholder="Explain your decision..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReviewDialog({ open: false, content: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={!actionType || !reviewNote.trim()}
              className={actionType === 'remove' ? 'bg-error hover:bg-error' : 'bg-success hover:bg-success/90'}
            >
              Confirm {actionType === 'remove' ? 'Removal' : 'Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}