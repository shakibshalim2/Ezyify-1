import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Plus, Edit, Trash2, Users, Eye, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';

// Skeleton Component
function LiveScheduleSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Streams List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-96" />
                    <Skeleton className="h-4 w-full" />
                    <div className="grid md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((j) => (
                        <Skeleton key={j} className="h-5 w-24" />
                      ))}
                    </div>
                  </div>
                  <div className="lg:w-64 space-y-4">
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-10 w-full" />
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

interface LiveStream {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  taggedProducts: number;
  expectedViewers?: number;
  actualViewers?: number;
}

const mockStreams: LiveStream[] = [
  {
    id: '1',
    title: 'Tech Gadgets Unboxing & Review',
    description: 'Unboxing the latest tech gadgets and sharing honest reviews',
    scheduledDate: '2024-01-06',
    scheduledTime: '18:00',
    duration: 60,
    status: 'scheduled',
    taggedProducts: 5,
    expectedViewers: 500
  },
  {
    id: '2',
    title: 'Fashion Haul - Winter Collection',
    description: 'Showcasing trendy winter outfits and styling tips',
    scheduledDate: '2024-01-04',
    scheduledTime: '20:00',
    duration: 45,
    status: 'completed',
    taggedProducts: 8,
    actualViewers: 1250
  },
  {
    id: '3',
    title: 'Q&A Session + Product Recommendations',
    description: 'Answering your questions and recommending my favorite products',
    scheduledDate: '2024-01-08',
    scheduledTime: '19:00',
    duration: 90,
    status: 'scheduled',
    taggedProducts: 12,
    expectedViewers: 800
  }
];

export default function LiveSchedulePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [streams, setStreams] = useState(mockStreams);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const statusConfig = {
    scheduled: { color: 'bg-accent text-foreground', label: 'Scheduled' },
    live: { color: 'bg-error text-error-foreground', label: 'Live Now' },
    completed: { color: 'bg-primary text-primary-foreground', label: 'Completed' },
    cancelled: { color: 'bg-muted text-muted-foreground', label: 'Cancelled' }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <LiveScheduleSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Live Schedule — Ezyify Creator" description="Schedule and manage your live shopping events on Ezyify." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="mb-2">Live Schedule</h1>
            <p className="text-muted-foreground">Manage your live streaming schedule</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Live Stream
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Live Stream</DialogTitle>
                <DialogDescription>
                  Set up your upcoming live stream session
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Stream Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Tech Gadgets Review"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you'll be showcasing..."
                    className="mt-1"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Tagged Products</Label>
                  <Button variant="outline" className="w-full mt-1">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Select Products to Tag
                  </Button>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Schedule Stream</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary bg-accent p-2 rounded-xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold">
                    {streams.filter(s => s.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Video className="w-8 h-8 text-destructive bg-accent p-2 rounded-xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Live Now</p>
                  <p className="text-2xl font-bold">
                    {streams.filter(s => s.status === 'live').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary bg-accent p-2 rounded-xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Viewers</p>
                  <p className="text-2xl font-bold">
                    {streams
                      .filter(s => s.actualViewers)
                      .reduce((sum, s) => sum + (s.actualViewers || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-primary bg-accent p-2 rounded-xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Products Tagged</p>
                  <p className="text-2xl font-bold">
                    {streams.reduce((sum, s) => sum + s.taggedProducts, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Streams List */}
        <div className="space-y-4">
          {streams.map((stream) => (
            <Card key={stream.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Stream Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3>{stream.title}</h3>
                          <Badge className={statusConfig[stream.status].color}>
                            {statusConfig[stream.status].label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{stream.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{stream.scheduledDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{stream.scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{stream.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{stream.taggedProducts} products</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="lg:w-64 flex flex-col gap-4">
                    {stream.status === 'completed' && stream.actualViewers ? (
                      <div className="p-4 bg-accent rounded-2xl border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-primary" />
                          <p className="text-sm text-muted-foreground">Total Viewers</p>
                        </div>
                        <p className="text-2xl font-bold text-primary">{stream.actualViewers}</p>
                      </div>
                    ) : stream.expectedViewers ? (
                      <div className="p-4 bg-accent rounded-2xl border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-primary" />
                          <p className="text-sm text-muted-foreground">Expected Viewers</p>
                        </div>
                        <p className="text-2xl font-bold text-primary">{stream.expectedViewers}</p>
                      </div>
                    ) : null}

                    <div className="flex gap-2">
                      {stream.status === 'scheduled' && (
                        <>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Trash2 className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {stream.status === 'live' && (
                        <Button size="sm" className="flex-1">
                          <Video className="w-3 h-3 mr-1" />
                          Join Stream
                        </Button>
                      )}
                      {stream.status === 'completed' && (
                        <Button size="sm" variant="outline" className="flex-1">
                          View Analytics
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <Card className="mt-8 bg-accent">
          <CardHeader>
            <CardTitle>💡 Live Streaming Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-foreground">
              <li>• Test your equipment and internet connection before going live</li>
              <li>• Promote your live stream 24 hours in advance</li>
              <li>• Engage with viewers and answer questions in real-time</li>
              <li>• Tag products throughout your stream for maximum conversions</li>
              <li>• Keep your streams between 30-90 minutes for best engagement</li>
              <li>• Save and repurpose your live streams as regular posts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}