import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Eye, Users, Lock, Globe, MessageSquare, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { SEO } from '../../components/SEO';
import { motion } from 'motion/react';

interface PrivacySettings {
  [key: string]: boolean;
}

export default function PrivacySettingsPage() {
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profilePublic: true,
    showActivity: true,
    showPurchases: false,
    allowMessages: true,
    allowTags: true,
    allowSearchEngines: true,
  });

  const togglePrivacy = (key: string) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    localStorage.setItem('ezyify_privacy_settings', JSON.stringify(updated));
  };

  const PrivacyRow = ({
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
        checked={privacy[settingKey]}
        onCheckedChange={() => togglePrivacy(settingKey)}
      />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Privacy Settings — Ezyify" />

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
            <h1 className="font-display text-xl font-semibold text-foreground">Privacy Settings</h1>
            <p className="text-xs text-foreground-secondary">Control who can see your profile and content</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Visibility */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Profile
          </h2>
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              <PrivacyRow
                icon={Globe}
                label="Public Profile"
                description="Anyone can view your profile and posts"
                settingKey="profilePublic"
              />
              <PrivacyRow
                icon={Users}
                label="Activity Status"
                description="Others can see when you're online"
                settingKey="showActivity"
              />
              <PrivacyRow
                icon={UserCheck}
                label="Show Purchases"
                description="Others can see your purchase history"
                settingKey="showPurchases"
              />
            </CardContent>
          </Card>
        </div>

        {/* Interactions */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Interactions
          </h2>
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              <PrivacyRow
                icon={MessageSquare}
                label="Direct Messages"
                description="Allow others to send you private messages"
                settingKey="allowMessages"
              />
              <PrivacyRow
                icon={Users}
                label="Mentions & Tags"
                description="Allow others to tag you in posts"
                settingKey="allowTags"
              />
            </CardContent>
          </Card>
        </div>

        {/* Search & Discovery */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Discovery
          </h2>
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              <PrivacyRow
                icon={Globe}
                label="Search Engines"
                description="Allow search engines to index your profile"
                settingKey="allowSearchEngines"
              />
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="border-border bg-info/5 border-info/40">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-foreground mb-2">Privacy & Data</h3>
            <p className="text-sm text-foreground-secondary mb-4">
              Your privacy is important to us. Learn how we collect, use, and protect your data.
            </p>
            <div className="flex gap-2">
              <a href="/privacy-policy" className="text-sm text-primary hover:underline">
                Privacy Policy
              </a>
              <span className="text-foreground-secondary">•</span>
              <a href="/legal/terms" className="text-sm text-primary hover:underline">
                Terms of Service
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
