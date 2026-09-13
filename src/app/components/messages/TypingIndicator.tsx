import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';

interface TypingIndicatorProps {
  userName: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  const reduce = useReducedMotion();

  const dotVariants = {
    hidden: { opacity: 0.4, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        repeat: Infinity,
        repeatType: 'mirror' as const,
        duration: 0.6,
        delay: i * 0.15,
      },
    }),
  };

  return (
    <div className="flex gap-2 items-end">
      <img
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop"
        alt="Typing"
        className="size-8 rounded-full"
      />
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
        <p className="text-xs text-foreground-secondary mb-1">{userName} is typing</p>
        <div className="flex gap-1 ml-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              custom={i}
              variants={reduce ? {} : dotVariants}
              initial="hidden"
              animate="visible"
              className="size-2 rounded-full bg-foreground-secondary"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
