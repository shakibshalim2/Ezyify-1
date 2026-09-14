import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { SocialButton } from '../../components/primitives/SocialButton';
import { PasswordStrength, isStrongPassword } from '../../components/primitives/PasswordStrength';
import { AuthDivider, AuthLayout } from '../../features/auth/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp } from '../../lib/motion';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (touched[key]) setErrors((e) => ({ ...e, [key]: validateField(key, { ...form, [key]: value }) }));
  };

  const blur = (key: keyof FormState) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((e) => ({ ...e, [key]: validateField(key, form) }));
  };

  function validateField(key: keyof FormState, f: FormState): string | undefined {
    switch (key) {
      case 'name':
        return f.name.trim().length < 2 ? 'Enter your full name' : undefined;
      case 'email':
        return !EMAIL_RE.test(f.email.trim()) ? 'Enter a valid email address' : undefined;
      case 'password':
        return !isStrongPassword(f.password) ? 'Password doesn’t meet all requirements yet' : undefined;
      case 'confirm':
        return f.confirm !== f.password ? 'Passwords don’t match' : undefined;
      case 'terms':
        return !f.terms ? 'Please accept the Terms to continue' : undefined;
    }
  }

  const validateAll = () => {
    const next: Errors = {};
    (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
      const msg = validateField(k, form);
      if (msg) next[k] = msg;
    });
    setErrors(next);
    setTouched({ name: true, email: true, password: true, confirm: true, terms: true });
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    setSubmitting(true);
    try {
      const { userId } = await signup(form.email.trim(), form.password, form.name.trim());
      navigate('/otp-verification', {
        state: { channel: 'email', destination: form.email.trim(), next: '/onboarding/interests', userId },
      });
    } catch (err) {
      const { fields, message } = formErrors(err, 'We couldn’t create your account. Please try again.');
      if (Object.keys(fields).length) {
        setErrors(e => ({ ...e, ...fields }));
        setTouched(t => ({ ...t, ...Object.fromEntries(Object.keys(fields).map(k => [k, true])) }));
      } else toast.error(message ?? 'We couldn’t create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const social = (provider: string) => toast.info(`${provider} sign-up will be available soon`);
  const confirmOk = touched.confirm && form.confirm.length > 0 && form.confirm === form.password;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join millions discovering, shopping and selling on Ezyify."
      backTo="/welcome"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SEO title="Create account — Ezyify" description="Join Ezyify — shop, create, sell and connect." />

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        <SocialButton provider="google" compact onClick={() => social('Google')} />
        <SocialButton provider="apple" compact onClick={() => social('Apple')} />
        <SocialButton provider="facebook" compact onClick={() => social('Facebook')} />
      </motion.div>

      <motion.div variants={fadeUp} className="my-6">
        <AuthDivider label="or sign up with email" />
      </motion.div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <motion.div variants={fadeUp}>
          <Field
            label="Full name"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            onBlur={() => blur('name')}
            error={errors.name}
            success={!!(touched.name && !errors.name && form.name)}
            leftIcon={<User className="size-5" />}
            autoFocus
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Field
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            onBlur={() => blur('email')}
            error={errors.email}
            success={!!(touched.email && !errors.email && form.email)}
            leftIcon={<Mail className="size-5" />}
          />
        </motion.div>
        <motion.div variants={fadeUp} className="space-y-3">
          <Field
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            onBlur={() => blur('password')}
            error={errors.password}
            leftIcon={<Lock className="size-5" />}
          />
          <AnimatePresence initial={false}>
            {form.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <PasswordStrength value={form.password} className="px-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Field
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            onBlur={() => blur('confirm')}
            error={errors.confirm}
            success={confirmOk ? 'Passwords match' : undefined}
            leftIcon={<Lock className="size-5" />}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-1.5 pt-1">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground-secondary">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => {
                set('terms', e.target.checked);
                setTouched((t) => ({ ...t, terms: true }));
                setErrors((er) => ({ ...er, terms: e.target.checked ? undefined : er.terms }));
              }}
              aria-invalid={!!errors.terms}
              className="mt-0.5 size-4 shrink-0 rounded border-border"
            />
            <span>
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-foreground underline-offset-2 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-foreground underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && (
            <p role="alert" className="pl-7 text-xs text-error">
              {errors.terms}
            </p>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="pt-2">
          <Button
            type="submit"
            size="xl"
            fullWidth
            variant="gradient"
            loading={submitting}
            loadingText="Creating account…"
            rightIcon={<ArrowRight className="size-5" />}
          >
            Create account
          </Button>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
