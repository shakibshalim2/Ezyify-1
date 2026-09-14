import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Camera, Check, MapPin, PartyPopper, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { SetupLayout } from '../../features/onboarding/SetupLayout';
import { cn } from '../../components/ui/utils';
import { fadeUp, springSnappy, springSoft } from '../../lib/motion';
import { storage } from '../../lib/storage';

type PermissionId = 'notifications' | 'camera' | 'location';
type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied';

interface Permission {
  id: PermissionId;
  icon: LucideIcon;
  title: string;
  description: string;
  benefit: string;
  tint: string;
}

const PERMISSIONS: Permission[] = [
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Order updates, replies and when creators you follow go live.',
    benefit: 'Never miss a delivery or a live drop',
    tint: 'bg-primary-subtle text-primary',
  },
  {
    id: 'camera',
    icon: Camera,
    title: 'Camera & photos',
    description: 'Post Loops and stories, and add photos to reviews.',
    benefit: 'Needed to create content',
    tint: 'bg-accent-brand-subtle text-accent-brand',
  },
  {
    id: 'location',
    icon: MapPin,
    title: 'Location',
    description: 'Nearby shops, local deals and accurate delivery estimates.',
    benefit: 'Optional — approximate only',
    tint: 'bg-success-subtle text-success',
  },
];

export const PERMISSIONS_KEY = 'ezyify.onboarding.permissions';

/** Requests the real browser permission where one exists; falls back to a granted stub. */
async function requestBrowserPermission(id: PermissionId): Promise<PermissionState> {
  try {
    if (id === 'notifications' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      return result === 'granted' ? 'granted' : 'denied';
    }
    if (id === 'location' && 'geolocation' in navigator) {
      return await new Promise<PermissionState>((resolve) =>
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          () => resolve('denied'),
          { timeout: 8000, maximumAge: 600000 },
        ),
      );
    }
    if (id === 'camera' && navigator.mediaDevices?.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      return 'granted';
    }
  } catch {
    return 'denied';
  }
  await new Promise((r) => setTimeout(r, 400));
  return 'granted';
}

export default function PermissionsPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<Record<PermissionId, PermissionState>>(() =>
    storage.get(PERMISSIONS_KEY, { notifications: 'idle', camera: 'idle', location: 'idle' }),
  );
  const grantedCount = Object.values(state).filter((s) => s === 'granted').length;

  const request = async (id: PermissionId) => {
    setState((s) => ({ ...s, [id]: 'requesting' }));
    const result = await requestBrowserPermission(id);
    setState((s) => {
      const nextState = { ...s, [id]: result };
      storage.set(PERMISSIONS_KEY, nextState);
      return nextState;
    });
  };

  const finish = () => {
    storage.set(PERMISSIONS_KEY, state);
    navigate('/', { replace: true });
  };

  return (
    <SetupLayout
      step="permissions"
      title="A few quick permissions"
      subtitle="Turn these on for the best experience. You stay in control and can change any of them in Settings."
      icon={<ShieldCheck className="size-7" />}
      backTo="/onboarding/follow-suggestions"
      onSkip={finish}
      footer={
        <div className="flex items-center gap-3">
          <p className="flex-1 text-sm text-foreground-secondary" aria-live="polite">
            {grantedCount === PERMISSIONS.length
              ? 'All set!'
              : `${grantedCount} of ${PERMISSIONS.length} enabled`}
          </p>
          <Button size="lg" variant="gradient" onClick={finish} rightIcon={<PartyPopper className="size-5" />}>
            {grantedCount ? 'Start exploring' : 'Maybe later'}
          </Button>
        </div>
      }
    >
      <SEO title="Permissions — Ezyify" description="Set up notifications, camera and location for Ezyify." />

      <motion.ul variants={fadeUp} className="space-y-3" aria-label="Permissions">
        {PERMISSIONS.map((p) => {
          const s = state[p.id];
          const Icon = p.icon;
          const granted = s === 'granted';
          return (
            <li key={p.id}>
              <div
                className={cn(
                  'flex items-start gap-4 rounded-2xl border bg-background-elevated p-4 transition-colors',
                  granted ? 'border-success/40' : 'border-border',
                )}
              >
                <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl', p.tint)}>
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold leading-tight">{p.title}</p>
                      <p className="mt-1 text-sm text-foreground-secondary">{p.description}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-medium text-foreground-tertiary">{p.benefit}</p>
                  <div className="mt-3">
                    <AnimatePresence mode="wait" initial={false}>
                      {granted ? (
                        <motion.span
                          key="granted"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={springSoft}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-success-subtle px-3 text-sm font-semibold text-success"
                        >
                          <Check className="size-4" strokeWidth={3} /> Enabled
                        </motion.span>
                      ) : (
                        <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                          <motion.div whileTap={{ scale: 0.96 }} transition={springSnappy}>
                            <Button
                              size="sm"
                              variant={s === 'denied' ? 'outline' : 'primary'}
                              loading={s === 'requesting'}
                              loadingText="Asking…"
                              onClick={() => request(p.id)}
                            >
                              {s === 'denied' ? 'Try again' : 'Enable'}
                            </Button>
                          </motion.div>
                          {s === 'denied' && (
                            <span className="text-xs text-warning">Blocked — allow it in browser settings</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </motion.ul>

      <motion.p variants={fadeUp} className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-foreground-tertiary">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        We only use these while you’re using Ezyify and never sell your data. Read our{' '}
        <a href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </motion.p>
    </SetupLayout>
  );
}
