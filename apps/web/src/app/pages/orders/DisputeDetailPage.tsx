import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Send, MessageCircle } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Textarea } from '../../components/ui/textarea';
import { Skeleton } from '../../components/primitives/Skeleton';
import { toast } from 'sonner';
import { fadeUp, staggerContainer } from '../../lib/motion';

interface Message {
  id: string;
  from: 'user' | 'seller' | 'moderator';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export default function DisputeDetailPage() {
  const reduce = useReducedMotion();
  const { disputeId } = useParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'user',
      content: 'Item was not delivered as promised. Order marked as delivered but I never received it.',
      timestamp: 'Jan 12, 2026, 2:30 PM'
    },
    {
      id: '2',
      from: 'seller',
      content: 'We have tracking confirmation showing delivery on Jan 10. Can you check with neighbors or leave a note for redelivery?',
      timestamp: 'Jan 12, 2026, 3:15 PM'
    },
    {
      id: '3',
      from: 'moderator',
      content: 'We have opened an investigation. Please provide any additional evidence (photos, carrier statements, etc.) by Jan 15.',
      timestamp: 'Jan 12, 2026, 4:00 PM'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const mockDispute = {
    id: disputeId || 'DISP-ABC123',
    orderId: 'EZY-12345678',
    status: 'investigating',
    reason: 'Item not received',
    openedDate: 'Jan 12, 2026',
    estimatedResolution: 'Jan 15-17, 2026',
    amount: 125.99
  } as const;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([
      ...messages,
      {
        id: String(messages.length + 1),
        from: 'user',
        content: newMessage,
        timestamp: new Date().toLocaleString()
      }
    ]);
    setNewMessage('');
    toast.success('Message sent');
  };

  const getStatusColor = () => {
    if (mockDispute.status === 'investigating') return 'bg-warning-subtle text-warning';
    return 'bg-success-subtle text-success';
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`Dispute ${disputeId}`} description="View dispute details and communicate with support." />

      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05, 0)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back" asChild>
            <Link to="/user/orders">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-semibold text-foreground">Dispute Details</h1>
            <p className="text-xs text-foreground-secondary">ID: {mockDispute.id}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
            Investigating
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div variants={fadeUp}>
          <Card className="bg-brand-gradient text-white">
            <div className="p-6 space-y-3">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="size-6" />
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-sm mb-1">{mockDispute.reason}</p>
                  <p className="font-semibold">Est. resolution: {mockDispute.estimatedResolution}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/20">
                <p className="text-sm text-white/80">Amount in Dispute: <span className="font-semibold">${mockDispute.amount.toFixed(2)}</span></p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Messages Thread */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.from === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                      msg.from === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : msg.from === 'seller'
                          ? 'bg-card border border-border'
                          : 'bg-info-subtle text-info'
                    }`}
                  >
                    {msg.from === 'user' ? 'U' : msg.from === 'seller' ? 'S' : 'M'}
                  </div>

                  <div className={msg.from === 'user' ? 'text-right' : ''}>
                    <p className="text-xs font-semibold text-foreground-secondary mb-1">
                      {msg.from === 'user' && 'You'}
                      {msg.from === 'seller' && 'Seller'}
                      {msg.from === 'moderator' && 'Moderator'}
                    </p>
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        msg.from === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Message Input */}
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Add a message</label>
            <Textarea
              placeholder="Provide additional information or evidence..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            variant="gradient"
            fullWidth
            leftIcon={<Send className="size-4" />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="shadow-brand"
          >
            Send Message
          </Button>
        </motion.div>

        {/* Help Section */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-3">
              <h3 className="font-display font-semibold text-foreground">Need Help?</h3>
              <Button
                variant="secondary"
                fullWidth
                leftIcon={<MessageCircle className="size-4" />}
                onClick={() => toast.info('Contact support coming soon')}
              >
                Contact Support
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
