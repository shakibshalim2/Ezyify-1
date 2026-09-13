import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Search } from 'lucide-react';
import { Field } from '../primitives/Field';
import { Skeleton } from '../primitives/Skeleton';
import { EmptyMessages } from '../EmptyStates';
import { VerifiedBadge } from '../VerifiedBadge';
import { fadeUp, staggerContainer, DURATION, EASE_EMPHASIZED } from '../../lib/motion';

type FilterTab = 'all' | 'unread' | 'sellers' | 'creators';

interface ConvListItem {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
    online: boolean;
    lastSeen?: string;
    verified: boolean;
    type: 'user' | 'seller' | 'creator';
  };
  lastMessage: {
    text: string;
    time: string;
    unread: number;
    sender: 'you' | 'them';
  };
}

interface ConversationListProps {
  conversations: ConvListItem[];
  isLoading?: boolean;
  activeConvId?: number;
  onSelectConversation: (id: number) => void;
}

export function ConversationList({
  conversations,
  isLoading = false,
  activeConvId,
  onSelectConversation,
}: ConversationListProps) {
  const reduce = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredConvs = useMemo(() => {
    let filtered = conversations;

    // Filter by type
    if (activeFilter === 'unread') {
      filtered = filtered.filter(c => c.lastMessage.unread > 0);
    } else if (activeFilter === 'sellers') {
      filtered = filtered.filter(c => c.user.type === 'seller');
    } else if (activeFilter === 'creators') {
      filtered = filtered.filter(c => c.user.type === 'creator');
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.user.name.toLowerCase().includes(q) ||
          c.user.username.toLowerCase().includes(q) ||
          c.lastMessage.text.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [conversations, activeFilter, searchQuery]);

  const filters: FilterTab[] = ['all', 'unread', 'sellers', 'creators'];

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 space-y-4 flex-shrink-0">
          <Skeleton className="h-12 rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-9 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3 pb-3 border-b border-border">
              <Skeleton className="size-12 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with search */}
      <div className="px-4 py-3 space-y-3 flex-shrink-0 border-b border-border">
        <Field
          label="Search"
          hideLabel
          type="text"
          placeholder="Name or message…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          leftIcon={<Search className="size-5" />}
          containerClassName="mb-0"
        />

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(filter => (
            <motion.button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/70'
              }`}
            >
              {filter === 'all'
                ? 'All'
                : filter === 'unread'
                  ? 'Unread'
                  : filter === 'sellers'
                    ? 'Sellers'
                    : 'Creators'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConvs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyMessages compact />
          </div>
        ) : (
          <motion.div
            variants={staggerContainer(reduce ? 0 : 0.04, 0)}
            initial="hidden"
            animate="visible"
            className="divide-y divide-border"
          >
            {filteredConvs.map(conv => (
              <motion.button
                key={conv.id}
                variants={fadeUp}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex gap-3 px-4 py-3 text-left transition-colors ${
                  activeConvId === conv.id ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.user.avatar}
                    alt={conv.user.name}
                    className="size-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  {conv.user.online && (
                    <div className="absolute bottom-0 right-0 size-3 bg-success rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name + verified badge */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-foreground truncate">
                      {conv.user.name}
                    </span>
                    {conv.user.verified && (
                      <VerifiedBadge
                        variant={conv.user.type === 'seller' ? 'seller' : 'user'}
                        size="sm"
                      />
                    )}
                  </div>

                  {/* Message preview + time */}
                  <div className="flex items-baseline gap-2 min-w-0">
                    <p className="text-sm text-foreground-secondary truncate flex-1">
                      {conv.lastMessage.sender === 'you'
                        ? `You: ${conv.lastMessage.text}`
                        : conv.lastMessage.text}
                    </p>
                    <span className="text-xs text-foreground-tertiary font-tabular-nums flex-shrink-0">
                      {conv.lastMessage.time}
                    </span>
                  </div>
                </div>

                {/* Unread badge */}
                {conv.lastMessage.unread > 0 && (
                  <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full size-6 flex items-center justify-center text-xs font-semibold">
                    {conv.lastMessage.unread > 9 ? '9+' : conv.lastMessage.unread}
                  </div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
