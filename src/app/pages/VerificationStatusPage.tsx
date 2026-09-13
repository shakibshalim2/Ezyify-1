import { SEO } from '../components/SEO';
import { Link } from 'react-router';
import { CheckCircle2, Clock, XCircle, AlertCircle, Shield, Upload, FileText, User, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import { useState, useEffect } from 'react';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'in-review' | 'rejected';
  icon: React.ElementType;
}

const verificationStepsData: VerificationStep[] = [
  {
    id: 'email',
    title: 'Email Verification',
    description: 'Confirm your email address',
    status: 'completed',
    icon: CheckCircle2
  },
  {
    id: 'phone',
    title: 'Phone Verification',
    description: 'Verify your phone number via OTP',
    status: 'completed',
    icon: CheckCircle2
  },
  {
    id: 'identity',
    title: 'Identity Verification (KYC)',
    description: 'Upload government-issued ID for verification',
    status: 'in-review',
    icon: Clock
  },
  {
    id: 'address',
    title: 'Address Verification',
    description: 'Confirm your residential address',
    status: 'pending',
    icon: AlertCircle
  },
  {
    id: 'seller',
    title: 'Seller Verification',
    description: 'Complete seller onboarding process',
    status: 'pending',
    icon: Building2
  }
];

export default function VerificationStatusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
  const [accountStatus, setAccountStatus] = useState<'verified' | 'partially-verified' | 'unverified'>('partially-verified');
  const [completedSteps, setCompletedSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [progress, setProgress] = useState(0);

  // Load verification data progressively
  useEffect(() => {
    const loadVerificationData = () => {
      // Load verification steps data
      setVerificationSteps(verificationStepsData);
      
      // Calculate progress
      const completed = verificationStepsData.filter(s => s.status === 'completed').length;
      const total = verificationStepsData.length;
      const progressPercent = (completed / total) * 100;
      
      setCompletedSteps(completed);
      setTotalSteps(total);
      setProgress(progressPercent);
      
      // Determine account status based on completed steps
      if (completed === total) {
        setAccountStatus('verified');
      } else if (completed > 0) {
        setAccountStatus('partially-verified');
      } else {
        setAccountStatus('unverified');
      }
      
      setIsLoading(false);
    };

    // Progressive loading: Use requestIdleCallback for non-critical work
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadVerificationData(), { timeout: 100 });
    } else {
      setTimeout(loadVerificationData, 0);
    }
  }, []);

  const getStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case 'in-review':
        return <Clock className="w-5 h-5 text-primary" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: VerificationStep['status']) => {
    const config = {
      completed: { label: 'Verified', variant: 'default' as const },
      'in-review': { label: 'In Review', variant: 'secondary' as const },
      rejected: { label: 'Rejected', variant: 'destructive' as const },
      pending: { label: 'Pending', variant: 'outline' as const }
    };
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (<div className="min-h-screen bg-background">
      <SEO title="Verification Status — Ezyify" description="Check and manage your identity and seller verification status on Ezyify." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-semibold text-foreground">Account Verification</h1>
          <p className="text-muted-foreground">Complete verification to unlock all features</p>
        </div>

        {/* Overall Status Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {isLoading ? (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-7 w-48 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-10 w-16 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-8 h-8 text-primary" />
                      <div>
                        <h2 className="mb-1">Verification Status</h2>
                        {accountStatus === 'verified' && (
                          <Badge className="bg-primary text-primary-foreground">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Fully Verified
                          </Badge>
                        )}
                        {accountStatus === 'partially-verified' && (
                          <Badge className="bg-accent text-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            Partially Verified
                          </Badge>
                        )}
                        {accountStatus === 'unverified' && (
                          <Badge className="bg-muted text-muted-foreground">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {completedSteps} of {totalSteps} verification steps completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{Math.round(progress)}%</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                </div>

                <Progress value={progress} className="mb-4" />

                {accountStatus !== 'verified' && (
                  <Alert className="border-border bg-accent">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <AlertDescription className="text-foreground">
                      Complete all verification steps to unlock features like selling, higher withdrawal limits,
                      and the verified badge.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Verification Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="mb-6">Verification Steps</h2>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl border-2 border-border bg-muted">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </div>
                ))
              ) : (
                verificationSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-colors ${
                      step.status === 'completed'
                        ? 'bg-accent border-primary'
                        : step.status === 'in-review'
                        ? 'bg-accent border-primary'
                        : step.status === 'rejected'
                        ? 'bg-destructive/10 border-destructive'
                        : 'bg-muted border-border hover:border-primary'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.status === 'completed'
                        ? 'bg-primary'
                        : step.status === 'in-review'
                        ? 'bg-primary'
                        : step.status === 'rejected'
                        ? 'bg-destructive'
                        : 'bg-muted-foreground'
                    }`}>
                      {getStatusIcon(step.status)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3>{step.title}</h3>
                        {getStatusBadge(step.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                      {step.status === 'completed' && (
                        <p className="text-xs text-primary">Verified successfully</p>
                      )}

                      {step.status === 'in-review' && (
                        <div>
                          <p className="text-xs text-foreground mb-2">
                            Your submission is being reviewed. This usually takes 1-2 business days.
                          </p>
                          <Button variant="outline" size="sm" disabled>
                            <Clock className="w-4 h-4 mr-2" />
                            Under Review
                          </Button>
                        </div>
                      )}

                      {step.status === 'rejected' && (
                        <div>
                          <p className="text-xs text-destructive mb-2">
                            Verification failed. Please resubmit with correct documents.
                          </p>
                          <Button variant="destructive" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Resubmit
                          </Button>
                        </div>
                      )}

                      {step.status === 'pending' && (
                        <div>
                          {step.id === 'identity' && (
                            <Link to="/seller/kyc-verification">
                              <Button variant="outline" size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Start Verification
                              </Button>
                            </Link>
                          )}
                          {step.id === 'address' && (
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Verify Address
                            </Button>
                          )}
                          {step.id === 'seller' && (
                            <Link to="/sell-on-ezyify">
                              <Button variant="outline" size="sm">
                                <Building2 className="w-4 h-4 mr-2" />
                                Become a Seller
                              </Button>
                            </Link>
                          )}
                          {!['identity', 'address', 'seller'].includes(step.id) && (
                            <Button variant="outline" size="sm">
                              Complete Step
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits of Verification */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="mb-6">Benefits of Full Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Verified Badge</p>
                  <p className="text-sm text-muted-foreground">Get the blue checkmark on your profile</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Sell on Ezyify</p>
                  <p className="text-sm text-muted-foreground">List and sell your products</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Higher Limits</p>
                  <p className="text-sm text-muted-foreground">Increased withdrawal and transaction limits</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Priority Support</p>
                  <p className="text-sm text-muted-foreground">Faster response from customer service</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Trust & Safety</p>
                  <p className="text-sm text-muted-foreground">Enhanced account security and protection</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Advanced Features</p>
                  <p className="text-sm text-muted-foreground">Access to creator tools and analytics</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you're having trouble with verification or have questions, our support team is here to help.
            </p>
            <div className="flex gap-3">
              <Link to="/help">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Help Center
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}