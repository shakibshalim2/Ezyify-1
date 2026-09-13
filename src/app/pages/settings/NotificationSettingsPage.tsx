import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { Bell, Heart, MessageSquare, ShoppingBag, Users, Video, TrendingUp, Mail, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useState, useEffect } from 'react';

// Skeleton Component
function NotificationSettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
      </div>

      {/* Cards Skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-5 h-5" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>
                <Skeleton className="w-11 h-6 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Button Skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 flex-1" />
      </div>
    </div>
  );
}

export default function NotificationSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    // Push Notifications
    pushEnabled: true,
    pushLikes: true,
    pushComments: true,
    pushFollows: true,
    pushMessages: true,
    pushOrders: true,
    pushLive: true,
    pushAffiliate: true,
    
    // Email Notifications
    emailEnabled: true,
    emailWeeklySummary: true,
    emailPromotions: true,
    emailOrders: true,
    emailAffiliate: true,
    emailSecurity: true,
    
    // In-App Notifications
    inAppLikes: true,
    inAppComments: true,
    inAppFollows: true,
    inAppMessages: true,
    
    // Sound & Vibration
    sound: true,
    vibration: true,
    
    // Do Not Disturb
    dndEnabled: false,
    dndStart: '22:00',
    dndEnd: '08:00'
  });

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <NotificationSettingsSkeleton />;
  }

  const updateNotification = (key: string, value: any) => {
    setNotifications({ ...notifications, [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <SEO title="Notification Settings — Ezyify" description="Manage your notification preferences on Ezyify." />
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-0.5">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Notification Settings</h1>
            <p className="text-sm text-muted-foreground">Choose what notifications you want to receive</p>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="push-enabled" className="text-base font-semibold">Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all push notifications
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={notifications.pushEnabled}
              onCheckedChange={(checked) => updateNotification('pushEnabled', checked)}
            />
          </div>

          {notifications.pushEnabled && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-error" />
                  <div className="space-y-1">
                    <Label htmlFor="push-likes">Likes</Label>
                    <p className="text-sm text-muted-foreground">When someone likes your post</p>
                  </div>
                </div>
                <Switch
                  id="push-likes"
                  checked={notifications.pushLikes}
                  onCheckedChange={(checked) => updateNotification('pushLikes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-info" />
                  <div className="space-y-1">
                    <Label htmlFor="push-comments">Comments</Label>
                    <p className="text-sm text-muted-foreground">When someone comments on your post</p>
                  </div>
                </div>
                <Switch
                  id="push-comments"
                  checked={notifications.pushComments}
                  onCheckedChange={(checked) => updateNotification('pushComments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div className="space-y-1">
                    <Label htmlFor="push-follows">New Followers</Label>
                    <p className="text-sm text-muted-foreground">When someone follows you</p>
                  </div>
                </div>
                <Switch
                  id="push-follows"
                  checked={notifications.pushFollows}
                  onCheckedChange={(checked) => updateNotification('pushFollows', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-success" />
                  <div className="space-y-1">
                    <Label htmlFor="push-messages">Messages</Label>
                    <p className="text-sm text-muted-foreground">When you receive a new message</p>
                  </div>
                </div>
                <Switch
                  id="push-messages"
                  checked={notifications.pushMessages}
                  onCheckedChange={(checked) => updateNotification('pushMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-warning" />
                  <div className="space-y-1">
                    <Label htmlFor="push-orders">Orders & Shopping</Label>
                    <p className="text-sm text-muted-foreground">Order updates and delivery notifications</p>
                  </div>
                </div>
                <Switch
                  id="push-orders"
                  checked={notifications.pushOrders}
                  onCheckedChange={(checked) => updateNotification('pushOrders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-like" />
                  <div className="space-y-1">
                    <Label htmlFor="push-live">Live Events</Label>
                    <p className="text-sm text-muted-foreground">When creators you follow go live</p>
                  </div>
                </div>
                <Switch
                  id="push-live"
                  checked={notifications.pushLive}
                  onCheckedChange={(checked) => updateNotification('pushLive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div className="space-y-1">
                    <Label htmlFor="push-affiliate">Affiliate Earnings</Label>
                    <p className="text-sm text-muted-foreground">Updates about your commission earnings</p>
                  </div>
                </div>
                <Switch
                  id="push-affiliate"
                  checked={notifications.pushAffiliate}
                  onCheckedChange={(checked) => updateNotification('pushAffiliate', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive updates via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-enabled" className="text-base font-semibold">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all email notifications
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={notifications.emailEnabled}
              onCheckedChange={(checked) => updateNotification('emailEnabled', checked)}
            />
          </div>

          {notifications.emailEnabled && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-summary">Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">Weekly recap of your activity and stats</p>
                </div>
                <Switch
                  id="email-summary"
                  checked={notifications.emailWeeklySummary}
                  onCheckedChange={(checked) => updateNotification('emailWeeklySummary', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-promotions">Promotions & Deals</Label>
                  <p className="text-sm text-muted-foreground">Special offers and platform updates</p>
                </div>
                <Switch
                  id="email-promotions"
                  checked={notifications.emailPromotions}
                  onCheckedChange={(checked) => updateNotification('emailPromotions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-orders">Order Confirmations</Label>
                  <p className="text-sm text-muted-foreground">Receipts and shipping updates</p>
                </div>
                <Switch
                  id="email-orders"
                  checked={notifications.emailOrders}
                  onCheckedChange={(checked) => updateNotification('emailOrders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-affiliate">Affiliate Reports</Label>
                  <p className="text-sm text-muted-foreground">Monthly earnings and performance reports</p>
                </div>
                <Switch
                  id="email-affiliate"
                  checked={notifications.emailAffiliate}
                  onCheckedChange={(checked) => updateNotification('emailAffiliate', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-security">Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">Login alerts and security updates (recommended)</p>
                </div>
                <Switch
                  id="email-security"
                  checked={notifications.emailSecurity}
                  onCheckedChange={(checked) => updateNotification('emailSecurity', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sound & Vibration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sound & Vibration</CardTitle>
          <CardDescription>
            Control notification sounds and vibrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="sound">Notification Sound</Label>
              <p className="text-sm text-muted-foreground">Play sound for notifications</p>
            </div>
            <Switch
              id="sound"
              checked={notifications.sound}
              onCheckedChange={(checked) => updateNotification('sound', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="vibration">Vibration</Label>
              <p className="text-sm text-muted-foreground">Vibrate for notifications</p>
            </div>
            <Switch
              id="vibration"
              checked={notifications.vibration}
              onCheckedChange={(checked) => updateNotification('vibration', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Do Not Disturb</CardTitle>
          <CardDescription>
            Mute notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dnd-enabled" className="text-base font-semibold">Enable Do Not Disturb</Label>
              <p className="text-sm text-muted-foreground">
                Silence notifications during set hours
              </p>
            </div>
            <Switch
              id="dnd-enabled"
              checked={notifications.dndEnabled}
              onCheckedChange={(checked) => updateNotification('dndEnabled', checked)}
            />
          </div>

          {notifications.dndEnabled && (
            <>
              <Separator />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dnd-start">Start Time</Label>
                  <input
                    id="dnd-start"
                    type="time"
                    value={notifications.dndStart}
                    onChange={(e) => updateNotification('dndStart', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dnd-end">End Time</Label>
                  <input
                    id="dnd-end"
                    type="time"
                    value={notifications.dndEnd}
                    onChange={(e) => updateNotification('dndEnd', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button size="lg" className="flex-1" onClick={() => toast.success('Notification preferences saved')}>
          Save Changes
        </Button>
        <Button size="lg" variant="outline" onClick={() => toast.info('Preferences reset to default')}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
}