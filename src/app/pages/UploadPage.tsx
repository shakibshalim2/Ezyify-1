import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { SEO, SEOConfigs } from '../components/SEO';
import { StepBar } from '../components/upload/StepBar';
import { MediaUpload, type UploadedMedia } from '../components/upload/MediaUpload';
import { DetailsForm } from '../components/upload/DetailsForm';
import { PublishForm } from '../components/upload/PublishForm';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, WifiOff, AlertCircle,
  Copy, Share2, ArrowRight
} from 'lucide-react';

type ContentType = 'photo' | 'video' | 'loop' | 'story' | 'live';

const CONTENT_TYPES = [
  { value: 'photo' as const, label: 'Photo', emoji: '📷' },
  { value: 'video' as const, label: 'Video', emoji: '🎥' },
  { value: 'loop' as const, label: 'Loop', emoji: '🎬' },
  { value: 'story' as const, label: 'Story', emoji: '📖' },
  { value: 'live' as const, label: 'Live', emoji: '🔴' },
];

function OfflineBanner() {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-warning/10 border border-warning/40 rounded-lg p-3 flex items-start gap-3 mb-6"
    >
      <WifiOff className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-sm text-foreground">You're Offline</p>
        <p className="text-xs text-foreground-secondary">Your content will be saved locally and uploaded when you're back online.</p>
      </div>
    </motion.div>
  );
}

function SuccessScreen({ medias }: { medias: UploadedMedia[] }) {
  const navigate = useNavigate();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-2xl p-8 max-w-sm w-full border border-border"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-8 h-8 text-success" />
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground text-center mb-2">Posted Successfully!</h2>
        <p className="text-sm text-foreground-secondary text-center mb-6">
          {medias.length === 1 ? 'Your post is live.' : `${medias.length} posts are live.`}
        </p>

        <div className="space-y-2 mb-6">
          <Button onClick={() => navigate('/profile')} className="w-full">
            View on Profile
          </Button>
          <Button onClick={() => navigate('/upload')} variant="outline" className="w-full">
            Upload More
          </Button>
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const url = `${window.location.origin}/profile`;
              navigator.clipboard.writeText(url);
              toast.success('Link copied!');
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [step, setStep] = useState(0);
  const [contentType, setContentType] = useState<ContentType>('photo');
  const [medias, setMedias] = useState<UploadedMedia[]>([]);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [publishNow, setPublishNow] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'friends'>('public');
  const [publishingTo, setPublishingTo] = useState<('personal' | 'store')[]>(['personal']);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Online/offline detection
  React.useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const steps = ['Media', 'Details', 'Publish'];

  const canProceedToNext = useCallback(() => {
    if (step === 0) return medias.length > 0;
    if (step === 1) return caption.length > 0 || hashtags.length > 0;
    return publishingTo.length > 0;
  }, [step, medias, caption, hashtags, publishingTo]);

  const handlePublish = async () => {
    if (!canProceedToNext()) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsPublishing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log for verification
      console.log('Published content:', {
        type: contentType,
        medias: medias.map(m => ({ name: m.file.name, type: m.type })),
        caption,
        hashtags,
        location,
        publishNow,
        scheduledDate: !publishNow ? scheduledDate : undefined,
        visibility,
        publishingTo
      });

      setShowSuccess(true);
      toast.success('Content published!');
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish content');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.upload} />
      
      {/* Step Bar */}
      <StepBar currentStep={step} steps={steps} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {!isOnline && <OfflineBanner />}

        {/* Step 0: Select Content Type & Upload Media */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Content Type Selector */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-foreground mb-4">What are you sharing?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {CONTENT_TYPES.map(type => (
                      <motion.button
                        key={type.value}
                        onClick={() => {
                          setContentType(type.value);
                          setMedias([]); // Reset media when type changes
                        }}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          contentType === type.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">{type.emoji}</div>
                        <p className="font-medium text-sm text-foreground">{type.label}</p>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Media Upload */}
              <Card className="border-border">
                <CardContent className="pt-6">
                  <MediaUpload
                    contentType={contentType}
                    medias={medias}
                    onMediasChange={setMedias}
                    multiple={contentType !== 'live'}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DetailsForm
                contentType={contentType}
                caption={caption}
                onCaptionChange={setCaption}
                hashtags={hashtags}
                onHashtagsChange={setHashtags}
                location={location}
                onLocationChange={setLocation}
              />
            </motion.div>
          )}

          {/* Step 2: Publish */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PublishForm
                contentType={contentType}
                publishNow={publishNow}
                onPublishNowChange={setPublishNow}
                scheduledDate={scheduledDate}
                onScheduledDateChange={setScheduledDate}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                publishingTo={publishingTo}
                onPublishingToChange={setPublishingTo}
              />

              {/* Review Summary */}
              <Card className="border-border mt-6 bg-muted/30">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-4">Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-foreground-secondary">Content</p>
                      <p className="font-medium text-foreground">{medias.length} file(s) • {contentType}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary">Visibility</p>
                      <p className="font-medium text-foreground capitalize">{visibility}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary">Publishing</p>
                      <p className="font-medium text-foreground">{publishingTo.map(t => t === 'personal' ? 'Profile' : 'Store').join(' + ')}</p>
                    </div>
                    <div>
                      <p className="text-foreground-secondary">Timing</p>
                      <p className="font-medium text-foreground">{publishNow ? 'Publish Now' : 'Scheduled'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Action Bar - Mobile Sticky */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40 md:relative md:border-0 md:bg-transparent md:p-0 md:mt-8">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            {/* Back Button */}
            <Button
              onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
              variant="outline"
              size="lg"
              className="flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Step Progress (Mobile) */}
            <div className="flex-1 md:hidden">
              <p className="text-sm font-medium text-foreground">
                Step {step + 1} of {steps.length}
              </p>
            </div>

            {/* Next/Publish Button */}
            <Button
              onClick={() => {
                if (step === steps.length - 1) {
                  handlePublish();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={!canProceedToNext() || isPublishing}
              size="lg"
              className="gap-2"
            >
              {isPublishing ? (
                <>Publishing...</>
              ) : step === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Publish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && <SuccessScreen medias={medias} />}
      </AnimatePresence>
    </div>
  );
}
