import { SEO } from '../../components/SEO';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled (regardless of which slot was last changed)
    if (newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (_code: string) => {
    setTimeout(() => {
      navigate('/onboarding');
    }, 500);
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Verify Account — Ezyify" description="Verify your Ezyify account with a one-time code." />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/signup">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Account</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to your email/phone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="flex gap-1.5 sm:gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Timer / Resend */}
          <div className="text-center">
            {canResend ? (
              <Button 
                variant="ghost" 
                onClick={handleResend}
                className="text-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Code
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend code in <span className="font-medium text-primary">{timer}s</span>
              </p>
            )}
          </div>

          {/* Verify Button */}
          <Button 
            onClick={() => handleVerify(otp.join(''))}
            disabled={otp.some(digit => !digit)}
            className="w-full"
            size="lg"
          >
            Verify & Continue
          </Button>

          {/* Help Text */}
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-sm text-foreground">
              💡 Didn't receive the code? Check your spam folder or try resending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}