import { useState, type FormEvent } from 'react';
import { useCreateAddress, type Address, type CreateAddressRequest } from '@ezyify/core';
import { Field } from './primitives/Field';
import { Button } from './primitives/Button';
import { formErrors } from '../lib/apiErrors';

const EMPTY_ADDRESS: CreateAddressRequest = { label: 'Home', recipient: '', phone: '', line1: '', line2: '', city: '', region: '', postal: '', country: 'ID', isDefault: false };
export const fmtAddress = (a: Address) => [a.line1, a.line2, `${a.city}${a.region ? `, ${a.region}` : ''} ${a.postal}`, a.country].filter(Boolean).join(' · ');

/** New-address form on `POST /addresses`; shared by checkout and account settings. */
export function AddressForm({ onSaved, onCancel }: { onSaved: (a: Address) => void; onCancel?: () => void }) {
  const create = useCreateAddress();
  const [form, setForm] = useState<CreateAddressRequest>(EMPTY_ADDRESS);
  const errors = create.error ? formErrors(create.error) : null;
  const set = <K extends keyof CreateAddressRequest>(k: K, v: CreateAddressRequest[K]) => setForm(f => ({ ...f, [k]: v }));
  const complete = form.recipient.trim() && form.phone.trim().length >= 6 && form.line1.trim() && form.city.trim() && form.postal.trim().length >= 2;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!complete) return;
    try {
      const saved = await create.mutateAsync({ ...form, line2: form.line2 || undefined, region: form.region || undefined });
      onSaved(saved);
    } catch {
      /* shown inline */
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Label" placeholder="Home" value={form.label} onChange={e => set('label', e.target.value)} error={errors?.fields.label} />
        <Field label="Recipient" autoComplete="name" placeholder="Full name" value={form.recipient} onChange={e => set('recipient', e.target.value)} error={errors?.fields.recipient} />
      </div>
      <Field label="Phone number" type="tel" autoComplete="tel" placeholder="+62 812 3456 7890" value={form.phone} onChange={e => set('phone', e.target.value)} error={errors?.fields.phone} />
      <Field label="Street address" autoComplete="address-line1" placeholder="House #, street, area" value={form.line1} onChange={e => set('line1', e.target.value)} error={errors?.fields.line1} />
      <Field label="Apartment, floor (optional)" autoComplete="address-line2" value={form.line2 ?? ''} onChange={e => set('line2', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" autoComplete="address-level2" value={form.city} onChange={e => set('city', e.target.value)} error={errors?.fields.city} />
        <Field label="Postal code" autoComplete="postal-code" inputMode="numeric" value={form.postal} onChange={e => set('postal', e.target.value)} error={errors?.fields.postal} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Region / state" autoComplete="address-level1" value={form.region ?? ''} onChange={e => set('region', e.target.value)} />
        <Field label="Country" autoComplete="country" maxLength={2} value={form.country} onChange={e => set('country', e.target.value.toUpperCase())} error={errors?.fields.country} hint="ISO code, e.g. ID, US" />
      </div>
      {errors?.message && <p role="alert" className="text-sm text-error">{errors.message}</p>}
      <div className="flex gap-2 pt-2">
        {onCancel && <Button type="button" variant="ghost" size="lg" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="primary" size="lg" fullWidth loading={create.isPending} disabled={!complete}>Save address</Button>
      </div>
    </form>
  );
}

