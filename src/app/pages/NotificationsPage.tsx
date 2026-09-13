import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { EmptyNotifications } from '../components/EmptyStates';
import { Heart, MessageCircle, ShoppingBag, UserPlus, Video, Package, TrendingUp, Bell, Repeat2 } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { SEO, SEOConfigs } from '../components/SEO';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'purchase' | 'live' | 'order' | 'trending' | 'repost';
  user?: {
    username: string;
    avatar: string;
  };
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  thumbnail?: string;
}

// SKELETON FOR INSTANT UI
function NotificationsSkeleton() {
  return (
    <>
      <div className="max-w-3xl mx-auto px-4 pb-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const notificationConfig: Record<Notification['type'], { icon: React.ReactNode; bg: string }> = {
  like:     { icon: <Heart       className="w-4 h-4 text-like" />,      bg: 'bg-like/10' },
  comment:  { icon: <MessageCircle className="w-4 h-4 text-primary" />, bg: 'bg-primary/10' },
  follow:   { icon: <UserPlus    className="w-4 h-4 text-info" />,      bg: 'bg-info/10' },
  purchase: { icon: <ShoppingBag className="w-4 h-4 text-success" />,   bg: 'bg-success/10' },
  live:     { icon: <Video       className="w-4 h-4 text-error" />,     bg: 'bg-error/10' },
  order:    { icon: <Package     className="w-4 h-4 text-info" />,      bg: 'bg-info/10' },
  trending: { icon: <TrendingUp  className="w-4 h-4 text-warning" />,   bg: 'bg-warning/10' },
  repost:   { icon: <Repeat2     className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/10' },
};

export default function NotificationsPage() {
  // ALL HOOKS AT THE TOP - NEVER CONDITIONAL
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'likes' | 'comments' | 'follows' | 'reposts' | 'orders' | 'system'>('all');

  // PROGRESSIVE LOADING: Load notifications after initial render
  useEffect(() => {
    const loadNotifications = () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          user: { username: 'sarah_style', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
          message: 'liked your post',
          timestamp: '2m ago',
          read: false,
          actionUrl: '/post/1',
          thumbnail: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'
        },
        {
          id: '2',
          type: 'comment',
          user: { username: 'mike_tech', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' },
          message: 'commented: "This is amazing! 🔥"',
          timestamp: '15m ago',
          read: false,
          actionUrl: '/post/2',
          thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100'
        },
        {
          id: '3',
          type: 'follow',
          user: { username: 'emma_fashion', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
          message: 'started following you',
          timestamp: '1h ago',
          read: false,
          actionUrl: '/profile/emma_fashion'
        },
        {
          id: '4',
          type: 'purchase',
          message: 'Someone purchased a product you tagged!',
          timestamp: '2h ago',
          read: false,
          actionUrl: '/creator-dashboard'
        },
        {
          id: '5',
          type: 'live',
          user: { username: 'alex_gaming', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
          message: 'just went live!',
          timestamp: '3h ago',
          read: true,
          actionUrl: '/live/1'
        },
        {
          id: '6',
          type: 'order',
          message: 'Your order #12345 has been shipped',
          timestamp: '5h ago',
          read: true,
          actionUrl: '/orders'
        },
        {
          id: '7',
          type: 'trending',
          message: 'Your post is trending! 🎉',
          timestamp: '1d ago',
          read: true,
          actionUrl: '/post/3',
          thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
        },
        {
          id: '8',
          type: 'repost',
          user: { username: 'fashionista_maya', avatar: 'https://images.unsplash.com/photo-1507611268508-bf74edce9029?w=100' },
          message: 'reposted your post',
          timestamp: '45m ago',
          read: false,
          actionUrl: '/post/1',
          thumbnail: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'
        },
        {
          id: '9',
          type: 'repost',
          user: { username: 'tech_reviews_pro', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100' },
          message: 'quoted your post: "This is exactly what I needed to see today 🙌"',
          timestamp: '2h ago',
          read: false,
          actionUrl: '/post/2',
          thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100'
        }
      ];

      setNotifications(mockNotifications);
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadNotifications, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadNotifications, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredNotifications = activeFilter === 'all' 
    ? notifications
    : notifications.filter(n => {
        switch (activeFilter) {
          case 'likes': return n.type === 'like';
          case 'comments': return n.type === 'comment';
          case 'follows': return n.type === 'follow';
          case 'reposts': return n.type === 'repost';
          case 'orders': return n.type === 'order';
          case 'system': return ['purchase', 'live', 'trending'].includes(n.type);
          default: return true;
        }
      });

  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.notifications} />
      
      {isLoading ? (
        <NotificationsSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="bg-card/95 backdrop-blur-xl border-b border-border sticky lg:!top-16 z-10" style={{ top: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-semibold text-foreground">Notifications</h1>
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-xl hover:bg-primary/8"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Filter chips */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                {['all', 'likes', 'comments', 'follows', 'reposts', 'orders', 'system'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter as typeof activeFilter)}
                    className={`px-3.5 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all duration-150 shrink-0 ${
                      activeFilter === filter
                        ? 'text-white shadow-brand'
                        : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70'
                    }`}
                    style={activeFilter === filter ? { background: 'var(--brand-gradient)' } : {}}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <EmptyNotifications compact />
              ) : (
                filteredNotifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.actionUrl || '#'}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-150 hover:shadow-sm group ${
                      !notification.read
                        ? 'bg-primary/5 border-primary/20 hover:bg-primary/8'
                        : 'bg-card border-border hover:bg-muted hover:border-border-strong'
                    }`}
                  >
                    {/* Icon pill */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${notificationConfig[notification.type].bg}`}>
                      {notificationConfig[notification.type].icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {notification.user && (
                          <span className="font-semibold">{notification.user.username} </span>
                        )}
                        <span className="text-muted-foreground">{notification.message}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notification.timestamp}</p>
                    </div>

                    {/* Thumbnail */}
                    {notification.thumbnail && (
                      <img loading="lazy"
                        src={notification.thumbnail}
                        alt="preview"
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                    )}

                    {/* Unread dot */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
