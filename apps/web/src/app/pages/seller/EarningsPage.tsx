import { motion, useReducedMotion } from 'motion/react';
import { DollarSign, TrendingUp, Wallet, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { Link } from 'react-router';

const earningsData = [
  { date: 'Mon', earnings: 240 },
  { date: 'Tue', earnings: 221 },
  { date: 'Wed', earnings: 229 },
  { date: 'Thu', earnings: 200 },
  { date: 'Fri', earnings: 218 },
  { date: 'Sat', earnings: 250 },
  { date: 'Sun', earnings: 210 },
];

export default function EarningsPage() {
  const reduce = useReducedMotion();

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.earnings} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Earnings</h1>
          <p className="text-sm text-foreground-secondary mt-1">Track your revenue and payouts</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary-subtle flex items-center justify-center">
                <DollarSign className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">This Month</p>
                <p className="font-display font-bold text-2xl text-foreground">$3,240</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success-subtle flex items-center justify-center">
                <TrendingUp className="size-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">Total Earnings</p>
                <p className="font-display font-bold text-2xl text-foreground">$12,450</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-info-subtle flex items-center justify-center">
                <Wallet className="size-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">Pending Payout</p>
                <p className="font-display font-bold text-2xl text-foreground">$1,200</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg text-foreground">Earnings Chart</h2>
              <Button variant="outline" size="sm" leftIcon={<Download className="size-4" />}>
                Export
              </Button>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-foreground-tertiary)" />
                  <YAxis stroke="var(--color-foreground-tertiary)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-background-elevated)', border: '1px solid var(--color-border)' }} />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="var(--color-primary)"
                    fillOpacity={1}
                    fill="url(#colorEarnings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Link to="/seller/withdraw">
            <Button variant="gradient" size="lg" fullWidth className="shadow-brand">
              Request Payout
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
