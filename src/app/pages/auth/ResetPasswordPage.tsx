import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { EzyifyLogo } from '../../components/EzyifyLogo';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-error', 'bg-warning', 'bg-info', 'bg-success'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => navigate('/login'), 2500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Password Reset!</h1>
          <p className="text-muted-foreground mb-6">
            Your password has been updated successfully. Redirecting you to login…
          </p>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-error/10 border-2 border-error/20 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-10 h-10 text-error" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Reset Link</h1>
          <p className="text-muted-foreground mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white transition-all"
            style={{ background: 'var(--brand-gradient)' }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Set New Password — Ezyify" description="Set a new password for your Ezyify account." />
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'var(--brand-gradient)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-8" style={{ background: 'var(--brand-purple)', filter: 'blur(100px)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <EzyifyLogo size={56} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account</p>
        </div>

        <div className="bg-card border border-border rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-card text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strength: <span className={`font-semibold ${passwordStrength >= 3 ? 'text-success' : passwordStrength === 2 ? 'text-warning' : 'text-error'}`}>
                      {strengthLabels[passwordStrength]}
                    </span>
                    {' · '}Min. 8 chars, uppercase, number, symbol
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-card text-foreground border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all ${
                    confirmPassword && confirmPassword !== password ? 'border-error focus:ring-error/20' : 'border-border'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-error mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98] shadow-brand hover:shadow-brand-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--brand-gradient)' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Updating Password…
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
