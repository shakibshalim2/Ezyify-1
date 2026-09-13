import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { User, Power, Trash2, AlertTriangle, Download, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { useState, useEffect } from 'react';

// Skeleton Component
function AccountManagementSkeleton() {
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

      {/* Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AccountManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <AccountManagementSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <SEO title="Account Management — Ezyify" description="Manage your Ezyify account — download data, deactivate or delete your account." />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl">Account Management</h1>
            <p className="text-muted-foreground">Manage your account settings and data</p>
          </div>
        </div>
      </div>

      {/* Download Data */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Your Data
          </CardTitle>
          <CardDescription>
            Request a copy of all your Ezyify data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            You can download a copy of your Ezyify data including posts, comments, messages, 
            purchase history, and account information.
          </p>
          <div className="p-4 bg-info/10 border border-info/20 rounded-xl">
            <p className="text-sm mb-2">
              <strong>What's included:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Profile information and settings</li>
              <li>• Posts, loops, stories, and comments</li>
              <li>• Messages and conversations</li>
              <li>• Purchase and order history</li>
              <li>• Creator earnings data (if applicable)</li>
              <li>• Seller sales data (if applicable)</li>
            </ul>
          </div>
          <Alert>
            <Clock className="w-5 h-5" />
            <AlertDescription>
              Data exports can take 24-48 hours to prepare. We'll email you a download link when ready.
            </AlertDescription>
          </Alert>
          <Button>
            <Download className="w-5 h-5 mr-2" />
            Request Data Download
          </Button>
        </CardContent>
      </Card>

      {/* Deactivate Account */}
      <Card className="mb-6 border-warning/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <Power className="w-5 h-5" />
            Deactivate Account
          </CardTitle>
          <CardDescription>
            Temporarily disable your account (you can reactivate anytime)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">
            When you deactivate your account:
          </p>
          <ul className="text-sm text-foreground space-y-2 ml-4">
            <li>✓ Your profile will be hidden from other users</li>
            <li>✓ Your posts and content will be hidden (not deleted)</li>
            <li>✓ You won't receive notifications</li>
            <li>✓ Your seller/creator status will be paused</li>
            <li>✓ You can reactivate anytime by logging back in</li>
          </ul>
          
          <Alert className="border-warning/30 bg-warning/10 dark:bg-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <AlertDescription className="text-foreground">
              Active orders and pending payouts will still be processed during deactivation.
            </AlertDescription>
          </Alert>

          <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-warning hover:bg-warning/10 border-warning/30">
                Deactivate My Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate Account?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to temporarily deactivate your account?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-foreground">
                  Your account will be hidden but not deleted. You can reactivate anytime by logging back in.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="deactivate-password">Confirm your password</Label>
                  <Input
                    id="deactivate-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeactivateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-warning hover:bg-warning/90 dark:bg-warning dark:hover:bg-warning/90 text-white"
                    onClick={() => {
                      toast.success("Account deactivated. You can reactivate by logging in again.");
                      setShowDeactivateDialog(false);
                    }}
                  >
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all data (this cannot be undone)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-destructive/30 bg-destructive/10">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <AlertDescription className="text-foreground">
              <strong>Warning:</strong> This action is permanent and cannot be reversed. 
              All your data will be deleted within 30 days.
            </AlertDescription>
          </Alert>

          <p className="text-foreground">
            When you delete your account:
          </p>
          <ul className="text-sm text-foreground space-y-2 ml-4">
            <li>✗ Your profile will be permanently removed</li>
            <li>✗ All posts, videos, and content will be deleted</li>
            <li>✗ Your messages will be deleted</li>
            <li>✗ Your purchase history will be deleted</li>
            <li>✗ Creator/seller earnings will be forfeited (after payout)</li>
            <li>✗ You cannot use the same email/username again</li>
          </ul>

          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-foreground mb-2">
              <strong>Before deleting:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Download your data if you want to keep it</li>
              <li>• Complete or cancel any pending orders</li>
              <li>• Withdraw any remaining wallet balance</li>
              <li>• Cancel any active subscriptions</li>
            </ul>
          </div>

          <Separator />

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/30">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive">Permanently Delete Account?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="border-destructive/30 bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <AlertDescription className="text-foreground">
                    You will lose access to everything immediately. Data deletion completes within 30 days.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="delete-password">Confirm your password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delete-confirm">Type "DELETE" to confirm</Label>
                  <Input
                    id="delete-confirm"
                    placeholder="Type DELETE in capital letters"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => {
                      toast.success("Account deletion initiated. You will receive a confirmation email within 24 hours.");
                      setShowDeleteDialog(false);
                    }}
                  >
                    Delete Account Permanently
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Help */}
      <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-xl">
        <p className="text-sm">
          <strong>Need help?</strong> If you're having issues with your account, 
          try <Link to="/help" className="underline hover:text-primary">our Help Center</Link> or{' '}
          <Link to="/contact" className="underline hover:text-primary">contact support</Link> before deleting your account.
        </p>
      </div>
    </div>
  );
}