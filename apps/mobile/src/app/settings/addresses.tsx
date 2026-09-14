import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { confirm } from '@/lib/confirm';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, useAddresses, useApi, useCreateAddress, type Address, type CreateAddressRequest } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { IconButton } from '@/components/IconButton';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { formErrors } from '@/lib/auth';
import { useTheme } from '@/theme';

const oneLine = (a: Address) => [a.line1, a.line2, a.city, a.region, a.postal, a.country].filter(Boolean).join(', ');

function AddressForm({ onDone }: { onDone: () => void }) {
  const create = useCreateAddress();
  const [form, setForm] = useState<CreateAddressRequest>({ label: 'Home', recipient: '', phone: '', line1: '', line2: '', city: '', region: '', postal: '', country: 'ID', isDefault: false });
  const errors = create.error ? formErrors(create.error) : { fields: {}, message: null };
  const set = (k: keyof CreateAddressRequest) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => {
    const ok = await create.mutateAsync({ ...form, line2: form.line2 || undefined, region: form.region || undefined, country: form.country.toUpperCase() }).catch(() => undefined);
    if (ok) onDone();
  };
  return (
    <Card style={{ gap: 12 }}>
      <Field label="Label" value={form.label} onChangeText={set('label')} error={errors.fields.label} placeholder="Home, Office…" maxLength={30} />
      <Field label="Recipient" value={form.recipient} onChangeText={set('recipient')} error={errors.fields.recipient} autoComplete="name" />
      <Field label="Phone" value={form.phone} onChangeText={set('phone')} error={errors.fields.phone} keyboardType="phone-pad" autoComplete="tel" />
      <Field label="Address" value={form.line1} onChangeText={set('line1')} error={errors.fields.line1} autoComplete="street-address" />
      <Field label="Apartment, floor (optional)" value={form.line2 ?? ''} onChangeText={set('line2')} error={errors.fields.line2} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="City" value={form.city} onChangeText={set('city')} error={errors.fields.city} /></View>
        <View style={{ flex: 1 }}><Field label="Postal code" value={form.postal} onChangeText={set('postal')} error={errors.fields.postal} autoComplete="postal-code" /></View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="Region / state" value={form.region ?? ''} onChangeText={set('region')} error={errors.fields.region} /></View>
        <View style={{ width: 96 }}><Field label="Country" value={form.country} onChangeText={set('country')} error={errors.fields.country} autoCapitalize="characters" maxLength={2} hint="ISO code" /></View>
      </View>
      {errors.message && <ErrorState compact error={create.error} />}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Cancel" variant="secondary" size="md" onPress={onDone} />
        <Button label="Save address" variant="primary" size="md" fullWidth style={{ flex: 1 }} loading={create.isPending} onPress={submit} />
      </View>
    </Card>
  );
}

export default function AddressesScreen() {
  const { colors } = useTheme();
  const api = useApi();
  const qc = useQueryClient();
  const addresses = useAddresses();
  const remove = useMutation({ mutationFn: (id: string) => api.addresses.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }) });
  const [adding, setAdding] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Addresses" right={!adding ? <IconButton icon="add" label="Add address" onPress={() => setAdding(true)} /> : undefined} />
      <FlatList
        data={addresses.data ?? []}
        keyExtractor={a => a.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        refreshing={addresses.isRefetching}
        onRefresh={() => addresses.refetch()}
        ListHeaderComponent={adding ? <AddressForm onDone={() => setAdding(false)} /> : null}
        ListEmptyComponent={
          addresses.isLoading ? <View style={{ gap: 10 }}>{[0, 1].map(i => <Skeleton key={i} height={84} radius={16} />)}</View> : addresses.error ? <ErrorState error={addresses.error} onRetry={() => addresses.refetch()} /> : adding ? null : (
            <EmptyState icon="location-outline" title="No addresses yet" body="Add a delivery address to speed up checkout." actionLabel="Add address" onAction={() => setAdding(true)} />
          )
        }
        renderItem={({ item }) => (
          <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySubtle, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="location" size={20} color={colors.primary} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyMedium">{item.label} · {item.recipient}{item.isDefault ? '  ·  Default' : ''}</Text>
              <Text variant="caption" tone="secondary">{oneLine(item)}</Text>
              <Text variant="caption" tone="tertiary">{item.phone}</Text>
            </View>
            <IconButton icon="trash-outline" label={`Delete ${item.label}`} disabled={remove.isPending} onPress={async () => (await confirm({ title: 'Delete address?', message: oneLine(item), confirmLabel: 'Delete', destructive: true })) && remove.mutate(item.id)} />
          </Card>
        )}
      />
      {remove.error ? <ErrorState compact error={remove.error} /> : null}
    </View>
  );
}
