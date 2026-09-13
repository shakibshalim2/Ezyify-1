import { useState, useRef, useEffect } from 'react';
import { Sliders, Sparkles, Settings, Palette, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EditorToolbar } from './EditorToolbar';
import { AdjustmentPanel, type Adjustments } from './AdjustmentPanel';
import { FilterBar, type FilterType } from './FilterBar';
import { AdvancedTools, type AdvancedSettings } from './AdvancedTools';
import { CreativeTools, type TextLayer, type StickerLayer } from './CreativeTools';

interface MediaEditorProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  onDone: (editedData: EditedMediaData) => void;
  onCancel: () => void;
}

export interface EditedMediaData {
  adjustments: Adjustments;
  filter: FilterType;
  filterIntensity: number;
  advancedSettings: AdvancedSettings;
  textLayers: TextLayer[];
  stickerLayers: StickerLayer[];
}

interface HistoryState {
  adjustments: Adjustments;
  filter: FilterType;
  filterIntensity: number;
  advancedSettings: AdvancedSettings;
  textLayers: TextLayer[];
  stickerLayers: StickerLayer[];
}

const initialAdjustments: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  sharpness: 0,
  fade: 0,
};

const initialAdvancedSettings: AdvancedSettings = {
  aspectRatio: 'free',
  rotation: 0,
  isMuted: false,
  playbackSpeed: 1,
  trimStart: 0,
  trimEnd: 60,
};

export function MediaEditor({ mediaUrl, mediaType, onDone, onCancel }: MediaEditorProps) {
  // Editor state
  const [adjustments, setAdjustments] = useState<Adjustments>(initialAdjustments);
  const [filter, setFilter] = useState<FilterType>('none');
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>(initialAdvancedSettings);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [stickerLayers, setStickerLayers] = useState<StickerLayer[]>([]);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save to history
  const saveToHistory = () => {
    const newState: HistoryState = {
      adjustments: { ...adjustments },
      filter,
      filterIntensity,
      advancedSettings: { ...advancedSettings },
      textLayers: [...textLayers],
      stickerLayers: [...stickerLayers],
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setAdjustments(prevState.adjustments);
      setFilter(prevState.filter);
      setFilterIntensity(prevState.filterIntensity);
      setAdvancedSettings(prevState.advancedSettings);
      setTextLayers(prevState.textLayers);
      setStickerLayers(prevState.stickerLayers);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setAdjustments(nextState.adjustments);
      setFilter(nextState.filter);
      setFilterIntensity(nextState.filterIntensity);
      setAdvancedSettings(nextState.advancedSettings);
      setTextLayers(nextState.textLayers);
      setStickerLayers(nextState.stickerLayers);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Reset all
  const resetAll = () => {
    setAdjustments(initialAdjustments);
    setFilter('none');
    setFilterIntensity(100);
    setAdvancedSettings(initialAdvancedSettings);
    setTextLayers([]);
    setStickerLayers([]);
    saveToHistory();
  };

  // Auto-save draft to localStorage
  useEffect(() => {
    const draftData = {
      adjustments,
      filter,
      filterIntensity,
      advancedSettings,
      textLayers,
      stickerLayers,
      mediaUrl,
      timestamp: Date.now(),
    };
    localStorage.setItem('ezyify_post_draft', JSON.stringify(draftData));
  }, [adjustments, filter, filterIntensity, advancedSettings, textLayers, stickerLayers, mediaUrl]);

  // Build filter styles
  const getFilterStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      transform: `rotate(${advancedSettings.rotation}deg)`,
      transition: 'all 0.3s ease',
    };

    // Apply adjustments
    const filters: string[] = [];
    if (adjustments.brightness !== 0) {
      filters.push(`brightness(${1 + adjustments.brightness / 100})`);
    }
    if (adjustments.contrast !== 0) {
      filters.push(`contrast(${1 + adjustments.contrast / 100})`);
    }
    if (adjustments.saturation !== 0) {
      filters.push(`saturate(${1 + adjustments.saturation / 100})`);
    }
    if (adjustments.sharpness > 0) {
      filters.push(`contrast(${1 + adjustments.sharpness / 200})`);
    }

    // Apply filter presets
    if (filter !== 'none') {
      switch (filter) {
        case 'natural':
          filters.push('brightness(1.05) saturate(1.1)');
          break;
        case 'warm':
          filters.push('sepia(0.2) saturate(1.2)');
          break;
        case 'cool':
          filters.push('hue-rotate(10deg) saturate(1.1)');
          break;
        case 'soft':
          filters.push('brightness(1.1) contrast(0.9)');
          break;
        case 'cinematic':
          filters.push('contrast(1.1) saturate(0.9)');
          break;
        case 'bold':
          filters.push('contrast(1.2) saturate(1.3)');
          break;
      }
    }

    if (filters.length > 0) {
      styles.filter = filters.join(' ');
    }

    return styles;
  };

  const handleDone = () => {
    onDone({
      adjustments,
      filter,
      filterIntensity,
      advancedSettings,
      textLayers,
      stickerLayers,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 p-4">
        <EditorToolbar
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={undo}
          onRedo={redo}
          onReset={resetAll}
          onCancel={onCancel}
          onDone={handleDone}
        />
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
          <div className="relative max-w-full max-h-full">
            {mediaType === 'image' ? (
              <img
                src={mediaUrl}
                alt="Preview"
                className="max-w-full max-h-[60vh] lg:max-h-[80vh] object-contain"
                style={getFilterStyles()}
              />
            ) : (
              <video
                src={mediaUrl}
                controls
                muted={advancedSettings.isMuted}
                className="max-w-full max-h-[60vh] lg:max-h-[80vh] object-contain"
                style={getFilterStyles()}
              />
            )}

            {/* Text Layers Overlay */}
            {textLayers.map((layer) => (
              <div
                key={layer.id}
                className="absolute cursor-move select-none"
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  fontSize: `${layer.fontSize}px`,
                  color: layer.color,
                  fontWeight: layer.fontWeight,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {layer.text}
              </div>
            ))}

            {/* Sticker Layers Overlay */}
            {stickerLayers.map((layer) => (
              <div
                key={layer.id}
                className="absolute cursor-move select-none"
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  fontSize: `${layer.size}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {layer.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Tools Sidebar */}
        <div className="w-full lg:w-96 bg-white/10 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/10 overflow-y-auto">
          <Tabs defaultValue="adjustments" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-black/20">
              <TabsTrigger value="adjustments" className="data-[state=active]:bg-white/20">
                <Sliders className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="filters" className="data-[state=active]:bg-white/20">
                <Sparkles className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="advanced" className="data-[state=active]:bg-white/20">
                <Settings className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="creative" className="data-[state=active]:bg-white/20">
                <Palette className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <div className="p-4 text-white">
              <TabsContent value="adjustments">
                <div className="space-y-2 mb-4">
                  <h3 className="flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Basic Adjustments
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fine-tune your image with basic controls
                  </p>
                </div>
                <AdjustmentPanel
                  adjustments={adjustments}
                  onChange={(newAdjustments) => {
                    setAdjustments(newAdjustments);
                    saveToHistory();
                  }}
                />
              </TabsContent>

              <TabsContent value="filters">
                <div className="space-y-2 mb-4">
                  <h3 className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Filters
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Apply creative filters to enhance your content
                  </p>
                </div>
                <FilterBar
                  selectedFilter={filter}
                  filterIntensity={filterIntensity}
                  onFilterChange={(newFilter) => {
                    setFilter(newFilter);
                    saveToHistory();
                  }}
                  onIntensityChange={(intensity) => {
                    setFilterIntensity(intensity);
                    saveToHistory();
                  }}
                  previewImage={mediaUrl}
                />
              </TabsContent>

              <TabsContent value="advanced">
                <div className="space-y-2 mb-4">
                  <h3 className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Advanced Tools
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Crop, rotate, and fine-tune your media
                  </p>
                </div>
                <AdvancedTools
                  settings={advancedSettings}
                  onChange={(newSettings) => {
                    setAdvancedSettings(newSettings);
                    saveToHistory();
                  }}
                  mediaType={mediaType}
                  videoDuration={60}
                />
              </TabsContent>

              <TabsContent value="creative">
                <div className="space-y-2 mb-4">
                  <h3 className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Creative Enhancements
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add text and stickers to your content
                  </p>
                </div>
                <CreativeTools
                  textLayers={textLayers}
                  stickerLayers={stickerLayers}
                  onAddText={(text) => {
                    setTextLayers([...textLayers, text]);
                    saveToHistory();
                  }}
                  onAddSticker={(sticker) => {
                    setStickerLayers([...stickerLayers, sticker]);
                    saveToHistory();
                  }}
                  onRemoveText={(id) => {
                    setTextLayers(textLayers.filter((t) => t.id !== id));
                    saveToHistory();
                  }}
                  onRemoveSticker={(id) => {
                    setStickerLayers(stickerLayers.filter((s) => s.id !== id));
                    saveToHistory();
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}