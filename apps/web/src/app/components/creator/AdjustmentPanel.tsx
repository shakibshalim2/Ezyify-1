import { useState } from 'react';
import { Sun, Contrast, Droplets, Thermometer, Focus, Wind, RotateCcw } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  sharpness: number;
  fade: number;
}

interface AdjustmentPanelProps {
  adjustments: Adjustments;
  onChange: (adjustments: Adjustments) => void;
}

const adjustmentControls = [
  { key: 'brightness', label: 'Brightness', icon: Sun, min: -100, max: 100 },
  { key: 'contrast', label: 'Contrast', icon: Contrast, min: -100, max: 100 },
  { key: 'saturation', label: 'Saturation', icon: Droplets, min: -100, max: 100 },
  { key: 'temperature', label: 'Temperature', icon: Thermometer, min: -100, max: 100 },
  { key: 'sharpness', label: 'Sharpness', icon: Focus, min: 0, max: 100 },
  { key: 'fade', label: 'Fade', icon: Wind, min: 0, max: 100 },
] as const;

export function AdjustmentPanel({ adjustments, onChange }: AdjustmentPanelProps) {
  const handleAdjustmentChange = (key: keyof Adjustments, value: number) => {
    onChange({ ...adjustments, [key]: value });
  };

  const resetAdjustment = (key: keyof Adjustments) => {
    onChange({ ...adjustments, [key]: 0 });
  };

  return (
    <div className="space-y-6">
      {adjustmentControls.map((control) => {
        const Icon = control.icon;
        const value = adjustments[control.key];
        const isModified = value !== 0;

        return (
          <div key={control.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium">{control.label}</label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-10 text-right">
                  {value > 0 ? '+' : ''}{value}
                </span>
                {isModified && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetAdjustment(control.key)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            <Slider
              value={[value]}
              min={control.min}
              max={control.max}
              step={1}
              onValueChange={(values) => handleAdjustmentChange(control.key, values[0])}
              className="w-full"
            />
          </div>
        );
      })}
    </div>
  );
}