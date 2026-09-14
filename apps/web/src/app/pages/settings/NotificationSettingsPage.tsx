import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Bell, Heart, MessageSquare, Users, Package, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface NotificationSettings {
  [key: string]: boolean;
}

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationSettings>({
    push: true,
    email: true,
    sms: false,
    likes: true,
    comments: true,
    follows: true,
    purchases: true,
    promotions: false,
    newsletter: true,
  });

  const toggleNotification = (key: string) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('ezyify_notification_settings', JSON.stringify(updated));
  };

  const NotificationRow = ({
    icon: Icon,
    label,
    description,
    settingKey,
  }: {
    icon: any;
    label: string;
    description: string;
    settingKey: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{label}</p>
          <p className="text-xs text-foreground-secondary">{description}</p>
        </div>
      </div>
      <Switch
        checked={notifications[settingKey]}
        onCheckedChange={() => toggleNotification(settingKey)}
      />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Notification Settings — Ezyify" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground">Notification Settings</h1>
            <p className="text-xs text-foreground-secondary">Control how you receive notifications</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Channels */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Channels
          </h2>
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              <NotificationRow
                icon={Zap}
                label="Push Notifications"
                description="Notifications on your device"
                settingKey="push"
              />
              <NotificationRow
                icon={Heart}
                label="Email Notifications"
                description="Receive emails about your account"
                settingKey="email"
              />
              <NotificationRow
                icon={MessageSquare}
                label="SMS Notifications"
                description="Text message alerts"
                settingKey="sms"
              />
            </CardContent>
          </Card>
        </div>

        {/* Activity Notifications */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Activity
          </h2>
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              <NotificationRow
                icon={Heart}
                label="Likes"
                description="When someone likes your posts"
                settingKey="likes"
              />
              <NotificationRow
                icon={MessageSquare}
                label="Comments"
                description="When someone comments on your posts"
                settingKey="comments"
              />
              <NotificationRow
                icon={Users}
                label="Follows"
                description="When someone follows you"
                settingKey="follows"
              />
            </CardContent>
          </Card>
        </div>

        {/* Transaction Notifications */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Transactions
          </h2>
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              <NotificationRow
                icon={Package}
                label="Order Updates"
                description="Track your purchases and deliveries"
                settingKey="purchases"
              />
              <NotificationRow
                icon={Zap}
                label="Promotions & Deals"
                description="Special offers and discounts"
                settingKey="promotions"
              />
              <NotificationRow
                icon={MessageSquare}
                label="Newsletter"
                description="Weekly updates and news"
                settingKey="newsletter"
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => {
              Object.keys(notifications).forEach(key => {
                notifications[key] = true;
              });
              setNotifications({ ...notifications });
              localStorage.setItem('ezyify_notification_settings', JSON.stringify(notifications));
              toast.success('All notifications enabled');
            }}
            variant="outline"
            className="flex-1"
          >
            Enable All
          </Button>
          <Button
            onClick={() => {
              Object.keys(notifications).forEach(key => {
                notifications[key] = false;
              });
              setNotifications({ ...notifications });
              localStorage.setItem('ezyify_notification_settings', JSON.stringify(notifications));
              toast.success('All notifications disabled');
            }}
            variant="outline"
            className="flex-1"
          >
            Disable All
          </Button>
        </div>
      </div>
    </div>
  );
}
