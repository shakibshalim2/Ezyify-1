import { SEO } from '../../components/SEO';
import { FileText, AlertTriangle, Mail, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

export default function CopyrightPage() {
  return (
    <>
    <SEO
      title="Copyright Policy"
      description="Ezyify Copyright and Intellectual Property Policy. Learn how we protect creators and handle copyright claims."
    />
    <div className="max-w-4xl mx-auto px-4 pb-8">
      {/* Header */}
      <div className="py-20 text-white" style={{ background: "var(--brand-gradient)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl mb-3">Copyright Policy</h1>
        <p className="text-lg text-white/85 max-w-2xl mx-auto">
          Ezyify respects intellectual property rights and expects all users to do the same.
        </p>
        <p className="text-sm text-white/70 mt-2">Last Updated: January 4, 2026</p>
      </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* DMCA Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              DMCA Policy
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Copyright law protects original works of authorship, including:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground ml-4">
            <li>• Videos, photos, and graphics</li>
            <li>• Music, sound recordings, and audio</li>
            <li>• Written content (blog posts, product descriptions)</li>
            <li>• Product designs and logos</li>
          </ul>
        </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Your Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-foreground">✅ What You Can Do:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Upload content you created yourself</li>
                <li>• Share content with explicit permission from the copyright owner</li>
                <li>• Use content under Creative Commons or similar licenses (following their terms)</li>
                <li>• Use content that falls under fair use (limited cases like commentary, criticism, parody)</li>
                <li>• Use royalty-free or public domain content</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-error">❌ What You Cannot Do:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Upload someone else's content without permission</li>
                <li>• Use copyrighted music in your videos without a license</li>
                <li>• Copy and repost photos, videos, or text from other creators</li>
                <li>• Sell counterfeit or unauthorized merchandise featuring copyrighted material</li>
                <li>• Download and re-upload content from other platforms</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* DMCA Takedown Process */}
        <Card className="mb-6 border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Filing a Copyright Complaint (DMCA Takedown)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you believe your copyrighted work has been used on Ezyify without permission, 
              you can file a DMCA takedown notice.
            </p>

            <div>
              <h3 className="font-semibold mb-2 text-foreground">Required Information:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>1. <strong className="text-foreground">Your contact information</strong> (name, address, email, phone)</li>
                <li>2. <strong className="text-foreground">Description of the copyrighted work</strong> you claim has been infringed</li>
                <li>3. <strong className="text-foreground">URL or location</strong> of the infringing content on Ezyify</li>
                <li>4. <strong className="text-foreground">Statement of good faith belief</strong> that the use is not authorized</li>
                <li>5. <strong className="text-foreground">Statement under penalty of perjury</strong> that the information is accurate</li>
                <li>6. <strong className="text-foreground">Your physical or electronic signature</strong></li>
              </ol>
            </div>

            <Alert>
              <Mail className="w-5 h-5" />
              <AlertDescription>
                <strong className="text-foreground">Send DMCA notices to:</strong><br />
                <a href="mailto:copyright@ezyify.com" className="text-info hover:underline">
                  copyright@ezyify.com
                </a><br />
                <span className="text-sm text-muted-foreground">
                  Or mail to: Ezyify Legal Department, Copyright Agent, [Address]
                </span>
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-warning/5 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <p className="text-sm text-warning">
                ⚠️ <strong>Warning:</strong> Filing false copyright claims may result in legal consequences. 
                Only submit a DMCA notice if you are the copyright owner or authorized to act on their behalf.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Counter-Notice */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Counter-Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If your content was removed due to a copyright claim and you believe it was removed by mistake 
              or misidentification, you may file a counter-notification.
            </p>

            <div>
              <h3 className="font-semibold mb-2 text-foreground">Counter-Notice Requirements:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>1. Your contact information</li>
                <li>2. Identification of the removed content and its location before removal</li>
                <li>3. Statement under penalty of perjury that you have a good faith belief the content was removed by mistake</li>
                <li>4. Consent to jurisdiction of your local federal court</li>
                <li>5. Your physical or electronic signature</li>
              </ol>
            </div>

            <p className="text-sm text-muted-foreground">
              Send counter-notices to the same email: <a href="mailto:copyright@ezyify.com" className="text-info hover:underline">copyright@ezyify.com</a>
            </p>
          </CardContent>
        </Card>

        {/* Repeat Infringer Policy */}
        <Card className="mb-6 border-error/30">
          <CardHeader>
            <CardTitle className="text-error">Repeat Infringer Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Ezyify has a zero-tolerance policy for repeat copyright infringers.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li>• <strong className="text-foreground">First violation:</strong> Content removed + warning issued</li>
              <li>• <strong className="text-foreground">Second violation:</strong> Temporary account suspension (7-30 days)</li>
              <li>• <strong className="text-foreground">Third violation:</strong> Permanent account termination</li>
            </ul>
            <Alert className="border-error/30 bg-error/5">
              <AlertDescription className="text-error">
                Accounts terminated for copyright violations will not be reinstated. 
                All earnings and account data will be forfeited.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center">
          <Button size="lg">
            <Mail className="w-5 h-5 mr-2" />
            Contact Copyright Team
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Questions about copyright? Email us at{' '}
            <a href="mailto:copyright@ezyify.com" className="text-primary hover:underline">
              copyright@ezyify.com
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}