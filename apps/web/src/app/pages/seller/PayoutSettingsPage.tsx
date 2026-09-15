import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { Landmark, Smartphone, Plus, Trash2, Star, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, CreatePayoutMethodRequestSchema, useAuth, usePayoutMethodAction, usePayoutMethods, type PayoutMethod } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { QueryError } from '../../components/QueryError';
import { ConfirmDialog, type ConfirmState } from '../../components/ConfirmDialog';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

type Draft = { type: 'bank_account' | 'ewallet'; label: string; holderName: string; institution: string; accountNumber: string; routing: string; isDefault: boolean };
const EMPTY: Draft = { type: 'bank_account', label: '', holderName: '', institution: '', accountNumber: '', routing: '', isDefault: false };

function AddMethodForm({ onDone, first }: { onDone: () => void; first: boolean }) {
  const [d, setD] = useState<Draft>({ ...EMPTY, isDefault: first });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const action = usePayoutMethodAction();
  const set = (k: keyof Draft) => (ev: React.ChangeEvent<HTMLInputElement>) => { setD(x => ({ ...x, [k]: ev.target.value })); setErrors(e => ({ ...e, [k]: '' })); };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const parsed = CreatePayoutMethodRequestSchema.safeParse({ ...d, label: d.label || d.institution, routing: d.routing || undefined, country: 'ID' });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      return setErrors(next);
    }
    action.mutate({ action: 'add', body: parsed.data }, {
      onSuccess: m => { toast.success(`${m?.institution ?? 'Payout method'} added`); onDone(); },
      onError: err => { const f = formErrors(err); setErrors(f.fields.accountNumber || f.fields.holderName || f.fields.institution ? f.fields : { _: f.message ?? 'Could not save' }); },
    });
  };

  const isBank = d.type === 'bank_account';
  return (
    <Card variant="default" padding="lg">
      <form onSubmit={submit} className="space-y-4" noValidate data-testid="payout-form">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-foreground">Add payout method</h2>
          <div role="radiogroup" aria-label="Method type" className="inline-flex rounded-xl border border-border bg-card p-1">
            {([['bank_account', 'Bank account', Landmark], ['ewallet', 'E‑wallet', Smartphone]] as const).map(([t, label, Icon]) => (
              <button key={t} type="button" role="radio" aria-checked={d.type === t} onClick={() => setD(x => ({ ...x, type: t }))} className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', d.type === t ? 'bg-primary text-primary-foreground' : 'text-foreground-secondary hover:text-foreground')}>
                <Icon className="size-4" aria-hidden />{label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={isBank ? 'Bank name' : 'E‑wallet provider'} placeholder={isBank ? 'e.g. Bank Mandiri' : 'e.g. GoPay'} value={d.institution} onChange={set('institution')} error={errors.institution} autoComplete="organization" required />
          <Field label="Account holder name" placeholder="Exactly as on the account" value={d.holderName} onChange={set('holderName')} error={errors.holderName} autoComplete="name" required />
          <Field label={isBank ? 'Account number' : 'Phone / account ID'} placeholder={isBank ? '1234567890' : '0812 3456 7890'} value={d.accountNumber} onChange={set('accountNumber')} error={errors.accountNumber} inputMode="numeric" autoComplete="off" required hint="Encrypted at rest — only the last 4 digits are ever shown." />
          {isBank && <Field label="Branch / SWIFT (optional)" placeholder="e.g. BMRIIDJA" value={d.routing} onChange={set('routing')} error={errors.routing} autoComplete="off" />}
          <Field label="Nickname (optional)" placeholder={d.institution || 'e.g. Main account'} value={d.label} onChange={set('label')} error={errors.label} />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" className="size-4 rounded border-border accent-primary" checked={d.isDefault} onChange={ev => setD(x => ({ ...x, isDefault: ev.target.checked }))} disabled={first} />
          Use as default for withdrawals
        </label>
        {errors._ && <p className="text-sm text-error" role="alert">{errors._}</p>}
        <div className="flex justify-end gap-2">
          {!first && <Button type="button" variant="ghost" onClick={onDone} disabled={action.isPending}>Cancel</Button>}
          <Button type="submit" variant="gradient" loading={action.isPending} className="shadow-brand">Save payout method</Button>
        </div>
      </form>
    </Card>
  );
}

function MethodRow({ m, onConfirm }: { m: PayoutMethod; onConfirm: (s: ConfirmState) => void }) {
  const action = usePayoutMethodAction();
  const Icon = m.type === 'bank_account' ? Landmark : Smartphone;
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border p-3" data-testid={`payout-method-${m.id}`}>
      <span className="size-10 rounded-lg bg-background-elevated flex items-center justify-center shrink-0"><Icon className="size-5 text-foreground-secondary" aria-hidden /></span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{m.label}{m.label !== m.institution ? ` · ${m.institution}` : ''} ••••{m.accountLast4}</p>
        <p className="text-xs text-foreground-secondary truncate">{m.holderName} · {m.country}{m.isDefault ? ' · Default' : ''}</p>
      </div>
      {m.isDefault ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg"><Star className="size-3 fill-primary" aria-hidden />Default</span>
      ) : (
        <Button variant="ghost" size="sm" loading={action.isPending} onClick={() => action.mutate({ action: 'default', id: m.id }, { onSuccess: () => toast.success(`${m.institution} is now your default`), onError: err => toast.error(formErrors(err).message ?? 'Could not update') })}>Make default</Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Remove ${m.institution} ending ${m.accountLast4}`}
        onClick={() => onConfirm({ title: `Remove ${m.institution} ••••${m.accountLast4}?`, message: 'Future withdrawals will need another payout method. Pending withdrawals to this account continue to process.', confirmLabel: 'Remove', destructive: true, onConfirm: () => action.mutate({ action: 'remove', id: m.id }, { onSuccess: () => toast.success('Payout method removed'), onError: err => toast.error(formErrors(err).message ?? 'Could not remove') }) })}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </li>
  );
}

/** Saved payout destinations (`/seller/payout-methods`). Account numbers are encrypted server-side; we only ever see last4. */
export default function PayoutSettingsPage() {
  const reduce = useReducedMotion();
  const status = useAuth(s => s.status);
  const methods = usePayoutMethods();
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const list = methods.data ?? [];

  return (
    <SellerLayout>
      <SEO title="Payout settings — Ezyify Seller" description="Configure your payout methods." />
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-6">
        <motion.div variants={fadeUp} className="space-y-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2"><Link to="/seller/earnings"><ArrowLeft className="size-4" aria-hidden />Earnings</Link></Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground">Payout methods</h1>
              <p className="text-sm text-foreground-secondary mt-1">Where your withdrawals go. Keep up to five.</p>
            </div>
            {list.length > 0 && !adding && list.length < 5 && <Button variant="primary" size="md" leftIcon={<Plus className="size-4" aria-hidden />} onClick={() => setAdding(true)}>Add</Button>}
          </div>
        </motion.div>

        {status === 'anonymous' || (methods.error instanceof ApiError && methods.error.code === 'UNAUTHORIZED') ? (
          <EmptyState kind="orders" title="Sign in to manage payouts" description="Your payout methods live here." action={<Button asChild><Link to="/login" state={{ next: '/seller/payout-settings' }}>Sign in</Link></Button>} />
        ) : methods.isError && methods.error instanceof ApiError && methods.error.code === 'FORBIDDEN' ? (
          <EmptyState kind="orders" title="Seller or creator account required" description="Open a store or join the creator programme to receive payouts." action={<Button variant="gradient" asChild><Link to="/sell-on-ezyify">Open a store</Link></Button>} />
        ) : methods.isError ? (
          <QueryError error={methods.error} onRetry={() => void methods.refetch()} />
        ) : methods.isLoading ? (
          <Skeleton className="h-40" />
        ) : (
          <>
            {list.length > 0 && (
              <motion.div variants={fadeUp}>
                <Card variant="default" padding="lg">
                  <ul className="space-y-3" aria-label="Saved payout methods">
                    {list.map(m => <MethodRow key={m.id} m={m} onConfirm={setConfirm} />)}
                  </ul>
                </Card>
              </motion.div>
            )}
            {(adding || list.length === 0) && (
              <motion.div variants={fadeUp}><AddMethodForm first={list.length === 0} onDone={() => setAdding(false)} /></motion.div>
            )}
            <motion.div variants={fadeUp} className="flex items-start gap-3 rounded-xl bg-background-elevated p-4 text-xs text-foreground-secondary">
              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" aria-hidden />
              <p>Account numbers are encrypted with AES‑256‑GCM before they’re stored and never returned by the API. Withdrawals can only go to a method saved here — never to an account typed at withdrawal time.</p>
            </motion.div>
          </>
        )}
      </motion.div>
    </SellerLayout>
  );
}
