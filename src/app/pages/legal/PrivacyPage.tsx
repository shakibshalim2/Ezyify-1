import { Link } from 'react-router';
import { SEO } from '../../components/SEO';
import { Shield, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Privacy Policy — Ezyify" description="Learn how Ezyify handles your personal data, privacy rights, and data protection." />
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-info" />
            <div>
              <h1 className="font-semibold text-foreground">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 4, 2024</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-8 prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Ezyify ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide</h3>
            <p>
              We collect information that you provide directly to us:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Name, username, email address, phone number, password, profile picture</li>
              <li><strong>Profile Information:</strong> Bio, interests, location, social media links</li>
              <li><strong>Content:</strong> Posts, comments, messages, photos, videos, and other content you create</li>
              <li><strong>Payment Information:</strong> Payment card details, billing address (processed by third-party payment processors)</li>
              <li><strong>Transaction Information:</strong> Purchase history, shipping addresses, order details</li>
              <li><strong>Communications:</strong> Messages to us, customer service inquiries, feedback</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>
              When you use the Platform, we automatically collect:
            </p>
            <ul>
              <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
              <li><strong>Usage Information:</strong> Pages viewed, features used, time spent, search queries</li>
              <li><strong>Location Information:</strong> Approximate location based on IP address or precise location if you grant permission</li>
              <li><strong>Cookies and Similar Technologies:</strong> We use cookies, pixels, and local storage to track activity</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>
              We may receive information from:
            </p>
            <ul>
              <li>Social media platforms if you connect your accounts</li>
              <li>Payment processors regarding transactions</li>
              <li>Analytics providers</li>
              <li>Marketing partners</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul>
              <li><strong>Provide Services:</strong> Create accounts, process transactions, deliver content</li>
              <li><strong>Improve Platform:</strong> Analyze usage, develop new features, fix bugs</li>
              <li><strong>Personalization:</strong> Recommend products, customize your feed, show relevant ads</li>
              <li><strong>Communications:</strong> Send updates, notifications, marketing messages (with your consent)</li>
              <li><strong>Safety & Security:</strong> Detect fraud, enforce policies, protect users</li>
              <li><strong>Legal Compliance:</strong> Comply with laws, respond to legal requests</li>
              <li><strong>Business Operations:</strong> Analytics, customer support, accounting</li>
            </ul>

            <h2>4. How We Share Your Information</h2>
            
            <h3>4.1 Public Information</h3>
            <p>
              Your profile information and content you post are visible to other users. You can control visibility in your privacy settings.
            </p>

            <h3>4.2 With Your Consent</h3>
            <p>
              We share information when you give us permission, such as when you connect third-party services.
            </p>

            <h3>4.3 Service Providers</h3>
            <p>
              We share information with third-party service providers who help us operate the Platform:
            </p>
            <ul>
              <li>Payment processors</li>
              <li>Cloud hosting providers</li>
              <li>Analytics services</li>
              <li>Customer service platforms</li>
              <li>Marketing and advertising partners</li>
            </ul>

            <h3>4.4 Business Transfers</h3>
            <p>
              If Ezyify is involved in a merger, acquisition, or sale of assets, your information may be transferred.
            </p>

            <h3>4.5 Legal Requirements</h3>
            <p>
              We may disclose information if required by law or to:
            </p>
            <ul>
              <li>Comply with legal obligations</li>
              <li>Protect our rights and property</li>
              <li>Prevent fraud or security issues</li>
              <li>Protect the safety of users</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services. When you delete your account, we delete or anonymize your information within 90 days, except where we need to retain it for legal reasons.
            </p>

            <h2>6. Your Rights and Choices</h2>
            
            <h3>6.1 Access and Update</h3>
            <p>
              You can access and update your account information through Settings.
            </p>

            <h3>6.2 Delete Account</h3>
            <p>
              You can delete your account in Settings &gt; Security &gt; Delete Account.
            </p>

            <h3>6.3 Privacy Settings</h3>
            <p>
              Control who can see your content, send you messages, and tag you in Settings &gt; Privacy.
            </p>

            <h3>6.4 Marketing Communications</h3>
            <p>
              Opt out of marketing emails by clicking "unsubscribe" or adjusting notification settings.
            </p>

            <h3>6.5 Cookies</h3>
            <p>
              Manage cookie preferences through your browser settings.
            </p>

            <h3>6.6 Data Portability</h3>
            <p>
              Request a copy of your data by contacting us at privacy@ezyify.com.
            </p>

            <h2>7. Children's Privacy</h2>
            <p>
              The Platform is not intended for children under 16. We do not knowingly collect information from children under 16. If you believe we have collected information from a child under 16, please contact us immediately.
            </p>

            <h2>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We take steps to ensure your information receives adequate protection.
            </p>

            <h2>9. Security</h2>
            <p>
              We implement reasonable security measures to protect your information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>
            <p>
              However, no system is 100% secure. You are responsible for maintaining the confidentiality of your password.
            </p>

            <h2>10. Third-Party Links</h2>
            <p>
              The Platform may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to read their privacy policies.
            </p>

            <h2>11. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the Platform. Your continued use after changes indicates acceptance.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, contact us at:
            </p>
            <ul>
              <li><strong>Email:</strong> privacy@ezyify.com</li>
              <li><strong>Data Protection Officer:</strong> dpo@ezyify.com</li>
              <li><strong>Address:</strong> San Francisco, CA, USA</li>
              <li><strong>Phone:</strong> +1 (555) 123-4567</li>
            </ul>

            <h2>13. Additional Rights for EU/EEA Users</h2>
            <p>
              If you are in the European Economic Area, you have additional rights under GDPR:
            </p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>

            <h2>14. California Privacy Rights</h2>
            <p>
              California residents have specific rights under CCPA:
            </p>
            <ul>
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
            <p>
              <strong>Note:</strong> Ezyify does not sell your personal information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}