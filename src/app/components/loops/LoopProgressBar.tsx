import React from 'react';

interface LoopProgressBarProps {
  progress: number; // 0-100
}

export function LoopProgressBar({ progress }: LoopProgressBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 h-1 bg-white/20 z-20">
      <div
        className="h-full bg-white/80 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
