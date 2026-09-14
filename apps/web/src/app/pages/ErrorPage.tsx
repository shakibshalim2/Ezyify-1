import { Link, useNavigate } from 'react-router';
import { AlertTriangle, ArrowLeft, Home, RefreshCw, WifiOff, Wrench } from 'lucide-react';
import { SEO } from '../components/SEO';
import { EzyifyLogo } from '../components/EzyifyLogo';
import { Button } from '../components/primitives/Button';
import { EmptyState } from '../components/primitives/EmptyState';
interface ErrorPageProps {
  type?: 'offline' | 'notfound' | 'error' | 'maintenance';
  message?: string;
}
const messages = {
  offline: {
    title: 'You’re offline',
    description: 'Check your connection. Your cart and wishlist will be waiting when you return.',
    icon: WifiOff,
    kind: 'offline' as const,
  },
  notfound: {
    title: 'Page not found',
    description: 'The page may have moved or the link may be incorrect.',
    icon: AlertTriangle,
    kind: 'error' as const,
  },
  error: {
    title: 'Something went wrong',
    description: 'We could not complete that request. Please try again in a moment.',
    icon: AlertTriangle,
    kind: 'error' as const,
  },
  maintenance: {
    title: 'We’re making improvements',
    description: 'Ezyify will be back shortly. Thanks for your patience.',
    icon: Wrench,
    kind: 'error' as const,
  },
};
export default function ErrorPage({ type = 'error', message }: ErrorPageProps) {
  const navigate = useNavigate();
  const config = messages[type];
  const Icon = config.icon;
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <SEO title={`${config.title} — Ezyify`} description={message || config.description} />
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary-subtle blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 size-72 rounded-full bg-accent-brand-subtle blur-3xl" />
      <main className="relative w-full max-w-md text-center">
        <EzyifyLogo size={40} />
        <div className="mt-8 flex justify-center">
          <span className="flex size-16 items-center justify-center rounded-sheet bg-primary-subtle text-primary">
            <Icon className="size-8" />
          </span>
        </div>
        <EmptyState
          kind={config.kind}
          title={config.title}
          description={message || config.description}
          className="py-6"
        />
        <div className="mx-auto flex max-w-xs flex-col gap-2">
          {type === 'offline' || type === 'maintenance' ? (
            <Button
              variant="gradient"
              size="lg"
              onClick={() => window.location.reload()}
              leftIcon={<RefreshCw />}
            >
              {type === 'offline' ? 'Try again' : 'Check status'}
            </Button>
          ) : (
            <Button variant="gradient" size="lg" onClick={() => navigate('/')} leftIcon={<Home />}>
              Go home
            </Button>
          )}
          {type === 'error' || type === 'notfound' ? (
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeft />}
            >
              Go back
            </Button>
          ) : null}
          <Button asChild variant="ghost">
            <Link to="/help">Help & support</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
export function NotFoundPage() {
  return <ErrorPage type="notfound" />;
}
export function OfflinePage() {
  return <ErrorPage type="offline" />;
}
export function MaintenancePage() {
  return <ErrorPage type="maintenance" />;
}
