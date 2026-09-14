import { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney, useAuth, useConversations, useMessages, useProduct, useSendMessage, useStartConversation, type Message } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { SearchBar } from '@/components/SearchBar';
import { IconButton } from '@/components/IconButton';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState } from '@/components/QueryState';
import { useInfiniteList } from '@/lib/data';
import { useTheme } from '@/theme';

function ProductBubble({ productId }: { productId: string }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { data: product } = useProduct(productId);
  if (!product) return <Skeleton width={220} height={190} radius={16} />;
  return (
    <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} style={{ backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', width: 220 }}>
      <Image source={{ uri: product.imageUrl }} style={{ width: '100%', aspectRatio: 1.4 }} contentFit="cover" />
      <View style={{ padding: 10, gap: 6 }}>
        <Text variant="bodyMedium" numberOfLines={1}>{product.name}</Text>
        <Text variant="label" tone="brand">{formatMoney(product.price)}</Text>
      </View>
    </Pressable>
  );
}

/** `/messages/new?username=x` resolves (or creates) the 1:1 thread, then swaps to the real id. */
function useConversationId(param: string | undefined, username: string | undefined) {
  const start = useStartConversation();
  const [id, setId] = useState<string | undefined>(param === 'new' ? undefined : param);
  useEffect(() => {
    if (param !== 'new' || !username || id || start.isPending || start.error) return;
    start.mutateAsync(username).then(r => setId(r.id)).catch(() => undefined);
  }, [param, username, id, start]);
  return { id, error: start.error, retry: () => start.reset() };
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const params = useLocalSearchParams<{ id: string; username?: string }>();
  const me = useAuth(s => s.user);
  const { id, error: startError, retry } = useConversationId(params.id, params.username);
  const convos = useConversations();
  const convo = convos.data?.find(c => c.id === id);
  const other = convo?.participants[0];
  const messages = useMessages(id);
  const { items: newestFirst, loadMore, loadingMore } = useInfiniteList<Message>(messages);
  const items = useMemo(() => [...newestFirst].reverse(), [newestFirst]);
  const send = useSendMessage(id ?? '');
  const [draft, setDraft] = useState('');

  const submit = async () => {
    const text = draft.trim();
    if (!text || !id) return;
    setDraft('');
    await send.mutateAsync({ text }).catch(() => setDraft(text));
  };

  const header = (
    <View style={{ paddingTop: insets.top, height: insets.top + 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
      <IconButton icon="chevron-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/messages'))} />
      {other ? (
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: other.username } })} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar uri={other.avatarUrl} size={36} verified={other.verified} />
          <View>
            <Text variant="bodyMedium">{other.name}</Text>
            <Text variant="caption" tone="secondary">@{other.username}</Text>
          </View>
        </Pressable>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Skeleton width={36} height={36} radius={18} /><Skeleton width={120} height={14} /></View>
      )}
      {other && <IconButton icon="bag-handle-outline" label="Shop this seller" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: other.username } })} />}
    </View>
  );

  if (startError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        <ErrorState error={startError} onRetry={retry} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      {header}
      <FlatList
        data={items}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1, justifyContent: 'flex-end' }}
        // Newest at the bottom: pull down at the top loads older pages.
        onStartReached={loadMore}
        onStartReachedThreshold={0.4}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        ListHeaderComponent={loadingMore ? <Skeleton width={160} height={36} radius={16} /> : null}
        ListEmptyComponent={
          messages.isLoading || !id ? (
            <View style={{ gap: 8 }}>
              <Skeleton width={200} height={40} radius={16} style={{ alignSelf: 'flex-start' }} />
              <Skeleton width={160} height={40} radius={16} style={{ alignSelf: 'flex-end' }} />
              <Skeleton width={220} height={40} radius={16} style={{ alignSelf: 'flex-start' }} />
            </View>
          ) : messages.error ? (
            <ErrorState error={messages.error} onRetry={() => messages.refetch()} />
          ) : (
            <Text tone="secondary" style={{ textAlign: 'center', paddingVertical: 24 }}>Say hello — sellers usually reply within a few hours.</Text>
          )
        }
        renderItem={({ item }) => {
          const mine = item.senderId === me?.id;
          return (
            <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
              {item.productId ? (
                <ProductBubble productId={item.productId} />
              ) : item.media ? (
                <Image source={{ uri: item.media.thumbnailUrl ?? item.media.url }} style={{ width: 220, aspectRatio: 1, borderRadius: radius.card }} contentFit="cover" />
              ) : (
                <View style={{ backgroundColor: mine ? colors.primary : colors.muted, borderRadius: radius.card, borderBottomRightRadius: mine ? 4 : radius.card, borderBottomLeftRadius: mine ? radius.card : 4, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <Text style={{ color: mine ? colors.primaryForeground : colors.foreground }}>{item.text}</Text>
                </View>
              )}
              {mine && <Text variant="caption" tone="tertiary" style={{ alignSelf: 'flex-end', marginTop: 2 }}>{item.status === 'read' ? 'Read' : item.status === 'delivered' ? 'Delivered' : item.status === 'sending' ? 'Sending…' : 'Sent'}</Text>}
            </View>
          );
        }}
      />
      {send.error && <ErrorState compact error={send.error} onRetry={submit} />}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingTop: 8, paddingBottom: insets.bottom + 8, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
        <View style={{ flex: 1 }}><SearchBar placeholder="Message…" value={draft} onChangeText={setDraft} onSubmitEditing={submit} returnKeyType="send" editable={!!id} /></View>
        <IconButton icon="send" label="Send" color={draft ? colors.primary : undefined} disabled={!draft || !id || send.isPending} onPress={submit} />
      </View>
    </KeyboardAvoidingView>
  );
}
