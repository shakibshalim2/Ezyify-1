import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { Shield, Eye, Users, Lock, Globe, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { useState, useEffect } from 'react';

// Skeleton Component
function PrivacySettingsSkeleton() {
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
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-64" />
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

export default function PrivacySettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    privateAccount: false,
    showOnlineStatus: true,
    allowTagging: true,
    showActivity: true,
    allowComments: 'everyone',
    allowMessages: 'everyone',
    allowMentions: 'everyone',
    showFollowers: true,
    showFollowing: true,
    showLikedPosts: false,
    showPurchaseHistory: false,
    shareDataAnalytics: true,
    personalizedAds: true,
    showInSearch: true,
    allowDuet: true,
    allowStitch: true
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
    return <PrivacySettingsSkeleton />;
  }

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <SEO title="Privacy Settings — Ezyify" description="Control your privacy and data settings on Ezyify." />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl">Privacy Settings</h1>
            <p className="text-muted-foreground">Control who sees your content and how your data is used</p>
          </div>
        </div>
      </div>

      {/* Account Privacy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Account Privacy
          </CardTitle>
          <CardDescription>
            Control who can see your profile and content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="private-account" className="text-base">Private Account</Label>
              <p className="text-sm text-muted-foreground">
                Only approved followers can see your posts and stories
              </p>
            </div>
            <Switch
              id="private-account"
              checked={settings.privateAccount}
              onCheckedChange={(checked) => updateSetting('privateAccount', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-online" className="text-base">Show Online Status</Label>
              <p className="text-sm text-muted-foreground">
                Let others see when you're active on Ezyify
              </p>
            </div>
            <Switch
              id="show-online"
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-activity" className="text-base">Show Activity Status</Label>
              <p className="text-sm text-muted-foreground">
                Show your recent activity (likes, comments, follows)
              </p>
            </div>
            <Switch
              id="show-activity"
              checked={settings.showActivity}
              onCheckedChange={(checked) => updateSetting('showActivity', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-in-search" className="text-base">Appear in Search Results</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to find your profile through search
              </p>
            </div>
            <Switch
              id="show-in-search"
              checked={settings.showInSearch}
              onCheckedChange={(checked) => updateSetting('showInSearch', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Interactions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Interactions
          </CardTitle>
          <CardDescription>
            Control who can interact with your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="allow-comments">Who can comment on your posts?</Label>
            <Select
              value={settings.allowComments}
              onValueChange={(value) => updateSetting('allowComments', value)}
            >
              <SelectTrigger id="allow-comments">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="followers">People I Follow</SelectItem>
                <SelectItem value="off">No One</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="allow-messages">Who can send you messages?</Label>
            <Select
              value={settings.allowMessages}
              onValueChange={(value) => updateSetting('allowMessages', value)}
            >
              <SelectTrigger id="allow-messages">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="followers">People I Follow</SelectItem>
                <SelectItem value="off">No One</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="allow-mentions">Who can mention you?</Label>
            <Select
              value={settings.allowMentions}
              onValueChange={(value) => updateSetting('allowMentions', value)}
            >
              <SelectTrigger id="allow-mentions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="followers">People I Follow</SelectItem>
                <SelectItem value="off">No One</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allow-tagging" className="text-base">Allow Product Tagging</Label>
              <p className="text-sm text-muted-foreground">
                Let others tag you in product posts
              </p>
            </div>
            <Switch
              id="allow-tagging"
              checked={settings.allowTagging}
              onCheckedChange={(checked) => updateSetting('allowTagging', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Content Settings
          </CardTitle>
          <CardDescription>
            Control how others can use your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allow-duet" className="text-base">Allow Duet</Label>
              <p className="text-sm text-muted-foreground">
                Let others create Duet videos with your content
              </p>
            </div>
            <Switch
              id="allow-duet"
              checked={settings.allowDuet}
              onCheckedChange={(checked) => updateSetting('allowDuet', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allow-stitch" className="text-base">Allow Stitch</Label>
              <p className="text-sm text-muted-foreground">
                Let others use clips from your videos
              </p>
            </div>
            <Switch
              id="allow-stitch"
              checked={settings.allowStitch}
              onCheckedChange={(checked) => updateSetting('allowStitch', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile Visibility */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Choose what information is visible on your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-followers" className="text-base">Show Followers Count</Label>
              <p className="text-sm text-muted-foreground">
                Display number of followers on your profile
              </p>
            </div>
            <Switch
              id="show-followers"
              checked={settings.showFollowers}
              onCheckedChange={(checked) => updateSetting('showFollowers', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-following" className="text-base">Show Following Count</Label>
              <p className="text-sm text-muted-foreground">
                Display number of people you follow
              </p>
            </div>
            <Switch
              id="show-following"
              checked={settings.showFollowing}
              onCheckedChange={(checked) => updateSetting('showFollowing', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-liked" className="text-base">Show Liked Posts</Label>
              <p className="text-sm text-muted-foreground">
                Let others see posts you've liked
              </p>
            </div>
            <Switch
              id="show-liked"
              checked={settings.showLikedPosts}
              onCheckedChange={(checked) => updateSetting('showLikedPosts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-purchases" className="text-base">Show Purchase History</Label>
              <p className="text-sm text-muted-foreground">
                Display products you've purchased on your profile
              </p>
            </div>
            <Switch
              id="show-purchases"
              checked={settings.showPurchaseHistory}
              onCheckedChange={(checked) => updateSetting('showPurchaseHistory', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Personalization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Data & Personalization
          </CardTitle>
          <CardDescription>
            Control how your data is used to improve your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="analytics" className="text-base">Share Analytics Data</Label>
              <p className="text-sm text-muted-foreground">
                Help improve Ezyify by sharing usage data
              </p>
            </div>
            <Switch
              id="analytics"
              checked={settings.shareDataAnalytics}
              onCheckedChange={(checked) => updateSetting('shareDataAnalytics', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="personalized-ads" className="text-base">Personalized Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Show products and content based on your interests
              </p>
            </div>
            <Switch
              id="personalized-ads"
              checked={settings.personalizedAds}
              onCheckedChange={(checked) => updateSetting('personalizedAds', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button size="lg" className="flex-1" onClick={() => toast.success('Privacy settings saved')}>
          Save Changes
        </Button>
        <Button size="lg" variant="outline" onClick={() => toast.info('Privacy settings reset to default')}>
          Reset to Default
        </Button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-xl">
        <p className="text-sm">
          <strong>Note:</strong> Some privacy settings may take up to 24 hours to fully apply. 
          Read our <Link to="/privacy" className="underline">Privacy Policy</Link> for more details.
        </p>
      </div>
    </div>
  );
}