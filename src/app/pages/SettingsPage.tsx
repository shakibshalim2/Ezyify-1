import { SEO } from '../components/SEO';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { 
  Bell, Lock, Moon, User, CreditCard, HelpCircle, LogOut, Shield, 
  Sun, FileText, Wallet, Package, ChevronRight, Edit2, LogIn,
  MapPin, Globe, Eye, MessageSquare, Mail, Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router';

function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map(j => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    likes: true,
    comments: true,
    follows: true,
    purchases: true,
    promotions: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showActivity: true,
    showPurchases: false,
    allowMessages: true,
    allowTags: true
  });

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedNotifications = localStorage.getItem('ezyify_notification_settings');
        if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
        const savedPrivacy = localStorage.getItem('ezyify_privacy_settings');
        if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadSettings, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      setTimeout(loadSettings, 16);
    }
  }, []);

  if (isLoading) return <SettingsSkeleton />;

  // Settings list items - icon in tinted circle, toggle/chevron trailing
  const SettingRow = ({ 
    icon: Icon, 
    label, 
    description, 
    onAction,
    toggle,
    toggleValue,
    href
  }: {
    icon: any;
    label: string;
    description?: string;
    onAction?: () => void;
    toggle?: boolean;
    toggleValue?: boolean;
    toggleOnChange?: (v: boolean) => void;
    href?: string;
  }) => {
    const content = (
      <>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{label}</p>
            {description && <p className="text-xs text-foreground-secondary">{description}</p>}
          </div>
        </div>
        {toggle ? (
          <Switch checked={toggleValue || false} onCheckedChange={onAction} />
        ) : (
          <ChevronRight className="w-5 h-5 text-foreground-secondary" />
        )}
      </>
    );

    const className = "flex items-center justify-between gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer";

    return href ? (
      <Link to={href} className={className}>
        {content}
      </Link>
    ) : (
      <button onClick={onAction} className={className}>
        {content}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Settings — Ezyify" description="Manage your Ezyify account settings, notifications, privacy, and security preferences." />
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="mb-8 pt-6">
          <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Settings</h1>
          <p className="text-sm text-foreground-secondary">Manage your account and preferences</p>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">John Doe</p>
                  <p className="text-sm text-foreground-secondary">@johndoe</p>
                  <Badge className="mt-1" variant="outline">Creator Account</Badge>
                </div>
              </div>
              <Link to="/profile/edit">
                <Button variant="outline" size="sm">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5" />
              Account
            </h2>
          </div>
          <Card className="overflow-hidden border-border">
            <CardContent className="p-0 divide-y divide-border">
              <SettingRow
                icon={Mail}
                label="Email Address"
                description="john@example.com"
                href="/settings/account-management"
              />
              <SettingRow
                icon={Lock}
                label="Password"
                description="Change your password"
                href="/settings/security"
              />
              <SettingRow
                icon={Wallet}
                label="Payment Methods"
                description="Manage cards and wallets"
                href="/wallet"
              />
              <SettingRow
                icon={MapPin}
                label="Addresses"
                description="Shipping and billing"
                href="/settings/account-management"
              />
            </CardContent>
          </Card>
        </div>

        {/* Preferences Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Preferences
            </h2>
          </div>
          <Card className="overflow-hidden border-border">
            <CardContent className="p-0 divide-y divide-border">
              <SettingRow
                icon={theme === 'dark' ? Moon : Sun}
                label="Theme"
                description={theme === 'dark' ? 'Dark mode' : 'Light mode'}
                toggle
                toggleValue={theme === 'dark'}
                onAction={toggleTheme}
              />
              <SettingRow
                icon={Globe}
                label="Language"
                description="English"
                href="/settings/account-management"
              />
            </CardContent>
          </Card>
        </div>

        {/* Notifications Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
          </div>
          <Card className="overflow-hidden border-border">
            <CardContent className="p-0 divide-y divide-border">
              <SettingRow
                icon={Bell}
                label="Push Notifications"
                description="Receive notifications on this device"
                toggle
                toggleValue={notifications.push}
                onAction={() => {
                  const updated = { ...notifications, push: !notifications.push };
                  setNotifications(updated);
                  localStorage.setItem('ezyify_notification_settings', JSON.stringify(updated));
                }}
              />
              <SettingRow
                icon={Mail}
                label="Email Notifications"
                description="Receive emails about your account"
                toggle
                toggleValue={notifications.email}
                onAction={() => {
                  const updated = { ...notifications, email: !notifications.email };
                  setNotifications(updated);
                  localStorage.setItem('ezyify_notification_settings', JSON.stringify(updated));
                }}
              />
              <SettingRow
                icon={Heart}
                label="Activity Notifications"
                description="Likes, comments, and follows"
                toggle
                toggleValue={notifications.follows}
                onAction={() => {
                  const updated = { ...notifications, follows: !notifications.follows };
                  setNotifications(updated);
                  localStorage.setItem('ezyify_notification_settings', JSON.stringify(updated));
                }}
              />
              <SettingRow
                icon={Package}
                label="Order Updates"
                description="Track your purchases"
                toggle
                toggleValue={notifications.purchases}
                onAction={() => {
                  const updated = { ...notifications, purchases: !notifications.purchases };
                  setNotifications(updated);
                  localStorage.setItem('ezyify_notification_settings', JSON.stringify(updated));
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Privacy & Security Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </h2>
          </div>
          <Card className="overflow-hidden border-border">
            <CardContent className="p-0 divide-y divide-border">
              <SettingRow
                icon={Eye}
                label="Privacy Settings"
                description="Control who sees your profile"
                href="/settings/privacy"
              />
              <SettingRow
                icon={Lock}
                label="Security"
                description="Two-factor authentication, sessions"
                href="/settings/security"
              />
              <SettingRow
                icon={MessageSquare}
                label="Messages"
                description="Control who can message you"
                href="/settings/privacy"
              />
            </CardContent>
          </Card>
        </div>

        {/* Orders & Wallet Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5" />
              Orders & Payments
            </h2>
          </div>
          <Card className="overflow-hidden border-border">
            <CardContent className="p-0 divide-y divide-border">
              <SettingRow
                icon={Package}
                label="Orders"
                description="View and manage orders"
                href="/orders"
              />
              <SettingRow
                icon={Wallet}
                label="Wallet & Balance"
                description="Manage funds and earnings"
                href="/wallet"
              />
              <SettingRow
                icon={CreditCard}
                label="Billing & Subscriptions"
                description="Manage subscriptions"
                href="/wallet"
              />
            </CardContent>
          </Card>
        </div>

        {/* Support & Legal Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Support & Legal
            </h2>
          </div>
          <Card className="overflow-hidden border-border">
            <CardContent className="p-0 divide-y divide-border">
              <SettingRow
                icon={HelpCircle}
                label="Help Center"
                description="FAQs and support articles"
                href="/help"
              />
              <SettingRow
                icon={FileText}
                label="Terms of Service"
                description="Read our terms and conditions"
                href="/terms"
              />
              <SettingRow
                icon={Shield}
                label="Privacy Policy"
                description="Learn how we protect your data"
                href="/privacy-policy"
              />
            </CardContent>
          </Card>
        </div>

        {/* Logout Section */}
        <div className="mb-8">
          <Button 
            onClick={() => {
              toast.success('Logged out successfully');
              navigate('/login');
            }}
            variant="outline" 
            className="w-full border-error/40 text-error hover:bg-error/5 hover:border-error/60"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
