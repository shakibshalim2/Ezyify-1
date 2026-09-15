import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { ChevronLeft, Lock, Ban, Download, Trash2, ShieldCheck, Eye } from 'lucide-react';
import { useAccount, useApi, useAuth, useBlockUser, useBlockedUsers, useMe, useUpdateProfile, avatarUrlFor } from '@ezyify/core';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Img } from '../../components/primitives/Img';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Switch } from '../../components/ui/switch';
import { SEO } from '../../components/SEO';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';

/** Privacy controls backed by the API: private account (`PATCH /users/me`), blocked list, data export, deletion. */
export default function PrivacySettingsPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const api = useApi();
  const me = useMe();
  const account = useAccount();
  const blocked = useBlockedUsers();
  const update = useUpdateProfile();
  const toggleBlock = useBlockUser();
  const exportData = useMutation({ mutationFn: () => api.account.exportData() });
  const [pendingPrivate, setPendingPrivate] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/settings/privacy' } });
  }, [status, navigate]);

  const isPrivate = pendingPrivate ?? me.data?.isPrivate ?? false;
  const setPrivate = (v: boolean) => {
    setPendingPrivate(v);
    update.mutate({ isPrivate: v }, {
      onSuccess: () => { setPendingPrivate(null); toast.success(v ? 'Your account is now private' : 'Your account is public again'); },
      onError: err => { setPendingPrivate(null); toast.error(formErrors(err).message ?? 'Could not update privacy'); },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Privacy Settings — Ezyify" description="Control who sees your posts and activity, manage blocked accounts and your data." />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} initial="hidden" animate="visible" className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <motion.header variants={fadeUp} className="flex items-center gap-3">
          <Button aria-label="Back to settings" variant="ghost" size="icon" asChild><Link to="/settings"><ChevronLeft /></Link></Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Privacy</h1>
            <p className="text-sm text-foreground-secondary">Who sees what, and what we keep</p>
          </div>
        </motion.header>

        <motion.section variants={fadeUp}>
          <Card variant="default" padding="lg">
            {me.isLoading ? <Skeleton className="h-16" /> : (
              <label className="flex items-start gap-3">
                <span className="size-10 rounded-lg bg-primary/15 grid place-items-center flex-shrink-0"><Lock className="size-5 text-primary" aria-hidden /></span>
                <span className="flex-1">
                  <span className="block font-medium text-foreground">Private account</span>
                  <span className="block text-xs text-foreground-secondary">Only people who follow you can see your posts, loops, followers and following. Your name, photo and bio stay visible so people can find you.</span>
                </span>
                <Switch checked={isPrivate} onCheckedChange={setPrivate} disabled={update.isPending} aria-label="Private account" data-testid="private-account-switch" />
              </label>
            )}
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-muted/60 px-3 py-2 text-xs text-foreground-secondary">
              <Eye className="size-4 flex-shrink-0 mt-0.5" aria-hidden />
              <p>Sellers’ storefronts and products are always public; a private account only affects your social profile. Read receipts and activity status aren’t tracked on Ezyify.</p>
            </div>
          </Card>
        </motion.section>

        <motion.section variants={fadeUp} id="blocked">
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg text-foreground mb-1 flex items-center gap-2"><Ban className="size-5" aria-hidden /> Blocked accounts</h2>
            <p className="text-xs text-foreground-secondary mb-4">Blocked people can’t see your profile or posts, message you, or find you in search.</p>
            {blocked.isLoading ? (
              <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-12" />)}</div>
            ) : blocked.isError ? (
              <p className="text-sm text-error">{formErrors(blocked.error).message ?? 'Couldn’t load blocked accounts.'}</p>
            ) : (blocked.data ?? []).length === 0 ? (
              <p className="text-sm text-foreground-secondary" data-testid="blocked-empty">You haven’t blocked anyone.</p>
            ) : (
              <ul className="divide-y divide-border" aria-label="Blocked accounts">
                {blocked.data!.map(u => (
                  <li key={u.id} className="flex items-center gap-3 py-2.5" data-testid={`blocked-${u.username}`}>
                    <Img src={avatarUrlFor(u, 64)} alt="" className="size-9 rounded-full object-cover bg-muted" />
                    <span className="flex-1 min-w-0"><span className="block text-sm font-medium text-foreground truncate">{u.name}</span><span className="block text-xs text-foreground-secondary">@{u.username}</span></span>
                    <Button size="sm" variant="outline" loading={toggleBlock.isPending && toggleBlock.variables?.userId === u.id} onClick={() => toggleBlock.mutate({ userId: u.id, blocked: true }, { onSuccess: () => toast.success(`Unblocked @${u.username}`), onError: err => toast.error(formErrors(err).message ?? 'Could not unblock') })}>Unblock</Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.section>

        <motion.section variants={fadeUp}>
          <Card variant="default" padding="lg" className="space-y-4">
            <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2"><ShieldCheck className="size-5" aria-hidden /> Your data</h2>
            <div className="flex items-start gap-3">
              <span className="size-10 rounded-lg bg-primary/15 grid place-items-center flex-shrink-0"><Download className="size-5 text-primary" aria-hidden /></span>
              <div className="flex-1">
                <p className="font-medium text-foreground">Download your data</p>
                <p className="text-xs text-foreground-secondary">We email {account.data?.email ?? 'you'} a JSON export of your profile, posts, orders and messages within 24 hours.</p>
              </div>
              <Button size="sm" variant="outline" loading={exportData.isPending} onClick={() => exportData.mutate(undefined, { onSuccess: () => toast.success('Export requested — check your inbox soon'), onError: err => toast.error(formErrors(err).message ?? 'Could not request export') })}>Request</Button>
            </div>
            <div className="flex items-start gap-3">
              <span className="size-10 rounded-lg bg-error/15 grid place-items-center flex-shrink-0"><Trash2 className="size-5 text-error" aria-hidden /></span>
              <div className="flex-1">
                <p className="font-medium text-foreground">Delete account</p>
                <p className="text-xs text-foreground-secondary">Schedules permanent deletion after 30 days; you can cancel within 14.</p>
              </div>
              <Button size="sm" variant="destructive" asChild><Link to="/settings/account-management#delete">Continue</Link></Button>
            </div>
          </Card>
        </motion.section>
      </motion.div>
    </div>
  );
}
