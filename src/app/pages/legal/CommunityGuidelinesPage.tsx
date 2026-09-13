import { SEO } from '../../components/SEO';
import { Shield, Heart, Users, AlertTriangle, Ban, Star, Flag, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function CommunityGuidelinesPage() {
  return (
    <>
    <SEO
      title="Community Guidelines"
      description="Ezyify Community Guidelines — the rules that keep our E-Commerce Social Media Ecosystem safe, respectful, and vibrant."
    />
    <div className="max-w-4xl mx-auto px-4 pb-8">
      {/* Header */}
      <div className="py-20 text-white" style={{ background: "var(--brand-gradient)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl mb-3">Community Guidelines</h1>
        <p className="text-lg text-white/85 max-w-2xl mx-auto">
          Ezyify is a social-first commerce platform built on trust, creativity, and respect. 
          These guidelines help us maintain a safe and thriving community for everyone.
        </p>
        <p className="text-sm text-white/70 mt-2">Last Updated: January 4, 2026</p>
      </div>
      </div>

      <Alert className="mb-6 border-primary/25 bg-primary/10">
        <Heart className="w-5 h-5 text-primary" />
        <AlertDescription className="text-primary">
          Our mission: Create a space where content, creators, and commerce thrive together in a safe, authentic environment.
        </AlertDescription>
      </Alert>

      {/* Core Principles */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Our Core Principles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-info/5 rounded-2xl border border-info/30">
              <h3 className="font-semibold mb-2 text-foreground">🤝 Be Authentic</h3>
              <p className="text-sm text-muted-foreground">Share genuine content and honest reviews. Build trust with your community.</p>
            </div>
            <div className="p-4 bg-success/5 rounded-2xl border border-success/30">
              <h3 className="font-semibold mb-2 text-foreground">💙 Be Respectful</h3>
              <p className="text-sm text-muted-foreground">Treat everyone with kindness. Harassment and hate have no place here.</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/25">
              <h3 className="font-semibold mb-2 text-foreground">🛡️ Be Safe</h3>
              <p className="text-sm text-muted-foreground">Protect yourself and others. Report harmful content immediately.</p>
            </div>
            <div className="p-4 bg-warning/5 dark:bg-warning/5 rounded-2xl border border-warning/30">
              <h3 className="font-semibold mb-2 text-foreground">✨ Be Creative</h3>
              <p className="text-sm text-muted-foreground">Express yourself freely while respecting intellectual property rights.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Allowed */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Users className="w-5 h-5" />
            What We Encourage ✅
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-success mt-1">✓</span>
              <div className="text-foreground">
                <strong>Authentic Product Reviews:</strong> <span className="text-muted-foreground">Share honest opinions about products you've used</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-1">✓</span>
              <div className="text-foreground">
                <strong>Creative Content:</strong> <span className="text-muted-foreground">Original photos, videos, and posts that inspire others</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-1">✓</span>
              <div className="text-foreground">
                <strong>Meaningful Engagement:</strong> <span className="text-muted-foreground">Thoughtful comments and genuine interactions</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-1">✓</span>
              <div className="text-foreground">
                <strong>Educational Content:</strong> <span className="text-muted-foreground">Tutorials, tips, and how-to guides</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-1">✓</span>
              <div className="text-foreground">
                <strong>Transparent Commerce:</strong> <span className="text-muted-foreground">Clear product tagging and honest affiliate disclosures</span>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* What's Not Allowed */}
      <Card className="mb-6 border-error/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-error">
            <Ban className="w-5 h-5" />
            What's Not Allowed ❌
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-error mb-2">🚫 Harmful Content</h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Hate speech, discrimination, or harassment based on race, gender, religion, etc.</li>
                <li>• Violence, threats, or content promoting self-harm</li>
                <li>• Sexual exploitation or nudity</li>
                <li>• Dangerous activities or illegal behavior</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-error mb-2">⚠️ Deceptive Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Fake reviews or paid testimonials without disclosure</li>
                <li>• Counterfeit or fraudulent products</li>
                <li>• Misleading product information or pricing</li>
                <li>• Impersonation or fake accounts</li>
                <li>• Manipulation of affiliate earnings or platform systems</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-error mb-2">📜 Intellectual Property Violations</h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Using copyrighted content without permission</li>
                <li>• Trademark infringement</li>
                <li>• Selling counterfeit branded goods</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-error mb-2">🔒 Privacy & Safety</h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Sharing personal information without consent</li>
                <li>• Doxxing or stalking behavior</li>
                <li>• Spam, phishing, or malicious links</li>
                <li>• Minors without parental consent (users must be 13+)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commerce-Specific Guidelines */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Commerce & Affiliate Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Ezyify is a social-first commerce platform. Here's what you need to know:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground ml-4">
            <li>• <strong className="text-foreground">Sellers must verify their identity</strong> before listing products (KYC required)</li>
            <li>• <strong className="text-foreground">Product tags must be accurate</strong> - tag only products shown in your content</li>
            <li>• <strong className="text-foreground">Affiliate earnings work only in-platform</strong> - no external link manipulation</li>
            <li>• <strong className="text-foreground">Platform commission is automatic</strong> - applies to all sales (category-based)</li>
            <li>• <strong className="text-foreground">Disclose partnerships</strong> - clearly mark sponsored or brand partnership content</li>
            <li>• <strong className="text-foreground">No fake scarcity</strong> - don't manipulate urgency with false "limited stock" claims</li>
            <li>• <strong className="text-foreground">Honest pricing</strong> - no misleading discounts or fake original prices</li>
          </ul>
        </CardContent>
      </Card>

      {/* Reporting & Enforcement */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Reporting & Enforcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-foreground">How to Report Violations</h3>
            <p className="text-sm text-muted-foreground mb-2">
              If you see content that violates these guidelines:
            </p>
            <ol className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>1. Click the "Report" button on the post/profile</li>
              <li>2. Select the violation type</li>
              <li>3. Provide additional context if needed</li>
              <li>4. Our team will review within 24-48 hours</li>
            </ol>
          </div>

          <Alert>
            <AlertTriangle className="w-5 h-5" />
            <AlertDescription>
              <strong className="text-foreground">Consequences of Violations:</strong> <span className="text-muted-foreground">Depending on severity, we may issue warnings, 
              temporarily suspend accounts, restrict features, or permanently ban users. Repeat offenders 
              and serious violations result in immediate action.</span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          These guidelines may be updated periodically. Continued use of Ezyify means you accept the latest version.
        </p>
        <p>
          Questions? Contact us at <a href="mailto:community@ezyify.com" className="text-primary hover:underline">community@ezyify.com</a>
        </p>
      </div>
    </div>
    </>
  );
}