import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ShieldCheck, CheckCircle2, XCircle, Clock, ExternalLink, ChevronLeft } from 'lucide-react';
import { ApiError, avatarUrlFor, formatTimeAgo, useAdminKycQueue, useAuth, useReviewKyc, type AdminKycSubmission, type KycStatus } from '@ezyify/core';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Img } from '../../../components/primitives/Img';
import { Skeleton } from '../../../components/primitives/Skeleton';
import { EmptyState } from '../../../components/primitives/EmptyState';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { SEO } from '../../../components/SEO';
import { useInfiniteList } from '../../../lib/data';
import { formErrors } from '../../../lib/apiErrors';
import { cn } from '../../../components/ui/utils';

const DOC_LABEL = { national_id: 'National ID', passport: 'Passport', driving_license: 'Driving licence' } as const;
const STATUS: Record<KycStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', className: 'bg-warning-subtle text-warning', icon: Clock },
  approved: { label: 'Approved', className: 'bg-success-subtle text-success', icon: CheckCircle2 },
  rejected: { label: 'Rejected', className: 'bg-error-subtle text-error', icon: XCircle },
};

function Doc({ src, label }: { src: string | null; label: string }) {
  if (!src) return null;
  return (
    <a href={src} target="_blank" rel="noreferrer" className="group block">
      <div className="aspect-[3/2] overflow-hidden rounded-lg bg-muted"><img src={src} alt={label} className="size-full object-cover group-hover:scale-105 transition-transform" /></div>
      <span className="mt-1 flex items-center gap-1 text-xs text-foreground-secondary">{label}<ExternalLink className="size-3" aria-hidden /></span>
    </a>
  );
}

function SubmissionCard({ k, onReject, onApprove, pending }: { k: AdminKycSubmission; onReject: () => void; onApprove: () => void; pending: boolean }) {
  const s = STATUS[k.status];
  const Icon = s.icon;
  return (
    <Card variant="elevated" padding="lg" data-testid={`kyc-${k.id}`}>
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start gap-3">
            <Img src={avatarUrlFor(k.user, 96)} alt="" className="size-12 rounded-full object-cover flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/profile/${k.user.username}`} className="font-semibold text-foreground hover:underline">{k.user.name}</Link>
                <span className="text-sm text-foreground-secondary">@{k.user.username}</span>
                <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg', s.className)}><Icon className="size-3.5" aria-hidden />{s.label}</span>
              </div>
              <p className="text-xs text-foreground-secondary">{k.email} · {k.user.role} · submitted {formatTimeAgo(k.submittedAt)}{k.reviewedAt ? ` · reviewed ${formatTimeAgo(k.reviewedAt)}` : ''}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><dt className="text-xs text-foreground-secondary">Legal name</dt><dd className="font-medium text-foreground">{k.fullName}</dd></div>
            <div><dt className="text-xs text-foreground-secondary">Document</dt><dd className="font-medium text-foreground">{DOC_LABEL[k.documentType]} · ····{k.idNumberLast4}</dd></div>
            <div><dt className="text-xs text-foreground-secondary">Date of birth</dt><dd className="font-medium text-foreground tabular-nums">{k.dateOfBirth}</dd></div>
            <div><dt className="text-xs text-foreground-secondary">Country</dt><dd className="font-medium text-foreground">{k.country}</dd></div>
          </dl>
          {k.rejectionReason && <p className="text-sm text-error"><span className="font-medium">Reason:</span> {k.rejectionReason}</p>}
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            <Doc src={k.documentFrontUrl} label="Front" />
            <Doc src={k.documentBackUrl} label="Back" />
            <Doc src={k.selfieUrl} label="Selfie" />
          </div>
        </div>
        {k.status === 'pending' && (
          <div className="flex lg:flex-col gap-2 lg:w-40 flex-shrink-0">
            <Button variant="gradient" fullWidth loading={pending} leftIcon={<CheckCircle2 className="size-4" aria-hidden />} onClick={onApprove}>Approve</Button>
            <Button variant="outline" fullWidth disabled={pending} leftIcon={<XCircle className="size-4" aria-hidden />} onClick={onReject}>Reject</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

/** Admin identity-verification queue on `GET/PATCH /admin/kyc`. Approval flips the user's verified badge. */
export default function SellerApprovalQueue() {
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const [tab, setTab] = useState<KycStatus>('pending');
  const [rejecting, setRejecting] = useState<AdminKycSubmission | null>(null);
  const [reason, setReason] = useState('');
  const review = useReviewKyc();
  const queue = useAdminKycQueue({ status: tab, pageSize: 20 });
  const { items, loadMore, loadingMore, hasMore } = useInfiniteList<AdminKycSubmission>(queue);

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/admin/operations/seller-approval' } });
  }, [status, navigate]);

  const decide = (k: AdminKycSubmission, body: Parameters<typeof review.mutate>[0]['body']) =>
    review.mutate({ id: k.id, body }, {
      onSuccess: r => { toast.success(r.status === 'approved' ? `${k.user.name} is now verified` : `Sent back to ${k.user.name}`); setRejecting(null); setReason(''); },
      onError: err => toast.error(formErrors(err).message ?? 'Could not save the decision'),
    });

  const forbidden = queue.error instanceof ApiError && queue.error.code === 'FORBIDDEN';

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Identity Verification Queue — Ezyify Admin" description="Review seller and creator identity documents." />
      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <header className="flex items-center gap-3">
          <Button aria-label="Back to admin" variant="ghost" size="icon" asChild><Link to="/admin"><ChevronLeft /></Link></Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2"><ShieldCheck className="size-6 text-primary" aria-hidden /> Identity verification</h1>
            <p className="text-sm text-foreground-secondary">Oldest pending first. Approving sets the verified badge and unlocks payouts.</p>
          </div>
        </header>

        {forbidden ? (
          <EmptyState kind="error" title="Admins only" description="This queue is restricted to the compliance team." action={<Button asChild><Link to="/">Go home</Link></Button>} />
        ) : (
          <>
            <Tabs value={tab} onValueChange={v => setTab(v as KycStatus)}>
              <TabsList className="w-full grid grid-cols-3 max-w-md">
                {(Object.keys(STATUS) as KycStatus[]).map(s => <TabsTrigger key={s} value={s}>{STATUS[s].label}</TabsTrigger>)}
              </TabsList>
            </Tabs>
            <div className="space-y-4" aria-live="polite">
              {queue.isLoading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-56 rounded-card" />)
              ) : queue.isError ? (
                <EmptyState kind="error" title="Couldn’t load the queue" description={formErrors(queue.error).message ?? 'Please try again.'} action={<Button onClick={() => queue.refetch()}>Retry</Button>} compact />
              ) : items.length === 0 ? (
                <EmptyState kind="orders" title={tab === 'pending' ? 'Queue is clear' : `No ${tab} submissions`} description={tab === 'pending' ? 'New submissions appear here as sellers verify.' : 'Decisions will show up here.'} compact />
              ) : (
                <>
                  {items.map(k => <SubmissionCard key={k.id} k={k} pending={review.isPending && review.variables?.id === k.id} onApprove={() => decide(k, { decision: 'approve' })} onReject={() => setRejecting(k)} />)}
                  {hasMore && <div className="flex justify-center"><Button variant="outline" onClick={loadMore} loading={loadingMore}>Load more</Button></div>}
                </>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={!!rejecting} onOpenChange={o => { if (!o) { setRejecting(null); setReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejecting?.user.name}’s submission</DialogTitle>
            <DialogDescription>The note is shown to the user so they can fix it and resubmit.</DialogDescription>
          </DialogHeader>
          <label htmlFor="kyc-reason" className="text-sm font-semibold text-foreground">Reason</label>
          <Textarea id="kyc-reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} maxLength={500} placeholder="e.g. Selfie is blurry — retake in good light with the ID visible" autoFocus />
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setRejecting(null); setReason(''); }} disabled={review.isPending}>Cancel</Button>
            <Button variant="destructive" loading={review.isPending} disabled={reason.trim().length < 5} onClick={() => rejecting && decide(rejecting, { decision: 'reject', reason: reason.trim() })}>Reject & notify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
