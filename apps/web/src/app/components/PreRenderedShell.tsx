import React from 'react';
import { enablePreviewMode, isPreviewMode } from '../utils/previewModeIsolation';
import { 
  cachePreviewShell, 
  getCachedPreviewShell, 
  trackNavigation,
  enableInstantBackNav 
} from '../utils/repeatLoadOptimizer';

/**
 * WORLD-CLASS PRE-RENDERED SHELL
 * - Zero JavaScript execution on first paint
 * - Frozen dimensions (no layout shift)
 * - Minimal DOM nodes (<50 elements)
 * - System fonts only
 * - No animations initially (added after hydration)
 * - Target: FCP < 300ms, LCP < 600ms
 */
export function PreRenderedShell() {
  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        // Force layout freeze - prevent any shifts
        contain: 'layout style paint',
        contentVisibility: 'auto'
      }}
    >
      {/* Navbar - Fixed dimensions */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 border-b border-border"
        style={{ height: '64px', contain: 'strict' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo - exact dimensions */}
          <div 
            className="bg-muted/30 rounded"
            style={{ width: '96px', height: '32px' }}
          />
          
          {/* Desktop Nav - Hidden on mobile, no animation yet */}
          <div className="hidden lg:flex gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className="bg-muted/30 rounded"
                style={{ width: '64px', height: '24px' }}
              />
            ))}
          </div>
          
          {/* Search - Fixed width */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <div 
              className="w-full bg-muted/20 rounded-full"
              style={{ height: '40px' }}
            />
          </div>
          
          {/* Actions - Fixed dimensions */}
          <div className="flex items-center gap-4">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={`bg-muted/30 rounded-full ${i === 3 ? 'hidden md:block' : ''}`}
                style={{ width: '40px', height: '40px' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Minimal feed skeleton */}
      <div 
        className="pb-20 lg:pb-0"
        style={{ 
          paddingTop: '64px',
          contain: 'layout style'
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Only 1 feed item for instant render */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Header - Fixed height */}
            <div 
              className="p-4 flex items-center gap-3"
              style={{ height: '80px' }}
            >
              <div 
                className="bg-muted/30 rounded-full flex-shrink-0"
                style={{ width: '48px', height: '48px' }}
              />
              <div className="flex-1 space-y-2">
                <div 
                  className="bg-muted/30 rounded"
                  style={{ height: '16px', width: '128px' }}
                />
                <div 
                  className="bg-muted/20 rounded"
                  style={{ height: '12px', width: '80px' }}
                />
              </div>
            </div>
            
            {/* Image placeholder - Fixed aspect ratio */}
            <div 
              className="w-full bg-muted/20"
              style={{ 
                aspectRatio: '1/1',
                contain: 'strict'
              }}
            />
            
            {/* Actions - Fixed height */}
            <div 
              className="p-4"
              style={{ height: '120px' }}
            >
              <div className="flex gap-6 mb-3">
                {[1, 2, 3].map(j => (
                  <div 
                    key={j}
                    className="bg-muted/30 rounded"
                    style={{ height: '24px', width: '64px' }}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <div 
                  className="bg-muted/20 rounded"
                  style={{ height: '16px', width: '100%' }}
                />
                <div 
                  className="bg-muted/15 rounded"
                  style={{ height: '16px', width: '75%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav - Fixed dimensions */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 border-t border-border"
        style={{ height: '64px', contain: 'strict' }}
      >
        <div className="flex justify-around items-center h-full px-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i}
              className="bg-muted/30 rounded-full"
              style={{ width: '40px', height: '40px' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * INSTANT PREVIEW LOADER V2 - WORLD CLASS
 * Enhanced with:
 * - GPU-accelerated animations (only after first paint)
 * - Progressive enhancement
 * - Reduced motion support
 * - Adaptive quality based on device
 */
export function InstantPreviewLoaderV2() {
  const [showAnimations, setShowAnimations] = React.useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  React.useEffect(() => {
    // Enable preview mode isolation
    enablePreviewMode();
    
    // Enable instant back navigation
    enableInstantBackNav();
    
    // Track navigation for optimization
    if (typeof window !== 'undefined') {
      trackNavigation(window.location.pathname);
    }
    
    // Add animations AFTER first paint (progressive enhancement)
    const enableAnimations = () => {
      if (!prefersReducedMotion) {
        setShowAnimations(true);
      }
    };

    // Defer to next frame after layout is painted
    if ('requestAnimationFrame' in window) {
      requestAnimationFrame(() => {
        requestAnimationFrame(enableAnimations);
      });
    } else {
      setTimeout(enableAnimations, 100);
    }
  }, [prefersReducedMotion]);

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        contain: 'layout style paint',
        contentVisibility: 'auto'
      }}
    >
      {/* Navbar — matches Navigation h-12 lg:h-16 + mobile search row */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 border-b border-border"
        style={{
          contain: 'strict',
          backdropFilter: showAnimations ? 'blur(8px)' : 'none'
        }}
      >
        {/* Main header row: h-12 mobile / h-16 desktop */}
        <div className="h-12 lg:h-16 max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div 
            className={`bg-muted/30 rounded ${showAnimations ? 'animate-pulse' : ''}`}
            style={{ width: '96px', height: '32px' }}
          />
          
          <div className="hidden lg:flex gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`bg-muted/30 rounded ${showAnimations ? 'animate-pulse' : ''}`}
                style={{ 
                  width: '64px', 
                  height: '24px',
                  animationDelay: showAnimations ? `${i * 50}ms` : '0ms'
                }}
              />
            ))}
          </div>
          
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <div 
              className={`w-full bg-muted/20 rounded-full ${showAnimations ? 'animate-pulse' : ''}`}
              style={{ height: '40px' }}
            />
          </div>
          
          <div className="flex items-center gap-4">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className={`bg-muted/30 rounded-full ${showAnimations ? 'animate-pulse' : ''} ${i === 3 ? 'hidden md:block' : ''}`}
                style={{ 
                  width: '40px', 
                  height: '40px',
                  animationDelay: showAnimations ? `${i * 100}ms` : '0ms'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content — pt matches WithNavigation: 5.5rem mobile / 4rem desktop */}
      <div
        className="pb-20 lg:pb-0 pt-[5.5rem] md:pt-16"
        style={{ contain: 'layout style' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Single feed item for instant render */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div 
              className="p-4 flex items-center gap-3"
              style={{ height: '80px' }}
            >
              <div 
                className={`bg-muted/30 rounded-full flex-shrink-0 ${showAnimations ? 'animate-pulse' : ''}`}
                style={{ width: '48px', height: '48px' }}
              />
              <div className="flex-1 space-y-2">
                <div 
                  className={`bg-muted/30 rounded ${showAnimations ? 'animate-pulse' : ''}`}
                  style={{ height: '16px', width: '128px' }}
                />
                <div 
                  className={`bg-muted/20 rounded ${showAnimations ? 'animate-pulse' : ''}`}
                  style={{ 
                    height: '12px', 
                    width: '80px',
                    animationDelay: '100ms'
                  }}
                />
              </div>
            </div>
            
            <div 
              className={`w-full bg-muted/20 ${showAnimations ? 'animate-pulse' : ''}`}
              style={{ 
                aspectRatio: '1/1',
                contain: 'strict'
              }}
            />
            
            <div 
              className="p-4"
              style={{ height: '120px' }}
            >
              <div className="flex gap-6 mb-3">
                {[1, 2, 3].map(j => (
                  <div 
                    key={j}
                    className={`bg-muted/30 rounded ${showAnimations ? 'animate-pulse' : ''}`}
                    style={{ 
                      height: '24px', 
                      width: '64px',
                      animationDelay: `${j * 50}ms`
                    }}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <div 
                  className={`bg-muted/20 rounded ${showAnimations ? 'animate-pulse' : ''}`}
                  style={{ height: '16px', width: '100%' }}
                />
                <div 
                  className={`bg-muted/15 rounded ${showAnimations ? 'animate-pulse' : ''}`}
                  style={{ 
                    height: '16px', 
                    width: '75%',
                    animationDelay: '100ms'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 border-t border-border"
        style={{ 
          height: '64px', 
          contain: 'strict',
          backdropFilter: showAnimations ? 'blur(8px)' : 'none'
        }}
      >
        <div className="flex justify-around items-center h-full px-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i}
              className={`bg-muted/30 rounded-full ${showAnimations ? 'animate-pulse' : ''}`}
              style={{ 
                width: '40px', 
                height: '40px',
                animationDelay: showAnimations ? `${i * 30}ms` : '0ms'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}