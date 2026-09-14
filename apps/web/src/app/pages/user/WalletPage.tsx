import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, Copy, Zap } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Field } from '../../components/primitives/Field';
import { toast } from 'sonner';
import { ReferralService, type ReferralEarningsSummary } from '../../services/referral';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { fadeUp, staggerContainer, DURATION, EASE_EMPHASIZED } from '../../lib/motion';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  category: 'purchase' | 'refund' | 'topup' | 'commission' | 'cashout';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'debit',
    amount: 45.00,
    description: 'Purchase - Premium Wireless Headphones',
    timestamp: '2024-01-04 10:30 AM',
    status: 'completed',
    category: 'purchase'
  },
  {
    id: '2',
    type: 'credit',
    amount: 2.50,
    description: 'Affiliate Commission - Product #12345',
    timestamp: '2024-01-03 03:45 PM',
    status: 'completed',
    category: 'commission'
  },
  {
    id: '3',
    type: 'credit',
    amount: 50.00,
    description: 'Top-up via Digital Wallet',
    timestamp: '2024-01-02 09:15 AM',
    status: 'completed',
    category: 'topup'
  },
  {
    id: '4',
    type: 'credit',
    amount: 12.00,
    description: 'Refund - Order #98765',
    timestamp: '2024-01-01 05:20 PM',
    status: 'completed',
    category: 'refund'
  }
];

function WalletSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-card" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [selectedAmountChip, setSelectedAmountChip] = useState<number | null>(null);
  const [walletData, setWalletData] = useState({
    balance: 124.50,
    pendingBalance: 45.30,
    availableBalance: 79.20,
    totalEarnings: 32.50,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralEarnings, setReferralEarnings] = useState<ReferralEarningsSummary | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'in' | 'out' | 'pending'>('all');

  useEffect(() => {
    const loadWalletData = () => {
      setTransactions(mockTransactions);
      setReferralEarnings(ReferralService.getEarningsSummary());
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => loadWalletData(), { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadWalletData, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  const getTransactionIcon = (category: Transaction['category'], type: Transaction['type']) => {
    if (type === 'credit') {
      return <ArrowDownLeft className="size-5" />;
    }
    return <ArrowUpRight className="size-5" />;
  };

  const getTransactionColor = (category: Transaction['category'], type: Transaction['type']) => {
    if (type === 'credit') return 'bg-success-subtle text-success';
    return 'bg-primary-subtle text-primary';
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'in') return t.type === 'credit';
    if (activeFilter === 'out') return t.type === 'debit';
    if (activeFilter === 'pending') return t.status === 'pending';
    return true;
  });

  const groupedByDay = filteredTransactions.reduce((acc, t) => {
    const day = new Date(t.timestamp).toLocaleDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const handleAddFunds = () => {
    const amount = selectedAmountChip || parseFloat(addMoneyAmount);
    if (amount > 0) {
      toast.success(`$${amount.toFixed(2)} added to wallet`);
      setAddMoneyOpen(false);
      setAddMoneyAmount('');
      setSelectedAmountChip(null);
    } else {
      toast.error('Please enter a valid amount');
    }
  };

  if (isLoading) {
    return <WalletSkeleton />;
  }

  const quickActionChips = [
    { label: 'Add funds', icon: Plus, action: () => setAddMoneyOpen(true) },
    { label: 'Send', icon: ArrowUpRight, action: () => toast.info('Send feature coming soon') },
    { label: 'Withdraw', icon: ArrowDownLeft, action: () => toast.info('Withdraw feature coming soon') },
    { label: 'Cash out', icon: Zap, action: () => toast.info('Cash out feature coming soon') }
  ];

  const amountChips = [10, 25, 50, 100];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Wallet — Ezyify" description="Manage your Ezyify wallet balance, transactions, and payouts." />

      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05, 0)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-foreground">My Wallet</h1>
          <p className="text-sm text-foreground-secondary">Manage your balance and transactions</p>
        </motion.div>

        {/* Balance Card Hero */}
        <motion.div variants={fadeUp}>
          <Card
            variant="featured"
            className="bg-brand-gradient text-white overflow-hidden relative"
          >
            <div className="p-6 space-y-6">
              {/* Balance Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-sm font-medium">Available Balance</span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      {showBalance ? (
                        <EyeOff className="size-4 text-white/60" />
                      ) : (
                        <Eye className="size-4 text-white/60" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="font-display text-4xl font-bold tabular-nums">
                  {showBalance ? `$${walletData.availableBalance.toFixed(2)}` : '••••••'}
                </p>
                <p className="text-white/70 text-sm">
                  Pending: {showBalance ? `$${walletData.pendingBalance.toFixed(2)}` : '••••'}
                </p>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-4 gap-2">
                {quickActionChips.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.label}
                      onClick={chip.action}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                      aria-label={chip.label}
                    >
                      <Icon className="size-5" />
                      <span className="text-xs font-medium text-center">{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Affiliate Earnings Section */}
        {referralEarnings && referralEarnings.paidAmount > 0 && (
          <motion.div variants={fadeUp}>
            <Card variant="elevated">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground">Affiliate Earnings</h3>
                  <span className="text-sm text-primary font-medium">+${referralEarnings.paidAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-foreground-secondary">
                  From {referralEarnings.totalSales} successful sales
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toast.info('Affiliate details coming soon')}
                  fullWidth
                >
                  View Details
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Transaction Filter Chips */}
        <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'in', 'out', 'pending'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-card-hover'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'in' ? 'In' : filter === 'out' ? 'Out' : 'Pending'}
            </button>
          ))}
        </motion.div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <motion.div variants={fadeUp}>
            <Card variant="ghost" className="text-center py-12">
              <p className="text-foreground-secondary">No transactions found</p>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} className="space-y-3">
            {Object.entries(groupedByDay).map(([day, dayTransactions]) => (
              <motion.div key={day} variants={fadeUp}>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground-secondary px-2">{day}</p>
                  <div className="space-y-2">
                    {dayTransactions.map((transaction) => (
                      <Card key={transaction.id} variant="ghost">
                        <div className="p-3 flex items-center gap-3">
                          <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTransactionColor(transaction.category, transaction.type)}`}>
                            {getTransactionIcon(transaction.category, transaction.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-foreground-secondary">
                              {transaction.timestamp}
                            </p>
                          </div>
                          <p className={`text-sm font-display font-semibold tabular-nums flex-shrink-0 ${
                            transaction.type === 'credit' ? 'text-success' : 'text-foreground'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Add Funds Dialog */}
      <AnimatePresence>
        <Dialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add Funds</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Field
                label="Amount"
                type="number"
                placeholder="0.00"
                value={addMoneyAmount}
                onChange={(e) => {
                  setAddMoneyAmount(e.target.value);
                  setSelectedAmountChip(null);
                }}
                prefix="$"
              />

              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground-secondary">Quick amounts</p>
                <div className="grid grid-cols-4 gap-2">
                  {amountChips.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedAmountChip(amount);
                        setAddMoneyAmount('');
                      }}
                      className={`p-2 rounded-lg border font-medium text-sm transition-all ${
                        selectedAmountChip === amount
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border hover:border-primary'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="gradient"
                  fullWidth
                  onClick={handleAddFunds}
                  className="shadow-brand"
                >
                  Add Funds
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setAddMoneyOpen(false);
                    setAddMoneyAmount('');
                    setSelectedAmountChip(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </div>
  );
}
