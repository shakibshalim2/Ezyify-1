import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { SEO, SEOConfigs } from '../components/SEO';
import { ConversationList } from '../components/messages/ConversationList';
import { ChatHeader } from '../components/messages/ChatHeader';
import { MessageBubble } from '../components/messages/MessageBubble';
import { TypingIndicator } from '../components/messages/TypingIndicator';
import { ChatComposer } from '../components/messages/ChatComposer';
import { CallScreen, type CallSessionData } from '../components/CallScreen';

// Types matching original structure
interface ProductCard {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  store: string;
}

interface ReplyRef {
  id: number;
  text: string;
  senderName: string;
}

interface Message {
  id: number;
  sender: 'you' | 'them';
  senderInfo?: { name: string; avatar: string };
  type: 'text' | 'image' | 'product' | 'order' | 'system';
  text?: string;
  imageUrl?: string;
  product?: ProductCard;
  time: string;
  date: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: ReplyRef;
}

interface ConvUser {
  name: string;
  username: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  verified: boolean;
  type: 'user' | 'seller' | 'creator';
}

interface Conversation {
  id: number;
  isGroup?: boolean;
  user: ConvUser;
  lastMessage: {
    text: string;
    time: string;
    unread: number;
    sender: 'you' | 'them';
  };
  muted?: boolean;
  pinned?: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    pinned: true,
    user: {
      name: 'StyleHub Store',
      username: 'stylehub',
      avatar: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=150',
      online: true,
      verified: true,
      type: 'seller',
    },
    lastMessage: {
      text: "Your order has been shipped! 📦",
      time: '2m ago',
      unread: 2,
      sender: 'them',
    },
  },
  {
    id: 2,
    user: {
      name: 'Emma Wilson',
      username: 'fashionista_emma',
      avatar: 'https://images.unsplash.com/photo-1716827172706-9f4c36b039eb?w=150',
      online: true,
      verified: true,
      type: 'creator',
    },
    lastMessage: {
      text: 'Thanks! Love the outfit inspo 😍',
      time: '15m ago',
      unread: 0,
      sender: 'you',
    },
  },
  {
    id: 3,
    user: {
      name: 'TechWorld',
      username: 'techworld',
      avatar: 'https://images.unsplash.com/photo-1752859951149-7d3fc700a7ec?w=150',
      online: false,
      lastSeen: 'Last seen 1h ago',
      verified: true,
      type: 'seller',
    },
    lastMessage: {
      text: 'Is the warranty international?',
      time: '1h ago',
      unread: 0,
      sender: 'you',
    },
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    sender: 'them',
    type: 'text',
    text: 'Hey! How are you doing?',
    time: '10:30 AM',
    date: 'Today',
    status: 'read',
  },
  {
    id: 2,
    sender: 'you',
    type: 'text',
    text: 'Hi! I\'m doing great, thanks for asking!',
    time: '10:32 AM',
    date: 'Today',
    status: 'read',
  },
  {
    id: 3,
    sender: 'them',
    type: 'text',
    text: 'Check out this product I found',
    time: '10:33 AM',
    date: 'Today',
    status: 'read',
  },
  {
    id: 4,
    sender: 'them',
    type: 'product',
    product: {
      id: 'p1',
      name: 'Premium Wireless Headphones',
      price: 45,
      originalPrice: 79.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
      store: 'TechStore',
    },
    time: '10:33 AM',
    date: 'Today',
    status: 'read',
  },
  {
    id: 5,
    sender: 'you',
    type: 'text',
    text: 'Wow, that looks amazing! 🔥',
    time: '10:35 AM',
    date: 'Today',
    status: 'read',
  },
];

export default function MessagesPage() {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callSession, setCallSession] = useState<CallSessionData | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    const timer = setTimeout(() => {
      setConversations(MOCK_CONVERSATIONS);
      setActiveConvId(MOCK_CONVERSATIONS[0]?.id);
      setMessages(MOCK_MESSAGES);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find(c => c.id === activeConvId);

  const handleSelectConversation = useCallback((id: number) => {
    setActiveConvId(id);
    setShowMobileChat(true);
    setMessages(MOCK_MESSAGES);
  }, []);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'you',
      type: 'text',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate send delay
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === newMessage.id ? { ...m, status: 'delivered' } : m
        )
      );
    }, 500);

    // Simulate read receipt
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === newMessage.id ? { ...m, status: 'read' } : m
        )
      );
    }, 1500);

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: messages.length + 2,
        sender: 'them',
        type: 'text',
        text: 'Thanks for the message! 👋',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        status: 'delivered',
      };
      setMessages(prev => [...prev, response]);
    }, 3000);
  };

  const handleCallStart = () => {
    setCallSession({
      type: 'audio',
      direction: 'outgoing',
      contact: {
        name: activeConversation!.user.name,
        avatar: activeConversation!.user.avatar,
        username: activeConversation!.user.username,
      },
    });
  };

  const handleVideoCallStart = () => {
    setCallSession({
      type: 'video',
      direction: 'outgoing',
      contact: {
        name: activeConversation!.user.name,
        avatar: activeConversation!.user.avatar,
        username: activeConversation!.user.username,
      },
    });
  };

  const handleCallEnd = () => {
    setCallSession(null);
    toast.success('Call ended');
  };

  const groupedMessages = messages.reduce(
    (acc, msg) => {
      const lastGroup = acc[acc.length - 1];
      if (
        lastGroup &&
        lastGroup[0].sender === msg.sender &&
        new Date(msg.time).getTime() - new Date(lastGroup[lastGroup.length - 1].time).getTime() < 60000
      ) {
        lastGroup.push(msg);
      } else {
        acc.push([msg]);
      }
      return acc;
    },
    [] as Message[][]
  );

  return (
    <div className="bg-background">
      <SEO {...SEOConfigs.messages} />

      {/* Desktop: Two-pane layout */}
      <div className="hidden lg:grid lg:grid-cols-[360px_1fr] h-[calc(100dvh-4rem)]">
        {/* Conversation list pane */}
        <div className="border-r border-border overflow-hidden">
          {isLoading ? (
            <ConversationList
              isLoading
              conversations={[]}
              onSelectConversation={() => {}}
            />
          ) : (
            <ConversationList
              conversations={conversations}
              activeConvId={activeConvId ?? undefined}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </div>

        {/* Chat pane */}
        <div className="flex flex-col overflow-hidden">
          {activeConversation ? (
            <>
              <ChatHeader
                avatar={activeConversation.user.avatar}
                name={activeConversation.user.name}
                status={
                  activeConversation.user.online
                    ? 'Online'
                    : activeConversation.user.lastSeen || 'Offline'
                }
                verified={activeConversation.user.verified}
                userType={activeConversation.user.type}
                onCall={handleCallStart}
                onVideo={handleVideoCallStart}
              />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                <motion.div
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: reduce ? 0 : 0.02,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {groupedMessages.map((group, groupIdx) =>
                    group.map((msg, msgIdx) => (
                      <MessageBubble
                        key={msg.id}
                        {...msg}
                        isGrouped={msgIdx > 0}
                        onImageClick={() => {}}
                      />
                    ))
                  )}
                </motion.div>
                {isTyping && (
                  <TypingIndicator
                    userName={activeConversation.user.name}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <ChatComposer
                onSendMessage={handleSendMessage}
                onAttachFile={() => toast.info('File attachment not implemented')}
                onAttachCamera={() => toast.info('Camera not implemented')}
                onEmojiClick={() => toast.info('Emoji picker not implemented')}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-foreground-secondary">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Single pane with slide transition */}
      <div className="lg:hidden h-[calc(100dvh-5.75rem-var(--safe-top)-var(--nav-height)-var(--safe-bottom))] md:h-[calc(100dvh-3rem-var(--safe-top)-var(--nav-height)-var(--safe-bottom))] flex flex-col">
        <AnimatePresence mode="wait">
          {!showMobileChat ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex-1 overflow-hidden"
            >
              {isLoading ? (
                <ConversationList
                  isLoading
                  conversations={[]}
                  onSelectConversation={() => {}}
                />
              ) : (
                <ConversationList
                  conversations={conversations}
                  activeConvId={activeConvId ?? undefined}
                  onSelectConversation={handleSelectConversation}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex flex-col flex-1 overflow-hidden"
            >
              {activeConversation ? (
                <>
                  <ChatHeader
                    avatar={activeConversation.user.avatar}
                    name={activeConversation.user.name}
                    status={
                      activeConversation.user.online
                        ? 'Online'
                        : activeConversation.user.lastSeen || 'Offline'
                    }
                    verified={activeConversation.user.verified}
                    userType={activeConversation.user.type}
                    isMobile
                    onBack={() => setShowMobileChat(false)}
                    onCall={handleCallStart}
                    onVideo={handleVideoCallStart}
                  />

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    <motion.div
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            staggerChildren: reduce ? 0 : 0.02,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                    >
                      {groupedMessages.map((group, groupIdx) =>
                        group.map((msg, msgIdx) => (
                          <MessageBubble
                            key={msg.id}
                            {...msg}
                            isGrouped={msgIdx > 0}
                            onImageClick={() => {}}
                          />
                        ))
                      )}
                    </motion.div>
                    {isTyping && (
                      <TypingIndicator
                        userName={activeConversation.user.name}
                      />
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Composer - sticky above bottom nav */}
                  <ChatComposer
                    onSendMessage={handleSendMessage}
                    onAttachFile={() => toast.info('File attachment not implemented')}
                    onAttachCamera={() => toast.info('Camera not implemented')}
                    onEmojiClick={() => toast.info('Emoji picker not implemented')}
                    isMobile
                  />
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Call screen overlay */}
      {callSession && (
        <CallScreen
          session={callSession}
          onEnd={handleCallEnd}
        />
      )}
    </div>
  );
}
