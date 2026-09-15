import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { ChevronLeft, Mail, Phone, MapPin, Plus, Trash2, Star, CalendarDays, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DeleteAccountRequestSchema, formatRelativeTime, useAccount, useAddresses, useApi, useAuth, useDeleteAddress, useMe, useRuntime, type DeleteAccountRequest } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { SEO } from '../../components/SEO';
import { AddressForm, fmtAddress } from '../../components/AddressForm';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';
import type { WebRuntime } from '../../runtime';

const REASONS: { id: DeleteAccountRequest['reason']; label: string }[] = [
  { id: 'not_useful', label: "I don't find it useful" },
  { id: 'privacy', label: 'Privacy concerns' },
  { id: 'too_many_notifications', label: 'Too many notifications' },
  { id: 'switching', label: 'Switching to another app' },
  { id: 'other', label: 'Something else' },
];

/** Account details (`/users/me/account`), saved addresses, and the Play-policy-compliant deletion flow. */
export default function AccountManagementPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const runtime = useRuntime() as WebRuntime;
  const api = useApi();
  const me = useMe();
  const account = useAccount();
  const addresses = useAddresses();
  const removeAddress = useDeleteAddress();
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reason, setReason] = useState<DeleteAccountRequest['reason'] | ''>('');
  const [feedback, setFeedback] = useState('');
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const requestDeletion = useMutation({ mutationFn: (body: DeleteAccountRequest) => api.account.requestDeletion(body) });

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/settings/account-management' } });
  }, [status, navigate]);
  useEffect(() => {
    if (window.location.hash === '#delete' && account.data) setDeleting(true);
  }, [account.data]);

  const submitDeletion = () => {
    const parsed = DeleteAccountRequestSchema.safeParse({ reason: reason || undefined, feedback: feedback.trim() || undefined, password });
    if (!parsed.success) return void setDeleteError(parsed.error.issues[0]?.path[0] === 'reason' ? 'Pick a reason' : parsed.error.issues[0]?.message ?? 'Check the form');
    if (!password) return void setDeleteError('Enter your password to confirm');
    setDeleteError(null);
    requestDeletion.mutate(parsed.data, {
      onSuccess: async () => {
        toast.success('Deletion scheduled — sign in within 14 days to cancel');
        await runtime.signOut();
        navigate('/', { replace: true });
      },
      onError: err => setDeleteError(formErrors(err).message ?? 'Could not schedule deletion'),
    });
  };

  const a = account.data;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Account — Ezyify" description="Your contact details, saved addresses and account controls." />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} initial="hidden" animate="visible" className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <motion.header variants={fadeUp} className="flex items-center gap-3">
          <Button aria-label="Back to settings" variant="ghost" size="icon" asChild><Link to="/settings"><ChevronLeft /></Link></Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Account</h1>
            <p className="text-sm text-foreground-secondary">Contact details, addresses and account controls</p>
          </div>
        </motion.header>

        <motion.section variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg text-foreground mb-4">Contact details</h2>
            {account.isLoading || !a ? (
              <div className="space-y-3"><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
            ) : (
              <dl className="divide-y divide-border">
                <div className="flex items-center gap-3 py-3">
                  <span className="size-10 rounded-lg bg-primary/15 grid place-items-center flex-shrink-0"><Mail className="size-5 text-primary" aria-hidden /></span>
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs text-foreground-secondary">Email</dt>
                    <dd className="font-medium text-foreground truncate" data-testid="account-email">{a.email}</dd>
                  </div>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-lg inline-flex items-center gap-1', a.emailVerified ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning')}>{a.emailVerified && <ShieldCheck className="size-3.5" aria-hidden />}{a.emailVerified ? 'Verified' : 'Unverified'}</span>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <span className="size-10 rounded-lg bg-primary/15 grid place-items-center flex-shrink-0"><Phone className="size-5 text-primary" aria-hidden /></span>
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs text-foreground-secondary">Phone</dt>
                    <dd className="font-medium text-foreground">{a.phone ?? <span className="text-foreground-tertiary font-normal">Not added</span>}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <span className="size-10 rounded-lg bg-primary/15 grid place-items-center flex-shrink-0"><CalendarDays className="size-5 text-primary" aria-hidden /></span>
                  <div className="flex-1 min-w-0">
                    <dt className="text-xs text-foreground-secondary">Member since</dt>
                    <dd className="font-medium text-foreground">{new Date(a.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} · <span className="capitalize">{a.role}</span></dd>
                  </div>
                </div>
              </dl>
            )}
            <p className="mt-3 text-xs text-foreground-secondary">Changing your email or phone re-verifies it. <Link to="/help" className="text-primary hover:underline">Contact support</Link> to update them; your public profile is edited <Link to="/profile/edit" className="text-primary hover:underline">here</Link>.</p>
          </Card>
        </motion.section>

        <motion.section variants={fadeUp} id="addresses">
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2"><MapPin className="size-5" aria-hidden /> Addresses</h2>
              {!adding && <Button size="sm" variant="outline" leftIcon={<Plus className="size-4" aria-hidden />} onClick={() => setAdding(true)}>Add</Button>}
            </div>
            {addresses.isLoading ? (
              <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-16" />)}</div>
            ) : addresses.isError ? (
              <p className="text-sm text-error">{formErrors(addresses.error).message ?? 'Couldn’t load addresses.'}</p>
            ) : (addresses.data ?? []).length === 0 && !adding ? (
              <p className="text-sm text-foreground-secondary" data-testid="addresses-empty">No saved addresses yet. Add one to speed up checkout.</p>
            ) : (
              <ul className="divide-y divide-border" aria-label="Saved addresses">
                {addresses.data!.map(ad => (
                  <li key={ad.id} className="flex items-start gap-3 py-3" data-testid={`address-${ad.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">{ad.label}{ad.isDefault && <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary"><Star className="size-3" aria-hidden />Default</span>}</p>
                      <p className="text-sm text-foreground">{ad.recipient} · {ad.phone}</p>
                      <p className="text-xs text-foreground-secondary">{fmtAddress(ad)}</p>
                    </div>
                    <Button size="sm" variant="ghost" aria-label={`Remove ${ad.label} address`} loading={removeAddress.isPending && removeAddress.variables === ad.id} onClick={() => removeAddress.mutate(ad.id, { onSuccess: () => toast.success('Address removed'), onError: err => toast.error(formErrors(err).message ?? 'Could not remove') })}><Trash2 className="size-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
            {adding && (
              <div className="mt-4 rounded-xl border border-border p-4">
                <AddressForm onSaved={() => { setAdding(false); toast.success('Address saved'); }} onCancel={() => setAdding(false)} />
              </div>
            )}
          </Card>
        </motion.section>

        <motion.section variants={fadeUp} id="delete">
          <Card variant="default" padding="lg" className="border-error/30">
            <div className="flex items-start gap-3">
              <span className="size-10 rounded-lg bg-error/15 grid place-items-center flex-shrink-0"><AlertTriangle className="size-5 text-error" aria-hidden /></span>
              <div className="flex-1">
                <h2 className="font-display font-semibold text-lg text-foreground">Delete account</h2>
                <p className="text-xs text-foreground-secondary mt-0.5">Your profile, posts, messages and saved data are permanently deleted after 30 days. Order and payout records required by law are retained. Sign in within 14 days to cancel.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setDeleting(true)} disabled={!a}>Delete…</Button>
            </div>
          </Card>
        </motion.section>
      </motion.div>

      <Dialog open={deleting} onOpenChange={o => { if (!o) { setDeleting(false); setDeleteError(null); setPassword(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>Deletion is scheduled for 30 days from now. You’ll be signed out everywhere; signing back in within 14 days cancels it.</DialogDescription>
          </DialogHeader>
          <div role="radiogroup" aria-label="Reason" className="grid gap-2">
            {REASONS.map(r => (
              <button key={r.id} type="button" role="radio" aria-checked={reason === r.id} onClick={() => { setReason(r.id); setDeleteError(null); }} className={cn('rounded-xl border-2 px-3 py-2 text-sm text-left transition-colors', reason === r.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border hover:border-primary/50 text-foreground-secondary')}>{r.label}</button>
            ))}
          </div>
          <Textarea value={feedback} onChange={e => setFeedback(e.target.value.slice(0, 500))} rows={2} maxLength={500} placeholder="Anything we could have done better? (optional)" aria-label="Feedback" />
          <Field label="Confirm with your password" type="password" autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setDeleteError(null); }} error={deleteError ?? undefined} required />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(false)} disabled={requestDeletion.isPending}>Keep my account</Button>
            <Button variant="destructive" loading={requestDeletion.isPending} onClick={submitDeletion}>Schedule deletion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
