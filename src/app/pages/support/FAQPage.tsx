import { SEO } from '../../components/SEO';
import { Link } from 'react-router';
import { HelpCircle, Search, ShoppingBag, Users, Wallet, Shield, Settings, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { useState } from 'react';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      icon: ShoppingBag,
      title: 'Shopping & Orders',
      color: 'blue',
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'You can purchase products in multiple ways on Ezyify: (1) Click on product tags in posts/videos, (2) Browse the Shop tab, (3) Click products in creator storefronts, or (4) Purchase during live shopping events. Simply add items to cart and checkout with one tap.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay, and Ezyify Wallet balance. All payments are encrypted and secure.'
        },
        {
          question: 'How can I track my order?',
          answer: 'Go to your Orders page (Profile → My Orders) to see real-time tracking. You\'ll receive notifications at each stage: Order Confirmed, Processing, Shipped, Out for Delivery, and Delivered.'
        },
        {
          question: 'What is your return policy?',
          answer: 'Most items can be returned within 30 days of delivery. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the return. Note: Return policies may vary by seller.'
        },
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping: 3-5 business days. Express shipping: 1-2 business days. International shipping: 7-14 business days. Exact times depend on seller location and your delivery address.'
        }
      ]
    },
    {
      icon: Users,
      title: 'Creator & Affiliate',
      color: 'purple',
      faqs: [
        {
          question: 'How do I become a creator and earn money?',
          answer: 'Anyone can become a creator on Ezyify! Start posting content, tag products in your posts/videos, and earn affiliate commission when followers purchase through your tagged products. Go to Creator Dashboard to track earnings.'
        },
        {
          question: 'How does affiliate commission work?',
          answer: 'When you share posts with product tags and someone makes a purchase through your content, you earn a commission (typically 3-15% depending on category). Commissions only apply to in-platform shares - external links don\'t track.'
        },
        {
          question: 'When do I get paid for my earnings?',
          answer: 'Creator earnings are calculated after the return period (30 days). Payouts are processed monthly on the 15th, with a minimum balance of $50. You can set up payout methods in Creator Dashboard → Payout Settings.'
        },
        {
          question: 'Can I share my Ezyify posts on other social media?',
          answer: 'Yes, you can share to other platforms for visibility, but affiliate earnings only count for purchases made directly through Ezyify platform. External shares don\'t track affiliate commissions.'
        },
        {
          question: 'What content performs best for earning?',
          answer: 'Authentic reviews, tutorials, unboxing videos, styling tips, and "how-to" content typically perform best. Focus on products you genuinely use and love. Transparency builds trust and drives conversions.'
        }
      ]
    },
    {
      icon: Settings,
      title: 'Selling on Ezyify',
      color: 'green',
      faqs: [
        {
          question: 'How do I start selling on Ezyify?',
          answer: 'Click "Sell on Ezyify" in the menu, complete seller registration and KYC verification (identity, business info, payment details). Once approved, you can create your storefront and list products.'
        },
        {
          question: 'What is KYC and why is it required?',
          answer: 'KYC (Know Your Customer) verification confirms your identity and business legitimacy. It\'s required to protect buyers from fraud and ensure all sellers are trustworthy. This includes ID verification and business documentation.'
        },
        {
          question: 'What fees does Ezyify charge sellers?',
          answer: 'Ezyify charges a category-based commission on each sale (5-18% depending on product type). This is deducted automatically before payout. There are no listing fees or monthly subscription costs.'
        },
        {
          question: 'How do I get paid as a seller?',
          answer: 'When a customer completes a purchase, funds are held in escrow until delivery is confirmed. After the return period, your earnings (minus platform commission) are transferred to your seller wallet. You can withdraw to your bank account.'
        },
        {
          question: 'Can creators feature my products?',
          answer: 'Yes! Creators can tag your products in their content. You benefit from increased visibility and sales, while creators earn affiliate commission. It\'s a win-win collaboration built into the platform.'
        }
      ]
    },
    {
      icon: Wallet,
      title: 'Payments & Wallet',
      color: 'orange',
      faqs: [
        {
          question: 'What is Ezyify Wallet?',
          answer: 'Your Ezyify Wallet stores your earnings (from creator commissions or seller sales) and can be used for purchases. You can also withdraw funds to your bank account or keep balance for future shopping.'
        },
        {
          question: 'How do I withdraw money from my wallet?',
          answer: 'Go to Wallet → Withdraw, enter amount, and select your payout method (bank transfer or PayPal). Withdrawals are processed within 2-3 business days. Minimum withdrawal is $10.'
        },
        {
          question: 'Are transactions on Ezyify secure?',
          answer: 'Absolutely. We use bank-level encryption (SSL/TLS), certified payment processors, and never store full payment details. All transactions are PCI-DSS compliant for maximum security.'
        },
        {
          question: 'What if I was charged incorrectly?',
          answer: 'Contact our support team immediately with your order ID. We\'ll investigate and process refunds within 5-7 business days if an error occurred. You can also dispute charges through your payment provider.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Account & Privacy',
      color: 'red',
      faqs: [
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send a reset link. Follow the link to create a new password. For security, the link expires in 24 hours.'
        },
        {
          question: 'How do I make my account private?',
          answer: 'Go to Settings → Privacy → Account Privacy and toggle "Private Account". With a private account, only approved followers can see your posts and stories.'
        },
        {
          question: 'Can I delete my account?',
          answer: 'Yes. Go to Settings → Account → Delete Account. This permanently removes all your data, posts, and purchase history. This action cannot be undone. Consider deactivating temporarily instead.'
        },
        {
          question: 'How does Ezyify use my data?',
          answer: 'We use your data to personalize your feed, recommend products, and improve your experience. We never sell personal data to third parties. Read our Privacy Policy for complete details.'
        },
        {
          question: 'How do I block or report someone?',
          answer: 'Visit their profile, click the three dots (•••), and select "Block" or "Report". Blocking prevents them from seeing your content or contacting you. Reports are reviewed by our safety team within 24-48 hours.'
        }
      ]
    },
    {
      icon: TrendingUp,
      title: 'Platform Features',
      color: 'indigo',
      faqs: [
        {
          question: 'What are "Loops" on Ezyify?',
          answer: 'Loops are short, vertical videos (similar to TikTok or Reels). You can create entertaining content, tag products, and engage with your audience. Loops auto-play in the feed for maximum discovery.'
        },
        {
          question: 'How does Live Shopping work?',
          answer: 'Creators and sellers can go Live and showcase products in real-time. Viewers can purchase featured items instantly during the stream with one-tap checkout. It\'s interactive shopping meets entertainment.'
        },
        {
          question: 'What is the difference between posts, loops, and stories?',
          answer: 'Posts are permanent feed content (photos/videos). Loops are short vertical videos in a dedicated feed. Stories are temporary (24 hours) and appear at the top of the feed. All support product tagging!'
        },
        {
          question: 'How does product tagging work?',
          answer: 'When creating content, click "Tag Product" and search for items to tag. Tagged products appear as clickable links in your content. Users can tap to view details and purchase instantly.'
        },
        {
          question: 'What is AR Try-On?',
          answer: 'For select products (like makeup, eyewear, accessories), you can use augmented reality to virtually try items before purchasing. Just tap "Try On" on product pages that support it.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
          <div className="max-w-4xl mx-auto px-4 pb-8">
      <SEO title="FAQ — Help Center" description="Find answers to common questions about Ezyify — your E-Commerce Social Media Ecosystem." />
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <HelpCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl mb-3">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about Ezyify
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for answers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="w-6 h-6 text-primary" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIdx) => (
                    <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No FAQs found matching "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try different keywords or browse categories above</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Still Need Help */}
      <Card className="mt-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">Can't find what you're looking for? Our support team is here to help.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/help">
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
                Visit Help Center
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-6 py-2 border border-primary text-primary rounded-xl hover:bg-primary/10 transition-colors">
                Contact Support
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}