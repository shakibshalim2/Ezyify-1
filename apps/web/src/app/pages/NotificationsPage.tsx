import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import {
  Heart,
  MessageCircle,
  ShoppingBag,
  UserPlus,
  Video,
  Package,
  TrendingUp,
  Repeat2,
} from 'lucide-react';
import { Button } from '../components/primitives/Button';
import { Skeleton } from '../components/primitives/Skeleton';
import { EmptyNotifications } from '../components/EmptyStates';
import { SEO, SEOConfigs } from '../components/SEO';
import { fadeUp, staggerContainer, DURATION, EASE_EMPHASIZED } from '../lib/motion';

interface Notification {
  id: string;
  type:
    | 'like'
    | 'comment'
    | 'follow'
    | 'purchase'
    | 'live'
    | 'order'
    | 'trending'
    | 'repost';
  user?: {
    username: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  thumbnail?: string;
  action?: { label: string; callback: () => void };
}

type FilterTab = 'all' | 'orders' | 'social' | 'live' | 'system';

function NotificationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 pb-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="w-11 h-11 rounded-lg flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const notificationTypeIcons: Record<
  Notification['type'],
  {
    icon: React.ReactNode;
    bgClass: string;
    textClass: string;
  }
> = {
  like: {
    icon: <Heart className="size-5" />,
    bgClass: 'bg-primary-subtle',
    textClass: 'text-primary',
  },
  comment: {
    icon: <MessageCircle className="size-5" />,
    bgClass: 'bg-primary-subtle',
    textClass: 'text-primary',
  },
  follow: {
    icon: <UserPlus className="size-5" />,
    bgClass: 'bg-primary-subtle',
    textClass: 'text-primary',
  },
  purchase: {
    icon: <ShoppingBag className="size-5" />,
    bgClass: 'bg-primary-subtle',
    textClass: 'text-primary',
  },
  live: {
    icon: <Video className="size-5" />,
    bgClass: 'bg-error-subtle',
    textClass: 'text-error',
  },
  order: {
    icon: <Package className="size-5" />,
    bgClass: 'bg-accent-brand-subtle',
    textClass: 'text-accent-brand',
  },
  trending: {
    icon: <TrendingUp className="size-5" />,
    bgClass: 'bg-primary-subtle',
    textClass: 'text-primary',
  },
  repost: {
    icon: <Repeat2 className="size-5" />,
    bgClass: 'bg-primary-subtle',
    textClass: 'text-primary',
  },
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    message: 'Your order #12345 has been shipped',
    timestamp: '2m ago',
    read: false,
    actionUrl: '/orders',
    action: { label: 'View Order', callback: () => {} },
  },
  {
    id: '2',
    type: 'follow',
    user: {
      username: 'emma_fashion',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    },
    message: 'started following you',
    timestamp: '15m ago',
    read: false,
    actionUrl: '/profile/emma_fashion',
    action: { label: 'Follow Back', callback: () => {} },
  },
  {
    id: '3',
    type: 'like',
    user: {
      username: 'sarah_style',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    },
    message: 'liked your post',
    timestamp: '1h ago',
    read: false,
    actionUrl: '/post/1',
    thumbnail: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100',
  },
  {
    id: '4',
    type: 'comment',
    user: {
      username: 'mike_tech',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
    },
    message: 'commented: "This is amazing! 🔥"',
    timestamp: '2h ago',
    read: false,
    actionUrl: '/post/2',
    thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100',
  },
  {
    id: '5',
    type: 'live',
    user: {
      username: 'alex_gaming',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    message: 'just went live!',
    timestamp: '3h ago',
    read: true,
    actionUrl: '/live/1',
    action: { label: 'Watch Now', callback: () => {} },
  },
  {
    id: '6',
    type: 'order',
    message: 'Your order #12344 has been delivered',
    timestamp: '5h ago',
    read: true,
    actionUrl: '/orders',
  },
  {
    id: '7',
    type: 'trending',
    message: 'Your post is trending! 🎉',
    timestamp: '1d ago',
    read: true,
    actionUrl: '/post/3',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
  },
];

function groupNotificationsByDay(notifications: Notification[]): Record<string, Notification[]> {
  return notifications.reduce(
    (acc, notif) => {
      let day = 'Other';
      if (notif.timestamp.includes('m ago') || notif.timestamp.includes('h ago')) {
        day = 'Today';
      } else if (notif.timestamp.includes('ago') && notif.timestamp.split(' ')[0] === '1') {
        day = 'Yesterday';
      } else if (notif.timestamp.includes('d ago')) {
        day = 'This week';
      }

      if (!acc[day]) acc[day] = [];
      acc[day].push(notif);
      return acc;
    },
    {} as Record<string, Notification[]>
  );
}

export default function NotificationsPage() {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'orders')
      return n.type === 'order';
    if (activeFilter === 'social')
      return ['like', 'comment', 'follow', 'repost'].includes(n.type);
    if (activeFilter === 'live')
      return n.type === 'live';
    if (activeFilter === 'system')
      return ['trending', 'purchase'].includes(n.type);
    return true;
  });

  const groupedNotifications = groupNotificationsByDay(filteredNotifications);
  const dayOrder = ['Today', 'Yesterday', 'This week', 'Other'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SEO {...SEOConfigs.notifications} />
        <NotificationSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEO {...SEOConfigs.notifications} />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-2xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={markAllAsRead}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Mark all read
              </motion.button>
            )}
          </div>

          {/* Filter chips */}
          <motion.div
            variants={staggerContainer(reduce ? 0 : 0.05, 0)}
            initial="hidden"
            animate="visible"
            className="flex gap-2 overflow-x-auto pb-2"
          >
            {(['all', 'orders', 'social', 'live', 'system'] as FilterTab[]).map(filter => (
              <motion.button
                key={filter}
                variants={fadeUp}
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
                  : filter === 'orders'
                    ? 'Orders'
                    : filter === 'social'
                      ? 'Social'
                      : filter === 'live'
                        ? 'Live'
                        : 'System'}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Notifications grouped by day */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {filteredNotifications.length === 0 ? (
          <EmptyNotifications compact />
        ) : (
          <motion.div
            variants={staggerContainer(reduce ? 0 : 0.04)}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {dayOrder.map(
              day =>
                groupedNotifications[day] && (
                  <motion.div key={day} variants={fadeUp}>
                    {/* Day header */}
                    <h2 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
                      {day}
                    </h2>

                    {/* Notifications for this day */}
                    <div className="space-y-2">
                      {groupedNotifications[day].map(notification => {
                        const typeConfig = notificationTypeIcons[notification.type];
                        const isUnread = !notification.read;

                        return (
                          <motion.div key={notification.id} variants={fadeUp}>
                            <Link
                              to={notification.actionUrl || '#'}
                              onClick={() =>
                                isUnread && markAsRead(notification.id)
                              }
                              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                                isUnread
                                  ? `bg-primary-subtle/40 border-primary-subtle ${
                                      isUnread
                                        ? 'border-l-4 border-l-primary'
                                        : ''
                                    }`
                                  : 'bg-card border-border hover:bg-muted hover:border-border-strong'
                              }`}
                            >
                              {/* Type icon in tinted circle */}
                              <div
                                className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig.bgClass} ${typeConfig.textClass}`}
                              >
                                {typeConfig.icon}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground leading-snug">
                                  {notification.user && (
                                    <>
                                      <span className="font-semibold">
                                        {notification.user.username}
                                      </span>
                                      {' '}
                                    </>
                                  )}
                                  <span
                                    className={
                                      notification.user
                                        ? 'text-foreground-secondary'
                                        : 'text-foreground'
                                    }
                                  >
                                    {notification.message}
                                  </span>
                                </p>
                                <p className="text-xs text-foreground-tertiary mt-1">
                                  {notification.timestamp}
                                </p>
                              </div>

                              {/* Thumbnail or action button */}
                              {notification.thumbnail && (
                                <img
                                  loading="lazy"
                                  src={notification.thumbnail}
                                  alt="preview"
                                  className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                                />
                              )}

                              {notification.action && !notification.thumbnail && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={e => {
                                    e.preventDefault();
                                    notification.action?.callback();
                                  }}
                                  className="flex-shrink-0"
                                >
                                  {notification.action.label}
                                </Button>
                              )}

                              {/* Unread indicator dot */}
                              {isUnread && (
                                <div className="size-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
