import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Shield, Lock, X, Image as ImageIcon, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface OrderMessagingProps {
  orderId: string;
  orderStatus: 'pending' | 'placed' | 'processing' | 'shipped' | 'delivered' | 'closed' | 'refunded' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  escrowStatus: 'none' | 'funded' | 'released' | 'refunded';
  productName: string;
  productImage: string;
  sellerName: string;
  sellerAvatar?: string;
  onClose?: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'seller' | 'system';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isBlocked?: boolean;
  blockedReason?: string;
}

const BLOCKED_PATTERNS = {
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10,}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  url: /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.com)/gi,
  payment: /\b(paypal|venmo|cashapp|zelle|bank\s*transfer|wire\s*transfer|western\s*union|moneygram|直接付款|银行转账)\b/gi,
  social: /\b(whatsapp|telegram|wechat|微信|line|viber|signal|discord)\b/gi,
};

export function OrderMessaging({
  orderId,
  orderStatus,
  paymentStatus,
  escrowStatus,
  productName,
  productImage,
  sellerName,
  sellerAvatar,
  onClose
}: OrderMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-1',
      type: 'system',
      content: `This conversation is linked to Order #${orderId}.`,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'system-2',
      type: 'system',
      content: 'Order placed successfully. Payment received and held in escrow.',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const [isRestricted, setIsRestricted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine if messaging is unlocked
  const isMessagingUnlocked = 
    orderStatus === 'placed' || 
    orderStatus === 'processing' || 
    orderStatus === 'shipped' || 
    orderStatus === 'delivered';
  
  const isPaymentCompleted = paymentStatus === 'completed';
  const isEscrowFunded = escrowStatus === 'funded';
  
  const canSendMessages = isMessagingUnlocked && isPaymentCompleted && isEscrowFunded;
  
  // Post-order states
  const isDelivered = orderStatus === 'delivered';
  const isClosed = orderStatus === 'closed' || orderStatus === 'refunded' || orderStatus === 'cancelled';
  
  // Input restrictions
  const isInputLimited = isDelivered;
  const isReadOnly = isClosed;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const detectBlockedContent = (text: string): { isBlocked: boolean; reason?: string } => {
    // Check phone numbers
    if (BLOCKED_PATTERNS.phone.test(text)) {
      return { isBlocked: true, reason: 'Phone numbers are not allowed' };
    }
    
    // Check email addresses
    if (BLOCKED_PATTERNS.email.test(text)) {
      return { isBlocked: true, reason: 'Email addresses are not allowed' };
    }
    
    // Check URLs
    if (BLOCKED_PATTERNS.url.test(text)) {
      return { isBlocked: true, reason: 'External links are not allowed' };
    }
    
    // Check payment keywords
    if (BLOCKED_PATTERNS.payment.test(text)) {
      return { isBlocked: true, reason: 'External payment methods are not allowed' };
    }
    
    // Check social media apps
    if (BLOCKED_PATTERNS.social.test(text)) {
      return { isBlocked: true, reason: 'External messaging apps are not allowed' };
    }
    
    return { isBlocked: false };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !canSendMessages || isRestricted || isReadOnly) return;

    const blockCheck = detectBlockedContent(inputValue);
    
    if (blockCheck.isBlocked) {
      const newWarningCount = warningCount + 1;
      setWarningCount(newWarningCount);
      
      // Add blocked message
      const blockedMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'user',
        content: inputValue,
        timestamp: new Date().toISOString(),
        status: 'sent',
        isBlocked: true,
        blockedReason: blockCheck.reason
      };
      
      setMessages([...messages, blockedMessage]);
      
      // Add warning system message
      const warningMessage: Message = {
        id: `warning-${Date.now()}`,
        type: 'system',
        content: `⚠️ Warning ${newWarningCount}/3: ${blockCheck.reason}. Keep all communication and payments inside Ezyify to maintain protection.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, warningMessage]);
      
      // Restrict messaging after 3 warnings
      if (newWarningCount >= 3) {
        setIsRestricted(true);
        const restrictionMessage: Message = {
          id: `restriction-${Date.now()}`,
          type: 'system',
          content: '🚫 Messaging has been restricted due to multiple policy violations. Please contact support if you believe this is an error.',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, restrictionMessage]);
      }
      
      setInputValue('');
      return;
    }

    // Send valid message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate seller response (for demo)
    setTimeout(() => {
      const sellerResponse: Message = {
        id: `msg-${Date.now()}`,
        type: 'seller',
        content: 'Thank you for your message. I will get back to you shortly.',
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, sellerResponse]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render if conditions not met
  if (!canSendMessages) {
    return null;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Order Support
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              For order-related support only
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Order Context */}
        <div className="mt-4 flex items-center gap-3 p-3 bg-accent/50 rounded-xl">
          <img
                      loading="lazy" 
            src={productImage} 
            alt={productName}
            className="w-12 h-12 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{productName}</p>
            <p className="text-xs text-muted-foreground">Order #{orderId}</p>
            <p className="text-xs text-muted-foreground">{sellerName}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Security Notice */}
        <Alert className="m-4 border-info/30 bg-info/5 dark:bg-info/5">
          <Lock className="w-4 h-4 text-info" />
          <AlertDescription className="text-xs text-info">
            <strong>For your safety:</strong> Keep all communication and payments inside Ezyify. We automatically block phone numbers, emails, external links, and payment requests.
          </AlertDescription>
        </Alert>

        {/* Warning State */}
        {isRestricted && (
          <Alert className="m-4 border-error/30 bg-error/8">
            <AlertCircle className="w-4 h-4 text-error" />
            <AlertDescription className="text-xs text-error">
              <strong>Messaging Restricted:</strong> This conversation has been restricted due to policy violations. Contact support for assistance.
            </AlertDescription>
          </Alert>
        )}

        {/* Closed State Message */}
        {isClosed && (
          <Alert className="m-4 border-border">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              This order is closed. Messaging is no longer available.
            </AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <div className="h-[400px] overflow-y-auto px-4 py-2 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              } ${message.type === 'system' ? 'justify-center' : ''}`}
            >
              {message.type === 'system' ? (
                <div className="max-w-[80%] bg-muted/50 border border-border rounded-xl px-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">Ezyify System</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{message.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className={`flex gap-2 max-w-[70%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {message.type === 'seller' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={sellerAvatar} alt={sellerName} />
                      <AvatarFallback>{sellerName[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {message.type === 'seller' && (
                      <p className="text-xs text-muted-foreground mb-1">{sellerName}</p>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? message.isBlocked
                            ? 'bg-error/10 border border-error/20'
                            : 'bg-primary text-primary-foreground'
                          : 'bg-accent'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.isBlocked && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-error/40">
                          <AlertCircle className="w-3 h-3 text-error" />
                          <p className="text-xs text-error">{message.blockedReason}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                      {message.status && message.type === 'user' && !message.isBlocked && (
                        <span className="text-xs">• {message.status}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isReadOnly && (
          <div className="border-t p-4">
            {isDelivered && (
              <Alert className="mb-3 border-warning/20 bg-warning/8">
                <AlertCircle className="w-4 h-4 text-warning" />
                <AlertDescription className="text-xs text-warning">
                  Order delivered. Messaging is limited. For issues, use "Report Problem" or "Request Refund".
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  isRestricted 
                    ? "Messaging restricted" 
                    : isInputLimited 
                    ? "Limited messaging (order delivered)" 
                    : "Type your message..."
                }
                disabled={isRestricted || !canSendMessages}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isRestricted || !canSendMessages}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {warningCount > 0 && warningCount < 3 && (
              <p className="text-xs text-warning mt-2">
                ⚠️ Warning {warningCount}/3 - Further violations may restrict messaging
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
