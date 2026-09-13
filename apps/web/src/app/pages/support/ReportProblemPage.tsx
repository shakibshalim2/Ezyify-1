import { toast } from 'sonner';
import { SEO } from '../../components/SEO';
import { Flag, AlertTriangle, ShoppingBag, Users, Shield, Bug, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useState } from 'react';

export default function ReportProblemPage() {
  const [reportType, setReportType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    description: '',
    url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Problem report submitted. Our team will review it within 24 hours.");
  };

  return (
          <div className="max-w-4xl mx-auto px-4 pb-8">
      <SEO title="Report a Problem" description="Report issues, abuse, or violations on Ezyify to help keep our E-Commerce Social Media Ecosystem safe." />
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-error/10 rounded-full mb-4">
          <Flag className="w-8 h-8 text-error" />
        </div>
        <h1 className="text-4xl mb-3">Report a Problem</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Help us improve Ezyify by reporting issues, bugs, or policy violations
        </p>
      </div>

      <Alert className="mb-6 border-warning/30 bg-warning/10">
        <AlertTriangle className="w-5 h-5 text-warning" />
        <AlertDescription>
          <strong>Urgent safety issues?</strong> If you're reporting harassment, threats, or immediate danger, 
          email <a href="mailto:safety@ezyify.com" className="underline font-medium">safety@ezyify.com</a> for fastest response.
        </AlertDescription>
      </Alert>

      {/* Quick Report Categories */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('content')}>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Flag className="w-6 h-6 text-error" />
            </div>
            <h3 className="font-semibold mb-1">Inappropriate Content</h3>
            <p className="text-xs text-muted-foreground">Report posts, videos, or comments</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('user')}>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-semibold mb-1">User Behavior</h3>
            <p className="text-xs text-muted-foreground">Harassment, spam, or fake accounts</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('order')}>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-info" />
            </div>
            <h3 className="font-semibold mb-1">Order Issue</h3>
            <p className="text-xs text-muted-foreground">Product, seller, or delivery problems</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('security')}>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Security Issue</h3>
            <p className="text-xs text-muted-foreground">Account hacking or suspicious activity</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('bug')}>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bug className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold mb-1">Technical Bug</h3>
            <p className="text-xs text-muted-foreground">App crashes or features not working</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('other')}>
          <CardContent className="text-center p-6">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Other Issues</h3>
            <p className="text-xs text-muted-foreground">Something else not listed above</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type */}
            <div className="space-y-2">
              <Label htmlFor="reportType">What would you like to report? *</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Inappropriate Content (post, video, comment)</SelectItem>
                  <SelectItem value="user">User Behavior (harassment, spam, impersonation)</SelectItem>
                  <SelectItem value="order">Order/Shopping Issue</SelectItem>
                  <SelectItem value="seller">Seller Violation</SelectItem>
                  <SelectItem value="security">Security/Privacy Concern</SelectItem>
                  <SelectItem value="bug">Technical Bug/Error</SelectItem>
                  <SelectItem value="copyright">Copyright Infringement</SelectItem>
                  <SelectItem value="safety">Safety/Trust Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <RadioGroup value={priority} onValueChange={setPriority}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="font-normal cursor-pointer">
                    Low - Minor issue, no immediate impact
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal cursor-pointer">
                    Medium - Affects my experience but not urgent
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="font-normal cursor-pointer">
                    High - Urgent issue needing immediate attention
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Your Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">We'll send updates about your report to this email</p>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief summary of the issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            {/* URL/Link */}
            <div className="space-y-2">
              <Label htmlFor="url">Link to Content (if applicable)</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://ezyify.com/post/12345 or profile/username"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Paste the URL of the post, profile, or product you're reporting</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Please provide as much detail as possible about the issue..."
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Include: What happened? When did it happen? Steps to reproduce (for bugs). 
                Screenshots are helpful (attach via email if needed).
              </p>
            </div>

            {/* Submit */}
            <div className="space-y-3">
              <Button type="submit" size="lg" className="w-full">
                <Flag className="w-5 h-5 mr-2" />
                Submit Report
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Reports are reviewed within 24-48 hours. High-priority safety issues are addressed immediately.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card className="mt-6 bg-info/10 border-info/20">
        <CardHeader>
          <CardTitle className="text-lg">What Happens After You Report?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. <strong>We receive your report</strong> and assign it to the appropriate team</p>
          <p>2. <strong>Our team reviews</strong> the issue (within 24-48 hours for most reports)</p>
          <p>3. <strong>Action is taken</strong> if a violation is confirmed (content removal, account suspension, etc.)</p>
          <p>4. <strong>You receive an update</strong> via email about the outcome</p>
          <p className="pt-2 text-xs text-muted-foreground">
            Note: For privacy reasons, we may not share specific details about actions taken on other users' accounts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}