import { SEO } from '../../components/SEO';
import { Camera, Bell, MapPin, CheckCircle2, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// Skeleton Component
function PermissionsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Skeleton */}
      <div className="p-6 text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-9 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Progress Skeleton */}
      <div className="px-6 mb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Permission Cards Skeleton */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="p-6 bg-card border-t">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 flex-1" />
        </div>
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    camera: false,
    notifications: false,
    location: false
  });

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const permissionsList = [
    {
      id: 'camera',
      icon: Camera,
      title: 'Camera',
      description: 'Take photos and record videos for posts and stories',
      required: true,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Stay updated with likes, comments, and messages',
      required: false,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'location',
      icon: MapPin,
      title: 'Location',
      description: 'Discover nearby shops and local deals (optional)',
      required: false,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  // Show skeleton while loading
  if (isLoading) {
    return <PermissionsPageSkeleton />;
  }

  const requestPermission = async (id: string) => {
    // Simulate permission request
    await new Promise(resolve => setTimeout(resolve, 500));
    setPermissions({ ...permissions, [id]: true });
  };

  const handleFinish = () => {
    navigate('/');
  };

  const allRequiredGranted = permissions.camera;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="App Permissions — Ezyify" description="Set up permissions to get the most from your Ezyify experience." />
      {/* Header */}
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--brand-gradient)' }}>
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Enable Permissions</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Grant permissions to unlock the full Ezyify experience. You can change these later in settings.
        </p>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step 3 of 3</span>
            <span>{Object.values(permissions).filter(p => p).length} / {Object.keys(permissions).length} enabled</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-300" style={{ background: 'var(--brand-gradient)', width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {permissionsList.map((permission) => {
            const Icon = permission.icon;
            const isGranted = permissions[permission.id as keyof typeof permissions];

            return (
              <Card key={permission.id} className={isGranted ? 'border-success/30 bg-success/5' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${permission.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${permission.color}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{permission.title}</h3>
                        {permission.required && (
                          <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full">
                            Required
                          </span>
                        )}
                        {isGranted && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{permission.description}</p>

                      {!isGranted ? (
                        <Button
                          size="sm"
                          onClick={() => requestPermission(permission.id)}
                        >
                          Enable {permission.title}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-success">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Permission granted</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info */}
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-info/8 border border-info/20 rounded-2xl">
          <p className="text-sm text-foreground">
            💡 <strong>Privacy matters:</strong> We only use these permissions when you actively use related features. 
            You can manage permissions anytime in your device settings.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pt-6 bg-card border-t sticky bottom-0" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleFinish}
            disabled={!allRequiredGranted}
          >
            {allRequiredGranted ? (
              <>
                Get Started
                <CheckCircle2 className="w-5 h-5 ml-2" />
              </>
            ) : (
              'Enable Required Permissions'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}