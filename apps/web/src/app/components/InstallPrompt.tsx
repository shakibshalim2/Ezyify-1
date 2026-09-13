import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    try {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone) { setIsInstalled(true); return; }

      let daysSinceDismissed = 999;
      try {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
          daysSinceDismissed = Math.floor(
            (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24)
          );
        }
      } catch {}

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        if (daysSinceDismissed > 7) {
          setTimeout(() => setShowPrompt(true), 5000);
        }
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setShowPrompt(false);
        try { localStorage.removeItem('pwa-install-dismissed'); } catch {}
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    } catch {}
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    } else {
      try { localStorage.setItem('pwa-install-dismissed', new Date().toISOString()); } catch {}
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try { localStorage.setItem('pwa-install-dismissed', new Date().toISOString()); } catch {}
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          showPrompt ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleDismiss}
      />

      {/* Install Prompt Card */}
      <div
        className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96
                    bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden
                    transition-all duration-300 ${
          showPrompt
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-24 scale-95 pointer-events-none'
        }`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-2xl">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-2">Install Ezyify App</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Install Ezyify on your device for a faster, native app experience.
            Access your E-Commerce Social Media Ecosystem instantly — shop, share, and connect anywhere.
          </p>

          <div className="space-y-2 mb-6">
            {['Works offline with cached content', 'Faster loading and performance', 'Native app-like experience'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                         bg-primary hover:bg-primary-hover text-primary-foreground
                         rounded-xl font-medium transition-all duration-200
                         hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 text-muted-foreground hover:text-foreground
                         hover:bg-muted rounded-xl font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      </div>
    </>
  );
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) { setIsInstalled(true); return; }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => { setIsInstalled(true); setDeferredPrompt(null); };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium
                 text-foreground hover:text-primary bg-muted hover:bg-muted/80
                 rounded-xl transition-colors"
      title="Install Ezyify App"
    >
      <Download className="w-4 h-4" />
      <span>Install App</span>
    </button>
  );
}
