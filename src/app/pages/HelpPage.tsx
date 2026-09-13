import { SEO } from '../components/SEO';
import { useState, useEffect } from 'react';
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Book,
  Shield 
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Link, useNavigate } from 'react-router';

interface FAQ {
  question: string;
  answer: string;
  category: 'general' | 'shopping' | 'selling' | 'account';
}

const faqs: FAQ[] = [
  {
    category: 'general',
    question: 'What is Ezyify?',
    answer: 'Ezyify is an E-Commerce Social Media Ecosystem where you can discover and buy products, connect with creators, share content, go live, and build communities — all in one place. Shop. Talk. Share. Live the Moment.'
  },
  {
    category: 'general',
    question: 'Is Ezyify free to use?',
    answer: 'Yes! Creating an account and browsing content is completely free. We only charge commission on sales for sellers and creators.'
  },
  {
    category: 'shopping',
    question: 'How do I place an order?',
    answer: 'Simply tap on any product tagged in a post, add it to your cart, and proceed to checkout. You can pay using credit/debit cards, approved digital wallets, or your Ezyify Wallet.'
  },
  {
    category: 'shopping',
    question: 'What payment methods do you accept?',
    answer: 'We accept credit/debit cards (Visa, Mastercard), approved digital wallets (Apple Pay, Google Pay), and Ezyify Wallet. All payments are processed securely with escrow protection.'
  },
  {
    category: 'shopping',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days. Shipping times may vary based on your location and product availability.'
  },
  {
    category: 'shopping',
    question: 'What is your return policy?',
    answer: 'You can return most items within 7 days of delivery for a full refund. Items must be unused and in original packaging. Some categories may have different return policies.'
  },
  {
    category: 'selling',
    question: 'How do I become a seller?',
    answer: 'Click on "Become a Seller" in the menu, complete your store profile, and submit required documents for verification. Once approved, you can start listing products.'
  },
  {
    category: 'selling',
    question: 'What are the seller fees?',
    answer: 'Ezyify charges a 5-15% commission on each sale depending on the product category. There are no monthly fees or listing fees.'
  },
  {
    category: 'selling',
    question: 'How do I receive payments as a seller?',
    answer: 'Payments are processed weekly and deposited to your Ezyify Wallet. You can then transfer funds to your bank account or mobile wallet.'
  },
  {
    category: 'account',
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page, enter your email, and follow the instructions sent to your email to reset your password.'
  },
  {
    category: 'account',
    question: 'How do I verify my account?',
    answer: 'Go to Settings > Account > Verification, and submit a valid ID document. Verification typically takes 1-2 business days.'
  },
  {
    category: 'account',
    question: 'How do I delete my account?',
    answer: 'Go to Settings > Security > Danger Zone and click "Delete Account". Note that this action is permanent and cannot be undone.'
  }
];

// SKELETON FOR INSTANT UI - HELP PAGE
function HelpPageSkeleton() {
  return (<div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="py-16 text-white" style={{ background: "var(--brand-gradient)" }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-6 w-96 mx-auto mb-8 bg-white/20" />
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-14 w-full bg-white/30" />
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Card Skeleton */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Help Cards Skeleton */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6 text-center space-y-4">
                <Skeleton className="w-12 h-12 mx-auto rounded" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
                <Skeleton className="h-10 w-32 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  // ALL HOOKS AT TOP LEVEL - SKELETON-FIRST PATTERN
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | FAQ['category']>('all');
  const navigate = useNavigate();

  // Progressive data loading
  useEffect(() => {
    const loadHelpData = () => {
      // Simulate loading help data
      setIsLoading(false);
    };

    // Use requestIdleCallback for non-blocking load
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadHelpData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      setTimeout(loadHelpData, 16);
    }
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <HelpPageSkeleton />;
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Help Center — Ezyify" description="Find answers, guides, and support resources for the Ezyify E-Commerce Social Media Ecosystem." />
      {/* Hero */}
      <div className="relative overflow-hidden py-16" style={{ background: 'var(--brand-gradient)' }}>
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none" style={{ background: 'rgba(255,255,255,0.15)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-15 pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }} />

        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-white text-4xl font-bold mb-3">How can we help?</h1>
          <p className="text-white/80 text-lg mb-8">Search our help center or browse categories below</p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-card border-0 shadow-xl text-foreground rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured: Payment Guide */}
        <Link to="/payment-guide">
          <Card className="mb-8 border-2 border-primary/30 bg-primary/5 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-foreground">🛡️ How Ezyify Payment & Escrow Protection Works</h2>
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Learn how our escrow-based payment system protects your money until you confirm delivery. 
                    Understand buyer protection, refund process, delivery confirmation, and what happens in each scenario.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-success/10 text-success text-xs rounded-full">
                      ✓ 100% Buyer Protection
                    </span>
                    <span className="px-3 py-1 bg-info/10 text-info text-xs rounded-full">
                      ✓ Escrow Security
                    </span>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      ✓ Easy Refunds
                    </span>
                    <span className="px-3 py-1 bg-warning/10 text-warning text-xs rounded-full">
                      ✓ No COD Fraud
                    </span>
                  </div>
                </div>
                <Button className="flex-shrink-0">
                  Learn More →
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Quick Help Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-4">Chat with our support team</p>
              <Button variant="outline" onClick={() => navigate('/messages')}>Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-4">Get help via email</p>
              <a href="mailto:support@ezyify.com"><Button variant="outline">Send Email</Button></a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="mb-2">Phone Support</h3>
              <p className="text-muted-foreground mb-4">Call us: +1 (888) 234-5678</p>
              <a href="tel:+18882345678"><Button variant="outline">Call Now</Button></a>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="mb-6">Frequently Asked Questions</h2>

          {/* Category Filter */}
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as typeof activeCategory)} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="shopping">Shopping</TabsTrigger>
              <TabsTrigger value="selling">Selling</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* FAQs */}
          <div className="space-y-3">
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or browse all categories</p>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map((faq, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <h3>{faq.question}</h3>
                        </div>
                        {expandedFAQ === index && (
                          <p className="text-muted-foreground mt-3 pl-7">{faq.answer}</p>
                        )}
                      </div>
                      {expandedFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mt-12">
          <h2 className="mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Book className="w-8 h-8 text-primary mb-3" />
                <h3 className="mb-2">Getting Started</h3>
                <p className="text-sm text-muted-foreground">Learn the basics of Ezyify</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <MessageCircle className="w-8 h-8 text-info mb-3" />
                <h3 className="mb-2">Orders & Shipping</h3>
                <p className="text-sm text-muted-foreground">Track and manage your orders</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <HelpCircle className="w-8 h-8 text-info mb-3" />
                <h3 className="mb-2">Returns & Refunds</h3>
                <p className="text-sm text-muted-foreground">Learn about our return policy</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Phone className="w-8 h-8 text-primary mb-3" />
                <h3 className="mb-2">Seller Support</h3>
                <p className="text-sm text-muted-foreground">Resources for sellers</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Still Need Help */}
        <Card className="mt-12 bg-accent border-border">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to assist you
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={() => navigate('/messages')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Live Chat
              </Button>
              <a href="mailto:support@ezyify.com">
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Us
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}