import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatMoney, type Message } from '@ezyify/core';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { SearchBar } from '@/components/SearchBar';
import { IconButton } from '@/components/IconButton';
import { conversations, findProduct, messages as seed } from '@/lib/mock';
import { useTheme } from '@/theme';

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, radius } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const convo = conversations.find(c => c.id === id) ?? conversations[0];
  const other = convo.participants[0];
  const [items, setItems] = useState<Message[]>(seed[convo.id] ?? []);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const list = useRef<FlatList<Message>>(null);

  useEffect(() => {
    list.current?.scrollToEnd({ animated: true });
  }, [items.length, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setItems(m => [...m, { id: `${Date.now()}`, conversationId: convo.id, senderId: 'me', text, media: null, productId: null, status: 'sent', createdAt: new Date().toISOString() }]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setItems(m => [...m, { id: `${Date.now()}r`, conversationId: convo.id, senderId: other.id, text: 'Got it! Let me check and get back to you 🙌', media: null, productId: null, status: 'delivered', createdAt: new Date().toISOString() }]);
    }, 1400);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top, height: insets.top + 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
        <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/profile/[username]', params: { username: other.username } })} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar uri={other.avatarUrl} size={36} verified={other.verified} />
          <View>
            <Text variant="bodyMedium">{other.name}</Text>
            <Text variant="caption" tone={typing ? 'brand' : 'secondary'}>{typing ? 'typing…' : 'Active now'}</Text>
          </View>
        </Pressable>
        <IconButton icon="call-outline" label="Call" />
        <IconButton icon="information-circle-outline" label="Details" />
      </View>

      <FlatList
        ref={list}
        data={items}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListFooterComponent={typing ? <View style={{ alignSelf: 'flex-start', backgroundColor: colors.muted, borderRadius: radius.card, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', gap: 4 }}>{[0, 1, 2].map(i => <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.foregroundTertiary, opacity: 0.5 + i * 0.25 }} />)}</View> : null}
        renderItem={({ item }) => {
          const mine = item.senderId === 'me';
          const product = item.productId ? findProduct(item.productId) : undefined;
          return (
            <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
              {product ? (
                <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} style={{ backgroundColor: colors.card, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', width: 220 }}>
                  <Image source={{ uri: product.imageUrl }} style={{ width: '100%', aspectRatio: 1.4 }} contentFit="cover" />
                  <View style={{ padding: 10, gap: 6 }}>
                    <Text variant="bodyMedium" numberOfLines={1}>{product.name}</Text>
                    <Text variant="label" tone="brand">{formatMoney(product.price)}</Text>
                  </View>
                </Pressable>
              ) : (
                <View style={{ backgroundColor: mine ? colors.primary : colors.muted, borderRadius: radius.card, borderBottomRightRadius: mine ? 4 : radius.card, borderBottomLeftRadius: mine ? radius.card : 4, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <Text style={{ color: mine ? colors.primaryForeground : colors.foreground }}>{item.text}</Text>
                </View>
              )}
              {mine && <Text variant="caption" tone="tertiary" style={{ alignSelf: 'flex-end', marginTop: 2 }}>{item.status === 'read' ? 'Read' : item.status === 'delivered' ? 'Delivered' : 'Sent'}</Text>}
            </View>
          );
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingTop: 8, paddingBottom: insets.bottom + 8, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
        <IconButton icon="add-circle-outline" label="Attach" />
        <View style={{ flex: 1 }}><SearchBar placeholder="Message…" value={draft} onChangeText={setDraft} onSubmitEditing={send} returnKeyType="send" /></View>
        <IconButton icon={draft ? 'send' : 'mic-outline'} label={draft ? 'Send' : 'Voice message'} color={draft ? colors.primary : undefined} onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}
