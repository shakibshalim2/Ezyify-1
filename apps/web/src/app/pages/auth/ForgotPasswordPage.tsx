import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { KeyRound, Mail, MailOpen } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { AuthLayout } from '../../features/auth/AuthLayout';
import { fadeUp, springSoft } from '../../lib/motion';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter the email you signed up with');
      return;
    }
    setError(undefined);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSent(true);
  };

  return (
    <AuthLayout
      title={sent ? 'Check your inbox' : 'Forgot your password?'}
      subtitle={
        sent ? (
          <>
            We sent a reset link to <span className="font-semibold text-foreground">{email}</span>. It expires in
            30 minutes.
          </>
        ) : (
          'No worries — enter your email and we’ll send you a link to reset it.'
        )
      }
      backTo="/login"
      backLabel="Sign in"
      hero={
        <motion.div
          key={sent ? 'sent' : 'ask'}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springSoft}
          className="mx-auto flex size-28 items-center justify-center rounded-[28px] bg-primary-subtle text-primary sm:size-32"
        >
          {sent ? <MailOpen className="size-14" strokeWidth={1.6} /> : <KeyRound className="size-14" strokeWidth={1.6} />}
        </motion.div>
      }
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <SEO title="Reset password — Ezyify" description="Reset your Ezyify password." />
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-border bg-background-elevated p-4 text-sm text-foreground-secondary">
              Didn’t get it? Check your spam folder, or make sure the address is correct.
            </div>
            <Button size="lg" fullWidth variant="outline" onClick={() => setSent(false)}>
              Use a different email
            </Button>
            <Button size="lg" fullWidth variant="ghost" onClick={handleSubmit} loading={submitting}>
              Resend link
            </Button>
          </motion.div>
        ) : (
          <motion.form key="ask" onSubmit={handleSubmit} noValidate className="space-y-5" exit={{ opacity: 0 }}>
            <motion.div variants={fadeUp}>
              <Field
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                leftIcon={<Mail className="size-5" />}
                autoFocus
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Button type="submit" size="xl" fullWidth variant="gradient" loading={submitting} loadingText="Sending…">
                Send reset link
              </Button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
