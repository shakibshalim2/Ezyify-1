import { SEO } from '../../components/SEO';
import { toast } from 'sonner';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { EzyifyLogo } from '../../components/EzyifyLogo';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Full name is required'); return; }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) { toast.error('A valid email address is required'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Create Account — Ezyify" description="Join Ezyify — the E-Commerce Social Media Ecosystem. Shop, create, sell, and connect." />
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
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join millions shopping on Ezyify</p>
        </div>

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-input-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-input-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-input-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-input-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1 rounded border-border" required />
              <span className="text-sm text-muted-foreground">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:text-primary-hover">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:text-primary-hover">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98] shadow-brand hover:shadow-brand-lg"
              style={{ background: 'var(--brand-gradient)' }}
            >
              Create Account
            </button>

            {/* Privacy Notice with Modal Link */}
            <p className="text-xs text-center text-muted-foreground -mt-2">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline font-medium">
                Terms
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              .{' '}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-primary hover:underline font-medium"
              >
                We value your privacy
              </button>
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">Or sign up with</span>
            </div>
          </div>

          {/* Social Signup */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'G', color: '#4285F4' },
              { label: '🍎', color: '#000' },
              { label: 'f', color: '#1877F2' },
            ].map(({ label, color }) => (
              <button key={label} className="py-3 border border-border rounded-xl hover:bg-muted hover:border-border-strong transition-all duration-150 font-bold text-sm" style={{ color }}>
                {label}
              </button>
            ))}
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Privacy Preferences Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy & Cookie Preferences</DialogTitle>
            <DialogDescription>
              We respect your privacy. Here's how we use cookies and process your data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="bg-accent border border-border rounded-2xl p-4">
                <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <span className="text-primary">✓</span> Necessary Cookies
                </h4>
                <p className="text-sm text-muted-foreground">
                  Essential for the website to function. These enable core features like security, authentication, and shopping cart. Cannot be disabled.
                </p>
              </div>

              <div className="bg-accent border border-border rounded-2xl p-4">
                <h4 className="font-semibold text-foreground mb-1">Analytics Cookies (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  Help us understand how you use our platform to improve your experience. All data is anonymized.
                </p>
              </div>

              <div className="bg-accent border border-border rounded-2xl p-4">
                <h4 className="font-semibold text-foreground mb-1">Marketing Cookies (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  Used to show you relevant advertisements and measure campaign effectiveness.
                </p>
              </div>

              <div className="bg-accent border border-border rounded-2xl p-4">
                <h4 className="font-semibold text-foreground mb-1">Functional Cookies (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  Enable enhanced features like language preferences and personalized recommendations.
                </p>
              </div>
            </div>

            <div className="bg-accent border border-border rounded-2xl p-4">
              <p className="text-sm text-foreground mb-3 font-medium">
                📘 Want more control?
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                You can customize your cookie preferences at any time from Settings → Privacy & Security.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/privacy-preferences">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary border-border"
                    onClick={() => setShowPrivacyModal(false)}
                  >
                    Manage Cookie Preferences
                  </Button>
                </Link>
                <Link to="/privacy">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary border-border"
                    onClick={() => setShowPrivacyModal(false)}
                  >
                    Full Privacy Policy
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Ezyify is GDPR-compliant and does not collect PII without consent.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPrivacyModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}