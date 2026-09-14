import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Paperclip, Camera, Smile, Send, Mic } from 'lucide-react';
import { Button } from '../primitives/Button';

interface ChatComposerProps {
  onSendMessage: (text: string) => void;
  onAttachFile?: () => void;
  onAttachCamera?: () => void;
  onEmojiClick?: () => void;
  isMobile?: boolean;
}

export function ChatComposer({
  onSendMessage,
  onAttachFile,
  onAttachCamera,
  onEmojiClick,
  isMobile = false,
}: ChatComposerProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, [message]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const bottomClass = isMobile
    ? 'fixed inset-x-0 bottom-[calc(var(--nav-height)+var(--safe-bottom))] lg:static lg:bottom-auto'
    : '';

  return (
    <div
      className={`bg-background border-t border-border px-4 py-3 ${bottomClass}`}
    >
      <div className="flex gap-2 items-end">
        {/* Attach button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onAttachFile}
          aria-label="Attach file"
        >
          <Paperclip className="size-5" />
        </Button>

        {/* Camera button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onAttachCamera}
          aria-label="Attach photo"
        >
          <Camera className="size-5" />
        </Button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Your message…"
          rows={1}
          className="flex-1 resize-none rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-tertiary outline-none focus:border-primary focus:bg-background-elevated focus:shadow-[0_0_0_4px_var(--primary-subtle)] transition-all max-h-[120px] overflow-y-auto"
        />

        {/* Emoji button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onEmojiClick}
          aria-label="Emoji"
        >
          <Smile className="size-5" />
        </Button>

        {/* Send/Mic button - morphs based on text presence */}
        <motion.div
          animate={{ scale: message.trim() ? 1 : 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Button
            variant={message.trim() ? 'primary' : 'ghost'}
            size="icon"
            onClick={message.trim() ? handleSend : undefined}
            aria-label={message.trim() ? 'Send message' : 'Voice message'}
          >
            {message.trim() ? (
              <Send className="size-5" />
            ) : (
              <Mic className="size-5" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
