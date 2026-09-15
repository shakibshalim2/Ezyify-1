import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Check, KeyRound, ShieldCheck } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { OTPInput } from '../../components/primitives/OTPInput';
import { AuthLayout } from '../../features/auth/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, springSoft } from '../../lib/motion';

interface TwoFactorState {
  challengeToken?: string;
  next?: string;
}

/** Login step-up for accounts with TOTP enabled — reached from `/login` with a challenge token in route state. */
export default function TwoFactorPage() {
  const navigate = useNavigate();
  const { verifyMfa } = useAuth();
  const { state } = useLocation() as { state: TwoFactorState | null };
  const challengeToken = state?.challengeToken;
  const next = state?.next ?? '/';

  const [useRecovery, setUseRecovery] = useState(false);
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState('');
  const [error, setError] = useState<string | false>(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  if (!challengeToken) return <Navigate to="/login" replace />;

  const submit = async (value: string) => {
    if (verifying || verified || !value) return;
    setVerifying(true);
    setError(false);
    try {
      await verifyMfa(challengeToken, value);
      setVerified(true);
      toast.success('Welcome back!');
      window.setTimeout(() => navigate(next, { replace: true }), 700);
    } catch (err) {
      const e = formErrors(err, 'That code isn’t right. Check your authenticator and try again.');
      const expired = /expired|invalid challenge|sign in again|too many/i.test(e.message ?? '');
      setError(e.fields.code ?? e.message ?? 'That code isn’t right.');
      setCode('');
      setVerifying(false);
      if (expired) window.setTimeout(() => navigate('/login', { replace: true }), 1800);
    }
  };

  const onRecoverySubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(recovery.trim());
  };

  return (
    <AuthLayout
      title="Two-factor check"
      subtitle={useRecovery ? 'Enter one of the recovery codes you saved when you set up two-factor authentication.' : 'Open your authenticator app and enter the 6-digit code for Ezyify.'}
      backTo="/login"
      backLabel="Back to sign in"
      hero={
        <div className="mx-auto flex size-28 items-center justify-center rounded-[28px] bg-primary-subtle text-primary sm:size-32">
          <ShieldCheck className="size-14" strokeWidth={1.6} />
        </div>
      }
    >
      <SEO title="Two-factor authentication — Ezyify" description="Confirm your sign-in with your authenticator app." noindex />

      <motion.div variants={fadeUp} className="relative">
        <AnimatePresence mode="wait">
          {verified ? (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={springSoft} className="flex flex-col items-center gap-3 py-6 text-center" role="status">
              <span className="flex size-20 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg">
                <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...springSoft, delay: 0.1 }}>
                  <Check className="size-10" strokeWidth={3} />
                </motion.span>
              </span>
              <p className="font-display text-xl font-semibold">You’re in</p>
              <p className="text-sm text-foreground-secondary">Taking you back…</p>
            </motion.div>
          ) : useRecovery ? (
            <motion.form key="recovery" onSubmit={onRecoverySubmit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4" noValidate>
              <Field
                label="Recovery code"
                placeholder="xxxxx-xxxxx"
                autoComplete="one-time-code"
                autoCapitalize="off"
                spellCheck={false}
                value={recovery}
                onChange={e => setRecovery(e.target.value)}
                error={error || undefined}
                hint="Each recovery code works once."
                leftIcon={<KeyRound className="size-5" />}
                autoFocus
              />
              <Button type="submit" size="xl" fullWidth variant="gradient" loading={verifying} loadingText="Checking…" disabled={recovery.trim().length < 6}>
                Use recovery code
              </Button>
            </motion.form>
          ) : (
            <motion.div key="totp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <OTPInput
                value={code}
                onChange={v => {
                  setCode(v);
                  if (error) setError(false);
                }}
                onComplete={submit}
                error={!!error}
                disabled={verifying}
                aria-label="Authenticator code"
              />
              <AnimatePresence>
                {error && (
                  <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center text-sm text-error">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
              <Button size="xl" fullWidth variant="gradient" loading={verifying} loadingText="Verifying…" disabled={code.length < 6} onClick={() => void submit(code)}>
                Verify
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!verified && (
        <motion.div variants={fadeUp} className="mt-6 text-center text-sm text-foreground-secondary">
          <button
            type="button"
            onClick={() => {
              setUseRecovery(v => !v);
              setError(false);
              setCode('');
            }}
            className="font-medium text-primary hover:underline"
          >
            {useRecovery ? 'Use my authenticator app instead' : 'Lost your device? Use a recovery code'}
          </button>
        </motion.div>
      )}
    </AuthLayout>
  );
}
