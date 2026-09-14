import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Fingerprint, Lock, Mail, Phone } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { SocialButton } from '../../components/primitives/SocialButton';
import { AuthDivider, AuthLayout } from '../../features/auth/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { fadeUp } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

type Mode = 'email' | 'phone';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{8,15}$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    const value = identifier.trim();
    if (!value) next.identifier = mode === 'email' ? 'Enter your email' : 'Enter your phone number';
    else if (mode === 'email' && !EMAIL_RE.test(value)) next.identifier = 'That email doesn’t look right';
    else if (mode === 'phone' && !PHONE_RE.test(value.replace(/[\s-]/g, '')))
      next.identifier = 'Enter a valid phone number with country code';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'phone') {
        navigate('/otp-verification', { state: { channel: 'sms', destination: identifier.trim(), next: '/' } });
        return;
      }
      await login(identifier.trim(), password);
      toast.success('Welcome back!');
      navigate('/');
    } catch {
      setErrors({ form: 'Incorrect email or password. Try again or reset your password.' });
    } finally {
      setSubmitting(false);
    }
  };

  const social = (provider: string) => toast.info(`${provider} sign-in will be available soon`);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to keep shopping, creating and connecting."
      footer={
        <>
          New to Ezyify?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SEO title="Sign in — Ezyify" description="Sign in to your Ezyify account." />

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        <SocialButton provider="google" compact onClick={() => social('Google')} />
        <SocialButton provider="apple" compact onClick={() => social('Apple')} />
        <SocialButton provider="facebook" compact onClick={() => social('Facebook')} />
      </motion.div>

      <motion.div variants={fadeUp} className="my-6">
        <AuthDivider label="or sign in with" />
      </motion.div>

      <motion.div variants={fadeUp} role="tablist" aria-label="Sign in method" className="mb-5 grid grid-cols-2 rounded-xl bg-muted p-1">
        {(['email', 'phone'] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setIdentifier('');
              setErrors({});
            }}
            className={cn(
              'relative h-10 rounded-lg text-sm font-medium capitalize transition-colors',
              mode === m ? 'text-foreground' : 'text-foreground-secondary hover:text-foreground',
            )}
          >
            {mode === m && (
              <motion.span
                layoutId="login-mode-pill"
                className="absolute inset-0 rounded-lg bg-background-elevated shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{m}</span>
          </button>
        ))}
      </motion.div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <motion.div variants={fadeUp}>
          {mode === 'email' ? (
            <Field
              key="email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={errors.identifier}
              leftIcon={<Mail className="size-5" />}
              autoFocus
            />
          ) : (
            <Field
              key="phone"
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+880 1XXX XXXXXX"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={errors.identifier}
              hint="We’ll text you a one‑time code"
              leftIcon={<Phone className="size-5" />}
              autoFocus
            />
          )}
        </motion.div>

        {mode === 'email' && (
          <motion.div variants={fadeUp}>
            <Field
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock className="size-5" />}
            />
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground-secondary">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-border"
            />
            Keep me signed in
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </motion.div>

        {errors.form && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-error/30 bg-error-subtle px-4 py-3 text-sm text-error"
          >
            {errors.form}
          </motion.p>
        )}

        <motion.div variants={fadeUp} className="space-y-3 pt-1">
          <Button type="submit" size="xl" fullWidth variant="gradient" loading={submitting} loadingText="Signing in…">
            {mode === 'email' ? 'Sign in' : 'Send code'}
          </Button>
          <Button
            type="button"
            size="lg"
            fullWidth
            variant="outline"
            leftIcon={<Fingerprint className="size-5" />}
            onClick={() => toast.info('Biometric sign‑in is available in the Ezyify app')}
          >
            Use fingerprint / face
          </Button>
        </motion.div>
      </form>

      <motion.p variants={fadeUp} className="mt-6 text-center text-xs leading-relaxed text-foreground-tertiary">
        By continuing you agree to our{' '}
        <Link to="/terms" className="font-medium text-foreground-secondary underline-offset-2 hover:underline">
          Terms
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="font-medium text-foreground-secondary underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </motion.p>
      <motion.div variants={fadeUp} className="mt-3 text-center">
        <Link to="/" className="text-sm text-foreground-secondary hover:text-foreground">
          Continue as guest →
        </Link>
      </motion.div>
    </AuthLayout>
  );
}
