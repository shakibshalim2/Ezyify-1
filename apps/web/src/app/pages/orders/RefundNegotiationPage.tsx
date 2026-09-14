import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, Send, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { fadeUp, staggerContainer } from '../../lib/motion';

interface Message {
  id: string;
  from: 'user' | 'seller';
  content: string;
  timestamp: string;
}

interface Offer {
  id: string;
  from: 'user' | 'seller';
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
  message?: string;
}

export default function RefundNegotiationPage() {
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'user',
      content: 'The item has minor cosmetic damage. Can we negotiate a partial refund of $40?',
      timestamp: 'Jan 12, 2026, 2:30 PM'
    },
    {
      id: '2',
      from: 'seller',
      content: 'We appreciate you reaching out. We can offer $25 as a partial refund. Would that work?',
      timestamp: 'Jan 12, 2026, 3:15 PM'
    }
  ]);

  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      from: 'user',
      amount: 40,
      status: 'rejected',
      timestamp: 'Jan 12, 2026, 2:30 PM',
      message: 'Partial refund for cosmetic damage'
    },
    {
      id: '2',
      from: 'seller',
      amount: 25,
      status: 'pending',
      timestamp: 'Jan 12, 2026, 3:15 PM',
      message: 'Our offer for partial refund'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');

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

  const handleMakeOffer = () => {
    if (!offerAmount || isNaN(parseFloat(offerAmount))) {
      toast.error('Please enter a valid amount');
      return;
    }
    setOffers([
      ...offers,
      {
        id: String(offers.length + 1),
        from: 'user',
        amount: parseFloat(offerAmount),
        status: 'pending',
        timestamp: new Date().toLocaleString(),
        message: 'Counter offer'
      }
    ]);
    setOfferAmount('');
    toast.success('Offer sent to seller');
  };

  const handleAcceptOffer = (offerId: string) => {
    setOffers(offers.map(o => o.id === offerId ? { ...o, status: 'accepted' } : o));
    toast.success('Offer accepted! Refund will be processed.');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Refund Negotiation - Ezyify" description="Negotiate a refund amount with the seller." />

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
          <h1 className="font-display text-xl font-semibold text-foreground">Negotiate Refund</h1>
        </motion.div>

        {/* Active Offer */}
        {offers.find(o => o.status === 'pending' && o.from === 'seller') && (
          <motion.div variants={fadeUp}>
            <Card className="border-accent-brand border-2">
              <div className="p-4 space-y-3">
                <h3 className="font-display font-semibold text-foreground">Seller's Current Offer</h3>
                <div className="bg-accent-brand-subtle rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-foreground-secondary mb-1">Refund Amount</p>
                    <p className="font-display text-2xl font-bold text-accent-brand">
                      ${offers.find(o => o.status === 'pending' && o.from === 'seller')?.amount.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm text-foreground-secondary">
                    {offers.find(o => o.status === 'pending' && o.from === 'seller')?.message}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      fullWidth
                      size="sm"
                    >
                      Counter Offer
                    </Button>
                    <Button
                      variant="gradient"
                      fullWidth
                      size="sm"
                      onClick={() => handleAcceptOffer(
                        offers.find(o => o.status === 'pending' && o.from === 'seller')?.id || ''
                      )}
                      className="shadow-brand"
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Offers History */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Offer History</h3>
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className={`p-3 rounded-lg border ${
                      offer.from === 'user'
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-foreground">
                        {offer.from === 'user' ? 'Your Offer' : "Seller's Offer"}
                      </p>
                      <div className="flex items-center gap-2">
                        {offer.status === 'pending' && <Clock className="size-4 text-warning" />}
                        {offer.status === 'accepted' && <CheckCircle className="size-4 text-success" />}
                        <span className="text-xs font-semibold uppercase text-foreground-secondary">
                          {offer.status}
                        </span>
                      </div>
                    </div>
                    <p className="font-display text-lg font-bold text-accent-brand mb-2">
                      ${offer.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-foreground-secondary mb-2">{offer.message}</p>
                    <p className="text-xs text-foreground-tertiary">{offer.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Make Counter Offer */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-3">
              <h3 className="font-display font-semibold text-foreground">Make a Counter Offer</h3>
              <Field
                label="Offer Amount"
                type="number"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                prefix="$"
              />
              <Button
                variant="secondary"
                fullWidth
                onClick={handleMakeOffer}
                disabled={!offerAmount}
              >
                Send Counter Offer
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Messages */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Messages</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                        msg.from === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border'
                      }`}
                    >
                      {msg.from === 'user' ? 'U' : 'S'}
                    </div>
                    <div className={msg.from === 'user' ? 'text-right' : ''}>
                      <p className="text-xs font-semibold text-foreground-secondary mb-1">
                        {msg.from === 'user' ? 'You' : 'Seller'}
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
            </div>
          </Card>
        </motion.div>

        {/* Send Message */}
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Send Message</label>
            <Textarea
              placeholder="Communicate with the seller..."
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
      </motion.div>
    </div>
  );
}
