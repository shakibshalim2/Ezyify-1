import { SEO } from '../../components/SEO';
import { Link } from 'react-router';
import { Shield, Heart, AlertTriangle, Lock, Users, Eye, Flag, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

export default function SafetyPage() {
  return (
    <>
    <SEO
      title="Safety Center"
      description="Ezyify Safety Center. Learn how we keep our E-Commerce Social Media Ecosystem safe for all users, sellers, and creators."
    />
    <div className="max-w-4xl mx-auto px-4 pb-8">
      {/* Header */}
      <div className="py-20 text-white" style={{ background: "var(--brand-gradient)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl mb-3">Safety & Trust</h1>
        <p className="text-lg text-white/85 max-w-2xl mx-auto">
          Your safety is our top priority. We're committed to creating a secure environment 
          for content, commerce, and community on Ezyify.
        </p>
      </div>
      </div>

      <Alert className="mb-6 border-success/30 bg-success/5">
        <Heart className="w-5 h-5 text-success" />
        <AlertDescription className="text-success">
          Ezyify combines social features with commerce. We've built comprehensive safety measures 
          to protect your privacy, data, and well-being.
        </AlertDescription>
      </Alert>

      {/* Our Safety Commitments */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Our Safety Commitments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-info/8 border border-info/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-info" />
                <h3 className="font-semibold">Secure Transactions</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                All payments are encrypted and processed through certified payment providers. 
                We never store your full payment details.
              </p>
            </div>

            <div className="p-4 bg-primary/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Verified Sellers</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                All sellers must complete identity verification (KYC) before listing products. 
                Fake or anonymous sellers are not allowed.
              </p>
            </div>

            <div className="p-4 bg-success/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-success" />
                <h3 className="font-semibold">Content Moderation</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Our team reviews reported content 24/7. AI and human moderators work together 
                to remove harmful content quickly.
              </p>
            </div>

            <div className="p-4 bg-warning/5 dark:bg-warning/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-warning" />
                <h3 className="font-semibold">Privacy Protection</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your personal data is encrypted and never sold to third parties. 
                You control what information you share.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Features */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Built-in Safety Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Flag className="w-4 h-4 text-error" />
              Report & Block Tools
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Every post, profile, and message has a report button. You can also:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• Block users to prevent them from contacting you</li>
              <li>• Mute users to hide their content from your feed</li>
              <li>• Report inappropriate content, scams, or harassment</li>
              <li>• Appeal if your content was incorrectly removed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-info" />
              Privacy Controls
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• Set your account to private (approve followers)</li>
              <li>• Control who can message you</li>
              <li>• Hide your online status</li>
              <li>• Limit who can see your posts and stories</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              Purchase Protection
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• Money-back guarantee for eligible orders</li>
              <li>• Dispute resolution for order issues</li>
              <li>• Secure escrow system (payment released after delivery)</li>
              <li>• Verified product reviews only from actual buyers</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Specific Safety Topics */}
      <Card className="mb-6 border-error/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-error">
            <AlertTriangle className="w-5 h-5" />
            Recognizing Common Threats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">🚨 Scams & Fraud</h3>
            <p className="text-sm text-muted-foreground mb-2">Warning signs:</p>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• Sellers asking for payment outside the platform</li>
              <li>• "Too good to be true" prices or deals</li>
              <li>• Requests for personal information (passwords, bank details)</li>
              <li>• Phishing links or suspicious messages</li>
              <li>• Fake customer support accounts</li>
            </ul>
          </div>

          <Alert className="border-error/30 bg-error/5">
            <AlertDescription className="text-error">
              <strong>Never:</strong> Share your password, send money outside Ezyify, or click suspicious links. 
              Our support team will NEVER ask for your password or payment details via message.
            </AlertDescription>
          </Alert>

          <div>
            <h3 className="font-semibold mb-2">⚠️ Harassment & Bullying</h3>
            <p className="text-sm text-muted-foreground">
              We have zero tolerance for harassment, hate speech, or bullying. Report any threatening, 
              abusive, or hateful behavior immediately.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🔞 Minor Safety</h3>
            <p className="text-sm text-muted-foreground">
              Users must be 13+ years old. We use automated systems to detect and remove accounts 
              of underage users. Parents should supervise teen accounts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How to Stay Safe */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tips to Stay Safe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">🛡️ Account Security</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Use a strong, unique password</li>
                <li>✓ Enable two-factor authentication</li>
                <li>✓ Don't share your login credentials</li>
                <li>✓ Log out on shared devices</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">💬 Smart Communication</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Keep conversations on platform</li>
                <li>✓ Don't share personal contact info publicly</li>
                <li>✓ Be cautious with strangers</li>
                <li>✓ Report suspicious messages</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🛒 Safe Shopping</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Check seller ratings and reviews</li>
                <li>✓ Read product descriptions carefully</li>
                <li>✓ Only pay through Ezyify checkout</li>
                <li>✓ Save order confirmation details</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📸 Content Sharing</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Think before you post</li>
                <li>✓ Don't share sensitive information</li>
                <li>✓ Respect others' privacy</li>
                <li>✓ Use privacy settings wisely</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crisis Resources */}
      <Card className="mb-6 border-info/30 bg-info/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Crisis Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If you or someone you know is in immediate danger or experiencing a crisis:
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Emergency Services:</strong> 911 (US) or your local emergency number</p>
            <p><strong>Suicide Prevention Hotline:</strong> 988 (US)</p>
            <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
            <p><strong>National Domestic Violence Hotline:</strong> 1-800-799-7233</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Safety Team */}
      <div className="text-center space-y-4">
        <div>
          <Button size="lg">
            <Shield className="w-5 h-5 mr-2" />
            Report a Safety Concern
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Safety emergencies: <a href="mailto:safety@ezyify.app" className="text-primary hover:underline font-medium">safety@ezyify.app</a>
        </p>
        <p className="text-sm text-muted-foreground">
          For law enforcement: See our <Link to="/safety-trust" className="text-primary hover:underline">Safety &amp; Trust Guidelines</Link>
        </p>
      </div>
    </div>
    </>
  );
}