import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney } from '@ezyify/core';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Card } from '@/components/Card';
import { products, posts } from '@/lib/mock';
import { captureWithCamera, pickFromLibrary } from '@/lib/media';
import { fontFamily, useTheme } from '@/theme';

const KINDS = [{ id: 'post', label: 'Post', icon: 'image-outline' }, { id: 'loop', label: 'Loop', icon: 'play-circle-outline' }, { id: 'story', label: 'Story', icon: 'ellipse-outline' }, { id: 'live', label: 'Go live', icon: 'videocam-outline' }] as const;
const STEPS = ['Media', 'Details', 'Publish'];
const LIBRARY = posts.flatMap(p => p.media).slice(0, 9);

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const [kind, setKind] = useState<(typeof KINDS)[number]['id']>('post');
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [tagged, setTagged] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const canNext = step === 0 ? picked.length > 0 : step === 1 ? caption.trim().length > 0 : true;
  const togglePick = (u: string) => setPicked(p => (p.includes(u) ? p.filter(x => x !== u) : kind === 'post' ? [...p, u].slice(0, 10) : [u]));
  const openCamera = async () => {
    const shot = await captureWithCamera(kind === 'live' ? 'story' : kind);
    if (shot) setPicked(kind === 'post' ? p => [...p, shot.uri].slice(0, 10) : [shot.uri]);
  };
  const openLibrary = async () => {
    const assets = await pickFromLibrary(kind === 'live' ? 'story' : kind);
    if (assets.length) setPicked(kind === 'post' ? p => [...p, ...assets.map(a => a.uri)].slice(0, 10) : [assets[0].uri]);
  };
  const publish = async () => {
    setPublishing(true);
    await new Promise(r => setTimeout(r, 1000));
    setPublishing(false);
    router.replace('/(tabs)/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Create" right={<Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}><Text variant="label" tone="secondary">Cancel</Text></Pressable>} back={false} />
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 6, paddingBottom: 12 }}>
        {STEPS.map((s, i) => (
          <View key={s} style={{ flex: 1, gap: 6 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: i <= step ? colors.primary : colors.border }} />
            <Text variant="caption" tone={i === step ? 'brand' : 'tertiary'}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 140 }}>
        {step === 0 && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {KINDS.map(k => <Chip key={k.id} label={k.label} icon={k.icon} selected={kind === k.id} onPress={() => { setKind(k.id); setPicked([]); }} />)}
            </ScrollView>
            {kind === 'live' ? (
              <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.errorSubtle, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="videocam" size={36} color={colors.error} /></View>
                <Text variant="heading">Start a live drop</Text>
                <Text tone="secondary" style={{ textAlign: 'center' }}>Pin products, chat with viewers and sell in real time. Your followers get notified.</Text>
                <Button label="Go live now" variant="accent" size="lg" fullWidth onPress={() => router.replace('/loops')} />
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
                {picked.some(u => !LIBRARY.some(m => m.url === u)) && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {picked.filter(u => !LIBRARY.some(m => m.url === u)).map((u, i) => (
                      <Pressable key={u} accessibilityRole="button" accessibilityLabel={`Remove selected media ${i + 1}`} onPress={() => togglePick(u)} style={{ width: '31.5%', aspectRatio: 1, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 3, borderColor: colors.primary }}>
                        <Image source={{ uri: u }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      </Pressable>
                    ))}
                  </View>
                )}
                <Text variant="heading">Suggested</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {LIBRARY.map(m => {
                    const idx = picked.indexOf(m.url);
                    return (
                      <Pressable key={m.url} accessibilityRole="checkbox" accessibilityState={{ checked: idx >= 0 }} onPress={() => togglePick(m.url)} style={{ width: '31.5%', aspectRatio: kind === 'loop' ? 9 / 16 : 1, borderRadius: radius.sm, overflow: 'hidden', borderWidth: idx >= 0 ? 3 : 0, borderColor: colors.primary }}>
                        <Image source={{ uri: m.thumbnailUrl ?? m.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        {idx >= 0 && <View style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><Text variant="caption" style={{ color: '#fff', fontFamily: 'Inter_600SemiBold' }}>{idx + 1}</Text></View>}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Image source={{ uri: picked[0] }} style={{ width: 88, height: 88, borderRadius: radius.md }} contentFit="cover" />
              <TextInput multiline placeholder="Write a caption… add #hashtags to reach more people" placeholderTextColor={colors.foregroundTertiary} value={caption} onChangeText={setCaption} maxLength={2200} style={{ flex: 1, minHeight: 88, fontFamily: fontFamily.body, fontSize: 15, color: colors.foreground, textAlignVertical: 'top', padding: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }} />
            </View>
            <Text variant="caption" tone="tertiary" style={{ alignSelf: 'flex-end' }}>{caption.length}/2200</Text>
            <Text variant="heading">Tag products</Text>
            <Text variant="caption" tone="secondary">Tagged products are shoppable from your post and earn you commission.</Text>
            <View style={{ gap: 8 }}>
              {products.slice(0, 5).map(p => {
                const on = tagged.includes(p.id);
                return (
                  <Pressable key={p.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => setTagged(t => (on ? t.filter(x => x !== p.id) : [...t, p.id]))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.card, backgroundColor: on ? colors.primarySubtle : colors.card, borderWidth: 1, borderColor: on ? colors.primary : colors.borderSubtle }}>
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
              <Image source={{ uri: picked[0] }} style={{ width: 72, height: 72, borderRadius: radius.md }} contentFit="cover" />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="caption" tone="brand" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{kind}{picked.length > 1 ? ` · ${picked.length} items` : ''}</Text>
                <Text numberOfLines={3}>{caption}</Text>
                {tagged.length > 0 && <Text variant="caption" tone="secondary">{tagged.length} product{tagged.length > 1 ? 's' : ''} tagged</Text>}
              </View>
            </Card>
            {[{ icon: 'globe-outline', label: 'Audience', value: 'Everyone' }, { icon: 'chatbubble-outline', label: 'Comments', value: 'On' }, { icon: 'share-social-outline', label: 'Also share to', value: 'Story' }].map(r => (
              <Pressable key={r.label} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
                <Ionicons name={r.icon as never} size={20} color={colors.foregroundSecondary} />
                <Text style={{ flex: 1 }}>{r.label}</Text>
                <Text tone="secondary">{r.value}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.foregroundTertiary} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      {kind !== 'live' && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: insets.bottom + 16, backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', gap: 10 }}>
          {step > 0 && <Button label="Back" variant="secondary" size="lg" onPress={() => setStep(s => s - 1)} />}
          <Button label={step === 2 ? 'Publish' : 'Next'} variant="gradient" size="lg" fullWidth style={{ flex: 1 }} disabled={!canNext} loading={publishing} onPress={() => (step === 2 ? publish() : setStep(s => s + 1))} />
        </View>
      )}
    </View>
  );
}
