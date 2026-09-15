import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle2, WifiOff, Search, X, Radio, Image as ImageIcon, Clapperboard, CircleDashed } from 'lucide-react';
import { flattenPages, formatMoney, useAuth, useCreatePost, useProducts, useRuntime, type CreatePostRequest, type Media, type ProductSummary } from '@ezyify/core';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { Field } from '../components/primitives/Field';
import { Img } from '../components/primitives/Img';
import { Skeleton } from '../components/primitives/Skeleton';
import { SEO, SEOConfigs } from '../components/SEO';
import { StepBar } from '../components/upload/StepBar';
import { MediaUpload, type UploadedMedia } from '../components/upload/MediaUpload';
import { DetailsForm } from '../components/upload/DetailsForm';
import { uploadFile } from '../lib/uploads';
import { formErrors } from '../lib/apiErrors';
import { cn } from '../components/ui/utils';
import type { WebRuntime } from '../runtime';

/** UI kinds map onto the API's `post | loop | story`; `live` hands off to Live Shopping. */
type ContentType = 'photo' | 'loop' | 'story' | 'live';
const CONTENT_TYPES: { value: ContentType; label: string; hint: string; icon: typeof ImageIcon }[] = [
  { value: 'photo', label: 'Post', hint: 'Up to 10 photos or videos', icon: ImageIcon },
  { value: 'loop', label: 'Loop', hint: 'One vertical video', icon: Clapperboard },
  { value: 'story', label: 'Story', hint: 'Gone after 24 h', icon: CircleDashed },
  { value: 'live', label: 'Live', hint: 'Go live with products', icon: Radio },
];
const API_KIND: Record<Exclude<ContentType, 'live'>, NonNullable<CreatePostRequest['kind']>> = { photo: 'post', loop: 'loop', story: 'story' };
const MEDIA_LIMIT: Record<Exclude<ContentType, 'live'>, number> = { photo: 10, loop: 1, story: 1 };
const HASHTAG = /#([\p{L}\p{N}_]+)/gu;

function OfflineBanner() {
  return (
    <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} role="status" className="bg-warning/10 border border-warning/40 rounded-lg p-3 flex items-start gap-3 mb-6">
      <WifiOff className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="font-medium text-sm text-foreground">You're offline</p>
        <p className="text-xs text-foreground-secondary">Reconnect before publishing — media uploads need a connection.</p>
      </div>
    </motion.div>
  );
}

/** Tag up to 10 catalog products so the post is shoppable. */
function ProductTagger({ selected, onChange }: { selected: ProductSummary[]; onChange: (next: ProductSummary[]) => void }) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q.trim()), 250);
    return () => window.clearTimeout(t);
  }, [q]);
  const products = useProducts({ pageSize: 12, ...(debounced ? { q: debounced } : {}) });
  const results = useMemo(() => flattenPages<ProductSummary>(products.data), [products.data]);
  const ids = new Set(selected.map(p => p.id));
  const toggle = (p: ProductSummary) => {
    if (ids.has(p.id)) return onChange(selected.filter(x => x.id !== p.id));
    if (selected.length >= 10) return void toast.error('You can tag up to 10 products');
    onChange([...selected, p]);
  };
  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display font-semibold text-lg text-foreground">Tag products</h2>
        <span className="text-xs text-foreground-secondary tabular-nums">{selected.length}/10</span>
      </div>
      <p className="text-xs text-foreground-secondary mb-4">Tagged products show a shop button on your post. Escrow protects every purchase.</p>
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-4" aria-label="Tagged products">
          {selected.map(p => (
            <li key={p.id} className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 pl-1 pr-2 py-1 text-xs font-semibold text-primary">
              <Img src={p.imageUrl} alt="" className="size-6 rounded-full object-cover" />
              <span className="max-w-[10rem] truncate">{p.name}</span>
              <button type="button" onClick={() => toggle(p)} aria-label={`Untag ${p.name}`} className="hover:text-error"><X className="size-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
      <Field label="Search products" hideLabel type="search" placeholder="Search the catalog…" value={q} onChange={e => setQ(e.target.value)} leftIcon={<Search className="size-4" aria-hidden />} />
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2" role="listbox" aria-label="Product results" aria-multiselectable="true">
        {products.isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          : results.map(p => {
              const on = ids.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => toggle(p)}
                  data-testid={`tag-product-${p.id}`}
                  className={cn('flex items-center gap-2 rounded-xl border p-2 text-left transition-colors', on ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}
                >
                  <Img src={p.imageUrl} alt="" className="size-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-foreground-secondary">{formatMoney(p.price)}</p>
                  </div>
                </button>
              );
            })}
      </div>
      {!products.isLoading && results.length === 0 && <p className="mt-3 text-sm text-foreground-secondary">No products match “{debounced}”.</p>}
      {products.isError && <p className="mt-3 text-sm text-error">{formErrors(products.error).message}</p>}
    </Card>
  );
}

/** Create flow: pick media → details (+ product tags) → review; publishes through signed uploads + `POST /posts`. */
export default function UploadPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const status = useAuth(s => s.status);
  const me = useAuth(s => s.user);
  const runtime = useRuntime() as WebRuntime;
  const create = useCreatePost();

  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [step, setStep] = useState(0);
  const initialKind = params.get('kind');
  const [contentType, setContentType] = useState<ContentType>(CONTENT_TYPES.some(t => t.value === initialKind) ? (initialKind as ContentType) : 'photo');
  const [medias, setMedias] = useState<UploadedMedia[]>([]);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [tagged, setTagged] = useState<ProductSummary[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/upload' } });
  }, [status, navigate]);

  useEffect(() => {
    const on = () => setIsOnline(true), off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Object URLs from MediaUpload are released when the page unmounts.
  useEffect(() => () => medias.forEach(m => { if (m.preview.startsWith('blob:')) URL.revokeObjectURL(m.preview); }), [medias]);

  const steps = ['Media', 'Details', 'Review'];
  const isLive = contentType === 'live';
  const limit = isLive ? 0 : MEDIA_LIMIT[contentType];
  const publishing = progress !== null;

  const canProceed = useCallback(() => {
    if (isLive) return false;
    if (step === 0) return medias.length > 0 && medias.length <= limit;
    if (step === 1) return contentType === 'story' || caption.trim().length > 0 || hashtags.length > 0;
    return isOnline;
  }, [isLive, step, medias.length, limit, contentType, caption, hashtags.length, isOnline]);

  const changeKind = (kind: ContentType) => {
    setContentType(kind);
    setMedias([]);
    setError(null);
  };

  const publish = async () => {
    if (isLive || publishing) return;
    setError(null);
    const kind = API_KIND[contentType];
    try {
      const media: Media[] = [];
      for (let i = 0; i < medias.length; i++) {
        const m = medias[i];
        setProgress(i / (medias.length + 1));
        const url = await uploadFile(runtime.api, m.file, kind, runtime.uploadFetch);
        const isVideo = m.file.type.startsWith('video/');
        media.push({ type: isVideo ? 'video' : 'image', url, thumbnailUrl: null, width: m.width ?? null, height: m.height ?? null, durationMs: isVideo && m.duration ? Math.round(m.duration * 1000) : null });
      }
      setProgress(medias.length / (medias.length + 1));
      // Hashtags from the chips plus any typed inline; the API stores them without '#'.
      const tags = [...new Set([...hashtags.map(h => h.replace(/^#/, '')), ...[...caption.matchAll(HASHTAG)].map(m => m[1])])].filter(t => /^\w+$/.test(t)).slice(0, 30);
      const created = await create.mutateAsync({ kind, caption: caption.trim(), hashtags: tags, media, taggedProductIds: tagged.map(p => p.id), location: location.trim() || null });
      setProgress(1);
      toast.success(kind === 'story' ? 'Story shared for 24 hours' : kind === 'loop' ? 'Loop published' : 'Post published');
      if (kind === 'loop') navigate(`/loops?start=${encodeURIComponent(created.id)}`, { replace: true });
      else if (kind === 'story') navigate(me ? `/stories/${me.username}` : '/', { replace: true });
      else navigate(`/post/${created.id}`, { replace: true });
    } catch (e) {
      setError(e);
      setProgress(null);
      toast.error(formErrors(e, "We couldn't publish that. Check your connection and try again.").message ?? 'Check the highlighted fields');
    }
  };

  const fieldErrors = error ? formErrors(error, "We couldn't publish that. Check your connection and try again.") : null;
  const primaryLabel = publishing
    ? `Publishing… ${Math.round((progress ?? 0) * 100)}%`
    : step === steps.length - 1
      ? contentType === 'story' ? 'Share story' : contentType === 'loop' ? 'Publish loop' : 'Publish post'
      : 'Next';

  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.upload} />
      <StepBar currentStep={step} steps={steps} onStepClick={i => { if (i < step && !publishing) setStep(i); }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-40 lg:pb-8">
        {!isOnline && <OfflineBanner />}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              <Card variant="default" padding="lg">
                <p className="text-sm font-medium text-foreground mb-4">What are you sharing?</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="radiogroup" aria-label="Content type">
                  {CONTENT_TYPES.map(({ value, label, hint, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={contentType === value}
                      onClick={() => changeKind(value)}
                      className={cn('p-4 rounded-xl border-2 text-left transition-all', contentType === value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}
                    >
                      <Icon className={cn('size-6 mb-2', contentType === value ? 'text-primary' : 'text-foreground-secondary')} aria-hidden />
                      <p className="font-semibold text-sm text-foreground">{label}</p>
                      <p className="text-xs text-foreground-secondary">{hint}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {isLive ? (
                <Card variant="featured" padding="lg" className="text-center">
                  <Radio className="size-8 text-error mx-auto mb-3" aria-hidden />
                  <h2 className="font-display font-semibold text-lg text-foreground">Live shopping runs from the Live hub</h2>
                  <p className="text-sm text-foreground-secondary mt-1 mb-4">Schedule a session, pin products and start streaming from there.</p>
                  <Button asChild variant="gradient"><Link to="/live-shopping">Open Live Shopping</Link></Button>
                </Card>
              ) : (
                <Card variant="default" padding="lg">
                  <MediaUpload contentType={contentType === 'photo' ? 'photo' : contentType} medias={medias} onMediasChange={m => setMedias(m.slice(0, limit))} multiple={limit > 1} />
                  {medias.length > 0 && <p className="mt-3 text-xs text-foreground-secondary tabular-nums">{medias.length}/{limit} selected</p>}
                </Card>
              )}
            </motion.div>
          )}

          {step === 1 && !isLive && (
            <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              <DetailsForm contentType={contentType} caption={caption} onCaptionChange={setCaption} hashtags={hashtags} onHashtagsChange={setHashtags} location={location} onLocationChange={setLocation} />
              {contentType !== 'story' && <ProductTagger selected={tagged} onChange={setTagged} />}
            </motion.div>
          )}

          {step === 2 && !isLive && (
            <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6 max-w-2xl">
              {fieldErrors?.message && (
                <div role="alert" className="rounded-xl border border-error/30 bg-error-subtle px-4 py-3 text-sm text-error">{fieldErrors.message}</div>
              )}
              {fieldErrors && Object.keys(fieldErrors.fields).length > 0 && (
                <ul role="alert" className="rounded-xl border border-error/30 bg-error-subtle px-4 py-3 text-sm text-error list-disc pl-8">
                  {Object.entries(fieldErrors.fields).map(([k, v]) => <li key={k}><span className="font-semibold capitalize">{k}</span>: {v}</li>)}
                </ul>
              )}
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg text-foreground mb-4">Review</h2>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {medias.map(m => (
                    <div key={m.id} className={cn('flex-shrink-0 rounded-lg overflow-hidden bg-muted', contentType === 'loop' || contentType === 'story' ? 'w-24 aspect-[9/16]' : 'size-24')}>
                      {m.file.type.startsWith('video/') ? <video src={m.preview} muted playsInline className="size-full object-cover" /> : <img src={m.preview} alt="" className="size-full object-cover" />}
                    </div>
                  ))}
                </div>
                <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-foreground-secondary">Type</dt><dd className="font-medium text-foreground">{CONTENT_TYPES.find(t => t.value === contentType)?.label} · {medias.length} file{medias.length === 1 ? '' : 's'}</dd></div>
                  <div><dt className="text-foreground-secondary">Audience</dt><dd className="font-medium text-foreground">{contentType === 'story' ? 'Followers · 24 hours' : 'Everyone'}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-foreground-secondary">Caption</dt><dd className="font-medium text-foreground whitespace-pre-wrap">{caption.trim() || <span className="text-foreground-tertiary">No caption</span>}</dd></div>
                  {hashtags.length > 0 && <div className="sm:col-span-2"><dt className="text-foreground-secondary">Hashtags</dt><dd className="font-medium text-primary">{hashtags.join(' ')}</dd></div>}
                  {location.trim() && <div><dt className="text-foreground-secondary">Location</dt><dd className="font-medium text-foreground">{location.trim()}</dd></div>}
                  {tagged.length > 0 && <div><dt className="text-foreground-secondary">Tagged products</dt><dd className="font-medium text-foreground">{tagged.map(p => p.name).join(', ')}</dd></div>}
                </dl>
              </Card>
              {publishing && (
                <div role="progressbar" aria-valuenow={Math.round((progress ?? 0) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Publishing" className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-brand-gradient transition-[width]" style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sits above the mobile BottomNav (h-16) until lg, where the nav disappears. */}
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 z-40 lg:relative lg:bottom-auto lg:border-0 lg:bg-transparent lg:p-0 lg:mt-8">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <Button type="button" onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))} variant="outline" size="lg" className="flex-shrink-0" aria-label={step > 0 ? 'Previous step' : 'Cancel'} disabled={publishing}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 lg:hidden">
              <p className="text-sm font-medium text-foreground">Step {step + 1} of {steps.length}</p>
            </div>
            <Button
              type="button"
              onClick={() => (step === steps.length - 1 ? void publish() : setStep(step + 1))}
              disabled={!canProceed() || publishing}
              loading={publishing}
              size="lg"
              variant={step === steps.length - 1 ? 'gradient' : 'primary'}
              className="gap-2 lg:ml-auto"
              rightIcon={publishing ? undefined : step === steps.length - 1 ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            >
              {primaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
