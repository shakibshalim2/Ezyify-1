import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-4 mx-auto">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              We've sent password reset instructions to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-accent rounded-2xl border border-border">
              <p className="text-sm text-foreground">
                📧 Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Try Different Email
              </Button>
              
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Reset Password — Ezyify" description="Reset your Ezyify account password securely." />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>
            No worries! Enter your email and we'll send you reset instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Send Reset Instructions
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link to="/login" className="text-primary hover:text-primary-hover hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}