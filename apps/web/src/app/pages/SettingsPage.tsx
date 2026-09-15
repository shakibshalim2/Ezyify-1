import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { User, Mail, Lock, Wallet, MapPin, Bell, Shield, Moon, Sun, ShoppingBag, Store, HelpCircle, FileText, LogOut, ChevronRight, Ban, ShieldCheck, Smartphone } from 'lucide-react';
import { avatarUrlFor, useAccount, useAddresses, useAuth, useBlockedUsers, useMe, useMfaStatus, useRuntime, useSessions } from '@ezyify/core';
import { SEO, SEOConfigs } from '../components/SEO';
import { Card } from '../components/primitives/Card';
import { Button } from '../components/primitives/Button';
import { Img } from '../components/primitives/Img';
import { Skeleton } from '../components/primitives/Skeleton';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Switch } from '../components/ui/switch';
import { useTheme } from '../contexts/ThemeContext';
import { fadeUp, staggerContainer } from '../lib/motion';
import type { WebRuntime } from '../runtime';

type Row = { icon: typeof User; label: string; description?: string; to?: string; toggle?: { checked: boolean; onChange: (v: boolean) => void; label: string }; testId?: string };

function Group({ title, icon: Icon, rows }: { title: string; icon: typeof User; rows: Row[] }) {
  return (
    <motion.section variants={fadeUp}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground-secondary"><Icon className="size-4" aria-hidden />{title}</h2>
      <Card variant="default" padding="none" className="overflow-hidden">
        <ul className="divide-y divide-border">
          {rows.map(r => {
            const RowIcon = r.icon;
            const body = (
              <>
                <span className="size-10 rounded-lg bg-primary/15 grid place-items-center flex-shrink-0"><RowIcon className="size-5 text-primary" aria-hidden /></span>
                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-foreground">{r.label}</span>
                  {r.description && <span className="block text-xs text-foreground-secondary truncate" data-testid={r.testId}>{r.description}</span>}
                </span>
              </>
            );
            return (
              <li key={r.label}>
                {r.toggle ? (
                  <label className="flex items-center gap-3 px-4 py-3">
                    {body}
                    <Switch checked={r.toggle.checked} onCheckedChange={r.toggle.onChange} aria-label={r.toggle.label} />
                  </label>
                ) : (
                  <Link to={r.to ?? '#'} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors">
                    {body}
                    <ChevronRight className="size-5 text-foreground-tertiary" aria-hidden />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </motion.section>
  );
}

/** Settings hub: every row reflects live account state (`/users/me`, `/users/me/account`, sessions, MFA, addresses, blocks). */
export default function SettingsPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const status = useAuth(s => s.status);
  const runtime = useRuntime() as WebRuntime;
  const me = useMe();
  const account = useAccount();
  const mfa = useMfaStatus();
  const sessions = useSessions();
  const addresses = useAddresses();
  const blocked = useBlockedUsers();

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/settings' } });
  }, [status, navigate]);

  const signOut = async () => {
    await runtime.signOut();
    toast.success('Signed out');
    navigate('/', { replace: true });
  };

  const u = me.data;
  const isSeller = u?.role === 'seller' || u?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.settings} />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} initial="hidden" animate="visible" className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <motion.header variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-foreground-secondary">Account, privacy, security and preferences</p>
        </motion.header>

        <motion.div variants={fadeUp}>
          {me.isLoading || !u ? (
            <Skeleton className="h-24 rounded-card" />
          ) : (
            <Card variant="featured" padding="md" className="flex items-center gap-4">
              <Img src={avatarUrlFor(u, 128)} alt="" className="size-16 rounded-full object-cover bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-foreground flex items-center gap-1.5 truncate">{u.name}{u.verified && <VerifiedBadge size="sm" />}</p>
                <p className="text-sm text-foreground-secondary truncate">@{u.username}{account.data ? ` · ${account.data.email}` : ''}</p>
                <p className="text-xs text-foreground-tertiary capitalize">{u.role} account{u.isPrivate ? ' · private' : ''}</p>
              </div>
              <Button size="sm" variant="outline" asChild><Link to="/profile/edit">Edit profile</Link></Button>
            </Card>
          )}
        </motion.div>

        <Group title="Account" icon={User} rows={[
          { icon: Mail, label: 'Email & phone', description: account.data ? `${account.data.email}${account.data.emailVerified ? ' · verified' : ' · unverified'}` : 'Contact details', to: '/settings/account-management', testId: 'settings-email' },
          { icon: MapPin, label: 'Addresses', description: addresses.data ? `${addresses.data.length} saved` : 'Shipping addresses', to: '/settings/account-management#addresses' },
          { icon: Wallet, label: 'Wallet & payments', description: 'Balance, top-ups and history', to: '/wallet' },
          { icon: ShoppingBag, label: 'Orders', description: 'Purchases, tracking and refunds', to: '/orders' },
          ...(isSeller ? [{ icon: Store, label: 'Seller hub', description: 'Store settings, products, payouts', to: '/seller-dashboard' } as Row] : []),
        ]} />

        <Group title="Privacy & security" icon={Shield} rows={[
          { icon: Lock, label: 'Security', description: mfa.data ? `Two-factor ${mfa.data.enabled ? 'on' : mfa.data.requiredForRole ? 'required' : 'off'}${sessions.data ? ` · ${sessions.data.length} active device${sessions.data.length === 1 ? '' : 's'}` : ''}` : 'Password, two-factor, devices', to: '/settings/security', testId: 'settings-security' },
          { icon: ShieldCheck, label: 'Privacy', description: u ? (u.isPrivate ? 'Private account' : 'Public account') : 'Who can see your activity', to: '/settings/privacy', testId: 'settings-privacy' },
          { icon: Ban, label: 'Blocked accounts', description: blocked.data ? `${blocked.data.length} blocked` : 'People you have blocked', to: '/settings/privacy#blocked' },
          { icon: Bell, label: 'Notifications', description: 'Push and email, per category', to: '/settings/notifications' },
        ]} />

        <Group title="Preferences" icon={Smartphone} rows={[
          { icon: theme === 'dark' ? Moon : Sun, label: 'Dark mode', description: theme === 'dark' ? 'On' : 'Off', toggle: { checked: theme === 'dark', onChange: () => toggleTheme(), label: 'Dark mode' } },
        ]} />

        <Group title="Support" icon={HelpCircle} rows={[
          { icon: HelpCircle, label: 'Help centre', to: '/help' },
          { icon: FileText, label: 'Terms of service', to: '/terms' },
          { icon: FileText, label: 'Privacy policy', to: '/privacy-policy' },
        ]} />

        <motion.div variants={fadeUp} className="pt-2">
          <Button variant="outline" fullWidth leftIcon={<LogOut className="size-4" aria-hidden />} onClick={() => void signOut()}>Sign out</Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
