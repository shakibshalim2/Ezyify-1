import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { Shield, Lock, Smartphone, Key, AlertTriangle, CheckCircle, Mail, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { useState, useEffect } from 'react';

// Skeleton Component
function SecuritySettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>
      </div>

      {/* Security Status Skeleton */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SecuritySettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showSessions, setShowSessions] = useState(false);

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const activeSessions = [
    {
      device: 'Chrome on Windows',
      location: 'San Francisco, CA',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      device: 'iPhone 14 Pro',
      location: 'San Francisco, CA',
      lastActive: '1 hour ago',
      current: false
    },
    {
      device: 'Safari on Mac',
      location: 'Oakland, CA',
      lastActive: '3 days ago',
      current: false
    }
  ];

  // Show skeleton while loading
  if (isLoading) {
    return <SecuritySettingsSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <SEO title="Security Settings — Ezyify" description="Manage your account security, two-factor authentication, and login activity on Ezyify." />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-error" />
          </div>
          <div>
            <h1 className="text-3xl">Security Settings</h1>
            <p className="text-muted-foreground">Keep your account safe and secure</p>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <Card className="mb-6 border-success/30 bg-success/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Your Account is Secure</h3>
              <p className="text-sm text-muted-foreground">
                Last security check: Today at 2:30 PM
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password
          </CardTitle>
          <CardDescription>
            Change your password regularly to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
            />
          </div>
          <div className="p-3 bg-muted rounded-xl">
            <p className="text-sm mb-2">Password requirements:</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character</li>
            </ul>
          </div>
          <Button onClick={() => toast.success('Password updated successfully')}>Change Password</Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="2fa-toggle" className="text-base">Enable Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require a verification code in addition to your password
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          {twoFactorEnabled && (
            <>
              <Separator />
              <div className="space-y-4 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <h4 className="font-semibold">Choose 2FA Method:</h4>
                <div className="space-y-3">
                  <button className="w-full p-4 bg-card border border-border rounded-2xl text-left hover:bg-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Authenticator App</p>
                        <p className="text-sm text-muted-foreground">Use Google Authenticator or similar app</p>
                      </div>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-card border border-border rounded-2xl text-left hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Verification</p>
                        <p className="text-sm text-muted-foreground">Receive codes via email</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Login Alerts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Login Alerts
          </CardTitle>
          <CardDescription>
            Get notified of suspicious login activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="login-alerts" className="text-base">Email Alerts for New Logins</Label>
              <p className="text-sm text-muted-foreground">
                Receive an email when someone logs in from a new device
              </p>
            </div>
            <Switch
              id="login-alerts"
              checked={loginAlerts}
              onCheckedChange={setLoginAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Devices currently logged into your account
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSessions(!showSessions)}
            >
              {showSessions ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {showSessions && (
          <CardContent className="space-y-4">
            {activeSessions.map((session, idx) => (
              <div key={idx} className="p-4 bg-muted rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{session.device}</p>
                        {session.current && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                      <p className="text-xs text-muted-foreground">Last active: {session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => toast.success('Session signed out')}>
                      Log Out
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => toast.success('All other sessions signed out')}>
              Log Out All Other Sessions
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Recovery Options */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Account Recovery
          </CardTitle>
          <CardDescription>
            Set up recovery options in case you lose access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Recovery Email</p>
              <Badge variant="secondary">Verified</Badge>
            </div>
            <p className="text-sm text-muted-foreground">user@example.com</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => toast.success('Verification email sent to your new address')}>
              Change Email
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Recovery Phone</p>
              <Badge variant="outline">Not Set</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toast.info('Enter your phone number to add it as a recovery option')}>
              Add Phone Number
            </Button>
          </div>

          <div className="p-4 bg-warning/8 rounded-2xl border border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Backup Codes</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Generate backup codes to access your account if you lose your 2FA device
                </p>
                <Button variant="outline" size="sm" onClick={() => toast.success('Backup codes generated — save them somewhere safe')}>
                  Generate Backup Codes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-error">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border border-error/30 rounded-xl">
            <h4 className="font-semibold mb-1">Deactivate Account</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Temporarily disable your account. You can reactivate anytime.
            </p>
            <Button variant="outline" className="text-warning hover:bg-warning/5 hover:text-orange-700" onClick={() => { if (window.confirm('Temporarily deactivate your account? You can reactivate anytime.')) { toast.info('Account deactivated. You can reactivate by logging in again.'); } }}>
              Deactivate Account
            </Button>
          </div>

          <div className="p-4 border border-error/30 rounded-xl bg-error/5">
            <h4 className="font-semibold mb-1 text-error">Delete Account</h4>
            <p className="text-sm text-error mb-3">
              Permanently delete your account and all data. This cannot be undone.
            </p>
            <Button variant="outline" className="text-error hover:bg-error/10 hover:text-error border-error/30" onClick={() => { if (window.confirm('Permanently delete your account? This CANNOT be undone.')) { if (window.confirm('Are you absolutely sure? All your data will be lost forever.')) { toast.error('Account deletion requested. You will receive a confirmation email.'); } } }}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}