import { SEO } from '../../components/SEO';
import { Shield, Lock, Eye, UserCheck, AlertTriangle, CheckCircle2, ArrowLeft, Users, Flag, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Link } from 'react-router';

export default function SafetyTrustPage() {
  return (
    <>
    <SEO
      title="Safety <div Trust"
      description="How Ezyify ensures a trusted, secure E-Commerce Social Media Ecosystem for buyers, sellers, and creators."
    />
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-success/10 p-4 rounded-full">
              <Shield className="w-12 h-12 text-success" />
            </div>
          </div>
          <div>
            <h1 className="text-foreground">Safety & Trust</h1>
            <p className="text-muted-foreground mt-2">
              Your safety and trust are our highest priorities at Ezyify
            </p>
          </div>
        </div>

        {/* Our Commitment */}
        <Alert className="border-success/30 bg-success/5">
          <UserCheck className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            We are committed to creating a safe, trustworthy, and positive community. 
            Ensuring a secure and respectful environment for every user, creator, and seller is our responsibility.
          </AlertDescription>
        </Alert>

        {/* Safety Pillars */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h2 className="text-foreground">🛡️ Our Safety Pillars</h2>
            <Separator />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="bg-info/10 p-2 rounded-xl h-fit">
                  <Lock className="w-6 h-6 text-info" />
                </div>
                <div>
                  <h3 className="text-lg mb-1 text-foreground">Data Privacy</h3>
                  <p className="text-sm text-muted-foreground">
                    We use industry-leading encryption and security protocols to keep your personal information safe
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-xl h-fit">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg mb-1 text-foreground">Content Moderation</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered + human moderation team 24/7 detects and removes harmful content
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-success/10 p-2 rounded-xl h-fit">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg mb-1 text-foreground">Seller Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    All sellers must complete KYC verification. Fake or unverified sellers are blocked
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-warning/10 p-2 rounded-xl h-fit">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg mb-1 text-foreground">Easy Reporting</h3>
                  <p className="text-sm text-muted-foreground">
                    Easily report any inappropriate content or behavior and receive quick action
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Safety Features */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-foreground">🔒 Platform Safety Features</h2>
            <Separator />
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-xl">
                <h3 className="flex items-center gap-2 mb-2 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Account Security
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>• Two-factor authentication (2FA) support</li>
                  <li>• Login alerts and suspicious activity detection</li>
                  <li>• Secure password requirements</li>
                  <li>• Session management and device tracking</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-xl">
                <h3 className="flex items-center gap-2 mb-2 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-info" />
                  Privacy Controls
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>• Profile visibility settings (public/private/friends)</li>
                  <li>• Block and mute users</li>
                  <li>• Comment filtering and message controls</li>
                  <li>• Data download and account deletion options</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-xl">
                <h3 className="flex items-center gap-2 mb-2 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Commerce Safety
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>• Secure payment processing (PCI-DSS compliant)</li>
                  <li>• Buyer protection and refund policy</li>
                  <li>• Seller verification and rating system</li>
                  <li>• Transaction monitoring and fraud detection</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-xl">
                <h3 className="flex items-center gap-2 mb-2 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-warning" />
                  Content Safety
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>• AI-powered harmful content detection</li>
                  <li>• Age-appropriate content filtering</li>
                  <li>• Misinformation and fake news detection</li>
                  <li>• Copyright and IP protection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust & Transparency */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-foreground">
              <Users className="w-6 h-6 text-info" />
              Trust & Transparency
            </h2>
            <Separator />
            
            <div className="space-y-3">
              <div>
                <h3 className="mb-2 text-foreground">Our Transparency Commitment:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li>
                    • <strong className="text-foreground">Platform Commission:</strong> Automatic commission deduction from all sales 
                    (category-based, Amazon-style). Sellers and creators can view the earnings breakdown on their dashboard.
                  </li>
                  <li>
                    • <strong className="text-foreground">Affiliate Earnings:</strong> Commissions only from in-platform sharing. 
                    No earnings from external sharing.
                  </li>
                  <li>
                    • <strong className="text-foreground">Data Usage:</strong> How we use your data is clearly stated in our 
                    <Link to="/privacy" className="text-primary hover:underline mx-1">Privacy Policy</Link>.
                  </li>
                  <li>
                    • <strong className="text-foreground">Content Moderation:</strong> We publicly share statistics on removed content and banned accounts 
                    (quarterly transparency reports).
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting & Support */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-foreground">
              <Flag className="w-6 h-6 text-error" />
              Report and Get Help
            </h2>
            <Separator />
            
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-foreground">When to Report:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• Harassment, bullying, or hate speech</li>
                  <li>• Inappropriate, violent, or harmful content</li>
                  <li>• Scams, fraud, or fake products</li>
                  <li>• Copyright violation or stolen content</li>
                  <li>• Spam or fake accounts</li>
                  <li>• Any illegal activity</li>
                </ul>
              </div>

              <Alert className="border-error/30 bg-error/5">
                <AlertCircle className="h-4 w-4 text-error" />
                <AlertDescription className="text-error">
                  <strong>Emergency Situation:</strong> If you are in immediate danger or witness child exploitation, 
                  first contact local law enforcement (999), then report to us.
                </AlertDescription>
              </Alert>

              <div className="bg-info/5 p-4 rounded-2xl border border-info/30">
                <h3 className="mb-3 text-foreground">Report Process:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</div>
                    <p className="text-muted-foreground">Click the "Report" button on the Content/User</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</div>
                    <p className="text-muted-foreground">Select the violation type and provide details</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</div>
                    <p className="text-muted-foreground">Our team will review within 24-48 hours</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</div>
                    <p className="text-muted-foreground">Appropriate action will be taken and you will be updated</p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <Link to="/help">
                  <Button variant="outline" className="w-full">
                    Help Center
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-foreground">👥 Your Responsibilities</h2>
            <Separator />
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Every user has a role in creating a safe community. You can help by:
              </p>
              <ul className="space-y-1 ml-4">
                <li>• Following <Link to="/community-guidelines" className="text-primary hover:underline">Community Guidelines</Link></li>
                <li>• Reporting suspicious activity or harmful content</li>
                <li>• Using strong passwords and maintaining account security</li>
                <li>• Carefully sharing personal information</li>
                <li>• Interacting respectfully with others</li>
                <li>• Being aware of scams and phishing attempts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Safety Resources */}
        <Card className="bg-primary/10 border-primary/25">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-foreground">📚 Safety Resources</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Learn more:</p>
              <div className="flex flex-wrap gap-2">
                <Link to="/community-guidelines">
                  <Button variant="outline" size="sm">Community Guidelines</Button>
                </Link>
                <Link to="/privacy">
                  <Button variant="outline" size="sm">Privacy Policy</Button>
                </Link>
                <Link to="/terms">
                  <Button variant="outline" size="sm">Terms of Service</Button>
                </Link>
                <Link to="/copyright">
                  <Button variant="outline" size="sm">Copyright Policy</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground pb-8">
          <p className="mb-2">
            Together we can make Ezyify safer and better for everyone. 🤝
          </p>
          <p className="text-sm">
            If you have questions or concerns, visit our <Link to="/help" className="text-primary hover:underline">Help Center</Link>
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Last updated: January 14, 2026
          </p>
        </div>
      </div>
    </div>
    </>
  );
}