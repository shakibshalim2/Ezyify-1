import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, CheckCheck, ShoppingBag, ExternalLink } from 'lucide-react';
import { Button } from '../primitives/Button';

interface ProductCard {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  store: string;
}

interface ReplyRef {
  id: string;
  text: string;
  senderName: string;
}

interface MessageBubbleProps {
  id: string;
  sender: 'you' | 'them';
  type: 'text' | 'image' | 'product' | 'order' | 'system';
  text?: string;
  imageUrl?: string;
  product?: ProductCard;
  time: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: ReplyRef;
  onLongPress?: () => void;
  onImageClick?: (url: string) => void;
  isGrouped?: boolean;
}

export function MessageBubble({
  id,
  sender,
  type,
  text,
  imageUrl,
  product,
  time,
  status,
  replyTo,
  onLongPress,
  onImageClick,
  isGrouped = false,
}: MessageBubbleProps) {
  const [showTime, setShowTime] = useState(false);

  const isMine = sender === 'you';

  if (type === 'system') {
    return (
      <div className="flex justify-center py-2">
        <p className="text-xs text-foreground-tertiary bg-muted px-3 py-1 rounded-full">
          {text}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${!isGrouped && !isMine ? 'mb-2' : 'mb-0.5'}`}
    >
      {/* Avatar for grouped messages (show only first) */}
      {!isMine && !isGrouped && (
        <img
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop"
          alt="Sender"
          className="size-8 rounded-full flex-shrink-0 mt-auto"
        />
      )}
      {!isMine && isGrouped && <div className="size-8 flex-shrink-0" />}

      {/* Message content */}
      <div
        onClick={() => setShowTime(!showTime)}
        onContextMenu={e => {
          e.preventDefault();
          onLongPress?.();
        }}
        className="group cursor-pointer max-w-xs"
      >
        {/* Reply preview */}
        {replyTo && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-muted/50 border-l-2 border-primary text-xs">
            <p className="font-semibold text-foreground-secondary">{replyTo.senderName}</p>
            <p className="text-foreground-tertiary truncate">{replyTo.text}</p>
          </div>
        )}

        {/* Text message */}
        {type === 'text' && text && (
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isMine
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}
          >
            <p className="break-words text-sm leading-snug">{text}</p>
          </div>
        )}

        {/* Image message */}
        {type === 'image' && imageUrl && (
          <motion.img
            whileHover={{ scale: 1.02 }}
            onClick={e => {
              e.stopPropagation();
              onImageClick?.(imageUrl);
            }}
            src={imageUrl}
            alt="Message image"
            className="rounded-2xl max-w-xs h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        )}

        {/* Product card message */}
        {type === 'product' && product && (
          <div
            className={`rounded-2xl overflow-hidden ${
              isMine
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            } border border-border/50 w-56 max-w-xs`}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full aspect-square object-cover"
              loading="lazy"
            />
            <div className="p-3">
              <p className="font-semibold text-sm mb-1 line-clamp-2">
                {product.name}
              </p>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1 items-baseline">
                  <span className="font-display font-bold tabular-nums">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs line-through opacity-70">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-80">{product.store}</p>
              </div>
              <Button
                variant={isMine ? 'secondary' : 'primary'}
                size="sm"
                fullWidth
                rightIcon={<ExternalLink className="size-4" />}
              >
                View
              </Button>
            </div>
          </div>
        )}

        {/* Timestamp and read receipt */}
        <motion.div
          animate={{ opacity: showTime ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-1 text-xs mt-1 ${
            isMine ? 'justify-end' : 'justify-start'
          } ${showTime ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
        >
          <span className="text-foreground-tertiary">{time}</span>
          {isMine &&
            (status === 'read' ? (
              <CheckCheck className="size-3.5 text-primary" />
            ) : status === 'delivered' ? (
              <CheckCheck className="size-3.5 text-foreground-tertiary" />
            ) : status === 'sent' ? (
              <Check className="size-3.5 text-foreground-tertiary" />
            ) : null)}
        </motion.div>
      </div>
    </motion.div>
  );
}
