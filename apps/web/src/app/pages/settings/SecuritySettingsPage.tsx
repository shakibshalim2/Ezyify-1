import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Lock, LogOut, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Field } from '../../components/primitives/Field';
import { useMutation } from '@tanstack/react-query';
import { formErrors } from '../../lib/apiErrors';
import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { ApiError, ChangePasswordRequestSchema, useApi, useRevokeSession, useSessions, type ChangePasswordRequest } from '@ezyify/core';
import { TwoFactorSection } from './TwoFactorSection';

export default function SecuritySettingsPage() {
  const navigate = useNavigate();
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const api = useApi();
  const changePassword = useMutation({ mutationFn: (body: ChangePasswordRequest) => api.auth.changePassword(body) });

  const closePasswordDialog = () => { setShowChangePasswordDialog(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwErrors({}); };
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) return void setPwErrors({ confirmPassword: 'Passwords do not match' });
    const parsed = ChangePasswordRequestSchema.safeParse({ currentPassword, newPassword });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0] ?? '_')] ??= i.message;
      return void setPwErrors(next);
    }
    setPwErrors({});
    changePassword.mutate(parsed.data, {
      onSuccess: () => { toast.success('Password changed — other devices were signed out'); closePasswordDialog(); },
      onError: err => {
        const f = formErrors(err);
        if (err instanceof ApiError && err.code === 'UNAUTHORIZED') setPwErrors({ currentPassword: f.message ?? 'Incorrect current password' });
        else if (Object.keys(f.fields).length) setPwErrors(f.fields);
        else toast.error(f.message ?? 'Could not change password');
      },
    });
  };

  const sessions = useSessions();
  const revoke = useRevokeSession();
  const describeAgent = (ua: string | null) => {
    if (!ua) return 'Unknown device';
    if (/ezyify|okhttp|expo/i.test(ua)) return 'Ezyify Android app';
    const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : '';
    return os ? `${browser} on ${os}` : browser;
  };
  const relative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.round(diff / 60_000);
    if (m < 2) return 'Just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    if (h < 48) return `${h} h ago`;
    return `${Math.round(h / 24)} days ago`;
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

        <TwoFactorSection />

        {/* Active Sessions */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Sessions
          </h2>
          <Card className="border-border">
            <CardContent className="pt-6 space-y-3">
              {sessions.isLoading && <p className="text-sm text-foreground-secondary">Loading your devices…</p>}
              {sessions.isError && <p className="text-sm text-error">Couldn’t load sessions. Try again later.</p>}
              {sessions.isSuccess && sessions.data.length === 0 && <p className="text-sm text-foreground-secondary">Only this device is signed in.</p>}
              {(sessions.data ?? []).map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx, 5) * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {describeAgent(session.userAgent)}
                      {session.current && <span className="ml-2 rounded-full bg-success-subtle px-2 py-0.5 text-[11px] font-semibold text-success">This device</span>}
                    </p>
                    <p className="text-xs text-foreground-secondary">{session.ip ?? 'IP hidden'} • signed in {relative(session.createdAt)}</p>
                  </div>
                  {!session.current && (
                    <Button size="sm" variant="outline" aria-label="Sign out this device" disabled={revoke.isPending} onClick={() => revoke.mutate(session.id, { onSuccess: () => toast.success('Device signed out') })}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
              {(sessions.data?.length ?? 0) > 1 && (
                <Button variant="outline" size="sm" className="w-full" disabled={revoke.isPending} onClick={() => revoke.mutate(undefined, { onSuccess: () => toast.success('Signed out everywhere else') })}>
                  Sign out of all other devices
                </Button>
              )}
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
      <Dialog open={showChangePasswordDialog} onOpenChange={o => { if (!o) closePasswordDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              At least 8 characters with an uppercase letter, a lowercase letter and a number. Every other device is signed out afterwards.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" noValidate onSubmit={e => { e.preventDefault(); handleChangePassword(); }}>
            <Field label="Current password" type="password" autoComplete="current-password" value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); setPwErrors({}); }} error={pwErrors.currentPassword} required />
            <Field label="New password" type="password" autoComplete="new-password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setPwErrors({}); }} error={pwErrors.newPassword} required />
            <Field label="Confirm new password" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setPwErrors({}); }} error={pwErrors.confirmPassword} required />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closePasswordDialog} disabled={changePassword.isPending}>Cancel</Button>
              <Button type="submit" disabled={changePassword.isPending}>{changePassword.isPending ? 'Saving…' : 'Change password'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
