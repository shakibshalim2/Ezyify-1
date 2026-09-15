import { SEO } from '../components/SEO';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Shield, Cookie, BarChart3, Megaphone, Zap, CheckCircle2, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { saveCookiePreferences, getCookiePreferences, type CookiePreferences } from '../utils/cookiePreferences';
import { ALL_CONSENT, DEFAULT_CONSENT } from '../lib/consent';

const defaultPreferences: CookiePreferences = DEFAULT_CONSENT;

export default function PrivacyPreferencesPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const savedPreferences = getCookiePreferences();
    if (savedPreferences) {
      setPreferences(savedPreferences);
    }
  }, []);

  const handleToggle = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const apply = (next: CookiePreferences) => {
    saveCookiePreferences(next);
    setPreferences(next);
    setHasChanges(false);
    toast.success('Privacy preferences saved');
  };

  const handleSave = () => apply(preferences);
  const handleAcceptAll = () => apply(ALL_CONSENT);
  const handleRejectAll = () => apply(DEFAULT_CONSENT);

  return (<div className="min-h-screen bg-background pb-20">
      <SEO title="Privacy Preferences — Ezyify" description="Manage your data and privacy preferences on Ezyify." />
      {/* Header */}
      <div className="sticky lg:!top-16 z-40 bg-card/95 backdrop-blur-xl border-b border-border" style={{ top: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-semibold text-foreground">Privacy Preferences</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Your Privacy Matters
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Control how we use cookies and process your data. You can update these settings at any time.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <Button
            onClick={handleAcceptAll}
            className="bg-primary text-primary-foreground"
          >
            Accept All Cookies
          </Button>
          <Button
            variant="outline"
            onClick={handleRejectAll}
          >
            Reject All (Necessary Only)
          </Button>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-4 mb-8">
          {/* Necessary Cookies */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Cookie className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Necessary Cookies
                    </h3>
                    <span className="px-2 py-0.5 bg-muted text-foreground text-xs font-medium rounded-full">
                      Required
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Essential for the website to function properly. These cookies enable core functionality such as security, 
                    network management, and accessibility. Cannot be disabled.
                  </p>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-2xl p-3">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Examples:</strong> Authentication tokens, shopping cart, 
                      security settings, dark mode preference, language selection
                    </div>
                  </div>
                </div>
                <Switch
                  checked={true}
                  disabled
                  className="shrink-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analytics Cookies */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Analytics Cookies
                    </h3>
                    <span className="px-2 py-0.5 bg-muted text-foreground text-xs font-medium rounded-full">
                      Optional
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Help us understand how visitors interact with our platform by collecting and reporting information 
                    anonymously. This helps us improve our services and user experience.
                  </p>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-2xl p-3">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Examples:</strong> Page views, session duration, 
                      bounce rate, user flow analysis, feature usage statistics
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => handleToggle('analytics', checked)}
                  className="shrink-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Marketing Cookies */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Marketing Cookies
                    </h3>
                    <span className="px-2 py-0.5 bg-muted text-foreground text-xs font-medium rounded-full">
                      Optional
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Used to track visitors across websites to display relevant and engaging advertisements. 
                    Also help measure the effectiveness of advertising campaigns.
                  </p>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-2xl p-3">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Examples:</strong> Meta Pixel, TikTok Pixel, 
                      retargeting ads, conversion tracking, personalized ads
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => handleToggle('marketing', checked)}
                  className="shrink-0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Functional Cookies */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Functional Cookies
                    </h3>
                    <span className="px-2 py-0.5 bg-muted text-foreground text-xs font-medium rounded-full">
                      Optional
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enable enhanced functionality and personalization, such as language preferences, region selection, 
                    and customized recommendations based on your activity.
                  </p>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-2xl p-3">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Examples:</strong> Video player preferences, 
                      chat widget settings, personalized feed, saved filters
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.functional}
                  onCheckedChange={(checked) => handleToggle('functional', checked)}
                  className="shrink-0"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Changes Alert */}
        {hasChanges && (
          <Alert className="mb-6 bg-accent">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <AlertDescription className="text-foreground">
              You have unsaved changes. Click "Save Preferences" to apply your settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full sm:w-auto bg-primary text-primary-foreground"
            disabled={!hasChanges}
          >
            Save Preferences
          </Button>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="bg-muted border border-border rounded-xl p-6 text-center">
            <p className="text-sm text-foreground mb-3">
              📘 For more information about how we process your data
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/privacy">
                <Button variant="outline" size="sm">
                  Privacy Policy
                </Button>
              </Link>
              <Link to="/terms">
                <Button variant="outline" size="sm">
                  Terms of Service
                </Button>
              </Link>
              <Link to="/safety-trust">
                <Button variant="outline" size="sm">
                  Safety & Trust
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Consent Information */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Your consent will be stored for 1 year. You can change your preferences at any time.
            <br />
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}