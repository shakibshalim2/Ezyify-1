import { SEO } from '../components/SEO';
import { AlertTriangle, WifiOff, Wrench, Home, RefreshCw, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { EzyifyLogo } from '../components/EzyifyLogo';

interface ErrorPageProps {
  type?: 'offline' | 'notfound' | 'error' | 'maintenance';
  message?: string;
}

export default function ErrorPage({ type = 'error', message }: ErrorPageProps) {
  const navigate = useNavigate();

  const errorConfigs = {
    offline: {
      icon: WifiOff,
      code: null,
      title: 'No Internet Connection',
      description: 'Please check your connection and try again. Your cart and wishlist are saved.',
      accent: 'bg-info/10 text-info',
    },
    notfound: {
      icon: AlertTriangle,
      code: '404',
      title: 'Page Not Found',
      description: "The page you're looking for doesn't exist or has been moved to another location.",
      accent: 'bg-warning/10 text-warning',
    },
    error: {
      icon: AlertTriangle,
      code: '500',
      title: 'Something Went Wrong',
      description: message || 'We encountered an unexpected error. Our team has been notified and is looking into it.',
      accent: 'bg-error/10 text-error',
    },
    maintenance: {
      icon: Wrench,
      code: null,
      title: 'Under Maintenance',
      description: "We're making Ezyify better. We'll be back online shortly — usually within a few minutes.",
      accent: 'bg-primary/10 text-primary',
    },
  };

  const config = errorConfigs[type];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SEO title={`${config.title} — Ezyify`} description={config.description} />
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-6" style={{ background: 'var(--brand-gradient)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5" style={{ background: 'var(--brand-purple)', filter: 'blur(90px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <EzyifyLogo size={40} />
        </div>

        {/* Error code */}
        {config.code && (
          <p className="text-7xl font-black text-brand-gradient mb-4 tracking-tight leading-none">
            {config.code}
          </p>
        )}

        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-5 ${config.accent}`}>
          <Icon className="w-7 h-7" />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-foreground mb-3">{config.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
          {config.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
          {type === 'offline' || type === 'maintenance' ? (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white shadow-brand hover:shadow-brand-lg transition-all"
              style={{ background: 'var(--brand-gradient)' }}
            >
              <RefreshCw className="w-4 h-4" />
              {type === 'offline' ? 'Try Again' : 'Check Status'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white shadow-brand hover:shadow-brand-lg transition-all"
              style={{ background: 'var(--brand-gradient)' }}
            >
              <Home className="w-4 h-4" />
              Go to Home
            </button>
          )}

          {type !== 'maintenance' && type !== 'offline' && (
            <Button onClick={() => navigate(-1)} variant="outline" size="lg" className="w-full gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          )}

          {type !== 'maintenance' && (
            <Button onClick={() => navigate('/help')} variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
              <HelpCircle className="w-4 h-4" />
              Help & Support
            </Button>
          )}
        </div>

        {type === 'error' && (
          <p className="text-xs text-muted-foreground mt-6">
            If this keeps happening,{' '}
            <Link to="/contact" className="text-primary hover:underline font-medium">contact our support team</Link>
          </p>
        )}
      </div>
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
