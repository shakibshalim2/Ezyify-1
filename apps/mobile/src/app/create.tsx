import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney, useApi, useAuth, useCreatePost, useFeed, useProducts, type Post, type ProductSummary } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/QueryState';
import { captureWithCamera, pickFromLibrary, type PickedMedia } from '@/lib/media';
import { uploadMedia } from '@/lib/uploads';
import { formErrors } from '@/lib/auth';
import { useInfiniteList } from '@/lib/data';
import { fontFamily, useTheme } from '@/theme';

const KINDS = [{ id: 'post', label: 'Post', icon: 'image-outline' }, { id: 'loop', label: 'Loop', icon: 'play-circle-outline' }, { id: 'story', label: 'Story', icon: 'ellipse-outline' }, { id: 'live', label: 'Go live', icon: 'videocam-outline' }] as const;
type Kind = (typeof KINDS)[number]['id'];
const STEPS = ['Media', 'Details', 'Publish'];
const HASHTAG = /#(\w+)/g;

const remoteAsset = (m: Post['media'][number]): PickedMedia => ({ uri: m.url, type: m.type, width: m.width ?? 0, height: m.height ?? 0, durationMs: m.durationMs, mimeType: null });

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const params = useLocalSearchParams<{ kind?: Kind }>();
  const authed = useAuth(s => s.status === 'authenticated');
  const api = useApi();
  const create = useCreatePost();
  const [kind, setKind] = useState<Kind>(params.kind && KINDS.some(k => k.id === params.kind) ? params.kind : 'post');
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<PickedMedia[]>([]);
  const [caption, setCaption] = useState('');
  const [tagged, setTagged] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [productQuery, setProductQuery] = useState('');

  // "Suggested" media comes from the viewer's own recent posts (repost/remix); guests get the camera + library only.
  const feed = useFeed({ pageSize: 6 });
  const suggested = useMemo(() => (feed.data?.pages[0]?.items ?? []).flatMap(p => p.media).filter(m => (kind === 'loop' ? m.type === 'video' : true)).slice(0, 9), [feed.data, kind]);
  const products = useProducts({ pageSize: 20, ...(productQuery ? { q: productQuery } : {}) });
  const { items: productItems } = useInfiniteList<ProductSummary>(products);

  useEffect(() => {
    if (!authed) router.replace('/(auth)/login');
  }, [authed, router]);

  const limit = kind === 'post' ? 10 : 1;
  const canNext = step === 0 ? picked.length > 0 : step === 1 ? kind === 'story' || caption.trim().length > 0 : true;
  const has = (u: string) => picked.some(p => p.uri === u);
  const addAssets = (assets: PickedMedia[]) => setPicked(p => (kind === 'post' ? [...p.filter(x => !assets.some(a => a.uri === x.uri)), ...assets].slice(0, limit) : assets.slice(0, 1)));
  const toggleSuggested = (m: Post['media'][number]) => (has(m.url) ? setPicked(p => p.filter(x => x.uri !== m.url)) : addAssets([remoteAsset(m)]));
  const openCamera = async () => {
    const shot = await captureWithCamera(kind === 'live' ? 'story' : kind);
    if (shot) addAssets([shot]);
  };
  const openLibrary = async () => {
    const assets = await pickFromLibrary(kind === 'live' ? 'story' : kind, limit);
    if (assets.length) addAssets(assets);
  };
  const changeKind = (k: Kind) => {
    setKind(k);
    setPicked([]);
    setStep(0);
  };

  const publish = async () => {
    if (kind === 'live') return;
    setError(null);
    setProgress(0);
    try {
      const media = [];
      for (let i = 0; i < picked.length; i++) {
        media.push(await uploadMedia(api, picked[i], kind, p => setProgress((i + p) / (picked.length + 0.2))));
      }
      setProgress(0.9);
      const hashtags = [...new Set([...caption.matchAll(HASHTAG)].map(m => m[1]))];
      const created = await create.mutateAsync({ kind, caption: caption.trim(), hashtags, media, taggedProductIds: tagged, location: null });
      setProgress(1);
      if (created.kind === 'loop') router.replace({ pathname: '/loops', params: { id: created.id } });
      else if (created.kind === 'story') router.replace('/(tabs)/home');
      else router.replace({ pathname: '/post/[id]', params: { id: created.id } });
    } catch (e) {
      setError(e);
      setProgress(null);
    }
  };

  const publishing = progress !== null;
  const fieldErrors = error ? formErrors(error, "We couldn't publish that. Check your connection and try again.") : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Create" right={<Pressable accessibilityRole="button" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))} hitSlop={8} disabled={publishing}><Text variant="label" tone="secondary">Cancel</Text></Pressable>} back={false} />
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 6, paddingBottom: 12 }}>
        {STEPS.map((s, i) => (
          <View key={s} style={{ flex: 1, gap: 6 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: i <= step ? colors.primary : colors.border }} />
            <Text variant="caption" tone={i === step ? 'brand' : 'tertiary'}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {KINDS.map(k => <Chip key={k.id} label={k.label} icon={k.icon} selected={kind === k.id} onPress={() => changeKind(k.id)} />)}
            </ScrollView>
            {kind === 'live' ? (
              <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.errorSubtle, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="videocam" size={36} color={colors.error} /></View>
                <Text variant="heading">Live shopping is coming soon</Text>
                <Text tone="secondary" style={{ textAlign: 'center' }}>Pin products, chat with viewers and sell in real time. We&apos;ll notify you when your account is enabled for live drops.</Text>
                <Button label="Post a loop instead" variant="secondary" size="lg" fullWidth onPress={() => changeKind('loop')} />
              </Card>
            ) : (
              <>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Open camera" onPress={openCamera} style={{ flex: 1, height: 110, borderRadius: radius.card, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.card }}>
                    <Ionicons name="camera-outline" size={26} color={colors.primary} />
                    <Text variant="label" tone="brand" style={{ textAlign: 'center' }}>{kind === 'loop' ? 'Record loop\n(up to 60s)' : 'Camera'}</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel="Choose from library" onPress={openLibrary} style={{ flex: 1, height: 110, borderRadius: radius.card, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.card }}>
                    <Ionicons name="images-outline" size={26} color={colors.primary} />
                    <Text variant="label" tone="brand" style={{ textAlign: 'center' }}>Photo library</Text>
                  </Pressable>
                </View>
                {picked.length > 0 && (
                  <View style={{ gap: 8 }}>
                    <Text variant="heading">Selected · {picked.length}{kind === 'post' ? `/${limit}` : ''}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {picked.map((a, i) => (
                        <Pressable key={a.uri} accessibilityRole="button" accessibilityLabel={`Remove selected media ${i + 1}`} onPress={() => setPicked(p => p.filter(x => x.uri !== a.uri))} style={{ width: '31.5%', aspectRatio: kind === 'loop' ? 9 / 16 : 1, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 3, borderColor: colors.primary }}>
                          <Image source={{ uri: a.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                          {a.type === 'video' && <Ionicons name="play" size={18} color="#fff" style={{ position: 'absolute', top: 6, right: 6 }} />}
                          <View style={{ position: 'absolute', bottom: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="close" size={14} color="#fff" /></View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
                {suggested.length > 0 && (
                  <>
                    <Text variant="heading">From the feed</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {suggested.map(m => {
                        const on = has(m.url);
                        return (
                          <Pressable key={m.url} accessibilityRole="checkbox" aria-checked={on} onPress={() => toggleSuggested(m)} style={{ width: '31.5%', aspectRatio: kind === 'loop' ? 9 / 16 : 1, borderRadius: radius.sm, overflow: 'hidden', borderWidth: on ? 3 : 0, borderColor: colors.primary }}>
                            <Image source={{ uri: m.thumbnailUrl ?? m.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                            {on && <View style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="checkmark" size={14} color="#fff" /></View>}
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                )}
              </>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Image source={{ uri: picked[0]?.uri }} style={{ width: 88, height: 88, borderRadius: radius.md }} contentFit="cover" />
              <TextInput multiline placeholder={kind === 'story' ? 'Add a caption (optional)' : 'Write a caption… add #hashtags to reach more people'} placeholderTextColor={colors.foregroundTertiary} value={caption} onChangeText={setCaption} maxLength={2200} style={{ flex: 1, minHeight: 88, fontFamily: fontFamily.body, fontSize: 15, color: colors.foreground, textAlignVertical: 'top', padding: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: fieldErrors?.fields.caption ? colors.error : colors.border }} />
            </View>
            <Text variant="caption" tone="tertiary" style={{ alignSelf: 'flex-end' }}>{caption.length}/2200</Text>
            <Text variant="heading">Tag products</Text>
            <Text variant="caption" tone="secondary">Tagged products are shoppable from your post and earn you commission.</Text>
            <TextInput placeholder="Search the catalog" placeholderTextColor={colors.foregroundTertiary} value={productQuery} onChangeText={setProductQuery} style={{ fontFamily: fontFamily.body, fontSize: 15, color: colors.foreground, padding: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} />
            <View style={{ gap: 8 }}>
              {products.isLoading && [0, 1, 2].map(i => <Skeleton key={i} height={68} radius={16} />)}
              {products.error && <ErrorState compact error={products.error} onRetry={() => products.refetch()} />}
              {!products.isLoading && !productItems.length && <EmptyState icon="pricetag-outline" title="No products found" body="Try another keyword." />}
              {productItems.slice(0, 8).map(p => {
                const on = tagged.includes(p.id);
                return (
                  <Pressable key={p.id} accessibilityRole="checkbox" aria-checked={on} onPress={() => setTagged(t => (on ? t.filter(x => x !== p.id) : [...t, p.id].slice(0, 10)))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.card, backgroundColor: on ? colors.primarySubtle : colors.card, borderWidth: 1, borderColor: on ? colors.primary : colors.borderSubtle }}>
                    <Image source={{ uri: p.imageUrl }} style={{ width: 48, height: 48, borderRadius: radius.sm }} />
                    <View style={{ flex: 1 }}><Text variant="bodyMedium" numberOfLines={1}>{p.name}</Text><Text variant="caption" tone="secondary">{formatMoney(p.price)} · {p.seller.name}</Text></View>
                    <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? colors.primary : colors.borderStrong} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Card style={{ flexDirection: 'row', gap: 12 }}>
              <Image source={{ uri: picked[0]?.uri }} style={{ width: 72, height: 72, borderRadius: radius.md }} contentFit="cover" />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="caption" tone="brand" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{kind}{picked.length > 1 ? ` · ${picked.length} items` : ''}</Text>
                <Text numberOfLines={3}>{caption || (kind === 'story' ? 'No caption' : '')}</Text>
                {tagged.length > 0 && <Text variant="caption" tone="secondary">{tagged.length} product{tagged.length > 1 ? 's' : ''} tagged</Text>}
              </View>
            </Card>
            {[{ icon: 'globe-outline', label: 'Audience', value: 'Everyone' }, { icon: 'chatbubble-outline', label: 'Comments', value: 'On' }, { icon: 'time-outline', label: kind === 'story' ? 'Disappears after' : 'Visibility', value: kind === 'story' ? '24 hours' : 'Permanent' }].map(r => (
              <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
                <Ionicons name={r.icon as never} size={20} color={colors.foregroundSecondary} />
                <Text style={{ flex: 1 }}>{r.label}</Text>
                <Text tone="secondary">{r.value}</Text>
              </View>
            ))}
            {publishing && (
              <View style={{ gap: 6 }}>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.muted, overflow: 'hidden' }}><View style={{ width: `${Math.round((progress ?? 0) * 100)}%`, height: '100%', backgroundColor: colors.primary }} /></View>
                <Text variant="caption" tone="secondary">{(progress ?? 0) < 0.9 ? `Uploading media… ${Math.round((progress ?? 0) * 100)}%` : 'Publishing…'}</Text>
              </View>
            )}
            {fieldErrors && <ErrorState compact error={error} onRetry={publish} />}
          </>
        )}
      </ScrollView>

      {kind !== 'live' && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', gap: 10 }}>
          {step > 0 && <Button label="Back" variant="secondary" size="lg" disabled={publishing} onPress={() => setStep(s => s - 1)} />}
          <Button label={step === 2 ? 'Publish' : 'Next'} variant="gradient" size="lg" fullWidth style={{ flex: 1 }} disabled={!canNext} loading={publishing} onPress={() => (step === 2 ? publish() : setStep(s => s + 1))} />
        </View>
      )}
    </View>
  );
}
