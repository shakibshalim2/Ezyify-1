import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import { 
  MessageCircle, 
  Send, 
  DollarSign, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  Clock,
  TrendingDown,
  Calculator
} from 'lucide-react';
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Slider } from '../../components/ui/slider';

interface Message {
  id: string;
  sender: 'buyer' | 'seller' | 'system';
  message: string;
  timestamp: string;
  isOffer?: boolean;
  offerAmount?: number;
}

export default function RefundNegotiationPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'EZY123456';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'system',
      message: 'Refund negotiation initiated. Both parties can discuss and agree on a fair resolution.',
      timestamp: '10:00 AM'
    },
    {
      id: '2',
      sender: 'buyer',
      message: 'The product arrived damaged. I would like a full refund of ₹2,500.',
      timestamp: '10:05 AM',
      isOffer: true,
      offerAmount: 2500
    },
    {
      id: '3',
      sender: 'seller',
      message: 'I apologize for the inconvenience. However, the damage seems minor. Can we settle for a 60% refund?',
      timestamp: '10:15 AM',
      isOffer: true,
      offerAmount: 1500
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [showOfferCalc, setShowOfferCalc] = useState(false);
  const [offerAmount, setOfferAmount] = useState(1750);
  const [offerPercentage, setOfferPercentage] = useState(70);

  const negotiation = {
    orderId: orderId,
    productName: 'Wireless Bluetooth Headphones',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
    orderAmount: 2500,
    escrowStatus: 'held',
    buyer: {
      name: 'John Doe',
      username: 'johndoe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    seller: {
      name: 'TechStore Official',
      username: 'techstore',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    },
    status: 'negotiating',
    startedAt: 'Today, 10:00 AM',
    latestOffer: {
      from: 'seller',
      amount: 1500,
      percentage: 60
    },
    history: [
      { from: 'buyer', amount: 2500, percentage: 100, timestamp: '10:05 AM', status: 'rejected' },
      { from: 'seller', amount: 1500, percentage: 60, timestamp: '10:15 AM', status: 'pending' }
    ]
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      sender: 'buyer',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleSendOffer = () => {
    const message: Message = {
      id: Date.now().toString(),
      sender: 'buyer',
      message: `I propose a ${offerPercentage}% refund (₹${offerAmount.toFixed(2)}) as a fair resolution.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOffer: true,
      offerAmount: offerAmount
    };
    
    setMessages([...messages, message]);
    setShowOfferCalc(false);
  };

  const handleAcceptOffer = () => {
    const message: Message = {
      id: Date.now().toString(),
      sender: 'buyer',
      message: `I accept the ₹${negotiation.latestOffer.amount} (${negotiation.latestOffer.percentage}%) refund offer.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, message]);
    toast.success('Offer accepted! Refund will be processed to your Ezyify Wallet.');
  };

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0];
    setOfferPercentage(percentage);
    setOfferAmount((negotiation.orderAmount * percentage) / 100);
  };

  const getStatusBadge = (status: string) => {
    const config: {[key: string]: {label: string, color: string, icon: React.ReactNode}} = {
      'negotiating': { label: 'Negotiating', color: 'bg-info/10 text-info', icon: <MessageCircle className="w-3 h-3 mr-1" /> },
      'agreed': { label: 'Agreement Reached', color: 'bg-success/10 text-success', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      'escalated': { label: 'Escalated to Admin', color: 'bg-error/10 text-error', icon: <AlertCircle className="w-3 h-3 mr-1" /> }
    };
    const item = config[status];
    return <Badge className={`${item.color} flex items-center w-fit`}>{item.icon}{item.label}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-8">
      <SEO title="Refund Negotiation — Ezyify" description="Negotiate a refund resolution with the seller on Ezyify." />
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-semibold text-foreground">Refund Negotiation</h1>
          {getStatusBadge(negotiation.status)}
        </div>
        <p className="text-muted-foreground">Order ID: {negotiation.orderId}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                      loading="lazy" 
                  src={negotiation.productImage} 
                  alt={negotiation.productName} 
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{negotiation.productName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Order Amount: ₹{negotiation.orderAmount.toFixed(2)}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-info/10 text-info">
                      <Shield className="w-3 h-3 mr-1" />
                      Held in Escrow
                    </Badge>
                    <Badge className="bg-warning/10 text-warning">
                      <Clock className="w-3 h-3 mr-1" />
                      {negotiation.startedAt}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Offer Alert */}
          {negotiation.latestOffer && (
            <Alert className="bg-info/5 border-info/30">
              <TrendingDown className="h-4 w-4 text-info" />
              <AlertDescription>
                <p className="text-sm font-medium text-info mb-2">
                  Latest Offer from {negotiation.latestOffer.from === 'seller' ? 'Seller' : 'Buyer'}
                </p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-info">₹{negotiation.latestOffer.amount.toFixed(2)}</p>
                    <p className="text-xs text-info">
                      {negotiation.latestOffer.percentage}% of order amount
                    </p>
                  </div>
                  <div className="flex-1">
                    <Progress value={negotiation.latestOffer.percentage} className="h-2 bg-info/10" />
                  </div>
                  <Button 
                    className="bg-success hover:bg-success/90"
                    onClick={handleAcceptOffer}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Offer
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Chat Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Negotiation Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 ${
                      msg.sender === 'buyer' ? 'flex-row-reverse' : ''
                    } ${msg.sender === 'system' ? 'justify-center' : ''}`}
                  >
                    {msg.sender !== 'system' && (
                      <img
                      loading="lazy" 
                        src={msg.sender === 'buyer' ? negotiation.buyer.avatar : negotiation.seller.avatar} 
                        alt={msg.sender} 
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className={`flex-1 ${msg.sender === 'system' ? 'max-w-md mx-auto' : 'max-w-md'}`}>
                      {msg.sender !== 'system' && (
                        <p className={`text-xs text-muted-foreground mb-1 ${
                          msg.sender === 'buyer' ? 'text-right' : ''
                        }`}>
                          {msg.sender === 'buyer' ? negotiation.buyer.name : negotiation.seller.name} • {msg.timestamp}
                        </p>
                      )}
                      <div className={`
                        p-3 rounded-xl
                        ${msg.sender === 'buyer' ? 'bg-primary/10 text-right' : ''}
                        ${msg.sender === 'seller' ? 'bg-muted' : ''}
                        ${msg.sender === 'system' ? 'bg-info/5 text-center' : ''}
                      `}>
                        {msg.isOffer && (
                          <div className="flex items-center gap-2 mb-2 justify-center">
                            <DollarSign className="w-4 h-4 text-success" />
                            <span className="font-bold text-success">Offer: ₹{msg.offerAmount?.toFixed(2)}</span>
                          </div>
                        )}
                        <p className="text-sm text-foreground">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowOfferCalc(!showOfferCalc)}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {showOfferCalc ? 'Hide' : 'Make'} Counter Offer
                </Button>
              </div>

              {/* Offer Calculator */}
              {showOfferCalc && (
                <Card className="mt-4 border-2 border-primary/25">
                  <CardHeader>
                    <CardTitle className="text-base">Calculate Your Offer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Refund Percentage</span>
                        <span className="text-lg font-bold text-primary">{offerPercentage}%</span>
                      </div>
                      <Slider
                        value={[offerPercentage]}
                        onValueChange={handleSliderChange}
                        max={100}
                        min={0}
                        step={5}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/10 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Order Amount</span>
                        <span className="font-semibold text-foreground">₹{negotiation.orderAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Refund Amount ({offerPercentage}%)</span>
                        <span className="text-2xl font-bold text-primary">₹{offerAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Seller Keeps</span>
                        <span className="font-semibold text-success">
                          ₹{(negotiation.orderAmount - offerAmount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowOfferCalc(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1 bg-primary/10 hover:bg-primary/10"
                        onClick={handleSendOffer}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Offer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Parties Involved */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parties Involved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Buyer</p>
                <div className="flex items-center gap-3">
                  <img
                      loading="lazy" 
                    src={negotiation.buyer.avatar} 
                    alt={negotiation.buyer.name} 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">{negotiation.buyer.name}</p>
                    <p className="text-xs text-muted-foreground">@{negotiation.buyer.username}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Seller</p>
                <div className="flex items-center gap-3">
                  <img
                      loading="lazy" 
                    src={negotiation.seller.avatar} 
                    alt={negotiation.seller.name} 
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">{negotiation.seller.name}</p>
                    <p className="text-xs text-muted-foreground">@{negotiation.seller.username}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Offer History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {negotiation.history.map((offer, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={
                        offer.from === 'buyer' ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info'
                      }>
                        {offer.from === 'buyer' ? 'Buyer' : 'Seller'}
                      </Badge>
                      <Badge className={
                        offer.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                      }>
                        {offer.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-foreground">₹{offer.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{offer.percentage}% • {offer.timestamp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Escrow Info */}
          <Card className="border-2 border-info/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-info" />
                Escrow Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                ₹{negotiation.orderAmount.toFixed(2)} is held securely in escrow during this negotiation.
              </p>
              <Alert className="bg-info/5 border-info/30">
                <AlertCircle className="h-4 w-4 text-info" />
                <AlertDescription className="text-xs text-info">
                  Once both parties agree, the refund will be processed to your Ezyify Wallet within 24 hours.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/orders/dispute?orderId=${negotiation.orderId}`}>
                <Button variant="outline" className="w-full">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Escalate to Admin
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
