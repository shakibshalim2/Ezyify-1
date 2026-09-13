import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Lock, Smartphone, LogOut, AlertCircle, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function SecuritySettingsPage() {
  const navigate = useNavigate();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setShowChangePasswordDialog(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEnableTwoFactor = () => {
    if (!twoFactorEnabled) {
      toast.success('Two-factor authentication enabled');
    } else {
      toast.success('Two-factor authentication disabled');
    }
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const SecurityOption = ({
    icon: Icon,
    title,
    description,
    action,
  }: {
    icon: any;
    title: string;
    description: string;
    action?: React.ReactNode;
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
          <p className="font-medium text-foreground text-sm">{title}</p>
          <p className="text-xs text-foreground-secondary">{description}</p>
        </div>
      </div>
      {action}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Security Settings — Ezyify" />

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
            <h1 className="font-display text-xl font-semibold text-foreground">Security Settings</h1>
            <p className="text-xs text-foreground-secondary">Protect your account and data</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Password */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password
          </h2>
          <Card className="border-border">
            <CardContent className="pt-6">
              <SecurityOption
                icon={Lock}
                title="Change Password"
                description="Update your password regularly for better security"
                action={
                  <Button
                    onClick={() => setShowChangePasswordDialog(true)}
                    size="sm"
                    variant="outline"
                  >
                    Change
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Two-Factor Authentication */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication
          </h2>
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <SecurityOption
                icon={Smartphone}
                title="Authenticator App"
                description={twoFactorEnabled ? 'Enabled' : 'Use an app like Google Authenticator'}
                action={
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleEnableTwoFactor}
                  />
                }
              />
              <div className="p-3 bg-info/5 border border-info/40 rounded-lg">
                <p className="text-xs text-foreground-secondary">
                  Two-factor authentication adds an extra layer of security to your account. You'll need a code from your authenticator app when signing in.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Sessions
          </h2>
          <Card className="border-border">
            <CardContent className="pt-6 space-y-3">
              {[
                { device: 'Chrome on MacOS', location: 'New York, US', lastActive: 'Now' },
                { device: 'Safari on iPhone', location: 'New York, US', lastActive: '2 hours ago' },
                { device: 'Chrome on Windows', location: 'New York, US', lastActive: '3 days ago' },
              ].map((session, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{session.device}</p>
                    <p className="text-xs text-foreground-secondary">{session.location} • {session.lastActive}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-error" />
            Danger Zone
          </h2>
          <Card className="border-error/40 bg-error/5">
            <CardContent className="pt-6 space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 rounded-lg border border-error/40"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">Delete Account</p>
                  <p className="text-xs text-foreground-secondary">Permanently delete your account and all data</p>
                </div>
                <Button
                  onClick={() => toast.error('Account deletion is irreversible')}
                  size="sm"
                  variant="outline"
                  className="border-error/40 text-error hover:bg-error/5"
                >
                  Delete
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below. Make sure it's at least 8 characters long.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
