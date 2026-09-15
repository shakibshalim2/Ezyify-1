import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Camera, MapPin, Save, UserRound, Globe2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { UpdateProfileRequestSchema, avatarUrlFor, useAuth, useMe, useRuntime, useUpdateProfile, type UpdateProfileRequest, type UserProfile } from '@ezyify/core';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Field } from '../../components/primitives/Field';
import { Img } from '../../components/primitives/Img';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Textarea } from '../../components/ui/textarea';
import { uploadFile } from '../../lib/uploads';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';
import type { WebRuntime } from '../../runtime';

const BIO_MAX = 160;
const ACCEPT = 'image/jpeg,image/png,image/webp';

interface FormValues {
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  avatarUrl: string | null;
  coverUrl: string | null;
}
const fromProfile = (p: UserProfile): FormValues => ({ name: p.name, username: p.username, bio: p.bio ?? '', location: p.location ?? '', website: p.website ?? '', avatarUrl: p.avatarUrl, coverUrl: p.coverUrl });

/** Only fields that changed are sent; empty strings clear nullable fields; a bare domain is promoted to https. */
export function diffProfile(initial: FormValues, current: FormValues): UpdateProfileRequest {
  const body: UpdateProfileRequest = {};
  const trim = (s: string) => s.trim();
  if (trim(current.name) !== initial.name) body.name = trim(current.name);
  if (trim(current.username).toLowerCase() !== initial.username) body.username = trim(current.username).toLowerCase();
  if (trim(current.bio) !== (initial.bio ?? '')) body.bio = trim(current.bio) || null;
  if (trim(current.location) !== (initial.location ?? '')) body.location = trim(current.location) || null;
  const site = trim(current.website);
  if (site !== (initial.website ?? '')) body.website = site ? (/^https?:\/\//i.test(site) ? site : `https://${site}`) : null;
  if (current.avatarUrl !== initial.avatarUrl) body.avatarUrl = current.avatarUrl;
  if (current.coverUrl !== initial.coverUrl) body.coverUrl = current.coverUrl;
  return body;
}

function EditProfileSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6" aria-busy="true" aria-label="Loading profile">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 w-full rounded-card" />
      <Skeleton className="h-80 w-full rounded-card" />
    </div>
  );
}

function ProfileForm({ me }: { me: UserProfile }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const runtime = useRuntime() as WebRuntime;
  const update = useUpdateProfile();
  const initial = fromProfile(me);
  const [form, setForm] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };
  const change = (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.name as keyof FormValues, e.target.value);

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

  const save = () => {
    if (!dirty) return void navigate(`/profile/${me.username}`);
    const parsed = UpdateProfileRequestSchema.safeParse(body);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0] ?? '_')] ??= i.message;
      if (body.name === '') next.name = 'Display name is required';
      setErrors(next);
      toast.error(Object.values(next)[0] ?? 'Check the highlighted fields');
      return;
    }
    if (body.name === '') return void setErrors({ name: 'Display name is required' });
    update.mutate(parsed.data, {
      onSuccess: p => {
        toast.success('Profile saved');
        navigate(`/profile/${p.username}`);
      },
      onError: err => {
        const f = formErrors(err);
        if (Object.keys(f.fields).length) setErrors(f.fields);
        else if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'CONFLICT') setErrors({ username: f.message ?? 'That username is taken' });
        toast.error(f.message ?? 'Check the highlighted fields');
      },
    });
  };

  const busy = update.isPending || uploading !== null;

  return (
    <motion.main variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="mx-auto max-w-2xl space-y-6 px-4 py-6 lg:py-8">
      <motion.header variants={fadeUp} className="flex items-center gap-3">
        <Button aria-label="Back to profile" variant="ghost" size="icon" asChild>
          <Link to={`/profile/${me.username}`}><ArrowLeft /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold">Edit profile</h1>
          <p className="text-sm text-foreground-secondary">Make your Ezyify space feel like you.</p>
        </div>
        <Button onClick={save} className="hidden sm:inline-flex" leftIcon={<Save />} loading={update.isPending} disabled={busy}>Save</Button>
      </motion.header>

      <motion.section variants={fadeUp}>
        <Card className="overflow-hidden p-0">
          <div className="relative h-44 sm:h-52 bg-brand-gradient">
            {form.coverUrl && <Img src={form.coverUrl} alt="Profile cover" className="absolute inset-0 size-full object-cover" />}
            {uploading === 'cover' && (
              <div className="absolute inset-0 grid place-items-center bg-black/40" aria-label="Uploading cover"><Loader2 className="size-6 animate-spin text-white" /></div>
            )}
            <div className="absolute right-3 top-3 flex gap-2">
              {form.coverUrl && (
                <Button aria-label="Remove cover photo" variant="secondary" size="icon" onClick={() => set('coverUrl', null)} disabled={busy}><X /></Button>
              )}
              <Button aria-label="Change cover photo" variant="secondary" size="icon" onClick={() => coverInput.current?.click()} disabled={busy}><Camera /></Button>
            </div>
            <input ref={coverInput} type="file" accept={ACCEPT} hidden aria-label="Cover photo file" onChange={e => { void pick('cover', e.target.files); e.target.value = ''; }} />
          </div>
          <div className="flex items-end gap-4 p-4">
            <div className="relative">
              <Img src={avatarUrlFor({ ...me, avatarUrl: form.avatarUrl, name: form.name || me.name }, 160)} alt={form.name || me.name} className="size-20 rounded-full border-4 border-background object-cover bg-background-elevated" />
              {uploading === 'avatar' && <div className="absolute inset-0 grid place-items-center rounded-full bg-black/40" aria-label="Uploading photo"><Loader2 className="size-5 animate-spin text-white" /></div>}
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" leftIcon={<Camera />} onClick={() => avatarInput.current?.click()} disabled={busy}>Change photo</Button>
                {form.avatarUrl && <Button variant="ghost" size="sm" onClick={() => set('avatarUrl', null)} disabled={busy}>Remove</Button>}
              </div>
              <p className="mt-1 text-xs text-foreground-secondary">JPG, PNG or WebP · square works best</p>
              <input ref={avatarInput} type="file" accept={ACCEPT} hidden aria-label="Profile photo file" onChange={e => { void pick('avatar', e.target.files); e.target.value = ''; }} />
            </div>
          </div>
        </Card>
      </motion.section>

      <motion.section variants={fadeUp}>
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Public profile</h2>
          <Field label="Display name" name="name" value={form.name} onChange={change} leftIcon={<UserRound className="size-4" />} error={errors.name} maxLength={50} required />
          <Field
            label="Username"
            name="username"
            value={form.username}
            onChange={e => set('username', e.target.value.toLowerCase())}
            hint={`ezyify.app/profile/${form.username || '…'}`}
            error={errors.username}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={30}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-bio" className="text-sm font-semibold text-foreground">Bio</label>
            <Textarea
              id="profile-bio"
              name="bio"
              value={form.bio}
              onChange={e => set('bio', e.target.value.slice(0, BIO_MAX))}
              rows={4}
              maxLength={BIO_MAX}
              aria-invalid={!!errors.bio}
              className={cn('resize-none bg-background-elevated', errors.bio && 'border-error')}
              placeholder="Tell shoppers and followers what you're about"
            />
            <div className="flex justify-between text-xs">
              {errors.bio ? <span className="font-medium text-error" role="alert">{errors.bio}</span> : <span className="text-foreground-tertiary">Shown on your public profile</span>}
              <span className="text-foreground-tertiary tabular-nums">{form.bio.length}/{BIO_MAX}</span>
            </div>
          </div>
          <Field label="Location" name="location" value={form.location} onChange={change} leftIcon={<MapPin className="size-4" />} error={errors.location} maxLength={80} />
          <Field label="Website" name="website" type="url" inputMode="url" placeholder="yourstore.com" value={form.website} onChange={change} leftIcon={<Globe2 className="size-4" />} error={errors.website} hint="Shown as a link on your profile" />
        </Card>
      </motion.section>

      <motion.section variants={fadeUp}>
        <Card className="space-y-2">
          <h2 className="font-display text-lg font-semibold">Private details</h2>
          <p className="text-sm text-foreground-secondary">Email, phone, password and two-factor authentication live in <Link to="/settings/security" className="text-primary font-medium underline-offset-4 hover:underline">Security settings</Link>. They are never shown on your profile.</p>
        </Card>
      </motion.section>

      <motion.div variants={fadeUp} className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(`/profile/${me.username}`)} disabled={update.isPending}>Cancel</Button>
        <Button onClick={save} leftIcon={<Save />} loading={update.isPending} disabled={busy || !dirty}>Save changes</Button>
      </motion.div>
    </motion.main>
  );
}

/** `GET /users/me` → `PATCH /users/me` (only changed fields); avatar/cover go through signed uploads. */
export default function EditProfilePage() {
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const me = useMe();

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/profile/edit' } });
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Edit Profile — Ezyify" description="Update your Ezyify profile information, photo, and bio." />
      {me.isLoading || status === 'anonymous' ? (
        <EditProfileSkeleton />
      ) : me.isError || !me.data ? (
        <div className="px-4 py-10">
          <EmptyState kind="error" title="Couldn’t load your profile" description={me.error ? (formErrors(me.error).message ?? 'Please try again.') : 'Please try again.'} action={<Button onClick={() => me.refetch()}>Retry</Button>} />
        </div>
      ) : (
        <ProfileForm key={me.data.id} me={me.data} />
      )}
    </div>
  );
}
