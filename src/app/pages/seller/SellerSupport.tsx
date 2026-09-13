import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Book,
  Video,
  Mail,
  Phone,
  Search,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Clock,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../../components/ui/accordion';
import { SellerLayout } from '../../components/SellerLayout';

export default function SellerSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with support team',
      action: 'Start Chat',
      available: true
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      action: 'Send Email',
      available: true
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Mon-Fri, 9AM-6PM',
      action: 'Call Now',
      available: false
    },
    {
      icon: Video,
      title: 'Video Guide',
      description: 'Watch tutorials',
      action: 'Watch Now',
      available: true
    }
  ];

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I add my first product?',
          a: 'Navigate to Products > Add Product, fill in the required details including product name, description, price, images, and inventory. Click "Publish" when ready.'
        },
        {
          q: 'How do I set up my store profile?',
          a: 'Go to Settings > Store Settings to customize your store name, logo, banner, description, and contact information. Make sure to save changes.'
        },
        {
          q: 'What are the seller requirements?',
          a: 'You need to complete KYC verification, provide valid business documents, and maintain a minimum quality score to sell on Ezyify.'
        }
      ]
    },
    {
      category: 'Orders & Shipping',
      questions: [
        {
          q: 'How do I process an order?',
          a: 'Go to Orders, select the order, update its status to "Processing", prepare the package, and mark it as "Shipped" with tracking information.'
        },
        {
          q: 'What shipping options are available?',
          a: 'Ezyify partners with multiple logistics providers. You can choose from Standard (3-5 days), Express (1-2 days), or integrate your own shipping method.'
        },
        {
          q: 'How do I handle returns?',
          a: 'Review return requests in Orders > Returns. Approve or reject based on your return policy. Approved returns will be picked up by logistics partners.'
        }
      ]
    },
    {
      category: 'Payments & Earnings',
      questions: [
        {
          q: 'When do I receive payments?',
          a: 'Payments are processed twice a month (1st and 15th). Funds from completed orders are transferred to your registered bank account within 3-5 business days.'
        },
        {
          q: 'What are the platform fees?',
          a: 'Ezyify charges a 5% commission on each sale plus payment processing fees. No monthly subscription required.'
        },
        {
          q: 'How do I withdraw my earnings?',
          a: 'Go to Earnings > Withdraw, select your verified bank account, enter the amount, and submit. Minimum withdrawal is $100.'
        }
      ]
    },
    {
      category: 'Marketing & Growth',
      questions: [
        {
          q: 'How can I promote my products?',
          a: 'Use Ezyify Ads, create engaging content on Loops, collaborate with creators, offer discounts, and participate in platform campaigns.'
        },
        {
          q: 'What is the affiliate program?',
          a: 'Allow creators to promote your products and earn commission. Set commission rates in Products > Affiliate Settings for each product.'
        },
        {
          q: 'How do I improve my store ranking?',
          a: 'Maintain high ratings, respond quickly to customers, offer competitive prices, provide quality products, and ship orders on time.'
        }
      ]
    }
  ];

  const resources = [
    {
      title: 'Seller Handbook',
      description: 'Complete guide to selling on Ezyify',
      icon: Book,
      type: 'PDF',
      link: '#'
    },
    {
      title: 'Product Photography Guide',
      description: 'Tips for taking great product photos',
      icon: FileText,
      type: 'Article',
      link: '#'
    },
    {
      title: 'Pricing Strategy Workshop',
      description: 'Video series on competitive pricing',
      icon: Video,
      type: 'Video',
      link: '#'
    },
    {
      title: 'Customer Service Best Practices',
      description: 'How to provide excellent support',
      icon: Users,
      type: 'Guide',
      link: '#'
    }
  ];

  const recentTickets = [
    {
      id: 'TKT-12345',
      subject: 'Payment not received',
      status: 'open',
      date: '2 hours ago',
      priority: 'high'
    },
    {
      id: 'TKT-12344',
      subject: 'How to bulk upload products?',
      status: 'resolved',
      date: '1 day ago',
      priority: 'low'
    },
    {
      id: 'TKT-12343',
      subject: 'Customer return issue',
      status: 'in-progress',
      date: '2 days ago',
      priority: 'medium'
    }
  ];

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    toast.success('Support ticket submitted. Our team will respond within 24 hours.');
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <SellerLayout>
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
      <SEO title="Seller Support — Ezyify" description="Get help and support resources for your Ezyify seller store." />
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="mb-1 sm:mb-2 text-xl sm:text-2xl">Seller Support</h1>
          <p className="text-sm text-muted-foreground">Get help and resources for your store</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                    <Button 
                      size="sm" 
                      variant={action.available ? 'default' : 'outline'}
                      disabled={!action.available}
                      className="w-full"
                    >
                      {action.action}
                    </Button>
                  </div>
                </div>
                {!action.available && (
                  <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                    Offline
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          </TabsList>

          {/* FAQs */}
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                {faqs.map((category, index) => (
                  <div key={category.category}>
                    <h3 className="font-semibold mb-3">{category.category}</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, qIndex) => (
                        <AccordionItem key={qIndex} value={`${index}-${qIndex}`}>
                          <AccordionTrigger className="text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    {index < faqs.length - 1 && <Separator className="my-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources */}
          <TabsContent value="resources" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((resource) => (
                <Card key={resource.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <resource.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold">{resource.title}</h3>
                          <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {resource.description}
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          View Resource
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <Book className="h-4 w-4" />
              <AlertTitle>New to selling?</AlertTitle>
              <AlertDescription>
                Check out our comprehensive Seller Onboarding Guide to get started with best practices and tips.
                <Button variant="link" className="p-0 h-auto ml-2">
                  View Guide <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Support Tickets */}
          <TabsContent value="tickets" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Create New Ticket */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Create Support Ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      placeholder="Describe your issue in detail..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleSubmitTicket} className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </Button>
                    <Button variant="outline">
                      Attach File
                    </Button>
                  </div>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Average response time: 2-4 hours during business hours
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Recent Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTickets.length > 0 ? (
                      <>
                        {recentTickets.map((ticket) => (
                          <div key={ticket.id} className="p-3 border border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                              <Badge 
                                variant={
                                  ticket.status === 'resolved' ? 'default' : 
                                  ticket.status === 'in-progress' ? 'secondary' : 
                                  'outline'
                                }
                                className="text-xs"
                              >
                                {ticket.status === 'in-progress' ? 'In Progress' : ticket.status}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium mb-1">{ticket.subject}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{ticket.date}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  ticket.priority === 'high' ? 'border-destructive/50 text-destructive' :
                                  ticket.priority === 'medium' ? 'border-warning/50 text-warning' :
                                  'border-muted-foreground/50 text-muted-foreground'
                                }`}
                              >
                                {ticket.priority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full">
                          View All Tickets
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No support tickets</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Info */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Email Support</p>
                  <p className="text-sm text-muted-foreground">seller-support@ezyify.com</p>
                  <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+1 (888) 234-5678</p>
                  <p className="text-xs text-muted-foreground mt-1">Mon-Fri, 9AM-6PM PST</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available 24/7</p>
                  <Button variant="link" className="p-0 h-auto text-xs mt-1">
                    Start Chat <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}