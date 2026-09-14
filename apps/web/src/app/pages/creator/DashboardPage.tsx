import { motion, useReducedMotion } from 'motion/react';
import { Users, TrendingUp, Eye, DollarSign, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { Link } from 'react-router';

const chartData = [
  { date: 'Mon', views: 400, followers: 24 },
  { date: 'Tue', views: 300, followers: 21 },
  { date: 'Wed', views: 200, followers: 18 },
  { date: 'Thu', views: 278, followers: 22 },
  { date: 'Fri', views: 189, followers: 15 },
  { date: 'Sat', views: 239, followers: 19 },
  { date: 'Sun', views: 349, followers: 25 },
];

export default function DashboardPage() {
  const reduce = useReducedMotion();

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.creatorDashboard} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Creator Dashboard</h1>
            <p className="text-sm text-foreground-secondary mt-1">Grow your audience and earn</p>
          </div>
          <Link to="/creator/live">
            <Button variant="accent" size="lg" leftIcon={<Plus className="size-5" />} className="shadow-brand">
              Go Live
            </Button>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-primary" />
              <div>
                <p className="text-xs text-foreground-secondary">Followers</p>
                <p className="font-display font-bold text-2xl text-foreground">12.4K</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Eye className="size-5 text-success" />
              <div>
                <p className="text-xs text-foreground-secondary">Views</p>
                <p className="font-display font-bold text-2xl text-foreground">245K</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-5 text-info" />
              <div>
                <p className="text-xs text-foreground-secondary">Engagement</p>
                <p className="font-display font-bold text-2xl text-foreground">8.2%</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <DollarSign className="size-5 text-accent-brand" />
              <div>
                <p className="text-xs text-foreground-secondary">Earnings</p>
                <p className="font-display font-bold text-2xl text-foreground">$2,450</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-6 text-foreground">Content Performance</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-foreground-tertiary)" />
                  <YAxis stroke="var(--color-foreground-tertiary)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-background-elevated)', border: '1px solid var(--color-border)' }} />
                  <Line type="monotone" dataKey="views" stroke="var(--color-primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Recent Content</h2>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-3 bg-background-elevated rounded-lg hover:bg-background-elevated/80 transition cursor-pointer">
                  <div className="size-16 bg-background rounded-card flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">Content Title {i}</p>
                    <p className="text-xs text-foreground-secondary mt-1">{Math.random() * 10000 | 0} views · {Math.random() * 100 | 0}% engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
