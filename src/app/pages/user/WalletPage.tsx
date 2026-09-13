import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, DollarSign, Eye, EyeOff, Minus, Send, Repeat2, Clock, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ReferralService, type Commission, type ReferralEarningsSummary } from '../../services/referral';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';

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

export default function WalletPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [activeModal, setActiveModal] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDest, setWithdrawDest] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [requestFrom, setRequestFrom] = useState('');
  const [requestAmount, setRequestAmount] = useState('');
  const [walletData, setWalletData] = useState({
    balance: 0,
    pendingBalance: 0,
    availableBalance: 0,
    totalEarnings: 0,
    totalSpent: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralEarnings, setReferralEarnings] = useState<ReferralEarningsSummary | null>(null);

  // Load wallet data progressively
  useEffect(() => {
    const loadWalletData = () => {
      // Load balance data
      const balance = 124.50;
      const pendingBalance = 45.30;
      const availableBalance = balance - pendingBalance;
      const totalEarnings = 32.50;
      const totalSpent = 158.00;
      
      setWalletData({
        balance,
        pendingBalance,
        availableBalance,
        totalEarnings,
        totalSpent
      });
      
      // Load transactions
      setTransactions(mockTransactions);

      // Load referral earnings
      setReferralEarnings(ReferralService.getEarningsSummary());

      setIsLoading(false);
    };

    // Progressive loading: Use requestIdleCallback for non-critical work
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => loadWalletData(), { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadWalletData, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const getTransactionIcon = (category: Transaction['category']) => {
    switch (category) {
      case 'purchase':
        return <ArrowUpRight className="w-4 h-4 text-error" />;
      case 'refund':
      case 'commission':
      case 'topup':
        return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case 'cashout':
        return <ArrowUpRight className="w-4 h-4 text-info" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Wallet — Ezyify" description="Manage your Ezyify wallet balance, transactions, and payouts." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-semibold text-foreground">My Wallet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your balance and transactions</p>
        </div>

        {/* Balance Card */}
        <div className="rounded-3xl p-7 mb-6 text-white shadow-xl" style={{ background: 'var(--brand-gradient)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-white/80">Available Balance</p>
                <button
                  onClick={() => setShowBalance(b => !b)}
                  aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  {showBalance ? <EyeOff className="w-4 h-4 text-white/60" /> : <Eye className="w-4 h-4 text-white/60" />}
                </button>
              </div>
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-32 mb-2 bg-white/20" />
                  <Skeleton className="h-4 w-24 bg-white/20" />
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold">{showBalance ? `$${walletData.availableBalance.toFixed(2)}` : '••••••'}</p>
                  <p className="text-white/70 text-sm mt-2">Pending: {showBalance ? `$${walletData.pendingBalance.toFixed(2)}` : '••••'}</p>
                </>
              )}
            </div>
            <Wallet className="w-16 h-16 text-white/30" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setActiveModal('add')}
              className="bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-2xl p-3 transition-all"
            >
              <Plus className="w-6 h-6 mx-auto mb-1" />
              <p className="text-sm">Add Money</p>
            </button>
            <button
              onClick={() => setActiveModal('withdraw')}
              className="bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-2xl p-3 transition-all"
            >
              <Minus className="w-6 h-6 mx-auto mb-1" />
              <p className="text-sm">Withdraw</p>
            </button>
            <button
              onClick={() => setActiveModal('transfer')}
              className="bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-2xl p-3 transition-all"
            >
              <Send className="w-6 h-6 mx-auto mb-1" />
              <p className="text-sm">Transfer</p>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => setActiveModal('add')}>
            <Plus className="w-5 h-5" />
            <span className="text-sm">Add Money</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => setActiveModal('transfer')}>
            <ArrowUpRight className="w-5 h-5" />
            <span className="text-sm">Send Money</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => setActiveModal('request')}>
            <ArrowDownLeft className="w-5 h-5" />
            <span className="text-sm">Request Money</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col gap-2" onClick={() => setActiveModal('withdraw')}>
            <CreditCard className="w-5 h-5" />
            <span className="text-sm">Cash Out</span>
          </Button>
        </div>

        {/* Referral Earnings */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Repeat2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="leading-tight">Referral Earnings</h2>
                  <p className="text-xs text-muted-foreground">From product reposts &amp; shares</p>
                </div>
              </div>
            </div>

            {/* Summary tiles */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Pending', value: referralEarnings?.pendingAmount ?? 0, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
                { label: 'Confirmed', value: referralEarnings?.confirmedAmount ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                { label: 'Paid Out', value: referralEarnings?.paidAmount ?? 0, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
                  <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                  <p className={`font-bold ${color}`}>${value.toFixed(2)}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mb-5 px-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                {referralEarnings?.totalClicks ?? 0} clicks
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>{referralEarnings?.totalSales ?? 0} referred sales</span>
            </div>

            {/* Recent commissions */}
            {(referralEarnings?.commissions ?? []).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</p>
                {(referralEarnings!.commissions).slice(0, 4).map((c: Commission) => {
                  const statusColor = c.status === 'confirmed' ? 'text-emerald-600 bg-emerald-500/10'
                    : c.status === 'paid' ? 'text-primary bg-primary/10'
                    : c.status === 'pending' ? 'text-warning bg-warning/10'
                    : 'text-muted-foreground bg-muted';
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                      {c.productImage && (
                        <img loading="lazy" src={c.productImage} alt={c.productName} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{c.productName ?? `Product #${c.productId}`}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{c.source} · Order #{c.orderId.slice(-6)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-bold text-foreground">+${c.commissionAmount.toFixed(2)}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${statusColor}`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Action Dialogs */}
        <Dialog open={activeModal === 'add'} onOpenChange={open => !open && setActiveModal('')}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Money</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="add-amount">Amount ($)</Label>
                <Input id="add-amount" type="number" min="1" placeholder="0.00" value={addMoneyAmount} onChange={e => setAddMoneyAmount(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map(amt => (
                  <Button key={amt} variant="outline" size="sm" onClick={() => setAddMoneyAmount(String(amt))}>${amt}</Button>
                ))}
              </div>
              <Button className="w-full" disabled={!addMoneyAmount || Number(addMoneyAmount) <= 0} onClick={() => {
                toast.success(`$${Number(addMoneyAmount).toFixed(2)} added to your wallet`);
                setAddMoneyAmount('');
                setActiveModal('');
              }}>Add Funds</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === 'withdraw'} onOpenChange={open => { if (!open) { setActiveModal(''); setWithdrawAmount(''); setWithdrawDest(''); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw / Cash Out</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Available: ${walletData.availableBalance.toFixed(2)}</p>
              <div className="space-y-1.5">
                <Label htmlFor="withdraw-amount">Amount ($)</Label>
                <Input id="withdraw-amount" type="number" min="1" max={walletData.availableBalance} placeholder="0.00"
                  value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="withdraw-dest">Bank / Payout Account</Label>
                <Input id="withdraw-dest" placeholder="Account ending in ••••"
                  value={withdrawDest} onChange={e => setWithdrawDest(e.target.value)} />
              </div>
              <Button className="w-full"
                disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > walletData.availableBalance || !withdrawDest.trim()}
                onClick={() => { toast.success(`Withdrawal of $${Number(withdrawAmount).toFixed(2)} requested`); setWithdrawAmount(''); setWithdrawDest(''); setActiveModal(''); }}>
                Request Withdrawal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === 'transfer'} onOpenChange={open => { if (!open) { setActiveModal(''); setTransferTo(''); setTransferAmount(''); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Money</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="transfer-to">Recipient username or email</Label>
                <Input id="transfer-to" placeholder="@username or email"
                  value={transferTo} onChange={e => setTransferTo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="transfer-amount">Amount ($)</Label>
                <Input id="transfer-amount" type="number" min="1" placeholder="0.00"
                  value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
              </div>
              <Button className="w-full"
                disabled={!transferTo.trim() || !transferAmount || Number(transferAmount) <= 0}
                onClick={() => { toast.success(`$${Number(transferAmount).toFixed(2)} sent to ${transferTo}`); setTransferTo(''); setTransferAmount(''); setActiveModal(''); }}>
                Send
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeModal === 'request'} onOpenChange={open => { if (!open) { setActiveModal(''); setRequestFrom(''); setRequestAmount(''); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Money</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="request-from">Request from (username or email)</Label>
                <Input id="request-from" placeholder="@username or email"
                  value={requestFrom} onChange={e => setRequestFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="request-amount">Amount ($)</Label>
                <Input id="request-amount" type="number" min="1" placeholder="0.00"
                  value={requestAmount} onChange={e => setRequestAmount(e.target.value)} />
              </div>
              <Button className="w-full"
                disabled={!requestFrom.trim() || !requestAmount || Number(requestAmount) <= 0}
                onClick={() => { toast.success(`Payment request sent to ${requestFrom}`); setRequestFrom(''); setRequestAmount(''); setActiveModal(''); }}>
                Send Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Transactions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2>Transaction History</h2>
              <Button variant="ghost" size="sm" onClick={() => toast.info('Full transaction history coming soon')}>View All</Button>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="credit">Credits</TabsTrigger>
                <TabsTrigger value="debit">Debits</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3.5 p-3.5 bg-muted rounded-2xl border border-border/50">
                      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-5 w-16 mb-1" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3.5 p-3.5 bg-muted rounded-2xl border border-border/50 hover:bg-muted/80 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0">
                        {getTransactionIcon(transaction.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`font-medium ${
                            transaction.type === 'credit' ? 'text-success' : 'text-error'
                          }`}
                        >
                          {transaction.type === 'credit' ? '+' : '-'}$
                          {transaction.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant={
                            transaction.status === 'completed'
                              ? 'default'
                              : transaction.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="credit" className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3.5 p-3.5 bg-muted rounded-2xl border border-border/50">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))
                ) : (
                  transactions
                    .filter((t) => t.type === 'credit')
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3.5 p-3.5 bg-muted rounded-2xl border border-border/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                          {getTransactionIcon(transaction.category)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                        </div>
                        <p className="font-medium text-success">
                          +${transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    ))
                )}
              </TabsContent>

              <TabsContent value="debit" className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 1 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3.5 p-3.5 bg-muted rounded-2xl border border-border/50">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))
                ) : (
                  transactions
                    .filter((t) => t.type === 'debit')
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3.5 p-3.5 bg-muted rounded-2xl border border-border/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                          {getTransactionIcon(transaction.category)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.timestamp}</p>
                        </div>
                        <p className="font-medium text-error">
                          -${transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}