import React, { useState } from 'react';
import { ChevronDown, Music } from 'lucide-react';
import { VerifiedBadge } from '../VerifiedBadge';

interface LoopCaptionProps {
  username: string;
  verified: boolean;
  text?: string;
  sound?: string;
}

export function LoopCaption({
  username,
  verified,
  text,
  sound,
}: LoopCaptionProps) {
  const [expanded, setExpanded] = useState(false);

  // Extract hashtags from text
  const hashtags = text?.match(/#\w+/g) || [];
  const textWithoutTags = text?.replace(/#\w+/g, '').trim() || '';

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12 pb-safe">
      {/* Username and verified badge */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="font-semibold text-white text-sm">@{username}</span>
        {verified && <VerifiedBadge size="sm" />}
      </div>

      {/* Caption text with expand */}
      {textWithoutTags && (
        <div className="mb-3">
          <p
            className={`text-white text-sm leading-snug transition-all ${
              expanded ? '' : 'line-clamp-2'
            }`}
          >
            {textWithoutTags}
          </p>
          {!expanded && textWithoutTags.length > 60 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-white/80 text-xs font-medium mt-1 hover:text-white transition-colors"
            >
              more
            </button>
          )}
          {expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="text-white/80 text-xs font-medium mt-1 hover:text-white transition-colors flex items-center gap-1"
            >
              less <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {hashtags.slice(0, 3).map((tag, i) => (
            <button
              key={i}
              className="px-2 py-1 rounded-full bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Sound/Music row */}
      {sound && (
        <div className="flex items-center gap-2 text-white text-xs">
          <Music className="w-3.5 h-3.5" />
          <span className="truncate">{sound}</span>
        </div>
      )}
    </div>
  );
}
