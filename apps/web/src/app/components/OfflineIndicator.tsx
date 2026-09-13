import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsRetrying(false);
      if (wasOffline) {
        setTimeout(() => {
          setShowOfflineAlert(false);
          setWasOffline(false);
        }, 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch('/', { method: 'HEAD', cache: 'no-cache' });
      if (response.ok) {
        setIsOnline(true);
        setIsRetrying(false);
        window.location.reload();
      } else {
        setTimeout(() => setIsRetrying(false), 1000);
      }
    } catch {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  return (
    <>
      {/* Fixed Bottom Banner for Offline */}
      <div
        aria-hidden={isOnline}
        className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-300 ${
          !isOnline ? 'translate-y-0' : 'translate-y-full invisible'
        }`}
      >
        <Alert className="border-error bg-error/8">
          <WifiOff className="w-4 h-4 text-error" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-error">No Internet Connection</p>
              <p className="text-sm text-error">
                Some features may be unavailable. Check your connection and try again.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
              className="ml-4"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Checking...
                </>
              ) : (
                'Retry'
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>

      {/* Brief "Back Online" Notification */}
      <div
        aria-hidden={!(isOnline && wasOffline && showOfflineAlert)}
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ${
          isOnline && wasOffline && showOfflineAlert ? 'translate-y-0' : '-translate-y-[200%] invisible'
        }`}
      >
        <Alert className="border-success bg-success/5 shadow-lg">
          <Wifi className="w-4 h-4 text-success" />
          <AlertDescription>
            <p className="font-semibold text-success">Back Online</p>
          </AlertDescription>
        </Alert>
      </div>

      {/* Subtle Offline Top Bar */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-error text-white py-1">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-xs font-medium">
              <WifiOff className="w-3 h-3" />
              <span>Offline Mode</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
