import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatRelativeTime, useAddComment, useAuth, useComments, usePost, type Comment } from '@ezyify/core';
import { Header } from '@/components/Header';
import { PostCard } from '@/components/PostCard';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { SearchBar } from '@/components/SearchBar';
import { IconButton } from '@/components/IconButton';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useInfiniteList } from '@/lib/data';
import { useTheme } from '@/theme';

function CommentRow({ c }: { c: Comment }) {
  const router = useRouter();
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Avatar uri={c.author.avatarUrl} name={c.author.name} size={34} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text>
          <Text variant="bodyMedium" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: c.author.username } })}>{c.author.username} </Text>
          {c.text}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Text variant="caption" tone="tertiary">{formatRelativeTime(c.createdAt)}</Text>
          {c.likes > 0 && <Text variant="caption" tone="tertiary">{c.likes} likes</Text>}
        </View>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const me = useAuth(s => s.user);
  const authed = useAuth(s => s.status === 'authenticated');
  const post = usePost(id);
  const comments = useComments(id);
  const { items, loadMore, loadingMore } = useInfiniteList<Comment>(comments);
  const add = useAddComment(id ?? '');
  const [draft, setDraft] = useState('');

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    if (!authed) return router.push('/(auth)/login');
    setDraft('');
    await add.mutateAsync(text).catch(() => setDraft(text));
  };

  if (post.error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Post" />
        <ErrorState error={post.error} onRetry={() => post.refetch()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Post" />
      <FlatList
        data={items}
        keyExtractor={c => c.id}
        onEndReached={loadMore}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 14 }}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 2 }}>
            {post.data ? <PostCard post={post.data} /> : <Skeleton height={520} radius={16} />}
            <Text variant="heading">Comments{post.data ? ` · ${post.data.engagement.comments}` : ''}</Text>
          </View>
        }
        ListEmptyComponent={
          comments.isLoading ? (
            <View style={{ gap: 14 }}>{[0, 1, 2].map(i => <View key={i} style={{ flexDirection: 'row', gap: 10 }}><Skeleton width={34} height={34} radius={17} /><View style={{ flex: 1, gap: 6 }}><Skeleton width="90%" height={12} /><Skeleton width={80} height={10} /></View></View>)}</View>
          ) : comments.error ? (
            <ErrorState compact error={comments.error} onRetry={() => comments.refetch()} />
          ) : (
            <Text tone="secondary" style={{ textAlign: 'center', paddingVertical: 12 }}>No comments yet — start the conversation.</Text>
          )
        }
        ListFooterComponent={loadingMore ? <Skeleton height={34} radius={12} /> : null}
        renderItem={({ item }) => <CommentRow c={item} />}
      />
      {add.error && <ErrorState compact error={add.error} onRetry={send} />}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom + 8, borderTopWidth: 1, borderTopColor: colors.borderSubtle, backgroundColor: colors.background }}>
        <Avatar uri={me?.avatarUrl ?? null} name={me?.name} size={34} />
        <View style={{ flex: 1 }}><SearchBar placeholder={authed ? 'Add a comment…' : 'Sign in to comment'} value={draft} onChangeText={setDraft} onSubmitEditing={send} onFocus={() => !authed && router.push('/(auth)/login')} returnKeyType="send" maxLength={1000} /></View>
        <IconButton icon="send" label="Post comment" color={draft ? colors.primary : colors.foregroundTertiary} disabled={!draft || add.isPending} onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}
