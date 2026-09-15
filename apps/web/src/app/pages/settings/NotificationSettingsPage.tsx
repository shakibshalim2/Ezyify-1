import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { ChevronLeft, Package, Heart, MessageSquare, Radio, Zap, Smartphone, Mail, Info } from 'lucide-react';
import { useAuth, useNotificationPreferences, useUpdateNotificationPreferences, type NotificationCategory, type NotificationPreferences } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Switch } from '../../components/ui/switch';
import { SEO } from '../../components/SEO';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';

const CATEGORIES: { key: NotificationCategory; label: string; description: string; icon: typeof Package }[] = [
  { key: 'orders', label: 'Orders & escrow', description: 'Payment received, shipped, delivered, refunds and escrow releases', icon: Package },
  { key: 'messages', label: 'Messages', description: 'New chats from buyers, sellers and creators', icon: MessageSquare },
  { key: 'social', label: 'Likes, comments & follows', description: 'Activity on your posts and profile', icon: Heart },
  { key: 'live', label: 'Live drops', description: 'When someone you follow goes live or a reminder fires', icon: Radio },
  { key: 'promos', label: 'Deals & promotions', description: 'Sales, coupons and product picks', icon: Zap },
];
type Channel = keyof NotificationPreferences[NotificationCategory];

function PrefsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading notification settings">
      {CATEGORIES.map(c => <Skeleton key={c.key} className="h-20 rounded-card" />)}
    </div>
  );
}

/** Per-category push/email opt-ins on `GET/PATCH /users/me/notification-preferences`; the API gates FCM sends on the same document. */
export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const status = useAuth(s => s.status);
  const prefs = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/settings/notifications' } });
  }, [status, navigate]);

  const set = (category: NotificationCategory, channel: Channel, value: boolean) =>
    update.mutate({ [category]: { [channel]: value } }, { onError: err => toast.error(formErrors(err).message ?? 'Could not save that setting') });

  const setAll = (channel: Channel, value: boolean) =>
    update.mutate(Object.fromEntries(CATEGORIES.map(c => [c.key, { [channel]: value }])), {
      onSuccess: () => toast.success(`${channel === 'push' ? 'Push' : 'Email'} ${value ? 'enabled' : 'paused'} for everything`),
      onError: err => toast.error(formErrors(err).message ?? 'Could not save'),
    });

  const data = prefs.data;
  const allOn = (channel: Channel) => !!data && CATEGORIES.every(c => data[c.key][channel]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Notification Settings — Ezyify" description="Choose which push and email notifications you receive." />
      <div className="max-w-2xl mx-auto px-4 py-6 lg:py-8">
        <header className="mb-6 flex items-center gap-3">
          <Button aria-label="Back to settings" variant="ghost" size="icon" asChild><Link to="/settings"><ChevronLeft /></Link></Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-foreground-secondary">Choose what reaches you, per channel. Security alerts are always sent.</p>
          </div>
        </header>

        {prefs.isLoading ? (
          <PrefsSkeleton />
        ) : prefs.isError || !data ? (
          <EmptyState kind="error" title="Couldn’t load your settings" description={prefs.error ? (formErrors(prefs.error).message ?? 'Please try again.') : 'Please try again.'} action={<Button onClick={() => prefs.refetch()}>Retry</Button>} />
        ) : (
          <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} initial="hidden" animate="visible" className="space-y-4">
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              {(['push', 'email'] as Channel[]).map(channel => {
                const on = allOn(channel);
                const Icon = channel === 'push' ? Smartphone : Mail;
                return (
                  <Card key={channel} variant="default" padding="md" className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="size-5 text-primary flex-shrink-0" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{channel === 'push' ? 'All push' : 'All email'}</p>
                        <p className="text-xs text-foreground-secondary truncate">{on ? 'Everything on' : 'Some off'}</p>
                      </div>
                    </div>
                    <Switch checked={on} onCheckedChange={v => setAll(channel, v)} aria-label={`Toggle all ${channel} notifications`} disabled={update.isPending} />
                  </Card>
                );
              })}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="none" className="overflow-hidden">
                <div className="hidden sm:grid grid-cols-[1fr_5rem_5rem] items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground-secondary border-b border-border">
                  <span>Category</span><span className="text-center">Push</span><span className="text-center">Email</span>
                </div>
                <ul className="divide-y divide-border">
                  {CATEGORIES.map(({ key, label, description, icon: Icon }) => (
                    <li key={key} className="grid grid-cols-1 sm:grid-cols-[1fr_5rem_5rem] items-center gap-3 px-4 py-4" data-testid={`pref-${key}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="size-10 rounded-lg bg-primary/15 grid place-items-center flex-shrink-0"><Icon className="size-5 text-primary" aria-hidden /></span>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm">{label}</p>
                          <p className="text-xs text-foreground-secondary">{description}</p>
                        </div>
                      </div>
                      {(['push', 'email'] as Channel[]).map(channel => (
                        <label key={channel} className="flex items-center justify-between sm:justify-center gap-2 sm:pl-0">
                          <span className="text-xs text-foreground-secondary sm:sr-only">{channel === 'push' ? 'Push' : 'Email'}</span>
                          <Switch checked={data[key][channel]} onCheckedChange={v => set(key, channel, v)} aria-label={`${label} ${channel}`} />
                        </label>
                      ))}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3 text-xs text-foreground-secondary">
              <Info className="size-4 flex-shrink-0 mt-0.5" aria-hidden />
              <p>Push needs notification permission on your device or browser. On Android these map to the app’s notification channels, so you can also fine-tune them in system settings. Sign-in and security alerts can’t be turned off.</p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
