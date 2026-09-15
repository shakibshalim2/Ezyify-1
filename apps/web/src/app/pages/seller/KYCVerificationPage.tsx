import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { CheckCircle2, Clock, XCircle, ShieldCheck, Upload, Camera, User, FileText, Loader2, Lock } from 'lucide-react';
import { SubmitKycRequestSchema, formatRelativeTime, useAuth, useKycState, useRuntime, useSubmitKyc, type KycSubmission, type SubmitKycRequest } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { uploadFile } from '../../lib/uploads';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';
import type { WebRuntime } from '../../runtime';

const DOC_TYPES: { value: SubmitKycRequest['documentType']; label: string; hint: string }[] = [
  { value: 'national_id', label: 'National ID', hint: 'Front and back' },
  { value: 'passport', label: 'Passport', hint: 'Photo page only' },
  { value: 'driving_license', label: 'Driving licence', hint: 'Front and back' },
];
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic';
type Slot = 'documentFrontUrl' | 'documentBackUrl' | 'selfieUrl';

/** One document slot: opens the picker, uploads through the signed flow with purpose `kyc`, shows the preview. */
function DocSlot({ label, hint, value, onChange, uploading, onPick, error, icon: Icon }: { label: string; hint: string; value: string | null; onChange: (v: string | null) => void; uploading: boolean; onPick: (f: File) => void; error?: string; icon: typeof Upload }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={uploading}
        aria-describedby={error ? `${label}-err` : undefined}
        aria-invalid={!!error}
        className={cn('relative w-full aspect-[3/2] rounded-xl border-2 border-dashed overflow-hidden grid place-items-center text-center transition-colors', error ? 'border-error bg-error-subtle' : value ? 'border-primary/40' : 'border-border hover:border-primary/50 bg-background-elevated')}
      >
        {value ? <img src={value} alt={`${label} preview`} className="absolute inset-0 size-full object-cover" /> : (
          <span className="px-4">
            <Icon className="size-6 mx-auto mb-2 text-foreground-secondary" aria-hidden />
            <span className="block text-sm font-medium text-foreground">Tap to upload</span>
            <span className="block text-xs text-foreground-secondary">{hint}</span>
          </span>
        )}
        {uploading && <span className="absolute inset-0 grid place-items-center bg-black/40"><Loader2 className="size-6 animate-spin text-white" aria-label="Uploading" /></span>}
      </button>
      <input ref={input} type="file" accept={ACCEPT} hidden aria-label={`${label} file`} onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ''; }} />
      <div className="flex justify-between text-xs">
        {error ? <span id={`${label}-err`} role="alert" className="text-error font-medium">{error}</span> : <span className="text-foreground-tertiary">JPG, PNG or WebP · max 12 MB</span>}
        {value && <button type="button" className="text-foreground-secondary hover:text-error" onClick={() => onChange(null)}>Remove</button>}
      </div>
    </div>
  );
}

function StatusCard({ submission, verified }: { submission: KycSubmission | null; verified: boolean }) {
  if (verified) {
    return (
      <Card variant="featured" padding="lg" className="flex items-start gap-4" data-testid="kyc-status-approved">
        <span className="size-12 rounded-full bg-success/15 grid place-items-center flex-shrink-0"><ShieldCheck className="size-6 text-success" aria-hidden /></span>
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground">Identity verified</h2>
          <p className="text-sm text-foreground-secondary mt-1">The verified badge is live on your profile and products{submission?.reviewedAt ? ` · approved ${formatRelativeTime(submission.reviewedAt)}` : ''}. Payouts and live selling are unlocked.</p>
        </div>
      </Card>
    );
  }
  if (submission?.status === 'pending') {
    return (
      <Card variant="default" padding="lg" className="flex items-start gap-4" data-testid="kyc-status-pending">
        <span className="size-12 rounded-full bg-warning/15 grid place-items-center flex-shrink-0"><Clock className="size-6 text-warning" aria-hidden /></span>
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground">Under review</h2>
          <p className="text-sm text-foreground-secondary mt-1">Submitted {formatRelativeTime(submission.submittedAt)} · {DOC_TYPES.find(d => d.value === submission.documentType)?.label} ending in {submission.idNumberLast4}. Most reviews finish within 24 hours; we'll notify you either way.</p>
        </div>
      </Card>
    );
  }
  if (submission?.status === 'rejected') {
    return (
      <Card variant="default" padding="lg" className="flex items-start gap-4 border-error/40" data-testid="kyc-status-rejected">
        <span className="size-12 rounded-full bg-error/15 grid place-items-center flex-shrink-0"><XCircle className="size-6 text-error" aria-hidden /></span>
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground">Needs another look</h2>
          <p className="text-sm text-foreground mt-1"><span className="font-medium">Reviewer note:</span> {submission.rejectionReason}</p>
          <p className="text-xs text-foreground-secondary mt-1">Fix the issue below and resubmit — your previous details are prefilled.</p>
        </div>
      </Card>
    );
  }
  return null;
}

function KycForm({ previous }: { previous: KycSubmission | null }) {
  const runtime = useRuntime() as WebRuntime;
  const submit = useSubmitKyc();
  const [form, setForm] = useState({
    documentType: previous?.documentType ?? ('national_id' as SubmitKycRequest['documentType']),
    fullName: previous?.fullName ?? '',
    idNumber: '',
    dateOfBirth: previous?.dateOfBirth ?? '',
    country: previous?.country ?? '',
    documentFrontUrl: null as string | null,
    documentBackUrl: null as string | null,
    selfieUrl: null as string | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Slot | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; }); };

  const pick = async (slot: Slot, file: File) => {
    setUploading(slot);
    try { set(slot, await uploadFile(runtime.api, file, 'kyc', runtime.uploadFetch)); }
    catch (err) { toast.error(err instanceof Error ? err.message : `Couldn't upload ${file.name}`); }
    finally { setUploading(null); }
  };

  const needsBack = form.documentType !== 'passport';
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = SubmitKycRequestSchema.safeParse({ ...form, documentBackUrl: needsBack ? form.documentBackUrl : null });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0] ?? '_')] ??= i.message;
      setErrors(next);
      toast.error('Check the highlighted fields');
      return;
    }
    submit.mutate(parsed.data, {
      onSuccess: () => toast.success('Submitted — we’ll review it within 24 hours'),
      onError: err => { const f = formErrors(err); if (Object.keys(f.fields).length) setErrors(f.fields); toast.error(f.message ?? 'Could not submit'); },
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Card variant="default" padding="lg">
        <h2 className="font-display font-semibold text-lg mb-1 text-foreground flex items-center gap-2"><User className="size-5" aria-hidden /> Personal details</h2>
        <p className="text-xs text-foreground-secondary mb-4">Exactly as printed on your document.</p>
        <div className="space-y-4">
          <Field label="Legal full name" name="fullName" required value={form.fullName} onChange={e => set('fullName', e.target.value)} error={errors.fullName} autoComplete="name" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Date of birth" name="dateOfBirth" type="date" required value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} error={errors.dateOfBirth} hint="You must be 18 or older" max={new Date().toISOString().slice(0, 10)} />
            <Field label="Country of issue" name="country" required value={form.country} onChange={e => set('country', e.target.value.toUpperCase().slice(0, 2))} error={errors.country} hint="Two-letter code, e.g. ID, SG, US" placeholder="ID" maxLength={2} autoCapitalize="characters" />
          </div>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <h2 className="font-display font-semibold text-lg mb-1 text-foreground flex items-center gap-2"><FileText className="size-5" aria-hidden /> Identity document</h2>
        <p className="text-xs text-foreground-secondary mb-4">Photos must be sharp, uncropped and glare-free.</p>
        <div role="radiogroup" aria-label="Document type" className="grid grid-cols-3 gap-2 mb-4">
          {DOC_TYPES.map(d => (
            <button key={d.value} type="button" role="radio" aria-checked={form.documentType === d.value} onClick={() => set('documentType', d.value)} className={cn('rounded-xl border-2 p-3 text-left transition-colors', form.documentType === d.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}>
              <span className="block text-sm font-semibold text-foreground">{d.label}</span>
              <span className="block text-xs text-foreground-secondary">{d.hint}</span>
            </button>
          ))}
        </div>
        <Field label="Document number" name="idNumber" required value={form.idNumber} onChange={e => set('idNumber', e.target.value)} error={errors.idNumber} hint="Encrypted at rest — only the last 4 digits are ever shown again" autoComplete="off" spellCheck={false} leftIcon={<Lock className="size-4" aria-hidden />} />
        <div className={cn('grid gap-4 mt-4', needsBack ? 'sm:grid-cols-2' : 'sm:grid-cols-1 max-w-sm')}>
          <DocSlot label="Document front" hint={form.documentType === 'passport' ? 'Photo page' : 'Front side'} icon={Upload} value={form.documentFrontUrl} onChange={v => set('documentFrontUrl', v)} uploading={uploading === 'documentFrontUrl'} onPick={f => pick('documentFrontUrl', f)} error={errors.documentFrontUrl} />
          {needsBack && <DocSlot label="Document back" hint="Back side" icon={Upload} value={form.documentBackUrl} onChange={v => set('documentBackUrl', v)} uploading={uploading === 'documentBackUrl'} onPick={f => pick('documentBackUrl', f)} error={errors.documentBackUrl} />}
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <h2 className="font-display font-semibold text-lg mb-1 text-foreground flex items-center gap-2"><Camera className="size-5" aria-hidden /> Selfie with document</h2>
        <p className="text-xs text-foreground-secondary mb-4">Hold the document next to your face. No hats, glasses or filters.</p>
        <div className="max-w-sm">
          <DocSlot label="Selfie" hint="Face and document both visible" icon={Camera} value={form.selfieUrl} onChange={v => set('selfieUrl', v)} uploading={uploading === 'selfieUrl'} onPick={f => pick('selfieUrl', f)} error={errors.selfieUrl} />
        </div>
      </Card>

      <div className="rounded-xl bg-muted/60 px-4 py-3 text-xs text-foreground-secondary flex gap-2">
        <ShieldCheck className="size-4 flex-shrink-0 mt-0.5" aria-hidden />
        <p>Documents are used only to verify your identity, reviewed by our compliance team, and never shown publicly. Your ID number is encrypted at rest.</p>
      </div>

      <Button type="submit" variant="gradient" size="lg" fullWidth loading={submit.isPending} disabled={uploading !== null} leftIcon={<CheckCircle2 className="size-5" />} className="shadow-brand">
        {previous?.status === 'rejected' ? 'Resubmit for review' : 'Submit for review'}
      </Button>
    </form>
  );
}

/** Seller identity verification on `GET/POST /kyc`. Approval flips the profile's verified badge. */
export default function KYCVerificationPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const kyc = useKycState();

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/seller/kyc-verification' } });
  }, [status, navigate]);

  return (
    <SellerLayout>
      <SEO title="Identity Verification — Ezyify Seller" description="Verify your identity to unlock payouts, live selling and the verified badge." />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-6">
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Identity verification</h1>
          <p className="text-sm text-foreground-secondary mt-1">Required for payouts, live selling and the verified badge. Takes about 3 minutes.</p>
        </motion.div>

        {kyc.isLoading || status === 'anonymous' ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading verification status"><Skeleton className="h-24 rounded-card" /><Skeleton className="h-64 rounded-card" /><Skeleton className="h-64 rounded-card" /></div>
        ) : kyc.isError || !kyc.data ? (
          <EmptyState kind="error" title="Couldn’t load your verification status" description={kyc.error ? (formErrors(kyc.error).message ?? 'Please try again.') : 'Please try again.'} action={<Button onClick={() => kyc.refetch()}>Retry</Button>} />
        ) : (
          <>
            <motion.div variants={fadeUp}><StatusCard submission={kyc.data.submission} verified={kyc.data.verified} /></motion.div>
            {kyc.data.canSubmit && <motion.div variants={fadeUp}><KycForm key={kyc.data.submission?.id ?? 'first'} previous={kyc.data.submission} /></motion.div>}
            {kyc.data.verified && (
              <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
                <Button variant="outline" asChild><Link to="/seller/payout-settings">Set up payouts</Link></Button>
                <Button variant="outline" asChild><Link to="/seller/settings">Store settings</Link></Button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </SellerLayout>
  );
}
