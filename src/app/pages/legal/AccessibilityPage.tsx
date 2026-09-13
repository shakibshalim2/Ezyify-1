import { Heart, Eye, Ear, Hand, Keyboard, Smartphone, Monitor, Users, Shield } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-8">
      <SEO title="Accessibility — Ezyify" description="Ezyify is committed to making our platform accessible to everyone." />
      {/* Header */}
      <div className="py-20 text-white" style={{ background: "var(--brand-gradient)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl mb-3">Accessibility Commitment</h1>
        <p className="text-lg text-white/85 max-w-2xl mx-auto">
          Ezyify is committed to making our social-first commerce platform accessible to everyone, 
          regardless of ability or disability.
        </p>
      </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Standards Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Accessibility Standards
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ezyify strives to meet or exceed the following accessibility standards:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground ml-4">
            <li>• <strong>WCAG 2.1 Level AA</strong> - Web Content Accessibility Guidelines</li>
            <li>• <strong>Section 508</strong> - US Federal accessibility requirements</li>
            <li>• <strong>EN 301 549</strong> - European accessibility standard</li>
            <li>• <strong>ADA</strong> - Americans with Disabilities Act compliance</li>
          </ul>
        </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle>Current Accessibility Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Visual Accessibility
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>Screen Reader Support</strong></p>
                  <p className="text-xs text-muted-foreground">Compatible with JAWS, NVDA, VoiceOver</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>Alt Text</strong></p>
                  <p className="text-xs text-muted-foreground">Image descriptions for all visual content</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>High Contrast Mode</strong></p>
                  <p className="text-xs text-muted-foreground">Enhanced color contrast for readability</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>Text Scaling</strong></p>
                  <p className="text-xs text-muted-foreground">Adjustable font sizes up to 200%</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>Color-Blind Friendly</strong></p>
                  <p className="text-xs text-muted-foreground">Not relying solely on color for information</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>Focus Indicators</strong></p>
                  <p className="text-xs text-muted-foreground">Clear visual focus for keyboard navigation</p>
                </div>
              </div>
            </div>

            {/* Audio/Hearing */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Ear className="w-5 h-5 text-primary" />
                Hearing Accessibility
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>Video Captions</strong></p>
                  <p className="text-xs text-muted-foreground">Closed captions for all video content</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>Auto-Generated Subtitles</strong></p>
                  <p className="text-xs text-muted-foreground">AI-powered captions for user videos</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>Visual Alerts</strong></p>
                  <p className="text-xs text-muted-foreground">Visual notifications for audio cues</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-sm"><strong>Transcript Support</strong></p>
                  <p className="text-xs text-muted-foreground">Text transcripts for audio/video</p>
                </div>
              </div>
            </div>

            {/* Motor/Physical */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Hand className="w-5 h-5 text-warning" />
                Motor & Physical Accessibility
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-3 bg-warning/8 rounded-xl">
                  <p className="text-sm"><strong>Keyboard Navigation</strong></p>
                  <p className="text-xs text-muted-foreground">Full site navigation without a mouse</p>
                </div>
                <div className="p-3 bg-warning/8 rounded-xl">
                  <p className="text-sm"><strong>Voice Control</strong></p>
                  <p className="text-xs text-muted-foreground">Compatible with voice control software</p>
                </div>
                <div className="p-3 bg-warning/8 rounded-xl">
                  <p className="text-sm"><strong>Large Touch Targets</strong></p>
                  <p className="text-xs text-muted-foreground">Easy-to-tap buttons (minimum 44x44px)</p>
                </div>
                <div className="p-3 bg-warning/8 rounded-xl">
                  <p className="text-sm"><strong>Switch Access</strong></p>
                  <p className="text-xs text-muted-foreground">Support for assistive switch devices</p>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span><kbd className="px-2 py-1 bg-card border border-border rounded">Tab</kbd></span>
                  <span>Navigate forward</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span><kbd className="px-2 py-1 bg-card border border-border rounded">Shift</kbd> + <kbd className="px-2 py-1 bg-card border border-border rounded">Tab</kbd></span>
                  <span>Navigate backward</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span><kbd className="px-2 py-1 bg-card border border-border rounded">Enter</kbd></span>
                  <span>Activate button/link</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span><kbd className="px-2 py-1 bg-card border border-border rounded">Esc</kbd></span>
                  <span>Close modal/dialog</span>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span><kbd className="px-2 py-1 bg-card border border-border rounded">Space</kbd></span>
                  <span>Play/pause video</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform-Specific Features */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Accessibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Mobile Apps</h3>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ TalkBack (Android) support</li>
                  <li>✓ VoiceOver (iOS) support</li>
                  <li>✓ Gesture-based navigation</li>
                  <li>✓ System font size respect</li>
                  <li>✓ Reduce motion support</li>
                </ul>
              </div>

              <div className="p-4 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Web Platform</h3>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Semantic HTML structure</li>
                  <li>✓ ARIA labels and landmarks</li>
                  <li>✓ Skip navigation links</li>
                  <li>✓ Responsive zoom support</li>
                  <li>✓ Browser accessibility API</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Known Limitations */}
        <Card className="mb-6 border-border bg-accent">
          <CardHeader>
            <CardTitle>Known Limitations & Ongoing Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We're actively working to improve the following areas:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• Enhanced live video accessibility (real-time captions)</li>
              <li>• Improved AR try-on features for screen reader users</li>
              <li>• More comprehensive alt text for user-generated content</li>
              <li>• Better support for cognitive accessibility</li>
              <li>• Sign language interpretation for key platform features</li>
            </ul>
          </CardContent>
        </Card>

        {/* Third-Party Content */}
        <Card>
          <CardHeader>
            <CardTitle>Third-Party & User-Generated Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              While we control our platform's accessibility, some content comes from third parties:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• We encourage creators to add alt text and captions to their content</li>
              <li>• Our AI auto-generates descriptions for images without alt text</li>
              <li>• Seller product descriptions are their responsibility, but we provide guidelines</li>
              <li>• We're developing tools to help creators make accessible content easily</li>
            </ul>
          </CardContent>
        </Card>

        {/* Feedback & Support */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Feedback & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We welcome your feedback on our accessibility efforts. If you encounter barriers 
              or have suggestions for improvement:
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-xl">
                <p className="font-semibold mb-1">Email our Accessibility Team:</p>
                <a href="mailto:accessibility@ezyify.com" className="text-primary hover:underline">
                  accessibility@ezyify.com
                </a>
              </div>

              <div className="p-4 bg-muted rounded-xl">
                <p className="font-semibold mb-1">Response Time:</p>
                <p className="text-sm text-muted-foreground">We aim to respond to accessibility inquiries within 2 business days</p>
              </div>

              <div className="p-4 bg-muted rounded-xl">
                <p className="font-semibold mb-1">Alternative Formats:</p>
                <p className="text-sm text-muted-foreground">
                  If you need information in an alternative format (large print, braille, audio), 
                  please contact us and we'll accommodate your request
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">
            This accessibility statement was last updated on January 4, 2026.
          </p>
          <p>
            We review and update our accessibility practices regularly as standards evolve.
          </p>
        </div>
      </div>
    </div>
  );
}