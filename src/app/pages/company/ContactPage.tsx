import { toast } from 'sonner';
import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Clock, Send, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  // Progressive loading
  useEffect(() => {
    const loadData = () => {
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadData(), { timeout: 100 });
    } else {
      setTimeout(loadData, 0);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent. We will get back to you within 1–2 business days.");
  };

  return (
          <div className="max-w-6xl mx-auto px-4 pb-8">
      <SEO title="Contact Us" description="Get in touch with the Ezyify team. We are here to help with your questions." />
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-info/20 dark:bg-info/10 rounded-full mb-4">
          <MessageSquare className="w-8 h-8 text-info" />
        </div>
        <h1 className="text-4xl mb-3">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions? We're here to help. Choose the best way to reach us.
        </p>
      </div>

      {isLoading ? (
        <>
          {/* Quick Contact Cards Skeleton */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form Skeleton */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-11 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Quick Contact Cards */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="w-5 h-5 text-info" />
                  Help Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Find instant answers to common questions in our comprehensive knowledge base.
                </p>
                <Button variant="outline" className="w-full">Visit Help Center</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-success" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our support team in real-time. Available 24/7 for urgent issues.
                </p>
                <Button variant="outline" className="w-full">Start Live Chat</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Send us a detailed message and we'll respond within 24-48 hours.
                </p>
                <a href="mailto:support@ezyify.com" className="block"><Button variant="outline" className="w-full">Send Email</Button></a>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="seller">Seller Support</SelectItem>
                          <SelectItem value="creator">Creator Support</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="press">Press/Media</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your inquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide as much detail as possible..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      We typically respond within 24-48 hours during business days.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <a href="mailto:support@ezyify.com" className="text-sm text-info hover:underline">
                        support@ezyify.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Phone</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                      <p className="text-xs text-muted-foreground">Mon-Fri, 9am-6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Address</p>
                      <p className="text-sm text-muted-foreground">
                        123 Commerce Street<br />
                        San Francisco, CA 94102<br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Business Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday: 9am - 6pm EST<br />
                        Saturday: 10am - 4pm EST<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border-primary/25">
                <CardHeader>
                  <CardTitle className="text-lg">Department-Specific Emails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium">Press & Media:</p>
                    <a href="mailto:press@ezyify.com" className="text-info hover:underline">
                      press@ezyify.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium">Partnerships:</p>
                    <a href="mailto:partnerships@ezyify.com" className="text-info hover:underline">
                      partnerships@ezyify.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium">Legal:</p>
                    <a href="mailto:legal@ezyify.com" className="text-info hover:underline">
                      legal@ezyify.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium">Safety & Trust:</p>
                    <a href="mailto:safety@ezyify.com" className="text-info hover:underline">
                      safety@ezyify.com
                    </a>
                  </div>
                  <div>
                    <p className="font-medium">Careers:</p>
                    <a href="mailto:careers@ezyify.com" className="text-info hover:underline">
                      careers@ezyify.com
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}