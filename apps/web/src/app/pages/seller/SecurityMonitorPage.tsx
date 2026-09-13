import { motion, useReducedMotion } from 'motion/react';
import { Lock, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

export default function SecurityMonitorPage() {
  const reduce = useReducedMotion();

  const securityItems = [
    { name: 'Two-Factor Authentication', status: 'enabled', icon: CheckCircle2 },
    { name: 'Password Reset', status: 'enabled', icon: CheckCircle2 },
    { name: 'Login Alerts', status: 'enabled', icon: CheckCircle2 },
    { name: 'API Keys', status: 'warning', icon: AlertCircle },
  ];

  return (
    <SellerLayout>
      <SEO title="Security — Ezyify Seller" description="Monitor your account security." />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Security & Privacy</h1>
          <p className="text-sm text-foreground-secondary mt-1">Monitor and manage your account security</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="featured" padding="lg" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="size-12 text-primary" />
              <div>
                <p className="font-display font-semibold text-lg text-foreground">Account Status</p>
                <p className="text-sm text-foreground-secondary mt-1">Your account is secure</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-2xl text-success">A+</p>
              <p className="text-xs text-foreground-secondary">Security Score</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Security Settings</h2>
            <div className="space-y-3">
              {securityItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-background-elevated rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'size-8 rounded-lg flex items-center justify-center',
                          item.status === 'enabled'
                            ? 'bg-success-subtle text-success'
                            : 'bg-warning-subtle text-warning'
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.name}</p>
                        <p className={cn('text-xs', item.status === 'enabled' ? 'text-success' : 'text-warning')}>
                          {item.status === 'enabled' ? 'Enabled' : 'Warning'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {item.status === 'enabled' ? 'Manage' : 'Review'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
              <Lock className="size-5" /> Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-background-elevated border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-background-elevated border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <Button fullWidth>Update Password</Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
