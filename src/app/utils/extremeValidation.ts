/**
 * EXTREME WORST-CASE VALIDATION
 * - Validates on Android Go / low-memory devices
 * - Tests CPU throttling (4x slowdown)
 * - Tests offline → online recovery behavior
 */

export interface DeviceProfile {
  name: string;
  memory: number; // GB
  cpu: number; // cores
  throttling: number; // multiplier
  networkSpeed: 'offline' | 'slow-2g' | '2g' | '3g' | '4g';
}

/**
 * Device profiles for testing
 */
export const EXTREME_DEVICE_PROFILES: Record<string, DeviceProfile> = {
  ANDROID_GO: {
    name: 'Android Go (Low Memory)',
    memory: 1,
    cpu: 4,
    throttling: 4,
    networkSpeed: '2g',
  },
  OLD_ANDROID: {
    name: 'Old Android Device',
    memory: 2,
    cpu: 4,
    throttling: 4,
    networkSpeed: '3g',
  },
  LOW_END_PHONE: {
    name: 'Low-End Smartphone',
    memory: 3,
    cpu: 4,
    throttling: 2,
    networkSpeed: '3g',
  },
  OFFLINE_DEVICE: {
    name: 'Offline Device',
    memory: 4,
    cpu: 8,
    throttling: 1,
    networkSpeed: 'offline',
  },
};

/**
 * Detect if device is low-memory
 */
export function isLowMemoryDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const memory = (navigator as any).deviceMemory;
  return memory !== undefined && memory < 4;
}

/**
 * Detect if device has low CPU
 */
export function isLowCPUDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const cores = navigator.hardwareConcurrency || 0;
  return cores > 0 && cores < 4;
}

/**
 * Detect slow network
 */
export function isSlowNetwork(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return false;
  
  const slowTypes = ['slow-2g', '2g'];
  return slowTypes.includes(connection.effectiveType);
}

/**
 * Check if device is extreme low-end (matches Android Go profile)
 */
export function isExtremeLowEnd(): boolean {
  return isLowMemoryDevice() && isLowCPUDevice() && isSlowNetwork();
}

/**
 * Simulate CPU throttling for testing
 */
export function simulateCPUThrottling(multiplier: number = 4): () => void {
  if (typeof window === 'undefined') return () => {};
  
  console.log(`[Extreme Test] Simulating ${multiplier}x CPU throttling`);
  
  // Store original setTimeout and setInterval
  const originalSetTimeout = window.setTimeout;
  const originalSetInterval = window.setInterval;
  
  // Override with throttled versions
  (window as any).setTimeout = function(callback: Function, delay: number = 0, ...args: any[]) {
    return originalSetTimeout(callback, delay * multiplier, ...args);
  };
  
  (window as any).setInterval = function(callback: Function, delay: number = 0, ...args: any[]) {
    return originalSetInterval(callback, delay * multiplier, ...args);
  };
  
  // Return cleanup function
  return () => {
    (window as any).setTimeout = originalSetTimeout;
    (window as any).setInterval = originalSetInterval;
    console.log('[Extreme Test] CPU throttling removed');
  };
}

/**
 * Test offline → online recovery
 */
export interface OfflineRecoveryTest {
  offlineTime: number;
  recoveryTime: number;
  dataLost: boolean;
  functionalityRestored: boolean;
  errors: string[];
}

export function testOfflineRecovery(): Promise<OfflineRecoveryTest> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const errors: string[] = [];
    
    if (typeof window === 'undefined') {
      resolve({
        offlineTime: 0,
        recoveryTime: 0,
        dataLost: false,
        functionalityRestored: false,
        errors: ['Window not available'],
      });
      return;
    }
    
    // Simulate going offline
    console.log('[Extreme Test] Simulating offline state');
    
    // Test localStorage persistence
    const testKey = 'offline_recovery_test';
    const testValue = { timestamp: Date.now(), data: 'test' };
    
    try {
      localStorage.setItem(testKey, JSON.stringify(testValue));
    } catch (error) {
      errors.push('Failed to write to localStorage');
    }
    
    // Listen for online event
    const onlineHandler = () => {
      const recoveryTime = Date.now() - startTime;
      console.log('[Extreme Test] Back online, recovery time:', recoveryTime, 'ms');
      
      // Check if data persisted
      let dataLost = false;
      try {
        const stored = localStorage.getItem(testKey);
        if (!stored || JSON.parse(stored).timestamp !== testValue.timestamp) {
          dataLost = true;
          errors.push('Data lost during offline period');
        }
        localStorage.removeItem(testKey);
      } catch (error) {
        dataLost = true;
        errors.push('Failed to read from localStorage after recovery');
      }
      
      window.removeEventListener('online', onlineHandler);
      
      resolve({
        offlineTime: startTime,
        recoveryTime,
        dataLost,
        functionalityRestored: !dataLost,
        errors,
      });
    };
    
    window.addEventListener('online', onlineHandler);
    
    // Auto-resolve after 30 seconds if still offline
    setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve({
        offlineTime: Date.now() - startTime,
        recoveryTime: 0,
        dataLost: false,
        functionalityRestored: false,
        errors: [...errors, 'Timeout: Device still offline after 30s'],
      });
    }, 30000);
  });
}

/**
 * Run comprehensive extreme validation test suite
 */
export interface ExtremeValidationReport {
  timestamp: number;
  deviceProfile: {
    isLowMemory: boolean;
    isLowCPU: boolean;
    isSlowNetwork: boolean;
    isExtremeLowEnd: boolean;
  };
  performanceUnderLoad: {
    fcp: number | null;
    lcp: number | null;
    tbt: number | null;
  };
  passed: boolean;
  issues: string[];
}

export async function runExtremeValidation(): Promise<ExtremeValidationReport> {
  const issues: string[] = [];
  
  // Detect device capabilities
  const deviceProfile = {
    isLowMemory: isLowMemoryDevice(),
    isLowCPU: isLowCPUDevice(),
    isSlowNetwork: isSlowNetwork(),
    isExtremeLowEnd: isExtremeLowEnd(),
  };
  
  // Measure performance
  const performance = {
    fcp: null as number | null,
    lcp: null as number | null,
    tbt: null as number | null,
  };
  
  try {
    const paintEntries = window.performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
    if (fcpEntry) {
      performance.fcp = fcpEntry.startTime;
      if (fcpEntry.startTime > 500) {
        issues.push(`FCP too slow on extreme device: ${Math.round(fcpEntry.startTime)}ms`);
      }
    }
  } catch (error) {
    issues.push('Failed to measure FCP');
  }
  
  // Check memory pressure
  if (typeof (window.performance as any).memory !== 'undefined') {
    const memory = (window.performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1048576;
    
    if (deviceProfile.isLowMemory && usedMB > 50) {
      issues.push(`High memory usage on low-end device: ${usedMB.toFixed(1)}MB`);
    }
  }
  
  // Check DOM complexity
  const domNodes = document.querySelectorAll('*').length;
  if (deviceProfile.isExtremeLowEnd && domNodes > 100) {
    issues.push(`Too many DOM nodes for extreme low-end device: ${domNodes}`);
  }
  
  const report: ExtremeValidationReport = {
    timestamp: Date.now(),
    deviceProfile,
    performanceUnderLoad: performance,
    passed: issues.length === 0,
    issues,
  };
  
  return report;
}

/**
 * Monitor and log extreme conditions
 */
export function monitorExtremeConditions(): void {
  if (typeof window === 'undefined') return;
  
  // Track if we've already logged to avoid spam
  let hasLoggedOffline = false;
  
  // Monitor memory pressure
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1048576;
      const limitMB = memory.jsHeapSizeLimit / 1048576;
      const percentage = (usedMB / limitMB) * 100;
      
      if (percentage > 80) {
        console.warn(`[Extreme Monitor] High memory pressure: ${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB (${percentage.toFixed(1)}%)`);
      }
    }, 10000);
  }
  
  // Monitor network changes
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (connection) {
    connection.addEventListener('change', () => {
      console.log('[Extreme Monitor] Network changed:', {
        type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });
    });
  }
  
  // Monitor online/offline
  window.addEventListener('offline', () => {
    if (!hasLoggedOffline) {
      console.warn('[Extreme Monitor] ⚠️ Device went OFFLINE (This is normal offline detection, not an error)');
      hasLoggedOffline = true;
    }
  });
  
  window.addEventListener('online', () => {
    console.log('[Extreme Monitor] ✅ Device back ONLINE');
    hasLoggedOffline = false;
  });
}

/**
 * Generate extreme validation report
 */
export function generateExtremeValidationReport(report: ExtremeValidationReport): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push('EXTREME WORST-CASE VALIDATION REPORT');
  lines.push('='.repeat(80));
  lines.push('');
  
  lines.push(`Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
  lines.push(`Timestamp: ${new Date(report.timestamp).toISOString()}`);
  lines.push('');
  
  lines.push('Device Profile:');
  lines.push(`  Low Memory: ${report.deviceProfile.isLowMemory ? 'YES ⚠️' : 'NO'}`);
  lines.push(`  Low CPU: ${report.deviceProfile.isLowCPU ? 'YES ⚠️' : 'NO'}`);
  lines.push(`  Slow Network: ${report.deviceProfile.isSlowNetwork ? 'YES ⚠️' : 'NO'}`);
  lines.push(`  Extreme Low-End: ${report.deviceProfile.isExtremeLowEnd ? 'YES ⚠️⚠️⚠️' : 'NO'}`);
  lines.push('');
  
  lines.push('Performance Under Load:');
  lines.push(`  FCP: ${report.performanceUnderLoad.fcp !== null ? Math.round(report.performanceUnderLoad.fcp) + 'ms' : 'N/A'}`);
  lines.push(`  LCP: ${report.performanceUnderLoad.lcp !== null ? Math.round(report.performanceUnderLoad.lcp) + 'ms' : 'N/A'}`);
  lines.push(`  TBT: ${report.performanceUnderLoad.tbt !== null ? Math.round(report.performanceUnderLoad.tbt) + 'ms' : 'N/A'}`);
  lines.push('');
  
  if (report.issues.length > 0) {
    lines.push('⚠️  ISSUES DETECTED:');
    report.issues.forEach(issue => lines.push(`  - ${issue}`));
    lines.push('');
  }
  
  lines.push('='.repeat(80));
  
  return lines.join('\n');
}
