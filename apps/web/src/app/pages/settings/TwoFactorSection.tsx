import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Check, Copy, KeyRound, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import { useMfaActions, useMfaStatus, type MfaSetupResponse } from '@ezyify/core';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { OTPInput } from '../../components/primitives/OTPInput';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp } from '../../lib/motion';

type Step = 'idle' | 'scan' | 'codes' | 'disable';

/** Two-factor (TOTP) management on the real API: status → setup (QR + manual key) → enable → recovery codes → disable. */
export function TwoFactorSection() {
  const status = useMfaStatus();
  const { setup, enable, disable } = useMfaActions();
  const [step, setStep] = useState<Step>('idle');
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!setupData) return;
    let alive = true;
    import('qrcode')
      .then(m => m.toDataURL(setupData.otpauthUrl, { margin: 1, width: 220, color: { dark: '#0A0D14', light: '#FFFFFF' } }))
      .then(url => alive && setQr(url))
      .catch(() => alive && setQr(null));
    return () => {
      alive = false;
    };
  }, [setupData]);

  const begin = async () => {
    setError(undefined);
    try {
      const data = await setup.mutateAsync();
      setSetupData(data);
      setCode('');
      setStep('scan');
    } catch (err) {
      toast.error(formErrors(err, 'Could not start two-factor setup').message ?? 'Could not start two-factor setup');
    }
  };

  const confirm = async (value: string) => {
    if (value.length < 6 || enable.isPending) return;
    setError(undefined);
    try {
      const res = await enable.mutateAsync(value);
      setRecoveryCodes(res.recoveryCodes);
      setStep('codes');
      toast.success('Two-factor authentication is on');
    } catch (err) {
      const e = formErrors(err, 'That code didn’t match. Codes rotate every 30 seconds — try the newest one.');
      setError(e.fields.code ?? e.message ?? 'That code didn’t match.');
      setCode('');
    }
  };

  const turnOff = async () => {
    if (disableCode.trim().length < 6 || disable.isPending) return;
    setError(undefined);
    try {
      await disable.mutateAsync(disableCode.trim());
      setStep('idle');
      setDisableCode('');
      toast.success('Two-factor authentication turned off');
    } catch (err) {
      const e = formErrors(err, 'That code didn’t match.');
      setError(e.fields.code ?? e.message ?? 'That code didn’t match.');
    }
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — select the codes and copy them manually');
    }
  };

  const close = () => {
    setStep('idle');
    setError(undefined);
    setCode('');
    setDisableCode('');
    setQr(null);
    setSetupData(null);
  };

  const enabled = status.data?.enabled ?? false;
  const required = status.data?.requiredForRole ?? false;

  return (
    <div className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <Smartphone className="size-5" />
        Two-factor authentication
      </h2>
      <Card className="border-border">
        <CardContent className="space-y-4 pt-6">
          {status.isLoading ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div className="flex flex-1 items-center gap-3">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${enabled ? 'bg-success-subtle text-success' : 'bg-primary/15 text-primary'}`}>
                  {enabled ? <ShieldCheck className="size-5" /> : <Smartphone className="size-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Authenticator app</p>
                  <p className="text-xs text-foreground-secondary">
                    {enabled
                      ? `On · ${status.data?.recoveryCodesLeft ?? 0} recovery codes left`
                      : 'Google Authenticator, 1Password, Authy or any TOTP app'}
                  </p>
                </div>
              </div>
              {enabled ? (
                <Button size="sm" variant="outline" leftIcon={<ShieldOff className="size-4" />} onClick={() => setStep('disable')}>
                  Turn off
                </Button>
              ) : (
                <Button size="sm" loading={setup.isPending} onClick={begin}>
                  Set up
                </Button>
              )}
            </motion.div>
          )}

          {required && !enabled && !status.isLoading && (
            <div role="status" className="rounded-lg border border-warning/40 bg-warning-subtle p-3 text-xs text-foreground">
              <strong className="font-semibold">Required for your account.</strong> Seller and admin accounts must protect payouts and customer data with two-factor authentication.
            </div>
          )}
          <div className="rounded-lg border border-info/40 bg-info/5 p-3">
            <p className="text-xs text-foreground-secondary">You’ll enter a 6-digit code from your authenticator app whenever you sign in on a new device. Recovery codes get you back in if you lose the phone.</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={step !== 'idle'} onOpenChange={open => !open && step !== 'codes' && close()}>
        <DialogContent className="max-w-md">
          <AnimatePresence mode="wait">
            {step === 'scan' && setupData && (
              <motion.div key="scan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <DialogHeader>
                  <DialogTitle>Scan with your authenticator</DialogTitle>
                  <DialogDescription>Open your authenticator app, scan the code, then enter the 6 digits it shows.</DialogDescription>
                </DialogHeader>
                <div className="my-5 flex flex-col items-center gap-4">
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    {qr ? <img src={qr} alt="QR code for your authenticator app" width={220} height={220} className="block" /> : <Skeleton className="size-[220px] rounded-xl" />}
                  </div>
                  <details className="w-full text-center text-xs text-foreground-secondary">
                    <summary className="cursor-pointer font-medium text-primary">Can’t scan? Enter the key manually</summary>
                    <code className="mt-2 block select-all break-all rounded-lg bg-muted px-3 py-2 font-mono text-sm tracking-wider text-foreground">{setupData.secret}</code>
                  </details>
                  <OTPInput value={code} onChange={v => { setCode(v); if (error) setError(undefined); }} onComplete={confirm} error={!!error} disabled={enable.isPending} aria-label="Authenticator code" autoFocus />
                  {error && (
                    <p role="alert" className="text-center text-sm text-error">
                      {error}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={close}>
                    Cancel
                  </Button>
                  <Button loading={enable.isPending} disabled={code.length < 6} onClick={() => confirm(code)}>
                    Turn on
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {step === 'codes' && (
              <motion.div key="codes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <KeyRound className="size-5 text-primary" /> Save your recovery codes
                  </DialogTitle>
                  <DialogDescription>Each code signs you in once if you lose your authenticator. Store them somewhere safe — they won’t be shown again.</DialogDescription>
                </DialogHeader>
                <ul className="my-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-4 font-mono text-sm tracking-wider text-foreground">
                  {recoveryCodes.map(c => (
                    <li key={c} className="select-all">
                      {c}
                    </li>
                  ))}
                </ul>
                <DialogFooter className="gap-2">
                  <Button variant="outline" leftIcon={copied ? <Check className="size-4" /> : <Copy className="size-4" />} onClick={copyCodes}>
                    {copied ? 'Copied' : 'Copy codes'}
                  </Button>
                  <Button onClick={close}>I’ve saved them</Button>
                </DialogFooter>
              </motion.div>
            )}

            {step === 'disable' && (
              <motion.div key="disable" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <DialogHeader>
                  <DialogTitle>Turn off two-factor authentication?</DialogTitle>
                  <DialogDescription>Your account will only be protected by your password. Confirm with a code from your authenticator or a recovery code.</DialogDescription>
                </DialogHeader>
                <form
                  className="my-5"
                  onSubmit={e => {
                    e.preventDefault();
                    void turnOff();
                  }}
                >
                  <Field label="Authenticator or recovery code" placeholder="123456 or xxxxx-xxxxx" autoComplete="one-time-code" autoCapitalize="off" spellCheck={false} value={disableCode} onChange={e => setDisableCode(e.target.value)} error={error} autoFocus />
                </form>
                <DialogFooter>
                  <Button variant="ghost" onClick={close}>
                    Keep it on
                  </Button>
                  <Button variant="destructive" loading={disable.isPending} disabled={disableCode.trim().length < 6} onClick={turnOff}>
                    Turn off
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
