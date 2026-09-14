import { Link } from 'react-router';
import { SEO } from '../../components/SEO';
import { Scale, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Terms of Service — Ezyify" description="Ezyify Terms of Service. Your rights and responsibilities on our platform." />
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
            <Scale className="w-8 h-8 text-info" />
            <div>
              <h1 className="font-semibold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 4, 2024</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-8 prose max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Ezyify ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, you should not access or use the Platform.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Ezyify is an E-Commerce Social Media Ecosystem that enables users to:
            </p>
            <ul>
              <li>Discover and purchase products</li>
              <li>Create and share content (posts, loops, stories, live streams)</li>
              <li>Sell products and earn commissions as creators and affiliates</li>
              <li>Interact with other users through likes, comments, and messages</li>
            </ul>

            <h2>3. User Accounts</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              To use certain features of the Platform, you must register for an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3>3.2 Account Eligibility</h3>
            <p>
              You must be at least 16 years old to create an account. Users under 18 must have parental or guardian consent.
            </p>

            <h2>4. User Content</h2>
            <h3>4.1 Content Ownership</h3>
            <p>
              You retain ownership of all content you post on Ezyify. By posting content, you grant Ezyify a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content.
            </p>

            <h3>4.2 Content Guidelines</h3>
            <p>
              You agree not to post content that:
            </p>
            <ul>
              <li>Infringes intellectual property rights</li>
              <li>Contains hate speech, harassment, or discrimination</li>
              <li>Promotes violence or illegal activities</li>
              <li>Contains explicit or adult content without proper age restrictions</li>
              <li>Spreads false or misleading information</li>
              <li>Violates privacy of others</li>
            </ul>

            <h2>5. Commerce & Transactions</h2>
            <h3>5.1 Buying</h3>
            <p>
              When you purchase products on Ezyify:
            </p>
            <ul>
              <li>You agree to pay the listed price plus applicable shipping and taxes</li>
              <li>All sales are subject to seller's terms and conditions</li>
              <li>Ezyify is not responsible for product quality or seller performance</li>
              <li>Returns and refunds are handled according to individual seller policies</li>
            </ul>

            <h3>5.2 Selling</h3>
            <p>
              Sellers agree to:
            </p>
            <ul>
              <li>Provide accurate product descriptions and images</li>
              <li>Honor listed prices and availability</li>
              <li>Ship products within stated timeframes</li>
              <li>Handle returns and customer service professionally</li>
              <li>Pay applicable commission fees (5-15% depending on category)</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h3>5.3 Creator & Affiliate Programs</h3>
            <p>
              Creators and affiliates agree to:
            </p>
            <ul>
              <li>Disclose affiliate relationships and sponsored content</li>
              <li>Provide honest reviews and recommendations</li>
              <li>Not engage in fraudulent activities to generate commissions</li>
              <li>Commission rates vary by product (typically 5-20%)</li>
            </ul>

            <h2>6. Payment Terms</h2>
            <p>
              Ezyify uses third-party payment processors. By providing payment information, you:
            </p>
            <ul>
              <li>Authorize us to charge your payment method</li>
              <li>Agree to payment processor terms</li>
              <li>Understand that we don't store full payment details</li>
            </ul>

            <h2>7. Prohibited Activities</h2>
            <p>
              You may not:
            </p>
            <ul>
              <li>Use the Platform for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Platform</li>
              <li>Use automated systems (bots) to interact with the Platform</li>
              <li>Scrape, copy, or duplicate content without permission</li>
              <li>Impersonate others or create fake accounts</li>
              <li>Manipulate engagement metrics (likes, views, followers)</li>
              <li>Sell or transfer your account to others</li>
            </ul>

            <h2>8. Intellectual Property</h2>
            <p>
              The Platform and its original content, features, and functionality are owned by Ezyify and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h2>9. Privacy</h2>
            <p>
              Your use of the Platform is also governed by our <Link to="/privacy" className="text-info hover:underline">Privacy Policy</Link>. Please review our Privacy Policy to understand our practices.
            </p>

            <h2>10. Disclaimers</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. Ezyify DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              Ezyify SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF THE PLATFORM.
            </p>

            <h2>12. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Platform will immediately cease.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, USA, without regard to its conflict of law provisions.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant changes. Your continued use of the Platform after changes constitutes acceptance of the modified Terms.
            </p>

            <h2>15. Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <ul>
              <li>Email: legal@ezyify.app</li>
              <li>Address: San Francisco, CA, USA</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}