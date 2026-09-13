import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { 
  Clock, Users, Lock, Globe, Share2, Sparkles, 
  Store, Zap, Calendar, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface PublishFormProps {
  contentType: string;
  publishNow: boolean;
  onPublishNowChange: (value: boolean) => void;
  scheduledDate?: string;
  onScheduledDateChange?: (date: string) => void;
  visibility: 'public' | 'private' | 'friends';
  onVisibilityChange: (visibility: 'public' | 'private' | 'friends') => void;
  publishingTo: ('personal' | 'store')[];
  onPublishingToChange: (to: ('personal' | 'store')[]) => void;
}

export function PublishForm({
  contentType,
  publishNow,
  onPublishNowChange,
  scheduledDate,
  onScheduledDateChange,
  visibility,
  onVisibilityChange,
  publishingTo,
  onPublishingToChange
}: PublishFormProps) {
  const [previewChecked, setPreviewChecked] = useState(false);

  const visibilityOptions = [
    { value: 'public' as const, label: 'Public', icon: Globe, description: 'Everyone can see' },
    { value: 'friends' as const, label: 'Friends', icon: Users, description: 'Only friends' },
    { value: 'private' as const, label: 'Private', icon: Lock, description: 'Only you' },
  ];

  const publishingOptions = [
    { value: 'personal' as const, label: 'Personal Feed', description: 'Your profile' },
    { value: 'store' as const, label: 'Store (Seller)', description: 'Your store products' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Publishing Destination */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Where to Publish
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {publishingOptions.map(option => (
              <motion.button
                key={option.value}
                onClick={() => {
                  if (publishingTo.includes(option.value)) {
                    onPublishingToChange(publishingTo.filter(v => v !== option.value));
                  } else {
                    onPublishingToChange([...publishingTo, option.value]);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  publishingTo.includes(option.value)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{option.label}</p>
                    <p className="text-xs text-foreground-secondary">{option.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    publishingTo.includes(option.value)
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}>
                    {publishingTo.includes(option.value) && (
                      <span className="text-white text-sm font-bold">✓</span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {visibilityOptions.map(option => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.value}
                onClick={() => onVisibilityChange(option.value)}
                className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  visibility === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                whileHover={{ x: 4 }}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  visibility === option.value
                    ? 'border-primary bg-primary'
                    : 'border-border'
                }`}>
                  {visibility === option.value && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <Icon className="w-4 h-4 text-foreground-secondary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{option.label}</p>
                  <p className="text-xs text-foreground-secondary">{option.description}</p>
                </div>
              </motion.button>
            );
          })}
        </CardContent>
      </Card>

      {/* Publishing Timing */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5" />
            When to Publish
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <Label className="text-sm font-medium text-foreground">Publish Now</Label>
              <p className="text-xs text-foreground-secondary">Post immediately</p>
            </div>
            <Switch checked={publishNow} onCheckedChange={onPublishNowChange} />
          </div>

          {!publishNow && onScheduledDateChange && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="scheduled-date" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule for
              </Label>
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={scheduledDate || ''}
                onChange={e => onScheduledDateChange(e.target.value)}
                className="bg-muted/50"
              />
              <p className="text-xs text-foreground-secondary">
                Your post will be published at the scheduled time
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Preview Permissions */}
      <Card className="border-border bg-info/5 border-info/40">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-foreground">Approval Needed</p>
              <p className="text-xs text-foreground-secondary mt-1">
                {contentType === 'live' ? 'Live streams are verified before going public. Allow 5-10 minutes.' : 'Your content may need approval based on platform policies.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
