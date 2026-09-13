import { SEO } from '../../components/SEO';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Upload, Send, AlertTriangle, CheckCircle, XCircle, Clock, FileText, Image as ImageIcon, MessageSquare, Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ScrollArea } from '../../components/ui/scroll-area';

interface Evidence {
  id: string;
  uploadedBy: 'buyer' | 'seller';
  type: 'image' | 'document';
  url: string;
  description: string;
  uploadedAt: string;
}

interface Message {
  id: string;
  sender: 'buyer' | 'seller' | 'admin';
  message: string;
  timestamp: string;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'evidence_uploaded' | 'response_added' | 'admin_review' | 'resolved';
  description: string;
  timestamp: string;
  actor: string;
}

export default function DisputeDetailPage() {
  const { disputeId } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Mock data - will be replaced with API call
  const dispute = {
    id: disputeId || 'DIS123456',
    orderId: 'ORD789012',
    status: 'under_review' as 'open' | 'under_review' | 'resolved' | 'closed',
    type: 'product_issue' as 'product_issue' | 'non_delivery' | 'wrong_item' | 'damaged' | 'refund_delay',
    createdAt: '2026-01-20T10:30:00Z',
    updatedAt: '2026-01-22T14:20:00Z',
    buyer: {
      id: 'USR001',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    seller: {
      id: 'USR002',
      name: 'TechGadgets Store',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechGadgets',
    },
    product: {
      name: 'Wireless Earbuds Pro',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200',
      price: 89.99,
    },
    amount: 89.99,
    escrowStatus: 'locked',
    reason: 'Product received with manufacturing defect. Left earbud not working.',
    requestedOutcome: 'Full refund' as 'full_refund' | 'partial_refund' | 'replacement' | 'repair',
    adminAssigned: 'Support Team',
    expectedResolutionDate: '2026-01-25T23:59:59Z',
  };

  const [evidence, setEvidence] = useState<Evidence[]>([
    {
      id: 'EV001',
      uploadedBy: 'buyer',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      description: 'Defective left earbud - no sound output',
      uploadedAt: '2026-01-20T10:35:00Z',
    },
    {
      id: 'EV002',
      uploadedBy: 'buyer',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      description: 'Product packaging - shows genuine purchase',
      uploadedAt: '2026-01-20T10:36:00Z',
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG001',
      sender: 'buyer',
      message: 'I received the earbuds yesterday and the left earbud is completely non-functional. I have tried resetting and charging, but it still does not work.',
      timestamp: '2026-01-20T10:30:00Z',
    },
    {
      id: 'MSG002',
      sender: 'seller',
      message: 'We sincerely apologize for this inconvenience. Could you please try the following troubleshooting steps: 1) Reset both earbuds, 2) Forget device from Bluetooth settings, 3) Re-pair. If this does not work, we will arrange a replacement.',
      timestamp: '2026-01-20T15:45:00Z',
    },
    {
      id: 'MSG003',
      sender: 'buyer',
      message: 'I have already tried all these steps multiple times. The left earbud is definitely defective. I would prefer a full refund at this point.',
      timestamp: '2026-01-21T09:20:00Z',
    },
    {
      id: 'MSG004',
      sender: 'admin',
      message: 'This dispute is now under review by our support team. We will examine all evidence and provide a resolution within 3 business days.',
      timestamp: '2026-01-22T14:20:00Z',
    },
  ]);

  const timeline: TimelineEvent[] = [
    {
      id: 'TL001',
      type: 'created',
      description: 'Dispute created by buyer',
      timestamp: '2026-01-20T10:30:00Z',
      actor: 'Sarah Johnson',
    },
    {
      id: 'TL002',
      type: 'evidence_uploaded',
      description: 'Buyer uploaded 2 photos as evidence',
      timestamp: '2026-01-20T10:36:00Z',
      actor: 'Sarah Johnson',
    },
    {
      id: 'TL003',
      type: 'response_added',
      description: 'Seller responded with troubleshooting suggestion',
      timestamp: '2026-01-20T15:45:00Z',
      actor: 'TechGadgets Store',
    },
    {
      id: 'TL004',
      type: 'admin_review',
      description: 'Case escalated to admin review',
      timestamp: '2026-01-22T14:20:00Z',
      actor: 'Support Team',
    },
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `MSG${Date.now()}`,
      sender: 'buyer', // Will be determined by current user role
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      const newEvidence: Evidence = {
        id: `EV${Date.now()}`,
        uploadedBy: 'buyer',
        type: files[0].type.startsWith('image/') ? 'image' : 'document',
        url: URL.createObjectURL(files[0]),
        description: files[0].name,
        uploadedAt: new Date().toISOString(),
      };

      setEvidence([...evidence, newEvidence]);
      setUploading(false);
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-5 w-5" />;
      case 'under_review':
        return <Scale className="h-5 w-5" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5" />;
      case 'closed':
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'under_review':
        return 'bg-info/10 text-info border-info/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      case 'closed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-error/10 text-error border-error/20';
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Dispute Details — Ezyify" description="View and manage your order dispute on Ezyify." />
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
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
                <h1 className="text-2xl font-bold">Dispute #{dispute.id}</h1>
                <p className="text-sm text-muted-foreground">
                  Order #{dispute.orderId}
                </p>
              </div>
            </div>

            <Badge className={getStatusColor(dispute.status)}>
              {getStatusIcon(dispute.status)}
              <span className="ml-2 capitalize">{dispute.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <img
                      loading="lazy"
                      src={dispute.product.image}
                      alt={dispute.product.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div>
                      <CardTitle>{dispute.product.name}</CardTitle>
                      <CardDescription className="mt-1">
                        ${dispute.amount.toFixed(2)} • {getTypeLabel(dispute.type)}
                      </CardDescription>
                      <Badge variant="outline" className="mt-2">
                        Escrow: Locked
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Dispute Reason</h3>
                  <p className="text-muted-foreground">{dispute.reason}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Requested Outcome</h3>
                  <Badge variant="secondary">{dispute.requestedOutcome.replace('_', ' ')}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Evidence
                </CardTitle>
                <CardDescription>
                  Upload photos or documents to support your case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {evidence.map((item) => (
                    <div key={item.id} className="border rounded-2xl p-3 space-y-2">
                      {item.type === 'image' ? (
                        <img
                      loading="lazy"
                          src={item.url}
                          alt={item.description}
                          className="w-full h-40 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-40 bg-muted rounded flex items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm">{item.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {item.uploadedBy}</span>
                        <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <input
                    type="file"
                    id="evidence-upload"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    multiple
                  />
                  <label htmlFor="evidence-upload">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        {uploading ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Evidence
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Conversation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation
                </CardTitle>
                <CardDescription>
                  Discuss the issue with the {dispute.buyer.id === 'USR001' ? 'seller' : 'buyer'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.sender === 'buyer' ? 'flex-row' : 'flex-row-reverse'
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              msg.sender === 'buyer'
                                ? dispute.buyer.avatar
                                : msg.sender === 'seller'
                                ? dispute.seller.avatar
                                : undefined
                            }
                          />
                          <AvatarFallback>
                            {msg.sender === 'admin' ? 'A' : msg.sender === 'buyer' ? 'B' : 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 ${msg.sender === 'buyer' ? '' : 'text-right'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {msg.sender === 'buyer'
                                ? dispute.buyer.name
                                : msg.sender === 'seller'
                                ? dispute.seller.name
                                : 'Ezyify Support'}
                            </span>
                            {msg.sender === 'admin' && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div
                            className={`rounded-xl p-3 ${
                              msg.sender === 'admin'
                                ? 'bg-info/10 border border-info/20'
                                : msg.sender === 'buyer'
                                ? 'bg-muted'
                                : 'bg-primary/10'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="mt-4 flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[80px]"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Alert */}
            <Alert>
              <Scale className="h-4 w-4" />
              <AlertDescription>
                This dispute is under review by our support team. Expected resolution by{' '}
                <strong>{new Date(dispute.expectedResolutionDate).toLocaleDateString()}</strong>
              </AlertDescription>
            </Alert>

            {/* Parties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parties Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={dispute.buyer.avatar} />
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{dispute.buyer.name}</p>
                    <p className="text-sm text-muted-foreground">Buyer</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={dispute.seller.avatar} />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{dispute.seller.name}</p>
                    <p className="text-sm text-muted-foreground">Seller</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>E</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{dispute.adminAssigned}</p>
                    <p className="text-sm text-muted-foreground">Mediator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-border my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.actor} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Escrow Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Escrow Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold">${dispute.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline">Locked</Badge>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Funds are held securely until this dispute is resolved. No party can access the money during review.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}