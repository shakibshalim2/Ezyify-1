import { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ZoomIn, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogClose } from '../ui/dialog';
import { cn } from '../ui/utils';
import { springSnappy } from '../../lib/motion';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  isLoading?: boolean;
}

export function ImageGallery({ images, alt, isLoading }: ImageGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const touchStart = useRef<number | null>(null);
  const reduce = useReducedMotion();

  const handlePrev = () => setSelectedIdx(i => (i === 0 ? images.length - 1 : i - 1));
  const handleNext = () => setSelectedIdx(i => (i === images.length - 1 ? 0 : i + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? handleNext() : handlePrev();
    }
    touchStart.current = null;
  };

  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e as any).detail === 2) {
      setScale(s => (s === 1 ? 2 : 1));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-square rounded-card w-full" />
        <div className="grid grid-cols-4 gap-2 lg:hidden">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main carousel — full-bleed mobile, card desktop */}
      <div className="relative overflow-hidden rounded-card bg-background-elevated">
        <motion.div
          className="relative aspect-square w-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleDoubleTap}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIdx}
              initial={reduce ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? {} : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <ImageWithFallback
                src={images[selectedIdx]}
                alt={alt}
                className="w-full h-full object-cover cursor-zoom-in"
                width={500}
                height={500}
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom button overlay */}
          <motion.button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label="Zoom image"
            whileTap={{ scale: 0.95 }}
            transition={springSnappy}
            className="absolute bottom-3 right-3 size-11 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
          >
            <ZoomIn className="size-5" />
          </motion.button>

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full px-3 py-2">
              {images.map((_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === selectedIdx}
                  whileTap={{ scale: 0.8 }}
                  transition={springSnappy}
                  className={cn(
                    'size-2 rounded-full transition-colors',
                    i === selectedIdx ? 'bg-primary' : 'bg-foreground-tertiary hover:bg-foreground-secondary'
                  )}
                />
              ))}
            </div>
          )}

          {/* Navigation arrows — desktop only */}
          {images.length > 1 && (
            <>
              <motion.button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                whileTap={{ scale: 0.9 }}
                transition={springSnappy}
                className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 size-11 rounded-xl bg-background/80 backdrop-blur-sm items-center justify-center text-foreground hover:bg-background transition-colors z-10"
              >
                <ChevronLeft className="size-5" />
              </motion.button>
              <motion.button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                whileTap={{ scale: 0.9 }}
                transition={springSnappy}
                className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 size-11 rounded-xl bg-background/80 backdrop-blur-sm items-center justify-center text-foreground hover:bg-background transition-colors z-10"
              >
                <ChevronRight className="size-5" />
              </motion.button>
            </>
          )}
        </motion.div>
      </div>

      {/* Thumbnail strip — desktop only, below main on mobile */}
      {images.length > 1 && (
        <div className="hidden lg:flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setSelectedIdx(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === selectedIdx}
              whileTap={{ scale: 0.95 }}
              transition={springSnappy}
              className={cn(
                'flex-shrink-0 size-24 rounded-xl overflow-hidden border-2 transition-colors',
                i === selectedIdx ? 'border-primary' : 'border-border hover:border-border-strong'
              )}
            >
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Zoom dialog with pinch/scroll */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl w-full max-h-screen p-0 border-0">
          <motion.div
            className="relative w-full h-screen flex items-center justify-center bg-background overflow-hidden"
            style={{ touchAction: 'manipulation' }}
          >
            <motion.img
              src={images[selectedIdx]}
              alt={alt}
              animate={{ scale }}
              transition={{ type: 'spring', damping: 25 }}
              onDoubleClick={() => setScale(s => (s === 1 ? 2 : 1))}
              className="max-w-full max-h-full object-contain cursor-zoom-out"
              style={{ touchAction: 'pinch-zoom' }}
            />

            {/* Close button */}
            <DialogClose className="absolute top-4 right-4 size-11 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
              <X className="size-5" />
              <span className="sr-only">Close zoom</span>
            </DialogClose>

            {/* Navigation in zoom */}
            {images.length > 1 && (
              <>
                <motion.button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  whileTap={{ scale: 0.9 }}
                  transition={springSnappy}
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-11 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
                >
                  <ChevronLeft className="size-5" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  whileTap={{ scale: 0.9 }}
                  transition={springSnappy}
                  className="absolute right-4 top-1/2 -translate-y-1/2 size-11 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
                >
                  <ChevronRight className="size-5" />
                </motion.button>
              </>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
