/**
 * ADAPTIVE LOADING SYSTEM
 * Detects device capability, network quality, and user preferences
 * Automatically adjusts loading strategy for optimal performance
 * 
 * Target: Work seamlessly on low-end devices with slow networks
 */

export interface DeviceCapability {
  cpu: 'high' | 'medium' | 'low';
  memory: 'high' | 'medium' | 'low';
  gpu: 'high' | 'medium' | 'low';
  isLowEnd: boolean;
  score: number; // 0-100
}

export interface NetworkQuality {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
  isSlow: boolean;
  score: number; // 0-100
}

export interface AdaptiveSettings {
  enableAnimations: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  enableCustomFonts: boolean;
  enableLargeImages: boolean;
  enableVideoAutoplay: boolean;
  maxImageQuality: 'high' | 'medium' | 'low';
  skeletonCount: number;
  deferNonCritical: boolean;
}

/**
 * Detect Device Capability
 * Uses hardware concurrency, memory, and performance API
 */
export function detectDeviceCapability(): DeviceCapability {
  let score = 50; // Default medium
  let cpu: DeviceCapability['cpu'] = 'medium';
  let memory: DeviceCapability['memory'] = 'medium';
  let gpu: DeviceCapability['gpu'] = 'medium';

  // CPU Detection (hardware concurrency)
  if ('hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency;
    if (cores >= 8) {
      cpu = 'high';
      score += 20;
    } else if (cores >= 4) {
      cpu = 'medium';
      score += 10;
    } else {
      cpu = 'low';
      score -= 10;
    }
  }

  // Memory Detection (Chrome only)
  if ('deviceMemory' in navigator) {
    const memoryGB = (navigator as any).deviceMemory;
    if (memoryGB >= 8) {
      memory = 'high';
      score += 20;
    } else if (memoryGB >= 4) {
      memory = 'medium';
      score += 10;
    } else {
      memory = 'low';
      score -= 10;
    }
  }

  // GPU Detection (via WebGL)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // Simple heuristic: integrated GPUs are usually lower end
        if (renderer.includes('Intel')) {
          gpu = 'medium';
        } else if (renderer.includes('Mali') || renderer.includes('Adreno')) {
          gpu = 'low';
          score -= 10;
        } else {
          gpu = 'high';
          score += 10;
        }
      }
    }
  } catch (e) {
    // WebGL not available
    gpu = 'low';
    score -= 10;
  }

  // Performance timing heuristic
  if ('performance' in window && 'memory' in performance) {
    const mem = (performance as any).memory;
    const usageRatio = mem.usedJSHeapSize / mem.jsHeapSizeLimit;
    if (usageRatio > 0.9) {
      score -= 15; // High memory pressure
    }
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));
  const isLowEnd = score < 40;

  return { cpu, memory, gpu, isLowEnd, score };
}

/**
 * Detect Network Quality
 * Uses Network Information API and connection type
 */
export function detectNetworkQuality(): NetworkQuality {
  let score = 50; // Default medium
  let effectiveType: NetworkQuality['effectiveType'] = 'unknown';
  let downlink = 10; // Default 10 Mbps
  let rtt = 50; // Default 50ms
  let saveData = false;

  // Network Information API
  if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      // Effective type
      if (connection.effectiveType) {
        effectiveType = connection.effectiveType;
        
        switch (effectiveType) {
          case '4g':
            score = 100;
            break;
          case '3g':
            score = 60;
            break;
          case '2g':
            score = 30;
            break;
          case 'slow-2g':
            score = 10;
            break;
        }
      }

      // Downlink (Mbps)
      if (connection.downlink !== undefined) {
        downlink = connection.downlink;
        if (downlink >= 10) score = Math.max(score, 90);
        else if (downlink >= 5) score = Math.max(score, 70);
        else if (downlink >= 1) score = Math.max(score, 50);
        else score = Math.min(score, 30);
      }

      // RTT (Round Trip Time in ms)
      if (connection.rtt !== undefined) {
        rtt = connection.rtt;
        if (rtt <= 50) score = Math.max(score, 90);
        else if (rtt <= 150) score = Math.max(score, 70);
        else if (rtt <= 300) score = Math.max(score, 50);
        else score = Math.min(score, 30);
      }

      // Save Data mode
      if (connection.saveData !== undefined) {
        saveData = connection.saveData;
        if (saveData) score = Math.min(score, 40);
      }
    }
  }

  // Normalize score
  score = Math.max(0, Math.min(100, score));
  const isSlow = score < 50 || saveData;

  return { effectiveType, downlink, rtt, saveData, isSlow, score };
}

/**
 * Generate Adaptive Settings
 * Based on device capability and network quality
 */
export function getAdaptiveSettings(
  device: DeviceCapability,
  network: NetworkQuality
): AdaptiveSettings {
  // Calculate overall performance score (weighted average)
  const overallScore = (device.score * 0.6) + (network.score * 0.4);

  // Base settings for high-end devices with good network
  let settings: AdaptiveSettings = {
    enableAnimations: true,
    enableBlur: true,
    enableShadows: true,
    enableCustomFonts: true,
    enableLargeImages: true,
    enableVideoAutoplay: true,
    maxImageQuality: 'high',
    skeletonCount: 2,
    deferNonCritical: false,
  };

  // Adjust based on device capability
  if (device.isLowEnd || device.score < 40) {
    settings.enableAnimations = false;
    settings.enableBlur = false;
    settings.enableShadows = false;
    settings.maxImageQuality = 'low';
    settings.skeletonCount = 1;
    settings.deferNonCritical = true;
  } else if (device.score < 60) {
    settings.enableBlur = false;
    settings.maxImageQuality = 'medium';
    settings.skeletonCount = 1;
  }

  // Adjust based on network quality
  if (network.isSlow || network.saveData) {
    settings.enableCustomFonts = false;
    settings.enableLargeImages = false;
    settings.enableVideoAutoplay = false;
    settings.maxImageQuality = 'low';
    settings.deferNonCritical = true;
  } else if (network.score < 60) {
    settings.maxImageQuality = 'medium';
  }

  // Override for extreme cases
  if (overallScore < 30) {
    // Ultra-low mode: bare minimum
    return {
      enableAnimations: false,
      enableBlur: false,
      enableShadows: false,
      enableCustomFonts: false,
      enableLargeImages: false,
      enableVideoAutoplay: false,
      maxImageQuality: 'low',
      skeletonCount: 1,
      deferNonCritical: true,
    };
  }

  return settings;
}

/**
 * Adaptive Loading Manager
 * Singleton class to manage adaptive settings across the app
 */
class AdaptiveLoadingManager {
  private static instance: AdaptiveLoadingManager;
  private device: DeviceCapability;
  private network: NetworkQuality;
  private settings: AdaptiveSettings;
  private listeners: Array<(settings: AdaptiveSettings) => void> = [];

  private constructor() {
    this.device = detectDeviceCapability();
    this.network = detectNetworkQuality();
    this.settings = getAdaptiveSettings(this.device, this.network);

    // Monitor network changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', () => {
          this.updateNetwork();
        });
      }
    }
  }

  static getInstance(): AdaptiveLoadingManager {
    if (!AdaptiveLoadingManager.instance) {
      AdaptiveLoadingManager.instance = new AdaptiveLoadingManager();
    }
    return AdaptiveLoadingManager.instance;
  }

  getDevice(): DeviceCapability {
    return this.device;
  }

  getNetwork(): NetworkQuality {
    return this.network;
  }

  getSettings(): AdaptiveSettings {
    return this.settings;
  }

  updateNetwork(): void {
    this.network = detectNetworkQuality();
    this.settings = getAdaptiveSettings(this.device, this.network);
    this.notifyListeners();
  }

  subscribe(listener: (settings: AdaptiveSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  /**
   * Get recommended timeout for resource loading
   */
  getResourceTimeout(): number {
    if (this.network.isSlow) return 2000; // 2s for slow networks
    if (this.network.score < 60) return 3000; // 3s for medium
    return 5000; // 5s for fast networks
  }

  /**
   * Should skip resource based on adaptive settings
   */
  shouldSkipResource(type: 'font' | 'image' | 'video' | 'animation'): boolean {
    switch (type) {
      case 'font':
        return !this.settings.enableCustomFonts;
      case 'image':
        return !this.settings.enableLargeImages;
      case 'video':
        return !this.settings.enableVideoAutoplay;
      case 'animation':
        return !this.settings.enableAnimations;
      default:
        return false;
    }
  }
}

// Export singleton instance
export const adaptiveLoader = typeof window !== 'undefined' 
  ? AdaptiveLoadingManager.getInstance() 
  : null;

/**
 * React Hook for Adaptive Loading
 */
export function useAdaptiveLoading() {
  const [settings, setSettings] = React.useState<AdaptiveSettings | null>(null);

  React.useEffect(() => {
    if (!adaptiveLoader) return;

    setSettings(adaptiveLoader.getSettings());

    const unsubscribe = adaptiveLoader.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  return {
    settings,
    device: adaptiveLoader?.getDevice() || null,
    network: adaptiveLoader?.getNetwork() || null,
    shouldSkipResource: (type: 'font' | 'image' | 'video' | 'animation') => 
      adaptiveLoader?.shouldSkipResource(type) || false,
  };
}

// React import for hook
import React from 'react';
