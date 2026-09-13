import { useState } from 'react';
import { Type, Sticker, Pencil, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
}

export interface StickerLayer {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

interface CreativeToolsProps {
  textLayers: TextLayer[];
  stickerLayers: StickerLayer[];
  onAddText: (text: TextLayer) => void;
  onAddSticker: (sticker: StickerLayer) => void;
  onRemoveText: (id: string) => void;
  onRemoveSticker: (id: string) => void;
}

const popularEmojis = [
  '😀', '😂', '🥰', '😍', '🤩', '😎', '🔥', '✨',
  '❤️', '💯', '👍', '🙌', '✌️', '👏', '💪', '🎉',
  '🌟', '⭐', '💫', '✅', '🎯', '🏆', '💎', '👑'
];

const textColors = [
  { value: '#FFFFFF', label: 'White' },
  { value: '#000000', label: 'Black' },
  { value: '#EF4444', label: 'Red' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
];

export function CreativeTools({
  textLayers,
  stickerLayers,
  onAddText,
  onAddSticker,
  onRemoveText,
  onRemoveSticker
}: CreativeToolsProps) {
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold');

  const handleAddText = () => {
    if (textInput.trim()) {
      onAddText({
        id: `text-${Date.now()}`,
        text: textInput,
        x: 50,
        y: 50,
        fontSize,
        color: textColor,
        fontWeight
      });
      setTextInput('');
    }
  };

  const handleAddSticker = (emoji: string) => {
    onAddSticker({
      id: `sticker-${Date.now()}`,
      emoji,
      x: 50,
      y: 50,
      size: 48
    });
  };

  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="text">
          <Type className="w-4 h-4 mr-2" />
          Text
        </TabsTrigger>
        <TabsTrigger value="stickers">
          <Sticker className="w-4 h-4 mr-2" />
          Stickers
        </TabsTrigger>
      </TabsList>

      {/* Text Tab */}
      <TabsContent value="text" className="space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <Label>Add Text</Label>
          <div className="flex gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
            />
            <Button onClick={handleAddText} disabled={!textInput.trim()}>
              Add
            </Button>
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="grid grid-cols-8 gap-2">
            {textColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setTextColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  textColor === color.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label>Font Size</Label>
          <div className="grid grid-cols-4 gap-2">
            {[16, 24, 32, 48].map((size) => (
              <Button
                key={size}
                variant={fontSize === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFontSize(size)}
              >
                {size}px
              </Button>
            ))}
          </div>
        </div>

        {/* Font Weight */}
        <div className="space-y-2">
          <Label>Font Weight</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={fontWeight === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFontWeight('normal')}
            >
              Normal
            </Button>
            <Button
              variant={fontWeight === 'bold' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFontWeight('bold')}
            >
              Bold
            </Button>
          </div>
        </div>

        {/* Active Text Layers */}
        {textLayers.length > 0 && (
          <div className="space-y-2">
            <Label>Active Text Layers ({textLayers.length})</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {textLayers.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded"
                >
                  <span className="text-sm truncate flex-1">{layer.text}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveText(layer.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground bg-info/10 p-2 rounded">
          💡 Tap text on preview to move or resize
        </p>
      </TabsContent>

      {/* Stickers Tab */}
      <TabsContent value="stickers" className="space-y-4">
        <div className="space-y-2">
          <Label>Popular Stickers</Label>
          <div className="grid grid-cols-8 gap-2">
            {popularEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddSticker(emoji)}
                className="w-10 h-10 text-2xl hover:bg-muted/50 rounded-xl transition-colors flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Active Sticker Layers */}
        {stickerLayers.length > 0 && (
          <div className="space-y-2">
            <Label>Active Stickers ({stickerLayers.length})</Label>
            <div className="flex flex-wrap gap-2">
              {stickerLayers.map((layer) => (
                <div
                  key={layer.id}
                  className="relative group"
                >
                  <div className="w-12 h-12 text-3xl flex items-center justify-center bg-muted/50 rounded-xl">
                    {layer.emoji}
                  </div>
                  <button
                    onClick={() => onRemoveSticker(layer.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground bg-info/10 p-2 rounded">
          💡 Tap stickers on preview to move or resize
        </p>
      </TabsContent>
    </Tabs>
  );
}