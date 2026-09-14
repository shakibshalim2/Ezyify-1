import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { formatRelativeTime, useAuth, useConversations, useMessages, useProduct, useSendMessage, useStartConversation, type Conversation, type Message } from '@ezyify/core';
import { SEO, SEOConfigs } from '../components/SEO';
import { ConversationList } from '../components/messages/ConversationList';
import { ChatHeader } from '../components/messages/ChatHeader';
import { MessageBubble } from '../components/messages/MessageBubble';
import { ChatComposer } from '../components/messages/ChatComposer';
import { CallScreen, type CallSessionData } from '../components/CallScreen';
import { QueryError } from '../components/QueryError';
import { Button } from '../components/primitives/Button';
import { useAuthed, useInfiniteList } from '../lib/data';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { formErrors } from '../lib/apiErrors';

const AVATAR_FALLBACK = (name: string) => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

const toListItem = (c: Conversation) => {
  const other = c.participants[0];
  return {
    id: c.id,
    user: {
      name: other.name,
      username: other.username,
      avatar: other.avatarUrl ?? AVATAR_FALLBACK(other.name),
      online: false,
      verified: other.verified,
      type: other.role === 'seller' ? ('seller' as const) : other.role === 'creator' ? ('creator' as const) : ('user' as const),
    },
    lastMessage: {
      text: c.lastMessage?.text ?? 'Say hello 👋',
      time: c.lastMessage ? formatRelativeTime(c.lastMessage.at) : '',
      unread: c.unreadCount,
      sender: c.lastMessage?.fromMe ? ('you' as const) : ('them' as const),
    },
  };
};

/** Product attachments only carry an id on the wire; resolve the summary for the bubble. */
function Bubble({ msg, mine, grouped }: { msg: Message; mine: boolean; grouped: boolean }) {
  const product = useProduct(msg.productId ?? undefined);
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const p = product.data;
  return (
    <MessageBubble
      id={msg.id}
      sender={mine ? 'you' : 'them'}
      type={msg.productId ? 'product' : msg.media ? 'image' : 'text'}
      text={msg.text ?? undefined}
      imageUrl={msg.media?.url}
      product={p ? { id: p.id, name: p.name, price: p.price.amount / 100, originalPrice: p.compareAtPrice ? p.compareAtPrice.amount / 100 : undefined, image: p.imageUrl, store: p.seller.name } : undefined}
      time={time}
      status={msg.status}
      isGrouped={grouped}
    />
  );
}

function Thread({ conversation, isMobile, onBack, onCall }: { conversation: Conversation; isMobile?: boolean; onBack?: () => void; onCall: (type: 'audio' | 'video') => void }) {
  const reduce = useReducedMotion();
  const me = useAuth(s => s.user);
  const messages = useMessages(conversation.id);
  const send = useSendMessage(conversation.id);
  const { items: newestFirst, loadMore, hasMore, loadingMore } = useInfiniteList<Message>(messages);
  const items = useMemo(() => [...newestFirst].reverse(), [newestFirst]);
  const endRef = useRef<HTMLDivElement>(null);
  const other = conversation.participants[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }, [items.length, reduce]);

  const onSend = (text: string) => {
    send.mutate({ text }, { onError: err => toast.error(formErrors(err).message ?? 'Message not sent') });
  };

  const grouped = useMemo(() => {
    const groups: Message[][] = [];
    for (const m of items) {
      const last = groups[groups.length - 1];
      if (last && last[0].senderId === m.senderId && +new Date(m.createdAt) - +new Date(last[last.length - 1].createdAt) < 60_000) last.push(m);
      else groups.push([m]);
    }
    return groups;
  }, [items]);

  return (
    <>
      <ChatHeader
        avatar={other.avatarUrl ?? AVATAR_FALLBACK(other.name)}
        name={other.name}
        status={`@${other.username}`}
        verified={other.verified}
        userType={other.role === 'seller' ? 'seller' : other.role === 'creator' ? 'creator' : 'user'}
        isMobile={isMobile}
        onBack={onBack}
        onCall={() => onCall('audio')}
        onVideo={() => onCall('video')}
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-live="polite">
        {hasMore && (
          <div className="flex justify-center pb-2">
            <Button variant="ghost" size="sm" loading={loadingMore} onClick={loadMore}>Load earlier messages</Button>
          </div>
        )}
        {messages.isLoading ? (
          <div className="space-y-3" aria-busy>
            {[0, 1, 2, 3].map(i => <div key={i} className={`h-10 rounded-2xl bg-muted animate-pulse ${i % 2 ? 'ml-auto w-1/2' : 'w-2/3'}`} />)}
          </div>
        ) : messages.error ? (
          <QueryError error={messages.error} onRetry={() => void messages.refetch()} compact />
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-foreground-secondary">No messages yet — say hello to {other.name.split(' ')[0]}.</p>
        ) : (
          <motion.div variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.02 } } }} initial="hidden" animate="visible">
            {grouped.map(group => group.map((m, i) => <Bubble key={m.id} msg={m} mine={m.senderId === me?.id} grouped={i > 0} />))}
          </motion.div>
        )}
        <div ref={endRef} />
      </div>
      <ChatComposer onSendMessage={onSend} onAttachFile={() => toast.info('Attachments are coming soon')} onAttachCamera={() => toast.info('Camera is coming soon')} isMobile={isMobile} />
    </>
  );
}

export default function MessagesPage() {
  const authed = useAuthed();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const conversations = useConversations();
  const start = useStartConversation();
  const [callSession, setCallSession] = useState<CallSessionData | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  // Only one layout mounts at a time so a thread (and its composer / polling) never renders twice.
  const isMobile = !useMediaQuery('(min-width: 1024px)');
  const activeId = params.get('c');
  const withUser = params.get('with');

  // `?with=<username>` (from a profile or order) opens or creates the 1:1 thread.
  useEffect(() => {
    if (!authed || !withUser || start.isPending) return;
    start.mutate(withUser, {
      onSuccess: ({ id }) => {
        setParams({ c: id }, { replace: true });
        setShowMobileChat(true);
      },
      onError: err => {
        toast.error(formErrors(err).message ?? 'Couldn’t open that conversation');
        setParams({}, { replace: true });
      },
    });
     
  }, [authed, withUser]);

  useEffect(() => {
    if (!authed) navigate('/login', { replace: true, state: { next: '/messages' } });
  }, [authed, navigate]);

  const list = useMemo(() => (conversations.data ?? []).map(toListItem), [conversations.data]);
  const active = conversations.data?.find(c => c.id === activeId) ?? null;
  const select = (id: string) => {
    setParams({ c: id }, { replace: true });
    setShowMobileChat(true);
  };
  const onCall = (type: 'audio' | 'video') => {
    if (!active) return;
    const other = active.participants[0];
    setCallSession({ type, direction: 'outgoing', contact: { name: other.name, avatar: other.avatarUrl ?? AVATAR_FALLBACK(other.name), username: other.username } });
  };

  if (!authed) return null;

  const listPane = conversations.isLoading ? (
    <ConversationList isLoading conversations={[]} onSelectConversation={() => {}} />
  ) : conversations.error ? (
    <div className="p-4"><QueryError error={conversations.error} onRetry={() => void conversations.refetch()} compact /></div>
  ) : (
    <ConversationList conversations={list} activeConvId={activeId ?? undefined} onSelectConversation={select} />
  );

  return (
    <div className="bg-background">
      <SEO {...SEOConfigs.messages} />

      {!isMobile && <div className="grid grid-cols-[360px_1fr] h-[calc(100dvh-4rem)]">
        <div className="border-r border-border overflow-hidden">{listPane}</div>
        <div className="flex flex-col overflow-hidden">
          {active ? (
            <Thread key={active.id} conversation={active} onCall={onCall} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2 max-w-xs px-6">
                <p className="font-display text-lg font-semibold text-foreground">Your messages</p>
                <p className="text-sm text-foreground-secondary">Pick a conversation, or message a seller from any product page.</p>
                <Button variant="secondary" size="md" asChild><Link to="/shop">Browse the shop</Link></Button>
              </div>
            </div>
          )}
        </div>
      </div>}

      {isMobile && <div className="h-[calc(100dvh-5.75rem-var(--safe-top)-var(--nav-height)-var(--safe-bottom))] md:h-[calc(100dvh-3rem-var(--safe-top)-var(--nav-height)-var(--safe-bottom))] flex flex-col">
        <AnimatePresence mode="wait" initial={false}>
          {!showMobileChat || !active ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
              {listPane}
            </motion.div>
          ) : (
            <motion.div key={active.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} className="flex flex-col flex-1 overflow-hidden">
              <Thread conversation={active} isMobile onBack={() => setShowMobileChat(false)} onCall={onCall} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>}

      {callSession && <CallScreen session={callSession} onEnd={() => { setCallSession(null); toast.success('Call ended'); }} />}
    </div>
  );
}
