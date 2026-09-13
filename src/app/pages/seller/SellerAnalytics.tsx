import { motion, useReducedMotion } from 'motion/react';
import { TrendingUp, BarChart3, Users, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/primitives/Card';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';

const chartData = [
  { date: 'Mon', revenue: 2400, orders: 24 },
  { date: 'Tue', revenue: 2210, orders: 21 },
  { date: 'Wed', revenue: 2290, orders: 23 },
  { date: 'Thu', revenue: 2000, orders: 20 },
  { date: 'Fri', revenue: 2181, orders: 22 },
  { date: 'Sat', revenue: 2500, orders: 25 },
  { date: 'Sun', revenue: 2100, orders: 21 },
];

export default function SellerAnalytics() {
  const reduce = useReducedMotion();

  return (
    <SellerLayout>
      <SEO title="Analytics - Track Store Performance" description="View detailed analytics and insights about your Ezyify store performance." />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-foreground-secondary mt-1">Your store performance insights</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary-subtle flex items-center justify-center">
                <TrendingUp className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">Total Revenue</p>
                <p className="font-display font-bold text-2xl text-foreground">$12,450</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-success-subtle flex items-center justify-center">
                <BarChart3 className="size-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">Total Orders</p>
                <p className="font-display font-bold text-2xl text-foreground">156</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-info-subtle flex items-center justify-center">
                <Users className="size-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">Unique Customers</p>
                <p className="font-display font-bold text-2xl text-foreground">89</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-warning-subtle flex items-center justify-center">
                <Eye className="size-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-foreground-secondary">Store Views</p>
                <p className="font-display font-bold text-2xl text-foreground">2,341</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-6 text-foreground">Weekly Trends</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-foreground-tertiary)" />
                  <YAxis stroke="var(--color-foreground-tertiary)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-background-elevated)', border: '1px solid var(--color-border)' }} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
