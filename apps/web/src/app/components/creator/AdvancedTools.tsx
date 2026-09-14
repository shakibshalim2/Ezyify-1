import { useState } from 'react';
import { Crop, RotateCw, Maximize2, Scissors, Volume2, VolumeX, Gauge } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

export interface AdvancedSettings {
  aspectRatio: '1:1' | '4:5' | '16:9' | 'free';
  rotation: number;
  isMuted: boolean;
  playbackSpeed: number;
  trimStart: number;
  trimEnd: number;
}

interface AdvancedToolsProps {
  settings: AdvancedSettings;
  onChange: (settings: AdvancedSettings) => void;
  mediaType: 'image' | 'video';
  videoDuration?: number;
}

export function AdvancedTools({ settings, onChange, mediaType, videoDuration = 60 }: AdvancedToolsProps) {
  const aspectRatios: Array<{ value: AdvancedSettings['aspectRatio']; label: string }> = [
    { value: '1:1', label: '1:1' },
    { value: '4:5', label: '4:5' },
    { value: '16:9', label: '16:9' },
    { value: 'free', label: 'Free' },
  ];

  const speeds = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' },
  ];

  const rotateImage = () => {
    onChange({ ...settings, rotation: (settings.rotation + 90) % 360 });
  };

  return (
    <div className="space-y-6">
      {/* Aspect Ratio */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
          <Label>Aspect Ratio</Label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {aspectRatios.map((ratio) => (
            <Button
              key={ratio.value}
              variant={settings.aspectRatio === ratio.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange({ ...settings, aspectRatio: ratio.value })}
              className="w-full"
            >
              {ratio.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-muted-foreground" />
          <Label>Rotate</Label>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={rotateImage}
            className="flex-1"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate 90°
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-right">{settings.rotation}°</span>
        </div>
      </div>

      {/* Video-only controls */}
      {mediaType === 'video' && (
        <>
          {/* Mute/Unmute */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {settings.isMuted ? (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              )}
              <Label>Audio</Label>
            </div>
            <Button
              variant={settings.isMuted ? 'outline' : 'default'}
              size="sm"
              onClick={() => onChange({ ...settings, isMuted: !settings.isMuted })}
              className="w-full"
            >
              {settings.isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Muted
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Audio On
                </>
              )}
            </Button>
          </div>

          {/* Playback Speed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <Label>Playback Speed</Label>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {speeds.map((speed) => (
                <Button
                  key={speed.value}
                  variant={settings.playbackSpeed === speed.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onChange({ ...settings, playbackSpeed: speed.value })}
                >
                  {speed.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Trim Video */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-muted-foreground" />
              <Label>Trim Video</Label>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Start</span>
                  <span>{settings.trimStart}s</span>
                </div>
                <Slider
                  value={[settings.trimStart]}
                  min={0}
                  max={Math.min(videoDuration, settings.trimEnd - 1)}
                  step={0.5}
                  onValueChange={(values) => onChange({ ...settings, trimStart: values[0] })}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">End</span>
                  <span>{settings.trimEnd}s</span>
                </div>
                <Slider
                  value={[settings.trimEnd]}
                  min={Math.max(1, settings.trimStart + 1)}
                  max={videoDuration}
                  step={0.5}
                  onValueChange={(values) => onChange({ ...settings, trimEnd: values[0] })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Duration: {(settings.trimEnd - settings.trimStart).toFixed(1)}s
              </p>
            </div>
          </div>
        </>
      )}

      {/* Crop Tool Note */}
      <div className="p-3 bg-info/10 border border-info/30 rounded-xl">
        <div className="flex gap-2">
          <Crop className="w-4 h-4 text-info dark:text-info mt-0.5" />
          <div>
            <p className="text-sm font-medium text-info">Crop Tool</p>
            <p className="text-xs text-info/80 dark:text-info/80 mt-0.5">
              Select aspect ratio, then drag to adjust crop area on the preview
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}