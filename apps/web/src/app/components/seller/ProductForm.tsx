import { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Save, Upload, X, Star, Lightbulb, Loader2, Eye, EyeOff, Tag, Trash2 } from 'lucide-react';
import { UpsertProductRequestSchema, formatMoney, useCategories, useRuntime, type Category, type SellerProductDetail, type UpsertProductRequest } from '@ezyify/core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Button } from '../primitives/Button';
import { Card } from '../primitives/Card';
import { Field } from '../primitives/Field';
import { Img } from '../primitives/Img';
import { Skeleton } from '../primitives/Skeleton';
import { uploadFile } from '../../lib/uploads';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../ui/utils';
import type { WebRuntime } from '../../runtime';

const BADGES: { value: 'none' | 'new' | 'sale' | 'bestseller' | 'limited'; label: string }[] = [
  { value: 'none', label: 'No badge' },
  { value: 'new', label: 'New' },
  { value: 'sale', label: 'Sale' },
  { value: 'bestseller', label: 'Bestseller' },
  { value: 'limited', label: 'Limited' },
];
const MAX_IMAGES = 8;
const ACCEPT = 'image/jpeg,image/png,image/webp';

/** Parses "12.50" / "12,50" / "1,250" into minor units; null when empty, NaN when not a number. */
export function toMinor(raw: string): number | null {
  const cleaned = raw.trim().replace(/[^\d.,]/g, '');
  if (!cleaned) return null;
  const normalised = /,\d{1,2}$/.test(cleaned) && !cleaned.includes('.') ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '');
  const n = Number(normalised);
  return Number.isFinite(n) ? Math.round(n * 100) : Number.NaN;
}
const toMajor = (minor: number | null | undefined) => (minor == null ? '' : (minor / 100).toFixed(2));

export interface ProductFormValues {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  images: string[];
  tags: string[];
  badge: (typeof BADGES)[number]['value'];
  published: boolean;
  freeShipping: boolean;
  etaMin: string;
  etaMax: string;
}

export const emptyProductForm: ProductFormValues = {
  name: '',
  description: '',
  categoryId: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  images: [],
  tags: [],
  badge: 'none',
  published: true,
  freeShipping: false,
  etaMin: '3',
  etaMax: '5',
};

export function productToForm(p: SellerProductDetail): ProductFormValues {
  return {
    name: p.name,
    description: p.description,
    categoryId: p.categoryId,
    price: toMajor(p.price.amount),
    compareAtPrice: toMajor(p.compareAtPrice?.amount),
    stock: String(p.stock),
    images: p.images,
    tags: p.tags,
    badge: p.badge && p.badge !== 'live' ? p.badge : 'none',
    published: p.published,
    freeShipping: p.shipping.freeOver?.amount === 0,
    etaMin: String(p.shipping.etaDays[0]),
    etaMax: String(p.shipping.etaDays[1]),
  };
}

/** Converts the form into the shared request body, returning every field error at once instead of throwing. */
export function formToRequest(v: ProductFormValues): { body: UpsertProductRequest; errors: null } | { body: null; errors: Record<string, string> } {
  const parseErrors: Record<string, string> = {};
  const price = toMinor(v.price);
  const compareAt = toMinor(v.compareAtPrice);
  const stock = v.stock.trim() === '' ? Number.NaN : Number(v.stock);
  const etaMin = Number(v.etaMin), etaMax = Number(v.etaMax);
  if (price == null || Number.isNaN(price)) parseErrors.price = 'Enter a selling price';
  if (compareAt != null && Number.isNaN(compareAt)) parseErrors.compareAtPrice = 'Enter a valid amount';
  if (!Number.isInteger(stock)) parseErrors.stock = 'Enter a whole number';
  if (!Number.isInteger(etaMin) || !Number.isInteger(etaMax)) parseErrors.etaDays = 'Enter whole days';

  // Unparseable numbers get a neutral stand-in so the schema can still report the other fields.
  const candidate: UpsertProductRequest = {
    name: v.name,
    description: v.description,
    categoryId: v.categoryId,
    price: parseErrors.price ? 1 : price!,
    compareAtPrice: parseErrors.compareAtPrice ? null : compareAt,
    stock: parseErrors.stock ? 0 : stock,
    images: v.images,
    tags: v.tags,
    badge: v.badge === 'none' ? null : v.badge,
    published: v.published,
    freeShipOver: v.freeShipping ? 0 : null,
    etaDays: parseErrors.etaDays ? [3, 5] : [etaMin, etaMax],
  };
  const parsed = UpsertProductRequestSchema.safeParse(candidate);
  const errors: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '_');
      if (!errors[key]) errors[key] = issue.message;
    }
  }
  Object.assign(errors, parseErrors);
  if (Object.keys(errors).length) return { body: null, errors };
  return { body: candidate, errors: null };
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  initial: ProductFormValues;
  /** Original product for the edit preview link + delete action. */
  product?: SellerProductDetail;
  saving: boolean;
  onSubmit: (body: UpsertProductRequest) => void;
  onDelete?: () => void;
  serverErrors?: Record<string, string>;
}

/** Add / edit product form shared by both seller pages. Images upload immediately (sign → PUT → finalize). */
export function ProductForm({ mode, initial, product, saving, onSubmit, onDelete, serverErrors }: ProductFormProps) {
  const reduce = useReducedMotion();
  const runtime = useRuntime() as WebRuntime;
  const categories = useCategories();
  const [form, setForm] = useState<ProductFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(0);
  const [tagDraft, setTagDraft] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const merged = useMemo(() => ({ ...errors, ...(serverErrors ?? {}) }), [errors, serverErrors]);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key as string]) setErrors(e => { const next = { ...e }; delete next[key as string]; return next; });
  };

  const variantStock = product?.variants.reduce((n, v) => n + v.stock, 0) ?? 0;
  const price = toMinor(form.price);
  const compareAt = toMinor(form.compareAtPrice);
  const saving_ = price != null && compareAt != null && !Number.isNaN(price) && !Number.isNaN(compareAt) && compareAt > price ? compareAt - price : null;

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_IMAGES - form.images.length;
    const picked = Array.from(files).slice(0, room);
    if (picked.length < files.length) toast.error(`You can add up to ${MAX_IMAGES} images`);
    setUploading(n => n + picked.length);
    for (const file of picked) {
      try {
        const url = await uploadFile(runtime.api, file, 'product', runtime.uploadFetch);
        setForm(f => ({ ...f, images: f.images.length < MAX_IMAGES ? [...f.images, url] : f.images }));
        setErrors(e => { const next = { ...e }; delete next.images; return next; });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Couldn't upload ${file.name}`);
      } finally {
        setUploading(n => n - 1);
      }
    }
  };
  const removeImage = (url: string) => set('images', form.images.filter(u => u !== url));
  const makeMain = (url: string) => set('images', [url, ...form.images.filter(u => u !== url)]);

  const commitTag = () => {
    const t = tagDraft.trim().toLowerCase().replace(/^#/, '');
    setTagDraft('');
    if (!t || form.tags.includes(t)) return;
    if (form.tags.length >= 10) return void toast.error('Up to 10 tags');
    set('tags', [...form.tags, t]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = formToRequest(form);
    if (r.errors) {
      setErrors(r.errors);
      const first = Object.keys(r.errors)[0];
      toast.error(r.errors[first] ?? 'Check the highlighted fields');
      document.getElementById(`product-${first}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    onSubmit(r.body);
  };

  const busy = saving || uploading > 0;

  return (
    <form onSubmit={submit} noValidate>
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6">
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">{mode === 'create' ? 'Add product' : 'Edit product'}</h1>
            <p className="text-sm text-foreground-secondary mt-1">
              {mode === 'create' ? 'List a new product for sale — save as a draft or publish straight away.' : 'Changes go live as soon as you save.'}
            </p>
          </div>
          {product && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/product/${product.id}`} target="_blank" rel="noreferrer"><Eye className="size-4" aria-hidden />Preview in store</Link>
            </Button>
          )}
        </motion.div>

        {merged._ && (
          <motion.div variants={fadeUp} role="alert" className="rounded-xl border border-error/30 bg-error-subtle px-4 py-3 text-sm text-error">
            {merged._}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={fadeUp} id="product-images">
              <Card variant="default" padding="lg">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display font-semibold text-lg text-foreground">Photos</h2>
                  <span className="text-xs text-foreground-secondary tabular-nums">{form.images.length}/{MAX_IMAGES}</span>
                </div>
                <p className="text-xs text-foreground-secondary mb-4">JPG, PNG or WebP up to 12 MB. The first photo is the cover shoppers see.</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.images.map((url, i) => (
                    <div key={url} className="group relative aspect-square rounded-card overflow-hidden border border-border bg-background-elevated" data-testid={`product-image-${i}`}>
                      <Img src={url} alt={i === 0 ? 'Cover photo' : `Photo ${i + 1}`} className="size-full object-cover" />
                      {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">Cover</span>}
                      <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                        {i !== 0 && (
                          <button type="button" onClick={() => makeMain(url)} aria-label={`Use photo ${i + 1} as cover`} className="rounded-md bg-white/90 p-1.5 text-foreground hover:bg-white">
                            <Star className="size-4" />
                          </button>
                        )}
                        <button type="button" onClick={() => removeImage(url)} aria-label={`Remove photo ${i + 1}`} className="rounded-md bg-white/90 p-1.5 text-error hover:bg-white">
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {Array.from({ length: uploading }).map((_, i) => (
                    <div key={`up-${i}`} className="aspect-square rounded-card border border-border bg-background-elevated flex items-center justify-center" aria-label="Uploading photo">
                      <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
                    </div>
                  ))}
                  {form.images.length + uploading < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className={cn(
                        'aspect-square rounded-card border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-xs font-medium transition-colors',
                        merged.images ? 'border-error text-error bg-error-subtle' : 'border-primary/50 text-primary hover:bg-primary-subtle',
                      )}
                    >
                      <Upload className="size-5" aria-hidden />
                      {form.images.length === 0 ? 'Add photos' : 'Add more'}
                    </button>
                  )}
                </div>
                <input ref={fileInput} type="file" accept={ACCEPT} multiple hidden aria-label="Product photos" onChange={e => { void addFiles(e.target.files); e.target.value = ''; }} />
                {merged.images && <p className="mt-2 text-xs font-medium text-error" role="alert">{merged.images}</p>}
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Basics</h2>
                <div className="space-y-4">
                  <Field id="product-name" label="Product name" required placeholder="e.g. Premium Wireless Headphones" value={form.name} onChange={e => set('name', e.target.value)} error={merged.name} maxLength={120} />
                  <div className="flex flex-col gap-1.5" id="product-description">
                    <label htmlFor="product-description-input" className="text-sm font-semibold text-foreground">
                      Description <span className="text-error" aria-hidden>*</span>
                    </label>
                    <Textarea
                      id="product-description-input"
                      placeholder="Materials, sizing, what's in the box, care instructions…"
                      rows={5}
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      aria-invalid={!!merged.description}
                      aria-describedby={merged.description ? 'product-description-error' : undefined}
                      className={cn('resize-none bg-background-elevated', merged.description && 'border-error focus-visible:ring-error')}
                      maxLength={5000}
                    />
                    <div className="flex justify-between text-xs">
                      {merged.description ? <p id="product-description-error" className="font-medium text-error" role="alert">{merged.description}</p> : <span className="text-foreground-tertiary">At least 10 characters</span>}
                      <span className="text-foreground-tertiary tabular-nums">{form.description.length}/5000</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5" id="product-categoryId">
                      <label htmlFor="product-category" className="text-sm font-semibold text-foreground">
                        Category <span className="text-error" aria-hidden>*</span>
                      </label>
                      {categories.isLoading ? (
                        <Skeleton className="h-11 w-full rounded-xl" />
                      ) : (
                        <Select value={form.categoryId} onValueChange={v => set('categoryId', v)}>
                          <SelectTrigger id="product-category" className={cn('h-11', merged.categoryId && 'border-error')} aria-invalid={!!merged.categoryId}>
                            <SelectValue placeholder={categories.isError ? 'Couldn’t load categories' : 'Select a category'} />
                          </SelectTrigger>
                          <SelectContent>
                            {(categories.data ?? []).map((c: Category) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {merged.categoryId && <p className="text-xs font-medium text-error" role="alert">{merged.categoryId}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="product-badge" className="text-sm font-semibold text-foreground">Badge</label>
                      <Select value={form.badge} onValueChange={v => set('badge', v as ProductFormValues['badge'])}>
                        <SelectTrigger id="product-badge" className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BADGES.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5" id="product-tags">
                    <label htmlFor="product-tag-input" className="text-sm font-semibold text-foreground">Tags</label>
                    <div className={cn('flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background-elevated px-3 py-2 focus-within:ring-2 focus-within:ring-primary', merged.tags && 'border-error')}>
                      {form.tags.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                          <Tag className="size-3" aria-hidden />{t}
                          <button type="button" onClick={() => set('tags', form.tags.filter(x => x !== t))} aria-label={`Remove tag ${t}`} className="hover:text-error"><X className="size-3" /></button>
                        </span>
                      ))}
                      <input
                        id="product-tag-input"
                        value={tagDraft}
                        onChange={e => setTagDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitTag(); } else if (e.key === 'Backspace' && !tagDraft && form.tags.length) set('tags', form.tags.slice(0, -1)); }}
                        onBlur={commitTag}
                        placeholder={form.tags.length ? '' : 'Type a tag and press Enter'}
                        className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-foreground-tertiary"
                        maxLength={30}
                      />
                    </div>
                    <p className="text-xs text-foreground-tertiary">{merged.tags ?? 'Help shoppers find this product in search. Up to 10.'}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Pricing & inventory</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field id="product-price" label="Selling price" required inputMode="decimal" placeholder="0.00" leftIcon={<span className="text-sm font-semibold text-foreground-secondary">$</span>} value={form.price} onChange={e => set('price', e.target.value)} error={merged.price} />
                  <Field id="product-compareAtPrice" label="Compare-at price" inputMode="decimal" placeholder="0.00" leftIcon={<span className="text-sm font-semibold text-foreground-secondary">$</span>} value={form.compareAtPrice} onChange={e => set('compareAtPrice', e.target.value)} error={merged.compareAtPrice} hint="Shown struck-through" />
                  <Field
                    id="product-stock"
                    label="Stock"
                    required
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder="0"
                    value={form.stock}
                    onChange={e => set('stock', e.target.value)}
                    error={merged.stock}
                    hint={variantStock > 0 ? `Base stock — ${variantStock} more across ${product!.variants.length} variants` : undefined}
                  />
                </div>
                {saving_ != null && (
                  <p className="mt-3 inline-flex rounded-lg bg-success-subtle px-3 py-2 text-xs font-medium text-success">
                    Shoppers save {formatMoney({ amount: saving_, currency: 'USD' })} ({Math.round((saving_ / compareAt!) * 100)}% off)
                  </p>
                )}
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} id="product-etaDays">
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Shipping</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Field id="product-etaMin" label="Delivery from (days)" type="number" min={0} max={90} value={form.etaMin} onChange={e => set('etaMin', e.target.value)} error={merged.etaDays} />
                  <Field id="product-etaMax" label="Delivery to (days)" type="number" min={0} max={90} value={form.etaMax} onChange={e => set('etaMax', e.target.value)} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Free shipping</p>
                    <p className="text-xs text-foreground-secondary">Absorb the shipping cost on every order of this product</p>
                  </div>
                  <Switch checked={form.freeShipping} onCheckedChange={v => set('freeShipping', v)} aria-label="Free shipping" />
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div variants={fadeUp}>
              <Card variant="elevated" padding="lg">
                <h3 className="font-display font-semibold text-lg mb-4 text-foreground">Visibility</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground inline-flex items-center gap-1.5">
                      {form.published ? <Eye className="size-4 text-success" aria-hidden /> : <EyeOff className="size-4 text-foreground-tertiary" aria-hidden />}
                      {form.published ? 'Published' : 'Draft'}
                    </p>
                    <p className="text-xs text-foreground-secondary">{form.published ? 'Visible in your store and search' : 'Only you can see this product'}</p>
                  </div>
                  <Switch checked={form.published} onCheckedChange={v => set('published', v)} aria-label="Published" />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="featured" padding="lg">
                <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-1.5"><Lightbulb className="size-4 text-warning" aria-hidden /> Tips</h3>
                <ul className="text-xs text-foreground-secondary space-y-2">
                  <li>• Lead with a clear, well-lit cover photo</li>
                  <li>• 3–5 photos from different angles sell best</li>
                  <li>• Mention size, material and what's included</li>
                  <li>• Keep stock accurate — orders fail when it hits zero</li>
                </ul>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="sticky bottom-4 lg:static space-y-3">
              <Button type="submit" variant="gradient" size="lg" fullWidth loading={saving} disabled={busy} leftIcon={<Save className="size-5" />} className="shadow-brand">
                {uploading > 0 ? 'Uploading photos…' : mode === 'create' ? (form.published ? 'Publish product' : 'Save draft') : 'Save changes'}
              </Button>
              {mode === 'edit' && onDelete && (
                <Button type="button" variant="ghost" size="md" fullWidth onClick={onDelete} disabled={busy} className="text-error hover:bg-error-subtle" leftIcon={<Trash2 className="size-4" />}>
                  Delete product
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </form>
  );
}

/** Field-level errors from the API mapped onto the form's keys; anything else becomes the banner. */
export function productServerErrors(err: unknown): Record<string, string> {
  const f = formErrors(err);
  return f.fields && Object.keys(f.fields).length ? f.fields : { _: f.message ?? 'Could not save the product' };
}
