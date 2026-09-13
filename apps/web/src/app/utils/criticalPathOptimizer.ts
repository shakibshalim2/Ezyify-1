/**
 * CRITICAL RENDERING PATH OPTIMIZER
 * Manages resource loading priorities and execution strategies
 * Ensures critical resources load first, non-critical resources defer
 * 
 * Target: FCP < 300ms, LCP < 600ms, TBT < 50ms
 */

import { adaptiveLoader } from './adaptiveLoading';

/**
 * Resource Priority Levels
 */
export enum ResourcePriority {
  CRITICAL = 'critical',      // Must load immediately (blocks render)
  HIGH = 'high',              // Should load early (but doesn't block)
  MEDIUM = 'medium',          // Can load during idle time
  LOW = 'low',                // Load only when needed
  DEFERRED = 'deferred',      // Load after everything else
}

/**
 * Resource Types
 */
export enum ResourceType {
  SCRIPT = 'script',
  STYLE = 'style',
  FONT = 'font',
  IMAGE = 'image',
  PREFETCH = 'prefetch',
  PRECONNECT = 'preconnect',
}

interface ResourceConfig {
  url: string;
  type: ResourceType;
  priority: ResourcePriority;
  timeout?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  fallback?: () => void;
}

/**
 * Task Scheduler - Splits long tasks to avoid blocking
 */
class TaskScheduler {
  private taskQueue: Array<() => void | Promise<void>> = [];
  private isProcessing = false;

  /**
   * Add task to queue
   */
  addTask(task: () => void | Promise<void>, priority: 'high' | 'low' = 'low'): void {
    if (priority === 'high') {
      this.taskQueue.unshift(task);
    } else {
      this.taskQueue.push(task);
    }
    this.processTasks();
  }

  /**
   * Process tasks using requestIdleCallback or setTimeout
   */
  private processTasks(): void {
    if (this.isProcessing || this.taskQueue.length === 0) return;
    
    this.isProcessing = true;

    const processNextTask = async () => {
      const task = this.taskQueue.shift();
      if (!task) {
        this.isProcessing = false;
        return;
      }

      try {
        await task();
      } catch (error) {
        console.error('Task execution error:', error);
      }

      // Schedule next task
      if (this.taskQueue.length > 0) {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => processNextTask(), { timeout: 1000 });
        } else {
          setTimeout(processNextTask, 0);
        }
      } else {
        this.isProcessing = false;
      }
    };

    // Start processing
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => processNextTask(), { timeout: 500 });
    } else {
      setTimeout(processNextTask, 0);
    }
  }

  /**
   * Execute task with time slicing (avoid long tasks > 50ms)
   */
  async executeWithTimeSlicing<T>(
    items: T[],
    processor: (item: T) => void | Promise<void>,
    chunkSize: number = 5
  ): Promise<void> {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      
      await new Promise<void>((resolve) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(async () => {
            for (const item of chunk) {
              await processor(item);
            }
            resolve();
          }, { timeout: 1000 });
        } else {
          setTimeout(async () => {
            for (const item of chunk) {
              await processor(item);
            }
            resolve();
          }, 0);
        }
      });
    }
  }
}

/**
 * Resource Loader with Priority Management
 */
class ResourceLoader {
  private loadedResources = new Set<string>();
  private pendingResources = new Map<string, Promise<void>>();
  private taskScheduler = new TaskScheduler();

  /**
   * Load resource with priority and timeout
   */
  async loadResource(config: ResourceConfig): Promise<void> {
    const { url, type, priority, timeout, onLoad, onError, fallback } = config;

    // Check if already loaded
    if (this.loadedResources.has(url)) {
      onLoad?.();
      return;
    }

    // Check if already pending
    if (this.pendingResources.has(url)) {
      return this.pendingResources.get(url);
    }

    // Check adaptive settings
    if (adaptiveLoader) {
      const shouldSkip = this.shouldSkipResource(type);
      if (shouldSkip) {
        console.log(`Skipping ${type} resource due to adaptive settings:`, url);
        fallback?.();
        return;
      }
    }

    // Create loading promise
    const loadingPromise = this.createLoadingPromise(config);
    this.pendingResources.set(url, loadingPromise);

    try {
      if (timeout) {
        await Promise.race([
          loadingPromise,
          this.createTimeoutPromise(timeout, url, fallback),
        ]);
      } else {
        await loadingPromise;
      }
      
      this.loadedResources.add(url);
      onLoad?.();
    } catch (error) {
      console.error(`Failed to load ${type}:`, url, error);
      onError?.(error as Error);
      fallback?.();
    } finally {
      this.pendingResources.delete(url);
    }
  }

  /**
   * Create loading promise based on resource type
   */
  private createLoadingPromise(config: ResourceConfig): Promise<void> {
    const { url, type } = config;

    switch (type) {
      case ResourceType.SCRIPT:
        return this.loadScript(url);
      
      case ResourceType.STYLE:
        return this.loadStyle(url);
      
      case ResourceType.FONT:
        return this.loadFont(url);
      
      case ResourceType.IMAGE:
        return this.loadImage(url);
      
      case ResourceType.PRECONNECT:
        return this.addPreconnect(url);
      
      case ResourceType.PREFETCH:
        return this.addPrefetch(url);
      
      default:
        return Promise.resolve();
    }
  }

  /**
   * Load JavaScript file
   */
  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Load CSS file
   */
  private loadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load style: ${url}`));
      document.head.appendChild(link);
    });
  }

  /**
   * Load Font
   */
  private async loadFont(url: string): Promise<void> {
    if ('fonts' in document) {
      try {
        const fontFace = new FontFace('CustomFont', `url(${url})`);
        await fontFace.load();
        (document as any).fonts.add(fontFace);
      } catch (error) {
        throw new Error(`Failed to load font: ${url}`);
      }
    } else {
      // Fallback: load as style
      return this.loadStyle(url);
    }
  }

  /**
   * Preload Image
   */
  private loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Add preconnect hint
   */
  private addPreconnect(url: string): Promise<void> {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    return Promise.resolve();
  }

  /**
   * Add prefetch hint
   */
  private addPrefetch(url: string): Promise<void> {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    return Promise.resolve();
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number, url: string, fallback?: () => void): Promise<void> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        console.warn(`Resource loading timeout: ${url}`);
        fallback?.();
        reject(new Error(`Timeout loading resource: ${url}`));
      }, timeout);
    });
  }

  /**
   * Check if resource should be skipped based on adaptive settings
   */
  private shouldSkipResource(type: ResourceType): boolean {
    if (!adaptiveLoader) return false;

    switch (type) {
      case ResourceType.FONT:
        return adaptiveLoader.shouldSkipResource('font');
      
      case ResourceType.IMAGE:
        return adaptiveLoader.shouldSkipResource('image');
      
      default:
        return false;
    }
  }

  /**
   * Get task scheduler
   */
  getTaskScheduler(): TaskScheduler {
    return this.taskScheduler;
  }
}

/**
 * Critical Path Manager
 */
class CriticalPathManager {
  private resourceLoader = new ResourceLoader();
  private initialized = false;

  /**
   * Initialize critical path optimization
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    // Step 1: Add preconnect hints for external domains
    await this.addPreconnectHints();

    // Step 2: Load critical resources
    await this.loadCriticalResources();

    // Step 3: Defer non-critical resources
    this.deferNonCriticalResources();

    // Step 4: Setup performance monitoring
    this.setupPerformanceMonitoring();
  }

  /**
   * Add preconnect hints for faster DNS resolution
   */
  private async addPreconnectHints(): Promise<void> {
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    for (const domain of domains) {
      await this.resourceLoader.loadResource({
        url: domain,
        type: ResourceType.PRECONNECT,
        priority: ResourcePriority.CRITICAL,
      });
    }
  }

  /**
   * Load critical resources (blocking)
   */
  private async loadCriticalResources(): Promise<void> {
    // Critical CSS is already inline in HTML
    // No critical external resources needed for instant preview
    console.log('Critical resources loaded');
  }

  /**
   * Defer non-critical resources to idle time
   */
  private deferNonCriticalResources(): void {
    const scheduler = this.resourceLoader.getTaskScheduler();

    // Defer font loading
    scheduler.addTask(async () => {
      if (!adaptiveLoader?.shouldSkipResource('font')) {
        await this.resourceLoader.loadResource({
          url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          type: ResourceType.STYLE,
          priority: ResourcePriority.LOW,
          timeout: adaptiveLoader?.getResourceTimeout() || 5000,
          fallback: () => {
            console.log('Font loading failed, using system fonts');
          },
        });
      }
    }, 'low');

    // Defer analytics
    scheduler.addTask(() => {
      console.log('Analytics initialized (deferred)');
    }, 'low');

    // Defer service worker registration
    scheduler.addTask(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {
          console.log('Service worker registration failed');
        });
      }
    }, 'low');
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      try {
        // Monitor long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observer not supported
      }
    }
  }

  /**
   * Get resource loader
   */
  getResourceLoader(): ResourceLoader {
    return this.resourceLoader;
  }
}

// Export singleton
export const criticalPathManager = typeof window !== 'undefined' 
  ? new CriticalPathManager() 
  : null;

/**
 * Initialize critical path optimization
 */
export async function initializeCriticalPath(): Promise<void> {
  if (!criticalPathManager) return;
  await criticalPathManager.initialize();
}

/**
 * Execute function during idle time
 */
export function executeWhenIdle(
  callback: () => void | Promise<void>,
  options: { timeout?: number } = {}
): void {
  const { timeout = 2000 } = options;

  if ('requestIdleCallback' in window) {
    requestIdleCallback(async () => {
      await callback();
    }, { timeout });
  } else {
    setTimeout(async () => {
      await callback();
    }, 100);
  }
}

/**
 * Split task execution to avoid blocking
 */
export async function executeTasksInChunks<T>(
  items: T[],
  processor: (item: T) => void | Promise<void>,
  chunkSize: number = 5
): Promise<void> {
  if (!criticalPathManager) {
    // Fallback: execute all at once
    for (const item of items) {
      await processor(item);
    }
    return;
  }

  const scheduler = criticalPathManager.getResourceLoader().getTaskScheduler();
  await scheduler.executeWithTimeSlicing(items, processor, chunkSize);
}
