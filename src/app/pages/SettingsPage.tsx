import { SEO } from '../components/SEO';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Bell, Lock, Moon, User, CreditCard, HelpCircle, LogOut, Shield, Smartphone, Mail, Sun, FileText, Wallet, Package, Cookie } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router';

// SKELETON FOR INSTANT UI - SETTINGS PAGE
function SettingsSkeleton() {
  return (<div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 p-1">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  
  // ALL HOOKS AT TOP LEVEL - SKELETON-FIRST PATTERN
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

  // Progressive data loading
  useEffect(() => {
    const loadSettingsData = () => {
      // Simulate loading user settings from localStorage/API
      try {
        const savedNotifications = localStorage.getItem('ezyify_notification_settings');
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
        
        const savedPrivacy = localStorage.getItem('ezyify_privacy_settings');
        if (savedPrivacy) {
          setPrivacy(JSON.parse(savedPrivacy));
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
      
      setIsLoading(false);
    };

    // Use requestIdleCallback for non-blocking load
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadSettingsData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      setTimeout(loadSettingsData, 16);
    }
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Settings — Ezyify" description="Manage your Ezyify account settings, notifications, privacy, and security preferences." />
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto bg-card p-1 border border-border rounded-2xl gap-0.5">
            {[
              { value: 'account', icon: User, label: 'Account' },
              { value: 'notifications', icon: Bell, label: 'Notifications' },
              { value: 'privacy', icon: Shield, label: 'Privacy' },
              { value: 'security', icon: Lock, label: 'Security' },
              { value: 'payment', icon: CreditCard, label: 'Payment' },
              { value: 'appearance', icon: Moon, label: 'Appearance' },
              { value: 'help', icon: HelpCircle, label: 'Help' },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5 rounded-xl text-sm data-[state=active]:shadow-sm">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20 ring-2 ring-border">
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" />
                        <AvatarFallback className="text-lg font-bold bg-brand-gradient text-white">JD</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="mb-1.5">Change Photo</Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG or GIF · Max 5MB</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="@johndoe" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" defaultValue="Tech enthusiast | Content creator" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" autoComplete="email" defaultValue="john@example.com" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" autoComplete="tel" defaultValue="+1 (234) 567-8900" className="mt-1" />
                  </div>

                  <Button onClick={() => toast.success('Profile information saved')}>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="language" className="block text-sm">Language</label>
                    <select id="language" className="w-full mt-1 px-3 py-2 bg-input-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select id="timezone" className="w-full mt-1 px-3 py-2 bg-input-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      <option>America/New_York (GMT-5)</option>
                      <option>America/Los_Angeles (GMT-8)</option>
                      <option>Europe/London (GMT+0)</option>
                      <option>Asia/Tokyo (GMT+9)</option>
                    </select>
                  </div>
                  <Button onClick={() => toast.success('Language & region settings saved')}>Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-4">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-foreground">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(v) => setNotifications({ ...notifications, email: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-foreground">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(v) => setNotifications({ ...notifications, push: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-foreground">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive text messages</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(v) => setNotifications({ ...notifications, sms: v })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 text-foreground">Activity Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">Likes</p>
                        <p className="text-sm text-muted-foreground">When someone likes your content</p>
                      </div>
                      <Switch
                        checked={notifications.likes}
                        onCheckedChange={(v) => setNotifications({ ...notifications, likes: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">Comments</p>
                        <p className="text-sm text-muted-foreground">When someone comments on your posts</p>
                      </div>
                      <Switch
                        checked={notifications.comments}
                        onCheckedChange={(v) => setNotifications({ ...notifications, comments: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">New Followers</p>
                        <p className="text-sm text-muted-foreground">When someone follows you</p>
                      </div>
                      <Switch
                        checked={notifications.follows}
                        onCheckedChange={(v) => setNotifications({ ...notifications, follows: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">Purchase Updates</p>
                        <p className="text-sm text-muted-foreground">Order confirmations and shipping updates</p>
                      </div>
                      <Switch
                        checked={notifications.purchases}
                        onCheckedChange={(v) => setNotifications({ ...notifications, purchases: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground">Promotions & Offers</p>
                        <p className="text-sm text-muted-foreground">Special deals and discounts</p>
                      </div>
                      <Switch
                        checked={notifications.promotions}
                        onCheckedChange={(v) => setNotifications({ ...notifications, promotions: v })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              {/* Cookie & Data Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Cookie & Data Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/privacy-preferences" className="block p-4 border border-border rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Cookie className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Privacy & Cookie Settings</p>
                          <p className="text-sm text-muted-foreground">Manage how we use cookies and process your data</p>
                        </div>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              {/* Profile Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
                    </div>
                    <Switch
                      checked={privacy.profileVisible}
                      onCheckedChange={(v) => setPrivacy({ ...privacy, profileVisible: v })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground">Show Activity Status</p>
                      <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                    </div>
                    <Switch
                      checked={privacy.showActivity}
                      onCheckedChange={(v) => setPrivacy({ ...privacy, showActivity: v })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground">Show Purchase History</p>
                      <p className="text-sm text-muted-foreground">Display your purchases on your profile</p>
                    </div>
                    <Switch
                      checked={privacy.showPurchases}
                      onCheckedChange={(v) => setPrivacy({ ...privacy, showPurchases: v })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground">Allow Direct Messages</p>
                      <p className="text-sm text-muted-foreground">Let anyone send you messages</p>
                    </div>
                    <Switch
                      checked={privacy.allowMessages}
                      onCheckedChange={(v) => setPrivacy({ ...privacy, allowMessages: v })}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground">Allow Product Tags</p>
                      <p className="text-sm text-muted-foreground">Let others tag you in product posts</p>
                    </div>
                    <Switch
                      checked={privacy.allowTags}
                      onCheckedChange={(v) => setPrivacy({ ...privacy, allowTags: v })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" autoComplete="current-password" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" autoComplete="new-password" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" autoComplete="new-password" className="mt-1" />
                  </div>
                  <Button onClick={() => toast.success('Password updated successfully')}>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connected Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-2xl border border-border">
                      <div>
                        <p className="text-foreground">Chrome on Windows</p>
                        <p className="text-sm text-muted-foreground">Last active: 2 minutes ago</p>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">Current</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-2xl border border-border">
                      <div>
                        <p className="text-foreground">Safari on iPhone</p>
                        <p className="text-sm text-muted-foreground">Last active: 2 hours ago</p>
                      </div>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full text-destructive border-destructive/50 hover:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out of All Devices
                  </Button>
                  <Button variant="outline" className="w-full text-destructive border-destructive/50 hover:bg-destructive/10">
                    Deactivate Account
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment */}
          <TabsContent value="payment">
            <div className="space-y-6">
              {/* Commerce Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Commerce</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/wallet" className="block p-4 border border-border rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Wallet</p>
                          <p className="text-sm text-muted-foreground">Manage your balance and transactions</p>
                        </div>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </Link>
                  
                  <Link to="/orders" className="block p-4 border border-border rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Orders</p>
                          <p className="text-sm text-muted-foreground">View and track your orders</p>
                        </div>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-card">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-foreground">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Street Address" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="City" />
                    <Input placeholder="ZIP Code" />
                  </div>
                  <Button onClick={() => toast.success('Address saved successfully')}>Save Address</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Theme picker */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Light', value: 'light', icon: Sun, preview: 'bg-white border-border' },
                      { label: 'Dark', value: 'dark', icon: Moon, preview: 'bg-[#0d0f1a] border-[#252a3d]' },
                    ].map(({ label, value, icon: Icon, preview }) => (
                      <button
                        key={value}
                        onClick={() => theme !== value && toggleTheme()}
                        className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-150 ${
                          theme === value
                            ? 'border-primary bg-primary/5 shadow-brand'
                            : 'border-border hover:border-border-strong bg-card'
                        }`}
                      >
                        {/* Preview swatch */}
                        <div className={`w-full h-16 rounded-xl border ${preview} flex items-center justify-center overflow-hidden`}>
                          <div className={`w-8 h-2 rounded-full ${value === 'light' ? 'bg-border' : 'bg-white/10'} mb-1`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${theme === value ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-semibold ${theme === value ? 'text-primary' : 'text-foreground'}`}>{label}</span>
                        </div>
                        {theme === value && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted border border-border">
                    <div className="flex items-center gap-2.5">
                      {theme === 'dark' ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <p className="text-sm font-medium text-foreground">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'} Active</p>
                        <p className="text-xs text-muted-foreground">Toggle to switch instantly</p>
                      </div>
                    </div>
                    <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Help */}
          <TabsContent value="help">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {[
                      { to: '/help', icon: HelpCircle, label: 'Help Center', desc: 'Browse FAQs and support articles' },
                      { to: '/legal/terms', icon: FileText, label: 'Terms of Service', desc: 'Read our terms and conditions' },
                      { to: '/legal/privacy', icon: Shield, label: 'Privacy Policy', desc: 'Learn how we protect your data' },
                    ].map(({ to, icon: Icon, label, desc }) => (
                      <Link key={to} to={to}
                        className="flex items-center justify-between p-3.5 border border-border rounded-xl hover:bg-muted hover:border-border-strong transition-all duration-150 group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{label}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                        </div>
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">→</span>
                      </Link>
                    ))}
                    
                    <Link to="/commission-policy" className="block p-4 border border-border rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">Platform Fees & Commission Policy</p>
                            <p className="text-sm text-muted-foreground">Understand our fee structure</p>
                          </div>
                        </div>
                        <span className="text-muted-foreground">→</span>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}