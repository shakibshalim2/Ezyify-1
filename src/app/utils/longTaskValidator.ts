/**
 * Long Task Validator
 * MINIMAL VERSION - Reports only, no heavy operations
 */

interface LongTaskReport {
  timestamp: number;
  duration: number;
  startTime: number;
  attribution?: string;
}

interface ValidationResult {
  passed: boolean;
  totalTasks: number;
  longTasks: LongTaskReport[];
  maxDuration: number;
  averageDuration: number;
  recommendations: string[];
}

class LongTaskValidator {
  private longTasks: LongTaskReport[] = [];
  private observer: PerformanceObserver | null = null;
  private lastAlertTime: number = 0;
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize long task monitoring - LIGHTWEIGHT
   */
  private initialize(): void {
    if (typeof PerformanceObserver === 'undefined') {
      return;
    }
    
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          const task: LongTaskReport = {
            timestamp: Date.now(),
            duration: entry.duration,
            startTime: entry.startTime,
            attribution: entry.attribution?.[0]?.name || 'unknown',
          };
          
          // Only store critical tasks (>100ms) to reduce memory
          if (entry.duration > 100) {
            this.longTasks.push(task);
            
            // Throttle alerts - only every 5 seconds
            const now = Date.now();
            if (now - this.lastAlertTime > 5000) {
              console.warn(`[RUM] Long task detected: ${entry.duration.toFixed(0)}ms`);
              this.lastAlertTime = now;
            }
          }
          
          // Keep only last 20 tasks
          if (this.longTasks.length > 20) {
            this.longTasks = this.longTasks.slice(-20);
          }
        });
      });
      
      this.observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      // Silently fail
    }
  }
  
  /**
   * Run validation - SIMPLIFIED
   */
  public runValidation(): ValidationResult {
    const longTaskCount = this.longTasks.length;
    const maxDuration = this.longTasks.length > 0
      ? Math.max(...this.longTasks.map(t => t.duration))
      : 0;
    const averageDuration = this.longTasks.length > 0
      ? this.longTasks.reduce((sum, t) => sum + t.duration, 0) / this.longTasks.length
      : 0;
    
    return {
      passed: longTaskCount === 0,
      totalTasks: this.longTasks.length,
      longTasks: this.longTasks,
      maxDuration,
      averageDuration,
      recommendations: [],
    };
  }
  
  public getStats() {
    return {
      totalTasks: this.longTasks.length,
      longTasks: this.longTasks.length,
      maxDuration: this.longTasks.length > 0
        ? Math.max(...this.longTasks.map(t => t.duration))
        : 0,
      tasks: this.longTasks,
    };
  }
  
  public reset(): void {
    this.longTasks = [];
  }
  
  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Singleton instance
let validatorInstance: LongTaskValidator | null = null;

export function initLongTaskValidator(): LongTaskValidator {
  if (!validatorInstance) {
    validatorInstance = new LongTaskValidator();
  }
  return validatorInstance;
}

export function getLongTaskValidator(): LongTaskValidator | null {
  return validatorInstance;
}

export function validateLongTasks(): ValidationResult | null {
  if (validatorInstance) {
    return validatorInstance.runValidation();
  }
  return null;
}

export function getLongTaskStats() {
  if (validatorInstance) {
    return validatorInstance.getStats();
  }
  return null;
}

// DELAYED initialization - only after 5 seconds to avoid initial load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initLongTaskValidator();
  }, 5000);
  
  (window as any).validateLongTasks = validateLongTasks;
  (window as any).getLongTaskStats = getLongTaskStats;
}

export default LongTaskValidator;
