import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Hash, Smile, Sparkles, MapPin, 
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface DetailsFormProps {
  contentType: string;
  caption: string;
  onCaptionChange: (caption: string) => void;
  hashtags: string[];
  onHashtagsChange: (tags: string[]) => void;
  location?: string;
  onLocationChange?: (location: string) => void;
}

const EMOJI_LIST = [
  '😊','😍','🔥','✨','💫','🎉','❤️','💕','🙌','👏',
  '😂','🤩','💯','🌟','🎯','👀','💪','🚀','🌈','🎊',
];

const HASHTAG_SUGGESTIONS: Record<string, string[]> = {
  photo: ['#photography', '#instagood', '#photooftheday', '#beautiful', '#style', '#art'],
  loop: ['#loop', '#shortsvideo', '#fyp', '#viral', '#trending', '#reels'],
  story: ['#story', '#dailylife', '#lifestyle', '#moments', '#memories', '#vibes'],
  live: ['#live', '#livestream', '#goeazy', '#liveshow', '#watchlive', '#liveshopping'],
};

export function DetailsForm({
  contentType,
  caption,
  onCaptionChange,
  hashtags,
  onHashtagsChange,
  location,
  onLocationChange
}: DetailsFormProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');

  const suggestions = HASHTAG_SUGGESTIONS[contentType] || HASHTAG_SUGGESTIONS.photo;

  const addHashtag = (tag: string) => {
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!hashtags.includes(normalizedTag) && hashtags.length < 30) {
      onHashtagsChange([...hashtags, normalizedTag]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    onHashtagsChange(hashtags.filter(h => h !== tag));
  };

  const addEmoji = (emoji: string) => {
    onCaptionChange(caption + emoji);
  };

  const quickLocations = [
    'New York', 'London', 'Dubai', 'Tokyo', 'Paris', 'Los Angeles',
    'Sydney', 'Singapore', 'Toronto', 'Miami'
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Caption */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Caption</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={caption}
            onChange={e => onCaptionChange(e.target.value)}
            placeholder="Write a caption for your post..."
            maxLength={2200}
            className="w-full min-h-[100px] bg-muted/50 border border-border rounded-lg p-3 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-foreground-secondary">
              {caption.length} / 2200
            </p>
            <div className="flex gap-1">
              <motion.button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Smile className="w-5 h-5 text-foreground-secondary hover:text-foreground" />
              </motion.button>
              <motion.button
                onClick={() => {
                  const aiCaption = `${contentType === 'loop' ? 'Watch this! ' : contentType === 'photo' ? 'Check this out! ' : ''}🌟 #ezyify`;
                  onCaptionChange(caption ? caption + ' ' + aiCaption : aiCaption);
                  toast.success('AI caption added!');
                }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5 text-foreground-secondary hover:text-foreground" />
              </motion.button>
            </div>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-8 gap-2 p-3 bg-muted rounded-lg"
            >
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Hashtags */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={hashtagInput}
              onChange={e => setHashtagInput(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addHashtag(hashtagInput);
                }
              }}
              placeholder="Add hashtag (e.g., #fashion)"
              className="bg-muted/50"
            />
            <Button
              onClick={() => addHashtag(hashtagInput)}
              variant="outline"
              size="sm"
            >
              Add
            </Button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground-secondary mb-2">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(tag => (
                  <Button
                    key={tag}
                    onClick={() => addHashtag(tag)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map(tag => (
                <motion.div
                  key={tag}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-secondary/80"
                    onClick={() => removeHashtag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location (optional) */}
      {onLocationChange && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Input
                value={location || ''}
                onChange={e => {
                  onLocationChange(e.target.value);
                  setShowLocationSuggestions(true);
                }}
                placeholder="Add a location..."
                className="bg-muted/50 pr-10"
              />
              {location && (
                <button
                  onClick={() => onLocationChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-foreground-secondary" />
                </button>
              )}
            </div>

            {showLocationSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                {quickLocations
                  .filter(loc => !location || loc.toLowerCase().includes(location.toLowerCase()))
                  .map(loc => (
                    <button
                      key={loc}
                      onClick={() => {
                        onLocationChange(loc);
                        setShowLocationSuggestions(false);
                      }}
                      className="w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm text-foreground"
                    >
                      {loc}
                    </button>
                  ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
