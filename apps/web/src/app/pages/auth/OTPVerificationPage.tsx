import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Check, MailCheck, MessageSquareText, RefreshCw } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { OTPInput } from '../../components/primitives/OTPInput';
import { AuthLayout } from '../../features/auth/AuthLayout';
import { fadeUp, springSoft } from '../../lib/motion';

interface OTPState {
  channel?: 'email' | 'sms';
  destination?: string;
  next?: string;
}

const RESEND_SECONDS = 45;
/** Demo-only: any code ending in 0 is accepted until the API is wired. */
const DEMO_VALID = (code: string) => code.endsWith('0') || code === '123456';

function maskDestination(value: string, channel: 'email' | 'sms') {
  if (channel === 'email') {
    const [user, domain] = value.split('@');
    if (!domain) return value;
    return `${user.slice(0, 2)}${'•'.repeat(Math.max(2, user.length - 2))}@${domain}`;
  }
  return value.replace(/\d(?=\d{3})/g, '•');
}

export default function OTPVerificationPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: OTPState | null };
  const channel = state?.channel ?? 'email';
  const destination = state?.destination ?? 'your email';
  const next = state?.next ?? '/onboarding/interests';

  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const verify = async (value: string) => {
    if (verifying || verified) return;
    setVerifying(true);
    setError(false);
    await new Promise((r) => setTimeout(r, 600));
    if (DEMO_VALID(value)) {
      setVerified(true);
      window.setTimeout(() => navigate(next, { replace: true }), 900);
    } else {
      setError(true);
      setAttempts((a) => a + 1);
      setCode('');
      setVerifying(false);
    }
  };

  const resend = () => {
    setSeconds(RESEND_SECONDS);
    setCode('');
    setError(false);
    toast.success(`New code sent to ${maskDestination(destination, channel)}`);
  };

  const Icon = channel === 'email' ? MailCheck : MessageSquareText;

  return (
    <AuthLayout
      title="Enter the 6‑digit code"
      subtitle={
        <>
          We sent it to <span className="font-semibold text-foreground">{maskDestination(destination, channel)}</span>
          {channel === 'sms' ? ' by SMS.' : '.'}{' '}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="font-medium text-primary hover:underline"
          >
            Change
          </button>
        </>
      }
      backTo={channel === 'sms' ? '/login' : '/signup'}
      hero={
        <div className="mx-auto flex size-28 items-center justify-center rounded-[28px] bg-primary-subtle text-primary sm:size-32">
          <Icon className="size-14" strokeWidth={1.6} />
        </div>
      }
    >
      <SEO title="Verify code — Ezyify" description="Enter the verification code we sent you." />

      <motion.div variants={fadeUp} className="relative">
        <AnimatePresence mode="wait">
          {verified ? (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springSoft}
              className="flex flex-col items-center gap-3 py-6 text-center"
              role="status"
            >
              <span className="flex size-20 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg">
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...springSoft, delay: 0.1 }}
                >
                  <Check className="size-10" strokeWidth={3} />
                </motion.span>
              </span>
              <p className="font-display text-xl font-semibold">Verified!</p>
              <p className="text-sm text-foreground-secondary">Taking you in…</p>
            </motion.div>
          ) : (
            <motion.div key="input" exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <OTPInput
                value={code}
                onChange={(v) => {
                  setCode(v);
                  if (error) setError(false);
                }}
                onComplete={verify}
                error={error}
                disabled={verifying}
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-sm text-error"
                  >
                    That code isn’t right. {attempts >= 3 ? 'Request a new one below.' : 'Please try again.'}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!verified && (
        <>
          <motion.div variants={fadeUp} className="mt-6">
            <Button
              size="xl"
              fullWidth
              variant="gradient"
              loading={verifying}
              loadingText="Verifying…"
              disabled={code.length < 6}
              onClick={() => verify(code)}
            >
              Verify
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 text-center text-sm text-foreground-secondary">
            {seconds > 0 ? (
              <p>
                Resend code in{' '}
                <span className="font-semibold tabular-nums text-foreground">
                  0:{String(seconds).padStart(2, '0')}
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={resend}
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 font-semibold text-primary transition hover:bg-primary-subtle"
              >
                <RefreshCw className="size-4" />
                Resend code
              </button>
            )}
          </motion.div>
        </>
      )}
    </AuthLayout>
  );
}
