import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router';
import { EzyifyLogo } from '../../components/EzyifyLogo';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setLoginError('Email is required'); return; }
    if (!password.trim()) { setLoginError('Password is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setLoginError('Please enter a valid email address'); return; }
    setLoginError('');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Sign In — Ezyify" description="Sign in to your Ezyify account and continue shopping, creating, and connecting." />
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
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your Ezyify account</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-3xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-card text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-card text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-sm text-foreground">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover">
                Forgot password?
              </Link>
            </div>

            {loginError && (
              <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-2">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98] shadow-brand hover:shadow-brand-lg"
              style={{ background: 'var(--brand-gradient)' }}
            >
              Sign In
            </button>

            {/* Privacy Notice */}
            <p className="text-xs text-center text-muted-foreground -mt-2">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline font-medium">
                Terms
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'G', color: '#4285F4' },
              { label: '🍎', color: '#000' },
              { label: 'f', color: '#1877F2' },
            ].map(({ label, color }) => (
              <button key={label} type="button" className="py-3 border border-border rounded-xl hover:bg-muted hover:border-border-strong transition-all duration-150 font-bold text-sm" style={{ color }}>
                {label}
              </button>
            ))}
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-hover font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Guest Mode */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Continue as guest →
          </Link>
        </div>
      </div>
    </div>
  );
}