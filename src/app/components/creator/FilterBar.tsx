import { useState } from 'react';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

export type FilterType = 
  | 'none'
  | 'natural'
  | 'warm'
  | 'cool'
  | 'soft'
  | 'cinematic'
  | 'bold';

export interface FilterConfig {
  id: FilterType;
  name: string;
  preview: string;
}

interface FilterBarProps {
  selectedFilter: FilterType;
  filterIntensity: number;
  onFilterChange: (filter: FilterType) => void;
  onIntensityChange: (intensity: number) => void;
  previewImage?: string;
}

const filters: FilterConfig[] = [
  { id: 'none', name: 'Original', preview: '' },
  { id: 'natural', name: 'Natural', preview: 'brightness(1.05) saturate(1.1)' },
  { id: 'warm', name: 'Warm', preview: 'sepia(0.2) saturate(1.2)' },
  { id: 'cool', name: 'Cool', preview: 'hue-rotate(10deg) saturate(1.1)' },
  { id: 'soft', name: 'Soft', preview: 'brightness(1.1) contrast(0.9)' },
  { id: 'cinematic', name: 'Cinematic', preview: 'contrast(1.1) saturate(0.9)' },
  { id: 'bold', name: 'Bold', preview: 'contrast(1.2) saturate(1.3)' },
];

export function FilterBar({
  selectedFilter,
  filterIntensity,
  onFilterChange,
  onIntensityChange,
  previewImage
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Filter Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
              selectedFilter === filter.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            {/* Filter Preview */}
            <div
              className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-500/10 dark:to-blue-500/10"
              style={{
                filter: filter.preview,
                backgroundImage: previewImage ? `url(${previewImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            
            {/* Filter Name */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
              <p className="text-xs text-white text-center truncate">{filter.name}</p>
            </div>

            {/* Selected Indicator */}
            {selectedFilter === filter.id && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Intensity Slider */}
      {selectedFilter !== 'none' && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Filter Intensity</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{filterIntensity}%</span>
              {filterIntensity !== 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onIntensityChange(100)}
                  className="h-6 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
          <Slider
            value={[filterIntensity]}
            min={0}
            max={100}
            step={5}
            onValueChange={(values) => onIntensityChange(values[0])}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}

export function getFilterStyle(filter: FilterType, intensity: number): string {
  const filterConfig = filters.find(f => f.id === filter);
  if (!filterConfig || filter === 'none' || intensity === 0) return '';
  
  // Apply intensity scaling
  const scale = intensity / 100;
  return filterConfig.preview;
}