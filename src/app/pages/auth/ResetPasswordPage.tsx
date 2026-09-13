import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Lock, ShieldCheck } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { PasswordStrength, isStrongPassword } from '../../components/primitives/PasswordStrength';
import { AuthLayout } from '../../features/auth/AuthLayout';
import { fadeUp, springSoft } from '../../lib/motion';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => navigate('/login', { replace: true }), 2200);
    return () => window.clearTimeout(t);
  }, [done, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isStrongPassword(password)) next.password = 'Password doesn’t meet all requirements yet';
    if (confirm !== password) next.confirm = 'Passwords don’t match';
    setErrors(next);
    setTouchedConfirm(true);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
  };

  const confirmOk = touchedConfirm && confirm.length > 0 && confirm === password;

  if (!token) {
    return (
      <AuthLayout
        title="This link has expired"
        subtitle="Password reset links are valid for 30 minutes. Request a fresh one and we’ll email it right away."
        backTo="/login"
        backLabel="Sign in"
        hero={
          <div className="mx-auto flex size-28 items-center justify-center rounded-[28px] bg-error-subtle text-error sm:size-32">
            <Lock className="size-14" strokeWidth={1.6} />
          </div>
        }
      >
        <SEO title="Link expired — Ezyify" />
        <motion.div variants={fadeUp}>
          <Button asChild size="xl" fullWidth variant="gradient">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={done ? 'Password updated' : 'Create a new password'}
      subtitle={
        done
          ? 'You’re all set. Redirecting you to sign in…'
          : 'Choose something strong you haven’t used on Ezyify before.'
      }
      backTo={done ? undefined : '/login'}
      backLabel="Sign in"
      hero={
        <motion.div
          key={done ? 'done' : 'form'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springSoft}
          className={
            done
              ? 'mx-auto flex size-28 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg sm:size-32'
              : 'mx-auto flex size-28 items-center justify-center rounded-[28px] bg-primary-subtle text-primary sm:size-32'
          }
        >
          {done ? <Check className="size-14" strokeWidth={3} /> : <ShieldCheck className="size-14" strokeWidth={1.6} />}
        </motion.div>
      }
    >
      <SEO title="New password — Ezyify" description="Set a new password for your Ezyify account." />
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <Button asChild size="xl" fullWidth variant="gradient">
              <Link to="/login">Sign in now</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} noValidate className="space-y-4" exit={{ opacity: 0 }}>
            <motion.div variants={fadeUp} className="space-y-3">
              <Field
                label="New password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((er) => ({ ...er, password: undefined }));
                }}
                error={errors.password}
                leftIcon={<Lock className="size-5" />}
                autoFocus
              />
              <AnimatePresence initial={false}>
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <PasswordStrength value={password} className="px-1" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Field
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (errors.confirm) setErrors((er) => ({ ...er, confirm: undefined }));
                }}
                onBlur={() => setTouchedConfirm(true)}
                error={errors.confirm}
                success={confirmOk ? 'Passwords match' : undefined}
                leftIcon={<Lock className="size-5" />}
              />
            </motion.div>
            <motion.div variants={fadeUp} className="pt-2">
              <Button type="submit" size="xl" fullWidth variant="gradient" loading={submitting} loadingText="Updating…">
                Update password
              </Button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
