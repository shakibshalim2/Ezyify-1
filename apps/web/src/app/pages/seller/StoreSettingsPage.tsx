import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { Store, Save, Camera, Loader2, X, ExternalLink, Bell, ShieldCheck, Landmark, MapPin, Globe2 } from 'lucide-react';
import { UpdateProfileRequestSchema, avatarUrlFor, useAuth, useMe, useRuntime, useUpdateProfile, type UserProfile } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { Img } from '../../components/primitives/Img';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Textarea } from '../../components/ui/textarea';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { uploadFile } from '../../lib/uploads';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { diffProfile, profileToForm, type ProfileFormValues } from '../../lib/profileForm';
import { cn } from '../../components/ui/utils';
import type { WebRuntime } from '../../runtime';

const BIO_MAX = 160;
const ACCEPT = 'image/jpeg,image/png,image/webp';

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6" aria-busy="true" aria-label="Loading store settings">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-card" />
      <Skeleton className="h-72 w-full rounded-card" />
      <Skeleton className="h-40 w-full rounded-card" />
    </div>
  );
}

/** The storefront is the seller's public profile, so store identity saves through `PATCH /users/me`. */
function StoreForm({ me }: { me: UserProfile }) {
  const reduce = useReducedMotion();
  const runtime = useRuntime() as WebRuntime;
  const update = useUpdateProfile();
  const initial = profileToForm(me);
  const [form, setForm] = useState<ProfileFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const pick = async (purpose: 'avatar' | 'cover', files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(purpose);
    try {
      const url = await uploadFile(runtime.api, file, purpose, runtime.uploadFetch);
      set(purpose === 'avatar' ? 'avatarUrl' : 'coverUrl', url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Couldn't upload ${file.name}`);
    } finally {
      setUploading(null);
    }
  };

  const body = diffProfile(initial, form);
  const dirty = Object.keys(body).length > 0;
  const busy = update.isPending || uploading !== null;

  const save = () => {
    if (!dirty) return;
    if (body.name === '') return void setErrors({ name: 'Store name is required' });
    const parsed = UpdateProfileRequestSchema.safeParse(body);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0] ?? '_')] ??= i.message;
      setErrors(next);
      toast.error(Object.values(next)[0] ?? 'Check the highlighted fields');
      return;
    }
    update.mutate(parsed.data, {
      onSuccess: () => toast.success('Store settings saved'),
      onError: err => {
        const f = formErrors(err);
        if (Object.keys(f.fields).length) setErrors(f.fields);
        else if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'CONFLICT') setErrors({ username: f.message ?? 'That handle is taken' });
        toast.error(f.message ?? 'Check the highlighted fields');
      },
    });
  };

  return (
    <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Store settings</h1>
          <p className="text-sm text-foreground-secondary mt-1">What shoppers see on your storefront and product pages.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/seller/${me.username}`} target="_blank" rel="noreferrer"><ExternalLink className="size-4" aria-hidden />View storefront</Link>
        </Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="relative h-40 sm:h-48 bg-brand-gradient">
            {form.coverUrl && <Img src={form.coverUrl} alt="Store cover" className="absolute inset-0 size-full object-cover" />}
            {uploading === 'cover' && <div className="absolute inset-0 grid place-items-center bg-black/40" aria-label="Uploading cover"><Loader2 className="size-6 animate-spin text-white" /></div>}
            <div className="absolute right-3 top-3 flex gap-2">
              {form.coverUrl && <Button aria-label="Remove cover photo" variant="secondary" size="icon" onClick={() => set('coverUrl', null)} disabled={busy}><X /></Button>}
              <Button aria-label="Change cover photo" variant="secondary" size="icon" onClick={() => coverInput.current?.click()} disabled={busy}><Camera /></Button>
            </div>
            <input ref={coverInput} type="file" accept={ACCEPT} hidden aria-label="Cover photo file" onChange={e => { void pick('cover', e.target.files); e.target.value = ''; }} />
          </div>
          <div className="flex items-end gap-4 p-4">
            <div className="relative -mt-12">
              <Img src={avatarUrlFor({ ...me, avatarUrl: form.avatarUrl, name: form.name || me.name }, 160)} alt={`${form.name || me.name} logo`} className="size-20 rounded-2xl border-4 border-background object-cover bg-background-elevated" />
              {uploading === 'avatar' && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/40" aria-label="Uploading logo"><Loader2 className="size-5 animate-spin text-white" /></div>}
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" leftIcon={<Camera />} onClick={() => logoInput.current?.click()} disabled={busy}>Change logo</Button>
                {form.avatarUrl && <Button variant="ghost" size="sm" onClick={() => set('avatarUrl', null)} disabled={busy}>Remove</Button>}
              </div>
              <p className="mt-1 text-xs text-foreground-secondary">Square JPG, PNG or WebP · shown on every product card</p>
              <input ref={logoInput} type="file" accept={ACCEPT} hidden aria-label="Store logo file" onChange={e => { void pick('avatar', e.target.files); e.target.value = ''; }} />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card variant="default" padding="lg">
          <h2 className="font-display font-semibold text-lg mb-4 text-foreground flex items-center gap-2"><Store className="size-5" aria-hidden /> Store identity</h2>
          <div className="space-y-4">
            <Field label="Store name" name="name" required value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} maxLength={50} />
            <Field
              label="Store handle"
              name="username"
              required
              value={form.username}
              onChange={e => set('username', e.target.value.toLowerCase())}
              hint={`ezyify.app/seller/${form.username || '…'}`}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={30}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="store-bio" className="text-sm font-semibold text-foreground">About your store</label>
              <Textarea
                id="store-bio"
                value={form.bio}
                onChange={e => set('bio', e.target.value.slice(0, BIO_MAX))}
                rows={4}
                maxLength={BIO_MAX}
                aria-invalid={!!errors.bio}
                className={cn('resize-none bg-background-elevated', errors.bio && 'border-error')}
                placeholder="What you sell, where you ship from, what makes you different"
              />
              <div className="flex justify-between text-xs">
                {errors.bio ? <span className="font-medium text-error" role="alert">{errors.bio}</span> : <span className="text-foreground-tertiary">Shown at the top of your storefront</span>}
                <span className="text-foreground-tertiary tabular-nums">{form.bio.length}/{BIO_MAX}</span>
              </div>
            </div>
            <Field label="Ships from" name="location" value={form.location} onChange={e => set('location', e.target.value)} leftIcon={<MapPin className="size-4" />} error={errors.location} maxLength={80} placeholder="City, country" />
            <Field label="Website" name="website" type="url" inputMode="url" value={form.website} onChange={e => set('website', e.target.value)} leftIcon={<Globe2 className="size-4" />} error={errors.website} placeholder="yourbrand.com" />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card variant="default" padding="lg">
          <h2 className="font-display font-semibold text-lg mb-4 text-foreground">More settings</h2>
          <ul className="divide-y divide-border">
            {[
              { to: '/seller/payout-settings', icon: Landmark, title: 'Payout methods', body: 'Bank accounts and e-wallets withdrawals go to' },
              { to: '/settings/notifications', icon: Bell, title: 'Notifications', body: 'Order, message and payout alerts by push and email' },
              { to: '/settings/security', icon: ShieldCheck, title: 'Security', body: 'Password, two-factor authentication and active sessions' },
            ].map(({ to, icon: Icon, title, body }) => (
              <li key={to}>
                <Link to={to} className="flex items-center gap-3 py-3 hover:bg-muted/60 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="size-10 rounded-lg bg-primary-subtle text-primary grid place-items-center flex-shrink-0"><Icon className="size-5" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">{title}</span>
                    <span className="block text-xs text-foreground-secondary">{body}</span>
                  </span>
                  <ExternalLink className="size-4 text-foreground-tertiary" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="sticky bottom-4">
        <Button variant="gradient" size="lg" fullWidth loading={update.isPending} disabled={busy || !dirty} onClick={save} leftIcon={<Save className="size-5" />} className="shadow-brand">
          {dirty ? 'Save changes' : 'All changes saved'}
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default function StoreSettingsPage() {
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const me = useMe();

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/seller/settings' } });
  }, [status, navigate]);

  return (
    <SellerLayout>
      <SEO title="Store Settings — Ezyify Seller" description="Manage your storefront name, logo, cover and details." />
      {me.isLoading || status === 'anonymous' ? (
        <SettingsSkeleton />
      ) : me.isError || !me.data ? (
        <EmptyState kind="error" title="Couldn’t load your store" description={me.error ? (formErrors(me.error).message ?? 'Please try again.') : 'Please try again.'} action={<Button onClick={() => me.refetch()}>Retry</Button>} />
      ) : me.data.role !== 'seller' && me.data.role !== 'admin' ? (
        <EmptyState kind="error" title="Seller account required" description="Open a store to manage storefront settings." action={<Button asChild><Link to="/sell-on-ezyify">Start selling</Link></Button>} />
      ) : (
        <StoreForm key={`${me.data.id}:${me.data.username}`} me={me.data} />
      )}
    </SellerLayout>
  );
}
