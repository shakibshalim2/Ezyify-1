import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatRelativeTime } from '@ezyify/core';
import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { SearchBar } from '@/components/SearchBar';
import { IconButton } from '@/components/IconButton';
import { EmptyState } from '@/components/EmptyState';
import { loops, me, posts, users } from '@/lib/mock';
import { useTheme } from '@/theme';

const seedComments = (postId: string) => [
  { id: postId + '-c1', author: users[3], text: 'Need this in my life 😍', createdAt: new Date(Date.now() - 3600_000).toISOString(), likes: 42 },
  { id: postId + '-c2', author: users[4], text: 'How is the battery life after a month?', createdAt: new Date(Date.now() - 7200_000).toISOString(), likes: 8 },
  { id: postId + '-c3', author: users[5], text: 'Ordered through your link, thanks for the honest review!', createdAt: new Date(Date.now() - 20000_000).toISOString(), likes: 15 },
];

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const post = [...posts, ...loops].find(p => p.id === id);
  const [comments, setComments] = useState(() => seedComments(id ?? ''));
  const [draft, setDraft] = useState('');

  if (!post) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Post" />
        <EmptyState icon="image-outline" title="Post not found" body="It may have been removed or the link is broken." />
      </View>
    );
  }

  const send = () => {
    if (!draft.trim()) return;
    setComments(c => [{ id: `${Date.now()}`, author: me, text: draft.trim(), createdAt: new Date().toISOString(), likes: 0 }, ...c]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Post" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 16 }}>
        <PostCard post={post} />
        <Text variant="heading">Comments · {comments.length + post.engagement.comments}</Text>
        <View style={{ gap: 14 }}>
          {comments.map(c => (
            <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
              <Avatar uri={c.author.avatarUrl} size={34} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text>
                  <Text variant="bodyMedium">{c.author.username} </Text>
                  {c.text}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text variant="caption" tone="tertiary">{formatRelativeTime(c.createdAt)}</Text>
                  <Text variant="caption" tone="tertiary">{c.likes} likes</Text>
                  <Text variant="caption" tone="secondary" style={{ fontFamily: 'Inter_600SemiBold' }}>Reply</Text>
                </View>
              </View>
              <IconButton icon="heart-outline" label="Like comment" size={16} />
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom + 8, borderTopWidth: 1, borderTopColor: colors.borderSubtle, backgroundColor: colors.background }}>
        <Avatar uri={me.avatarUrl} size={34} />
        <View style={{ flex: 1 }}><SearchBar placeholder="Add a comment…" value={draft} onChangeText={setDraft} onSubmitEditing={send} returnKeyType="send" /></View>
        <IconButton icon="send" label="Post comment" color={draft ? colors.primary : colors.foregroundTertiary} onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}
