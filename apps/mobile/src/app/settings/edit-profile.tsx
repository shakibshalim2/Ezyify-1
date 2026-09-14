import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi, useMe, useUpdateProfile, type UpdateProfileRequest } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Avatar } from '@/components/Avatar';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { formErrors } from '@/lib/auth';
import { pickFromLibrary } from '@/lib/media';
import { uploadMedia } from '@/lib/uploads';
import { useTheme } from '@/theme';

type Form = { name: string; username: string; bio: string; website: string; location: string };

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const api = useApi();
  const me = useMe();
  const update = useUpdateProfile();
  const [edits, setEdits] = useState<Partial<Form>>({});
  // Server values are the baseline; edits overlay them so the form renders as soon as `me` resolves.
  const form: Form | null = me.data ? { name: me.data.name, username: me.data.username, bio: me.data.bio ?? '', website: me.data.website ?? '', location: me.data.location ?? '', ...edits } : null;
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);

  const errors = update.error ? formErrors(update.error) : { fields: {}, message: null };
  const set = (k: keyof Form) => (v: string) => setEdits(e => ({ ...e, [k]: v }));

  const changeAvatar = async () => {
    const [asset] = await pickFromLibrary('post', 1);
    if (!asset) return;
    setUploading(true);
    setUploadError(null);
    try {
      const media = await uploadMedia(api, asset, 'avatar');
      setAvatarUrl(media.url);
    } catch (e) {
      setUploadError(e);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form || !me.data) return;
    const body: UpdateProfileRequest = {};
    if (form.name !== me.data.name) body.name = form.name.trim();
    if (form.username !== me.data.username) body.username = form.username.trim().toLowerCase();
    if (form.bio !== (me.data.bio ?? '')) body.bio = form.bio.trim() || null;
    if (form.website !== (me.data.website ?? '')) body.website = form.website.trim() ? (/^https?:\/\//.test(form.website) ? form.website.trim() : `https://${form.website.trim()}`) : null;
    if (form.location !== (me.data.location ?? '')) body.location = form.location.trim() || null;
    if (avatarUrl !== undefined) body.avatarUrl = avatarUrl;
    if (!Object.keys(body).length) return router.back();
    const ok = await update.mutateAsync(body).catch(() => undefined);
    if (ok) router.back();
  };

  if (me.error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Edit profile" />
        <ErrorState error={me.error} onRetry={() => me.refetch()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Edit profile" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" onPress={changeAvatar} disabled={uploading} style={{ opacity: uploading ? 0.6 : 1 }}>
            {me.data ? <Avatar uri={avatarUrl === undefined ? me.data.avatarUrl : avatarUrl} size={96} /> : <Skeleton width={96} height={96} radius={48} />}
            <View style={{ position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="camera" size={15} color={colors.primaryForeground} />
            </View>
          </Pressable>
          <Text variant="label" tone="brand" onPress={changeAvatar}>{uploading ? 'Uploading…' : 'Change photo'}</Text>
          {uploadError ? <ErrorState compact error={uploadError} onRetry={changeAvatar} /> : null}
        </View>
        {!form ? (
          <View style={{ gap: 16 }}>{[0, 1, 2, 3].map(i => <Skeleton key={i} height={52} radius={12} />)}</View>
        ) : (
          <>
            <Field label="Name" value={form.name} onChangeText={set('name')} error={errors.fields.name} maxLength={50} autoComplete="name" />
            <Field label="Username" value={form.username} onChangeText={set('username')} error={errors.fields.username} autoCapitalize="none" autoCorrect={false} maxLength={30} hint="Lowercase letters, numbers, dots and underscores" />
            <Field label="Bio" value={form.bio} onChangeText={set('bio')} error={errors.fields.bio} multiline maxLength={160} hint={`${form.bio.length}/160`} />
            <Field label="Website" value={form.website} onChangeText={set('website')} error={errors.fields.website} autoCapitalize="none" keyboardType="url" autoComplete="url" placeholder="yoursite.com" />
            <Field label="Location" value={form.location} onChangeText={set('location')} error={errors.fields.location} maxLength={80} placeholder="City, Country" />
            {errors.message && <ErrorState compact error={update.error} />}
          </>
        )}
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Button label="Save changes" variant="gradient" size="lg" fullWidth disabled={!form || uploading} loading={update.isPending} onPress={save} />
      </View>
    </View>
  );
}
