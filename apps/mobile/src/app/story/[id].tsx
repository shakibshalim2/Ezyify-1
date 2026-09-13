import { useEffect, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { IconButton } from '@/components/IconButton';
import { SearchBar } from '@/components/SearchBar';
import { posts, stories } from '@/lib/mock';

const { width: W } = Dimensions.get('window');
const DURATION = 5000;

export default function StoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = stories.find(s => s.id === id) ?? stories[0];
  const frames = posts.filter(p => p.author.id === story.user.id).flatMap(p => p.media).slice(0, 3);
  const media = frames.length ? frames : posts[0].media;
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const goTo = (n: number) => {
    setProgress(0);
    setI(n);
  };

  useEffect(() => {
    const started = Date.now();
    const t = setInterval(() => {
      const p = (Date.now() - started) / DURATION;
      if (p >= 1) {
        clearInterval(t);
        if (i < media.length - 1) goTo(i + 1);
        else router.back();
      } else setProgress(p);
    }, 50);
    return () => clearInterval(t);
  }, [i, media.length, router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <Image source={{ uri: media[i].url }} style={{ position: 'absolute', inset: 0 }} contentFit="cover" transition={150} />
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']} locations={[0, 0.2, 0.7, 1]} style={{ position: 'absolute', inset: 0 }} />
      <Pressable accessibilityLabel="Previous" onPress={() => (i > 0 ? goTo(i - 1) : router.back())} style={{ position: 'absolute', left: 0, top: 120, bottom: 120, width: W * 0.3 }} />
      <Pressable accessibilityLabel="Next" onPress={() => (i < media.length - 1 ? goTo(i + 1) : router.back())} style={{ position: 'absolute', right: 0, top: 120, bottom: 120, width: W * 0.7 }} />

      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 10, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {media.map((m, k) => (
            <View key={m.url} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' }}>
              <View style={{ width: k < i ? '100%' : k === i ? `${Math.min(progress, 1) * 100}%` : '0%', height: '100%', backgroundColor: '#fff' }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 }}>
          <Avatar uri={story.user.avatarUrl} size={36} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" style={{ color: '#fff' }}>{story.user.username}</Text>
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.7)' }}>3h</Text>
          </View>
          <IconButton icon="close" label="Close" variant="overlay" onPress={() => router.back()} />
        </View>
      </View>

      <View style={{ position: 'absolute', left: 12, right: 12, bottom: insets.bottom + 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}><SearchBar placeholder={`Reply to ${story.user.username}…`} /></View>
        <IconButton icon="heart-outline" label="Like story" variant="overlay" />
        <IconButton icon="paper-plane-outline" label="Share story" variant="overlay" />
      </View>
    </View>
  );
}
